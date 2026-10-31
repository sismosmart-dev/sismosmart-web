# Production configuration and observability

## Doppler is the canonical source

All supported configuration names are declared in `.env.example` and
`config/doppler-contract.mjs`. The example file is a public schema only; every
assignment is intentionally blank. Persistent `.env` files are unsupported.

The Doppler project is `sismosmart-web` and targets **one** production config:
`main`. CI/build validation runs without any production Service
Token. Deployment, SSH, cPanel, runtime forms, DNS and Google observability
values are consolidated only in the Doppler protected config. Do not use
its single token for unattended production audits; see
`operations/doppler-github-actions.md`.

`doppler.yaml` declares only the project. It deliberately has no `config`
field, so an unqualified command cannot inherit production credentials from
the repository.

## Validate the public contract

The default check reads names only and never reads a secret value:

```bash
npm run doppler:check
```

The consolidated config is audited using **names only**:

```bash
node scripts/ops/validate-doppler-contract.mjs --doppler main
```

Validation output is restricted to config names, key names, and counts. Raw
Doppler errors and values are not forwarded to logs.

For a **single, comprehensive names-only migration report** while the config
is incomplete, use:

```bash
node scripts/ops/validate-doppler-contract.mjs --doppler main --report
```

This read-only command shows all missing required/optional names, deprecated
names, unexpected names and duplicates in one pass; it exits nonzero until
required entries and name problems are resolved. The report does **not** read
secret values, verify Service Token consumers, authorize deletion, or assert
that production is ready. The standard `--doppler main` strict check remains
unchanged.

## Production entry points

Deployment and owner-invoked operations use explicit project/config selection. CI remains token-free:

```bash
npm run doppler:ci
npm run doppler:ops:status
npm run doppler:deploy:validate
npm run doppler:runtime-env
```

`doppler:deploy:validate` is non-activating. `doppler:runtime-env` is a dry run
unless an approved maintenance action invokes the underlying command with
`--apply`. A runtime environment file must remain outside the public web root
and must have mode `0600`.

Do not substitute a bare `doppler run` command, directory-scoped config or
a personal/CLI token inside GitHub Actions. Because the unified config includes
deployment-capable credentials, only explicitly dispatched, main-restricted
operations may fetch it. The `production-deploy` environment has **no required
reviewer**; manual dispatch, branch restrictions and operation-specific SHA
and confirmation guards provide the applicable release controls.

For GitHub Actions, only `DOPPLER_TOKEN_PRD` in the main-only
`production-deploy` environment can read the unified config. Production
SSH/cPanel/form/DNS credentials remain exclusively in Doppler. The tokenless
`production` environment is used for unattended public-only checks.
Overlapping privileged monitoring schedules in the historical repository
were disabled, not replaced with equivalent private monitoring. Deep origin,
Passenger, hosting, SMTP and analytics audits in the new repository remain
manual-only until a separately approved least-privileged replacement exists
or reduced unattended coverage is explicitly accepted.

## Migration and rollback boundary

Only `main` is the target production Doppler config. The seven existing
legacy configs (`ci`, `prd_app`, `prd_deploy`, `prd_ops`,
`genel-secret`, `prd`, `prd_sismosmart`) are migration sources,
**not safe to delete until** all their credentials, Service Tokens,
consumers and value conflicts have been verified and migrated. The secure
consolidation status, outstanding secrets and retirements are documented
in `operations/doppler-github-actions.md`. Do not replace known-working
forms/analytics credentials with a different value just because its key
name matches.

The approved GitHub environment token already targets `main`. Revoke old
config tokens only after independent consumer verification and authorized
retirement, without replacing the working `main` token unnecessarily.
Do not activate production CMS publishing without independent data-recovery
and release acceptance.

## Sentry

Server and edge runtimes initialize Sentry only when `SENTRY_DSN` is present.
The browser SDK is intentionally omitted to preserve the site's client-side
performance budget.

- `src/sentry.server.config.ts` and `src/sentry.edge.config.ts` initialize the SDK.
- `src/instrumentation.ts` reports server and edge request errors.
- `src/lib/report-error.ts` remains the shared error-reporting seam.

The build does not automatically upload source maps. Any future source-map
upload must be added as a reviewed CI change and must not expose source-map
authentication in logs.
