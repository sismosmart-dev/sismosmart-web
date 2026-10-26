# Repository governance and release control

## Operating model

GitHub is the repository's sole source-control and automation control plane. Repository rulesets, protected environments, status checks, security scanning, review requirements, and deployment approvals must be configured and reviewed in GitHub.

## Production-only model

The repository and hosting model are production-only. There is no staging workflow, environment, credential, Passenger mount, release root, DNS entry, or deployment pipeline. Changes are validated through pull-request CI, browser/accessibility tests, build and standalone smoke tests, read-only production audits, and guarded production validation before activation.

## Normal change flow

1. Create a focused branch from current `main`.
2. Open a pull request and complete the pull-request template.
3. Wait for all required GitHub Actions and security checks.
4. Review the diff, bot and agent comments, dependency feedback, and operational impact.
5. Resolve every blocking conversation and failed check.
6. Merge with **Squash and merge** and delete the merged branch.
7. Confirm the `Mainline Policy` workflow associates the new `main` commit with a merged pull request.

## Production release gate

Production never deploys automatically from a push. `Deploy Production` is manual-only. A guarded operation must:

- run from `main`;
- provide the exact current `main` SHA;
- use the documented operation confirmation phrase;
- satisfy the write-capable `production-deploy` environment branch policy, which allows only `main`, and the owner-required deployment review;
- use the scoped private-key credential or the explicitly configured password fallback;
- preserve transactional activation and automatic rollback.

## Production environment approval boundary

The `production` environment is reserved for unattended read-only Production Health, analytics observability, and manual `status`. It is restricted to `main` without required reviewers, so scheduled health does not wait for an operator. Those jobs fetch their credentials from Doppler `prd_ops` using an environment-scoped `DOPPLER_TOKEN_PRD_OPS` Service Token (never an unscoped repository secret); the external SSH/cPanel principals must be independently read-only. See `doppler-github-actions.md`.

Every mutation-capable `Deploy Production` job (`reconcile`, `permissions`, `retention`, `forms`, `deploy` including `validate-deploy`) uses the separate `production-deploy` environment, restricted to `main` and requiring approval from the verified owner. A deployment run must also satisfy exact-SHA authorization, operation-specific confirmation, protected `main`, required checks and rollback controls. This approval gate must never be placed on the shared read-only `production` environment.

## Secret isolation

The only user-managed GitHub environment secrets are config-specific, read-only Doppler Service Tokens: `DOPPLER_TOKEN_PRD_OPS` in `production`, and `DOPPLER_TOKEN_PRD_DEPLOY` plus `DOPPLER_TOKEN_PRD_APP` in `production-deploy`. All SSH/cPanel keys, form runtime credentials and DNS values remain in Doppler only. The official pinned Fetch Secrets action masks and injects them per job; the scope checker rejects mismatched or absent configs. Read-only Doppler *access* does not imply read-only provider *credentials*. Currently `prd_ops` and `prd_deploy` share identical privileged infrastructure credentials; the monitoring token must not be provisioned and its workflows must remain disabled until independently restricted provider grants are verified. No secret value may enter a repo, log or artifact. Secret values must never be logged, copied into issues, or committed.

## Required checks

A normal pull request must have successful GitHub evidence for lint, typecheck, tests, production build, browser/accessibility, commit policy, dependency audit, secret scanning, and code scanning. If required GitHub execution capacity is unavailable, the pull request remains blocked; another platform is not accepted as replacement evidence.

## Emergency hotfix

The preferred emergency path remains a focused branch and pull request. The active repository ruleset prohibits direct pushes to `main`, including routine emergency changes. Use the normal pull-request path. Only the human repository owner may authorize and perform an exceptional break-glass change in GitHub, after recording the incident and recovery plan; agents must never bypass the ruleset.

## Access and recovery continuity

At least two trusted organization owners or repository administrators should exist, each with independent MFA and recovery material. The current single administrator condition remains a continuity risk until a second trusted administrator is verified. Review administrator access, Actions permissions, environment reviewers, GitHub Apps, webhooks, runners, deploy keys, and recovery ownership quarterly and after personnel or provider changes.

## Related controls

- Maintenance roles, secret rotation, incident response, and archive retention are defined in `maintenance-ownership.md`.
- High-impact technical and product wording is governed by `../governance/technical-claims-register.md`.
- Historical audit snapshots under `../archive/` describe past state and must not be treated as current operational truth without revalidation.

## Public organization repository protection and analysis

The organization repository was made **public** with owner authorization on
2026-10-27 (Türkiye local date). Public GitHub Free repositories support native
branch rulesets, protected production environments and GitHub CodeQL scanning.
These controls must be checked against current live GitHub state rather than
assuming documentation proves enforcement.

The repository's active `main-standard` ruleset targets the default branch:
no branch deletion/force push, linear history, squash-only pull requests,
review-thread resolution, zero mandatory reviews for the verified solo-owner
operating model, and strict status checks (`ci/lint`, `ci/test`, `ci/browser`,
`ci/build`, `security/npm-audit`, `security/gitleaks`, `security/semgrep`,
`quality/commitlint`, `security/codeql`). No API/agent administrator bypass is configured. Do not
require `governance/pr-origin` on PRs because that check runs after merges on
`main`, not on normal pull requests.

Both `production` and `production-deploy` environments have explicit
main-only deployment-branch allowlists; only `production-deploy` requires
manual owner review. Both currently contain no migrated secrets. Deploy and scheduled production jobs remain
disabled in this repository until credentials, rollback, and monitoring pass
acceptance; the legacy repository remains the active production controller.

Security retains its independent, narrow Semgrep OSS job. Public-repository
CodeQL analysis was independently verified against a successful `Analyze` step
and a GitHub Code Scanning analysis record for `main@eda68d1` (2026-10-26);
there were no open code-scanning alerts at that verification. A subsequent
public pull request also passed the real `security/codeql` check, so that
check was added to the mandatory `main-standard` list. Review future alerts. The earlier private Free limitation was resolved by owner-approved
public visibility, not by treating skipped runs as successful scans.
