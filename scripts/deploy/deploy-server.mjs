import fs from "node:fs/promises";
import path from "node:path";

import {
  cleanNextBuildArtifacts,
  createReleaseArtifact,
} from "./deploy-artifact.mjs";

import {
  getConfig,
  requireConfig,
  requireSshAuth,
  logStep,
  toRemoteAbsolutePath,
} from "./config.mjs";
import {
  getApplications,
  posixJoin,
  runLocalCommand,
  runRemoteCommand,
  withSftp,
} from "./helpers.mjs";
import {
  assertPermissionAudit,
  auditPermissions,
  normalizePublicPermissions,
  normalizeReleasePermissions,
} from "./permissions-lib.mjs";
import {
  enforceReleaseRetention,
  RELEASE_FAILED_FILE,
  RELEASE_PREPARED_FILE,
  RELEASE_READY_FILE,
  writeReleaseMetadata,
} from "./releases-lib.mjs";
import { runDeploymentTransaction } from "./transaction.mjs";

function shellEscape(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function removeRouteAliases(config) {
  const publicHtmlPath = toRemoteAbsolutePath(config, config.remotePublicRoot);
  const htaccessPath = posixJoin(publicHtmlPath, ".htaccess");

  await withSftp(config, async (client) => {
    if (!(await client.exists(htaccessPath))) {
      return;
    }

    const buffer = await client.get(htaccessPath);
    const current = Buffer.isBuffer(buffer) ? buffer.toString("utf8") : String(buffer);
    const normalized = current
      .replace(/\r\n/g, "\n")
      .replace(
        /\n?# SISMOSMART ROUTE ALIASES BEGIN[\s\S]*?# SISMOSMART ROUTE ALIASES END\n?/g,
        "\n",
      )
      .trimEnd();

    const nextContent = `${normalized.replace(/\n{3,}/g, "\n\n")}\n`;
    await client.put(Buffer.from(nextContent, "utf8"), htaccessPath);
  });
}

async function ensureCanonicalRedirects(config) {
  const publicHtmlPath = toRemoteAbsolutePath(config, config.remotePublicRoot);
  const htaccessPath = posixJoin(publicHtmlPath, ".htaccess");
  const canonicalHost = config.domain.replace(/^www\./, "");
  const managedBlock = [
    "# SISMOSMART CANONICAL REDIRECTS BEGIN",
    "RewriteEngine On",
    "RewriteCond %{HTTPS} off [OR]",
    "RewriteCond %{HTTP_HOST} ^www\\. [NC]",
    `RewriteRule ^(.*)$ https://${canonicalHost}/$1 [L,R=301]`,
    "# SISMOSMART CANONICAL REDIRECTS END",
  ].join("\n");

  await withSftp(config, async (client) => {
    await client.mkdir(publicHtmlPath, true);

    const exists = await client.exists(htaccessPath);
    const current = exists
      ? Buffer.from(await client.get(htaccessPath)).toString("utf8")
      : "";

    const cleaned = current
      .replace(/\r\n/g, "\n")
      .replace(
        /# SISMOSMART CANONICAL REDIRECTS BEGIN[\s\S]*?# SISMOSMART CANONICAL REDIRECTS END\n?/g,
        "",
      )
      .replace(
        /^RewriteEngine On\nRewriteCond %\{HTTPS\} off\nRewriteRule \^\(\.\*\)\$ https:\/\/%\{HTTP_HOST\}%\{REQUEST_URI\} \[L,R=301\]\nRewriteCond %\{HTTP_HOST\} \^www\\\.\(\.\*\)\$ \[NC\]\nRewriteRule \^\(\.\*\)\$ https:\/\/%1\/\$1 \[L,R=301\]\n?/m,
        "",
      )
      .trimStart();

    await client.put(
      Buffer.from(`${managedBlock}\n${cleaned}`.replace(/\n{3,}/g, "\n\n"), "utf8"),
      htaccessPath,
    );
  });
}

async function removeShadowedNextRoutes(config) {
  const publicHtmlPath = toRemoteAbsolutePath(config, config.remotePublicRoot);
  const shadowedFiles = [
    "manifest.json",
    "robots.txt",
    "sitemap.xml",
    "site.webmanifest",
  ];

  await withSftp(config, async (client) => {
    for (const fileName of shadowedFiles) {
      const remotePath = posixJoin(publicHtmlPath, fileName);

      if (await client.exists(remotePath)) {
        await client.delete(remotePath);
      }
    }
  });
}

async function syncPublicAssets(config) {
  const publicHtmlPath = toRemoteAbsolutePath(config, config.remotePublicRoot);
  const localPublicPath = path.resolve("public");
  const localFaviconPath = path.resolve("public", "images", "icons", "favicon.ico");
  const localDevicePath = path.resolve("public", "images", "device");

  await withSftp(config, async (client) => {
    await client.mkdir(publicHtmlPath, true);
    await client.uploadDir(localPublicPath, publicHtmlPath);

    const deviceFiles = await fs.readdir(localDevicePath).catch((error) => {
      if (error?.code === "ENOENT") {
        return [];
      }

      throw error;
    });

    if (deviceFiles.length > 0) {
      const remoteDevicePath = posixJoin(publicHtmlPath, "images", "device");
      await client.mkdir(remoteDevicePath, true);

      for (const fileName of deviceFiles) {
        const localFilePath = path.join(localDevicePath, fileName);
        const remoteFilePath = posixJoin(remoteDevicePath, fileName);
        await client.put(await fs.readFile(localFilePath), remoteFilePath);
      }
    }

    try {
      await client.put(
        await fs.readFile(localFaviconPath),
        posixJoin(publicHtmlPath, "favicon.ico"),
      );
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }
  });
}

async function getCurrentRelease(config, remoteAppRoot) {
  const { stdout } = await runRemoteCommand(
    config,
    `if test -L ${shellEscape(remoteAppRoot)}; then readlink -f ${shellEscape(remoteAppRoot)}; fi`,
  );
  return stdout.trim();
}

async function getCurrentApplication(config) {
  const applications = await getApplications(config);
  return applications.find(
    (app) =>
      app.domain === config.remoteAppDomain && app.uri === config.remoteAppUri,
  );
}

async function destroyApplication(config, appRoot) {
  await runRemoteCommand(
    config,
    [
      "cloudlinux-selector destroy --json --interpreter nodejs",
      `--domain ${shellEscape(config.remoteAppDomain)}`,
      `--app-root ${shellEscape(appRoot)}`,
    ].join(" "),
  );
}

async function createApplication(config, appRoot, version = config.remoteNodeVersion) {
  await runRemoteCommand(
    config,
    [
      "cloudlinux-selector create --json --interpreter nodejs",
      `--domain ${shellEscape(config.remoteAppDomain)}`,
      `--app-root ${shellEscape(appRoot)}`,
      `--app-uri ${shellEscape(config.remoteAppUri)}`,
      `--version ${shellEscape(version || config.remoteNodeVersion)}`,
      "--app-mode production",
      "--startup-file app.js",
    ].join(" "),
  );
}

async function recycleNodeWorkers(config, releasePath, remoteReleasesRoot) {
  const safeUser = shellEscape(config.sshUser);
  const safeReleasePath = shellEscape(releasePath);
  const safeReleasesRoot = shellEscape(`${remoteReleasesRoot}/`);

  await runRemoteCommand(
    config,
    [
      "cloudlinux-selector stop --json --interpreter nodejs",
      `--user ${safeUser}`,
      `--app-root ${safeReleasePath}`,
      "|| true",
      "&&",
      "for pid in $(ps -u",
      safeUser,
      "-o pid= -o comm= | awk '$2 == \"next-server\" { print $1 }'); do",
      'cwd="$(readlink -f /proc/$pid/cwd 2>/dev/null || true)";',
      `case "$cwd" in ${safeReleasesRoot}*) kill "$pid" 2>/dev/null || true ;; esac;`,
      "done",
      "&& sleep 2",
      "&&",
      "cloudlinux-selector start --json --interpreter nodejs",
      `--user ${safeUser}`,
      `--app-root ${safeReleasePath}`,
      "&& sleep 3",
    ].join(" "),
  );
}

function deriveNodePath(config, application) {
  if (!application?.appRoot) {
    return "";
  }

  const relativeRoot = path.posix.relative(config.remoteHome, application.appRoot);
  if (!relativeRoot || relativeRoot.startsWith("..")) {
    return "";
  }

  const majorVersion = String(
    application.version || config.remoteNodeVersion,
  ).split(".")[0];
  return posixJoin(
    config.remoteHome,
    "nodevenv",
    relativeRoot,
    majorVersion,
    "bin",
    "node",
  );
}

async function waitForPublicHealth(baseUrl, { requireFormHealth = true } = {}) {
  const paths = requireFormHealth
    ? ["/en", "/api/contact", "/api/waitlist"]
    : ["/en"];
  let lastError;

  for (let attempt = 1; attempt <= 12; attempt += 1) {
    try {
      for (const route of paths) {
        const response = await fetch(`${baseUrl}${route}`, {
          redirect: "follow",
          signal: AbortSignal.timeout(15_000),
        });
        if (!response.ok) {
          throw new Error(`${route} returned HTTP ${response.status}`);
        }
        if (route.startsWith("/api/")) {
          const payload = await response.json();
          if (payload.ok !== true || payload.configured !== true) {
            throw new Error(`${route} reported an unconfigured runtime`);
          }
        }
      }
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 12) {
        await sleep(2_000);
      }
    }
  }

  throw new Error(`Public health verification failed: ${lastError?.message}`);
}

