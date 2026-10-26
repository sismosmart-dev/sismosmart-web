# Production configuration and observability

## Doppler is the canonical source

All supported configuration names are declared in `.env.example` and
`config/doppler-contract.mjs`. The example file is a public schema only; every
assignment is intentionally blank. Persistent `.env` files are unsupported.

The Doppler project is `sismosmart-web` and uses four least-privilege configs:

| Config | Responsibility |
| --- | --- |
| `ci` | Production build inputs, lint, typecheck, tests, and build validation |
| `prd_app` | Server-side form forwarding and protected runtime configuration |
| `prd_deploy` | Deployment credentials, coordinates, rollback, and release policy |
| `prd_ops` | Read-only production status, analytics, Search Console, Clarity, DNS, and mail audits |

`doppler.yaml` declares only the project. It deliberately has no `config`
field, so an unqualified command cannot inherit production credentials from
the repository.

## Validate the public contract

The default check reads names only and never reads a secret value:

```bash
npm run doppler:check
```

An authorized operator can compare a Doppler config with the repository
contract using the CLI names-only response:

```bash
node scripts/ops/validate-doppler-contract.mjs --doppler ci
node scripts/ops/validate-doppler-contract.mjs --doppler prd_app
node scripts/ops/validate-doppler-contract.mjs --doppler prd_deploy
node scripts/ops/validate-doppler-contract.mjs --doppler prd_ops
```

Validation output is restricted to config names, key names, and counts. Raw
Doppler errors and values are not forwarded to logs.

## Production entry points

Every repository entry point selects both project and config explicitly:

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

Do not substitute a bare `doppler run` command, directory-scoped config, or a
shared all-purpose config for these entry points.

## Migration and rollback boundary

The previous broad config is a temporary migration source only. Copy values
through the protected Doppler UI or authorized API, map each name according to
`config/doppler-contract.mjs`, and validate each target config by name. Never
use shell tracing, print a secret, paste values into GitHub, or archive a
secret-bearing file.

GitHub Actions remains the sole workflow control plane. Issue #8 provides
scoped workflow authentication; issue #10 removes the retired secondary
automation surface. Only after all four configs pass names-only checks, build validation,
non-activating deployment validation, runtime generation, and read-only
operations may the broad migration config be disabled.

Credentials previously present in an over-permissive file must be rotated.
The persistent file may be removed only after every production consumer is
verified through Doppler.

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
