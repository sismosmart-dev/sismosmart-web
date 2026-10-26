# Browser Quality Executable Discovery Design

## Goal

Extract pinned Chrome revision ownership, executable candidate construction, and executable resolution from `scripts/test/browser-quality.mjs` without changing browser installation, candidate priority, error wording, launch behavior, route coverage, accessibility checks, or CLI compatibility.

This is the fifth small delivery for issue #14. The parent issue remains open for browser server/process lifecycle, browser scenario decomposition, production-health orchestration, and deployment orchestration.

## Current problem

`browser-quality.mjs` remains approximately 889 lines and owns several unrelated responsibilities. Its first section combines browser executable policy with process, mock-server, page, form, accessibility, reporting, and CLI orchestration.

Executable discovery is a focused policy boundary:

- the pinned Chrome Headless Shell revision;
- repository cache path derivation;
- environment-variable priority;
- operating-system fallback candidates;
- filesystem availability checks;
- the installation guidance shown when no executable exists.

These rules can be tested and reviewed independently from launching Chrome.

## Approaches considered

### Extract the complete server and process lifecycle

This would remove more code, but it also touches loopback port allocation, child-process logs, readiness timeouts, retry classification, and termination behavior. That deserves a separate higher-attention change.

### Extract scenario helpers

This would reduce the runner substantially, but route, navigation, consent, form, screenshot, layout, and accessibility flows would move together. The regression surface is too broad for the next smallest slice.

### Extract executable discovery only

Create a focused module that owns the pinned revision and executable resolution policy. Keep the existing runner as the public compatibility entry point by re-exporting the same functions and revision. This is the selected approach.

## Architecture

Create `scripts/test/browser-quality-executable.mjs` with these exports:

```js
export const browserQualityRevision = "150.0.7871.24";
export function getBrowserExecutableCandidates(options?)
export async function resolveBrowserExecutable(options?)
```

The module derives its default cache directory from its own repository-relative location and preserves the current options:

```js
{
  cacheDir,
  env,
  platform,
}
```

`browser-quality.mjs` imports the revision for the generated report and re-exports all three public names. Existing imports from the runner remain valid.

## Candidate and resolution contract

Candidate order remains:

1. `PUPPETEER_EXECUTABLE_PATH`;
2. `CHROME_PATH`;
3. the repository-pinned Puppeteer cache executable;
4. operating-system candidates in their existing order.

Falsy values and duplicates remain removed while retaining first occurrence order. Resolution continues to return the first filesystem-accessible candidate. When none is available, it throws:

```text
Chrome Headless Shell 150.0.7871.24 is not installed. Run npm run browser:install.
```

## Behavior-preservation rules

- Keep the revision exactly `150.0.7871.24`.
- Keep environment priority, cache path construction, platform candidates, deduplication, and error wording unchanged.
- Keep `getBrowserExecutableCandidates`, `resolveBrowserExecutable`, and `browserQualityRevision` available from `browser-quality.mjs`.
- Keep the browser report revision value unchanged.
- Keep Puppeteer launch arguments and all server, mock, scenario, screenshot, reporting, and exit-code behavior unchanged.
- Add no dependency, workflow change, endpoint, secret, or production mutation.

## Testing strategy

Add `tests/browser-quality-executable.test.mjs` covering:

- focused module exports and runner re-export/delegation;
- absence of revision literal, `computeExecutablePath`, and system browser paths from the runner;
- environment and cache candidate ordering across Linux, macOS, and Windows;
- stable deduplication;
- first-accessible-candidate resolution with temporary files;
- exact missing-browser error text;
- unchanged report revision through the runner.

Existing `browser-quality.test.mjs`, full repository tests, production build, real Chrome scenarios, and security checks remain required.

## Public repository safety

Tests use temporary filesystem paths and synthetic environment values only. No credentials, private endpoints, production addresses, internal infrastructure paths, or provider details are added.

## Pull-request boundary

The pull request contains only executable discovery extraction, focused tests, package test registration, and design/plan documentation. Issue #14 remains open. Every bot, agent, security, dependency, inline-review, submitted-review, check-annotation, and workflow result must be inspected before integration.

## Non-goals

- No browser revision upgrade.
- No browser installation workflow change.
- No launch argument or Puppeteer behavior change.
- No mock receiver, Next.js server, port, retry, or cleanup change.
- No browser scenario or reporting change.
