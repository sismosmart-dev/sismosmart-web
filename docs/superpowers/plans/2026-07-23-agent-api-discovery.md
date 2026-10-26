# Agent and API Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish safe repository guidance, an OpenAPI 3.1 contract, and localized Markdown alternatives derived from the existing public content model.

**Architecture:** Keep discovery concerns in focused library modules and thin static route handlers. Reuse `getPages(locale)` for Markdown parity, represent OpenAPI as a typed TypeScript object, and advertise alternatives through existing metadata and machine-readable indexes.

**Tech Stack:** Next.js 16 App Router, TypeScript 6, Node test runner, existing page-copy model, no new dependencies.

## Global Constraints

- Do not add an aggregate `/api/status` endpoint.
- Do not add runtime or build dependencies.
- Do not change form submission behavior.
- Do not expose credentials, private endpoints, provider identifiers, origin addresses, internal paths, or secret values.
- Generate Markdown from existing localized page copy instead of duplicating content.
- Inspect bot, agent, security, dependency, inline-review, and check-annotation feedback before merge.

---

### Task 1: Define the failing discovery contract

**Files:**
- Create: `tests/agent-discovery.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: existing `buildPageMetadata`, `getPages`, `llms.txt`, `llms-full.txt`, and `sitemap.md` routes.
- Produces: executable expectations for `AGENTS.md`, `/openapi.json`, `/markdown`, and `/markdown/{locale}/{page}`.

- [ ] **Step 1: Add the focused test suite**

Create tests that:

```js
const openapiRoute = await loadRoute("src/app/openapi.json/route.ts");
const response = openapiRoute.GET();
assert.equal(response.status, 200);
assert.equal(response.headers.get("content-type"), "application/json; charset=utf-8");
const document = await response.json();
assert.equal(document.openapi, "3.1.0");
assert.deepEqual(Object.keys(document.paths).sort(), ["/api/contact", "/api/waitlist"]);
for (const path of Object.values(document.paths)) {
  assert.ok(path.get);
  assert.ok(path.post);
  assert.deepEqual(Object.keys(path.post.responses).sort(), ["200", "400", "413", "429", "502", "503"]);
}
```

Add equivalent assertions for:

```js
assert.match(readText("AGENTS.md"), /npm run lint/);
assert.match(readText("AGENTS.md"), /bot.*agent/i);
assert.match(readText("AGENTS.md"), /public repository/i);
```

Call the Markdown route with:

```js
const response = await markdownRoute.GET(new Request("https://sismosmart.com/markdown/en/product"), {
  params: Promise.resolve({ locale: "en", page: "product" }),
});
assert.equal(response.status, 200);
assert.equal(response.headers.get("content-type"), "text/markdown; charset=utf-8");
assert.match(await response.text(), new RegExp(getPages("en").product.title));
```

Assert invalid locale and page combinations return `404`. Assert `buildPageMetadata("en", "/product", ...)` contains a `text/markdown` alternate while `/about` does not. Assert existing discovery routes link to `/markdown` and `/openapi.json`.

- [ ] **Step 2: Register the test in package scripts**

Add `tests/agent-discovery.test.mjs` to both `test` and `test:coverage` immediately after `tests/agent-readiness.test.mjs`.

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```bash
node --import ./tests/alias-loader.mjs --test tests/agent-discovery.test.mjs
```

Expected: FAIL because `AGENTS.md`, OpenAPI route, Markdown routes, and metadata alternates do not yet exist.

---

### Task 2: Implement the discovery libraries and routes

**Files:**
- Create: `AGENTS.md`
- Create: `src/lib/agent-discovery.ts`
- Create: `src/lib/markdown-content.ts`
- Create: `src/lib/openapi.ts`
- Create: `src/app/openapi.json/route.ts`
- Create: `src/app/markdown/route.ts`
- Create: `src/app/markdown/[locale]/[page]/route.ts`

**Interfaces:**
- Produces: `markdownPageKeys`, `MarkdownPageKey`, `isMarkdownPageKey`, `getMarkdownPath`, `getMarkdownUrl`, `getMarkdownAlternativeUrl`, `renderPageMarkdown`, and `openApiDocument`.

- [ ] **Step 1: Implement priority page discovery**

`src/lib/agent-discovery.ts` must export:

```ts
export const markdownPageKeys = [
  "product",
  "howItWorks",
  "technology",
  "faq",
  "privacy",
  "security",
] as const satisfies readonly StaticPageKey[];

export type MarkdownPageKey = (typeof markdownPageKeys)[number];

