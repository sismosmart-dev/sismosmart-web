import { validateCmsRuntimeConfiguration } from "../scripts/deploy/cms-runtime-contract.mjs";
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
  assert.deepEqual(DOPPLER_CONFIGS, ["main"]);
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

test("single main config registers disabled CMS keys without requiring activation", () => {
  for (const key of ["CMS_DB_ENABLED", "CMS_WRITE_ENABLED", "CMS_DB_HOST", "CMS_DB_NAME", "CMS_DB_USER", "CMS_DB_PASSWORD", "CMS_DB_PORT", "CMS_ADMIN_TOKEN"]) {
    assert.equal(ENVIRONMENT_CONTRACT[key].primaryConfig, "main");
    assert.equal(ENVIRONMENT_CONTRACT[key].required, false);
    assert.ok(contractKeysForConfig("main").includes(key));
  }
  assert.equal(ENVIRONMENT_CONTRACT.CMS_ADMIN_TOKEN.classification, "secret");
  assert.equal(ENVIRONMENT_CONTRACT.CMS_DB_PASSWORD.classification, "secret");
});

test("measurement protocol authentication uses one canonical secret key", () => {
  const entry = ENVIRONMENT_CONTRACT.GOOGLE_MEASUREMENT_PROTOCOL_API_SECRET;
  assert.equal(entry.classification, "secret");
  assert.deepEqual(entry.configs, ["main"]);
  assert.ok(contractKeysForConfig("main").includes("GOOGLE_MEASUREMENT_PROTOCOL_API_SECRET"));
});

test("retired DNS origin evidence is optional in main", () => {
  const entry = ENVIRONMENT_CONTRACT.DNS_LEGACY_IPV4;
  assert.equal(entry.primaryConfig, "main");
  assert.deepEqual(entry.configs, ["main"]);
  assert.equal(entry.required, false);
});

test("all historical measurement protocol aliases are rejected", () => {
  assert.deepEqual(LEGACY_ENV_KEYS, [
    "MeasurementProtocolAPI",
    "MEASUREMENTPROTOCOLAPI",
  ]);
  for (const alias of LEGACY_ENV_KEYS) {
    assert.throws(
      () => validateInventory("main", [alias]),
      new RegExp(`Deprecated key: ${alias}`),
    );
  }
});


test("public env schema rejects values, duplicates, and unsupported config sections", () => {
  assert.throws(
    () => validatePublicSchema("# [main]\nPUBLIC_BASE_URL=not-public\n"),
    (error) => {
      assert.match(error.message, /PUBLIC_BASE_URL must be empty/);
      assert.doesNotMatch(error.message, /not-public/);
      return true;
    },
  );

  assert.throws(
    () => validatePublicSchema("# [main]\nPUBLIC_BASE_URL=\nPUBLIC_BASE_URL=\n"),
    /Duplicate key: PUBLIC_BASE_URL/,
  );

  assert.throws(
    () => validatePublicSchema("# [legacy]\nPUBLIC_BASE_URL=\n"),
    /approved config section/,
  );
});

test("env schema parser records key names and ownership without retaining values", () => {
  const parsed = parseEnvSchema("# [main]\nPUBLIC_BASE_URL=should-not-survive\n");
  assert.deepEqual(parsed.entries.map(({ key, section }) => ({ key, section })), [
    { key: "PUBLIC_BASE_URL", section: "main" },
  ]);
  assert.equal("value" in parsed.entries[0], false);
});

test("Doppler inventory validation is names-only and fails closed", () => {
  assert.throws(() => validateInventory("main", ["UNKNOWN_KEY"]), /Unknown key: UNKNOWN_KEY/);
  assert.throws(
    () => validateInventory("main", []),
    /Missing required key: /,
  );

  const names = contractKeysForConfig("main");
  assert.doesNotThrow(() => validateInventory("main", names));
});


