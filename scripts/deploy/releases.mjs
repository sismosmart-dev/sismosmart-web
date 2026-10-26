import {
  logStep,
  requireConfig,
  requireSshAuth,
  toRemoteAbsolutePath,
} from "./config.mjs";
import { getApplications, runRemoteCommand } from "./helpers.mjs";
import {
  enforceReleaseRetention,
  selectRollbackRelease,
} from "./releases-lib.mjs";

function shellEscape(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const config = requireSshAuth(
    requireConfig([
      "sshHost",
      "sshUser",
      "domain",
      "remoteHome",
      "remoteAppRoot",
      "remoteReleasesRoot",
      "remoteAppUri",
      "releaseRetentionCount",
    ]),
  );
  const remoteAppRoot = toRemoteAbsolutePath(config, config.remoteAppRoot);
  const remoteReleasesRoot = toRemoteAbsolutePath(
    config,
    config.remoteReleasesRoot,
  );
  const { stdout } = await runRemoteCommand(
    config,
    `readlink -f ${shellEscape(remoteAppRoot)} 2>/dev/null || true`,
  );
  const currentRelease = stdout.trim();
  const applications = await getApplications(config);
  const application = applications.find(
    (candidate) =>
      candidate.domain === config.remoteAppDomain && candidate.uri === config.remoteAppUri,
  );
  const passengerRelease = application?.appRoot || "";
  const protectedPaths = [...new Set([currentRelease, passengerRelease].filter(Boolean))];

  if (!currentRelease) {
    throw new Error(`Could not resolve current release from ${remoteAppRoot}.`);
  }
  if (!passengerRelease) {
    throw new Error(
      `Could not resolve Passenger application for ${config.remoteAppDomain}${config.remoteAppUri}.`,
    );
  }

  console.table([
    {
      currentRelease,
      passengerRelease,
      passengerSource: application.source,
      passengerState: application.state,
      retentionCount: config.releaseRetentionCount,
    },
  ]);

  logStep(apply ? "Applying release retention" : "Planning release retention");
  const result = await enforceReleaseRetention(config, {
    apply,
    protectedPaths,
    remoteReleasesRoot,
    retainCount: config.releaseRetentionCount,
  });

  const rollbackCandidate = selectRollbackRelease(
    result.afterInventory,
    currentRelease,
  );
  console.log(
    `DEPLOY_ROLLBACK_CANDIDATE path=${rollbackCandidate?.path || "none"} status=${rollbackCandidate?.status || "none"}`,
  );

  if (!apply) {
    console.log("Dry run only. Use --apply after reviewing the retention plan.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
