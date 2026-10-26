import { logStep, requireConfig, requireSshAuth } from "./config.mjs";
import { getApplications } from "./helpers.mjs";

async function main() {
  const config = requireSshAuth(
    requireConfig(["sshHost", "sshUser", "remoteHome"]),
  );

  logStep("Fetching Node application status");
  const applications = await getApplications(config);

  if (applications.length === 0) {
    console.log("No Passenger applications are registered yet.");
    return;
  }

  console.table(
    applications.map((app) => ({
      source: app.source,
      domain: app.domain ?? "unknown",
      uri: app.uri ?? "/",
      appRoot: app.appRoot ?? "unknown",
      state: app.state ?? "unknown",
    })),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
