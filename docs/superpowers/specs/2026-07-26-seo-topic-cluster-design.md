# SEO Topic Cluster Design

**Date:** 2026-07-26  
**Repository:** `SismoSmart/sismosmart-web`  
**Status:** Approved design, awaiting implementation plan

## 1. Objective

Create the first measurable SEO content sprint for SismoSmart, focused on Türkiye and the English-language global market. The sprint must increase the number of relevant non-brand queries for which Google can understand and surface the site, without publishing unsupported engineering claims or mass-produced low-value content.

The implementation will add a focused guide hub, six bilingual expert guides, stronger commercial-page metadata, structured data, internal links, agent-readable Markdown mirrors, and a read-only Search Console performance report.

## 2. Baseline

The current site already has strong technical foundations:

- localized canonical URLs in six languages;
- reciprocal `hreflang` and `x-default` for existing localized pages;
- XML and Markdown sitemaps;
- robots, canonical metadata, Open Graph, and structured data;
- same-path Markdown representations and `Accept: text/markdown` negotiation;
- Search Console domain verification and sitemap submission;
- GA4, GTM, Clarity, consent controls, and production observability.

Search Console baseline for 2026-06-26 through 2026-07-23:

- 138 impressions;
- 3 clicks;
- 2.17% CTR;
- 10.04 average position.

This data volume is too small to judge durable ranking performance. The first sprint therefore prioritizes discovery, relevance, indexing, and clean measurement rather than promising a specific rank.

## 3. Scope

### 3.1 Guide hubs

Publish two indexable hub pages:

- `/tr/guides`
- `/en/guides`

Each hub will:

- explain the guide collection in plain language;
- group guides by commercial and technical intent;
- link to all six guides in that locale;
- link to relevant product, technology, how-it-works, glossary, FAQ, and pilot pages;
- expose canonical, bilingual `hreflang`, Open Graph, breadcrumb, sitemap, and Markdown discovery metadata.

### 3.2 Six bilingual guide pairs

Publish six topics in both Turkish and English, for twelve guide pages total.

| Translation key | Turkish topic | English topic | Intent |
|---|---|---|---|
| `building-seismic-monitoring-device` | Bina deprem sensörü ve sismik izleme cihazı nedir? | What is a building seismic monitoring device? | Commercial education |
| `measuring-building-motion-after-earthquake` | Deprem sonrası bina hareketi nasıl ölçülür? | How is building motion measured after an earthquake? | Commercial education |
| `earthquake-app-vs-fixed-sensor` | Telefon deprem uygulaması ile sabit sensörün farkı | Earthquake app vs fixed building sensor | Commercial comparison |
| `seismic-sensor-placement` | Binada sismik sensör nereye yerleştirilir? | Where should a seismic sensor be installed in a building? | Commercial guidance |
| `mems-accelerometers-seismic-monitoring` | MEMS ivmeölçer ile sismik izleme | MEMS accelerometers for seismic monitoring | Technical authority |
| `building-natural-frequency-monitoring` | Bina doğal frekansı ve yapısal izleme | Building natural frequency and structural monitoring | Technical authority |

Final slugs may be shortened for readability, but each Turkish and English page must share one immutable `translationKey`.

### 3.3 Page anatomy

Every guide page must contain:

1. search-intent-aligned title, meta description, and H1;
2. a concise direct answer near the beginning;
3. explanatory sections with descriptive H2/H3 headings;
4. key takeaways;
5. practical use cases;
6. limitations and common misunderstandings;
7. a clear explanation of where SismoSmart fits and where it does not;
8. related glossary terms;
9. two or three related guides;
10. a restrained product or pilot CTA;
11. publication and update dates;
12. public references;
13. a safety notice stating that monitoring data does not replace an engineer's inspection or official emergency guidance.

No guide may claim that SismoSmart:

- predicts earthquakes;
- certifies a building as safe;
- replaces structural inspection;
- provides an official early-warning service;
- has validated accuracy, certification, pilot outcomes, or field performance that has not been demonstrated publicly.

### 3.4 Commercial-page optimization

Improve Turkish and English metadata and visible headings for high-intent pages while preserving honest product-stage language.

Primary targets:

- product;
- technology;
- how it works;
- FAQ where relevant.

Examples of intended direction:

- Turkish product title: `Bina Deprem Sensörü ve Sismik İzleme Cihazı | SismoSmart`
- English product title: `Building Seismic Monitoring Device | SismoSmart`

The exact copy must remain natural, fit sensible title lengths, and avoid keyword repetition. H1 and title text must describe the same page topic without being forced to match verbatim.

The other four locales will not receive speculative translations in this sprint. Existing pages remain unchanged except for shared navigation or discovery components that must accommodate the new guides safely.

## 4. Content model

Introduce a focused guide content model with clear separation between data, routing, rendering, metadata, and structured data.

Required logical fields:

```text
translationKey
locale
slug
title
description
summary
sections
keyTakeaways
references
relatedGuides
relatedGlossaryTerms
publishedAt
updatedAt
safetyNotice
cta
```

Content must be stored as typed repository data, not fetched from a runtime CMS. Turkish and English variants must be paired through `translationKey` so that canonical URLs, `hreflang`, sitemap entries, related-guide links, and Markdown representations are generated consistently.

References must use publicly accessible, reputable sources. They must be paraphrased rather than copied and must not imply endorsement by the referenced institution.

## 5. Routing and localization

Expected public routes:

```text
/tr/guides
/en/guides
/tr/guides/<slug>
/en/guides/<slug>
```

Each guide pair must expose reciprocal language alternates only for the versions that actually exist:

- Turkish alternate;
- English alternate;
- English as `x-default`.

