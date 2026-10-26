# Browser Quality Reporting Modularization Design

## Goal

Extract browser-quality safe-summary formatting, private artifact persistence, and final console publication from `scripts/test/browser-quality.mjs` without changing browser scenarios, server lifecycle, form forwarding, accessibility checks, report schema, exit codes, or CLI behavior.

This is the fourth small delivery for issue #14. The parent issue remains open for browser process/scenario decomposition, production-health orchestration, and deployment orchestration.

## Current problem

The browser runner is approximately 925 lines and combines:

- browser executable discovery;
- loopback application and mock server lifecycle;
- route, navigation, consent, form, layout, and accessibility scenarios;
- report sanitization and safe log formatting;
- private JSON artifact persistence and console publication.

The final reporting boundary is pure or filesystem-bound and can be reviewed independently from Chrome and process management.

## Approaches considered

### Move only artifact writing

This removes very little responsibility and leaves safe formatting and final publication in the runner.

### Extract server/process lifecycle now

This would reduce more lines, but it touches port selection, child-process cleanup, readiness timeouts, and retry behavior. That deserves a separate high-attention slice.

### Extract one focused reporting module

Create `scripts/test/browser-quality-report.mjs` to own safe formatting, sanitization, private JSON output, file permissions, and final console lines. Keep the runner as the compatibility entry point and re-export `formatBrowserSafeSummary`. This is the selected approach.

## Architecture

The new module exports:

```js
export function formatBrowserSafeSummary(report)
export async function publishBrowserQualityReport(report, options?)
```

`publishBrowserQualityReport` uses production defaults matching the existing runner and permits test-only dependency injection:

```js
{
  artifactRoot = defaultArtifactRoot,
  fsImpl = fs,
  logger = console.log,
  pathImpl = path,
  projectRoot = defaultProjectRoot,
}
```

It sanitizes the JSON payload, creates `result.json` with a trailing newline, enforces mode `0600`, logs the safe summary, logs the repository-relative artifact path, and returns the output path.

The runner imports `publishBrowserQualityReport`, re-exports `formatBrowserSafeSummary`, and delegates publication after building the report.

## Behavior-preservation rules

- Keep the report schema and values unchanged.
- Keep `.artifacts/browser-quality/result.json` unchanged.
- Keep JSON sanitization, indentation, trailing newline, and mode `0600` unchanged.
- Keep console order and wording unchanged: safe summary first, relative artifact path second.
- Keep `formatBrowserSafeSummary` import compatibility from `browser-quality.mjs`.
- Keep browser revision, scenarios, failure collection, server lifecycle, screenshots, and exit codes unchanged.
- Add no dependency or production mutation.

## Testing strategy

Add `tests/browser-quality-report.test.mjs` covering:

- module exports and runner delegation;
- safe-summary privacy and scenario evidence;
- artifact JSON equivalence, sanitization, trailing newline, and mode `0600`;
- console line order and repository-relative path;
- no filesystem report-writing implementation remains in the runner.

Existing browser-quality unit tests, full suite, production build, real Chrome checks, and security scans remain required.

## Public repository safety

Fixtures use temporary directories and synthetic sentinel values. No credentials, private endpoints, production paths, addresses, or provider details are added.

## Pull-request boundary

This pull request contains only browser-quality reporting extraction, focused tests, and design/plan documentation. Issue #14 remains open. All bot, agent, security, dependency, review, annotation, and workflow feedback must be inspected before integration.

## Non-goals

- No scenario or route change.
- No browser executable or installation change.
- No mock receiver, Next.js server, port, retry, or cleanup change.
- No report schema or artifact-retention change.
