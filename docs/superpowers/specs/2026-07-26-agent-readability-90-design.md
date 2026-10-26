# SismoSmart Agent Readability 90+ Design

## Goal

Raise the public SismoSmart site from the 2026-07-26 Agent Ready score of 68 into the 90–100 band without changing the visual product experience, weakening consent/privacy controls, exposing operations data, or serving scanner-specific cloaked content.

## Current gaps

The scan reported 420 passes, 165 failures, and 25 warnings across 25 pages. The repeated gaps are markdown mirrors, frontmatter, HTML alternate links, canonical Link headers, Accept-based markdown negotiation, markdown sitemap sections, a glossary link, and a public AGENTS.md. P13 text-to-HTML ratio is also below the scanner threshold because 67–75% of the current Next.js HTML is hydration/Flight script content.

## Chosen architecture

### One content source

HTML and markdown are rendered from the existing localized copy objects. No duplicate hand-maintained page-body markdown files are introduced.

A focused agent-content module owns the complete page catalog, canonical HTML paths, same-path .md mirror paths, page metadata resolution, frontmatter, page-type renderers, safety notes, glossary references, and sitemap sections.

### Same-path markdown mirrors

Every localized page receives a deterministic mirror:

- /en -> /en.md
- /en/product -> /en/product.md
- /tr/security -> /tr/security.md

Each mirror returns 200, `text/markdown; charset=utf-8`, `Vary: Accept`, bounded public caching, and `Link: <canonical-html-url>; rel="canonical"`. It contains YAML frontmatter with title, description, locale, canonical_url, and last_updated, plus a `## Sitemap` section. Invalid locales and routes return a plain-text 404.

The existing /markdown routes remain backwards-compatible aliases, but discovery surfaces point to same-path .md URLs.

### Content negotiation

A narrow `src/proxy.ts` handles only localized public GET and HEAD requests. Direct .md paths and explicit `Accept: text/markdown` requests rewrite to the internal markdown route. Browser HTML, APIs, Next assets, root machine files, and forms remain untouched. No user-agent detection is used.

### Complete alternate metadata

`buildPageMetadata` advertises a same-path markdown alternate for home and every static localized page.

### Public AGENTS.md

A sanitized `/AGENTS.md` route publishes Overview, Installation, Configuration, Usage, Validation, and Safety and limitations sections. It contains only public website guidance and no private deployment paths or credentials.

### Localized glossary

A normal localized glossary page is added for en, tr, es, id, pt, and it. It defines product and seismic terms already used by the site. The shared footer links to the localized glossary on every page. The glossary participates in metadata, sitemap, llms files, and markdown mirrors.

### Discovery updates

llms.txt, llms-full.txt, sitemap.md, and the compatibility markdown index prefer same-path .md URLs. XML sitemap remains canonical-HTML-only.

## Page renderers

Markdown rendering is explicit by page type:

- Home: hero, trust, process, features, demo, proof, FAQ, safety notices.
- Product: description, specifications, use cases, comparison table.
- How it works: process, signals, network.
- About: story, principles, timeline, team.
- Contact: public channels and form purpose, never the forwarding endpoint.
- Info pages: sections and public links.

All strings come from existing public copy or the new localized glossary copy. YAML and table values are escaped deterministically.

## Text-to-HTML policy

The implementation does not serve scanner-specific HTML, add hidden keyword blocks, or rewrite the application architecture solely for P13. It preserves and measures real visible content. Fixing every other current failure and warning yields an expected score near 96 under the current scanner formula, so P13 may remain as an honestly documented residual.

## Security and caching

- Public output is checked against existing credential, private-address, and local-path patterns.
- Analytics, consent, forms, DNS, Doppler, and deployment behavior are unchanged.
- Markdown contains the same public claims and safety notices as HTML.
- `Vary: Accept` prevents HTML/markdown cache confusion.
- Canonical HTML remains the indexing authority.

## Validation

Automated validation covers every locale and page, path mapping, frontmatter, headers, 404 behavior, proxy negotiation, HTML alternate metadata, public AGENTS.md, glossary links, sitemaps, and privacy patterns. The complete lint, typecheck, test, build, dependency, browser, accessibility, CI, security, validate-deploy, transactional deployment, and post-deploy checks must pass.

After production deployment, a fresh Agent Ready scan is run. The target is at least 90; no score is claimed until the scan proves it.

## Acceptance criteria

- Every localized canonical page has a same-path .md mirror.
- Every mirror has frontmatter, canonical Link header, and `## Sitemap`.
- Explicit `Accept: text/markdown` works for every localized canonical page.
- Every localized HTML page advertises its markdown alternate.
- `/AGENTS.md` passes required-section and public-safety checks.
- Every localized page contains a visible glossary link.
- Existing analytics, accessibility, SEO, forms, and deployment behavior remains green.
- Production is deployed transactionally and rescanned.
