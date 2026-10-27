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
a personal/CLI token inside GitHub Actions. One production config means only
reviewer-gated jobs may fetch its entire credential inventory.

For GitHub Actions, only `DOPPLER_TOKEN_PRD` in the reviewed
`production-deploy` environment can read the unified config. The production
SSH/cPanel/form/DNS credentials remain exclusively in Doppler. The unreviewed
`production` environment holds **no** token; unattended privileged monitoring
remains with the old live controller until a separate safe replacement passes.

## Migration and rollback boundary

Only `main` is the target production Doppler config. Existing `ci`,
`prd_app`, `prd_deploy` and `prd_ops` are temporary migration sources,
**not safe to delete until** all their credentials, Service Tokens,
consumers and value conflicts have been verified and migrated. The secure
consolidation status, outstanding secrets and retirements are documented
in `operations/doppler-github-actions.md`. Do not replace known-working
forms/analytics credentials with a different value just because its key
name matches.

The protected GitHub environment token must target `main` and must be
rotated before those old configs are retired. Do not activate production
CMS publishing without independent data-recovery and release acceptance.

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
