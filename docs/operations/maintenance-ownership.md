# Maintenance ownership and continuity

## Purpose

This runbook defines who is accountable for routine maintenance, release operations, provider access, secret rotation, incident response, and recovery continuity for `SismoSmart/sismosmart-web`. It records roles and procedures, never credential values, recovery codes, private keys, personal phone numbers, or customer data.

The repository currently relies on a small administrator group. A **second administrator** with independent MFA and recovery material is required for continuity. Until that appointment is complete, the primary administrator must keep the provider and recovery inventory current in the approved password manager or business continuity vault outside this repository.

## Ownership matrix

| Area | Primary accountable role | Backup/reviewer role | Routine cadence | Evidence |
| --- | --- | --- | --- | --- |
| Deployments and rollback | Web/Operations owner | Second repository administrator | Every release; quarterly rollback review | Exact SHA, merged PR, CI, deployment run, post-deploy and rollback readiness |
| DNS and registrar | Infrastructure owner | Second account owner | Quarterly and before/after DNS change | Zone export/change record, TTL plan, rollback values, DNS audit |
| Cloudflare TLS, WAF, cache, analytics | Security/Infrastructure owner | Web/Operations reviewer | Monthly security review; quarterly token review | Read-only inventory, ruleset diff, TLS status, analytics check |
| cPanel, Passenger, filesystem, backups | Hosting/Operations owner | Second administrator | Monthly capacity/access review | Production Health, release inventory, backup/restore evidence |
| Analytics, consent, Search Console, Clarity | Analytics owner | Privacy/Web reviewer | Monthly and after tag/config changes | Analytics Observability and consent audit |
| Forms and delivery destinations | Product Operations owner | Security/Web reviewer | Monthly synthetic verification and after endpoint rotation | Controlled synthetic delivery, no personal data in logs |
| Mail DNS and DMARC | Mail owner | Infrastructure/Security reviewer | Monthly during DMARC observation, quarterly afterward | Mail DNS audit, aggregate report review, test messages |
| Dependency and application security | Web/Security owner | Pull-request reviewer | Every PR; weekly Renovate/security review | CI, npm audit, CodeQL/secret scanning where available |
| Incident response | Incident commander role | Technical lead and communications owner | After every incident; tabletop twice yearly | Timeline, impact, containment, recovery, prevention actions |
| Billing and provider continuity | Business owner | Second business/account owner | Quarterly | Provider list, renewal dates, approved payment continuity record |

Named individuals and their contact routes belong in the private continuity vault, not this document.

## Configuration boundaries

### Safe to commit

- `.env.example` with names and comments only, never values.
- Public analytics identifiers in `config/analytics.json` when deliberately public.
- Workflow definitions, scripts, tests, runbooks, public hostnames, and non-secret policy thresholds.
- Sanitized, aggregate evidence that contains no credentials, personal data, endpoint secrets, origin addresses, or private filesystem paths.

### Local-only

- `.env`, `.env.local`, `.serena/`, `.cache/`, `.artifacts/`, `.deploy/`, editor state, temporary screenshots, local browser binaries, and generated reports.
- Local overrides must remain ignored by Git. Developers should run `git status --short` before every commit.

### CI-only

- GitHub Actions repository/environment Secrets and Variables.
- Short-lived GitHub App tokens, deployment credentials, provider API tokens, and controlled synthetic-test tokens.
- CI logs may contain only redacted status and aggregate evidence. Secret values must never be echoed or copied into artifacts.

### Runtime-only

- cPanel/Passenger environment variables, server-side form endpoints, forwarding authentication, Sentry server configuration, SSH private keys, database/provider credentials, and any customer/pilot configuration.
- Runtime secrets must be injected from the approved environment or secret manager and must not be embedded in browser bundles or committed files.

## Secret rotation

