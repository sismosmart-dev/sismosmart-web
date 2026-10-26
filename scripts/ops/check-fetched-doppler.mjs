// Fail closed when a GitHub environment secret is absent or belongs to the
// wrong Doppler config. Do not print any environment values or token material.
import { DOPPLER_CONFIGS, DOPPLER_PROJECT, ENVIRONMENT_CONTRACT } from "../../config/doppler-contract.mjs";

export function checkFetchedDoppler(config, env = process.env) {
  if (!DOPPLER_CONFIGS.includes(config)) throw new Error("Unapproved Doppler config");
  if (env.DOPPLER_CONFIG !== config || env.DOPPLER_PROJECT !== DOPPLER_PROJECT) {
    throw new Error(`Doppler ${config} grant was not injected or targets the wrong scope`);
  }
  const missing = Object.entries(ENVIRONMENT_CONTRACT)
    .filter(([, policy]) => policy.configs.includes(config) && policy.required)
    .map(([key]) => key)
    .filter((key) => !env[key]);
  if (missing.length > 0) throw new Error(`Required Doppler ${config} key missing: ${missing.join(", ")}`);
  return true;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  try {
    checkFetchedDoppler(process.argv[2]);
    console.log(`Doppler ${process.argv[2]} scoped configuration accepted (values hidden).`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Doppler scope validation failed");
    process.exitCode = 1;
  }
}
