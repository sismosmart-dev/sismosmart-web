import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

import {
  DOPPLER_CONFIGS,
  DOPPLER_PROJECT,
  ENVIRONMENT_CONTRACT,
  LEGACY_ENV_KEYS,
  contractKeysForConfig,
} from "../../config/doppler-contract.mjs";

const SECTION_PATTERN = /^#\s*\[(ci|prd_app|prd_deploy|prd_ops)]\s*$/;
const KEY_PATTERN = /^[A-Z][A-Z0-9_]*$/;
const DOPPLER_MANAGED_KEYS = new Set([
  "DOPPLER_CONFIG",
  "DOPPLER_ENVIRONMENT",
  "DOPPLER_PROJECT",
]);

function fail(message) {
  throw new Error(message);
}

export function parseEnvSchema(content) {
  let section = null;
  const entries = [];
  const nonEmptyKeys = [];

  for (const [index, rawLine] of String(content).split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line) continue;

    const sectionMatch = line.match(SECTION_PATTERN);
    if (sectionMatch) {
      section = sectionMatch[1];
      continue;
    }
    if (line.startsWith("#")) continue;

    const separator = rawLine.indexOf("=");
    if (separator < 1) fail(`Invalid schema line ${index + 1}.`);

    const key = rawLine.slice(0, separator).trim();
    if (!KEY_PATTERN.test(key)) fail(`Invalid key name on line ${index + 1}.`);
    if (!section) fail(`${key} must be declared under an approved config section.`);

    if (rawLine.slice(separator + 1) !== "") nonEmptyKeys.push(key);
    entries.push({ key, section, lineNumber: index + 1 });
  }

  return Object.freeze({
    entries: Object.freeze(entries),
    nonEmptyKeys: Object.freeze(nonEmptyKeys),
  });
}

export function validatePublicSchema(content) {
  const parsed = parseEnvSchema(content);
  const seen = new Set();

  for (const key of parsed.nonEmptyKeys) {
    fail(`${key} must be empty in .env.example.`);
  }

  for (const { key, section } of parsed.entries) {
    if (seen.has(key)) fail(`Duplicate key: ${key}`);
    seen.add(key);

    if (LEGACY_ENV_KEYS.includes(key)) fail(`Deprecated key: ${key}`);
    const contract = ENVIRONMENT_CONTRACT[key];
    if (!contract) fail(`Unknown key: ${key}`);
    if (contract.primaryConfig !== section) {
      fail(`${key} must be declared under [${contract.primaryConfig}].`);
    }
  }

  const missing = Object.keys(ENVIRONMENT_CONTRACT)
    .filter((key) => !seen.has(key))
    .sort();
  if (missing.length > 0) fail(`Missing key: ${missing[0]}`);

  return Object.freeze({
    total: seen.size,
    sections: Object.freeze(
      Object.fromEntries(
        DOPPLER_CONFIGS.map((config) => [
          config,
          parsed.entries.filter(({ section }) => section === config).length,
        ]),
      ),
    ),
  });
}

export function validateInventory(config, names) {
  const expected = contractKeysForConfig(config);
  const supplied = Array.isArray(names) ? names : [];
  const seen = new Set();

  for (const key of supplied) {
    if (typeof key !== "string") fail("Invalid Doppler key name.");
    if (LEGACY_ENV_KEYS.includes(key)) fail(`Deprecated key: ${key}`);
    if (!KEY_PATTERN.test(key)) fail("Invalid Doppler key name.");
    if (seen.has(key)) fail(`Duplicate key: ${key}`);
    seen.add(key);
    if (!ENVIRONMENT_CONTRACT[key] && !DOPPLER_MANAGED_KEYS.has(key)) {
      fail(`Unknown key: ${key}`);
    }
  }

  const missingRequired = expected.filter(
    (key) => ENVIRONMENT_CONTRACT[key].required && !seen.has(key),
  );
  if (missingRequired.length > 0) fail(`Missing required key: ${missingRequired[0]}`);

  return Object.freeze({
    config,
    total: supplied.filter((key) => !DOPPLER_MANAGED_KEYS.has(key)).length,
    expected: expected.length,
    missingOptional: Object.freeze(expected.filter((key) => !seen.has(key))),
  });
}

function readDopplerNames(config) {
  contractKeysForConfig(config);
  const result = spawnSync(
    "doppler",
    [
      "secrets",
      "--project",
      DOPPLER_PROJECT,
      "--config",
      config,
      "--only-names",
      "--json",
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );

  if (result.error || result.status !== 0) {
    fail(`Could not read names for Doppler config ${config}.`);
  }

  let parsed;
  try {
    parsed = JSON.parse(result.stdout);
  } catch {
    fail(`Doppler returned invalid names-only JSON for config ${config}.`);
  }

  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") return Object.keys(parsed);
  fail(`Doppler returned an unsupported names-only response for config ${config}.`);
}

function main() {
  const schema = readFileSync(".env.example", "utf8");
  const result = validatePublicSchema(schema);
  console.log(
    `Doppler public contract valid: ${result.total} key names across ${DOPPLER_CONFIGS.length} configs.`,
  );

  const dopplerIndex = process.argv.indexOf("--doppler");
  if (dopplerIndex === -1) return;
  const config = process.argv[dopplerIndex + 1];
  if (!config) fail("--doppler requires an approved config name.");

  const inventory = validateInventory(config, readDopplerNames(config));
  console.log(
    `Doppler inventory valid: ${inventory.config} has ${inventory.total} supported key names; ${inventory.missingOptional.length} optional names are absent.`,
  );
}

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isDirectRun) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Doppler contract validation failed.");
    process.exitCode = 1;
  }
}
