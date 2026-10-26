# Production-Only Doppler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Doppler the production-only canonical configuration source with explicit least-privilege config selection, a value-free public key contract, and redacted validation.

**Architecture:** A single JavaScript contract module defines every supported environment key, its primary section, approved Doppler configs, and sensitivity. A validator checks `.env.example`, rejects deprecated aliases and accidental values, and can compare names-only inventories returned by `doppler secrets --only-names --json`. A small runner constructs explicit `doppler run --project sismosmart-web --config <name>` commands so production-capable npm scripts never depend on hidden directory configuration.

**Tech Stack:** Node.js 22, ECMAScript modules, Node test runner, Doppler CLI, npm scripts, YAML.

## Global Constraints

- The only Doppler project is `sismosmart-web`.
- Approved configs are exactly `ci`, `prd_app`, `prd_deploy`, and `prd_ops`.
- No local-development or implicit production config is allowed.
- No secret value, fingerprint, prefix, length, private endpoint, account identity, username, or private filesystem path may be logged or committed.
- `.env.example` is a value-free schema; a persistent `.env` is unsupported after migration validation.
- GitHub Actions authentication changes remain outside this plan and belong to issue #8.
- Removal of the retired secondary automation surface remains outside this plan and belongs to issue #10.
- Existing deployment behavior must remain unchanged until those downstream issues are completed.

---

### Task 1: Define and test the canonical Doppler contract

**Files:**
- Create: `config/doppler-contract.mjs`
- Create: `tests/doppler-contract.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `DOPPLER_PROJECT`, `DOPPLER_CONFIGS`, `ENVIRONMENT_CONTRACT`, `LEGACY_ENV_KEYS`, `EPHEMERAL_PROVIDER_KEYS`, `contractKeysForConfig(config)`.
- Consumes: no previous task output.

- [ ] **Step 1: Write failing contract tests**

Create tests that import `config/doppler-contract.mjs` and assert:

```js
assert.equal(DOPPLER_PROJECT, "sismosmart-web");
assert.deepEqual(DOPPLER_CONFIGS, ["ci", "prd_app", "prd_deploy", "prd_ops"]);
assert.equal(ENVIRONMENT_CONTRACT.GOOGLE_MEASUREMENT_PROTOCOL_API_SECRET.classification, "secret");
assert.ok(ENVIRONMENT_CONTRACT.GOOGLE_MEASUREMENT_PROTOCOL_API_SECRET.configs.includes("prd_ops"));
assert.equal(new Set(Object.keys(ENVIRONMENT_CONTRACT)).size, Object.keys(ENVIRONMENT_CONTRACT).length);
```

Also assert every entry has one approved `primaryConfig`, at least one approved config, and a classification in `public`, `secret`, `conditional`, or `policy`.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test tests/doppler-contract.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `config/doppler-contract.mjs`.

- [ ] **Step 3: Implement the contract module**

Use a frozen object whose entries have this exact shape:

```js
GOOGLE_MEASUREMENT_PROTOCOL_API_SECRET: {
  primaryConfig: "prd_ops",
  configs: ["prd_ops"],
  classification: "secret",
  required: false,
},
```

Include every key currently supported by `.env.example`, replacing the two legacy measurement-protocol aliases with `GOOGLE_MEASUREMENT_PROTOCOL_API_SECRET`. Define the legacy aliases only in `LEGACY_ENV_KEYS` so consumers cannot use them accidentally.

- [ ] **Step 4: Add the test to the repository test command**

Insert `tests/doppler-contract.test.mjs` into both `test` and `test:coverage` scripts immediately after `tests/repository-contract.test.mjs`.

- [ ] **Step 5: Run focused and repository tests**

Run:

```bash
node --test tests/doppler-contract.test.mjs
npm test
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add config/doppler-contract.mjs tests/doppler-contract.test.mjs package.json
git commit -m "feat: define production Doppler contract"
```

### Task 2: Add redacted schema validation and migrate the public examples

**Files:**
- Create: `scripts/ops/validate-doppler-contract.mjs`
- Modify: `tests/doppler-contract.test.mjs`
- Modify: `.env.example`
- Modify: `tests/repository-contract.test.mjs`

**Interfaces:**
- Consumes: exports from `config/doppler-contract.mjs`.
- Produces: `parseEnvSchema(content)`, `validatePublicSchema(content)`, `validateInventory(config, names)`, and CLI exit behavior that prints key names/counts only.

- [ ] **Step 1: Write failing validator tests**

Add tests proving that the validator:

```js
assert.throws(() => validatePublicSchema("# [ci]\nTOKEN=real-value\n"), /must be empty/);
assert.throws(() => validatePublicSchema("# [ci]\nDOMAIN=\nDOMAIN=\n"), /Duplicate key/);
assert.throws(() => validateInventory("prd_ops", ["UNKNOWN_KEY"]), /Unknown key/);
assert.doesNotThrow(() => validateInventory("prd_ops", contractKeysForConfig("prd_ops")));
```

Capture validator CLI output for a missing key and assert it contains the key name but no environment value.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
node --test tests/doppler-contract.test.mjs
```

