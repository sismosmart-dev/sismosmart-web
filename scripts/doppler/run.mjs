import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

import {
  DOPPLER_CONFIGS,
  DOPPLER_PROJECT,
} from "../../config/doppler-contract.mjs";

export function buildDopplerArgs(config, command) {
  if (!DOPPLER_CONFIGS.includes(config)) {
    throw new Error(`Unsupported Doppler config: ${config}`);
  }
  if (!Array.isArray(command) || command.length === 0) {
    throw new Error("A command is required after --.");
  }

  return [
    "run",
    "--project",
    DOPPLER_PROJECT,
    "--config",
    config,
    "--",
    ...command,
  ];
}

function main() {
  const [config, separator, ...command] = process.argv.slice(2);
  if (separator !== "--") {
    throw new Error("Usage: node scripts/doppler/run.mjs <config> -- <command> [args...]");
  }

  const result = spawnSync("doppler", buildDopplerArgs(config, command), {
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    throw new Error("Doppler CLI could not be started.");
  }
  process.exitCode = Number.isInteger(result.status) ? result.status : 1;
}

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isDirectRun) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Doppler command failed.");
    process.exitCode = 1;
  }
}
