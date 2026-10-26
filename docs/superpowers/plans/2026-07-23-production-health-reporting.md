# Production Health Reporting Modularization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move production-health report formatting and persistence into a focused module while preserving the runtime API, report schema, privacy behavior, console output, artifact permissions, and CLI exit behavior.

**Architecture:** Add `scripts/ops/production-health-report.mjs` for safe log formatting, Markdown formatting, workflow-command escaping, and filesystem output. Keep `scripts/ops/production-health.mjs` as the probe/orchestration entry point and re-export `formatSafeLogSummary` for compatibility.

**Tech Stack:** Node.js ESM, built-in filesystem/path/process modules, existing production-health library, Node test runner, no new dependencies.

## Global constraints

- Parent issue #14 remains open after this slice.
- Do not change probe, DNS, SSH, cPanel, GitHub API, threshold, classification, warning, schema, or exit-code behavior.
- Keep output path, environment overrides, console ordering, warning escaping, summary prefix, and mode `0600` unchanged.
- Keep `formatSafeLogSummary` import compatibility from `production-health.mjs`.
- Add no secret values, private endpoints, origin information, provider identifiers, or internal production paths.
- Inspect every bot, agent, security, dependency, inline-review, submitted-review, annotation, and workflow result before integration.

---

### Task 1: Establish the reporting-module contract

