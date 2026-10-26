# Browser Form Scenario Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move browser form interaction and forwarding-evidence validation into a focused module while preserving every existing browser and public behavior contract.

**Architecture:** Add `scripts/test/browser-quality-forms.mjs` as the owner of consent preparation, field population, API/form response validation, contact/pilot scenarios, and forwarding evidence. Keep mock/server lifecycle, browser launch, route scenarios, navigation, consent reset, reporting, and CLI orchestration in `browser-quality.mjs` and existing focused modules.

**Tech Stack:** Node.js ESM, Puppeteer Core, Node test runner, Next.js 16.

## Global Constraints

- Parent issue #14 remains open.
- Preserve all selectors, field values, waits, diagnostics, result objects, forwarding checks, screenshots, and cleanup exactly.
- Add no dependency and change no form endpoint, payload schema, mock receiver, workflow, credential, or production behavior.
- Inspect all bot, agent, security, dependency, inline-review, submitted-review, annotation, and workflow channels before integration.

---

### Task 1: Establish the form-module architecture contract

**Files:**
- Create: `tests/browser-quality-forms.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: current form behavior from `scripts/test/browser-quality.mjs`.
- Produces: failing requirements for `browser-quality-forms.mjs`.

- [ ] Import `chooseNecessaryConsentIfVisible`, `fillAndSubmit`, `validateForwardingRecords`, and `runFormScenarios` from the new module.
- [ ] Assert the runner imports `runFormScenarios` and no longer owns the four function bodies or form selectors.
- [ ] Register `tests/browser-quality-forms.test.mjs` immediately before `tests/browser-quality-interactions.test.mjs` in both `test` and `test:coverage`.
- [ ] Run `node --import ./tests/alias-loader.mjs --test tests/browser-quality-forms.test.mjs`.
- [ ] Verify RED with `ERR_MODULE_NOT_FOUND` for `browser-quality-forms.mjs`.

---

### Task 2: Specify consent preparation and field population

**Files:**
- Test: `tests/browser-quality-forms.test.mjs`

**Interfaces:**
- Consumes: `chooseNecessaryConsentIfVisible(page)` and `fillAndSubmit(page, formSelector, fields, selects, options)`.
- Produces: exact banner, field, select, consent, validity, and response-matching contracts.

- [ ] Use fake pages to assert that a visible banner clicks `[data-cookie-choice="necessary"]` and waits up to 5,000 ms for hidden state.
- [ ] Assert hidden or missing banners produce no click and no failure.
- [ ] Record every `waitForSelector`, `type`, `select`, consent click, native-validity inspection, and submit click for representative fields.
- [ ] Invoke the captured response predicate with fake loopback POST, non-loopback POST, loopback GET, and unrelated `/api/` values; assert only the existing loopback POST rule matches.
- [ ] Assert invalid native controls throw `Form native validity failed: <names>.` before submission.

---

### Task 3: Specify response and diagnostic behavior

**Files:**
- Test: `tests/browser-quality-forms.test.mjs`

**Interfaces:**
- Consumes: `fillAndSubmit(...)`.
- Produces: successful API/form-state and timeout-diagnostic contracts.

- [ ] Return a fake status-200 response with a success form state and assert the 15,000 ms wait and successful completion.
- [ ] Return a non-200 response or error form state and assert the exact `Form API status=... code=... state=... text=...` diagnostic.
- [ ] Reject the response wait, return synthetic diagnostic data from `page.evaluate`, inject a stable safe-failure formatter, and assert the exact safe diagnostic serialization.
- [ ] Confirm diagnostic resources retain only API pathnames and no raw form values.

---

### Task 4: Specify forwarding evidence and scenario lifecycle

**Files:**
- Test: `tests/browser-quality-forms.test.mjs`

**Interfaces:**
- Consumes: `validateForwardingRecords(records)` and `runFormScenarios(options)`.
- Produces: two-record security/metadata and contact/pilot lifecycle contracts.

- [ ] Assert two valid sanitized contact/waitlist records pass.
- [ ] Assert wrong count, missing authorization/content-type/form evidence, wrong UTM source, and mismatched locale/source/page path preserve the existing error messages.
- [ ] Run `runFormScenarios` with injected fake pages and helpers; assert contact then pilot order, exact URLs, selectors, field maps, select maps, result objects, and both page closes.
- [ ] Force contact and pilot failures separately; assert the correct screenshot key and guaranteed close.

---

### Task 5: Extract the form implementation

**Files:**
- Create: `scripts/test/browser-quality-forms.mjs`
- Modify: `scripts/test/browser-quality.mjs`
- Test: `tests/browser-quality-forms.test.mjs`

**Interfaces:**
- Produces: `chooseNecessaryConsentIfVisible`, `fillAndSubmit`, `validateForwardingRecords`, and `runFormScenarios`.

- [ ] Move the consent preparation, field/response helper, contact/pilot scenarios, and forwarding-record checks into the new module.
- [ ] Import `safeFailureMessage`, `preparePage`, and `screenshotFailure`; add only the documented narrow injection parameters.
- [ ] Remove moved imports/functions/selectors/data from the runner and import `runFormScenarios`.
- [ ] Run focused form, interaction, page, server, report, executable, repository, and forwarding tests; verify GREEN.
- [ ] Mechanically compare every URL, selector, field value, timeout, response predicate, diagnostic, result field, forwarding check, screenshot key, and cleanup behavior with `origin/main`.
- [ ] Commit with `SismoSmart <207872631+SismoSmart@users.noreply.github.com>` as author and committer.

---

### Task 6: Complete validation and integration review

**Files:**
- Test: complete repository
- Review: branch diff and GitHub channels

**Interfaces:**
- Consumes: completed form extraction.
- Produces: validated ninth issue #14 pull request.

- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `NEXT_PUBLIC_ANALYTICS_ENABLED=true npm run build`.
- [ ] Run `npm audit --audit-level=high`.
- [ ] Run the real Chrome `npm run test:browser` command with the established temporary runtime library path.
- [ ] Run `git diff origin/main...HEAD --check`, confirm clean status, and verify only planned files changed.
- [ ] Scan the complete diff for credentials, private keys, private addresses, internal paths, provider identifiers, raw form material, and legacy repository identities.
- [ ] Push `refactor/issue-14-browser-forms`, open a draft pull request related to #14 without an automatic closing keyword, and request SismoSmart review.
- [ ] Inspect issue/PR comments, bot/agent suggestions, inline comments, submitted reviews, dependency/security findings, workflow checks, and warning/failure annotations.
- [ ] Integrate only when all checks are green, preserve SismoSmart commit identity, keep issue #14 open, and verify Mainline Policy, Security, and CI on `main`.
