# Production Health GitHub Workflow Adapter Design

## Goal

Extract GitHub Actions workflow-history reads from `scripts/ops/production-health.mjs` into a focused adapter without changing target workflows, environment fallback, request authentication, timeout behavior, error classification, response projection, aggregation, report shape, or production state.

This is the fourteenth small delivery for issue #14. The parent issue remains open for production-health aggregation decomposition and deployment orchestration decomposition.

## Current problem

`production-health.mjs` still owns a distinct GitHub API boundary alongside health aggregation and CLI orchestration:

- the production-health workflow target catalog;
- repository and token fallback from GitHub Actions environment values;
- construction of GitHub workflow-runs URLs;
- API headers and bearer authentication;
- the 10-second request timeout;
- parallel reads for deploy, Lighthouse, and security workflows;
- non-success HTTP error classification;
- projection of raw workflow run records into the safe `{ conclusion, createdAt }` shape.

This external-system adapter changes independently from aggregation and has authentication and response semantics different from cPanel, SSH, DNS, and HTTPS probes.

## Approaches considered

### Move only `readTargetWorkflowRuns`

This would leave the workflow target catalog in the orchestrator because `workflowResult` also iterates it. Duplicating or cross-importing a private constant would create two ownership points.

### Move workflow reads and workflow aggregation together

This would shrink the orchestrator faster, but it would mix external GitHub API access with health classification and warning construction. The pull request would have a broader behavioral surface.

### Move the workflow catalog and GitHub read adapter

Create one focused module that owns the target catalog and all GitHub workflow-history requests. The orchestrator imports the catalog for aggregation and imports the adapter as its runtime dependency. This is the selected approach because it preserves a single target source without moving classification logic.

## Architecture

Create `scripts/ops/production-health-workflows.mjs` with:

```js
export const productionHealthWorkflowTargets = {
  deploy: "deploy-prod.yml",
  lighthouse: "lighthouse.yml",
  security: "security.yml",
};

export async function readTargetWorkflowRuns({
  fetchImpl = fetch,
  repository = process.env.GITHUB_REPOSITORY,
  token = process.env.GITHUB_TOKEN,
} = {})
```

The module imports `node:process` because environment fallback belongs to the GitHub adapter. `production-health.mjs` imports both exports, uses `productionHealthWorkflowTargets` in `workflowResult`, and re-exports `readTargetWorkflowRuns` so existing consumers remain compatible.

## Components and data flow

1. `runProductionHealth` calls its existing `readWorkflowRuns` dependency.
2. The default dependency is imported from `production-health-workflows.mjs`.
3. The adapter resolves `repository` and `token` from explicit options first, then the current GitHub Actions environment variables.
4. Missing repository or token throws `GITHUB_ACTIONS_READ_UNAVAILABLE` before any request.
5. The adapter iterates the three target entries in insertion order and starts all requests through `Promise.all`.
6. Each request uses the same encoded workflow filename, completed-status filter, three-run page limit, headers, bearer value, and 10-second abort signal.
7. A non-success response throws the same `GITHUB_WORKFLOW_<KEY>_<STATUS>` error.
8. Successful payloads project only `conclusion` and `created_at` into `{ conclusion, createdAt }` records; a non-array `workflow_runs` value becomes an empty list.
9. The adapter returns the same object keyed by `deploy`, `lighthouse`, and `security`.
10. Existing workflow streak evaluation, warnings, classification, sanitization, reporting, and exit-code logic remain unchanged.

## Behavior-preservation rules

- Preserve target keys and insertion order: `deploy`, `lighthouse`, `security`.
- Preserve target filenames: `deploy-prod.yml`, `lighthouse.yml`, `security.yml`.
- Preserve explicit-option precedence over environment fallback.
- Preserve missing-input error text `GITHUB_ACTIONS_READ_UNAVAILABLE`.
- Preserve URL format `https://api.github.com/repos/${repository}/actions/workflows/${encodeURIComponent(workflow)}/runs?status=completed&per_page=3`.
- Preserve `Accept: application/vnd.github+json`.
- Preserve `Authorization: Bearer ${token}`.
- Preserve `User-Agent: SismoSmart-Production-Health/1.0`.
- Preserve `X-GitHub-Api-Version: 2022-11-28`.
- Preserve `AbortSignal.timeout(10_000)`.
- Preserve parallel reads through `Promise.all`.
- Preserve exact error text `GITHUB_WORKFLOW_${key.toUpperCase()}_${response.status}`.
- Preserve `response.json()` only after a successful response.
- Preserve safe projection to `conclusion` and `createdAt` only.
- Preserve non-array `workflow_runs` as an empty array.
- Preserve existing `readTargetWorkflowRuns` imports through a re-export from `production-health.mjs`.
- Preserve aggregation access to the exact same target catalog through an imported constant.
- Change no cPanel request, SSH command, DNS resolution, HTTPS probe, threshold, warning, report, workflow configuration, dependency, deployment, or production state.

## Error handling

The adapter adds no retry, caching, pagination, or broad catch. Missing inputs and non-success responses remain hard errors. JSON parsing and injected fetch failures propagate unchanged and remain bounded by the existing `callOrFallback` behavior in `runProductionHealth`.

## Testing strategy

Add `tests/production-health-workflows.test.mjs` covering:

- orchestrator delegation, catalog import, and backward-compatible re-export;
- exact workflow catalog and insertion order;
- explicit repository/token request URLs and exact headers;
- encoded workflow filenames, completed-status filter, and `per_page=3`;
- 10-second timeout signal;
- missing repository or token failure without requests;
- environment fallback behavior with isolated `process.env` restoration;
- parallel request initiation before any response settles;
- exact response projection and object keys;
- non-array `workflow_runs` fallback;
- exact per-target HTTP error classification;
- unchanged runtime fallback and workflow aggregation through existing production-health tests.

Register the focused test in both `test` and `test:coverage`. Acceptance gates remain lint, typecheck, the full Node test suite, production build, dependency audit, real Chrome browser/accessibility checks, complete diff/public-safety review, and every GitHub bot/agent/review/security/check channel.

## Public repository safety

Tests use synthetic repository names, non-authenticating placeholder bearer values, and injected fetch functions. Assertions inspect request structure without logging environment values or raw external material. No private address, internal path, provider identifier, credential, or real API response is added.

## Pull-request boundary

The pull request contains only GitHub workflow-read extraction, focused tests, package test registration, source-location contract updates, and design/plan documentation. Issue #14 remains open. Before integration, inspect all bot, agent, dependency, security, inline-review, submitted-review, annotation, and workflow channels.

## Non-goals

- No workflow streak or warning logic change.
- No retry, pagination, caching, GraphQL, or Octokit dependency.
- No GitHub Actions workflow-file change.
- No credential or permission change.
- No production-health aggregation decomposition.
- No report or CLI behavior change.
- No deployment or production mutation.
