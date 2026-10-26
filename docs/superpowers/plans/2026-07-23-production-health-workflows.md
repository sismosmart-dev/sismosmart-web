# Production Health GitHub Workflow Adapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move production-health GitHub workflow-history reads and their target catalog into a focused, directly testable adapter without changing request, projection, fallback, aggregation, or report behavior.

**Architecture:** Add `scripts/ops/production-health-workflows.mjs` as the owner of the workflow target catalog and GitHub Actions workflow-runs requests. Keep workflow streak evaluation, warnings, health classification, reporting, and CLI orchestration in existing modules; preserve the current `readTargetWorkflowRuns` import through a re-export from `production-health.mjs`.

**Tech Stack:** Node.js ESM, built-in Fetch API and AbortSignal, Node test runner, Next.js 16.

## Global Constraints

- Parent issue #14 remains open.
- Preserve workflow target keys/order, filenames, option/environment precedence, URLs, headers, bearer authentication, 10-second timeout, parallel reads, HTTP errors, JSON parsing, safe projection, empty-array fallback, aggregation, and report behavior exactly.
- Preserve `readTargetWorkflowRuns` imports through `production-health.mjs`.
- Add no dependency and change no GitHub Actions workflow, permission, credential flow, cPanel request, SSH command, DNS resolution, HTTPS probe, aggregation rule, report, deployment, or production state.
- Inspect all bot, agent, security, dependency, inline-review, submitted-review, annotation, and workflow channels before integration.

---

### Task 1: Establish the workflow-adapter contract

**Files:**
- Create: `tests/production-health-workflows.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: current `readTargetWorkflowRuns(options)` and `WORKFLOW_TARGETS` behavior from `scripts/ops/production-health.mjs`.
- Produces: failing requirements for `scripts/ops/production-health-workflows.mjs`.

- [ ] Create the test file with imports from the missing focused module:

```js
import {
  productionHealthWorkflowTargets,
  readTargetWorkflowRuns,
} from "../scripts/ops/production-health-workflows.mjs";
```

- [ ] Add an architecture test that reads `production-health.mjs` and asserts it imports both focused exports, re-exports `readTargetWorkflowRuns`, uses `productionHealthWorkflowTargets` in aggregation, and no longer defines `WORKFLOW_TARGETS` or `readTargetWorkflowRuns`.
- [ ] Register `tests/production-health-workflows.test.mjs` immediately after `tests/production-health-cpanel.test.mjs` in both `test` and `test:coverage`.
- [ ] Run:

```bash
node --import ./tests/alias-loader.mjs --test tests/production-health-workflows.test.mjs
```

- [ ] Verify RED with `ERR_MODULE_NOT_FOUND` for `production-health-workflows.mjs`.

---

### Task 2: Specify target catalog and request behavior

**Files:**
- Test: `tests/production-health-workflows.test.mjs`

**Interfaces:**
- Consumes: `productionHealthWorkflowTargets` and `readTargetWorkflowRuns({ repository, token, fetchImpl })`.
- Produces: exact catalog, URL, header, timeout, and projection contracts.

- [ ] Assert exact catalog and insertion order:

```js
{
  deploy: "deploy-prod.yml",
  lighthouse: "lighthouse.yml",
  security: "security.yml",
}
```

- [ ] Inject repository `example-org/example-repo`, token `placeholder-bearer`, and `fetchImpl`.
- [ ] Assert the three request URLs are, in order:

```text
https://api.github.com/repos/example-org/example-repo/actions/workflows/deploy-prod.yml/runs?status=completed&per_page=3
https://api.github.com/repos/example-org/example-repo/actions/workflows/lighthouse.yml/runs?status=completed&per_page=3
https://api.github.com/repos/example-org/example-repo/actions/workflows/security.yml/runs?status=completed&per_page=3
```

- [ ] Assert each request uses these exact headers:

```js
{
  Accept: "application/vnd.github+json",
  Authorization: "Bearer placeholder-bearer",
  "User-Agent": "SismoSmart-Production-Health/1.0",
  "X-GitHub-Api-Version": "2022-11-28",
}
```

- [ ] Assert each request has an `AbortSignal`, and source inspection retains `AbortSignal.timeout(10_000)`.
- [ ] Return payloads with extra fields and assert only `conclusion` and `createdAt` are retained under the correct target key.

---

### Task 3: Specify missing inputs and environment fallback

**Files:**
- Test: `tests/production-health-workflows.test.mjs`

**Interfaces:**
- Consumes: `readTargetWorkflowRuns(options)`.
- Produces: fail-closed input and option/environment precedence contracts.

- [ ] With missing repository and then missing token, assert no fetch call and exact rejection `GITHUB_ACTIONS_READ_UNAVAILABLE`.
- [ ] Save the original `GITHUB_REPOSITORY` and `GITHUB_TOKEN` values.
- [ ] Set both to synthetic values, call without explicit repository/token, and assert requests use the environment values.
- [ ] Call again with explicit values and assert explicit options override the environment.
- [ ] Restore both environment variables in `finally`, deleting keys that were originally absent.

---

### Task 4: Specify parallelism, fallback, and HTTP errors

**Files:**
- Test: `tests/production-health-workflows.test.mjs`

**Interfaces:**
- Consumes: `readTargetWorkflowRuns(options)`.
- Produces: concurrency, malformed-shape fallback, and exact failure contracts.

- [ ] Create three deferred fetch responses. Call the adapter, await one microtask, and assert all three URLs were requested before resolving any response.
- [ ] Resolve one payload with non-array `workflow_runs` and assert that target becomes `[]`.
- [ ] Resolve the other targets with valid arrays and assert `Object.fromEntries` preserves deploy/lighthouse/security keys.
- [ ] Return a non-success response for each target in separate assertions and verify exact errors:

```text
GITHUB_WORKFLOW_DEPLOY_403
GITHUB_WORKFLOW_LIGHTHOUSE_429
GITHUB_WORKFLOW_SECURITY_503
```

- [ ] Verify a non-success response does not call `response.json()`.

---

### Task 5: Extract the GitHub workflow adapter

**Files:**
- Create: `scripts/ops/production-health-workflows.mjs`
- Modify: `scripts/ops/production-health.mjs`
- Test: `tests/production-health-workflows.test.mjs`

**Interfaces:**
- Produces: `productionHealthWorkflowTargets` and `readTargetWorkflowRuns(options)`.
- Preserves: `readTargetWorkflowRuns` import compatibility through `production-health.mjs`.

- [ ] Move the target catalog without changing key order or filenames.
- [ ] Move `readTargetWorkflowRuns` without changing default arguments, missing-input error, `Promise.all`, request URL, headers, timeout, error text, JSON parsing, projection, or return shape.
- [ ] Import runtime dependencies and re-export compatibility in `production-health.mjs`:

```js
import {
  productionHealthWorkflowTargets,
  readTargetWorkflowRuns,
} from "./production-health-workflows.mjs";
export { readTargetWorkflowRuns } from "./production-health-workflows.mjs";
```

- [ ] Replace `Object.keys(WORKFLOW_TARGETS)` with `Object.keys(productionHealthWorkflowTargets)`.
- [ ] Remove `WORKFLOW_TARGETS` and the old exported reader from `production-health.mjs`.
- [ ] Remove `node:process` from `production-health.mjs` only if no remaining runtime usage exists; the CLI uses the global `process`, so verify all references before changing the import.
- [ ] Run focused tests:

```bash
node --import ./tests/alias-loader.mjs --test \
  tests/production-health-workflows.test.mjs \
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

