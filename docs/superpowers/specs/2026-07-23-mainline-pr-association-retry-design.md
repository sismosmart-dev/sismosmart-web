# Mainline PR Association Retry Design

## Goal

Prevent false Mainline Policy failures caused by short GitHub commit-to-pull-request association propagation delays while preserving the existing detective control: every pushed `main` commit must still be associated with a merged pull request targeting `main`.

## Confirmed failure mode

For revision `2d1bbb597d4529236ad9c039f6eb4e49e5231b5b`, GitHub started the push-triggered Mainline Policy one second after PR #19 was marked merged. The first commit association query returned no merged pull request and the job failed. The same job, without source changes, passed on rerun after the association endpoint exposed PR #19.

The commit was valid; the failure was a bounded external consistency delay.

## Approaches considered

### Add a fixed sleep before the existing query

This is simple but delays every successful run and still has no explicit upper-bound semantics beyond the chosen sleep.

### Add a shell retry loop inside the workflow

This keeps the current `gh api` call but is difficult to exercise with deterministic unit tests. Policy logic would remain embedded in YAML.

### Add a focused Node verifier

A dependency-free Node module can own the API query, strict filtering, retry policy, diagnostics, and CLI behavior. Tests can inject fetch and sleep implementations to prove immediate success, delayed success, and terminal failure. This is the selected approach.

## Architecture

Create `scripts/ci/verify-mainline-pr-origin.mjs`.

It exports:

```js
export function mergedMainPullRequests(pulls)
export async function verifyMainlinePrOrigin(options)
```

`verifyMainlinePrOrigin` accepts production defaults and test injection points:

```js
{
  attempts = 6,
  commitSha,
  delayMs = 2000,
  fetchImpl = fetch,
  logger = console,
  repository,
  sleep = defaultSleep,
  token,
}
```

The CLI reads `GITHUB_REPOSITORY`, `GITHUB_SHA`, and `GITHUB_TOKEN`.

## Data flow

1. The workflow checks out the exact pushed revision and configures the repository Node version.
2. The verifier requests `/repos/{repository}/commits/{sha}/pulls` with read-only GitHub authentication supplied by the workflow.
3. It accepts only pull requests with non-null `merged_at` and `base.ref === "main"`.
4. On immediate success, it logs the associated merged PR count and exits zero.
5. On a successful HTTP response with no valid PR, it retries up to six attempts with two seconds between attempts.
6. On a non-successful HTTP response, invalid JSON, missing configuration, or exhaustion, it fails closed.

The maximum association wait is ten seconds because the final attempt does not sleep.

## Error handling

- HTTP 4xx and 5xx responses fail immediately; the retry is not an authentication or outage mask.
- Empty or irrelevant successful responses are the only retryable condition.
- Open pull requests and pull requests targeting another base do not satisfy the policy.
- Terminal failure preserves the existing human-readable message that the commit is not associated with a merged pull request.
- The script never logs authentication material or response headers.

## Workflow changes

`.github/workflows/mainline-policy.yml` keeps:

- push and manual triggers;
- `contents: read` and `pull-requests: read` permissions;
- the `governance/pr-origin` job name;
- the existing manual-invocation explanation.

The push path adds pinned checkout and setup-node actions, then invokes the verifier. No package installation is required.

## Testing

Add `tests/mainline-policy.test.mjs` covering:

- strict filtering of merged `main` pull requests;
- immediate success with zero sleep calls;
- delayed success after empty and irrelevant responses;
- bounded terminal failure and exact attempt/sleep counts;
- immediate HTTP failure without retry;
- workflow delegation, pinned setup actions, unchanged permissions, and removal of inline policy logic.

The focused test is registered in `test` and `test:coverage`. Full lint, typecheck, tests, build, audit, and browser checks remain required.

## Security and public repository safety

The verifier uses only the ephemeral authentication supplied by GitHub Actions. No credential value is persisted or logged. Permissions remain read-only. The retry does not weaken policy criteria, extend production access, or change deployment behavior.

## Non-goals

- No branch protection or plan change.
- No automatic merge behavior.
- No production deployment change.
- No retry for authentication, authorization, rate-limit, or server failures.
- No generic GitHub API client abstraction.