async function verifyRemoteOrigin(config, { requireFormHealth = true } = {}) {
  const originHost = config.remoteOriginHost.replace(/^www\./, "");
  const mountPath =
    config.remoteAppUri === "/"
      ? ""
      : `/${config.remoteAppUri.replace(/^\/+|\/+$/g, "")}`;
  const connectTarget = shellEscape(
    `${originHost}:443:${config.sshHost}:443`,
  );
  const homepageUrl = shellEscape(`https://${originHost}${mountPath}/en`);
  const contactUrl = shellEscape(`https://${originHost}${mountPath}/api/contact`);
  const waitlistUrl = shellEscape(`https://${originHost}${mountPath}/api/waitlist`);
  const healthCondition = requireFormHealth
    ? `
      contact="$(curl -kfsS --connect-to ${connectTarget} ${contactUrl})"
      waitlist="$(curl -kfsS --connect-to ${connectTarget} ${waitlistUrl})"
      if printf '%s' "$contact" | grep -Eq '"configured"[[:space:]]*:[[:space:]]*true' &&
        printf '%s' "$waitlist" | grep -Eq '"configured"[[:space:]]*:[[:space:]]*true'; then
        ok=1
        break
      fi
    `
    : `
      ok=1
      break
    `;

  const script = `
set -eu
ok=0
attempt=1
while [ "$attempt" -le 20 ]; do
  if curl -kfsS --connect-to ${connectTarget} ${homepageUrl} >/dev/null; then
    ${healthCondition}
  fi
  attempt=$((attempt + 1))
  sleep 2
done
test "$ok" = "1"
`;

  await runRemoteCommand(config, script);
}

