import {
  requireConfig,
  requireSshAuth,
  logStep,
  toRemoteAbsolutePath,
} from "./config.mjs";
import { getApplications, posixJoin, runRemoteCommand } from "./helpers.mjs";
import { listReleaseInventory, selectRollbackRelease } from "./releases-lib.mjs";

function shellEscape(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

async function main() {
  const config = requireConfig([
    "sshHost",
    "sshUser",
    "domain",
    "remoteAppDomain",
    "remoteHome",
    "remoteAppRoot",
    "remoteReleasesRoot",
    "remoteAppUri",
    "remoteNodeVersion",
  ]);
  requireSshAuth(config);

  const remoteAppRoot = toRemoteAbsolutePath(config, config.remoteAppRoot);
  const remoteReleasesRoot = toRemoteAbsolutePath(
    config,
    config.remoteReleasesRoot,
  );

  logStep("Selecting previous known-good release");
  const { stdout: currentOutput } = await runRemoteCommand(
    config,
    `readlink -f ${shellEscape(remoteAppRoot)} 2>/dev/null || true`,
  );
  const currentRelease = currentOutput.trim();
  const inventory = await listReleaseInventory(config, remoteReleasesRoot);
  const rollbackCandidate = selectRollbackRelease(inventory, currentRelease);
  const previousRelease = rollbackCandidate?.path || "";

  if (!previousRelease) {
    throw new Error(
      "No known-good previous release was found; failed, partial, prepared, and unknown releases are excluded.",
    );
  }
  console.log(
    `DEPLOY_ROLLBACK_SELECTED path=${previousRelease} status=${rollbackCandidate.status}`,
  );

  logStep(`Rolling back to ${previousRelease}`);
  await runRemoteCommand(
    config,
    `ln -sfn ${shellEscape(previousRelease)} ${shellEscape(remoteAppRoot)}`,
  );

  const applications = await getApplications(config);
  const existingApp = applications.find(
    (app) => app.domain === config.remoteAppDomain && app.uri === config.remoteAppUri,
  );

  if (existingApp?.appRoot) {
    logStep("Destroying current CloudLinux Node.js app registration");
    await runRemoteCommand(
      config,
      [
        "cloudlinux-selector destroy --json --interpreter nodejs",
        `--domain ${shellEscape(config.remoteAppDomain)}`,
        `--app-root ${shellEscape(existingApp.appRoot)}`,
      ].join(" "),
    );
  }

  logStep("Registering previous release");
  await runRemoteCommand(
    config,
    [
      "cloudlinux-selector create --json --interpreter nodejs",
      `--domain ${shellEscape(config.remoteAppDomain)}`,
      `--app-root ${shellEscape(previousRelease)}`,
      `--app-uri ${shellEscape(config.remoteAppUri)}`,
      `--version ${shellEscape(config.remoteNodeVersion)}`,
      "--app-mode production",
      "--startup-file app.js",
    ].join(" "),
  );

  await runRemoteCommand(
    config,
    `touch ${shellEscape(posixJoin(previousRelease, "tmp", "restart.txt"))} 2>/dev/null || true`,
  );

  console.log(`Rollback completed. Active release: ${previousRelease}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