- [ ] Mechanically compare catalog, defaults, URL, headers, timeout, errors, `Promise.all`, JSON parsing, projection, and object construction against `origin/main`.
- [ ] Commit with SismoSmart author and committer identity:

```bash
git add package.json scripts/ops/production-health-workflows.mjs scripts/ops/production-health.mjs tests/production-health-workflows.test.mjs
git commit -m "refactor: extract production health workflow adapter"
```

---

### Task 6: Complete validation and integration review

**Files:**
- Test: complete repository
- Review: branch diff and GitHub channels

**Interfaces:**
- Consumes: completed workflow adapter extraction.
- Produces: validated fourteenth issue #14 pull request.

- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `NEXT_PUBLIC_ANALYTICS_ENABLED=true npm run build`.
- [ ] Run `npm audit --audit-level=high`.
- [ ] Run real Chrome `npm run test:browser` with the established temporary runtime-library path.
- [ ] Run `git diff origin/main...HEAD --check`, confirm clean status, and verify only planned files changed.
- [ ] Scan the complete diff for credentials, private keys, private addresses, internal paths, provider identifiers, raw external material, and legacy repository identities.
- [ ] Push `refactor/issue-14-production-health-workflows`, open a draft pull request related to #14 without an automatic closing keyword, and request SismoSmart review.
- [ ] Inspect issue/PR comments, bot/agent suggestions, inline comments, submitted reviews, dependency/security findings, workflow checks, and warning/failure annotations.
- [ ] Integrate only when all checks are green, preserve SismoSmart commit identity, keep issue #14 open, and verify Mainline Policy, Security, and CI on `main`.
