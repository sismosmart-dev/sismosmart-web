import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  DOPPLER_CONFIGS,
  DOPPLER_PROJECT,
  ENVIRONMENT_CONTRACT,
  LEGACY_ENV_KEYS,
  contractKeysForConfig,
} from "../config/doppler-contract.mjs";

import {
  parseEnvSchema,
  validateInventory,
  validatePublicSchema,
} from "../scripts/ops/validate-doppler-contract.mjs";

import { buildDopplerArgs } from "../scripts/doppler/run.mjs";
import {
  RUNTIME_ENV_MODE,
  buildRuntimeEnv,
  runtimeEnvKeys,
} from "../scripts/deploy/runtime-env.mjs";

test("production-only Doppler contract exposes the approved project and configs", () => {
  assert.equal(DOPPLER_PROJECT, "sismosmart-web");
  assert.deepEqual(DOPPLER_CONFIGS, ["ci", "prd_app", "prd_deploy", "prd_ops"]);
});

test("every environment key has valid least-privilege ownership metadata", () => {
  const classifications = new Set(["public", "secret", "conditional", "policy"]);
  const keys = Object.keys(ENVIRONMENT_CONTRACT);

  assert.equal(new Set(keys).size, keys.length);
  assert.ok(keys.length > 0);

  for (const [key, entry] of Object.entries(ENVIRONMENT_CONTRACT)) {
    assert.ok(DOPPLER_CONFIGS.includes(entry.primaryConfig), `${key} primary config is invalid`);
    assert.ok(Array.isArray(entry.configs) && entry.configs.length > 0, `${key} configs are required`);
    assert.ok(entry.configs.includes(entry.primaryConfig), `${key} must include its primary config`);
    assert.ok(entry.configs.every((config) => DOPPLER_CONFIGS.includes(config)), `${key} has an unsupported config`);
    assert.ok(classifications.has(entry.classification), `${key} classification is invalid`);
    assert.equal(typeof entry.required, "boolean", `${key} required must be boolean`);
  }
});

test("measurement protocol authentication uses one canonical secret key", () => {
  const entry = ENVIRONMENT_CONTRACT.GOOGLE_MEASUREMENT_PROTOCOL_API_SECRET;
  assert.equal(entry.classification, "secret");
  assert.deepEqual(entry.configs, ["prd_ops"]);
  assert.ok(contractKeysForConfig("prd_ops").includes("GOOGLE_MEASUREMENT_PROTOCOL_API_SECRET"));
});

test("retired DNS origin evidence is optional in prd_ops", () => {
  const entry = ENVIRONMENT_CONTRACT.DNS_LEGACY_IPV4;
  assert.equal(entry.primaryConfig, "prd_ops");
  assert.deepEqual(entry.configs, ["prd_ops"]);
  assert.equal(entry.required, false);
});

test("all historical measurement protocol aliases are rejected", () => {
  assert.deepEqual(LEGACY_ENV_KEYS, [
    "MeasurementProtocolAPI",
    "MEASUREMENTPROTOCOLAPI",
  ]);
  for (const alias of LEGACY_ENV_KEYS) {
    assert.throws(
      () => validateInventory("prd_ops", [alias]),
      new RegExp(`Deprecated key: ${alias}`),
    );
  }
});


test("public env schema rejects values, duplicates, and wrong ownership sections", () => {
  assert.throws(
    () => validatePublicSchema("# [ci]\nPUBLIC_BASE_URL=not-public\n"),
    (error) => {
      assert.match(error.message, /PUBLIC_BASE_URL must be empty/);
      assert.doesNotMatch(error.message, /not-public/);
      return true;
    },
  );

  assert.throws(
    () => validatePublicSchema("# [ci]\nPUBLIC_BASE_URL=\nPUBLIC_BASE_URL=\n"),
    /Duplicate key: PUBLIC_BASE_URL/,
  );

  assert.throws(
    () => validatePublicSchema("# [prd_ops]\nPUBLIC_BASE_URL=\n"),
    /PUBLIC_BASE_URL must be declared under \[ci\]/,
  );
});

