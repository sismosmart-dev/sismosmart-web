# Production Health Aggregation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move deterministic production-health route, capacity, form, and workflow aggregation into a focused, directly testable module without changing warning order, thresholds, report behavior, or orchestration.

**Architecture:** Add `scripts/ops/production-health-aggregation.mjs` as the owner of warm-route lookup, safe route projection, capacity aggregation, form aggregation, and workflow aggregation. Keep external adapter scheduling, fallbacks, normalization calls, release evaluation, final report assembly, classification, sanitization, reporting, and CLI behavior in `production-health.mjs`.

**Tech Stack:** Node.js ESM, Node test runner, existing production-health library helpers, Next.js 16.

## Global Constraints

- Parent issue #14 remains open for deployment orchestration decomposition.
- Preserve thresholds, rounding, warning text/order, blocking rules, result shapes, report fields, classification, sanitization, and exit codes exactly.
- Preserve deliberate append-only mutation of the supplied warnings array.
- Add no dependency and change no external request, timeout, credential flow, fallback, workflow, report publication, deployment, or production state.
- Inspect all bot, agent, security, dependency, inline-review, submitted-review, annotation, and workflow channels before integration.

---

### Task 1: Establish the aggregation-module contract

**Files:**
- Create: `tests/production-health-aggregation.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: current private aggregation helpers in `scripts/ops/production-health.mjs`.
- Produces: failing requirements for `scripts/ops/production-health-aggregation.mjs`.

- [ ] Create the focused test with imports from the missing module:

```js
import {
  buildProductionHealthCapacityResult,
  buildProductionHealthFormsResult,
  buildProductionHealthWorkflowResult,
  findWarmRoute,
  summarizeProductionHealthProbe,
  summarizeProductionHealthRouteSet,
} from "../scripts/ops/production-health-aggregation.mjs";
```

- [ ] Add an architecture test that reads `production-health.mjs` and asserts it imports all six helpers, calls them in the runtime, and no longer defines `warmRoute`, `summarizeProbe`, `summarizeRouteSet`, `capacityResult`, `formsResult`, or `workflowResult`.
- [ ] Register `tests/production-health-aggregation.test.mjs` immediately after `tests/production-health-workflows.test.mjs` in both `test` and `test:coverage`.
- [ ] Run:

```bash
node --import ./tests/alias-loader.mjs --test tests/production-health-aggregation.test.mjs
```

- [ ] Verify RED with `ERR_MODULE_NOT_FOUND` for `production-health-aggregation.mjs`.

---

### Task 2: Specify route lookup and projection

**Files:**
- Test: `tests/production-health-aggregation.test.mjs`

**Interfaces:**
- Consumes: `findWarmRoute(routeSet, key)`, `summarizeProductionHealthProbe(probe)`, and `summarizeProductionHealthRouteSet(routeSet)`.
- Produces: exact lookup and safe projection contracts.

- [ ] Assert `findWarmRoute` returns the first matching route's `warm` observation and returns `undefined` for missing route sets, routes, keys, or warm values.
- [ ] Assert `summarizeProductionHealthProbe(null)` returns `null`.
- [ ] Use a representative probe containing truthy/falsy booleans, zero timings, empty cache/error fields, status, target, and an extra private field; assert the exact result:

```js
{
  cacheStatus: null,
  cloudflare: true,
  configured: false,
  connectMs: 0,
  errorCode: null,
  lookupMs: 4.5,
  ok: true,
  status: 200,
  target: "home",
  tlsMs: 8,
  totalMs: 20,
  ttfbMs: 12,
}
```

- [ ] Assert a probe without boolean `configured` retains the property with value `undefined`, matching the existing object shape.
- [ ] Assert route-set summarization preserves route order, keys, cold/warm positions, `ok` boolean coercion, empty route fallback, and removal of raw fields.

---

### Task 3: Specify capacity aggregation

**Files:**
- Test: `tests/production-health-aggregation.test.mjs`

**Interfaces:**
- Consumes: `buildProductionHealthCapacityResult(remote, quota, resources, warnings)`.
- Produces: exact thresholds, resource percentages, warnings, blocking, and return-shape contracts.

- [ ] Build one warning-level case with filesystem `85`, release count `9`, release bytes `1024 ** 3 + 1`, available quota `80`, and resource usage `1/3`; assert warning labels/order and resource percentage `33.33`.
- [ ] Build one critical case with filesystem `95`, release count `13`, release bytes `2 * 1024 ** 3 + 1`, and available quota `90`; assert all four critical messages in existing order and `blocking: true`.
- [ ] Build an unavailable case with missing remote measurements and unavailable quota; assert the three measurement-unavailable messages, `account quota limit is unavailable`, quota severity `unavailable`, and non-blocking result.
- [ ] Assert resources with maximum `0` receive `usagePercent: null` and all original resource properties remain.
- [ ] Assert an existing warning prefix remains untouched and new messages append after it.

---

### Task 4: Specify form aggregation

**Files:**
- Test: `tests/production-health-aggregation.test.mjs`

**Interfaces:**
- Consumes: `buildProductionHealthFormsResult(publicSet, remote, warnings)`.
- Produces: exact runtime, access aggregation, warning, and blocking contracts.

- [ ] Build a successful contact/waitlist route set with configured matching targets and successful warm probes; assert `ok: true`, both runtime flags true, no warnings, and non-blocking access.
- [ ] Use no available form log and no records; assert exact warning `form access-log aggregation is unavailable`.
- [ ] Use form records containing server errors below the blocking threshold; assert exact warning `form access logs contain server errors` and `blocking: false`.
- [ ] Use at least five server errors and a server-error rate of at least `0.2`; assert `blocking: true`.
- [ ] Assert wrong target or unconfigured route makes overall `ok` false while each runtime boolean still follows only `ok && configured`.

---

### Task 5: Specify workflow aggregation

**Files:**
- Test: `tests/production-health-aggregation.test.mjs`

**Interfaces:**
- Consumes: `buildProductionHealthWorkflowResult(runsByTarget, warnings)`.
- Produces: exact target order, warning, blocking, and fallback contracts.

- [ ] Provide deploy with one latest failure, Lighthouse with success, and security with two latest failures; assert target keys remain deploy/lighthouse/security.
- [ ] Assert only `deploy workflow latest run failed once` is appended.
- [ ] Assert security is blocking, aggregate `blocking` is true, and result records match `evaluateWorkflowStreak` output.
- [ ] Pass missing/empty target data and assert all three target results are present and non-blocking.
- [ ] Assert warning prefixes remain intact and new warning order follows target insertion order.

---

### Task 6: Extract the aggregation module

**Files:**
- Create: `scripts/ops/production-health-aggregation.mjs`
- Modify: `scripts/ops/production-health.mjs`
- Test: `tests/production-health-aggregation.test.mjs`

**Interfaces:**
- Produces: the six aggregation exports defined in Task 1.
- Preserves: unchanged `runProductionHealth` orchestration and public API.

- [ ] Move `GIB`, warm-route lookup, probe projection, route-set projection, capacity aggregation, form aggregation, and workflow aggregation into the focused module.
- [ ] Rename only at the module boundary:

```text
warmRoute -> findWarmRoute
summarizeProbe -> summarizeProductionHealthProbe
summarizeRouteSet -> summarizeProductionHealthRouteSet
capacityResult -> buildProductionHealthCapacityResult
formsResult -> buildProductionHealthFormsResult
workflowResult -> buildProductionHealthWorkflowResult
```

- [ ] Import `aggregateFormAccess`, `evaluateThreshold`, `evaluateWorkflowStreak` from `production-health-lib.mjs` and `productionHealthWorkflowTargets` from `production-health-workflows.mjs` in the focused module.
- [ ] Remove those four aggregation-library imports and the workflow-target import from `production-health.mjs` when no remaining usage exists.
- [ ] Import the six focused helpers in `production-health.mjs`.
- [ ] Replace existing call sites without changing their order or surrounding warning pushes.
- [ ] Keep `normalizeQuota`, `normalizeResourceUsage`, `evaluateReleaseState`, `classifyHealth`, and `sanitizeReport` in `production-health.mjs`.
- [ ] Run focused tests:

```bash
node --import ./tests/alias-loader.mjs --test \
  tests/production-health-aggregation.test.mjs \
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