Expected: FAIL because `scripts/ops/validate-doppler-contract.mjs` does not exist.

- [ ] **Step 3: Implement the validator**

The validator must:

- parse section markers `# [ci]`, `# [prd_app]`, `# [prd_deploy]`, and `# [prd_ops]`;
- reject values other than an empty string;
- reject duplicate, missing, unknown, or legacy keys;
- verify each key appears under its declared `primaryConfig`;
- compare names-only Doppler inventories without accepting or printing values;
- invoke `doppler secrets --project sismosmart-web --config <config> --only-names --json` only when passed `--doppler <config>`;
- print only config names, key names, and counts;
- fail before spawning Doppler for an unapproved config.

- [ ] **Step 4: Rewrite `.env.example` as a value-free ownership schema**

Use four section markers. Every assignment remains blank. Replace the old local `.env` instruction with:

```text
# Public key-name schema only. Do not create a persistent .env file.
# Values are managed in Doppler project sismosmart-web.
```

Use only `GOOGLE_MEASUREMENT_PROTOCOL_API_SECRET` for measurement protocol authentication.

- [ ] **Step 5: Confirm provider-independent inputs**

Confirm active GitHub workflows and repository scripts use `GOOGLE_MEASUREMENT_PROTOCOL_API_SECRET` and no retired compatibility input remains.

- [ ] **Step 6: Update repository contract expectations**

Replace the old measurement-protocol key with `GOOGLE_MEASUREMENT_PROTOCOL_API_SECRET` and assert the public schema warns against a persistent `.env`.

- [ ] **Step 7: Run validation and tests**

Run:

```bash
node scripts/ops/validate-doppler-contract.mjs
node --test tests/doppler-contract.test.mjs tests/repository-contract.test.mjs
npm test
```

Expected: PASS; output contains key names/counts only.

- [ ] **Step 8: Commit**

```bash
git add config/doppler-contract.mjs scripts/ops/validate-doppler-contract.mjs tests/doppler-contract.test.mjs tests/repository-contract.test.mjs .env.example
git commit -m "feat: validate redacted Doppler key schema"
```

### Task 3: Enforce explicit config selection in repository commands

**Files:**
- Create: `scripts/doppler/run.mjs`
- Modify: `tests/doppler-contract.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `DOPPLER_PROJECT` and `DOPPLER_CONFIGS`.
- Produces: `buildDopplerArgs(config, command)` and CLI wrappers for approved configs.

- [ ] **Step 1: Write failing runner tests**

Test the exact argument construction:

```js
assert.deepEqual(buildDopplerArgs("prd_ops", ["npm", "run", "ops:status"]), [
  "run", "--project", "sismosmart-web", "--config", "prd_ops", "--",
  "npm", "run", "ops:status",
]);
assert.throws(() => buildDopplerArgs("main", ["npm", "test"]), /Unsupported Doppler config/);
assert.throws(() => buildDopplerArgs("ci", []), /command is required/);
```

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
node --test tests/doppler-contract.test.mjs
```

Expected: FAIL because `scripts/doppler/run.mjs` does not exist.

- [ ] **Step 3: Implement the runner**

