# Production Health Aggregation Design

## Goal

Extract the pure production-health aggregation helpers from `scripts/ops/production-health.mjs` into a focused module without changing measurement order, thresholds, warning text or order, report shape, classification, sanitization, exit codes, external requests, or production state.

This is the fifteenth small delivery for issue #14. The parent issue remains open for deployment orchestration decomposition.

## Current problem

`production-health.mjs` now has focused external adapters, but it still mixes orchestration with roughly half of its remaining implementation:

- warm-route lookup;
- safe probe and route-set projection;
- filesystem, release, quota, and resource capacity aggregation;
- threshold warning generation;
- form runtime and access-log aggregation;
- workflow failure-streak aggregation and warning generation.

These helpers are deterministic transformations over already collected observations. Keeping them in the orchestration file makes `runProductionHealth` harder to read and forces focused aggregation behavior to be tested through the full runtime.

## Approaches considered

### Move only probe summarization

This would be very low risk, but it would leave capacity, form, and workflow aggregation mixed into the orchestrator and provide limited reduction.

### Move all of `runProductionHealth`

This would shrink the entrypoint quickly, but it would combine external adapter scheduling, fallbacks, aggregation, report assembly, classification, sanitization, and CLI behavior in one broad change.

### Move the deterministic aggregation helpers

Create one focused module that owns route lookup and projection plus capacity, form, and workflow result construction. Keep data collection, fallback scheduling, final report assembly, classification, sanitization, and CLI handling in `production-health.mjs`. This is the selected approach because the moved functions are pure except for deliberate mutation of the supplied warnings array, share the same result-construction responsibility, and can be tested directly.

## Architecture

Create `scripts/ops/production-health-aggregation.mjs` with these exports:

```js
export function findWarmRoute(routeSet, key)
export function summarizeProductionHealthProbe(probe)
export function summarizeProductionHealthRouteSet(routeSet)
export function buildProductionHealthCapacityResult(remote, quota, resources, warnings)
export function buildProductionHealthFormsResult(publicSet, remote, warnings)
export function buildProductionHealthWorkflowResult(runsByTarget, warnings)
```

The module imports the existing deterministic helpers from `production-health-lib.mjs` and imports `productionHealthWorkflowTargets` from `production-health-workflows.mjs`. `production-health.mjs` imports the six aggregation exports and uses them in the same locations and order as the existing private helpers.

No compatibility re-export is required because the old aggregation helpers are private. The focused exports are public only for direct tests and future internal reuse.

## Components and data flow

1. `runProductionHealth` collects DNS, origin resolution, public/origin route probes, remote inspection, cPanel observations, and workflow history exactly as before.
2. `summarizeProductionHealthRouteSet` projects raw route sets and delegates each cold/warm observation to `summarizeProductionHealthProbe`.
3. `findWarmRoute` selects the same warm route observation by key for latency and form checks.
4. Existing normalization helpers produce quota and resource observations.
5. `buildProductionHealthCapacityResult` applies the same thresholds, resource percentage calculation, warning messages, and blocking rule.
6. `buildProductionHealthFormsResult` applies the same route requirements, access-log aggregation, warning branches, and blocking rule.
7. When workflow history exists, `buildProductionHealthWorkflowResult` applies the same target order, two-run failure threshold, one-failure warning, and blocking rule.
8. `runProductionHealth` continues to add unavailable-data warnings, construct `reportBase`, deduplicate warnings, call `classifyHealth`, sanitize the report, and derive the exit code.

## Behavior-preservation rules

- Preserve warm-route lookup with optional chaining and first matching key.
- Preserve null probe behavior.
- Preserve probe projection field names, boolean coercions, null fallbacks, and optional `configured` behavior.
- Preserve route-set `ok` coercion, route order, keys, and cold/warm projection.
- Preserve `GIB = 1024 ** 3` and all filesystem, release-count, release-bytes, and quota thresholds.
- Preserve quota threshold evaluation only when quota is available.
- Preserve resource usage percentage calculation and rounding to two decimal places.
- Preserve threshold warning labels, exact messages, and iteration order.
- Preserve the extra `account quota limit is unavailable` warning.
- Preserve capacity blocking evaluation and return shape.
- Preserve contact and waitlist warm-route requirements, target checks, access aggregation, server-error threshold, warning branches, runtime booleans, and return shape.
- Preserve workflow target order from `productionHealthWorkflowTargets`, the two-failure blocking threshold, one-failure warning text, and return shape.
- Preserve deliberate append-only mutation of the supplied warnings array.
- Preserve call order in `runProductionHealth` so warning order remains unchanged.
- Change no adapter request, timeout, credential flow, fallback, normalization helper, release evaluation, report field, classification, sanitization, workflow file, deployment behavior, dependency, or production state.

## Error handling

The focused module adds no catch, retry, validation, or fallback. Invalid input behavior follows the existing JavaScript operations. External failures remain bounded in `runProductionHealth` by `callOrFallback`. The supplied warnings array remains required by convention and is mutated exactly as before.

## Testing strategy

Add `tests/production-health-aggregation.test.mjs` covering:

- runtime delegation and removal of old private definitions;
- warm-route selection and missing-route behavior;
- null and representative probe projection;
- route-set order and cold/warm projection;
- capacity thresholds, resource percentages, warning order, unavailable quota behavior, and blocking result;
- form runtime success, access aggregation, unavailable-log warning, server-error warning, and blocking threshold;
- workflow target order, one-failure warnings, two-failure blocking, and empty inputs;
- unchanged full-runtime report behavior through existing production-health tests.

Register the focused test in both `test` and `test:coverage`. Acceptance gates remain lint, typecheck, the full Node test suite, production build, dependency audit, real Chrome browser/accessibility checks, complete diff/public-safety review, and every GitHub bot/agent/review/security/check channel.

## Public repository safety

Tests use synthetic numeric observations and workflow records. No network values, credentials, paths, provider identifiers, raw external payloads, or private report artifacts are added. The extraction retains the existing sanitized public result shapes.

## Pull-request boundary

The pull request contains only aggregation extraction, focused tests, package test registration, source-location contract updates if required, and design/plan documentation. Issue #14 remains open for deployment orchestration decomposition. Before integration, inspect all bot, agent, dependency, security, inline-review, submitted-review, annotation, and workflow channels.

## Non-goals

- No external adapter or fallback change.
- No release evaluation or normalization change.
- No final report assembly extraction.
- No classification or sanitization change.
- No threshold, warning, blocking, or exit-code change.
- No CLI or workflow-file change.
- No deployment or production mutation.
