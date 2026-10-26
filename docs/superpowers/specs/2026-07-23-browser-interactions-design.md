# Browser Navigation and Consent Interaction Design

## Goal

Extract the browser navigation and cookie-consent interaction scenarios from `scripts/test/browser-quality.mjs` without changing form forwarding, page quality, server lifecycle, browser launch, reporting, or CLI behavior.

This is the eighth small delivery for issue #14. The parent issue remains open for form-scenario, production-health, and deployment orchestration decomposition.

## Current problem

The browser runner still owns two simple interaction scenarios alongside the much larger form workflow and top-level orchestration:

- visible-link navigation with locale-switch path preservation;
- necessary-only consent persistence and consent reset.

These scenarios share page preparation and screenshot behavior but do not depend on the form receiver or form diagnostics.

## Approaches considered

### Move navigation only

This is the smallest possible change but leaves another closely related interaction in the runner and creates an overly narrow module.

### Move all remaining scenarios

This removes more lines but couples simple navigation/consent behavior to the large form submission and forwarding-evidence flow. The review surface is too broad.

### Move navigation and consent together

Create one focused interaction module for visible navigation and consent behavior. Keep form submission in the runner. This is the selected approach.

## Architecture

Create `scripts/test/browser-quality-interactions.mjs` with these exports:

```js
export async function clickVisibleLink(page, href)
export async function runNavigationScenario(options)
export async function runConsentScenario(options)
```

The module imports `preparePage` and `screenshotFailure` from `browser-quality-page.mjs`.

The module owns:

- finding and clicking a visible link;
- waiting for `/en/product` navigation;
- checking that the Turkish locale switch preserves `/product`;
- clearing the consent storage key;
- reloading and waiting for the consent banner;
- persisting the necessary-only choice;
- checking that the banner hides;
- resetting consent and checking that storage is cleared;
- best-effort failure screenshots and guaranteed page closure.

`browser-quality.mjs` imports `runNavigationScenario` and `runConsentScenario`. Form helpers and form scenarios remain in the runner.

## Behavior-preservation rules

- Preserve the desktop viewport of 1440x900.
- Preserve `/en`, `/en/product`, and `/tr/product` paths.
- Preserve visible-link checks based on size and CSS visibility.
- Preserve the 15-second navigation wait.
- Preserve the consent storage key `sismosmart_cookie_consent`.
- Preserve necessary-only and reset selectors and storage values.
- Preserve `domcontentloaded` readiness.
- Preserve success result objects.
- Preserve best-effort screenshots and `finally` page closure.
- Change no form, server, browser, workflow, dependency, endpoint, credential, or production behavior.

## Testability contract

The scenario functions may accept narrow helper injection parameters for `preparePage`, `clickVisibleLink`, and `screenshotFailure`. Production defaults remain the existing functions.

## Testing strategy

Add `tests/browser-quality-interactions.test.mjs` covering:

- runner delegation and removal of navigation/consent implementations;
- visible-link selection and missing-link failure;
- navigation success and locale-switch preservation;
- navigation mismatch diagnostics, screenshot attempt, and cleanup;
- consent necessary-only persistence and reset;
- consent failure screenshot and cleanup.

The full repository suite, production build, dependency audit, and all 12 real-Chrome scenarios remain required.

## Public repository safety

Tests use loopback URLs, synthetic fake pages, existing public selectors, and no credential or production infrastructure values.

## Pull-request boundary

The pull request contains only navigation/consent extraction, focused tests, package test registration, and design/plan documentation. Issue #14 remains open. All bot, agent, security, dependency, review, annotation, and workflow channels must be inspected before integration.

## Non-goals

- No form scenario extraction.
- No page-quality, server-lifecycle, executable-discovery, report, browser-launch, or CLI change.
- No production deployment or mutation.
