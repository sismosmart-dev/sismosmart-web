import {
  requireConfig,
  requireSshAuth,
  logStep,
  toRemoteAbsolutePath,
} from "./config.mjs";
import { getApplications, runRemoteCommand } from "./helpers.mjs";

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
    "remoteAppUri",
    "remoteNodeVersion",
  ]);
  requireSshAuth(config);
  const remoteAppRoot = toRemoteAbsolutePath(config, config.remoteAppRoot);

  const applications = await getApplications(config);
  const alreadyRegistered = applications.some(
    (app) => app.domain === config.remoteAppDomain && app.uri === config.remoteAppUri,
  );

  if (alreadyRegistered) {
    logStep("Node application is already registered");
    return;
  }

  logStep("Registering Node.js application through CloudLinux selector");
  await runRemoteCommand(
    config,
    [
      "cloudlinux-selector create --json --interpreter nodejs",
      `--domain ${shellEscape(config.remoteAppDomain)}`,
      `--app-root ${shellEscape(remoteAppRoot)}`,
      `--app-uri ${shellEscape(config.remoteAppUri)}`,
      `--version ${shellEscape(config.remoteNodeVersion)}`,
      "--app-mode production",
      "--startup-file app.js",
    ].join(" "),
  );

  console.log("Node application registration completed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
