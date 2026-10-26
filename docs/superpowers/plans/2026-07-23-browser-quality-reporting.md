# Browser Quality Reporting Modularization Implementation Plan

**Goal:** Move browser-quality report formatting, persistence, and final publication into a focused module while preserving every runtime and output contract.

**Architecture:** Add `scripts/test/browser-quality-report.mjs`; keep `browser-quality.mjs` as browser/process/scenario orchestrator and compatibility entry point.

## Constraints

- Parent issue #14 remains open.
- Preserve report schema, sanitization, path, mode `0600`, newline, logs, and exit codes.
- Preserve `formatBrowserSafeSummary` import compatibility.
- Do not change browser, server, mock, scenario, retry, screenshot, or forwarding behavior.
- Add no dependencies or sensitive values.
- Inspect every bot/agent/review/security/check channel before integration.

---

### Task 1: Establish the reporting contract

**Files:**
- Create: `tests/browser-quality-report.test.mjs`
- Modify: `package.json`

- [ ] Add a failing test requiring `scripts/test/browser-quality-report.mjs` with `formatBrowserSafeSummary` and `publishBrowserQualityReport` exports.
- [ ] Require `browser-quality.mjs` to import the publisher, re-export the formatter, and contain no `fs.writeFile`, `fs.chmod`, or `BROWSER_QUALITY_SAFE` implementation.
- [ ] Test a synthetic report in a temporary directory: sanitized JSON, trailing newline, `0600`, safe-summary privacy, and ordered console lines.
- [ ] Register the test immediately after `tests/browser-quality.test.mjs` in `test` and `test:coverage`.
- [ ] Run the focused test and verify RED because the module does not exist.

---

### Task 2: Extract safe formatting

**Files:**
- Create: `scripts/test/browser-quality-report.mjs`
- Modify: `scripts/test/browser-quality.mjs`

- [ ] Move `formatBrowserSafeSummary` unchanged into the new module.
- [ ] Import `sanitizeBrowserResult` from `browser-quality-lib.mjs`.
- [ ] Re-export `formatBrowserSafeSummary` from the runner.
- [ ] Mechanically compare the formatter with `origin/main`.

---

### Task 3: Extract artifact publication

**Files:**
- Modify: `scripts/test/browser-quality-report.mjs`
- Modify: `scripts/test/browser-quality.mjs`
- Test: `tests/browser-quality-report.test.mjs`

- [ ] Implement `publishBrowserQualityReport` with production defaults and test-only injected filesystem/logger/path dependencies.
- [ ] Preserve mkdir, filename, sanitized JSON, indentation, newline, write mode, chmod, safe-summary log, relative-path log, and return value.
- [ ] Replace runner `writeReport` plus console lines with one publisher call.
- [ ] Run focused browser-quality/reporting/repository tests and verify GREEN.
- [ ] Commit implementation with SismoSmart identity.

---

### Task 4: Full verification and integration

- [ ] Run lint, typecheck, full tests, production build, dependency audit, and real Chrome browser checks.
- [ ] Review diff, identities, whitespace, and public-safety scans.
- [ ] Push `refactor/issue-14-browser-quality-reporting` and open a draft PR related to #14 without closing it.
- [ ] Request SismoSmart review and inspect all bot, agent, inline, submitted, annotation, security, dependency, and workflow channels.
- [ ] Integrate only when clean and verify Mainline Policy, Security, and CI on `main`.
