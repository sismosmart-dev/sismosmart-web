# GitHub-Only Automation Design

**Issue:** #10 — Standardize all automation on GitHub
**Date:** 2026-07-22
**Status:** Approved for implementation

## Decision

GitHub is the only repository, pull-request, CI/CD, release, security, and operational automation platform. The retired secondary CI surface is deleted rather than preserved as fallback or copied into a new archive. Git history remains the historical record.

## Repository changes

- Delete every retired pipeline definition, bootstrap script, local bootstrap example, provider-specific test, and provider-specific design record.
- Remove provider-specific environment names and split-key compatibility logic.
- Replace provider-neutral or fallback wording with explicit GitHub Actions ownership.
- Add a repository contract that rejects reintroduction of retired provider files or dependencies.
- Keep all existing GitHub workflows for CI, security, deployment, production health, DNS, mail, Lighthouse, analytics, releases, labels, and policy checks.

## GitHub control plane

Pull requests use GitHub status checks as canonical evidence. Production deploys use the protected GitHub environment and manual workflow dispatch. Scheduled audits run only in GitHub Actions. If runner capacity is unavailable, changes remain blocked until GitHub capacity is restored or an approved self-hosted GitHub runner is available.

## Remote cleanup

An authorized operator removed the retired project-specific pipelines, grouped variables, source connection, and repository mirror. Post-cleanup verification found no matching environments, hooks, or protected files. No credential value or resource identifier is recorded in the public repository.

## Validation

- A focused contract test proves retired files are absent and required GitHub workflows exist.
- A repository-wide scan rejects provider-specific dependencies in active text files.
- Lint, typecheck, full tests, production build, dependency audit, and secret-pattern scans run before review.
- Bot and agent feedback on the pull request is reviewed before merge.
