# Browser Navigation and Consent Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move navigation and cookie-consent browser interactions into a focused module while preserving all browser and public behavior contracts.

**Architecture:** Add `scripts/test/browser-quality-interactions.mjs` as the owner of visible-link navigation and consent persistence/reset. Keep form interactions and top-level orchestration in `browser-quality.mjs`.

**Tech Stack:** Node.js ESM, Puppeteer Core, Node test runner, Next.js 16.

## Global Constraints

- Parent issue #14 remains open.
- Preserve viewport, paths, selectors, storage key, waits, success objects, screenshots, and cleanup exactly.
- Change no form, server, browser, workflow, dependency, endpoint, credential, or production behavior.
- Inspect every bot, agent, security, dependency, review, annotation, and workflow channel before integration.

---

### Task 1: Establish the interaction architecture contract

**Files:**
- Create: `tests/browser-quality-interactions.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: current navigation and consent behavior from `browser-quality.mjs`.
- Produces: failing requirements for `browser-quality-interactions.mjs`.

- [ ] Import `clickVisibleLink`, `runNavigationScenario`, and `runConsentScenario` from the new module.
- [ ] Assert the runner imports the new module and no longer owns those function bodies.
- [ ] Register the test immediately before `tests/browser-quality-page.test.mjs` in `test` and `test:coverage`.
- [ ] Run the focused test and verify RED with `ERR_MODULE_NOT_FOUND`.

---

### Task 2: Specify visible-link and navigation behavior

**Files:**
- Test: `tests/browser-quality-interactions.test.mjs`

**Interfaces:**
- Consumes: `clickVisibleLink(page, href)` and `runNavigationScenario(options)`.
- Produces: visible-link, path-preservation, diagnostic, screenshot, and cleanup contracts.

- [ ] Use a fake page to assert the exact visible-link evaluation contract and missing-link error.
- [ ] Run a successful navigation scenario and assert `/en/product`, `/tr/product`, 15-second wait, result object, and page close.
- [ ] Run a mismatch scenario and assert the existing error text, screenshot attempt, and page close.

---

### Task 3: Specify consent behavior

**Files:**
- Test: `tests/browser-quality-interactions.test.mjs`

**Interfaces:**
- Consumes: `runConsentScenario(options)`.
- Produces: storage, selectors, success, screenshot, and cleanup contracts.

- [ ] Use a fake page to assert storage removal, reload, banner wait, necessary-only click, hidden-state check, reset click, storage clearance, and success object.
- [ ] Assert a persistence failure keeps the existing error text, attempts a screenshot, and closes the page.

---

### Task 4: Extract the interaction implementation

**Files:**
- Create: `scripts/test/browser-quality-interactions.mjs`
- Modify: `scripts/test/browser-quality.mjs`
- Test: `tests/browser-quality-interactions.test.mjs`

**Interfaces:**
- Produces: `clickVisibleLink`, `runNavigationScenario`, and `runConsentScenario`.

- [ ] Move the three functions and consent key into the new module.
- [ ] Import page helpers and preserve production defaults; add only documented helper injection points.
- [ ] Remove moved functions and the consent constant from the runner; import the two scenario functions.
- [ ] Run focused interaction/page/server/report/executable/repository tests and verify GREEN.
- [ ] Compare viewport, paths, selectors, timeouts, errors, success fields, screenshots, and cleanup with `origin/main`.
- [ ] Commit with SismoSmart author and committer identity.

---

### Task 5: Validate and integrate

**Files:**
- Test: complete repository
- Review: branch diff and GitHub channels

**Interfaces:**
- Consumes: completed interaction extraction.
- Produces: validated eighth issue #14 pull request.

- [ ] Run lint, typecheck, full tests, analytics-enabled production build, high-severity audit, and real browser quality.
- [ ] Verify clean diff/status, exact changed paths, commit identity, whitespace, and public-safety scans.
- [ ] Push the branch, open a draft PR related to #14 without a closing keyword, and request SismoSmart review.
- [ ] Inspect all bot, agent, security, dependency, inline-review, submitted-review, annotation, and workflow results.
- [ ] Integrate only when green, preserve SismoSmart identity, keep #14 open, and verify Mainline Policy, Security, and CI on `main`.
