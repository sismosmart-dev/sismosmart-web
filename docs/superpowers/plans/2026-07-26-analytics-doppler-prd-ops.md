# Analytics Doppler prd_ops Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run Analytics Observability through one read-only, config-scoped Doppler `prd_ops` token instead of duplicated GitHub variables and Google/Clarity secrets.

**Architecture:** GitHub stores only `DOPPLER_TOKEN_PRD_OPS`. The workflow installs the official Doppler CLI action pinned to a commit, maps that repository secret to `DOPPLER_TOKEN`, validates the names-only `prd_ops` inventory, and runs status/admin/browser audits through explicit `doppler run --project sismosmart-web --config prd_ops`. Public analytics identifiers continue to come from `config/analytics.json` when no environment override exists.

**Tech Stack:** GitHub Actions, Doppler CLI, Node.js 22, Node test runner, YAML.

## Global Constraints

- No secret value, token prefix, account identifier, origin detail, or private provider data may enter Git, logs, artifacts, issues, or pull requests.
- GitHub may store only the config-scoped read-only bootstrap token for this workflow.
- The workflow must not receive deployment or runtime credentials outside `prd_ops`.
- All Doppler commands must explicitly name project `sismosmart-web` and config `prd_ops`.
- `DNS_LEGACY_IPV4` is optional.

### Task 1: Lock the workflow contract

- [x] Add failing repository and Doppler contract assertions for the pinned CLI action, the single bootstrap secret, explicit `prd_ops` execution, names-only validation, and absence of per-key GitHub mappings.
- [x] Run focused tests and confirm the expected failure.
- [x] Update the workflow, Doppler contract, and runbook minimally.
- [x] Re-run focused tests.

### Task 2: Provision and validate the bootstrap boundary

- [x] Create a read-only `prd_ops` service token without printing it.
- [x] Store it as GitHub repository secret `DOPPLER_TOKEN_PRD_OPS` using the repository-owner session.
- [x] Verify only the secret name and the Doppler names-only inventory.
- [x] Run the analytics admin audit through `prd_ops` and confirm GA4, GTM, and Search Console verification.

### Task 3: Complete quality and live workflow verification

- [x] Run lint, typecheck, full tests, build, browser tests where required, and dependency audit.
- [ ] Commit, push, open a focused pull request, and inspect all checks and feedback.
- [ ] Merge after all required checks pass.
- [ ] Trigger Analytics Observability on `main` and verify the workflow and artifact step complete successfully.
