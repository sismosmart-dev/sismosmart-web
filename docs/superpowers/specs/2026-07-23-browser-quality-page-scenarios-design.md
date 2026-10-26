# Browser Quality Page Scenario Design

## Goal

Extract shared page preparation, external-request blocking, axe/layout collection, failure screenshots, and localized route/viewport quality checks from `scripts/test/browser-quality.mjs` without changing navigation, consent, form, server, executable, reporting, or CLI behavior.

This is the seventh small delivery for issue #14. The parent issue remains open for the remaining browser interaction scenarios, production-health orchestration, and deployment orchestration.

## Current problem

The browser runner still combines two responsibilities:

- reusable page-quality mechanics: page creation, deterministic browser settings, request interception, DOM/axe inspection, screenshots, and route assertions;
- higher-level flows: navigation, consent, form forwarding, browser/server lifecycle, reporting, and CLI orchestration.

The reusable page-quality mechanics are cohesive and can be tested independently.

## Approaches considered

### Move all remaining browser scenarios

This would remove more lines, but it would move navigation, consent, and two form flows together. That is too broad for one reviewable refactor.

### Move only screenshot persistence

This is low risk but too small to create a useful boundary. Page setup and quality collection would remain coupled to the runner.

### Move the reusable page-quality layer

Create one focused module for page setup, external-request isolation, quality collection, screenshots, and the route/viewport scenario. Keep interaction scenarios in the runner. This is the selected approach.

## Architecture

Create `scripts/test/browser-quality-page.mjs` with these exports:

```js
export async function preparePage(browser, blockedExternalHosts, viewport)
export async function collectPageQuality(page, axeSource)
export async function screenshotFailure(page, key, options?)
export async function runPageScenario(options)
```

The module owns:

- the browser-quality artifact directory;
- reduced-motion emulation;
- CSP bypass, cache disabling, viewport setup, and request interception;
- loopback allowlisting and external hostname evidence;
- DOM dimensions, language, duplicate IDs, axe results, and layout evaluation;
- route response, language, accessibility, duplicate-ID, and overflow blocking rules;
- failure screenshot naming and persistence.

`browser-quality.mjs` imports `preparePage`, `runPageScenario`, and `screenshotFailure`. Navigation, consent, and form flows continue to call the shared page helpers without moving their scenario logic.

## Behavior-preservation rules

- Preserve `setBypassCSP(true)`, reduced-motion emulation, cache disabling, viewport assignment, and request interception order.
- Allow only loopback/data/about requests through the existing `isLoopbackUrl` policy.
- Preserve external-host collection and the `unparseable-external-request` sentinel.
- Preserve axe tags: WCAG 2.0 A/AA and WCAG 2.1 A/AA.
- Preserve serious/critical filtering, duplicate-ID detection, layout evaluation, route status, document language, and font-readiness checks.
- Preserve 30-second route navigation timeout and `domcontentloaded` readiness.
- Preserve route result schema and blocking diagnostic text.
- Preserve screenshot directory, full-page capture, safe filename normalization, and best-effort failure behavior.
- Preserve page closure in `finally`.
- Add no dependency, workflow, route, browser revision, endpoint, credential, or production mutation.

## Testability contract

The page module may accept a narrow `artifactRoot` option only for screenshot tests. Production defaults remain the current repository artifact path.

Focused tests will use fake page/browser objects for deterministic page setup and quality collection, plus a temporary directory for screenshot-path assertions. The full real-Chrome suite remains the acceptance test for integration behavior.

## Testing strategy

Add `tests/browser-quality-page.test.mjs` covering:

- runner delegation and removal of page-quality implementation details;
- deterministic page setup and loopback/external interception behavior;
- quality collection with representative DOM and axe results;
- screenshot filename sanitization and full-page capture;
- successful route scenario output;
- blocking route diagnostics, screenshot attempt, and guaranteed page close.

Existing full tests, production build, dependency audit, and all 12 real-Chrome scenarios remain required.

## Public repository safety

Tests use loopback URLs, synthetic hostnames, fake browser objects, and temporary directories. No credential, private endpoint, production address, internal filesystem path, or provider resource identifier is added.

## Pull-request boundary

The pull request contains only page-quality extraction, focused tests, package test registration, and design/plan documentation. Issue #14 remains open. Every bot, agent, security, dependency, inline-review, submitted-review, check-annotation, and workflow result must be inspected before integration.

## Non-goals

- No navigation scenario extraction.
- No consent scenario extraction.
- No form scenario extraction.
- No server lifecycle, executable discovery, browser launch, reporting, route matrix, or CLI change.
