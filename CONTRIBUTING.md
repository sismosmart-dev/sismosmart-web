# Contributing

This repository ships the SismoSmart public web application as a Next.js standalone deployment for cPanel/CloudLinux Passenger. The repository follows a **production-only** configuration model: GitHub is the sole source-control and automation control plane, and Doppler is the canonical configuration source.

## Validation setup

Use Node.js `22.18.0`, pinned in `.nvmrc` and covered by the package engine range `>=22.13.0 <27`.

```bash
nvm use
npm ci
npm run doppler:ci
```

`npm run doppler:ci` explicitly selects the `sismosmart-web` project and `ci` config, then runs lint, typecheck, tests, and the production build. It requires an authorized least-privilege Doppler session. Browser tests may start an isolated loopback server, but this does not create a local-development secret environment.

`.env.example` is a blank public key-name schema. Do not create or commit a persistent `.env`, `.env.*`, credentials, cookies, key files, generated deployment bundles, provider exports, or private infrastructure records.

The project `.npmrc` approves only the dependency install scripts required by the reviewed lockfile. When a dependency adds or removes an install script, update the allowlist deliberately and rerun `npm ci` before committing.

### Dependency notes

- `overrides.postcss` keeps one reviewed PostCSS version across Next.js and Tailwind.
- `overrides.fast-uri` and `overrides.sharp` preserve the reviewed security floor across transitive dependency paths.
- `vendor/node-domexception` is a local compatibility shim for the operations dependency tree; retain it until the transitive dependency is removed.

## Quality gates

Before opening a pull request, run:

```bash
npm run doppler:ci
npm audit --audit-level=high
npm run deploy:prepare
npm run deploy:smoke
```

When workflow files change, also run the available YAML and Actions validators. When security-sensitive files, workflows, deployment scripts, or environment handling change, run the configured secret scanner against the complete branch history with redaction enabled.

## Branches and pull requests

- Branch from the current `main`.
- Use a focused issue-linked branch.
- Keep one logical delivery per pull request unless a validation failure requires a directly related fix.
- Complete the pull-request template and include the exact validation commands.
- Review every bot, dependency, security, and agent comment before merge.
- Resolve actionable findings; document a concise technical reason for rejected findings.
- Do not bypass required checks or merge while required evidence is missing.

## Commits

Use the repository Conventional Commit types:

```text
feat | fix | docs | style | refactor | perf | test | build | ci | chore | revert
```

Commits and pull requests must use the canonical `SismoSmart/sismosmart-web` identity.

## Deployment

Production deployment is manual-only. Run `Deploy Production` from the exact current `main` SHA through the protected GitHub environment. A push or merge must never activate production automatically.

## Reuse and contribution terms

The repository is marked `UNLICENSED`. Reuse and contribution terms are governed by `LICENSE` and any separate written agreement with SismoSmart.
