# Production Health Inspection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move production-health SSH inspection into a focused, directly testable adapter without changing remote commands, parsed evidence, runtime fallback, or reports.

**Architecture:** Add `scripts/ops/production-health-inspection.mjs` as the owner of shell escaping, inspection output parsing, remote script generation, Passenger application selection, path resolution, and SSH command execution. Keep orchestration, cPanel/workflow reads, aggregation, reporting, and CLI behavior in existing modules; preserve current inspection imports through re-exports from `production-health.mjs`.

**Tech Stack:** Node.js ESM, Node path API, existing deploy config/helpers, Node test runner, Next.js 16.

## Global Constraints

- Parent issue #14 remains open.
- Preserve the remote shell script, parser defaults, output records, application selection, path resolution, command execution, and fallback behavior exactly.
- Preserve `parseRemoteInspection`, `buildRemoteInspectionScript`, and `inspectRemoteProduction` imports through `production-health.mjs`.
- Add no dependency and change no SSH credential flow, cPanel request, GitHub request, probe, aggregation, report, workflow, or production state.
- Inspect all bot, agent, security, dependency, inline-review, submitted-review, annotation, and workflow channels before integration.

---

### Task 1: Establish the inspection-module contract

**Files:**
- Create: `tests/production-health-inspection.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: current `parseRemoteInspection`, `buildRemoteInspectionScript`, and `inspectRemoteProduction` behavior from `scripts/ops/production-health.mjs`.
- Produces: failing requirements for `scripts/ops/production-health-inspection.mjs`.

- [ ] Create the test file with imports from the missing focused module:

```js
import {
  buildRemoteInspectionScript,
  inspectRemoteProduction,
  parseRemoteInspection,
} from "../scripts/ops/production-health-inspection.mjs";
```

- [ ] Add an architecture test that reads `production-health.mjs` and asserts it imports/re-exports the three functions from `production-health-inspection.mjs`, no longer imports `toRemoteAbsolutePath`, `getApplications`, or `runRemoteCommand`, and no longer defines the three functions.
- [ ] Register `tests/production-health-inspection.test.mjs` immediately after `tests/production-health-resolution.test.mjs` in both `test` and `test:coverage`.
- [ ] Run:

```bash
node --import ./tests/alias-loader.mjs --test tests/production-health-inspection.test.mjs
```

- [ ] Verify RED with `ERR_MODULE_NOT_FOUND` for `production-health-inspection.mjs`.

---

### Task 2: Specify parser behavior

**Files:**
- Test: `tests/production-health-inspection.test.mjs`

**Interfaces:**
- Consumes: `parseRemoteInspection(stdout, passenger)`.
- Produces: exact defaults and tab-record conversion contract.

- [ ] Assert empty stdout returns:

```js
{
  buildId: "",
  current: "",
  filesystemUsagePercent: null,
  formLogAvailable: false,
  formRecords: [],
  htaccess: "",
  passenger,
  processCwds: [],
  releaseBytes: null,
  releaseCount: null,
}
```

- [ ] Assert representative `state`, `metric`, `formLog`, and `form` records populate all fields and convert numeric values with `Number`.
- [ ] Assert repeated `processCwd` and `form` records retain order.
- [ ] Assert empty and unknown lines are ignored.

---

### Task 3: Specify script generation

**Files:**
- Test: `tests/production-health-inspection.test.mjs`

**Interfaces:**
- Consumes: `buildRemoteInspectionScript({ config, htaccessPath, passenger, remoteAppRoot, remoteReleasesRoot })`.
- Produces: exact quoting and required command markers.

- [ ] Use synthetic values containing a single quote and assert shell escaping uses the existing `'value'` plus `\\''` form.
- [ ] Assert the generated script contains `set -u`, domain assignment, `readlink -f`, `.next/BUILD_ID`, `next-server` process discovery, release count/bytes, filesystem usage, the four access-log candidates, `tail -n 20000`, contact/waitlist filters, and the exact state/metric/formLog/form record prefixes.
- [ ] Assert the script contains no raw unescaped synthetic quote-bearing value.

---

### Task 4: Specify remote execution behavior

**Files:**
- Test: `tests/production-health-inspection.test.mjs`

**Interfaces:**
- Consumes: `inspectRemoteProduction({ config, getApplicationsImpl, runRemoteCommandImpl, toRemoteAbsolutePathImpl })`.
- Produces: application selection, path conversion, command execution, parse, and rejection contracts.

- [ ] Inject applications where only one matches `remoteAppDomain`, `remoteAppUri`, and non-empty `appRoot`; assert that app root becomes `passenger`.
- [ ] Record `toRemoteAbsolutePathImpl` calls and assert exact order for `remoteAppRoot`, `remoteReleasesRoot`, and `remotePublicRoot`.
- [ ] Return synthetic stdout from `runRemoteCommandImpl`; assert it receives the original config and a script containing the selected Passenger root, and the function returns parsed evidence rather than raw stdout.
- [ ] Provide no matching application and assert script generation uses the existing empty-passenger fallback.
- [ ] Assert application discovery, path conversion, and remote-command errors reject unchanged.

---

### Task 5: Extract the inspection adapter

**Files:**
- Create: `scripts/ops/production-health-inspection.mjs`
- Modify: `scripts/ops/production-health.mjs`
- Test: `tests/production-health-inspection.test.mjs`

**Interfaces:**
- Produces: `parseRemoteInspection`, `buildRemoteInspectionScript`, and `inspectRemoteProduction`.
- Preserves: all three imports from `production-health.mjs`.

- [ ] Move these imports into the new module:

```js
import path from "node:path";
import { toRemoteAbsolutePath } from "../deploy/config.mjs";
import { getApplications, runRemoteCommand } from "../deploy/helpers.mjs";
```

- [ ] Move `shellEscape`, `parseRemoteInspection`, `buildRemoteInspectionScript`, and `inspectRemoteProduction` without changing their production logic.
- [ ] Add only these optional dependency defaults:

```js
export async function inspectRemoteProduction({
  config,
  getApplicationsImpl = getApplications,
  runRemoteCommandImpl = runRemoteCommand,
  toRemoteAbsolutePathImpl = toRemoteAbsolutePath,
})
```

- [ ] Replace internal calls with the injected names while preserving argument order and result handling.
- [ ] Import `inspectRemoteProduction` into `production-health.mjs` and re-export all three inspection functions:

```js
import { inspectRemoteProduction } from "./production-health-inspection.mjs";
export {
  buildRemoteInspectionScript,
  inspectRemoteProduction,
  parseRemoteInspection,
} from "./production-health-inspection.mjs";
```

- [ ] Remove the Node `path` import and deploy config/helper imports that are now inspection-only, while retaining `requireConfig`, `requireSshAuth`, and `pathToFileURL` from `node:url`.
- [ ] Run focused tests:

```bash
node --import ./tests/alias-loader.mjs --test \
  tests/production-health-inspection.test.mjs \
  tests/production-health-resolution.test.mjs \
  tests/production-health-probes.test.mjs \
  tests/production-health.test.mjs \
  tests/production-health-report.test.mjs \
  tests/repository-contract.test.mjs
