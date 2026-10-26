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
- satisfy the `production` environment branch policy, which currently allows deployment only from `main`;
- use the scoped private-key credential or the explicitly configured password fallback;
- preserve transactional activation and automatic rollback.

## Production environment approval boundary

The `production` environment is shared by mutation deploy jobs and scheduled/read-only Production Health jobs. Required-reviewer gating is not enabled on this shared environment, because it would also block unattended health monitoring.

Current enforced controls are the main-only environment deployment policy, exact-SHA input, operation-specific confirmation, protected `main`, required repository checks, scoped credentials, transactional activation and rollback. If mandatory human approval for every production mutation is required, create a deploy-only environment or equivalent secret/workflow split before enabling required reviewers. Do not re-enable reviewer gating on the shared environment and silently break scheduled monitoring.

## Secret isolation

Production deployment credentials are scoped to the GitHub production environment and the approved Doppler configuration. The complete private key is stored as one protected secret and injected only into the job that requires it. Read-only audit credentials must not be reused for deployment mutations. Secret values must never be logged, copied into issues, or committed.

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

The `production` environment now has an explicit deployment-branch allowlist
containing only `main`, which is protected by `main-standard`; it currently
contains no migrated secrets. Deploy and scheduled production jobs remain
disabled in this repository until credentials, rollback, and monitoring pass
acceptance; the legacy repository remains the active production controller.

Security retains its independent, narrow Semgrep OSS job. Public-repository
CodeQL analysis was independently verified against a successful `Analyze` step
and a GitHub Code Scanning analysis record for `main@eda68d1` (2026-10-26);
there were no open code-scanning alerts at that verification. A subsequent
public pull request also passed the real `security/codeql` check, so that
check was added to the mandatory `main-standard` list. Review future alerts. The earlier private Free limitation was resolved by owner-approved
public visibility, not by treating skipped runs as successful scans.
