# Production-Only Doppler Configuration Design

**Issue:** #3 — Adopt Doppler as the canonical configuration and secret source
**Date:** 2026-07-22
**Status:** Approved for implementation planning

## 1. Purpose

Make Doppler the canonical source for application, deployment, CI, and operational configuration without introducing a local-development secret workflow. The repository remains safe for public visibility: no credential values, private endpoints, infrastructure identities, or private filesystem details may be committed, logged, copied into issues, or embedded in build artifacts.

## 2. Scope

This design covers:

- a production-only Doppler configuration model;
- a public, value-free environment-variable contract;
- explicit configuration selection for every command;
- migration away from persistent local `.env` files;
- least-privilege separation between build, runtime, deployment, and operations;
- validation that compares required key names without reading or printing values;
- documentation and tests needed to keep the contract stable.

This design does not cover:

- GitHub Actions authentication and workflow conversion, which belongs to issue #8;
- removal of the retired secondary automation surface, which belongs to issue #10;
- repository import, licensing, dependency upgrades, or branch protection;
- automatic credential rotation by repository code.

## 3. Architectural decision

Use one Doppler project named `sismosmart-web` with four explicit configurations:

| Configuration | Purpose | Typical consumers |
| --- | --- | --- |
| `ci` | Dependency installation, lint, typecheck, tests, and production build inputs | GitHub Actions and validation jobs |
| `prd_app` | Variables required by the deployed Next.js server and form forwarding | Runtime environment writer and application process |
| `prd_deploy` | Credentials and coordinates required to validate, deploy, roll back, and inspect releases | Manual deployment workflow and deployment scripts |
| `prd_ops` | Analytics, Search Console, Clarity, DNS/mail audits, and production-health operations | Read-only operational scripts and scheduled audits |

The existing broad `main` configuration is a migration source only. It must not remain the long-term execution target after the split is verified.

There is no `dev_personal`, `dev`, or implicit local configuration. Engineers may run production-equivalent validation commands only when explicitly authorized and must name the required Doppler project and configuration on every invocation.

## 4. Configuration-selection rules

1. Repository commands must never rely on the current directory's hidden Doppler selection for production operations.
2. Production-capable commands must use explicit project and config arguments, for example:

   ```bash
   doppler run --project sismosmart-web --config prd_ops -- npm run ops:status
   ```

3. Deployment commands must use `prd_deploy`; runtime generation must use `prd_app`; operational audits must use `prd_ops`; CI validation must use `ci`.
4. A repository-level `doppler.yaml` may declare the project but must not default to a production configuration. This prevents an unqualified `doppler run` from receiving production credentials.
5. Scripts must fail closed when a required variable is absent or blank.
6. Scripts and tests may enumerate variable names but must never print values.

## 5. Key ownership model

### 5.1 `ci`

Contains only values needed to produce and validate the deployable artifact. Public `NEXT_PUBLIC_*` values may be present because Next.js embeds them at build time, but they are not treated as secrets. CI must not receive SSH, hosting-control-plane, OAuth refresh, or deployment private-key material.

Expected categories:

- production public URLs and base-path settings;
- public analytics identifiers and enablement flags;
- optional server/edge monitoring configuration required during build validation;
- non-secret build policy values.

### 5.2 `prd_app`

Contains only values written to the protected runtime environment file or injected into the application process.

Expected categories:

- form-forwarding endpoints;
- form-forwarding authorization material;
- server and edge monitoring DSN;
- runtime public analytics identifiers when required by the deployment model.

The runtime writer must keep an allowlist. It must create files with mode `0600`, and no runtime environment file may be placed under a public web root.

### 5.3 `prd_deploy`

Contains deployment credentials and deployment coordinates.

Expected categories:

- hosting API authentication;
- SSH authentication and optional passphrase/password;
- deployment host, port, user, and release-path configuration;
- deployment policy flags and release-retention settings.

This configuration must not be available to build-only or read-only operational jobs.

### 5.4 `prd_ops`

Contains credentials and identifiers needed by read-only operational scripts.

Expected categories:

- Google OAuth or service-account authentication;
- analytics, tag-manager, and search-console identifiers;
- Clarity export authentication;
- production-health, DNS, and mail-audit configuration.

Operational scripts must remain read-only unless a separate command explicitly documents and confirms a mutation.

## 6. Canonical environment contract

`.env.example` remains the public, value-free inventory of supported repository variables during the migration. It is a schema, not an instruction to create a persistent `.env` file.

The implementation will:

