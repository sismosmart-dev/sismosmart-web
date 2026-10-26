# Logical GA Page View Hotfix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore one logical GA page view after consent while preserving GTM/Clarity loading and eliminating false failures caused by mirrored analytics beacons or loader retries.

**Architecture:** The consent bootstrap queues one guarded GA `config` command before the GTM container loads. The audit treats exactly one GA config command plus at least one page-view beacon as one logical page view; raw network fanout remains bounded. DOM script IDs, rather than retry-prone request counts, remain the duplicate-loader invariant.

**Tech Stack:** Next.js inline consent bootstrap, Puppeteer production audit, Node.js test runner, GitHub Actions.

## Global Constraints

- No analytics loader or event may run before accepted consent.
- Exactly one GA config command may be queued per page load.
- GA-only fallback behavior must remain unchanged.
- GTM and Clarity must remain consent-gated.
- Audit reports must remain sanitized.

### Task 1: Lock logical page-view behavior
- [x] Add failing tests for one guarded GA config command in the GTM branch.
- [x] Add failing tests for logical page-view helpers and retry-tolerant GTM network observations.
- [x] Verify expected failures.

### Task 2: Implement the minimal hotfix
- [x] Restore the guarded GA config command before GTM bootstrap.
- [x] Count logical page views from one config command plus observed beacon evidence.
- [x] Keep raw beacon fanout bounded and duplicate DOM script IDs blocking.
- [x] Update the analytics runbook.

### Task 3: Verify and deliver
- [x] Run focused tests and the full quality gate.
- [x] Run an analytics-enabled loopback Chrome audit.
- [ ] Open and merge a focused PR after all checks pass.
- [ ] Deploy the exact main SHA transactionally.
- [ ] Confirm the automatic production Analytics Observability workflow passes.
