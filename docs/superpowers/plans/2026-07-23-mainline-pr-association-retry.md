# Mainline PR Association Retry Implementation Plan

> **For agentic workers:** Use test-driven development and verification-before-completion for every behavior change.

**Goal:** Make Mainline Policy tolerate only short GitHub commit-to-PR association propagation delays while keeping the merged-main-PR requirement strict.

**Architecture:** Add a dependency-free Node verifier with injectable fetch/sleep/logger dependencies. The workflow checks out the repository, configures the pinned Node version, and delegates policy verification to the script.

## Constraints

- Accept only pull requests with `merged_at` and `base.ref === "main"`.
- Retry only successful HTTP responses that contain no valid merged-main PR.
- Fail immediately on HTTP errors, invalid response data, or missing configuration.
- Use six attempts and a two-second delay by default; maximum wait is ten seconds.
- Preserve read-only workflow permissions, job name, triggers, and failure wording.
- Add no dependencies and log no authentication material.
- Inspect all bot, agent, security, dependency, review, annotation, and workflow feedback before integration.

---

### Task 1: Establish the failing policy contract

**Files:**
- Create: `tests/mainline-policy.test.mjs`
- Modify: `package.json`

1. Add tests importing:

```js
import {
  mergedMainPullRequests,
  verifyMainlinePrOrigin,
} from "../scripts/ci/verify-mainline-pr-origin.mjs";
```

2. Cover strict filtering:
   - merged PR with base `main` is accepted;
   - open PR is ignored;
   - merged PR with another base is ignored;
   - malformed entries are ignored.

3. Cover immediate success:
   - one fetch call;
   - zero sleep calls;
   - success log includes commit and count.

4. Cover delayed success:
   - first response empty;
   - second response contains irrelevant PRs;
   - third response contains a merged-main PR;
   - two sleep calls with the configured delay;
   - retry diagnostics are logged.

5. Cover terminal failure:
   - exact attempt count;
   - sleeps only between attempts;
   - final error retains `not associated with a merged pull request`.

6. Cover HTTP failure:
   - non-2xx response rejects immediately;
   - no retry sleep occurs.

7. Cover workflow source:
   - pinned checkout and setup-node actions are present;
   - `NODE_VERSION` is pinned to `22.18.0`;
   - push step runs `node scripts/ci/verify-mainline-pr-origin.mjs`;
   - permissions remain `contents: read` and `pull-requests: read`;
   - inline `gh api` policy logic is absent.

8. Register `tests/mainline-policy.test.mjs` in `test` and `test:coverage` after `tests/github-only-automation.test.mjs`.

9. Run:

```bash
node --import ./tests/alias-loader.mjs --test tests/mainline-policy.test.mjs
```

Expected: RED because the verifier does not exist and the workflow still contains inline logic.

---

### Task 2: Implement the verifier

**Files:**
- Create: `scripts/ci/verify-mainline-pr-origin.mjs`
- Test: `tests/mainline-policy.test.mjs`

1. Export `mergedMainPullRequests(pulls)` and filter only merged-main PR objects.

2. Implement one API request helper:
   - URL: `https://api.github.com/repos/{repository}/commits/{commitSha}/pulls`;
   - headers: GitHub JSON accept header, API version, and bearer authentication;
   - throw on non-2xx before retry logic;
   - require an array response.

3. Implement `verifyMainlinePrOrigin` with defaults:

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

4. Validate repository, SHA, token, attempts, and delay before any request.

5. Retry only when the API response is successful but has zero valid PRs. Log an informational retry line without response bodies or credentials.

6. Return the valid PR count immediately on success.

7. Throw the existing policy failure wording after exhaustion.

8. Add CLI execution guarded by `import.meta.url`:
   - read `GITHUB_REPOSITORY`, `GITHUB_SHA`, `GITHUB_TOKEN`;
   - print `::error::` plus the safe error message;
   - print the existing detective-control explanation;
   - set exit code 1.

9. Run focused tests and verify GREEN.

---

### Task 3: Delegate the workflow and preserve repository contracts

**Files:**
- Modify: `.github/workflows/mainline-policy.yml`
- Modify: `tests/repository-contract.test.mjs`

1. Add workflow-level `NODE_VERSION: "22.18.0"`.

2. In the push path add pinned actions already used by CI:
   - checkout `df4cb1c069e1874edd31b4311f1884172cec0e10`;
   - setup-node `48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e`.

3. Replace inline shell logic with:

```yaml
- name: Verify main commit came through a merged pull request
  if: ${{ github.event_name == 'push' }}
  env:
    GITHUB_TOKEN: ${{ github.token }}
  run: node scripts/ci/verify-mainline-pr-origin.mjs
```

4. Keep triggers, permissions, job name, and manual explanation unchanged.

5. Update the repository contract to assert the workflow delegates to the script and the script contains the commit pulls endpoint plus failure wording. Do not weaken production governance assertions.

6. Run:

```bash
node --import ./tests/alias-loader.mjs --test \
  tests/mainline-policy.test.mjs \
  tests/repository-contract.test.mjs \
  tests/github-only-automation.test.mjs
```

Expected: GREEN.

7. Commit implementation:

```bash
git add .github/workflows/mainline-policy.yml package.json \
  scripts/ci/verify-mainline-pr-origin.mjs \
  tests/mainline-policy.test.mjs tests/repository-contract.test.mjs
git diff --cached --check
git commit -m "fix: retry mainline PR association lookup"
```

---

### Task 4: Full verification and integration

1. Run:

```bash
npm run lint
npm run typecheck
npm test
NEXT_PUBLIC_ANALYTICS_ENABLED=true npm run build
npm audit --audit-level=high
npm run test:browser
```

2. Review the complete diff and scan for credentials, private keys, private addresses, internal paths, provider details, and legacy repository identities.

3. Push `fix/issue-20-mainline-pr-association-retry` and open a draft PR resolving #20.

4. Request SismoSmart review and inspect every bot, agent, security, dependency, inline-review, submitted-review, annotation, and workflow result.

5. Integrate only after all checks are green. Confirm the push-triggered Mainline Policy passes on the integrated revision without a manual rerun.
