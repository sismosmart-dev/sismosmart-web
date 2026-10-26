# Production Health cPanel Adapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move production-health cPanel quota and resource reads into a focused, directly testable adapter without changing authentication, timeout, warning, partial-failure, fallback, or report behavior.

**Architecture:** Add `scripts/ops/production-health-cpanel.mjs` as the owner of cPanel UAPI request construction and `readCpanelHealth`. Keep GitHub workflow reads, aggregation, reporting, and CLI orchestration in existing modules; preserve the current `readCpanelHealth` import through a re-export from `production-health.mjs`.

**Tech Stack:** Node.js ESM, built-in Fetch API and AbortSignal, Node test runner, Next.js 16.

## Global Constraints

- Parent issue #14 remains open.
- Preserve cPanel URLs, headers, authorization format, 10-second timeout, JSON parsing, errors, concurrency, warning order, partial results, and missing-configuration behavior exactly.
- Preserve `readCpanelHealth` imports through `production-health.mjs`.
- Add no dependency and change no credential flow, GitHub request, SSH command, HTTPS probe, aggregation, report, workflow, deployment, or production state.
- Inspect all bot, agent, security, dependency, inline-review, submitted-review, annotation, and workflow channels before integration.

---

### Task 1: Establish the cPanel-module contract

**Files:**
- Create: `tests/production-health-cpanel.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: current `readCpanelHealth({ config, fetchImpl })` behavior from `scripts/ops/production-health.mjs`.
- Produces: failing requirements for `scripts/ops/production-health-cpanel.mjs`.

- [ ] Create the test file with imports from the missing focused module:

```js
import {
  fetchCpanelHealthResource,
  readCpanelHealth,
} from "../scripts/ops/production-health-cpanel.mjs";
```

- [ ] Add an architecture test that reads `production-health.mjs` and asserts it imports `readCpanelHealth`, re-exports it from `production-health-cpanel.mjs`, and no longer defines `fetchCpanel` or `readCpanelHealth`.
- [ ] Register `tests/production-health-cpanel.test.mjs` immediately after `tests/production-health-inspection.test.mjs` in both `test` and `test:coverage`.
- [ ] Run:

```bash
node --import ./tests/alias-loader.mjs --test tests/production-health-cpanel.test.mjs
```

- [ ] Verify RED with `ERR_MODULE_NOT_FOUND` for `production-health-cpanel.mjs`.

---

### Task 2: Specify cPanel request behavior

**Files:**
- Test: `tests/production-health-cpanel.test.mjs`

**Interfaces:**
- Consumes: `fetchCpanelHealthResource(config, moduleName, functionName, fetchImpl)`.
- Produces: exact request, success, and error contracts.

- [ ] Use a synthetic config:

```js
const config = {
  cpanelHost: "https://cpanel.example.test:2083",
  cpanelToken: "synthetic-not-a-secret",
  sshUser: "example-user",
};
```

- [ ] Inject `fetchImpl` and assert the exact URL ends with `/execute/Quota/get_quota_info`.
- [ ] Assert request headers equal:

```js
{
  Accept: "application/json",
  Authorization: "cpanel example-user:synthetic-not-a-secret",
}
```

- [ ] Assert the request has an `AbortSignal`, and source inspection retains `AbortSignal.timeout(10_000)`.
- [ ] Return `{ ok: true, json: async () => payload }` and assert the payload is returned unchanged.
- [ ] Return `{ ok: false, status: 403 }` and assert rejection with `CPANEL_QUOTA_403` without calling `json`.
- [ ] Repeat error classification for `ResourceUsage` and status `503` to prove module-name normalization.

---

### Task 3: Specify missing configuration and concurrency

**Files:**
- Test: `tests/production-health-cpanel.test.mjs`

**Interfaces:**
- Consumes: `readCpanelHealth({ config, fetchImpl })`.
- Produces: unavailable fallback and concurrent-start contracts.

- [ ] For each missing field—`cpanelHost`, `cpanelToken`, and `sshUser`—assert no fetch call and this exact result:

```js
{
  quotaPayload: null,
  resourcePayload: null,
  warnings: ["cPanel quota/resource usage is unavailable"],
}
```

- [ ] Create two deferred fetch responses. Call `readCpanelHealth`, await one microtask, and assert both quota and resource URLs were requested before resolving either response.
- [ ] Resolve both with successful JSON payloads and assert exact payload placement and `warnings: []`.

---

### Task 4: Specify partial and complete failures

**Files:**
- Test: `tests/production-health-cpanel.test.mjs`

**Interfaces:**
- Consumes: `readCpanelHealth({ config, fetchImpl })`.
- Produces: warning order and partial-result contracts.

- [ ] Make only the quota request reject and assert:

```js
{
  quotaPayload: null,
  resourcePayload,
  warnings: ["cPanel quota usage could not be read"],
}
```

- [ ] Make only the resource request reject and assert:

```js
{
  quotaPayload,
  resourcePayload: null,
  warnings: ["cPanel LVE resource usage could not be read"],
}
```

- [ ] Make both reject and assert both payloads are null and warnings remain in quota-then-resource order.
- [ ] Use non-success response objects in at least one partial-failure test so the public request helper and settled adapter are covered together.

---

### Task 5: Extract the cPanel adapter

**Files:**
- Create: `scripts/ops/production-health-cpanel.mjs`
- Modify: `scripts/ops/production-health.mjs`
- Test: `tests/production-health-cpanel.test.mjs`

**Interfaces:**
- Produces: `fetchCpanelHealthResource(config, moduleName, functionName, fetchImpl)` and `readCpanelHealth({ config, fetchImpl = fetch })`.
- Preserves: `readCpanelHealth` import compatibility through `production-health.mjs`.

- [ ] Move the request helper with this public signature:

```js
export async function fetchCpanelHealthResource(
  config,
  moduleName,
  functionName,
  fetchImpl,
)
```

- [ ] Preserve the exact URL, headers, timeout, `response.ok` branch, error string, and `response.json()` behavior.
- [ ] Move `readCpanelHealth` without changing missing-configuration, `Promise.allSettled`, identifiers, warning text/order, or payload selection.
- [ ] Import the runtime dependency and re-export it in `production-health.mjs`:

```js
import { readCpanelHealth } from "./production-health-cpanel.mjs";
export { readCpanelHealth } from "./production-health-cpanel.mjs";
```

- [ ] Remove the old private request helper and exported function from `production-health.mjs`.
- [ ] Run focused tests:

```bash
node --import ./tests/alias-loader.mjs --test \
  tests/production-health-cpanel.test.mjs \
  tests/production-health-inspection.test.mjs \
  tests/production-health-resolution.test.mjs \
  tests/production-health-probes.test.mjs \
  tests/production-health.test.mjs \
  tests/production-health-report.test.mjs \
  tests/repository-contract.test.mjs
