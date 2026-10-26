# Production Health Resolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move production-health DNS and origin-address resolution into a focused, directly testable module without changing runtime or report behavior.

**Architecture:** Add `scripts/ops/production-health-resolution.mjs` as the owner of safe error-code normalization, public DNS timing, and SSH-host origin resolution. Keep orchestration, probes, SSH inspection, cPanel, workflow reads, aggregation, reporting, and CLI behavior in existing modules; preserve resolver imports through re-exports from `production-health.mjs`.

**Tech Stack:** Node.js ESM, Node DNS/net/performance APIs, Node test runner, Next.js 16.

## Global Constraints

- Parent issue #14 remains open.
- Preserve public DNS lookup options, duration rounding, result objects, error-code normalization, direct IP handling, and origin hostname lookup exactly.
- Preserve `runProductionHealth` fallback behavior and public report shape.
- Add no dependency and change no probe, SSH, cPanel, workflow, report, credential, or production behavior.
- Inspect all bot, agent, security, dependency, inline-review, submitted-review, annotation, and workflow channels before integration.

---

### Task 1: Establish the resolution-module contract

**Files:**
- Create: `tests/production-health-resolution.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: current `safeErrorCode`, `resolvePublicDns`, and `resolveOriginAddress` behavior from `scripts/ops/production-health.mjs`.
- Produces: failing requirements for `scripts/ops/production-health-resolution.mjs`.

- [ ] Import `safeErrorCode`, `resolvePublicDns`, and `resolveOriginAddress` from the new module.
- [ ] Assert `production-health.mjs` imports and re-exports resolver functions from `production-health-resolution.mjs` and no longer imports Node DNS/net/performance directly.
- [ ] Register `tests/production-health-resolution.test.mjs` immediately before `tests/production-health.test.mjs` in both `test` and `test:coverage`.
- [ ] Run `node --import ./tests/alias-loader.mjs --test tests/production-health-resolution.test.mjs`.
- [ ] Verify RED with `ERR_MODULE_NOT_FOUND` for `production-health-resolution.mjs`.

---

### Task 2: Specify safe error-code behavior

**Files:**
- Test: `tests/production-health-resolution.test.mjs`

**Interfaces:**
- Consumes: `safeErrorCode(error)`.
- Produces: exact normalization contract used by resolvers and orchestrator fallbacks.

- [ ] Assert an uppercase underscore code such as `EAI_AGAIN` is preserved.
- [ ] Assert lowercase, punctuation, whitespace, and missing error objects return `REQUEST_FAILED`.
- [ ] Assert a numeric code is converted to a string and preserved when it matches the safe pattern.
- [ ] Assert the function never returns an error message or stack.

---

### Task 3: Specify public DNS resolution

**Files:**
- Test: `tests/production-health-resolution.test.mjs`

**Interfaces:**
- Consumes: `resolvePublicDns({ hostname, lookupImpl, nowImpl })`.
- Produces: deterministic lookup, timing, success, empty-result, and failure contracts.

- [ ] Inject a lookup function that records arguments and returns two documentation-only addresses.
- [ ] Inject a deterministic clock sequence and assert lookup uses `{ all: true }`, result is `{ durationMs: 1.24, ok: true }`, and no addresses are retained.
- [ ] Return an empty address list and assert `{ durationMs, ok: false }` without an error code.
- [ ] Throw an error with `code: "EAI_AGAIN"` and assert `{ durationMs, errorCode: "EAI_AGAIN", ok: false }`.
- [ ] Throw an unsafe error code and assert `REQUEST_FAILED`.

---

### Task 4: Specify origin-address resolution

**Files:**
- Test: `tests/production-health-resolution.test.mjs`

**Interfaces:**
- Consumes: `resolveOriginAddress({ config, isIpImpl, lookupImpl })`.
- Produces: direct IPv4/IPv6, hostname lookup, and failure contracts.

- [ ] Inject `isIpImpl` returning `4` and `6`; assert direct addresses return without calling DNS.
- [ ] Inject hostname lookup returning `{ address, family }`; assert exact success result and lookup argument.
- [ ] Throw a safe lookup error and assert the exact failure object.
- [ ] Throw an unsafe lookup error and assert `REQUEST_FAILED`.

---

### Task 5: Extract the resolution implementation

**Files:**
- Create: `scripts/ops/production-health-resolution.mjs`
- Modify: `scripts/ops/production-health.mjs`
- Test: `tests/production-health-resolution.test.mjs`

**Interfaces:**
- Produces: `safeErrorCode`, `resolvePublicDns`, and `resolveOriginAddress`.
- Preserves: `resolvePublicDns` and `resolveOriginAddress` imports from `production-health.mjs`.

- [ ] Move Node DNS/net/performance imports, duration rounding, safe error-code normalization, and both resolver functions into the new module.
- [ ] Add only the documented optional dependency parameters with production defaults.
- [ ] Import `safeErrorCode`, `resolvePublicDns`, and `resolveOriginAddress` into the orchestrator.
- [ ] Re-export `resolvePublicDns` and `resolveOriginAddress` from the orchestrator.
- [ ] Remove the old imports and function bodies.
- [ ] Run focused resolution, production-health, probe, report, and repository contracts; verify GREEN.
- [ ] Mechanically compare lookup options, result shapes, rounding, direct-IP behavior, and error normalization with `origin/main`.
- [ ] Commit with `SismoSmart <207872631+SismoSmart@users.noreply.github.com>` as author and committer.

---

### Task 6: Complete validation and integration review

**Files:**
- Test: complete repository
- Review: branch diff and GitHub channels

**Interfaces:**
- Consumes: completed resolution extraction.
- Produces: validated eleventh issue #14 pull request.

- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `NEXT_PUBLIC_ANALYTICS_ENABLED=true npm run build`.
- [ ] Run `npm audit --audit-level=high`.
- [ ] Run real Chrome `npm run test:browser` using the established temporary runtime-library path.
- [ ] Run `git diff origin/main...HEAD --check`, confirm clean status, and verify only planned files changed.
- [ ] Scan the complete diff for credentials, private keys, private addresses, internal paths, provider identifiers, raw external material, and legacy repository identities.
- [ ] Push `refactor/issue-14-production-health-resolution`, open a draft pull request related to #14 without an automatic closing keyword, and request SismoSmart review.
- [ ] Inspect issue/PR comments, bot/agent suggestions, inline comments, submitted reviews, dependency/security findings, workflow checks, and warning/failure annotations.
- [ ] Integrate only when all checks are green, preserve SismoSmart commit identity, keep issue #14 open, and verify Mainline Policy, Security, and CI on `main`.