test("env schema parser records key names and ownership without retaining values", () => {
  const parsed = parseEnvSchema("# [ci]\nPUBLIC_BASE_URL=should-not-survive\n");
  assert.deepEqual(parsed.entries.map(({ key, section }) => ({ key, section })), [
    { key: "PUBLIC_BASE_URL", section: "ci" },
  ]);
  assert.equal("value" in parsed.entries[0], false);
});

test("Doppler inventory validation is names-only and fails closed", () => {
  assert.throws(() => validateInventory("prd_ops", ["UNKNOWN_KEY"]), /Unknown key: UNKNOWN_KEY/);
  assert.throws(
    () => validateInventory("main", []),
    /Unsupported Doppler config: main/,
  );

  const names = contractKeysForConfig("prd_ops");
  assert.doesNotThrow(() => validateInventory("prd_ops", names));
});


test("Doppler runner always includes explicit project and approved config", () => {
  assert.deepEqual(
    buildDopplerArgs("prd_ops", ["npm", "run", "ops:status"]),
    [
      "run",
      "--project",
      "sismosmart-web",
      "--config",
      "prd_ops",
      "--",
      "npm",
      "run",
      "ops:status",
    ],
  );
  assert.throws(
    () => buildDopplerArgs("main", ["npm", "test"]),
    /Unsupported Doppler config: main/,
  );
  assert.throws(
    () => buildDopplerArgs("ci", []),
    /A command is required/,
  );
});


test("repository Doppler setup declares the project without an implicit production config", () => {
  const yaml = readFileSync("doppler.yaml", "utf8");
  assert.match(yaml, /setup:\s*\n\s*- project: sismosmart-web/);
  assert.doesNotMatch(yaml, /^\s*config:/m);
});

test("public runbooks require explicit production-only Doppler entry points", () => {
  const secrets = readFileSync("docs/secrets-and-observability.md", "utf8");
  const deployment = readFileSync("docs/operations/production-deployment.md", "utf8");
  const readme = readFileSync("README.md", "utf8");
  const design = readFileSync(
    "docs/superpowers/specs/2026-07-22-production-only-doppler-design.md",
    "utf8",
  );
  const combined = `${secrets}\n${deployment}\n${readme}`;

  assert.match(secrets, /`ci`/);
  assert.match(secrets, /`prd_app`/);
  assert.match(secrets, /`prd_deploy`/);
  assert.match(secrets, /`prd_ops`/);
  assert.match(combined, /npm run doppler:deploy:validate/);
  assert.match(combined, /npm run doppler:runtime-env/);
  assert.match(combined, /npm run doppler:ops:status/);
  assert.doesNotMatch(combined, /doppler setup[^\n]*--config main/);
  assert.doesNotMatch(combined, /doppler run -- npm/);
  assert.doesNotMatch(combined, /create a persistent \.env/i);
  assert.doesNotMatch(design, /MeasurementProtocolAPI|MEASUREMENTPROTOCOLAPI/);
});


test("runtime environment writer uses a strict allowlist and mode 0600", () => {
  assert.equal(RUNTIME_ENV_MODE, "0600");
  assert.deepEqual(runtimeEnvKeys, [
    "CONTACT_FORM_ENDPOINT",
    "FORM_FORWARD_AUTH_TOKEN",
    "NEXT_PUBLIC_CLARITY_ID",
    "NEXT_PUBLIC_GA_ID",
    "NEXT_PUBLIC_GTM_ID",
    "SENTRY_DSN",
    "WAITLIST_FORM_ENDPOINT",
  ]);

  const result = buildRuntimeEnv({
    CONTACT_FORM_ENDPOINT: "https://forms.example/contact",
    WAITLIST_FORM_ENDPOINT: "https://forms.example/waitlist",
    FORM_FORWARD_AUTH_TOKEN: "test-only-token",
    EXTRA_SECRET: "must-not-be-written",
  });

  assert.deepEqual(result.keys, [
    "CONTACT_FORM_ENDPOINT",
    "FORM_FORWARD_AUTH_TOKEN",
    "WAITLIST_FORM_ENDPOINT",
  ]);
  assert.doesNotMatch(result.content, /EXTRA_SECRET|must-not-be-written/);
});