async function verifyRemoteConsistency(
  config,
  { releasePath, remoteAppRoot, requireProcess = true },
) {
  const application = await getCurrentApplication(config);
  if (!application?.appRoot || application.appRoot !== releasePath) {
    throw new Error(
      `Passenger appRoot is ${application?.appRoot || "missing"}; expected ${releasePath}.`,
    );
  }

  const publicHtmlPath = toRemoteAbsolutePath(config, config.remotePublicRoot);
  const htaccessPath = posixJoin(publicHtmlPath, ".htaccess");
  const processCheck = requireProcess
    ? `
found=0
for pid in $(ps -u ${shellEscape(config.sshUser)} -o pid= -o comm= | awk '$2 == "next-server" { print $1 }'); do
  cwd="$(readlink -f "/proc/$pid/cwd" 2>/dev/null || true)"
  if [ "$cwd" = ${shellEscape(releasePath)} ]; then
    found=1
    break
  fi
done
test "$found" = "1"
`
    : "";

  const script = `
set -u
resolved_current="$(readlink -f ${shellEscape(remoteAppRoot)} 2>/dev/null || true)"
if [ "$resolved_current" != ${shellEscape(releasePath)} ]; then
  printf 'current mismatch: actual=%s expected=%s\n' "$resolved_current" ${shellEscape(releasePath)} >&2
  exit 41
fi
build_id_path=${shellEscape(posixJoin(releasePath, ".next", "BUILD_ID"))}
if [ ! -s "$build_id_path" ]; then
  printf 'BUILD_ID missing: %s\n' "$build_id_path" >&2
  exit 42
fi
htaccess_root="$(awk '$1 == "PassengerAppRoot" { value=$2; gsub(/^"|"$/, "", value); print value; exit }' ${shellEscape(htaccessPath)})"
if [ "$htaccess_root" != ${shellEscape(releasePath)} ]; then
  printf 'PassengerAppRoot mismatch: actual=%s expected=%s\n' "$htaccess_root" ${shellEscape(releasePath)} >&2
  exit 43
fi
${processCheck}
cat "$build_id_path"
`;

  const { stdout } = await runRemoteCommand(config, script);
  return stdout.trim();
}

