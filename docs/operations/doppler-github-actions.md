# One Doppler config for SismoSmart

## Target: one config, one GitHub Service Token

Doppler project: `sismosmart-web`. Production config: `prd_sismosmart`
(in Doppler's `prd` environment; config names must use its `prd_` prefix).
The source of truth for all runtime SSH, cPanel, forms, analytics, DNS and
release credentials is this **single config**. Do not place those values in
GitHub Secrets, source files or workflow logs.

GitHub has **one user-managed secret name**:

| GitHub environment | Secret | Effect |
| --- | --- | --- |
| `production-deploy` (main-only, owner approval) | `DOPPLER_TOKEN_PRD` | Read-only access to **all** secrets in Doppler `prd_sismosmart` |
| `production` (main-only, no review) | **No user-managed secrets** | Public-route status only; no privileged host inspection |

This is one Doppler **config**, not one config for each job. CI is intentionally
tokenless: public metadata/build variables are committed or ordinary public
GitHub variables, and no pull request can read production secrets. Doppler's
Service Token **Read** permission prevents editing Doppler, but can read every
secret in that config (including write-capable SSH/cPanel/API credentials).
Therefore only reviewer-approved jobs may fetch it.

## Safe one-time migration

The new `prd_sismosmart` config was populated on 27 October 2026 with all
19 user secret keys from `ci`, `prd_app`, `prd_deploy` and `prd_ops`. An
independent local comparison confirmed all source and destination values
match without exposing any values; all 19 values are masked. The old configs
remain intact for rollback. For future changes, compare **names and effective
values** inside Doppler and resolve duplicate keys explicitly. Prefer the
production-deployment source
for `SSH_*`, `CPANEL_*`, `DOMAIN` and the application source for form runtime
keys; only the owner can approve collisions. Do not copy credentials through
chat, shell history, an unencrypted export, GitHub or source code. Use the
`.env.example` and `config/doppler-contract.mjs` names-only contract, then
validate with:

```bash
node scripts/ops/validate-doppler-contract.mjs --doppler prd_sismosmart
```

No current shared privileged `prd_ops` credentials should be mistaken for
independent read-only access. The old repo stays active while migration and
acceptance are underway. Do **not** delete or revoke old configs/tokens until
all old consumers have been identified and retired.

## Bootstrap the only token, after target config passes verification

1. Open [Doppler Dashboard](https://dashboard.doppler.com), project
   `sismosmart-web`, config `prd_sismosmart` → **Access** → **Generate Service
   Token**. Name it `github-actions-prd`, set access to **Read** (never
   Read/Write), and follow the team's expiration/rotation policy.
2. Open [GitHub Environments](https://github.com/sismosmart-dev/sismosmart-web/settings/environments)
   → `production-deploy` → **Environment secrets** → **Add secret**. Set the
   name `DOPPLER_TOKEN_PRD` and paste the token **only in GitHub's protected
   field**. Do not add it to repository secrets or to `production`.
3. The workflow's pinned Doppler Fetch Secrets action automatically masks
   fetched values; `check-fetched-doppler.mjs` verifies the exact project,
   config and required keys before any mutation. Neither mechanism makes
   the **provider** SSH/cPanel keys read-only.
4. After adding the token, run **Doppler Connectivity Preflight** manually
   from the main branch, entering the exact 40-character main commit SHA.
   GitHub requires `production-deploy` owner approval **before the job starts**.
   It reads the config via the pinned Fetch Secrets action and checks only
   the expected project, config and required key presence. No deploy, remote
   command, DNS write or secret-value output is performed.
5. Keep the five production/deploy/monitoring workflows disabled. After the
   connection test succeeds, verify exact-head CI, non-activating deployment
   preflight and rollback readiness before a separately approved production
   controller handoff. Keep the old token/configs until old consumers are
   safely retired.

## Monitoring tradeoff (intentional)

Unattended Production Health, analytics administration and DNS/mail audits
would receive *full production credentials* if given this same token. To
preserve the single-token rule, the new privileged audits are **manual-only**
and run exclusively in `production-deploy`, with owner approval. The `status`
operation in the unreviewed `production` environment checks **public routes
only**. The legacy repository remains the active scheduled monitor; it must
not be disabled before a safe public-only replacement or owner-approved
monitoring control has passed acceptance. Do not assume consolidation also
preserves unattended privileged monitoring capability.

If autonomous deep host monitoring is later required, that creates a new
independent least-privilege security requirement. Do not quietly re-enable
schedules with access to this full-privilege Service Token.

References: [Doppler Service Tokens](https://docs.doppler.com/docs/service-tokens)
and [Fetch Secrets Action](https://github.com/DopplerHQ/secrets-fetch-action).