Use `spawnSync("doppler", args, { stdio: "inherit", env: process.env })`. Do not use a shell and do not print environment variables. Exit with the child status or `1` when the executable cannot start.

- [ ] **Step 4: Add explicit npm entry points**

Add these scripts:

```json
"doppler:check": "node scripts/ops/validate-doppler-contract.mjs",
"doppler:ci": "node scripts/doppler/run.mjs ci -- npm run verify:ci",
"doppler:ops:status": "node scripts/doppler/run.mjs prd_ops -- npm run ops:status",
"doppler:deploy:validate": "node scripts/doppler/run.mjs prd_deploy -- npm run deploy:validate",
"doppler:runtime-env": "node scripts/doppler/run.mjs prd_app -- npm run deploy:runtime-env",
"verify:ci": "npm run lint && npm run typecheck && npm test && npm run build"
```

Do not change existing deployment workflow secret wiring.

- [ ] **Step 5: Run focused tests and argument smoke checks**

Run:

```bash
node --test tests/doppler-contract.test.mjs
npm run doppler:check
```

Expected: PASS. Do not run a production config without authorization during this step.

- [ ] **Step 6: Commit**

```bash
git add scripts/doppler/run.mjs tests/doppler-contract.test.mjs package.json
git commit -m "feat: require explicit Doppler configs"
```

### Task 4: Add production-safe Doppler setup and public runbooks

**Files:**
- Create: `doppler.yaml`
- Modify: `docs/secrets-and-observability.md`
- Modify: `docs/operations/production-deployment.md`
- Modify: `README.md`
- Modify: `tests/doppler-contract.test.mjs`
- Modify: `docs/superpowers/specs/2026-07-22-production-only-doppler-design.md`

**Interfaces:**
- Consumes: npm scripts from Task 3.
- Produces: public operator documentation with explicit config selection.

- [ ] **Step 1: Write failing documentation-contract tests**

Assert that:

- `doppler.yaml` contains project `sismosmart-web` and no `config:` field;
- production examples use the npm wrappers or both `--project sismosmart-web` and an approved `--config`;
- no docs recommend `doppler setup --config main`, bare `doppler run --`, or creating `.env`;
- the migration design no longer presents either legacy measurement alias as a supported key.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
node --test tests/doppler-contract.test.mjs
```

Expected: FAIL because `doppler.yaml` is missing and docs still reference `main` and bare `doppler run`.

- [ ] **Step 3: Add project-only `doppler.yaml`**

Create exactly:

```yaml
setup:
  - project: sismosmart-web
