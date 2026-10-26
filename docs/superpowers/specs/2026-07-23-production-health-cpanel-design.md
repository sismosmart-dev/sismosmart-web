# Production Health cPanel Adapter Design

## Goal

Extract cPanel quota and resource-usage reads from `scripts/ops/production-health.mjs` into a focused adapter without changing authentication, endpoints, timeout behavior, warning text, partial-failure handling, report shape, or production state.

This is the thirteenth small delivery for issue #14. The parent issue remains open for GitHub workflow-read extraction, health aggregation decomposition, and deployment orchestration decomposition.

## Current problem

`production-health.mjs` still owns a distinct cPanel HTTP boundary alongside orchestration and aggregation:

- construction of cPanel UAPI endpoint URLs;
- cPanel authorization and accept headers;
- the 10-second request timeout;
- non-success HTTP error classification;
- concurrent quota and resource-usage reads;
- missing-configuration fallback;
- partial-success result and warning construction.

These responsibilities form one external-system adapter with authentication and failure semantics different from GitHub workflow reads and SSH inspection. Keeping them in the orchestrator makes the file harder to understand and forces cPanel behavior to be tested indirectly.

## Approaches considered

### Move cPanel and GitHub workflow reads together

This would shrink the orchestrator faster, but the two systems use different credentials, URL formats, response shapes, fallback behavior, and error classifications. A combined module would be broad and difficult to review.

### Move only the private `fetchCpanel` helper

This would isolate request construction but leave missing-configuration, concurrency, warnings, and partial-result behavior in the orchestrator. The external-system boundary would remain split.

### Move the complete cPanel adapter

Create one focused module that owns request construction and `readCpanelHealth`. This is the selected approach because the functions change together and share one authentication and warning boundary.

## Architecture

Create `scripts/ops/production-health-cpanel.mjs` with:

```js
export async function fetchCpanelHealthResource(options)
export async function readCpanelHealth(options)
```

The production signature remains compatible:

```js
readCpanelHealth({ config, fetchImpl = fetch })
```

For focused tests, `fetchCpanelHealthResource` receives the existing `config`, `moduleName`, `functionName`, and `fetchImpl` arguments. It is public only to make request behavior directly testable; the orchestrator continues to use only `readCpanelHealth`.

`production-health.mjs` imports `readCpanelHealth` as its default runtime dependency and re-exports it so existing imports remain compatible.

## Components and data flow

1. `runProductionHealth` calls its existing `readCpanel` dependency.
2. The default dependency is imported from `production-health-cpanel.mjs`.
3. `readCpanelHealth` returns the existing unavailable result immediately when host, API credential, or username configuration is missing.
4. When configured, it starts quota and resource-usage requests concurrently with `Promise.allSettled`.
5. Each request uses the same cPanel UAPI path, headers, and 10-second abort signal.
6. Non-success HTTP responses throw the same `CPANEL_<MODULE>_<STATUS>` error.
7. The adapter returns the same payload/null values and warnings for complete success, partial failure, or complete failure.
8. Existing normalization, threshold evaluation, aggregation, sanitization, reporting, and exit-code logic remain in their current modules.

## Behavior-preservation rules

- Preserve endpoint construction as `${config.cpanelHost}/execute/${moduleName}/${functionName}`.
- Preserve `Accept: application/json`.
- Preserve the cPanel authorization header format and source configuration fields.
- Preserve `AbortSignal.timeout(10_000)`.
- Preserve response body parsing with `response.json()` only after a successful response.
- Preserve error text `CPANEL_${moduleName.toUpperCase()}_${response.status}`.
- Preserve the missing-configuration warning exactly: `cPanel quota/resource usage is unavailable`.
- Preserve concurrent quota and resource requests through `Promise.allSettled`.
- Preserve quota request identifiers `Quota` and `get_quota_info`.
- Preserve resource request identifiers `ResourceUsage` and `get_usages`.
- Preserve warning order and exact text for quota and resource failures.
- Preserve successful payloads while returning `null` for only the failed request.
- Preserve propagation behavior of synchronous setup errors before `Promise.allSettled` is created.
- Preserve existing `readCpanelHealth` imports through a re-export from `production-health.mjs`.
- Change no GitHub request, SSH flow, HTTPS probe, aggregation, threshold, report, workflow, dependency, deployment, or production state.

## Error handling

The adapter adds no retry and no broad catch. Individual request failures are converted into existing warning and null-payload results by `Promise.allSettled`. Missing configuration remains a non-throwing unavailable observation. Any unexpected error outside the settled request promises follows existing JavaScript propagation and is still bounded by `runProductionHealth` through `callOrFallback`.

## Testing strategy

Add `tests/production-health-cpanel.test.mjs` covering:

- orchestrator delegation and backward-compatible re-export;
- exact URL, method default, accept header, authorization header, and timeout signal;
- successful JSON parsing;
- exact non-success error classification;
- missing host, credential, or username fallback without making requests;
- concurrent request initiation before either promise settles;
- complete success payloads and empty warnings;
- quota-only failure and warning order;
- resource-only failure and warning order;
- complete failure with both warnings and both payloads null;
- unchanged runtime fallback and aggregation through existing production-health tests.

Register the focused test in both `test` and `test:coverage`. Acceptance gates remain lint, typecheck, the full Node test suite, production build, dependency audit, real Chrome browser/accessibility checks, diff/public-safety review, and all GitHub bot/agent/review/security/check channels.

## Public repository safety

Tests use synthetic documentation-only origins, synthetic usernames, placeholder credentials that cannot authenticate, and injected fetch functions. Assertions inspect request structure without logging or retaining real configuration. No private address, internal path, provider identifier, raw external response, or secret-bearing environment value is added.

## Pull-request boundary

The pull request contains only cPanel extraction, focused tests, package test registration, source-location contract updates, and design/plan documentation. Issue #14 remains open. Before integration, inspect all bot, agent, dependency, security, inline-review, submitted-review, annotation, and workflow channels.

## Non-goals

- No GitHub workflow-read extraction.
- No cPanel credential or endpoint change.
- No retries, backoff, or caching.
- No quota/resource normalization change.
- No health aggregation or classification change.
- No report or CLI behavior change.
- No deployment or production mutation.