- Review privileged account access and secret inventory **quarterly** and after personnel, provider, or incident changes.
- Rotate deployment and provider credentials at least annually, immediately after suspected exposure, and when an owner leaves the role.
- Maintain separate production mutation and read-only audit credentials. Do not reuse a production mutation token for observability.
- Verify the replacement credential before revoking the old one; record only the date, owner role, scope, and verification result.
- Delete superseded aliases after canonical names are proven. Never copy a write-only secret value through issue comments or logs.

## Release maintenance

1. Work on a focused branch and open a PR.
2. Review all bot and agent comments as well as human feedback.
3. Require successful lint, typecheck, tests, browser/accessibility checks, build, and security checks relevant to the change.
4. Squash merge to `main`.
5. Deploy only through the manual exact-SHA gate documented in `production-deployment.md`.
6. Verify public, origin, Passenger/release state, forms, and production health. Keep rollback available.
7. Review release retention and disk capacity; do not delete protected/current releases.

## Incident response

1. Establish an incident commander and record the start time and observed impact.
2. Prefer read-only evidence first: Production Health, workflow failures, Cloudflare status, DNS, Passenger/release state, capacity, and form status.
3. Contain the issue using the least invasive reversible action. Do not deploy an unrelated change during diagnosis.
4. Recover through documented rollback or provider procedures, then verify public and origin behavior.
5. Preserve sanitized evidence. Do not store secrets, raw customer submissions, or full access logs in GitHub.
6. Publish a post-incident record with cause, timeline, recovery, and prevention work.

Relevant runbooks: `production-health.md`, `production-deployment.md`, `cloudflare-security.md`, `repository-governance.md`, and the mail/DNS workflow documentation.

## Account recovery and continuity path

The private continuity vault must identify, at minimum:

- GitHub organization/repository owners and the organization recovery process;
- domain registrar account owner, renewal method, and recovery route;
- Cloudflare account owners and emergency token revocation route;
- cPanel/hosting provider account, support contract, and backup/restore route;
- analytics/search/Clarity account owners;
- billing owner and renewal contacts;
- the secure location of independent MFA recovery material.

A second trusted administrator must have independent access rather than shared credentials. Test one non-destructive recovery path **quarterly**: for example, the backup administrator signs in with MFA, verifies read-only access to GitHub/Cloudflare/cPanel, and records the date and result in the private continuity register.

If the primary administrator is unavailable:

1. The second administrator uses independent MFA and the provider's documented recovery path.
2. Revoke or suspend credentials believed to be exposed, without deleting evidence.
3. Confirm domain, DNS, hosting, GitHub, and billing control.
4. Rotate privileged secrets in dependency order and run read-only audits.
5. Record ownership changes and schedule a full access review.

## Historical reports and retention

Historical analyses live under `docs/archive/` with a dated folder and archive notice. They are retained as audit context, not current operational truth. Current procedures belong in `docs/operations/`; current technical/product wording policy belongs in `docs/governance/`.

- Keep incident and major architecture records according to business/legal retention requirements.
- Review archived engineering reports annually.
- Remove generated logs, screenshots, local browser caches, and temporary artifacts after the related PR or incident is complete unless evidence retention requires otherwise.
- Never archive secrets, raw form submissions, OAuth tokens, private keys, or unredacted access logs in Git.

## Repository feature review

Quarterly, review branch/ruleset availability, environments, Actions permissions, stale workflows, deploy keys, webhooks, GitHub Apps, collaborators, Pages, Discussions, Wiki, Packages, and unused secrets. Disable unused features only after confirming ownership and rollback implications. Repository plan limitations must be documented honestly and must not be described as equivalent to preventive branch protection.

## GitHub automation ownership

GitHub is the sole execution provider for CI, security, scheduled audits, releases, and manual deployment. The platform owner maintains organization access, repository rulesets, Actions permissions, environments, runner capacity, artifact retention, GitHub Apps, webhooks, and recovery access.

When hosted runner capacity is unavailable, affected pull requests and releases remain blocked until GitHub execution is restored or an approved self-hosted GitHub runner is available. Automation evidence from another platform is not accepted. Secret values must come from Doppler or scoped GitHub environment secrets and must never be exported through logs or artifacts.
