import {
  logStep,
  requireConfig,
  requireSshAuth,
  toRemoteAbsolutePath,
} from "./config.mjs";
import { getApplications, runRemoteCommand } from "./helpers.mjs";

function shellEscape(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

async function readRemotePath(config, command) {
  const { stdout } = await runRemoteCommand(config, command);
  return stdout.trim();
}

async function main() {
  const apply = process.argv.includes("--apply");
  const config = requireConfig([
    "sshHost",
    "sshUser",
    "domain",
    "remoteAppDomain",
    "remoteHome",
    "remoteAppRoot",
    "remoteAppUri",
  ]);
  requireSshAuth(config);

  const remoteAppRoot = toRemoteAbsolutePath(config, config.remoteAppRoot);
  const applications = await getApplications(config);
  const application = applications.find(
    (candidate) =>
      candidate.domain === config.remoteAppDomain &&
      candidate.uri === config.remoteAppUri &&
      candidate.appRoot,
  );

  if (!application?.appRoot) {
    throw new Error(
      `No Passenger/CloudLinux application found for ${config.remoteAppDomain}${config.remoteAppUri}.`,
    );
  }

  const currentRelease = await readRemotePath(
    config,
    `readlink -f ${shellEscape(remoteAppRoot)} 2>/dev/null || true`,
  );
  const passengerRelease = application.appRoot;

  console.table([
    {
      current: currentRelease || "missing",
      passenger: passengerRelease,
      source: application.source,
      state: application.state,
    },
  ]);

  if (currentRelease === passengerRelease) {
    console.log("Production release pointers are already consistent.");
    return;
  }

  const buildId = await readRemotePath(
    config,
    `test -d ${shellEscape(passengerRelease)} && test -f ${shellEscape(
      `${passengerRelease}/.next/BUILD_ID`,
    )} && cat ${shellEscape(`${passengerRelease}/.next/BUILD_ID`)}`,
  );

  if (!apply) {
    console.log(
      `Dry run: current would be changed to ${passengerRelease} (BUILD_ID ${buildId}).`,
    );
    console.log("Run again with --apply to perform the reconciliation.");
    return;
  }

  logStep(`Aligning current symlink to active Passenger release ${passengerRelease}`);
  const { stdout } = await runRemoteCommand(
    config,
    [
      `ln -sfn ${shellEscape(passengerRelease)} ${shellEscape(remoteAppRoot)}`,
      "&&",
      `resolved=$(readlink -f ${shellEscape(remoteAppRoot)})`,
      "&&",
      `test \"$resolved\" = ${shellEscape(passengerRelease)}`,
      "&&",
      "printf '%s\\n' \"$resolved\"",
    ].join(" "),
  );

  console.log(`Reconciled current symlink: ${stdout.trim()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
