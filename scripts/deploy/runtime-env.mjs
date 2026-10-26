import { pathToFileURL } from "node:url";

import {
  logStep,
  requireConfig,
  requireSshAuth,
  toRemoteAbsolutePath,
} from "./config.mjs";
import { posixJoin, runRemoteCommand, withSftp } from "./helpers.mjs";

export const RUNTIME_ENV_MODE = "0600";

export const runtimeEnvKeys = Object.freeze([
  "CONTACT_FORM_ENDPOINT",
  "FORM_FORWARD_AUTH_TOKEN",
  "NEXT_PUBLIC_CLARITY_ID",
  "NEXT_PUBLIC_GA_ID",
  "NEXT_PUBLIC_GTM_ID",
  // Optional: instrumentation.ts only initialises Sentry when this is present,
  // so an environment without the secret keeps deploying and stays dark.
  "SENTRY_DSN",
  "WAITLIST_FORM_ENDPOINT",
]);

function shellEscape(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function serializeEnvValue(value) {
  return JSON.stringify(value)
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function buildRuntimeEnv(environment = process.env) {
  const values = Object.fromEntries(
    runtimeEnvKeys
      .filter((key) => environment[key])
      .map((key) => [key, environment[key]]),
  );

  const missing = ["CONTACT_FORM_ENDPOINT", "WAITLIST_FORM_ENDPOINT"].filter(
    (key) => !values[key],
  );
  if (missing.length > 0) {
    throw new Error(`Missing required form runtime values: ${missing.join(", ")}`);
  }

  for (const key of ["CONTACT_FORM_ENDPOINT", "WAITLIST_FORM_ENDPOINT"]) {
    const url = new URL(values[key]);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error(`${key} must use HTTP(S).`);
    }
  }

  const content = `${Object.entries(values)
    .map(([key, value]) => `${key}=${serializeEnvValue(value)}`)
    .join("\n")}\n`;

  return { content, keys: Object.keys(values).sort() };
}

export function parseKeyNames(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => line.slice(0, line.indexOf("=")))
    .sort();
}

async function inspectRuntimeEnv(config, envPath) {
  let keys = [];
  let exists = false;

  await withSftp(config, async (client) => {
    if (!(await client.exists(envPath))) return;
    exists = true;
    const value = await client.get(envPath);
    const content = Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
    keys = parseKeyNames(content);
  });

  let mode = "missing";
  if (exists) {
    const { stdout } = await runRemoteCommand(
      config,
      `stat -c '%a' ${shellEscape(envPath)}`,
    );
    mode = stdout.trim();
  }

  return { exists, keys, mode };
}

async function restartApplication(config, activeRelease) {
  const user = shellEscape(config.sshUser);
  const appRoot = shellEscape(activeRelease);

  await runRemoteCommand(
    config,
    [
      "cloudlinux-selector stop --json --interpreter nodejs",
      `--user ${user}`,
      `--app-root ${appRoot}`,
      "|| true",
      "&& sleep 2",
      "&& cloudlinux-selector start --json --interpreter nodejs",
      `--user ${user}`,
      `--app-root ${appRoot}`,
      "&& sleep 3",
    ].join(" "),
  );
}

async function main() {
  const apply = process.argv.includes("--apply");
  const config = requireSshAuth(
    requireConfig([
      "sshHost",
      "sshUser",
      "remoteHome",
      "remoteAppRoot",
    ]),
  );
  const remoteAppRoot = toRemoteAbsolutePath(config, config.remoteAppRoot);
  const { stdout } = await runRemoteCommand(
    config,
    `readlink -f ${shellEscape(remoteAppRoot)}`,
  );
  const activeRelease = stdout.trim();
  if (!activeRelease) {
    throw new Error(`Could not resolve active release from ${remoteAppRoot}.`);
  }

  const envPath = posixJoin(activeRelease, ".env.production");
  const desired = buildRuntimeEnv();
  const current = await inspectRuntimeEnv(config, envPath);

  console.table([
    {
      activeRelease,
      currentKeys: current.keys.join(", ") || "none",
      currentMode: current.mode,
      desiredKeys: desired.keys.join(", "),
      runtimeFile: envPath,
    },
  ]);

  if (!apply) {
    console.log("Dry run only. Use --apply to write runtime configuration and restart Passenger.");
    return;
  }

  logStep("Writing canonical server-side runtime environment");
  await withSftp(config, async (client) => {
    await client.put(Buffer.from(desired.content, "utf8"), envPath);
  });
  await runRemoteCommand(config, `chmod ${RUNTIME_ENV_MODE} ${shellEscape(envPath)}`);

  const written = await inspectRuntimeEnv(config, envPath);
  if (written.mode !== RUNTIME_ENV_MODE.replace(/^0/, "")) {
    throw new Error(`Runtime environment mode is ${written.mode}, expected 600.`);
  }
  if (written.keys.join("\n") !== desired.keys.join("\n")) {
    throw new Error("Runtime environment keys do not match the canonical allowlist.");
  }

  logStep("Restarting Passenger application to load runtime configuration");
  await restartApplication(config, activeRelease);
  console.log(`Runtime configuration applied with keys: ${written.keys.join(", ")}`);
}

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isDirectRun) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