```

Do not add a `config` field.

- [ ] **Step 4: Rewrite the Doppler runbook**

Document the four configs, ownership boundaries, explicit commands, names-only validation, fallback behavior, credential rotation requirement, and the rule that CI/workflow migration remains in #8/#10. Remove private provider account names and internal details not required by public operators.

- [ ] **Step 5: Update deployment and README guidance**

Use `npm run doppler:deploy:validate`, `npm run doppler:runtime-env`, and `npm run doppler:ops:status` in relevant examples. State that no persistent `.env` is required.

- [ ] **Step 6: Update the approved design to record canonical naming**

Describe the replaced names as “legacy measurement-protocol aliases” and retain only `GOOGLE_MEASUREMENT_PROTOCOL_API_SECRET` as the current contract name.

- [ ] **Step 7: Run focused and repository tests**

Run:

```bash
node --test tests/doppler-contract.test.mjs tests/repository-contract.test.mjs
npm test
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add doppler.yaml docs/secrets-and-observability.md docs/operations/production-deployment.md README.md tests/doppler-contract.test.mjs docs/superpowers/specs/2026-07-22-production-only-doppler-design.md
git commit -m "docs: adopt production-only Doppler workflow"
```

### Task 5: Verify runtime-file safety and full quality gates

**Files:**
- Modify only if tests expose a defect: `scripts/deploy/runtime-env.mjs`
- Modify only if tests expose a defect: relevant deployment test files.

**Interfaces:**
- Consumes: completed contract, validator, runner, and documentation.
- Produces: verified branch ready for review.

- [ ] **Step 1: Run the runtime environment safety tests**

Run:

```bash
node --test tests/deploy-control-path.test.mjs tests/forms-forwarding.test.mjs
```

Expected: PASS and assertions cover the runtime allowlist and mode `0600`.

- [ ] **Step 2: Scan for unsupported key usage and accidental secret files**

Run:

```bash
npm run doppler:check
find . -maxdepth 2 -type f \( -name '.env' -o -name '.env.local' -o -name '.env.production' \) -print
```

Expected: validator PASS and no files printed by `find`.

- [ ] **Step 3: Run all static and automated gates**

Run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Expected: every command exits `0`.

- [ ] **Step 4: Run secret scanning on the staged diff**

Run the repository's configured secret scanner or, when unavailable:

```bash
git diff --cached --check
git grep -n -E '(gh[pousr]_|doppler_[A-Za-z0-9]|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY)' -- ':!package-lock.json'
```

Expected: no credential material.

- [ ] **Step 5: Commit any verification-only correction**

Only when Task 5 exposed a real defect:

```bash
git add <exact corrected files>
git commit -m "fix: preserve Doppler runtime safety"
```

### Task 6: Perform authorized operational migration without exposing values

**Files:**
- No repository files unless documentation corrections are required.
- Local secret files must never be added to Git.

**Interfaces:**
- Consumes: validated repository contract and an authorized Doppler session.
- Produces: four verified Doppler configs and removal of persistent local `.env`.

- [ ] **Step 1: Restrict the existing secret file before any migration command**

Run as its owning account:

```bash
umask 077
chmod 0600 .env
```

Expected: `stat -c '%a' .env` returns `600`. Do not print file contents.

- [ ] **Step 2: Create target configs in the Doppler dashboard or authorized CLI**

Create exactly `ci`, `prd_app`, `prd_deploy`, and `prd_ops` under project `sismosmart-web`. Do not create a local-development config.

- [ ] **Step 3: Copy values from the temporary migration config using Doppler's protected UI/API**

Map names according to `config/doppler-contract.mjs`. Rename the measurement-protocol key to `GOOGLE_MEASUREMENT_PROTOCOL_API_SECRET`. Do not use shell tracing and do not echo values.

- [ ] **Step 4: Validate names only**

Run separately for every config:

```bash
node scripts/ops/validate-doppler-contract.mjs --doppler ci
node scripts/ops/validate-doppler-contract.mjs --doppler prd_app
node scripts/ops/validate-doppler-contract.mjs --doppler prd_deploy
node scripts/ops/validate-doppler-contract.mjs --doppler prd_ops
```

Expected: PASS with names/counts only.

- [ ] **Step 5: Run read-only production checks**

Run:

```bash
npm run doppler:ops:status
npm run doppler:deploy:validate
```

Expected: production status succeeds and deployment validation completes without activation.

- [ ] **Step 6: Validate protected runtime generation**

Run the runtime command in dry-run mode first, then apply only under an approved maintenance action. Confirm the generated runtime file is outside the public root and has mode `0600` without printing it.

- [ ] **Step 7: Rotate affected credentials and remove the persistent file**

Rotate credentials that were present in the previously over-permissive file. After every consumer is verified, securely remove `.env` and confirm production still works through Doppler.

- [ ] **Step 8: Disable the broad migration config after issues #8 and #10 complete**

Retain it only as a temporary rollback source until GitHub Actions uses scoped authentication.

### Task 7: Publish for review and process agent feedback

**Files:**
- No additional source files expected.

- [ ] **Step 1: Review the complete branch diff**

Run:

```bash
git status --short
git log --oneline --decorate -8
git diff main...HEAD --stat
git diff main...HEAD --check
```

Expected: only intended public files and no whitespace errors.

- [ ] **Step 2: Push with the authorized SismoSmart identity**

```bash
git push --set-upstream origin feat/issue-3-production-only-doppler
```

- [ ] **Step 3: Open a pull request linked to issue #3**

The PR body must summarize the contract, tests, production safety, deferred #8/#10 scope, operational migration status, and verification evidence. It must not contain credential or infrastructure details.

- [ ] **Step 4: Review bot and agent feedback before merge**

Inspect every bot/agent review, security finding, dependency comment, and CI annotation. Resolve or explicitly document each item before approval and merge.