test("Doppler runner always includes explicit project and approved config", () => {
  assert.deepEqual(
    buildDopplerArgs("main", ["npm", "run", "ops:status"]),
    [
      "run",
      "--project",
      "sismosmart-web",
      "--config",
      "main",
      "--",
      "npm",
      "run",
      "ops:status",
    ],
  );
  assert.throws(
    () => buildDopplerArgs("ci", ["npm", "test"]),
    /Unsupported Doppler config: ci/,
  );
  assert.throws(
    () => buildDopplerArgs("main", []),
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

  assert.match(secrets, /`main`/);
  assert.match(combined, /npm run doppler:deploy:validate/);
  assert.match(combined, /npm run doppler:runtime-env/);
  assert.match(combined, /npm run doppler:ops:status/);
  assert.doesNotMatch(combined, /doppler setup[^\n]*--config prd_ops/);
  assert.doesNotMatch(combined, /doppler run -- npm/);
  assert.doesNotMatch(combined, /create a persistent \.env/i);
  assert.doesNotMatch(design, /MeasurementProtocolAPI|MEASUREMENTPROTOCOLAPI/);
});


test("runtime environment writer uses a strict allowlist and mode 0600", () => {
  assert.equal(RUNTIME_ENV_MODE, "0600");
  assert.deepEqual(runtimeEnvKeys, [
    "CMS_ADMIN_TOKEN",
    "CMS_DB_ENABLED",
    "CMS_DB_HOST",
    "CMS_DB_NAME",
    "CMS_DB_PASSWORD",
    "CMS_DB_PORT",
    "CMS_DB_USER",
    "CMS_WRITE_ENABLED",
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

test("CMS runtime remains off by default and accepts staged disabled credentials", () => {
  assert.doesNotThrow(() => validateCmsRuntimeConfiguration({}));
  assert.doesNotThrow(() => validateCmsRuntimeConfiguration({
    CMS_DB_ENABLED: "false", CMS_WRITE_ENABLED: "false", CMS_DB_HOST: "localhost",
  }));
});

test("CMS read-only and write modes require complete safe local SQL configuration", () => {
  const base = {
    CONTACT_FORM_ENDPOINT: "https://forms.example/contact",
    WAITLIST_FORM_ENDPOINT: "https://forms.example/waitlist",
    CMS_DB_ENABLED: "true",
    CMS_WRITE_ENABLED: "false",
    CMS_DB_HOST: "localhost",
    CMS_DB_USER: "cms_scoped",
    CMS_DB_PASSWORD: "test-only-password",
    CMS_DB_NAME: "cms_test",
  };
  assert.doesNotThrow(() => validateCmsRuntimeConfiguration(base));
  assert.ok(buildRuntimeEnv(base).keys.includes("CMS_DB_ENABLED"));

  for (const key of ["CMS_DB_HOST", "CMS_DB_USER", "CMS_DB_PASSWORD", "CMS_DB_NAME"]) {
    assert.throws(() => validateCmsRuntimeConfiguration({ ...base, [key]: "" }), /CMS_RUNTIME_MISSING_KEYS/);
  }
  assert.throws(() => validateCmsRuntimeConfiguration({ ...base, CMS_DB_HOST: "db.example.test" }), /CMS_RUNTIME_DATABASE_MUST_BE_LOCAL/);
  assert.throws(() => validateCmsRuntimeConfiguration({ ...base, CMS_DB_PORT: "3306;test" }), /CMS_RUNTIME_INVALID_DB_PORT/);
  assert.throws(() => validateCmsRuntimeConfiguration({ ...base, CMS_DB_PORT: "65536" }), /CMS_RUNTIME_INVALID_DB_PORT/);
  assert.throws(() => validateCmsRuntimeConfiguration({ ...base, CMS_DB_ENABLED: "TRUE" }), /CMS_RUNTIME_INVALID_FLAG/);
  assert.throws(() => validateCmsRuntimeConfiguration({ ...base, CMS_WRITE_ENABLED: "enabled" }), /CMS_RUNTIME_INVALID_FLAG/);
  assert.throws(() => validateCmsRuntimeConfiguration({ ...base, CMS_DB_ENABLED: "false", CMS_WRITE_ENABLED: "true" }), /CMS_RUNTIME_WRITE_REQUIRES_DB/);

  assert.throws(() => buildRuntimeEnv({ ...base, CMS_DB_PASSWORD: "" }), /CMS_RUNTIME_MISSING_KEYS/);
  assert.throws(() => validateCmsRuntimeConfiguration({ ...base, CMS_WRITE_ENABLED: "true" }), /CMS_RUNTIME_INVALID_ADMIN_TOKEN/);
  assert.throws(() => validateCmsRuntimeConfiguration({ ...base, CMS_WRITE_ENABLED: "true", CMS_ADMIN_TOKEN: "short" }), /CMS_RUNTIME_INVALID_ADMIN_TOKEN/);
  assert.throws(() => validateCmsRuntimeConfiguration({ ...base, CMS_WRITE_ENABLED: "true", CMS_ADMIN_TOKEN: "x".repeat(32) + " " }), /CMS_RUNTIME_INVALID_ADMIN_TOKEN/);
  assert.doesNotThrow(() => validateCmsRuntimeConfiguration({ ...base, CMS_WRITE_ENABLED: "true", CMS_ADMIN_TOKEN: "x".repeat(48) }));
});

test("both runtime deployment paths enforce the CMS preflight before writing credentials", () => {
  const prepare = readFileSync("scripts/deploy/prepare-standalone.mjs", "utf8");
  const runtime = readFileSync("scripts/deploy/runtime-env.mjs", "utf8");
  assert.match(prepare, /WRITE_RUNTIME_ENV_FILE === "true"\) validateCmsRuntimeConfiguration\(process.env\)/);
  assert.match(runtime, /buildRuntimeEnv\(environment = process.env\) \{\s+validateCmsRuntimeConfiguration\(environment\)/);
});