export function isMarkdownPageKey(pageKey: StaticPageKey): pageKey is MarkdownPageKey;
export function getMarkdownPath(locale: Locale, pageKey: MarkdownPageKey): string;
export function getMarkdownUrl(locale: Locale, pageKey: MarkdownPageKey): string;
export function getMarkdownAlternativeUrl(locale: Locale, path: string): string | null;
```

`getMarkdownPath("en", "howItWorks")` must return `/markdown/en/how-it-works`.

- [ ] **Step 2: Implement Markdown rendering from current copy**

`src/lib/markdown-content.ts` must export:

```ts
export function renderPageMarkdown(locale: Locale, pageKey: MarkdownPageKey): string;
```

The output must start with the localized page title, include the localized description, include a canonical HTML link, and render current page sections/cards. Product output must include specs, use cases, and comparison rows. How-it-works output must include flow, signals, and network cards. Information pages must render every `sections` entry and any public links.

- [ ] **Step 3: Implement Markdown route handlers**

`src/app/markdown/route.ts` returns an index with every locale/page combination and headers:

```ts
{
  "cache-control": "public, max-age=3600",
  "content-type": "text/markdown; charset=utf-8",
}
```

`src/app/markdown/[locale]/[page]/route.ts` exports `dynamic = "force-static"`, `generateStaticParams()`, and an async `GET`. It validates with `isLocale`, `resolveStaticPageKey`, and `isMarkdownPageKey`; invalid values return `404` without locale fallback.

- [ ] **Step 4: Implement the OpenAPI document and route**

`src/lib/openapi.ts` exports `openApiDocument` with:

```ts
{
  openapi: "3.1.0",
  info: { title: "SismoSmart public form API", version: "1.0.0" },
  servers: [{ url: siteConfig.url }],
  paths: {
    "/api/contact": { get: /* status */, post: /* submission */ },
    "/api/waitlist": { get: /* status */, post: /* submission */ },
  },
  components: { schemas: /* requests and responses */ },
}
```

Contact required fields are `consent`, `email`, `message`, `name`, and `subject`. Waitlist required fields are `consent` and `email`. Status responses document `200` and `503`; submission responses document `200`, `400`, `413`, `429`, `502`, and `503`. The document must not include forwarding URLs, authorization values, provider data, or infrastructure paths.

`src/app/openapi.json/route.ts` returns `Response.json(openApiDocument)` with `cache-control: public, max-age=3600`.

- [ ] **Step 5: Add root agent guidance**

`AGENTS.md` must document architecture, commands, production-only Doppler, GitHub-only automation, public-repository safety, test expectations, PR workflow, and mandatory bot/agent/security/dependency review before merge.

- [ ] **Step 6: Run the focused test and verify GREEN**

Run:

```bash
node --import ./tests/alias-loader.mjs --test tests/agent-discovery.test.mjs
```

Expected: PASS.

---

### Task 3: Advertise discovery surfaces and validate the repository

**Files:**
- Modify: `src/lib/metadata.ts`
- Modify: `src/app/llms.txt/route.ts`
- Modify: `src/app/llms-full.txt/route.ts`
- Modify: `src/app/sitemap.md/route.ts`
- Test: `tests/agent-discovery.test.mjs`

**Interfaces:**
- Consumes: `getMarkdownAlternativeUrl` and public discovery URLs.
- Produces: HTML `text/markdown` alternates and machine-readable links to `/markdown` and `/openapi.json`.

- [ ] **Step 1: Advertise Markdown alternatives in metadata**

In `buildPageMetadata`, compute:

```ts
const markdownAlternative = getMarkdownAlternativeUrl(locale, normalizedPath);
```

Add this only when non-null:

```ts
alternates: {
  canonical: `${siteConfig.url}${localizedPath}`,
  languages: { ...languages, "x-default": xDefault },
  ...(markdownAlternative
    ? { types: { "text/markdown": markdownAlternative } }
    : {}),
},
```

- [ ] **Step 2: Link the new public contracts**

Add both links to `llms.txt`, `llms-full.txt`, and `sitemap.md`:

```md
- Markdown alternatives: https://sismosmart.com/markdown
- OpenAPI contract: https://sismosmart.com/openapi.json
```

- [ ] **Step 3: Run focused and full validation**

Run:

```bash
node --import ./tests/alias-loader.mjs --test tests/agent-discovery.test.mjs
npm run lint
npm run typecheck
npm test
npm run build
npm audit --audit-level=high
```

Expected: all commands pass and audit reports zero high-severity vulnerabilities.

- [ ] **Step 4: Scan for accidental disclosure**

Run a staged-diff scan for private keys, credential assignments, token-like values, private IP addresses, provider identifiers, and internal absolute paths. Expected: no match.

- [ ] **Step 5: Commit the implementation**

```bash
git add AGENTS.md package.json src tests docs/superpowers/plans/2026-07-23-agent-api-discovery.md
git diff --cached --check
git commit -m "feat: publish agent and API discovery contracts"
```

- [ ] **Step 6: Publish a draft pull request and inspect feedback**

Push `feat/issue-13-agent-api-discovery`, open a draft PR that closes #13, request SismoSmart review, and inspect issue comments, PR comments, inline reviews, submitted reviews, workflow checks, security findings, dependency findings, and agent suggestions before marking ready or merging.
