# One Doppler config for SismoSmart

## Canonical target and security boundary

Doppler project: `sismosmart-web`. **The only target config is `main`.**
CI and unreviewed status tasks remain token-free. Production SSH, cPanel,
forms, CMS, analytics and DNS credentials may be fetched only by jobs gated
by the GitHub `production-deploy` environment's required reviewer approval.

The approved GitHub secret location is exclusively the `production-deploy`
environment, under `DOPPLER_TOKEN_PRD`. That secret must be a **read-only
Doppler Service Token scoped to `main`**, not a workspace/CLI token. Never
expose it in `production`, repository-level secrets, logs or source control.
The existing protected environment, exact-main-SHA production gate and
manual deployment approval remain in effect. Consolidating the config does
**not** authorize production deployment or CMS content publication.

## Observed migration status (2026-10-28; verify live before retiring anything)

The `main` config already held 52 names before consolidation. `PUBLIC_BASE_URL`
was successfully copied into `main` from a second config, with no value
printed. Other required fields have **not yet been migrated and verified**:
`CMS_DB_HOST`, `CMS_DB_NAME`, `CMS_DB_USER`, `CMS_DB_PASSWORD`, and
`DNS_ORIGIN_IPV4`. The former root configs `ci`, `prd_app`, `prd_ops`,
`prd_deploy` remain live and **must not be deleted while there are unknown
consumers**. A sensitive-data migration attempt was stopped by the execution
platform; do not bypass the denial by using another host, client or account.

The source configs also contain conflicting values for `CONTACT_FORM_ENDPOINT`,
`WAITLIST_FORM_ENDPOINT`, and `GOOGLE_OAUTH_REFRESH_TOKEN`. Do not overwrite
working `main` values until their live consumers and intended value are
verified. Doppler-managed `DOPPLER_CONFIG`, `DOPPLER_ENVIRONMENT`, and
`DOPPLER_PROJECT` metadata is generated for the selected config, not copied.

The current `main` secret inventory also includes legacy key names
`MEASUREMENTPROTOCOLAPI`, `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT`, and
`NEXT_PUBLIC_NEWSLETTER_FORM_ENDPOINT`. Determine consumers and remove
obsolete values using an approved method before treating inventory validation
as accepted. Do not purge a credential merely because its name is old.

Read-only service tokens still attached to older configs include
`github-actions-prd-deploy` (`prd_deploy`) and
`github-analytics-observability` (`prd_ops`). Revoking/deleting either
config breaks its consumers. Rotate/switch all users of those tokens first.
The official Fetch Secrets action injects and masks values but exposes all
secrets of its selected config to the job: CI must not fetch this token.

## Verified retirement sequence

1. Preserve active secrets and metadata without printing values. Resolve
   conflicting keys by checking real application behavior and owner intent.
2. Complete the remaining `main` secret-value migration through an approved
   secure channel, and verify the transferred values match the originals.
3. Mint **one** read-only Service Token for `main` and update the protected
   GitHub `production-deploy` environment secret `DOPPLER_TOKEN_PRD` via a
   secure input (never logs, argv or source).
4. Run `node scripts/ops/validate-doppler-contract.mjs --doppler main`, then
   the reviewer-approved **Doppler Connectivity Preflight** using exact main
   commit SHA; it must pass all required-key and scope checks.
5. Confirm any remaining external analytics/operational consumers are migrated
   and their access remains working; revoke old tokens, then remove obsolete
   configs. Do not remove a Doppler root/environment if provider constraints
   or active consumers block it. Keep the project-backed audit trail.

No production CMS write activation is accepted until the actual production
backup, private off-host retention, independent recovery and release controls
have their own approval and verification. Existing schema tables do not prove
that application writes are safely recoverable.

For operations using the consolidated config:

```bash
node scripts/ops/validate-doppler-contract.mjs --doppler main
```

Provider references: [Doppler Service Tokens](https://docs.doppler.com/docs/service-tokens),
[Doppler Configs](https://docs.doppler.com/docs/root-configs), and
[Fetch Secrets Action](https://github.com/DopplerHQ/secrets-fetch-action).
