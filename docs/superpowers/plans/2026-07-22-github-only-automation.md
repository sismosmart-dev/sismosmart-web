# GitHub-Only Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and superpowers:test-driven-development.

**Goal:** Remove the retired secondary automation surface and make GitHub the sole control plane.

**Architecture:** Delete provider-specific files and compatibility logic, then enforce the decision with a repository-wide contract test. Preserve existing GitHub workflows and deployment safety.

**Tech Stack:** GitHub Actions, Node.js contract tests, Next.js production build, Doppler configuration contract.

## Global constraints

- Do not expose credentials, account identifiers, private endpoints, or infrastructure paths.
- Do not create a new archive containing deleted provider material.
- Do not weaken manual deployment, exact-SHA, environment approval, rollback, security, or audit controls.
- Review bot and agent feedback before merge.

### Task 1: Add the GitHub-only contract

- [x] Add a failing test for retired paths and active provider dependencies.
- [x] Confirm required GitHub workflow files exist.

### Task 2: Remove retired repository surfaces

- [x] Delete pipeline definitions, templates, bootstrap scripts, local examples, tests, and obsolete design records.
- [x] Remove provider-specific ignore rules and package test entries.
- [x] Remove provider-specific environment aliases from the Doppler contract.

### Task 3: Standardize governance and operations

- [x] Rewrite CI/CD, repository governance, maintenance ownership, and secret migration guidance for GitHub-only operation.
- [x] Document runner unavailability as a blocking condition, not a reason to accept evidence from another platform.

### Task 4: Verify and publish

- [x] Run the focused contract test, lint, typecheck, full tests, production build, audit, and secret-pattern scan.
- [x] Commit with the SismoSmart identity.
- [x] Publish the branch and open draft pull request #15.
- [ ] Review every bot, dependency, security, and agent comment before merge.
