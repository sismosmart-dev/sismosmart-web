# Browser Form Scenario Design

## Goal

Extract the contact and pilot browser form scenarios from `scripts/test/browser-quality.mjs` without changing form payloads, validation, forwarding evidence, browser lifecycle, page quality, navigation, consent, reporting, or production behavior.

This is the ninth small delivery for issue #14. The parent issue remains open for production-health and deployment orchestration decomposition.

## Current problem

The browser runner still owns a cohesive but large form-testing layer:

- choosing necessary-only consent when the banner is visible;
- filling text and select fields;
- checking native HTML validity;
- waiting for a loopback `/api/*` POST response;
- collecting a bounded safe diagnostic when the response is not observed;
- validating API and rendered form status;
- running contact and pilot scenarios;
- validating two sanitized forwarding evidence records.

These responsibilities are independent from browser launch, local server lifecycle, route accessibility checks, navigation, consent reset, reporting, and CLI orchestration.

## Approaches considered

### Move only field filling

This would create a very small helper module but leave scenario ownership, forwarding evidence, and diagnostic behavior coupled to the runner.

### Move all remaining runner orchestration

This would include browser launch, report assembly, failure classification, and cleanup. That scope is too broad for one reviewable refactor.

### Move the complete form-scenario layer

Create one focused module that owns form interaction and forwarding-evidence validation. Keep browser/server lifecycle and top-level result assembly in the runner. This is the selected approach.

## Architecture

Create `scripts/test/browser-quality-forms.mjs` with these exports:

```js
export async function chooseNecessaryConsentIfVisible(page)
export async function fillAndSubmit(page, formSelector, fields, selects?, options?)
export function validateForwardingRecords(records)
export async function runFormScenarios(options)
```

The module imports:

- `safeFailureMessage` from `browser-quality-server.mjs`;
- `preparePage` and `screenshotFailure` from `browser-quality-page.mjs`.

The module owns:

- conditional necessary-only consent selection;
- exact field and select population;
- native validity inspection;
- loopback API POST matching;
- bounded safe timeout diagnostics;
- API payload, status, and rendered form-state validation;
- contact and pilot route scenarios;
- two-record forwarding evidence and metadata validation;
- best-effort screenshots and guaranteed page closure.

`browser-quality.mjs` imports only `runFormScenarios` from the new module. The mock receiver remains in `browser-quality-server.mjs`, and top-level orchestration continues to pass its sanitized `records` array into the form module.

## Behavior-preservation rules

- Preserve the desktop viewport of 1440x900.
- Preserve contact URL `/en/contact?utm_source=ci` and pilot URL `/tr/pilot-program?utm_source=ci`.
- Preserve every form selector, field name, value, select value, and consent click.
- Preserve native `checkValidity()` behavior and exact invalid-field diagnostic.
- Preserve response matching to loopback hostname `127.0.0.1`, `/api/` path prefix, and POST method.
- Preserve the 15-second API response and form-status waits.
- Preserve the bounded diagnostic fields: handler installation, invalid controls, API resource paths, status state/text, and submit disabled state.
- Preserve safe failure-message sanitization and exact API failure diagnostic.
- Preserve contact/pilot success objects.
- Preserve exactly two forwarded records and all authorization, content type, form, UTM, locale, source, and page-path checks.
- Preserve best-effort screenshots and `finally` page closure.
- Change no route, endpoint, form implementation, mock receiver, dependency, workflow, credential, or production state.

## Testability contract

The form functions may accept narrow dependency-injection options for focused tests:

- `safeFailureMessageImpl` in `fillAndSubmit`;
- `preparePageImpl`, `fillAndSubmitImpl`, `chooseNecessaryConsentIfVisibleImpl`, and `screenshotFailureImpl` in `runFormScenarios`.

Production defaults remain the current repository functions. No production caller supplies the injection options.

## Testing strategy

Add `tests/browser-quality-forms.test.mjs` covering:

- runner delegation and removal of form implementation details;
- consent-banner visible, hidden, and missing behavior;
- exact text/select/consent population and native-validity rejection;
- loopback POST matching, successful API/form status, and safe timeout diagnostic;
- forwarding-record count, security evidence, and route metadata validation;
- successful contact and pilot scenario result objects;
- scenario screenshot attempts and guaranteed page cleanup.

Existing full tests, production build, dependency audit, and all 12 real-Chrome scenarios remain required acceptance checks.

## Public repository safety

Tests use loopback URLs, synthetic example identities, fake page objects, existing public selectors, and sanitized forwarding summaries. No credential, production endpoint, private network address, internal filesystem path, raw payload, or provider identifier is added.

## Pull-request boundary

The pull request contains only form-scenario extraction, focused tests, package test registration, and design/plan documentation. Issue #14 remains open. Before integration, inspect all bot, agent, dependency, security, inline-review, submitted-review, annotation, and workflow channels.

## Non-goals

- No mock receiver or Next.js lifecycle change.
- No page-quality, navigation, consent-reset, executable, reporting, browser-launch, or CLI change.
- No form endpoint, payload schema, production deployment, or production mutation.
