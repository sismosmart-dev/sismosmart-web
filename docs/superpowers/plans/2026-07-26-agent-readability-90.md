# Agent Readability 90+ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Publish complete same-path markdown representations, content negotiation, public agent guidance, and localized terminology discovery for every public SismoSmart page.

**Architecture:** Existing localized copy remains the single source of truth. A focused agent-content catalog renders HTML metadata and markdown responses, while a narrow Next.js Proxy maps `.md` and explicit markdown Accept requests to one internal route. A localized glossary and sanitized public AGENTS.md close the remaining discovery gaps.

**Tech Stack:** Next.js 16 App Router and Proxy, React 19, TypeScript 6, Node test runner, existing localized content modules.

## Global Constraints

- Preserve normal browser HTML and all analytics, consent, forms, SEO, and deployment behavior.
- Never branch on scanner user-agent or publish hidden score-manipulation content.
- Every markdown response must use `text/markdown; charset=utf-8`, `Vary: Accept`, and a canonical Link header.
- Canonical HTML remains authoritative; `.md` is an alternate representation.
- Public outputs must pass the repository secret/path/address safety patterns.
- Keep `/markdown` compatibility routes working.

---

### Task 1: Lock the complete page and mirror contract

**Files:**
- Modify: `tests/agent-discovery.test.mjs`
- Create: `tests/agent-negotiation.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces expected signatures for `getAgentPageDescriptor(locale, pageKey)`, `resolveAgentPage(locale, segment)`, `getMarkdownMirrorPath(locale, pageKey)`, and `renderAgentPageMarkdown(locale, pageKey)`.

- [x] Add failing tests requiring home plus every static page in all six locales.
- [x] Require `/en.md`, `/en/product.md`, complete metadata alternates, frontmatter, canonical Link, `Vary: Accept`, and `## Sitemap`.
- [x] Add failing proxy tests for `.md`, explicit `Accept: text/markdown`, browser HTML pass-through, API exclusion, HEAD, and invalid routes.
- [x] Add the new test file to `test` and `test:coverage` scripts.
- [x] Run `node --import ./tests/alias-loader.mjs --test tests/agent-discovery.test.mjs tests/agent-negotiation.test.mjs` and confirm failure for missing interfaces.
- [x] Commit with `test: define complete agent representation contract`.

### Task 2: Build the canonical agent-content catalog and renderers

**Files:**
- Replace/expand: `src/lib/agent-discovery.ts`
- Replace/expand: `src/lib/markdown-content.ts`
- Create: `src/lib/agent-content.ts`
- Test: `tests/agent-discovery.test.mjs`

**Interfaces:**
- `type AgentPageKey = "home" | StaticPageKey`
- `getAgentPageDescriptor(locale: Locale, pageKey: AgentPageKey): { title; description; canonicalPath; canonicalUrl; markdownPath; markdownUrl }`
- `resolveAgentPage(locale: string, segment: string | null): { locale: Locale; pageKey: AgentPageKey } | null`
- `renderAgentPageMarkdown(locale: Locale, pageKey: AgentPageKey): string`

- [x] Implement the complete page catalog from `routeSegments`, `staticPageKeys`, `getCopy`, and `getPages`.
- [x] Add deterministic YAML scalar escaping and frontmatter fields: title, description, locale, canonical_url, last_updated.
- [x] Implement explicit home, product, how-it-works, about, contact, and info renderers.
- [x] Append canonical HTML, safety/product-stage notes, machine-readable resources, glossary, and `## Sitemap` sections.
- [x] Keep old `getMarkdownPath`, `getMarkdownUrl`, and route compatibility through wrappers.
- [x] Run focused tests and confirm green.
- [x] Commit with `feat: render every public page as markdown`.

### Task 3: Serve direct mirrors and content negotiation

**Files:**
- Modify: `src/app/markdown/[locale]/[page]/route.ts`
- Modify: `src/app/markdown/route.ts`
- Create: `src/proxy.ts`
- Test: `tests/agent-negotiation.test.mjs`
- Modify: `tests/repository-contract.test.mjs`

**Interfaces:**
- Internal route accepts `page=home` or any static segment.
- `proxy(request: NextRequest): NextResponse` rewrites only valid localized GET/HEAD requests.

