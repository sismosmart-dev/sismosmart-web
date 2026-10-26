# CI/CD automation

GitHub is the sole source-control, pull-request, CI/CD, release, security, and operational automation platform for SismoSmart Web. No secondary execution provider or repository mirror is supported.

## Continuous integration

`.github/workflows/quality-ci.yml` validates commit policy, lint, TypeScript, tests with coverage, production build, standalone deployment smoke, dependency audit, and browser/accessibility behavior. `.github/workflows/security.yml` provides dependency, secret, and code scanning.

Pull requests must use GitHub status checks as the canonical review evidence. When hosted runners are unavailable, changes remain blocked until GitHub capacity is restored or an approved self-hosted GitHub runner is available. A different CI platform must not be used as substitute evidence.

### GitHub-hosted runner policy

GitHub-hosted Ubuntu jobs are pinned to `ubuntu-24.04` for reproducibility. Do not use the moving `ubuntu-latest` label in repository workflows. GitHub announced that `ubuntu-latest` begins migrating to Ubuntu 26 on 2026-10-19; Ubuntu 26 must be validated separately across CI, browser/Chrome, security, DNS/network, and deploy-validation surfaces before this repository intentionally changes its pinned image.

A runner-image change does not alter production credentials, environment policy, exact-SHA deployment guards, or transactional deployment behavior. Compatibility validation for a new image must use the normal pull-request checks and read-only deployment validation before adoption.

## Production deployment

`.github/workflows/deploy-prod.yml` is the only production deployment control plane. Production deployment is manual-only and transactional. It requires the exact current `main` SHA, an operation-specific confirmation phrase, the `production` environment's main-only deployment policy, and scoped deployment credentials. A push never activates production automatically. The shared `production` environment does not currently enforce a required-reviewer gate because scheduled/read-only Production Health uses the same environment; mandatory human deploy approval first requires a deploy-only environment or equivalent secret/workflow separation.

## Read-only audits

GitHub Actions schedules DNS cutover, mail DNS, Lighthouse, analytics observability, and production-health audits. Audit jobs publish compact, redacted evidence with bounded retention and do not receive deployment credentials unless their documented operation requires them.

## No staging target

The project intentionally has no staging environment or staging deployment automation. Pull-request CI and guarded production validation are the pre-production quality gates.

## Ownership

The platform owner maintains GitHub organization access, repository settings, Actions permissions, environments, runners, secrets, variables, GitHub Apps, webhooks, artifact retention, and recovery access. Repository automation changes require pull-request review and successful checks.
