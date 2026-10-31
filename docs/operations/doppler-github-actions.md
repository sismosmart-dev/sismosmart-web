# One Doppler config for SismoSmart

## Canonical target and security boundary

Doppler project: `sismosmart-web`. **The only target config is `main`.**

The tracked `doppler.yaml` intentionally specifies only the project: it does
**not** automatically select production secrets for local development. While
legacy configs remain, an interactive `doppler setup` may still list all
eight; this does not mean they are approved for new consumers. Authorized
operators should use the repository's explicit `main`-scoped npm wrappers,
not an ambient or legacy Doppler CLI selection. Do not put a production
config default in `doppler.yaml` merely to shorten the setup prompt.
CI and tokenless public status tasks remain credential-free. The GitHub
`production-deploy` environment is restricted to the `main` branch but has
**no required-reviewer approval gate** (owner decision, 2026-10-28). Privileged
Doppler values are available only to its explicitly dispatched workflows;
never add unreviewed PR or scheduled triggers to those workflows. The Read
token also exposes SSH/cPanel and FTP credentials, so manual dispatch and
least-privilege code paths remain important.

The approved GitHub secret location is exclusively the `production-deploy`
environment, under `DOPPLER_TOKEN_PRD`. That secret must be a **read-only
Doppler Service Token scoped to `main`**, not a workspace/CLI token. Never
expose it in `production`, repository-level secrets, logs or source control.
The main-only environment allowlist and exact-main-SHA production gate remain.
Production deployment still requires an explicit `workflow_dispatch`, its
operation-specific confirmation, and independent release authorization. There
is **no** separate GitHub "Review deployments" step. Consolidating config
access does **not** authorize production deployment or CMS publication.

## Observed migration status (2026-10-28; verify before retirement)

The owner migrated the previously missing production form, DNS and CMS secrets
via a local, value-suppressed Doppler CLI script. Live names-only metadata then
confirmed `main` has **67 key names (including 3 Doppler-managed), 35 nonempty
and 32 empty**, with the four CMS DB fields, `CMS_ADMIN_TOKEN`, both form
endpoints and `DNS_ORIGIN_IPV4` now nonempty. Optional analytics and legacy
keys can legitimately remain empty. Both CMS runtime switches are still
**`false`**: this is not production CMS write approval.

The owner created a read-only `production-deploy` service token for `main` and
updated the GitHub environment secret `DOPPLER_TOKEN_PRD`. The non-deploying
**Doppler Connectivity Preflight** run
[40612445560](https://github.com/sismosmart-dev/sismosmart-web/actions/runs/40612445560)
passed on exact main SHA `f96149d86dd539216342068ccbede52df9bbb12c`.
The environment required-reviewer gate was later removed at owner request,
leaving the `main`-only deployment branch allowlist in place.

**Do not overwrite conflicting nonempty values:** `CPANEL_HOST` and
`GOOGLE_OAUTH_REFRESH_TOKEN` differ between some old configs and `main`.
The auto-generated `DOPPLER_CONFIG`, `DOPPLER_ENVIRONMENT`, and
`DOPPLER_PROJECT` metadata must never be copied as user values. The
value-empty legacy names `MEASUREMENTPROTOCOLAPI`,
`NEXT_PUBLIC_CONTACT_FORM_ENDPOINT`, and
`NEXT_PUBLIC_NEWSLETTER_FORM_ENDPOINT` are still present in `main`;
review dependencies before any deletion. Do not interpret key-name or
nonempty-value checks as production backup or secret-consumer proof.

Eight Doppler configs still exist. The older `prd_ops` **read-only** token
`github-analytics-observability` was historically used by the **original**
repository `SismoSmart/sismosmart-web`, whose overlapping scheduled Analytics
workflow is now disabled. Token presence does not prove a current consumer or
safe revocation. `prd_deploy` and `prd_sismosmart` retain legacy read-only
tokens too. Do not revoke them or delete their configs until all
consumers have been separately migrated and verified. Seven of eight configs
are locked environment roots; their lifecycle is not an ordinary branch
config deletion.

The official Fetch Secrets action masks its output but gives each job access
to every secret in `main`. Keep privileged jobs manually dispatched and do not
use this token in normal CI or automatically scheduled jobs.

## Verified retirement sequence

1. **Completed:** copy necessary values into `main` without exposing them;
   preserve conflicting nonempty values and verify intended source identity.
2. **Completed:** configure one read-only `main` Service Token as GitHub's
   `production-deploy` environment secret `DOPPLER_TOKEN_PRD`, and pass the
   manually dispatched exact-SHA Doppler Connectivity Preflight. Re-run the
   preflight after meaningful token changes, but no reviewer click is needed.
3. **Still required:** review names-only contract warnings and retire empty,
   obsolete aliases only after consumer checks and authorized safe deletion.
4. **Still required:** migrate the original repository's `prd_ops`-bound
   analytics workflow (separate repository change authority), verify its
   replacement, and confirm other service-token consumers have moved.
5. **Still required:** revoke old tokens only after confirmed cutover, then
   retire unused branch configs and their root environments as permitted by
   Doppler. Keep the project-backed audit trail.

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
