import {
  logStep,
  requireConfig,
  requireSshAuth,
  toRemoteAbsolutePath,
} from "./config.mjs";
import { runRemoteCommand } from "./helpers.mjs";
import {
  assertPermissionAudit,
  auditPermissions,
  normalizePublicPermissions,
  normalizeReleasePermissions,
  shellEscape,
} from "./permissions-lib.mjs";

async function main() {
  const apply = process.argv.includes("--apply");
  const allReleases = process.argv.includes("--all-releases");
  const config = requireSshAuth(
    requireConfig([
      "sshHost",
      "sshUser",
      "remoteHome",
      "remoteAppRoot",
      "remoteReleasesRoot",
    ]),
  );

  const remoteAppRoot = toRemoteAbsolutePath(config, config.remoteAppRoot);
  const remoteReleasesRoot = toRemoteAbsolutePath(
    config,
    config.remoteReleasesRoot,
  );
  const publicHtmlPath = toRemoteAbsolutePath(config, "public_html");
  const { stdout } = await runRemoteCommand(
    config,
    `readlink -f ${shellEscape(remoteAppRoot)}`,
  );
  const activeRelease = stdout.trim();

  if (!activeRelease) {
    throw new Error(`Could not resolve active release from ${remoteAppRoot}.`);
  }

  const targetReleaseRoot = allReleases ? remoteReleasesRoot : activeRelease;
  console.log(
    `Permission target: ${allReleases ? "all retained releases" : "active release"} (${targetReleaseRoot})`,
  );

  const before = await auditPermissions(config, {
    releaseRoot: targetReleaseRoot,
    publicHtmlPath,
    expectedOwner: config.sshUser,
  });
  console.log("Current permission audit:");
  console.table([before.report]);

  if (!apply) {
    if (before.failures.length === 0) {
      console.log("Production permissions already satisfy the policy.");
    } else {
      console.log(`Dry run found policy violations: ${before.failures.join(", ")}`);
      console.log("Run again with --apply to normalize permissions.");
    }
    return;
  }

  logStep("Normalizing application release permissions");
  await normalizeReleasePermissions(config, targetReleaseRoot);

  logStep("Normalizing public_html permissions");
  await normalizePublicPermissions(config, publicHtmlPath);

  logStep("Verifying production permission policy");
  const after = await auditPermissions(config, {
    releaseRoot: targetReleaseRoot,
    publicHtmlPath,
    expectedOwner: config.sshUser,
  });
  assertPermissionAudit(after);
  console.log("Production permission policy verified successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
