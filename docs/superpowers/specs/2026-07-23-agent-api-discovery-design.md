# Agent and API Discovery Design

## Goal

Make the public repository and website easier for maintainers, API clients, search systems, and AI agents to understand without creating a second source of truth or exposing operational details.

## Decisions

### Publish the existing API, do not add a duplicate status endpoint

The public API contract will document the existing `GET` and `POST` methods on `/api/contact` and `/api/waitlist`. Each endpoint already reports its own forwarding readiness through `GET`, so a new aggregate `/api/status` route would add state and maintenance cost without enabling a new user workflow.

### Use a typed OpenAPI document without a generator dependency

The OpenAPI 3.1 document will be represented as a TypeScript object in `src/lib/openapi.ts` and served from `/openapi.json`. This keeps the contract reviewable, version-controlled, and dependency-free. Tests will assert the public paths, methods, request fields, response codes, cache headers, and safety boundaries.

Alternatives considered:

1. A checked-in JSON or YAML file is simple to host but is easier to drift from code and cannot reuse repository constants.
2. Runtime schema generation from Zod would reduce some duplication but introduces generator dependencies and nontrivial translation rules for transformed fields.
3. A typed TypeScript document with contract tests offers the best balance of clarity, stability, and minimal change. This is the selected approach.

### Generate Markdown alternatives from existing localized content

Markdown alternatives will be generated from `getPages(locale)` rather than copied into separate content files. The initial priority set is:

- Product
- How it works
- Technology
- FAQ
- Privacy
- Security

All six supported locales will be available at `/markdown/{locale}/{page}`. A plain-text index at `/markdown` will list every supported alternative. HTML metadata for priority pages will advertise the corresponding `text/markdown` alternate. The existing `llms.txt`, `llms-full.txt`, and human-readable sitemap will link to the Markdown index and OpenAPI document.

### Add repository guidance at the root

A root `AGENTS.md` will document:

- architecture and source-of-truth boundaries;
- install, lint, typecheck, test, build, and browser-quality commands;
- public-repository secret and infrastructure disclosure limits;
- production-only Doppler and GitHub automation boundaries;
- pull-request expectations, including inspection of bot and agent feedback;
- requirements to keep human-facing, Markdown, OpenAPI, sitemap, and LLM discovery content consistent.

## Components

### `src/lib/agent-discovery.ts`

Owns the priority Markdown page keys and URL construction. It contains no page content and can be imported by metadata without pulling rendering code into the metadata layer.

### `src/lib/markdown-content.ts`

Transforms existing localized page-copy structures into readable Markdown. It contains focused renderers for product, how-it-works, and information-page shapes. It does not create claims absent from the public website.

### `src/app/markdown/route.ts`

Returns a cacheable plain-text index of available Markdown alternatives.

### `src/app/markdown/[locale]/[page]/route.ts`

Validates locale and page, returns localized Markdown with `text/markdown; charset=utf-8`, and returns a plain 404 response for unsupported combinations. The route is static and exposes generated parameters for all supported combinations.

### `src/lib/openapi.ts`

Defines the public OpenAPI 3.1 document. It documents:

- `GET /api/contact` and `GET /api/waitlist` status responses;
- `POST /api/contact` and `POST /api/waitlist` request bodies;
- success, validation, size, rate-limit, forwarding, and unavailable responses;
- only public field names and behavior.

It must not include forwarding destinations, authentication values, provider identifiers, private endpoints, origin details, or internal filesystem information.

### `src/app/openapi.json/route.ts`

Returns the OpenAPI document as cacheable JSON. It has no dependency on runtime secrets and does not inspect environment values.

### Metadata and discovery routes

`buildPageMetadata` will add a `text/markdown` alternate only when the localized page is in the priority set. `llms.txt`, `llms-full.txt`, and `sitemap.md` will link to `/markdown` and `/openapi.json`.

## Data flow

1. A browser or agent requests a localized HTML page.
2. Metadata advertises the matching Markdown URL for priority pages.
3. The Markdown route resolves the locale and page key, reads the same localized copy used by HTML rendering, and serializes it to Markdown.
4. An API client discovers `/openapi.json` through the LLM or sitemap indexes and reads the documented public form behavior.
5. Form submission behavior remains unchanged; the new work is discovery-only.

## Error handling and caching

- `/openapi.json`, `/markdown`, and valid Markdown alternatives return `200` with public cache headers.
- Unsupported Markdown locales or pages return `404` and never fall back to another locale.
- The OpenAPI document describes `400`, `413`, `429`, `502`, and `503` outcomes already implemented by the form handlers.
- No new runtime exception path or production dependency is introduced.

## Security and privacy

- Agent-facing output is derived only from public repository content.
- No secret values, private infrastructure data, provider account identifiers, origin addresses, or internal paths are included.
- OpenAPI documents the existence of server-side forwarding but not its destination or bootstrap mechanism.
- `AGENTS.md` explicitly requires bot, security, dependency, and agent feedback to be inspected before merge.

## Testing

A focused `tests/agent-discovery.test.mjs` suite will verify:

- `AGENTS.md` exists and contains commands, safety boundaries, and PR review requirements;
- `/openapi.json` returns OpenAPI 3.1 JSON with the exact public paths, methods, required fields, and response codes;
- the Markdown index and localized route return cacheable Markdown from current page copy;
- invalid locale and page requests return `404`;
- metadata advertises Markdown alternates only for priority pages;
- existing LLM and sitemap routes link to the new discovery surfaces;
- generated output contains no prohibited operational markers.

The focused test will be added to `test` and `test:coverage`. Full validation remains lint, typecheck, all tests, production build, dependency audit, and credential-pattern scanning.

## Non-goals

- No new form submission behavior.
- No aggregate `/api/status` endpoint.
- No API authentication mechanism.
- No content negotiation on existing HTML routes in this change.
- No generated client SDK.
- No publication of private operations, deployment, or provider configuration.
