# SismoSmart repository guidance

## Purpose

This public repository contains the SismoSmart marketing site, public form API, deployment automation, operational checks, and machine-readable discovery resources. Keep human-facing pages, localized Markdown alternatives, OpenAPI, sitemap, structured data, and LLM indexes consistent with the same public source material.

## Architecture

- `src/app` contains Next.js App Router pages and public route handlers.
- `src/components` contains reusable presentation and interaction components.
- `src/lib` contains localized content, metadata, structured data, public contracts, and shared helpers.
- `src/app/api/_lib` contains server-only form validation and forwarding logic.
- `scripts` contains deployment, production-health, browser-quality, and operations tooling.
- `tests` contains repository, security, browser, deployment, API, and discovery contracts.
- `.github/workflows` is the only CI/CD and repository automation control plane.

## Source-of-truth rules

- Reuse localized page content from `src/lib/pages.ts` and the page-copy modules. Do not create a second copy solely for agents.
- Keep `/openapi.json` aligned with the implemented `GET` and `POST` behavior of `/api/contact` and `/api/waitlist`.
- Keep `llms.txt`, `llms-full.txt`, `sitemap.md`, HTML metadata, and Markdown alternatives mutually discoverable.
- Preserve the production-only Doppler configuration model. Do not add local-development secret workflows or duplicate the full configuration inventory in GitHub.
- Do not add another CI/CD provider or fallback automation surface.

## Commands

Install dependencies with:

```bash
npm ci
```

Run the required quality gates with:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm audit --audit-level=high
```

Run browser and accessibility validation with:

```bash
npm run test:browser
```

Use the existing focused test file when changing one subsystem, then run the complete quality gate before opening or updating a pull request.

## Public repository safety

This is a public repository. Never commit or paste:

- credentials, private keys, access material, recovery material, or configuration values;
- private endpoints, origin addresses, provider account identifiers, or internal host details;
- production usernames, internal filesystem locations, customer data, or private audit evidence;
- generated environment files, local tool state, caches, or deployment artifacts.

Public examples may contain approved key names only and must remain value-free. Agent-facing content must not expose claims or operational details that are absent from the public website and approved documentation.

## Forms and API changes

- Preserve payload-size limits, validation, consent handling, honeypot behavior, rate limiting, forwarding timeouts, and fail-closed behavior.
- Do not expose the server-side forwarding destination or authorization mechanism in public output.
- Update `/openapi.json` and its tests whenever public request fields, response codes, or route behavior changes.
- A device or website response must not claim that a building is safe or replace official alerts or qualified engineering review.

## Pull requests

- Work on a focused branch and use conventional commits.
- Include validation evidence and public-safety notes in the pull-request description.
- Request the intended SismoSmart reviewer for critical paths.
- Before merge, inspect every bot, agent, security, dependency, inline-review, submitted-review, check-annotation, and workflow comment.
- Resolve actionable findings in code or document the technical reason a suggestion does not apply.
- Do not merge with unresolved failures, warnings that require action, or unreviewed automated feedback.

## Production boundary

Normal pull requests must not deploy or mutate production. Production workflows remain manual, exact-revision guarded, concurrency protected, and rollback-aware. Runtime configuration is retrieved through the approved Doppler configuration boundary, while GitHub Actions remains the sole automation control plane.
