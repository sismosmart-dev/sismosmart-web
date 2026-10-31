import path from "node:path";

import { requireConfig, requireSshAuth, toRemoteAbsolutePath } from "./config.mjs";
import { getApplications, posixJoin, runRemoteCommand } from "./helpers.mjs";
import { normalizePublicPermissions } from "./permissions-lib.mjs";
import { listReleaseInventory, selectRollbackRelease } from "./releases-lib.mjs";
import {
  shellQuote,
  webrootSnapshotFiles,
  verifyWebrootSnapshotScript,
  restoreWebrootScript,
} from "./rollback-webroot.mjs";

function appCommand(config, appRoot, version = config.remoteNodeVersion) {
  return [
    "cloudlinux-selector create --json --interpreter nodejs",
    "--domain", shellQuote(config.remoteAppDomain),
    "--app-root", shellQuote(appRoot),
    "--app-uri", shellQuote(config.remoteAppUri),
    "--version", shellQuote(version),
    "--app-mode production --startup-file app.js",
  ].join(" ");
}

function destroyCommand(config, appRoot) {
  return [
    "cloudlinux-selector destroy --json --interpreter nodejs",
    "--domain", shellQuote(config.remoteAppDomain),
    "--app-root", shellQuote(appRoot),
  ].join(" ");
}

async function registeredApp(config) {
  const applications = await getApplications(config);
  return applications.find(
    (app) => app.domain === config.remoteAppDomain &&
      app.uri === config.remoteAppUri && app.appRoot,
  );
}

async function assertActive(config, currentPath, expected) {
  const { stdout } = await runRemoteCommand(
    config,
    `readlink -f ${shellQuote(currentPath)} 2>/dev/null || true`,
  );
  const app = await registeredApp(config);
  if (stdout.trim() !== expected || app?.appRoot !== expected) {
    throw new Error("ROLLBACK_RELEASE_POINTERS_INCONSISTENT");
  }
  const htaccess = toRemoteAbsolutePath(config, config.remotePublicRoot) + "/.htaccess";
  await runRemoteCommand(
    config,
    "test -f " + shellQuote(posixJoin(expected, ".next", "BUILD_ID")) +
      " && test -f " + shellQuote(htaccess) +
      " && grep -F " + shellQuote(expected) + " " + shellQuote(htaccess) + " >/dev/null",
  );
}

