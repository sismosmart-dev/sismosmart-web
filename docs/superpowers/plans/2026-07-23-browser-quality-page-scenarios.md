# Browser Quality Page Scenario Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move reusable page-quality mechanics into a focused module while preserving every browser and public behavior contract.

**Architecture:** Add `scripts/test/browser-quality-page.mjs` as the owner of page setup, request isolation, DOM/axe/layout collection, screenshots, and localized route checks. Keep `browser-quality.mjs` as the interaction-scenario, browser/server, reporting, and CLI orchestrator.

**Tech Stack:** Node.js ESM, Puppeteer Core, axe-core, Node test runner, Next.js 16.

## Global Constraints

- Parent issue #14 remains open.
- Preserve page setup order, interception policy, axe tags, blocking thresholds, result schema, diagnostics, screenshot behavior, and page cleanup exactly.
- Change no navigation, consent, form, server, executable, report, workflow, dependency, endpoint, or production behavior.
- Inspect all bot, agent, security, dependency, review, annotation, and workflow feedback before integration.

---

### Task 1: Establish the page-quality architecture contract

**Files:**
- Create: `tests/browser-quality-page.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: current `browser-quality.mjs` and `browser-quality-lib.mjs` behavior.
- Produces: failing requirements for `browser-quality-page.mjs`.

- [ ] Import `preparePage`, `collectPageQuality`, `screenshotFailure`, and `runPageScenario` from the new module.
- [ ] Assert the runner imports page helpers and no longer owns `setRequestInterception`, `globalThis.axe.run`, `fullPage: true`, or the route-quality function body.
- [ ] Register the test immediately before `tests/browser-quality-server.test.mjs` in `test` and `test:coverage`.
- [ ] Run the focused test and verify RED with `ERR_MODULE_NOT_FOUND` for the new module.

---

### Task 2: Specify deterministic page setup and quality collection

**Files:**
- Test: `tests/browser-quality-page.test.mjs`

**Interfaces:**
- Consumes: `preparePage(browser, blockedExternalHosts, viewport)` and `collectPageQuality(page, axeSource)`.
- Produces: exact setup/interception and quality-result contracts.

- [ ] Use a fake browser/page to record CSP, media, cache, viewport, interception, continue, abort, and external-host behavior.
- [ ] Assert loopback requests continue, external requests abort with `blockedbyclient`, and malformed URLs add the sentinel.
- [ ] Stub DOM and axe evaluations and assert serious/critical filtering, duplicate IDs, language, layout, and total violation count.

---

### Task 3: Specify screenshot and route scenario behavior

**Files:**
- Test: `tests/browser-quality-page.test.mjs`

**Interfaces:**
- Consumes: `screenshotFailure(page, key, { artifactRoot })` and `runPageScenario(options)`.
- Produces: screenshot-path, success-result, blocking-diagnostic, screenshot-attempt, and page-close requirements.

- [ ] Use a temporary directory and fake page to assert safe filename normalization and full-page capture.
- [ ] Run a successful scenario with injected helper functions and assert the existing result schema.
- [ ] Run a blocking scenario and assert the existing diagnostic text, screenshot call, and guaranteed page close.

---

### Task 4: Extract the page-quality implementation

**Files:**
- Create: `scripts/test/browser-quality-page.mjs`
- Modify: `scripts/test/browser-quality.mjs`
- Test: `tests/browser-quality-page.test.mjs`

**Interfaces:**
- Produces: `preparePage`, `collectPageQuality`, `screenshotFailure`, and `runPageScenario`.

- [ ] Move artifact-root derivation, page preparation, quality collection, screenshot persistence, and route scenario code into the new module.
- [ ] Import the existing lib helpers and preserve production defaults; add only the documented narrow helper injection for focused tests.
- [ ] Remove moved imports/constants/functions from the runner and import the shared helpers.
- [ ] Run focused page/browser/server/reporting/executable/repository tests and verify GREEN.
- [ ] Mechanically compare setup calls, interception behavior, axe tags, timeouts, diagnostics, result fields, screenshot options, and cleanup with `origin/main`.
- [ ] Commit with SismoSmart author and committer identity.

---

### Task 5: Complete validation and integration review

**Files:**
- Test: complete repository
- Review: branch diff and GitHub channels

**Interfaces:**
- Consumes: completed page-quality extraction.
- Produces: validated seventh issue #14 pull request.

- [ ] Run `npm run lint`, `npm run typecheck`, `npm test`, `NEXT_PUBLIC_ANALYTICS_ENABLED=true npm run build`, `npm audit --audit-level=high`, and `npm run test:browser`.
- [ ] Run `git diff origin/main...HEAD --check`, verify clean status, confirm only planned files changed, and scan for credentials, private keys, private addresses, internal paths, provider identifiers, and legacy identities.
- [ ] Push `refactor/issue-14-browser-page-scenarios`, open a draft PR related to #14 without an automatic closing keyword, and request SismoSmart review.
- [ ] Inspect issue/PR comments, bot/agent suggestions, inline comments, submitted reviews, dependency/security findings, workflow checks, and warning/failure annotations.
- [ ] Integrate only when all checks are green, preserve SismoSmart commit identity, keep issue #14 open, and verify Mainline Policy, Security, and CI on `main`.
