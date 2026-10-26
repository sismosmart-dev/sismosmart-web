import process from "node:process";

import { getAnalyticsIdentifiers } from "./analytics-config.mjs";
import { getCommandUsage, parseCliArgs, printJson } from "./config.mjs";

const usage = getCommandUsage("ops:clarity", ["status", "api-surface"]);

function runStatus() {
  const identifiers = getAnalyticsIdentifiers();
  printJson({
    installedClientId: identifiers.clarityId,
    configuredProjectId: identifiers.clarityProjectId,
    exportTokenConfigured: Boolean(process.env.CLARITY_EXPORT_TOKEN),
    managementAutomation: {
      publicProjectCreationApi: false,
      publicTeamManagementApi: false,
      note: "Clarity supports client-side APIs, consent, identify, custom tags and data export, but project bootstrap is still effectively a UI step.",
    },
  });
}

function runApiSurface() {
  printJson({
    supportedNow: [
      "Client API via window.clarity(...)",
      "Consent API / Consent V2",
      "Identify API",
      "Custom tags",
      "Export API once token is created in Clarity",
    ],
    notPubliclyAutomatedInThisRepo: [
      "Create Clarity project",
      "Create tracking code via management API",
      "Team and permission provisioning",
    ],
    nextStep: "When you give me a Clarity export token, I can automate export/reporting workflows too.",
  });
}

async function main() {
  const { positional } = parseCliArgs();
  const [command = "status"] = positional;

  switch (command) {
    case "status":
      runStatus();
      break;
    case "api-surface":
      runApiSurface();
      break;
    case "help":
    case "--help":
    case "-h":
      console.log(usage);
      break;
    default:
      throw new Error(`Unknown Clarity command: ${command}\n\n${usage}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