- [x] Extend the internal markdown route to all pages and response headers.
- [x] Make `/markdown` list same-path `.md` URLs while preserving compatibility endpoint access.
- [x] Implement helpers that parse `/en.md`, `/en/product.md`, `/en`, and `/en/product` without accepting deeper or invalid paths.
- [x] Rewrite explicit markdown Accept requests and direct `.md` paths to `/markdown/{locale}/{page-or-home}`.
- [x] Ensure ordinary HTML, APIs, `_next`, root machine files, POSTs, and wildcard Accept requests pass through.
- [x] Update the repository contract from “no-op proxy absent” to the narrow negotiation proxy contract.
- [x] Run focused tests and build.
- [x] Commit with `feat: negotiate localized markdown responses`.

### Task 4: Add complete metadata, public AGENTS.md, and discovery links

**Files:**
- Modify: `src/lib/metadata.ts`
- Create: `src/app/AGENTS.md/route.ts`
- Modify: `src/app/llms.txt/route.ts`
- Modify: `src/app/llms-full.txt/route.ts`
- Modify: `src/app/sitemap.md/route.ts`
- Test: `tests/agent-discovery.test.mjs`
- Test: `tests/seo-governance.test.mjs`

**Interfaces:**
- `getMarkdownAlternativeUrl(locale, path)` always resolves valid home/static pages.
- `/AGENTS.md` returns sanitized markdown with required sections.

- [x] Require and implement same-path metadata alternates for every localized page.
- [x] Publish Overview, Installation, Configuration, Usage, Validation, and Safety sections at `/AGENTS.md`.
- [x] Update llms and markdown sitemap links to `.md` mirrors and include AGENTS/glossary discovery.
- [x] Preserve `text/plain` for llms and sitemap.md; use `text/markdown` for AGENTS.md.
- [x] Run discovery and SEO tests.
- [x] Commit with `feat: publish agent guidance and mirror discovery`.

### Task 5: Add the localized glossary and page-wide link

**Files:**
- Modify: `src/lib/pages.ts`
- Modify: `src/lib/page-copy.ts`
- Create: `src/lib/page-content/glossary.ts`
- Modify: `src/components/localized-subpage.tsx`
- Modify: `src/app/[locale]/layout.tsx`
- Modify: `src/app/sitemap.ts`
- Test: `tests/page-content-modularization.test.mjs`
- Test: `tests/seo-governance.test.mjs`
- Test: `tests/agent-discovery.test.mjs`

**Interfaces:**
- New `StaticPageKey` value `glossary` with route `/glossary` and localized `InfoPageCopy`.
- Footer navigation includes localized glossary labels.

- [x] Add glossary to route types, static params, navigation labels, and InfoPage dispatch.
- [x] Define localized term sections for acceleration, building motion, event recording, P wave, S wave, sensor, seismic monitoring, and structural engineer.
- [x] Add the visible localized footer link on every page.
- [x] Include glossary in HTML/markdown sitemaps, llms files, and markdown catalog automatically through the page catalog.
- [x] Verify canonical metadata, hreflang, static generation, and content parity.
- [x] Commit with `feat: add localized seismic glossary`.

### Task 6: Full verification, delivery, and production rescan

**Files:**
- Modify: `docs/superpowers/plans/2026-07-26-agent-readability-90.md`
- Optionally modify: `docs/operations/agent-readability.md` if runtime findings require a stable runbook.

- [x] Run `npm run lint`.
- [x] Run `npm run typecheck`.
- [x] Run `npm test` and require all tests green.
- [x] Run `npm run build` and verify every localized HTML and markdown route is emitted/served.
- [x] Run `npm audit --audit-level=high`.
- [x] Start the production build locally and verify representative HTML, `.md`, Accept negotiation, Link/Vary headers, alternate links, and glossary links with curl.
- [x] Run browser/accessibility tests.
- [x] Review added lines for private values, infrastructure paths, and scanner-specific branching.
- [ ] Push branch, open a focused PR, wait for CI/Security/CodeQL/browser checks, review bot feedback, and squash merge.
- [ ] Run exact-main `validate-deploy`, then transactional production deploy.
- [ ] Verify production routes and analytics observability remain green.
- [ ] Trigger a fresh Agent Ready scan, record the verified score and remaining checks, and update issue #14 or the relevant milestone with evidence.
- [ ] Mark this plan complete and remove the temporary worktree after canonical main is clean.