- keep values empty or clearly non-sensitive examples;
- group keys by `ci`, `prd_app`, `prd_deploy`, and `prd_ops` ownership;
- identify public, secret, conditional, and deprecated variables in comments;
- replace legacy measurement-protocol aliases with `GOOGLE_MEASUREMENT_PROTOCOL_API_SECRET`;
- provide a temporary compatibility check for legacy names, then remove legacy names after all consumers are migrated;
- exclude ephemeral provider variables such as `GITHUB_TOKEN`, `GITHUB_SHA`, `Build.*`, `PWD`, and `NODE_ENV` from Doppler ownership.

## 7. Repository changes

The implementation plan will cover these repository changes:

1. Add a production-safe `doppler.yaml` that identifies the project without selecting a production config.
2. Refactor `.env.example` into documented ownership groups.
3. Normalize the measurement-protocol variable across scripts, tests, and GitHub workflows.
4. Add a key-contract validation script that:
   - reads key names only;
   - rejects duplicate, unknown, deprecated, or missing required keys;
   - validates ownership groups;
   - redacts all values from output.
5. Add tests for explicit Doppler config selection and secret-safe logging.
6. Update package scripts and runbooks with explicit production-only Doppler commands.
7. Mark `.env` as unsupported after migration verification while retaining `.env.example` as the public schema.
8. Keep the current deployment pipeline unchanged until issue #8 supplies validated CI authentication.

## 8. Migration sequence

1. Restrict any existing local secret file to owner-only permissions before reading it.
2. Export or upload existing values to the migration configuration without printing them.
3. Create the four target configurations.
4. Copy keys into their least-privilege target configurations.
5. Validate names and presence through redacted output.
6. Run read-only production status and operational checks through explicit configs.
7. Run lint, typecheck, tests, and build through `ci`.
8. Validate deployment through `prd_deploy` without activation.
9. Validate runtime-file generation through `prd_app` and confirm `0600` permissions.
10. Rotate credentials that may have been stored in an over-permissive local file.
11. Remove the persistent local `.env` only after all required checks pass.
12. Disable or delete the broad migration configuration after downstream CI work is complete.

At no point may migration commands echo, diff, archive, or upload secret values to GitHub.

## 9. Failure handling and rollback

- Missing or blank required keys cause an immediate, redacted failure.
- A failed config split does not alter the currently running application.
- CI and deployment workflows continue using their existing secret source until issue #8 validates the replacement path.
- A failed deployment validation must not activate a release.
- The existing broad Doppler configuration remains available only as a temporary rollback source until the four target configurations pass validation.
- Secret files created temporarily during migration must use mode `0600` and be removed after verification.

## 10. Testing strategy

The implementation must add or update automated checks for:

- exact key-name contract and normalized naming;
- mapping of every supported variable to one or more approved configurations;
- absence of real values in public examples and documentation;
- explicit project/config flags in production-capable command examples;
- runtime allowlist behavior and `0600` file permissions;
- redaction of command output and errors;
- repository-wide absence of deprecated measurement-protocol names;
- lint, typecheck, unit/integration tests, and production build.

Manual validation must include:

- names-only Doppler inventory checks;
- a read-only `prd_ops` status command;
- a non-activating `prd_deploy` validation;
- protected runtime-file generation from `prd_app`;
- confirmation that no persistent `.env` file is required afterward.

## 11. Security boundaries

Public artifacts may contain variable names, descriptions, ownership, and validation behavior. They must not contain:

- secret values or value fingerprints;
- private keys, refresh tokens, passwords, or service tokens;
- private endpoints, origin addresses, account identifiers, or usernames;
- provider dashboard links or internal filesystem paths;
- log excerpts that reveal credential length, prefixes, or partial values.

GitHub issues and pull requests must describe security work at the control level, not expose the vulnerable credential or infrastructure detail.

## 12. Acceptance criteria

- Doppler is documented as the canonical source of configuration and secrets.
- No local-development configuration exists or is required.
- `ci`, `prd_app`, `prd_deploy`, and `prd_ops` have documented, least-privilege ownership.
- Every production-capable command explicitly names its Doppler project and configuration.
- `.env.example` is value-free and aligned with the repository's actual consumers.
- The measurement-protocol variable has one canonical name.
- Validation compares names and presence without exposing values.
- Runtime secret files are restricted to mode `0600` and never written to a public root.
- Existing production deployment remains operational throughout the migration.
- Credential rotation is completed for credentials affected by unsafe local storage.
- Lint, typecheck, tests, build, read-only operations, deployment validation, and runtime generation all pass.
- Bot and agent comments on the implementation pull request are reviewed and resolved before merge.
