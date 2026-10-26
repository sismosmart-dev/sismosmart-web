# Production Health HTTPS Probe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the production-health HTTPS route probing layer into a focused module while preserving every existing monitoring and public behavior contract.

**Architecture:** Add `scripts/ops/production-health-probes.mjs` as the owner of route definitions, fixed lookup, HTTPS measurement, cold/warm route sets, and public/origin wrappers. Keep DNS resolution, SSH/cPanel/workflow reads, health aggregation, reporting, and CLI orchestration in `production-health.mjs`, which re-exports the existing public probe API.

**Tech Stack:** Node.js ESM, Node HTTPS/DNS primitives, Node test runner, Next.js 16.

## Global Constraints

- Parent issue #14 remains open.
- Preserve all routes, request options, headers, timeouts, body limits, timing fields, status/form/Cloudflare evaluation, error codes, cold/warm ordering, and result shapes exactly.
- Add no dependency and change no DNS, SSH, cPanel, workflow, report, credential, deployment, or production behavior.
- Inspect all bot, agent, security, dependency, inline-review, submitted-review, annotation, and workflow channels before integration.

---

### Task 1: Establish the probe-module architecture contract

**Files:**
- Create: `tests/production-health-probes.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: current probe behavior from `scripts/ops/production-health.mjs`.
- Produces: failing requirements for `production-health-probes.mjs`.

- [ ] Import `productionHealthPublicRoutes`, `fixedLookup`, `measureHttps`, `probeRouteSet`, `probePublicRoutes`, and `probeOriginRoutes` from the new module.
- [ ] Assert `production-health.mjs` imports and re-exports the existing public probe API and no longer owns HTTPS request, timeout, body-limit, or route-catalog definitions.
- [ ] Register `tests/production-health-probes.test.mjs` immediately before `tests/production-health.test.mjs` in `test` and `test:coverage`.
- [ ] Run `node --import ./tests/alias-loader.mjs --test tests/production-health-probes.test.mjs`.
- [ ] Verify RED with `ERR_MODULE_NOT_FOUND` for `production-health-probes.mjs`.

---

### Task 2: Specify route and lookup policy

**Files:**
- Test: `tests/production-health-probes.test.mjs`

**Interfaces:**
- Consumes: `productionHealthPublicRoutes` and `fixedLookup(address, family)`.
- Produces: exact route and callback contracts.

- [ ] Assert all eight route objects, expected statuses, redirect suffix, and form targets exactly.
- [ ] Assert origin probing selects only `en`, `robots`, `contact`, and `waitlist` by observing an injected route-set function.
- [ ] Invoke fixed lookup with normal and `{ all: true }` options; assert address/family callback shapes exactly.

---

### Task 3: Specify cold/warm route-set behavior

**Files:**
- Test: `tests/production-health-probes.test.mjs`

**Interfaces:**
- Consumes: `probeRouteSet(options, { measureHttpsImpl, sleepImpl })`.
- Produces: ordering, delay, route result, and aggregate contracts.

- [ ] Record cold measurements in input route order.
- [ ] Assert exactly one 500 ms sleep occurs between cold and warm phases.
- [ ] Record warm measurements in the same order.
- [ ] Assert output keeps `{ key, cold, warm }` ordering.
- [ ] Assert aggregate `ok` is true only when every cold and warm measurement is successful.

---

### Task 4: Specify representative HTTPS measurements

**Files:**
- Test: `tests/production-health-probes.test.mjs`

**Interfaces:**
- Consumes: `measureHttps(options, { httpsRequestImpl, nowImpl })`.
- Produces: request, response, form, Cloudflare, timing, timeout, and error contracts.

- [ ] Build a fake request/socket/response event sequence for a successful form route.
- [ ] Assert port 443, GET, SNI, certificate validation, no agent, form accept header, user agent, path, and fixed lookup.
- [ ] Emit a bounded JSON form response with Cloudflare headers; assert status, target, configured, Cloudflare, cache status, timings, and `ok`.
- [ ] Build an error request; invoke the timeout callback and assert request destruction with `ETIMEDOUT`.
- [ ] Emit an unsafe error code and assert `REQUEST_FAILED` plus the unchanged null/false measurement fields.

---

### Task 5: Extract the HTTPS probe implementation

**Files:**
- Create: `scripts/ops/production-health-probes.mjs`
- Modify: `scripts/ops/production-health.mjs`
- Test: `tests/production-health-probes.test.mjs`
- Test: `tests/production-health.test.mjs`

**Interfaces:**
- Produces: the six exports defined in Task 1.
- Preserves: `productionHealthPublicRoutes`, `probePublicRoutes`, and `probeOriginRoutes` imports from `production-health.mjs`.

- [ ] Move constants, routes, rounding/error helpers needed only by probing, fixed lookup, HTTPS measurement, route-set probing, and public/origin wrappers into the new module.
- [ ] Add only the documented optional dependency parameters; production defaults use current Node.js primitives.
- [ ] Import public/origin probe functions in the runtime and re-export the three existing public values.
- [ ] Remove unused `https` import and `MAX_CAPTURE_BYTES`/`REQUEST_TIMEOUT_MS` definitions from the runtime.
- [ ] Keep `rounded` and `safeErrorCode` in the runtime if DNS/origin resolution still consumes them.
- [ ] Run focused probe, production-health, report, repository, and automation tests; verify GREEN.
- [ ] Mechanically compare every route, request option, header, timeout, body limit, response field, timing calculation, error field, delay, and result shape with `origin/main`.
- [ ] Commit with `SismoSmart <207872631+SismoSmart@users.noreply.github.com>` as author and committer.

---

### Task 6: Complete validation and integration review

**Files:**
- Test: complete repository
- Review: branch diff and GitHub channels

**Interfaces:**
- Consumes: completed probe extraction.
- Produces: validated tenth issue #14 pull request.

- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `NEXT_PUBLIC_ANALYTICS_ENABLED=true npm run build`.
- [ ] Run `npm audit --audit-level=high`.
- [ ] Run real Chrome `npm run test:browser` using the established temporary runtime library path.
- [ ] Run `git diff origin/main...HEAD --check`, confirm clean status, and verify only planned files changed.
- [ ] Scan the complete diff for credentials, private keys, private addresses, internal paths, provider identifiers, raw production material, and legacy repository identities.
- [ ] Push `refactor/issue-14-production-health-probes`, open a draft pull request related to #14 without an automatic closing keyword, and request SismoSmart review.
- [ ] Inspect issue/PR comments, bot/agent suggestions, inline comments, submitted reviews, dependency/security findings, workflow checks, and warning/failure annotations.
- [ ] Integrate only when all checks are green, preserve SismoSmart commit identity, keep issue #14 open, and verify Mainline Policy, Security, and CI on `main`.