npm run lint
npm run typecheck
```

- [ ] Mechanically compare URL construction, headers, timeout, errors, request identifiers, `Promise.allSettled`, warnings, and result selection against `origin/main`.
- [ ] Commit with SismoSmart author and committer identity:

```bash
git add package.json scripts/ops/production-health-cpanel.mjs scripts/ops/production-health.mjs tests/production-health-cpanel.test.mjs
git commit -m "refactor: extract production health cpanel adapter"
```

---

### Task 6: Complete validation and integration review

**Files:**
- Test: complete repository
- Review: branch diff and GitHub channels

**Interfaces:**
- Consumes: completed cPanel extraction.
- Produces: validated thirteenth issue #14 pull request.

- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `NEXT_PUBLIC_ANALYTICS_ENABLED=true npm run build`.
- [ ] Run `npm audit --audit-level=high`.
- [ ] Run real Chrome `npm run test:browser` with the established temporary runtime-library path.
- [ ] Run `git diff origin/main...HEAD --check`, confirm clean status, and verify only planned files changed.
- [ ] Scan the complete diff for credentials, private keys, private addresses, internal paths, provider identifiers, raw external material, and legacy repository identities.
- [ ] Push `refactor/issue-14-production-health-cpanel`, open a draft pull request related to #14 without an automatic closing keyword, and request SismoSmart review.
- [ ] Inspect issue/PR comments, bot/agent suggestions, inline comments, submitted reviews, dependency/security findings, workflow checks, and warning/failure annotations.
- [ ] Integrate only when all checks are green, preserve SismoSmart commit identity, keep issue #14 open, and verify Mainline Policy, Security, and CI on `main`.
