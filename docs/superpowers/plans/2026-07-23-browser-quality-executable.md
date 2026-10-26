# Browser Quality Executable Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move pinned Chrome revision and executable discovery into a focused module while preserving all browser-quality runtime and compatibility contracts.

**Architecture:** Add `scripts/test/browser-quality-executable.mjs` as the executable-policy owner. Keep `scripts/test/browser-quality.mjs` as the CLI/runtime entry point and re-export the existing executable APIs.

**Tech Stack:** Node.js ESM, `@puppeteer/browsers`, Node test runner, Puppeteer Core, Next.js 16.

## Global Constraints

- Parent issue #14 remains open.
- Preserve revision `150.0.7871.24`, candidate order, deduplication, cache path, platform paths, access checks, and exact error wording.
- Preserve runner imports for `getBrowserExecutableCandidates`, `resolveBrowserExecutable`, and `browserQualityRevision`.
- Change no launch, server, mock, scenario, screenshot, reporting, workflow, endpoint, dependency, or production behavior.
- Inspect all bot, agent, security, dependency, review, annotation, and workflow feedback before integration.

---

### Task 1: Establish the executable discovery contract

**Files:**
- Create: `tests/browser-quality-executable.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: current runner exports and revision.
- Produces: failing architecture and behavior requirements for the focused module.

- [ ] **Step 1: Write the failing architecture test**

Require `scripts/test/browser-quality-executable.mjs` and assert it exports:

```js
browserQualityRevision
getBrowserExecutableCandidates
resolveBrowserExecutable
```

Assert the runner imports or re-exports those names and does not contain the revision literal, `computeExecutablePath`, or system browser path strings.

- [ ] **Step 2: Add executable policy behavior tests**

Use synthetic environment objects and temporary files to assert:

```text
PUPPETEER_EXECUTABLE_PATH -> CHROME_PATH -> pinned cache -> system candidates
```

Verify duplicate paths appear once, platform lists remain unchanged, the first accessible file is selected, and the missing-browser error text remains exact.

- [ ] **Step 3: Register the test**

Add `tests/browser-quality-executable.test.mjs` immediately before `tests/browser-quality.test.mjs` in both `test` and `test:coverage`.

- [ ] **Step 4: Verify RED**

Run:

```bash
node --import ./tests/alias-loader.mjs --test tests/browser-quality-executable.test.mjs
```

Expected: fail because `scripts/test/browser-quality-executable.mjs` does not exist.

---

### Task 2: Extract revision and candidate construction

**Files:**
- Create: `scripts/test/browser-quality-executable.mjs`
- Modify: `scripts/test/browser-quality.mjs`
- Test: `tests/browser-quality-executable.test.mjs`

**Interfaces:**
- Produces: `browserQualityRevision` and `getBrowserExecutableCandidates(options?)`.

- [ ] **Step 1: Move the revision and cache default**

Move revision `150.0.7871.24` and repository cache derivation into the focused module using `fileURLToPath(import.meta.url)`.

- [ ] **Step 2: Move candidate construction unchanged**

Move `unique` and `getBrowserExecutableCandidates` without changing environment priority or platform arrays.

- [ ] **Step 3: Re-export from the runner**

Import the revision for report generation and re-export the revision and candidate function from `browser-quality.mjs`.

- [ ] **Step 4: Verify candidate tests GREEN**

Run the focused test. Expected: candidate and architecture assertions pass; resolver assertions may still fail until Task 3.

---

### Task 3: Extract executable resolution

**Files:**
- Modify: `scripts/test/browser-quality-executable.mjs`
- Modify: `scripts/test/browser-quality.mjs`
- Test: `tests/browser-quality-executable.test.mjs`
- Test: `tests/browser-quality.test.mjs`

**Interfaces:**
- Produces: `resolveBrowserExecutable(options?)` with unchanged return and error contracts.

- [ ] **Step 1: Move resolution unchanged**

Move the filesystem access loop and exact installation error into the focused module.

- [ ] **Step 2: Re-export resolver compatibility**

Re-export `resolveBrowserExecutable` from the existing runner and use the imported resolver inside `runBrowserQuality`.

- [ ] **Step 3: Verify focused GREEN**

Run:

```bash
node --import ./tests/alias-loader.mjs --test tests/browser-quality-executable.test.mjs tests/browser-quality.test.mjs tests/browser-quality-report.test.mjs tests/repository-contract.test.mjs
```

Expected: every focused test passes.

- [ ] **Step 4: Mechanically review the move**

Compare candidate arrays, revision, priority order, cache construction, access loop, and error string against `origin/main`. No behavioral difference is allowed.

- [ ] **Step 5: Commit implementation**

Commit the module, runner delegation, test registration, and focused test with SismoSmart author and committer identity.

---

### Task 4: Complete repository validation and integration review

**Files:**
- Test: complete repository
- Review: branch diff and GitHub feedback

**Interfaces:**
- Consumes: completed executable extraction.
- Produces: validated fifth issue #14 pull request.

- [ ] **Step 1: Run complete local validation**

```bash
npm run lint
npm run typecheck
npm test
NEXT_PUBLIC_ANALYTICS_ENABLED=true npm run build
npm audit --audit-level=high
npm run test:browser
```

Expected: all commands pass.

- [ ] **Step 2: Review diff and public safety**

```bash
git diff origin/main...HEAD --check
git status --short
git diff --name-status origin/main...HEAD
```

Confirm only executable discovery, runner delegation, tests, package scripts, and documents changed. Scan for credentials, private keys, private addresses, internal paths, provider identifiers, and legacy repository identities.

- [ ] **Step 3: Publish a draft pull request**

Push `refactor/issue-14-browser-executable`, open a draft PR related to #14 without an automatic closing keyword, and request SismoSmart review.

- [ ] **Step 4: Inspect every GitHub feedback channel**

Review issue and PR comments, bot and agent suggestions, inline comments, submitted reviews, dependency/security findings, workflow checks, and warning/failure annotations. Resolve actionable findings before integration.

- [ ] **Step 5: Integrate and verify main**

Integrate only when all checks are green, preserve SismoSmart author/committer identity, keep issue #14 open, and verify Mainline Policy, Security, and CI on the resulting `main` revision.