npm run lint
npm run typecheck
```

- [ ] Mechanically compare the remote script body, parser field handling, application predicate, path calls, and remote command call against `origin/main`.
- [ ] Commit with `SismoSmart <207872631+SismoSmart@users.noreply.github.com>` as author and committer:

```bash
git add package.json scripts/ops/production-health-inspection.mjs scripts/ops/production-health.mjs tests/production-health-inspection.test.mjs
git commit -m "refactor: extract production health inspection"
```

---

### Task 6: Complete validation and integration review

**Files:**
- Test: complete repository
- Review: branch diff and GitHub channels

**Interfaces:**
- Consumes: completed inspection extraction.
- Produces: validated twelfth issue #14 pull request.

- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `NEXT_PUBLIC_ANALYTICS_ENABLED=true npm run build`.
- [ ] Run `npm audit --audit-level=high`.
- [ ] Run real Chrome `npm run test:browser` using the established temporary runtime-library path.
- [ ] Run `git diff origin/main...HEAD --check`, confirm clean status, and verify only planned files changed.
- [ ] Scan the complete diff for credentials, private keys, private addresses, internal paths, provider identifiers, raw external material, and legacy repository identities.
- [ ] Push `refactor/issue-14-production-health-inspection`, open a draft pull request related to #14 without an automatic closing keyword, and request SismoSmart review.
- [ ] Inspect issue/PR comments, bot/agent suggestions, inline comments, submitted reviews, dependency/security findings, workflow checks, and warning/failure annotations.
- [ ] Integrate only when all checks are green, preserve SismoSmart commit identity, keep issue #14 open, and verify Mainline Policy, Security, and CI on `main`.
