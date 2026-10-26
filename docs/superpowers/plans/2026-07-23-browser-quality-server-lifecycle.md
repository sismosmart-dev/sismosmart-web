# Browser Quality Server Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move browser-quality loopback server and child-process lifecycle into a focused module while preserving every runtime and compatibility contract.

**Architecture:** Add `scripts/test/browser-quality-server.mjs` as the owner of mock forwarding, loopback ports, Next.js readiness/retry, bounded logs, and child shutdown. Keep `browser-quality.mjs` as the browser-scenario and CLI entry point.

**Tech Stack:** Node.js ESM, Node HTTP/net/child_process APIs, Node test runner, Next.js 16, Puppeteer Core.

## Global Constraints

- Parent issue #14 remains open.
- Bind temporary servers only to `127.0.0.1`.
- Preserve body limits, routes, response codes, readiness timing, retry count, process signals, environment keys, diagnostics, and export compatibility exactly.
- Change no scenario, browser launch, executable, screenshot, accessibility, form interaction, report, workflow, dependency, endpoint, or production behavior.
- Inspect all bot, agent, security, dependency, review, annotation, and workflow feedback before integration.

---

### Task 1: Establish the lifecycle architecture contract

**Files:**
- Create: `tests/browser-quality-server.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: current `browser-quality.mjs` exports and source layout.
- Produces: failing requirements for `browser-quality-server.mjs`.

- [ ] Add a test importing `isAddressInUseFailure`, `startMockReceiver`, `startNextServer`, and `stopChild` from the new module.
- [ ] Assert the runner imports the lifecycle starters, re-exports `isAddressInUseFailure`, and no longer contains `createServer`, `net.createServer`, `spawn`, `MAX_MOCK_BODY_BYTES`, `SERVER_READY_TIMEOUT_MS`, or `MAX_APP_START_ATTEMPTS`.
- [ ] Register the new test immediately before `tests/browser-quality.test.mjs` in `test` and `test:coverage`.
- [ ] Run `node --import ./tests/alias-loader.mjs --test tests/browser-quality-server.test.mjs` and verify RED with `ERR_MODULE_NOT_FOUND` for the new module.

---

### Task 2: Specify mock receiver behavior

**Files:**
- Test: `tests/browser-quality-server.test.mjs`

**Interfaces:**
- Consumes: `startMockReceiver()`.
- Produces: `{ baseUrl, close, records }` behavior requirements.

- [ ] Start a real loopback receiver and POST synthetic contact and waitlist envelopes with the expected bearer value.
- [ ] Assert `200`, JSON `{ ok: true }`, and safe records containing route, locale, page path, source, UTM source, authorization/content-type matches, and `formMatches` only.
- [ ] Assert non-POST/unknown routes return `404`; malformed and oversized payloads return `400`; raw payload values never enter records.
- [ ] Close the receiver in `finally` and verify RED until the module exists.

---

### Task 3: Specify retry and shutdown behavior

**Files:**
- Test: `tests/browser-quality-server.test.mjs`

**Interfaces:**
- Consumes: `startNextServer(mockBaseUrl, options)` and `stopChild(child, options)`.
- Produces: deterministic retry and signal contracts.

- [ ] Inject sequential ports and an attempt function that fails once with `EADDRINUSE`, then succeeds; assert two attempts and the successful object.
- [ ] Inject a non-address error and assert one attempt with immediate rejection.
- [ ] Inject only address errors with `maxAttempts: 4` and assert exactly four attempts and the final error.
- [ ] Use fake event-emitting child objects to verify no-op for absent/exited children, graceful SIGTERM completion, and SIGKILL escalation after an injected immediate grace timeout.

---

### Task 4: Extract the lifecycle implementation

**Files:**
- Create: `scripts/test/browser-quality-server.mjs`
- Modify: `scripts/test/browser-quality.mjs`
- Test: `tests/browser-quality-server.test.mjs`

**Interfaces:**
- Produces: `isAddressInUseFailure`, `startMockReceiver`, `startNextServer`, and `stopChild`.

- [ ] Move the existing token, limits, error classification, bounded logs, port allocation, request parsing, receiver, readiness, shutdown, one-attempt startup, and retry loop into the new module.
- [ ] Preserve production defaults and add only the documented injected options.
- [ ] Import `summarizeForwardRequest` from `browser-quality-lib.mjs`; derive the repository root from `import.meta.url`.
- [ ] Remove server/process imports and constants from the runner; import the two starters and re-export the classifier.
- [ ] Run focused server/browser/reporting/executable/repository tests and verify GREEN.
- [ ] Mechanically compare commands, environment, routes, limits, status codes, timeouts, retry logic, diagnostics, and signals with `origin/main`.
- [ ] Commit with SismoSmart author and committer identity.

---

### Task 5: Complete validation and integration review

**Files:**
- Test: complete repository
- Review: branch diff and GitHub channels

**Interfaces:**
- Consumes: completed lifecycle extraction.
- Produces: validated sixth issue #14 pull request.

- [ ] Run `npm run lint`, `npm run typecheck`, `npm test`, `NEXT_PUBLIC_ANALYTICS_ENABLED=true npm run build`, `npm audit --audit-level=high`, and `npm run test:browser`.
- [ ] Run `git diff origin/main...HEAD --check`, verify a clean status, confirm only planned files changed, and scan for credentials, private keys, private addresses, internal paths, provider identifiers, and legacy identities.
- [ ] Push `refactor/issue-14-browser-server-lifecycle`, open a draft PR related to #14 without an automatic closing keyword, and request SismoSmart review.
- [ ] Inspect issue/PR comments, bot/agent suggestions, inline comments, submitted reviews, dependency/security findings, workflow checks, and warning/failure annotations.
- [ ] Integrate only when all checks are green, preserve SismoSmart commit identity, keep issue #14 open, and verify Mainline Policy, Security, and CI on `main`.