The implementation must not create empty or invented guide pages for Spanish, Indonesian, Portuguese, or Italian.

Unsupported locale/slug combinations must return the repository's normal not-found behavior.

## 6. Technical SEO and machine readability

Each guide and guide hub must integrate with the existing SEO and agent-readability systems:

- canonical URL;
- reciprocal `hreflang`;
- XML sitemap entry;
- human-readable sitemap entry;
- Open Graph and Twitter metadata;
- `BreadcrumbList` structured data;
- `Article` structured data for guide detail pages;
- same-path `.md` representation;
- explicit Markdown negotiation through `Accept: text/markdown`;
- canonical `Link` response header and `Vary: Accept` for Markdown;
- `llms.txt` / `llms-full.txt` discovery where appropriate;
- links from guide pages to relevant glossary and product resources.

Structured data must match visible content. Article authorship must not invent named experts. Until verified public author identities are available, the publisher and author entity will be SismoSmart.

Structured data is an interpretation aid, not a ranking or rich-result guarantee.

## 7. Internal linking

Add natural, crawlable links in both languages:

- footer or shared navigation link to `Guides` / `Rehberler`;
- product pages to commercially relevant guides;
- technology pages to MEMS and natural-frequency guides;
- how-it-works pages to measurement and sensor-placement guides;
- each guide to two or three related guides;
- guides to glossary terms;
- relevant guides to product or pilot pages.

Anchor text must be descriptive and varied. The implementation must avoid repetitive exact-match anchors and must not add links merely to increase keyword frequency.

Every guide must be reachable through normal HTML links without requiring client-side interaction.

## 8. Search Console measurement

Add a read-only Search Console performance command or module that produces a safe operational summary for a configurable date range.

The report should include:

- total clicks and impressions;
- CTR and average position;
- top pages;
- top queries;
- non-brand query summary;
- country distribution;
- previous-period comparison when sufficient data exists.

Safety requirements:

- no OAuth credentials or tokens in output;
- no raw authentication payloads;
- no mutation of Search Console properties;
- no automatic URL inspection or indexing requests that rely on unsupported APIs;
- no public commit of private reports.

The baseline values above will be recorded in documentation or tests as historical context, not hard-coded as a permanent expected result.

## 9. Content quality and claim governance

The sprint must follow the existing technical-claims register and content style guide.

Requirements:

- write for users first, not keyword density;
- answer the target query directly;
- distinguish current product behavior from design targets;
- distinguish monitoring from inspection, diagnosis, warning, and certification;
- use neutral language around earthquake risk;
- avoid fear-based calls to action;
- avoid fake quotes, fake case studies, fake authors, fake reviews, and invented pilot results;
- cite technical concepts with reputable public references;
- update all dates and roadmap language consistently when touched.

Where reliable public evidence is insufficient, the content must narrow or omit the claim.

## 10. Testing and validation

Implementation must be test-driven and include coverage for:

- guide catalog uniqueness and bilingual pairing;
- route resolution and not-found behavior;
- title, H1, description, canonical, and `hreflang` contracts;
- XML and Markdown sitemap inclusion;
- Article and Breadcrumb structured data matching visible content;
- same-path Markdown generation and response headers;
- guide hub and related-guide links;
- orphan-page detection;
- public references and safety notices;
- prohibited absolute claims;
- Turkish and English commercial-page title/H1 improvements;
- Search Console report sanitization and deterministic aggregation;
- accessibility and browser navigation for representative guide pages.

Before merge:

- lint passes;
- TypeScript passes;
- full test suite passes;
- production build passes;
- browser/accessibility suite passes;
- dependency audit reports no blocking vulnerability;
- public diff scan finds no credential, private endpoint, or infrastructure-path leakage.

After merge:

- exact-main immutable preflight passes;
- transactional production deploy passes without rollback;
- representative guide HTML and Markdown routes return expected headers/content;
- sitemap and `hreflang` are verified in production;
- Analytics Observability and Lighthouse remain successful;
- Search Console sitemap is resubmitted if necessary;
- performance is observed over at least four to eight weeks before ranking conclusions are made.

## 11. Success criteria

### Release criteria

The sprint is complete when:

- two guide hubs and twelve guide pages are live;
- all pages are indexable and internally linked;
- every bilingual pair has correct canonical and reciprocal alternates;
- metadata, structured data, sitemap, Markdown, accessibility, CI, deploy, analytics, and Lighthouse checks pass;
- the read-only Search Console performance report works without exposing secrets.

### Measurement criteria

The sprint does not promise first-page or first-position rankings. Initial measurement goals are:

- Google discovers and indexes the new routes;
- relevant non-brand query count increases;
- impressions for Turkish and English guide/product pages increase from the current low baseline;
- future title/meta changes are driven by Search Console data rather than assumptions.

## 12. Explicit non-goals

This sprint will not:

- purchase or fabricate backlinks;
- publish third-party endorsements without permission;
- invent pilot, certification, accuracy, or customer evidence;
- create country-specific landing pages without real market-specific information;
- translate the guide collection into all six languages;
- publish fifteen to twenty low-depth articles at once;
- use hidden text, keyword stuffing, doorway pages, cloaking, or crawler-specific content;
- guarantee rankings or indexing dates;
- replace future real-world authority work such as university partnerships, pilot evidence, press coverage, and independent reviews.

## 13. Delivery strategy

Deliver through one isolated feature branch and one reviewable pull request unless implementation review reveals a clear need to split operational measurement from public content.

Recommended implementation order:

1. content model and failing contracts;
2. guide catalog and bilingual content;
3. route and rendering layer;
4. metadata, structured data, sitemap, and Markdown integration;
5. internal links and commercial-page optimization;
6. Search Console reporting;
7. full validation, PR, deploy, and production evidence.