**Files:**
- Create: `tests/production-health-report.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Add a failing architecture and behavior test**

Create tests that require `scripts/ops/production-health-report.mjs` and import:

```js
import {
  escapeWorkflowCommandValue,
  formatProductionHealthMarkdown,
  formatSafeLogSummary,
  writeProductionHealthReport,
} from "../scripts/ops/production-health-report.mjs";
```

The suite must assert:

- the new module exists and exports all four functions;
- `production-health.mjs` imports the writer, re-exports `formatSafeLogSummary`, and no longer contains `fs.writeFile`, `fs.appendFile`, `fs.chmod`, or the safe-summary prefix implementation;
- safe summary output omits synthetic private paths and addresses;
- Markdown includes classification, blocking state, subsystem status, release state, capacity/workflow state, and warnings;
- workflow escaping maps `%` to `%25`, `\r` to `%0D`, and `\n` to `%0A`.

- [ ] **Step 2: Register the focused test**

Add `tests/production-health-report.test.mjs` to both `test` and `test:coverage` immediately after `tests/production-health.test.mjs`.

- [ ] **Step 3: Verify RED**

Run:

```bash
node --import ./tests/alias-loader.mjs --test tests/production-health-report.test.mjs
```

Expected: fail because the reporting module does not exist and the original module still owns reporting.

---

### Task 2: Extract pure formatting and compatibility exports

**Files:**
- Create: `scripts/ops/production-health-report.mjs`
- Modify: `scripts/ops/production-health.mjs`
- Test: `tests/production-health-report.test.mjs`

- [ ] **Step 1: Move safe summary helpers**

Move these implementations unchanged into the new module:

- `safeFailureProbe`
- `failedRouteSummaries`
- `formatSafeLogSummary`

Import `sanitizeReport` from `production-health-lib.mjs`. Preserve the exact `PRODUCTION_HEALTH_SAFE ` prefix and JSON shape.

- [ ] **Step 2: Move Markdown formatting**

Move `markdownSummary` unchanged and rename only its exported declaration:

```js
export function formatProductionHealthMarkdown(report) {
```

- [ ] **Step 3: Move workflow-command escaping**

Move `workflowCommandValue` unchanged and rename only its exported declaration:

```js
export function escapeWorkflowCommandValue(value) {
```

- [ ] **Step 4: Preserve compatibility in the runtime module**

Add:

```js
import { writeProductionHealthReport } from "./production-health-report.mjs";
export { formatSafeLogSummary } from "./production-health-report.mjs";
```

Remove the moved helper implementations from `production-health.mjs`. Do not change any other runtime code in this task.

- [ ] **Step 5: Run formatting tests**

Run:

```bash
node --import ./tests/alias-loader.mjs --test \
  tests/production-health-report.test.mjs \
  tests/production-health.test.mjs
```

Expected: formatting and compatibility assertions pass; writer-specific assertions remain pending until Task 3.

---

### Task 3: Extract report persistence and verify output equivalence

**Files:**
- Modify: `scripts/ops/production-health-report.mjs`
- Modify: `scripts/ops/production-health.mjs`
- Modify: `tests/production-health-report.test.mjs`

- [ ] **Step 1: Implement the writer with production defaults**

Export:

```js
export async function writeProductionHealthReport(
  report,
  {
    env = process.env,
    fsImpl = fs,
    logger = console.log,
    resolvePath = path.resolve,
  } = {},
) {
```

Move the current `writeReport` body into this function and apply only these mechanical substitutions:

- `process.env` becomes `env`;
- `fs` becomes `fsImpl`;
- `path.resolve` becomes `resolvePath`;
- `console.log` becomes `logger`;
- `markdownSummary` becomes `formatProductionHealthMarkdown`;
- `workflowCommandValue` becomes `escapeWorkflowCommandValue`.

Keep all statements and log order unchanged.

- [ ] **Step 2: Delegate from the CLI entry point**

Replace:

```js
await writeReport(result.report);
```

with:

```js
await writeProductionHealthReport(result.report);
```

Remove `fs` import from the runtime module. Retain `path` because remote inspection still uses `path.posix`.

- [ ] **Step 3: Test report writing in a temporary directory**

Use a synthetic healthy report and injected dependencies to assert:

- JSON file ends with `\n` and parses to the same report;
- `chmod` receives mode `0o600`;
- a configured step summary is appended with formatted Markdown;
- warnings are emitted as escaped GitHub workflow commands;
- console lines remain ordered as summary, safe log, and report path after warning lines;
- no synthetic sensitive path/address appears in the safe log.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
node --import ./tests/alias-loader.mjs --test \
  tests/production-health-report.test.mjs \
  tests/production-health.test.mjs \
  tests/repository-contract.test.mjs
```

Expected: all pass.

- [ ] **Step 5: Commit implementation**

```bash
git add package.json \
  scripts/ops/production-health.mjs \
  scripts/ops/production-health-report.mjs \
  tests/production-health-report.test.mjs
git diff --cached --check
git commit -m "refactor: extract production health reporting"
```

---

### Task 4: Full validation and integration review

**Files:**
- Test: complete repository
- Review: final diff and GitHub feedback

- [ ] **Step 1: Run complete local validation**

```bash
npm run lint
npm run typecheck
npm test
NEXT_PUBLIC_ANALYTICS_ENABLED=true npm run build
npm audit --audit-level=high
```

Expected: all pass.

- [ ] **Step 2: Run browser/accessibility validation**

Use the pinned browser environment and run:

```bash
npm run test:browser
```

Expected: all page, navigation, consent, form, accessibility, duplicate-ID, layout, and forwarding scenarios pass.

- [ ] **Step 3: Review diff and public safety**

Verify:

```bash
git diff origin/main...HEAD --check
git diff --stat origin/main...HEAD
git status --short
```

Compare the moved implementations mechanically with `origin/main`, except for the declared names and injected defaults. Scan for credentials, private keys, private addresses, internal paths, provider identifiers, and legacy repository identities.

- [ ] **Step 4: Publish a draft pull request**

Push `refactor/issue-14-production-health-reporting`, open a draft PR related to #14, request SismoSmart review, and record validation/public-safety evidence.

- [ ] **Step 5: Inspect all GitHub feedback**

Review issue/PR comments, bot and agent suggestions, inline comments, submitted reviews, security/dependency results, workflow checks, and warning/failure annotations. Resolve actionable findings before integration.