- [ ] Mechanically compare the moved function bodies against `origin/main` after normalizing only the six function names and imported target constant name.
- [ ] Verify `runProductionHealth` call order and report assembly remain unchanged apart from focused helper names/imports.
- [ ] Commit with SismoSmart author and committer identity:

```bash
git add package.json scripts/ops/production-health-aggregation.mjs scripts/ops/production-health.mjs tests/production-health-aggregation.test.mjs
git commit -m "refactor: extract production health aggregation"
```

---

### Task 7: Complete validation and integration review

**Files:**
- Test: complete repository
- Review: branch diff and GitHub channels

**Interfaces:**
- Consumes: completed aggregation extraction.
- Produces: validated fifteenth issue #14 pull request.

- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `NEXT_PUBLIC_ANALYTICS_ENABLED=true npm run build`.
- [ ] Run `npm audit --audit-level=high`.
- [ ] Run real Chrome `npm run test:browser` with the established temporary runtime-library path.
- [ ] Run `git diff origin/main...HEAD --check`, confirm clean status, and verify only planned files changed.
- [ ] Scan the complete diff for credentials, private keys, private addresses, internal paths, provider identifiers, raw external material, and legacy repository identities.
- [ ] Push `refactor/issue-14-production-health-aggregation`, open a draft pull request related to #14 without an automatic closing keyword, and request SismoSmart review.
- [ ] Inspect issue/PR comments, bot/agent suggestions, inline comments, submitted reviews, dependency/security findings, workflow checks, and warning/failure annotations.
- [ ] Integrate only when all checks are green, preserve SismoSmart commit identity, keep issue #14 open, and verify Mainline Policy, Security, and CI on `main`.