async function main() {
  const apply = process.argv.includes("--apply");
  const config = requireSshAuth(requireConfig([
    "sshHost", "sshUser", "domain", "remoteAppDomain",
    "remoteHome", "remoteAppRoot", "remoteReleasesRoot",
    "remotePublicRoot", "remoteAppUri", "remoteNodeVersion",
  ]));
  const currentPath = toRemoteAbsolutePath(config, config.remoteAppRoot);
  const releasesRoot = toRemoteAbsolutePath(config, config.remoteReleasesRoot);
  const publicRoot = toRemoteAbsolutePath(config, config.remotePublicRoot);

  const { stdout } = await runRemoteCommand(
    config, `readlink -f ${shellQuote(currentPath)} 2>/dev/null || true`,
  );
  const current = stdout.trim();
  if (!current) throw new Error("ROLLBACK_CURRENT_RELEASE_MISSING");
  const app = await registeredApp(config);
  if (app?.appRoot !== current) throw new Error("ROLLBACK_RELEASE_POINTERS_INCONSISTENT");

  const inventory = await listReleaseInventory(config, releasesRoot);
  const candidate = selectRollbackRelease(inventory, current);
  if (!candidate) throw new Error("ROLLBACK_KNOWN_GOOD_PREDECESSOR_MISSING");

  // Old releases without an independently checksummed pre-deploy webroot
  // cannot safely be selected, even when their application code is healthy.
  await runRemoteCommand(
    config, verifyWebrootSnapshotScript(releasesRoot, candidate.path),
  );
  const { archive } = webrootSnapshotFiles(releasesRoot, candidate.path);
  await assertActive(config, currentPath, current);
  console.log("ROLLBACK_PREFLIGHT_OK target=known-good webroot=checksum-verified");

  if (!apply) {
    console.log("ROLLBACK_DRY_RUN no production changes; pass --apply only under an approved recovery operation.");
    return;
  }
  if (process.env.ROLLBACK_CONFIRMATION !== "rollback-production") {
    throw new Error("ROLLBACK_EXPLICIT_CONFIRMATION_REQUIRED");
  }

  const tempRoot = posixJoin(path.posix.dirname(currentPath), "tmp");
  const undo = posixJoin(tempRoot, `manual-rollback-undo-${Date.now()}.tar.gz`);
  const lock = posixJoin(tempRoot, ".manual-rollback.lock");
  let lockHeld = false;
  let backupReady = false;
  let recovered = false;
  try {
    await runRemoteCommand(config, [
      "set -eu",
      `test -d ${shellQuote(tempRoot)}`,
      `mkdir ${shellQuote(lock)}`,
    ].join(" && "));
    lockHeld = true;
    // No release switch is permitted without a complete backup of the
    // currently live webroot and an intact checksum-verified target.
    await assertActive(config, currentPath, current);
    await runRemoteCommand(config, verifyWebrootSnapshotScript(releasesRoot, candidate.path));
    await runRemoteCommand(config, [
      "set -eu",
      `tar -czf ${shellQuote(undo)} -C ${shellQuote(publicRoot)} .`,
      `chmod 0600 ${shellQuote(undo)}`,
      `tar -tzf ${shellQuote(undo)} >/dev/null`,
    ].join(" && "));
    backupReady = true;

    await runRemoteCommand(config, destroyCommand(config, current));
    await runRemoteCommand(config, appCommand(config, candidate.path));
    await runRemoteCommand(config, `ln -sfn ${shellQuote(candidate.path)} ${shellQuote(currentPath)}`);
    await runRemoteCommand(config, restoreWebrootScript(publicRoot, archive));
    await normalizePublicPermissions(config, publicRoot);
    await runRemoteCommand(config, `touch ${shellQuote(posixJoin(candidate.path, "tmp", "restart.txt"))}`);
    await assertActive(config, currentPath, candidate.path);
    console.log("ROLLBACK_COMPLETED validated=application-and-webroot");
    recovered = true;
  } catch (error) {
    if (backupReady) {
      try {
        const live = await registeredApp(config);
        if (live?.appRoot && live.appRoot !== current) {
          await runRemoteCommand(config, destroyCommand(config, live.appRoot));
        }
        if ((await registeredApp(config))?.appRoot !== current) {
          await runRemoteCommand(config, appCommand(config, current, app.version || config.remoteNodeVersion));
        }
        await runRemoteCommand(config, `ln -sfn ${shellQuote(current)} ${shellQuote(currentPath)}`);
        await runRemoteCommand(config, restoreWebrootScript(publicRoot, undo));
        await normalizePublicPermissions(config, publicRoot);
        await assertActive(config, currentPath, current);
        recovered = true;
        console.warn("ROLLBACK_ATTEMPT_FAILED original-release-restored");
      } catch {
        console.error("ROLLBACK_RECOVERY_REQUIRED manual recovery from the protected undo archive");
        // Keep the undo archive and lock for a human recovery operator.
      }
    }
    if (!backupReady) recovered = true; // no production mutation occurred
    throw error;
  } finally {
    if (recovered && backupReady) {
      await runRemoteCommand(
        config, `rm -f ${shellQuote(undo)}`,
      ).catch(() => console.warn("ROLLBACK_CLEANUP_WARNING undo retained"));
    }
    if (recovered && lockHeld) {
      await runRemoteCommand(
        config, `rmdir ${shellQuote(lock)}`,
      ).catch(() => console.warn("ROLLBACK_CLEANUP_WARNING lock retained"));
    }
  }
}

main().catch((error) => {
  console.error(`ROLLBACK_FAILED code=${error?.message || "UNKNOWN"}`);
  process.exitCode = 1;
});