async function main() {
  const config = requireSshAuth(
    requireConfig([
      "sshHost",
      "sshUser",
      "domain",
      "remoteAppDomain",
      "remoteOriginHost",
      "publicBaseUrl",
      "remoteHome",
      "remoteAppRoot",
      "remoteReleasesRoot",
      "remoteAppUri",
      "remoteNodeVersion",
      "remotePublicRoot",
      "releaseRetentionCount",
    ]),
  );
  const remoteAppRoot = toRemoteAbsolutePath(config, config.remoteAppRoot);
  const remoteReleasesRoot = toRemoteAbsolutePath(
    config,
    config.remoteReleasesRoot,
  );
  const remoteAppBase = path.posix.dirname(remoteAppRoot);
  const remoteTmpRoot = posixJoin(remoteAppBase, "tmp");
  const publicHtmlPath = toRemoteAbsolutePath(config, config.remotePublicRoot);
  const htaccessPath = posixJoin(publicHtmlPath, ".htaccess");
  const releaseId = new Date().toISOString().replace(/[:.]/g, "-");
  const releasePath = posixJoin(remoteReleasesRoot, releaseId);
  const partialReleasePath = `${releasePath}.partial`;
  const localDeployRoot = path.resolve(getConfig().localDeployRoot);
  const remoteArtifactPath = posixJoin(remoteTmpRoot, `${releaseId}.tar.gz`);
  const remoteChecksumPath = `${remoteArtifactPath}.sha256`;
  const statePath = posixJoin(remoteTmpRoot, `deploy-${releaseId}.json`);
  const htaccessBackupPath = posixJoin(
    remoteTmpRoot,
    `deploy-${releaseId}.htaccess.bak`,
  );
  const publicBackupPath = posixJoin(
    remoteTmpRoot,
    `deploy-${releaseId}.public-html.tar.gz`,
  );
  const context = {
    artifact: undefined,
    buildId: "",
    deploymentStartedAt: Date.now(),
    existingApp: undefined,
    htaccessExisted: false,
    previousNodePath: "",
    previousRelease: "",
    releaseId,
    releaseMetadata: undefined,
    releasePath,
    transferDurationMs: 0,
  };
  const baseUrl = config.publicBaseUrl.replace(/\/+$/, "");
  const validationOnly =
    process.argv.includes("--validate") ||
    process.env.DEPLOY_VALIDATE_ONLY === "true";
  const commitSha =
    process.env.GITHUB_SHA || process.env.DEPLOY_COMMIT_SHA || "unknown";

  console.log(`DEPLOY_RELEASE id=${releaseId} path=${releasePath}`);
  console.log(`DEPLOY_RECOVERY state=${statePath}`);

  const operations = {
    prepare: async () => {
      logStep("Cleaning previous Next.js build artifacts");
      await cleanNextBuildArtifacts();

      logStep("Building the Next.js application");
      runLocalCommand("npm run build");
      runLocalCommand("npm run deploy:prepare");

      logStep("Creating one immutable release artifact");
      context.artifact = await createReleaseArtifact(localDeployRoot, releaseId);
      console.log(
        `DEPLOY_ARTIFACT sha256=${context.artifact.checksum} artifactBytes=${context.artifact.artifactBytes} checksumBytes=${context.artifact.checksumBytes}`,
      );

      logStep("Uploading artifact and checksum");
      const uploadStartedAt = Date.now();
      await runRemoteCommand(
        config,
        [
          `mkdir -p ${shellEscape(remoteReleasesRoot)} ${shellEscape(remoteTmpRoot)}`,
          `test ! -e ${shellEscape(releasePath)}`,
          `rm -rf ${shellEscape(partialReleasePath)}`,
        ].join(" && "),
      );
      await withSftp(config, async (client) => {
        await client.put(context.artifact.artifactPath, remoteArtifactPath);
        await client.put(context.artifact.checksumPath, remoteChecksumPath);
      });
      context.transferDurationMs = Date.now() - uploadStartedAt;
      console.log(
        `DEPLOY_TRANSFER uploadedBytes=${context.artifact.artifactBytes + context.artifact.checksumBytes} durationMs=${context.transferDurationMs}`,
      );

      logStep("Verifying checksum and extracting into a partial release");
      await runRemoteCommand(
        config,
        [
          "set -eu",
          `cd ${shellEscape(remoteTmpRoot)}`,
          `sha256sum -c ${shellEscape(path.posix.basename(remoteChecksumPath))}`,
          `mkdir -p ${shellEscape(partialReleasePath)}`,
          `tar -xzf ${shellEscape(remoteArtifactPath)} -C ${shellEscape(partialReleasePath)}`,
        ].join(" && "),
      );

      logStep("Normalizing and validating the partial release");
      await normalizeReleasePermissions(config, partialReleasePath);
      const runtimeChecks = process.env.WRITE_RUNTIME_ENV_FILE === "true"
        ? [
            `test -f ${shellEscape(posixJoin(partialReleasePath, ".env.production"))}`,
            `grep -q '^CONTACT_FORM_ENDPOINT=' ${shellEscape(posixJoin(partialReleasePath, ".env.production"))}`,
            `grep -q '^WAITLIST_FORM_ENDPOINT=' ${shellEscape(posixJoin(partialReleasePath, ".env.production"))}`,
            `! grep -Eq '^NEXT_PUBLIC_(CONTACT_FORM_ENDPOINT|NEWSLETTER_FORM_ENDPOINT)=' ${shellEscape(posixJoin(partialReleasePath, ".env.production"))}`,
          ]
        : [];
      const { stdout } = await runRemoteCommand(
        config,
        [
          "set -eu",
          `test -f ${shellEscape(posixJoin(partialReleasePath, "app.js"))}`,
          `test -f ${shellEscape(posixJoin(partialReleasePath, "server.js"))}`,
          `test -f ${shellEscape(posixJoin(partialReleasePath, "package.json"))}`,
          `test -s ${shellEscape(posixJoin(partialReleasePath, ".next", "BUILD_ID"))}`,
          ...runtimeChecks,
          `cat ${shellEscape(posixJoin(partialReleasePath, ".next", "BUILD_ID"))}`,
        ].join(" && "),
      );
      context.buildId = stdout.trim();

      const preparedAt = new Date().toISOString();
      context.releaseMetadata = {
        artifactBytes: context.artifact.artifactBytes,
        buildId: context.buildId,
        checksum: context.artifact.checksum,
        checksumBytes: context.artifact.checksumBytes,
        commitSha,
        createdAt: preparedAt,
        preparedAt,
        releaseId,
        schemaVersion: 1,
        status: "prepared",
        transferDurationMs: context.transferDurationMs,
        transferredBytes:
          context.artifact.artifactBytes + context.artifact.checksumBytes,
      };
      await writeReleaseMetadata(config, partialReleasePath, context.releaseMetadata);
      await withSftp(config, async (client) => {
        await client.put(
          Buffer.from(`${preparedAt}\n`, "utf8"),
          posixJoin(partialReleasePath, RELEASE_PREPARED_FILE),
        );
      });
      await runRemoteCommand(
        config,
        [
          `chmod 0644 ${shellEscape(posixJoin(partialReleasePath, RELEASE_PREPARED_FILE))}`,
          `mv ${shellEscape(partialReleasePath)} ${shellEscape(releasePath)}`,
          `test -f ${shellEscape(posixJoin(releasePath, RELEASE_PREPARED_FILE))}`,
          `test ! -e ${shellEscape(posixJoin(releasePath, RELEASE_READY_FILE))}`,
        ].join(" && "),
      );
      console.log(
        `DEPLOY_PREPARED buildId=${context.buildId} commitSha=${commitSha}`,
      );
    },

    snapshot: async () => {
      logStep("Recording the previous symlink, Passenger registration, and webroot");
      context.previousRelease = await getCurrentRelease(config, remoteAppRoot);
      context.existingApp = await getCurrentApplication(config);

      if (
        context.existingApp?.appRoot &&
        context.previousRelease &&
        context.existingApp.appRoot !== context.previousRelease
      ) {
        throw new Error(
          `Production is already inconsistent: current=${context.previousRelease}, Passenger=${context.existingApp.appRoot}.`,
        );
      }

      const nodePathScript = `
set -u
is_node_runtime() {
  candidate="$1"
  [ -n "$candidate" ] &&
    [ -x "$candidate" ] &&
    "$candidate" --version 2>/dev/null | grep -Eq '^v[0-9]+\.'
}

if [ -f ${shellEscape(htaccessPath)} ]; then
  candidate="$(awk '$1 == "PassengerNodejs" { value=$2; gsub(/^"|"$/, "", value); print value; exit }' ${shellEscape(htaccessPath)})"
  if is_node_runtime "$candidate"; then
    printf '%s\n' "$candidate"
    exit 0
  fi
fi

for pid in $(ps -u ${shellEscape(config.sshUser)} -o pid= -o comm= | awk '$2 == "next-server" { print $1 }'); do
  candidate="$(readlink -f "/proc/$pid/exe" 2>/dev/null || true)"
  if is_node_runtime "$candidate"; then
    printf '%s\n' "$candidate"
    exit 0
  fi
done
`;
      const { stdout: nodePathOutput } = await runRemoteCommand(
        config,
        nodePathScript,
      );
      context.previousNodePath =
        nodePathOutput.trim() || deriveNodePath(config, context.existingApp);

      if (context.existingApp?.appRoot && !context.previousNodePath) {
        throw new Error("Could not determine the existing Passenger Node.js binary.");
      }

      if (context.previousNodePath) {
        await runRemoteCommand(
          config,
          [
            `test -x ${shellEscape(context.previousNodePath)}`,
            `${shellEscape(context.previousNodePath)} --version | grep -Eq '^v[0-9]+\\.'`,
          ].join(" && "),
        ).catch((error) => {
          throw new Error(
            `Discovered runtime is not a Node.js executable: ${context.previousNodePath}. ${error.message}`,
          );
        });
        console.log(`DEPLOY_RUNTIME node=${context.previousNodePath} validated=true`);
      } else {
        console.log("DEPLOY_RUNTIME node=none");
      }

      const snapshotScript = `
set -eu
mkdir -p ${shellEscape(remoteTmpRoot)} ${shellEscape(publicHtmlPath)}
if [ -f ${shellEscape(htaccessPath)} ]; then
  cp -p ${shellEscape(htaccessPath)} ${shellEscape(htaccessBackupPath)}
  printf 'present\n'
else
  rm -f ${shellEscape(htaccessBackupPath)}
  printf 'missing\n'
fi
tar -czf ${shellEscape(publicBackupPath)} -C ${shellEscape(publicHtmlPath)} .
`;
      const { stdout: htaccessState } = await runRemoteCommand(
        config,
        snapshotScript,
      );
      context.htaccessExisted = htaccessState.trim() === "present";

      const recoveryState = {
        buildId: context.buildId,
        domain: config.domain,
        passengerDomain: config.remoteAppDomain,
        publicBaseUrl: baseUrl,
        htaccessBackupPath,
        htaccessExisted: context.htaccessExisted,
        previousApp: context.existingApp
          ? {
              appRoot: context.existingApp.appRoot,
              state: context.existingApp.state,
              uri: context.existingApp.uri,
              version: context.existingApp.version,
            }
          : null,
        previousRelease: context.previousRelease || null,
        publicBackupPath,
        releaseId,
        releasePath,
        remoteAppRoot,
      };
      await withSftp(config, async (client) => {
        await client.put(
          Buffer.from(`${JSON.stringify(recoveryState, null, 2)}\n`, "utf8"),
          statePath,
        );
      });
      await runRemoteCommand(config, `chmod 0600 ${shellEscape(statePath)}`);

      console.log(
        `DEPLOY_SNAPSHOT previousRelease=${context.previousRelease || "none"} previousPassenger=${context.existingApp?.appRoot || "none"}`,
      );
    },

    preflight: async () => {
      if (!context.previousNodePath) {
        console.warn("DEPLOY_PREFLIGHT skipped=no-existing-node-runtime");
        return;
      }

      logStep("Starting the new release on an isolated localhost port");
      const preflightLog = posixJoin(releasePath, "tmp", "preflight.log");
      const nodeRuntime = shellEscape(context.previousNodePath);
      const preflightMount =
        config.remoteAppUri === "/"
          ? ""
          : `/${config.remoteAppUri.replace(/^\/+|\/+$/g, "")}`;
      const script = `
set -eu
printf 'preflight_node=%s\n' ${nodeRuntime}
if [ ! -x ${nodeRuntime} ]; then
  printf 'Node runtime is not executable: %s\n' ${nodeRuntime} >&2
  ls -ld ${nodeRuntime} "$(dirname ${nodeRuntime})" >&2 || true
  exit 1
fi
for tool in curl awk grep nohup seq; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    printf 'Required preflight tool is missing: %s\n' "$tool" >&2
    exit 1
  fi
done
mkdir -p ${shellEscape(posixJoin(releasePath, "tmp"))}
port=""
for candidate in $(seq 23100 23149); do
  if command -v ss >/dev/null 2>&1; then
    if ! ss -ltn | awk '{print $4}' | grep -Eq "[:.]\${candidate}$"; then
      port="$candidate"
      break
    fi
  elif command -v netstat >/dev/null 2>&1; then
    if ! netstat -ltn | awk '{print $4}' | grep -Eq "[:.]\${candidate}$"; then
      port="$candidate"
      break
    fi
  else
    port="$candidate"
    break
  fi
done
if [ -z "$port" ]; then
  printf 'No preflight port is available in 23100-23149\n' >&2
  exit 1
fi
printf 'preflight_port=%s\n' "$port"
cd ${shellEscape(releasePath)}
PORT="$port" HOSTNAME=127.0.0.1 NODE_ENV=production nohup ${nodeRuntime} app.js >${shellEscape(preflightLog)} 2>&1 &
pid=$!
cleanup() {
  kill "$pid" 2>/dev/null || true
  wait "$pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM
ok=0
attempt=1
while [ "$attempt" -le 30 ]; do
  if ! kill -0 "$pid" 2>/dev/null; then
    printf 'Preflight process exited before becoming healthy.\n' >&2
    cat ${shellEscape(preflightLog)} >&2 || true
    exit 1
  fi

  if curl -fsS "http://127.0.0.1:$port${preflightMount}/en" >/dev/null; then
    ${config.requireFormHealth ? `
    contact="$(curl -fsS "http://127.0.0.1:$port${preflightMount}/api/contact")"
    waitlist="$(curl -fsS "http://127.0.0.1:$port${preflightMount}/api/waitlist")"
    if printf '%s' "$contact" | grep -Eq '"configured"[[:space:]]*:[[:space:]]*true' &&
      printf '%s' "$waitlist" | grep -Eq '"configured"[[:space:]]*:[[:space:]]*true'; then
      ok=1
      break
    fi
    ` : `
    ok=1
    break
    `}
  fi

  attempt=$((attempt + 1))
  sleep 1
done
if [ "$ok" != "1" ]; then
  printf 'Preflight health checks did not pass.\n' >&2
  cat ${shellEscape(preflightLog)} >&2 || true
  exit 1
fi
printf 'preflight_status=healthy\n'
`;
      const { stdout, stderr } = await runRemoteCommand(config, script);
      if (stdout.trim()) {
        console.log(stdout.trim());
      }
      if (stderr.trim()) {
        console.warn(stderr.trim());
      }
      console.log("DEPLOY_PREFLIGHT status=healthy");
    },

    activate: async () => {
      if (context.existingApp?.appRoot) {
        logStep("Destroying the previous Passenger registration");
        await destroyApplication(config, context.existingApp.appRoot);
      }

      logStep("Registering the new release with Passenger");
      await createApplication(config, releasePath);
      await recycleNodeWorkers(config, releasePath, remoteReleasesRoot);
      console.log(`DEPLOY_ACTIVATED passenger=${releasePath}`);
    },

    "verify-origin": async () => {
      logStep("Verifying the new release directly at the origin");
      await verifyRemoteOrigin(config, {
        requireFormHealth: config.requireFormHealth,
      });
      const application = await getCurrentApplication(config);
      if (!application?.appRoot || application.appRoot !== releasePath) {
        throw new Error(
          `Origin application root is ${application?.appRoot || "missing"}; expected ${releasePath}.`,
        );
      }
      console.log("DEPLOY_ORIGIN status=healthy");
    },

    commit: async () => {
      logStep("Committing the current release symlink");
      await runRemoteCommand(
        config,
        [
          `ln -sfn ${shellEscape(releasePath)} ${shellEscape(remoteAppRoot)}`,
          `test "$(readlink -f ${shellEscape(remoteAppRoot)})" = ${shellEscape(releasePath)}`,
        ].join(" && "),
      );

      logStep("Applying canonical webroot configuration and public assets");
      await removeRouteAliases(config);
      if (config.manageCanonicalRedirects) {
        await ensureCanonicalRedirects(config);
      }
      await syncPublicAssets(config);
      await removeShadowedNextRoutes(config);
      await normalizePublicPermissions(config, publicHtmlPath);

      assertPermissionAudit(
        await auditPermissions(config, {
          expectedOwner: config.sshUser,
          publicHtmlPath,
          releaseRoot: releasePath,
        }),
      );
      console.log(`DEPLOY_COMMITTED current=${releasePath}`);
    },

    "verify-public": async () => {
      logStep("Verifying public traffic and final release consistency");
      await waitForPublicHealth(baseUrl, {
        requireFormHealth: config.requireFormHealth,
      });
      context.buildId = await verifyRemoteConsistency(config, {
        releasePath,
        remoteAppRoot,
        requireProcess: true,
      });
      const completedAt = new Date().toISOString();
      context.releaseMetadata = {
        ...context.releaseMetadata,
        buildId: context.buildId,
        completedAt,
        durationMs: Date.now() - context.deploymentStartedAt,
        status: "successful",
      };
      await writeReleaseMetadata(config, releasePath, context.releaseMetadata);
      await runRemoteCommand(
        config,
        [
          `rm -f ${shellEscape(posixJoin(releasePath, RELEASE_PREPARED_FILE))} ${shellEscape(posixJoin(releasePath, RELEASE_FAILED_FILE))}`,
          `printf '%s\\n' ${shellEscape(completedAt)} > ${shellEscape(posixJoin(releasePath, RELEASE_READY_FILE))}`,
          `chmod 0644 ${shellEscape(posixJoin(releasePath, RELEASE_READY_FILE))}`,
        ].join(" && "),
      );
      console.log(
        `DEPLOY_VERIFIED release=${releaseId} buildId=${context.buildId} public=healthy durationMs=${context.releaseMetadata.durationMs}`,
      );
    },

    rollback: async (_state, cause) => {
      logStep(`Rolling back automatically after ${cause.message}`);
      const currentApp = await getCurrentApplication(config).catch(() => undefined);

      if (currentApp?.appRoot && currentApp.appRoot !== context.existingApp?.appRoot) {
        await destroyApplication(config, currentApp.appRoot).catch((error) => {
          console.warn(`Could not destroy failed app registration: ${error.message}`);
        });
      }

      if (context.previousRelease) {
        await runRemoteCommand(
          config,
          `ln -sfn ${shellEscape(context.previousRelease)} ${shellEscape(remoteAppRoot)}`,
        );
      } else {
        await runRemoteCommand(config, `rm -f ${shellEscape(remoteAppRoot)}`);
      }

      if (context.existingApp?.appRoot) {
        const restoredApp = await getCurrentApplication(config).catch(() => undefined);
        if (restoredApp?.appRoot !== context.existingApp.appRoot) {
          await createApplication(
            config,
            context.existingApp.appRoot,
            context.existingApp.version || config.remoteNodeVersion,
          );
        }
      }

      await runRemoteCommand(
        config,
        [
          `find ${shellEscape(publicHtmlPath)} -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +`,
          `tar -xzf ${shellEscape(publicBackupPath)} -C ${shellEscape(publicHtmlPath)}`,
          context.htaccessExisted
            ? `test -f ${shellEscape(htaccessBackupPath)} && cp -p ${shellEscape(htaccessBackupPath)} ${shellEscape(htaccessPath)}`
            : `rm -f ${shellEscape(htaccessPath)}`,
        ].join(" && "),
      );
      await normalizePublicPermissions(config, publicHtmlPath);

      if (context.existingApp?.appRoot) {
        await recycleNodeWorkers(
          config,
          context.existingApp.appRoot,
          remoteReleasesRoot,
        );
        await verifyRemoteOrigin(config, { requireFormHealth: false });
        await waitForPublicHealth(baseUrl, { requireFormHealth: false });
        await verifyRemoteConsistency(config, {
          releasePath: context.existingApp.appRoot,
          remoteAppRoot,
          requireProcess: true,
        });
      }

      const failedAt = new Date().toISOString();
      context.releaseMetadata = {
        ...context.releaseMetadata,
        durationMs: Date.now() - context.deploymentStartedAt,
        failedAt,
        failurePhase: _state.failedPhase,
        status: "failed",
      };
      await writeReleaseMetadata(config, releasePath, context.releaseMetadata).catch(
        () => undefined,
      );
      await runRemoteCommand(
        config,
        [
          `rm -f ${shellEscape(posixJoin(releasePath, RELEASE_READY_FILE))} ${shellEscape(posixJoin(releasePath, RELEASE_PREPARED_FILE))}`,
          `printf '%s\\n' ${shellEscape(failedAt)} > ${shellEscape(posixJoin(releasePath, RELEASE_FAILED_FILE))}`,
          `chmod 0644 ${shellEscape(posixJoin(releasePath, RELEASE_FAILED_FILE))}`,
        ].join(" && "),
      ).catch(() => undefined);
      console.warn(
        `DEPLOY_ROLLBACK restored=${context.previousRelease || "no-application"}`,
      );
    },

    cleanup: async (state) => {
      await fs.rm(context.artifact?.artifactPath || "", { force: true }).catch(() => undefined);
      await fs.rm(context.artifact?.checksumPath || "", { force: true }).catch(() => undefined);

      try {
        const removePreparedRelease = Boolean(
          validationOnly || (state.failure && !state.activated),
        );
        const removeRecoveryData = Boolean(
          !state.failure || state.rollbackCompleted || !state.activated,
        );
        const commands = [
          `rm -rf ${shellEscape(partialReleasePath)}`,
          `rm -f ${shellEscape(remoteArtifactPath)} ${shellEscape(remoteChecksumPath)}`,
        ];
        if (removePreparedRelease) {
          commands.push(`rm -rf ${shellEscape(releasePath)}`);
        }
        if (removeRecoveryData) {
          commands.push(
            `rm -f ${shellEscape(statePath)} ${shellEscape(htaccessBackupPath)} ${shellEscape(publicBackupPath)}`,
          );
        }
        await runRemoteCommand(config, commands.join(" && "));
      } catch (error) {
        console.warn(`Deployment cleanup warning: ${error.message}`);
      }

      if (state.rollbackError) {
        console.error(`DEPLOY_RECOVERY_REQUIRED state=${statePath}`);
      }
    },
  };

  const phases = validationOnly
    ? ["prepare", "snapshot", "preflight"]
    : undefined;
  const state = await runDeploymentTransaction(operations, { phases });

  if (validationOnly) {
    console.log(
      `Deployment validation completed without activation. Release ${releaseId} was removed after preflight.`,
    );
    return;
  }

  logStep("Enforcing successful release retention");
  const activeApplication = await getCurrentApplication(config);
  const protectedPaths = [
    ...new Set([releasePath, activeApplication?.appRoot].filter(Boolean)),
  ];
  const retention = await enforceReleaseRetention(config, {
    apply: true,
    protectedPaths,
    remoteReleasesRoot,
    retainCount: config.releaseRetentionCount,
  });

  console.log(
    `DEPLOY_SUMMARY release=${releaseId} commitSha=${commitSha} durationMs=${Date.now() - context.deploymentStartedAt} transferredBytes=${context.releaseMetadata.transferredBytes} releasesBefore=${retention.inventory.length} releasesAfter=${retention.afterInventory.length} releaseBytesBefore=${retention.beforeBytes} releaseBytesAfter=${retention.afterBytes}`,
  );
  console.log(
    `Deployment completed transactionally. Active release: ${releaseId}; phases=${state.history.join(",")}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
