import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";

import SftpClient from "ssh2-sftp-client";
import { Client as SshClient } from "ssh2";

import { getSshAuthOptions, toRemoteAbsolutePath } from "./config.mjs";

const MAX_CONNECT_ATTEMPTS = 4;
const CONNECT_RETRY_DELAY_MS = 5000;
const TRANSIENT_CONNECT_PATTERNS = [
  /connection lost before handshake/i,
  /timed out while waiting for handshake/i,
  /handshake timeout/i,
  /connection reset/i,
  /econnreset/i,
  /socket closed/i,
];

export function runLocalCommand(command) {
  execSync(command, {
    stdio: "inherit",
    env: process.env,
  });
}

export async function resetDirectory(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true });
  await fs.mkdir(targetPath, { recursive: true });
}

export async function copyDirectory(sourcePath, targetPath) {
  if (process.platform === "win32") {
    const source = sourcePath.replace(/\//g, "\\");
    const target = targetPath.replace(/\//g, "\\");
    const command = [
      "$src = Resolve-Path",
      `'${source}';`,
      "$dst =",
      `'${target}';`,
      "New-Item -ItemType Directory -Force -Path $dst | Out-Null;",
      "Copy-Item -Path (Join-Path $src '*') -Destination $dst -Recurse -Force;",
    ].join(" ");

    execSync(`powershell -NoProfile -Command "${command}"`, {
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  await fs.cp(sourcePath, targetPath, { recursive: true, dereference: true });
}

export function posixJoin(...segments) {
  return path.posix.join(...segments);
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isTransientConnectError(error) {
  if (error?.commandStarted) {
    return false;
  }

  const detail = [error?.message, error?.code, error?.level]
    .filter(Boolean)
    .join(" ");

  return TRANSIENT_CONNECT_PATTERNS.some((pattern) => pattern.test(detail));
}

async function withConnectRetry(label, task) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_CONNECT_ATTEMPTS; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;

      if (attempt === MAX_CONNECT_ATTEMPTS || !isTransientConnectError(error)) {
        throw error;
      }

      const delayMs = CONNECT_RETRY_DELAY_MS * attempt;
      console.warn(
        `${label} failed during handshake; retrying in ${Math.round(
          delayMs / 1000,
        )}s (${attempt + 1}/${MAX_CONNECT_ATTEMPTS})`,
      );
      await wait(delayMs);
    }
  }

  throw lastError;
}

export async function withSftp(config, task) {
  const client = new SftpClient();

  await withConnectRetry("SFTP connection", () =>
    client.connect({
      host: config.sshHost,
      port: config.sshPort,
      username: config.sshUser,
      ...getSshAuthOptions(config),
    }),
  );

  try {
    return await task(client);
  } finally {
    await client.end();
  }
}

async function runRemoteCommandOnce(config, command) {
  return new Promise((resolve, reject) => {
    const client = new SshClient();
    let commandStarted = false;

    client
      .on("ready", () => {
        client.exec(command, (error, stream) => {
          if (error) {
            client.end();
            reject(error);
            return;
          }

          let stdout = "";
          let stderr = "";
          commandStarted = true;

          stream
            .on("close", (code) => {
              client.end();

              if (code !== 0) {
                reject(
                  new Error(
                    `Remote command failed with code ${code}\n${stderr || stdout}`,
                  ),
                );
                return;
              }

              resolve({ stdout, stderr });
            })
            .on("data", (data) => {
              stdout += data.toString();
            });

          stream.stderr.on("data", (data) => {
            stderr += data.toString();
          });
        });
      })
      .on("error", (error) => {
        error.commandStarted = commandStarted;
        reject(error);
      })
      .connect({
        host: config.sshHost,
        port: config.sshPort,
        username: config.sshUser,
        ...getSshAuthOptions(config),
      });
  });
}

export async function runRemoteCommand(config, command) {
  return withConnectRetry("SSH command connection", () =>
    runRemoteCommandOnce(config, command),
  );
}

export async function getPassengerApplications(
  config,
  { fetchImpl = fetch } = {},
) {
  if (!config.cpanelHost && !config.cpanelToken) {
    return [];
  }
  if (!config.cpanelHost || !config.cpanelToken || !config.sshUser) {
    console.warn(
      "cPanel API discovery is only partially configured; using SSH-based CloudLinux lookup.",
    );
    return [];
  }

  try {
    const response = await fetchImpl(
      `${config.cpanelHost}/execute/PassengerApps/list_applications`,
      {
        headers: {
          Authorization: `cpanel ${config.sshUser}:${config.cpanelToken}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!response.ok) {
      throw new Error(`cPanel API request failed with ${response.status}`);
    }

    const payload = await response.json();
    return Array.isArray(payload.data) ? payload.data : [];
  } catch (error) {
    console.warn(
      `cPanel API application listing unavailable (${error.message}); falling back to SSH-based lookup.`,
    );
    return [];
  }
}

function shellEscape(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function normalizeAppUri(uri) {
  if (!uri || uri === "") {
    return "/";
  }

  return uri.startsWith("/") ? uri : `/${uri}`;
}

function normalizeApplication(raw, config, source) {
  const appRootRaw =
    raw.app_root ?? raw.path ?? raw.approot ?? raw.appRoot ?? "";

  return {
    source,
    domain: raw.domain ?? raw.domain_name ?? config.domain,
    uri: normalizeAppUri(raw.base_uri ?? raw.uri ?? raw.app_uri),
    state: raw.enabled ?? raw.status ?? raw.app_status ?? "unknown",
    version: raw.version,
    appRoot: appRootRaw ? toRemoteAbsolutePath(config, appRootRaw) : undefined,
    appRootRaw,
  };
}

export async function getNodeSelectorApplications(config) {
  const { stdout } = await runRemoteCommand(
    config,
    `cloudlinux-selector get --json --interpreter nodejs --user ${shellEscape(
      config.sshUser,
    )}`,
  );

  const payload = JSON.parse(stdout.trim());
  const applications = [];

  for (const [version, versionData] of Object.entries(
    payload.available_versions ?? {},
  )) {
    const userApplications =
      versionData?.users?.[config.sshUser]?.applications ?? {};

    for (const [appRoot, appData] of Object.entries(userApplications)) {
      applications.push(
        normalizeApplication(
          {
            app_root: appRoot,
            domain: appData.domain,
            app_uri: appData.app_uri,
            app_status: appData.app_status,
            version,
          },
          config,
          "cloudlinux",
        ),
      );
    }
  }

  return applications;
}

export async function getApplications(
  config,
  {
    fetchImpl = fetch,
    nodeSelectorLookup = getNodeSelectorApplications,
  } = {},
) {
  const passengerApplications = await getPassengerApplications(config, {
    fetchImpl,
  });

  if (passengerApplications.length > 0) {
    return passengerApplications.map((app) =>
      normalizeApplication(app, config, "cpanel"),
    );
  }

  return nodeSelectorLookup(config);
}
