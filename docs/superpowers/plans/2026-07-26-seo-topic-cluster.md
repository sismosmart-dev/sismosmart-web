# SEO Topic Cluster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish two guide hubs and twelve bilingual Turkish/English expert guides, improve high-intent commercial metadata, integrate the new pages into SEO and agent-readability systems, and add a safe read-only Search Console performance report.

**Architecture:** Store guide content as typed repository data grouped by immutable translation keys. Render it through dedicated hub/detail routes and components, while focused guide modules own metadata, structured data, Markdown, route resolution, and bilingual alternates. Extend existing sitemap, discovery, Proxy, navigation, browser-quality, and Search Console systems without changing the six-language contract for existing pages.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, Node.js test runner, Google Search Console API through `googleapis`, JSON-LD, existing Next.js Proxy and Markdown representation layer.

## Global Constraints

- Public guide locales are exactly `en` and `tr`; do not create guide routes for `es`, `id`, `pt`, or `it`.
- Publish exactly six immutable translation keys and twelve detail pages, plus `/en/guides` and `/tr/guides`.
- Every guide must contain a direct answer, descriptive sections, key takeaways, limitations, SismoSmart fit, related guides, glossary links, references, publication/update dates, safety notice, and restrained CTA.
- Never claim earthquake prediction, official early warning, building-safety certification, replacement of structural inspection, validated field accuracy, certification, or pilot results.
- Existing non-guide pages in `es`, `id`, `pt`, and `it` remain unchanged except for safe shared discovery/navigation behavior.
- Guide `hreflang` contains only `en`, `tr`, and English `x-default`.
- All public technical references are paraphrased; no referenced institution is presented as endorsing SismoSmart.
- Search Console reporting is read-only and never emits credentials, OAuth payloads, tokens, raw headers, or private reports.
- No new runtime dependency is required.
- Implementation is test-driven, uses focused files, and ends each task with a commit.

---

## File Structure

### Guide domain

- Create `src/lib/guides/types.ts` — guide types and immutable locale/key unions.
- Create `src/lib/guides/content/en/*.ts` — one English content file per guide.
- Create `src/lib/guides/content/tr/*.ts` — one Turkish content file per guide.
- Create `src/lib/guides/content/en/index.ts` and `src/lib/guides/content/tr/index.ts` — locale catalogs and hub copy.
- Create `src/lib/guides/catalog.ts` — route resolution, bilingual pairing, URLs, related-guide resolution, locale-switch maps, and validation-friendly exports.
- Create `src/lib/guides/metadata.ts` — guide-only canonical/Open Graph/Twitter/Markdown metadata with partial locale alternates.
- Create `src/lib/guides/structured-data.ts` — Article, CollectionPage, and BreadcrumbList JSON-LD.
- Create `src/lib/guides/markdown.ts` — hub/detail Markdown renderers.

### Routes and rendering

- Create `src/app/[locale]/guides/page.tsx` — English/Turkish guide hub.
- Create `src/app/[locale]/guides/[slug]/page.tsx` — static guide details.
- Create `src/app/markdown/guides/[locale]/route.ts` — internal hub Markdown response.
- Create `src/app/markdown/guides/[locale]/[slug]/route.ts` — internal detail Markdown response.
- Create `src/components/guides/guide-hub-page.tsx` — hub UI.
- Create `src/components/guides/guide-detail-page.tsx` — article UI, references, related links, CTA, dates, and safety notice.
- Create `src/components/guides/guide-links.tsx` — reusable commercial-page related-guide block.

### Existing integrations

- Modify `src/proxy.ts` — negotiate nested `/guides` HTML and `.md` routes narrowly.
- Modify `src/app/sitemap.ts` — add fourteen guide URLs with partial bilingual alternates.
- Modify `src/app/sitemap.md/route.ts`, `src/app/llms.txt/route.ts`, `src/app/llms-full.txt/route.ts`, and `src/app/markdown/route.ts` — discover guide hubs/details.
- Modify `src/app/[locale]/layout.tsx` and `src/lib/pages.ts` — expose `Guides`/`Rehberler` through crawlable shared navigation without inventing other-locale routes.
- Modify `src/lib/page-content/en.ts` and `src/lib/page-content/tr.ts` — commercial titles, descriptions, H1 copy, and related-guide links.
- Modify focused page renderers for product, technology, and how-it-works — render related-guide blocks.
- Create `scripts/ops/search-console-performance-lib.mjs` — deterministic safe aggregation.
- Modify `scripts/ops/search-console.mjs` — add the read-only `performance` command.
- Modify `package.json` — include new test files in `test` and `test:coverage`.
- Modify `scripts/test/browser-quality-lib.mjs` and `tests/browser-quality.test.mjs` — representative guide browser coverage.

### Tests

- Create `tests/guide-content.test.mjs` — content catalog, bilingual pairing, references, safety, links, and claim governance.
- Create `tests/guide-routing.test.mjs` — hub/detail route params, metadata, JSON-LD, Markdown, sitemap, and not-found behavior.
- Create `tests/search-console-performance.test.mjs` — aggregation, non-brand filtering, previous-period comparison, and sanitization.
- Modify `tests/agent-discovery.test.mjs`, `tests/agent-negotiation.test.mjs`, `tests/seo-governance.test.mjs`, `tests/repository-contract.test.mjs`, and browser tests as specified below.

---

### Task 1: Define the immutable guide types and locale/key contracts

**Files:**
- Create: `src/lib/guides/types.ts`
- Create: `tests/guide-content.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces:
  - `export const guideLocales = ["en", "tr"] as const`
  - `export type GuideLocale = (typeof guideLocales)[number]`
  - `export function isGuideLocale(value: string): value is GuideLocale`
  - `export const guideTranslationKeys = [...] as const`
  - `export type GuideTranslationKey = (typeof guideTranslationKeys)[number]`
  - `GuideReference`, `GuideSection`, `GuideCta`, `GuideContent`, `GuideHubCopy`

- [ ] **Step 1: Add the new tests to the package scripts**

Insert these files into both `test` and `test:coverage`, immediately after `tests/agent-negotiation.test.mjs`:

```text
tests/guide-content.test.mjs tests/guide-routing.test.mjs tests/search-console-performance.test.mjs
```

The latter two files will be created in later tasks; run only the focused Task 1 test until then.

- [ ] **Step 2: Write the failing immutable-domain test**

Create `tests/guide-content.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";

import {
  guideLocales,
  guideTranslationKeys,
  isGuideLocale,
} from "../src/lib/guides/types.ts";

const expectedKeys = [
  "building-seismic-monitoring-device",
  "measuring-building-motion-after-earthquake",
  "earthquake-app-vs-fixed-sensor",
  "seismic-sensor-placement",
  "mems-accelerometers-seismic-monitoring",
  "building-natural-frequency-monitoring",
];

test("guide domain fixes the supported locales and translation keys", () => {
  assert.deepEqual(guideLocales, ["en", "tr"]);
  assert.deepEqual(guideTranslationKeys, expectedKeys);
  assert.equal(isGuideLocale("en"), true);
  assert.equal(isGuideLocale("tr"), true);
  assert.equal(isGuideLocale("es"), false);
  assert.equal(isGuideLocale("missing"), false);
});
```

- [ ] **Step 3: Run the focused test and verify red**

Run:

```bash
node --import ./tests/alias-loader.mjs --test tests/guide-content.test.mjs
```

Expected: FAIL because `src/lib/guides/types.ts` does not exist.

- [ ] **Step 4: Create exact domain types**

Create `src/lib/guides/types.ts`:

```ts
export const guideLocales = ["en", "tr"] as const;
export type GuideLocale = (typeof guideLocales)[number];

export function isGuideLocale(value: string): value is GuideLocale {
  return guideLocales.includes(value as GuideLocale);
}

export const guideTranslationKeys = [
  "building-seismic-monitoring-device",
  "measuring-building-motion-after-earthquake",
  "earthquake-app-vs-fixed-sensor",
  "seismic-sensor-placement",
  "mems-accelerometers-seismic-monitoring",
  "building-natural-frequency-monitoring",
] as const;
export type GuideTranslationKey = (typeof guideTranslationKeys)[number];

export type GuideReference = {
  label: string;
  organization: string;
  url: string;
};

export type GuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type GuideCta = {
  label: string;
  href: "/product" | "/pilot-program";
  description: string;
};

export type GuideContent = {
  translationKey: GuideTranslationKey;
  locale: GuideLocale;
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  summary: string;
  keyTakeaways: string[];
  sections: GuideSection[];
  limitations: string[];
  sismosmartFit: string[];
  references: GuideReference[];
  relatedGuides: GuideTranslationKey[];
  relatedGlossaryTerms: string[];
  publishedAt: string;
  updatedAt: string;
  safetyNotice: string;
  cta: GuideCta;
};

export type GuideHubCopy = {
  locale: GuideLocale;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  commercialHeading: string;
  technicalHeading: string;
  relatedResourcesHeading: string;
};
```

- [ ] **Step 5: Run the focused test and verify green**

Run the same focused test. Expected: PASS.

- [ ] **Step 6: Commit the green domain contract**

```bash
git add package.json tests/guide-content.test.mjs src/lib/guides/types.ts
git commit -m "test: define bilingual guide domain"
```

---

### Task 2: Author six English and six Turkish guides from authoritative public sources

**Files:**
- Create: `src/lib/guides/catalog.ts`
- Create: `src/lib/guides/content/en/index.ts`
- Create: `src/lib/guides/content/tr/index.ts`
- Create: `src/lib/guides/content/en/building-seismic-monitoring-device.ts`
- Create: `src/lib/guides/content/en/measuring-building-motion-after-earthquake.ts`
- Create: `src/lib/guides/content/en/earthquake-app-vs-fixed-sensor.ts`
- Create: `src/lib/guides/content/en/seismic-sensor-placement.ts`
- Create: `src/lib/guides/content/en/mems-accelerometers-seismic-monitoring.ts`
- Create: `src/lib/guides/content/en/building-natural-frequency-monitoring.ts`
- Create: `src/lib/guides/content/tr/building-seismic-monitoring-device.ts`
- Create: `src/lib/guides/content/tr/measuring-building-motion-after-earthquake.ts`
- Create: `src/lib/guides/content/tr/earthquake-app-vs-fixed-sensor.ts`
- Create: `src/lib/guides/content/tr/seismic-sensor-placement.ts`
- Create: `src/lib/guides/content/tr/mems-accelerometers-seismic-monitoring.ts`
- Create: `src/lib/guides/content/tr/building-natural-frequency-monitoring.ts`
- Modify: `tests/guide-content.test.mjs`

**Interfaces:**
- Each content file exports one `GuideContent` constant.
- Locale indexes export `englishGuides`, `turkishGuides`, `englishGuideHub`, and `turkishGuideHub`.
- `src/lib/guides/catalog.ts` produces:
  - `getGuideHub(locale: GuideLocale): GuideHubCopy`
  - `getGuides(locale: GuideLocale): readonly GuideContent[]`
  - `getGuideBySlug(localeValue: string, slug: string): GuideContent | null`
  - `getGuideByTranslationKey(locale: GuideLocale, key: GuideTranslationKey): GuideContent`
  - `getGuideCanonicalPath(guide: GuideContent): string`
  - `getGuideMarkdownPath(guide: GuideContent): string`
  - `getGuideAlternates(key: GuideTranslationKey): Record<"en" | "tr" | "x-default", string>`
  - `getGuideLocaleSwitchPathMap(): Record<string, Partial<Record<GuideLocale, string>>>`

- [ ] **Step 1: Extend the catalog and content-quality tests**

Import the catalog functions and add the six-pair route contract:

```js
import {
  getGuideAlternates,
  getGuideBySlug,
  getGuideByTranslationKey,
  getGuideCanonicalPath,
  getGuideMarkdownPath,
  getGuides,
  getGuideLocaleSwitchPathMap,
} from "../src/lib/guides/catalog.ts";

for (const locale of guideLocales) {
  const guides = getGuides(locale);
  assert.equal(guides.length, 6);
  assert.deepEqual(guides.map((guide) => guide.translationKey).sort(), [...guideTranslationKeys].sort());
  assert.equal(new Set(guides.map((guide) => guide.slug)).size, 6);
}

for (const key of guideTranslationKeys) {
  const en = getGuideByTranslationKey("en", key);
  const tr = getGuideByTranslationKey("tr", key);
  assert.equal(getGuideBySlug("en", en.slug), en);
  assert.equal(getGuideBySlug("tr", tr.slug), tr);
  assert.equal(getGuideCanonicalPath(en), `/en/guides/${en.slug}`);
  assert.equal(getGuideMarkdownPath(tr), `/tr/guides/${tr.slug}.md`);
  assert.deepEqual(getGuideAlternates(key), {
    en: `https://sismosmart.com/en/guides/${en.slug}`,
    tr: `https://sismosmart.com/tr/guides/${tr.slug}`,
    "x-default": `https://sismosmart.com/en/guides/${en.slug}`,
  });
}
assert.equal(getGuideBySlug("es", "anything"), null);
assert.equal(getGuideBySlug("en", "missing"), null);
const switchMap = getGuideLocaleSwitchPathMap();
assert.equal(switchMap["/en/guides"].tr, "/tr/guides");
assert.equal(switchMap["/tr/guides"].en, "/en/guides");
```

Then add tests that require every guide to satisfy:

```js
for (const locale of guideLocales) {
  for (const guide of getGuides(locale)) {
    assert.ok(guide.title.length >= 35 && guide.title.length <= 70);
    assert.ok(guide.description.length >= 100 && guide.description.length <= 180);
    assert.ok(guide.h1.length >= 20);
    assert.ok(guide.summary.length >= 180);
    assert.ok(guide.sections.length >= 4);
    assert.ok(guide.keyTakeaways.length >= 3);
    assert.ok(guide.limitations.length >= 3);
    assert.ok(guide.sismosmartFit.length >= 2);
    assert.ok(guide.references.length >= 2);
    assert.ok(guide.relatedGuides.length >= 2 && guide.relatedGuides.length <= 3);
    assert.ok(guide.relatedGlossaryTerms.length >= 2);
    assert.match(guide.publishedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(guide.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(guide.safetyNotice, /engineer|mühendis/i);
    assert.ok(guide.references.every((reference) => reference.url.startsWith("https://")));
  }
}
```

Add prohibited-claim checks over serialized guide content:

```js
const publicCopy = guideLocales.flatMap(getGuides).map(JSON.stringify).join("\n");
for (const pattern of [
  /predicts? earthquakes?/i,
  /depremi (?:önceden )?tahmin/i,
  /certifies? (?:a )?building (?:as )?safe/i,
  /binanın güvenli olduğunu (?:belirler|onaylar)/i,
  /replaces? (?:a )?(?:structural )?engineer/i,
  /mühendisin yerini alır/i,
  /official early.warning/i,
  /resm[iî] erken uyarı/i,
  /proven accuracy/i,
  /kanıtlanmış doğruluk/i,
]) assert.doesNotMatch(publicCopy, pattern);
```

- [ ] **Step 2: Run the test and verify red**

Run the focused test. Expected: FAIL on missing content modules or completeness assertions.

- [ ] **Step 3: Use only the approved source set**

References may be reused across guides. Use human-readable labels and the canonical public URLs below:

```text
USGS — National Strong Motion Project
https://earthquake.usgs.gov/monitoring/nsmp/

USGS — Earthquake Monitoring of Structures
https://earthquake.usgs.gov/monitoring/nsmp/buildings/

USGS — Monitoring Earthquake Shaking in Buildings to Reduce Loss of Life and Property
https://pubs.usgs.gov/fs/2003/fs068-03/

USGS — Monitoring Earthquake Shaking in Federal Buildings
https://pubs.usgs.gov/fs/2005/3052/

USGS — Seismographs: Keeping Track of Earthquakes
https://www.usgs.gov/programs/earthquake-hazards/seismographs-keeping-track-earthquakes

USGS — ShakeNet portable wireless structural sensor network
https://pubs.usgs.gov/publication/ofr20151134

USGS — Ambient Vibration and Earthquake Strong-Motion Data Sets
https://pubs.usgs.gov/of/2004/1375/

NIST — Measurement of Structural Response Characteristics of Full-Scale Buildings
https://doi.org/10.6028/NIST.IR.4511

UC Berkeley — MyShake project and research references
https://myshake.berkeley.edu/about-us

UC Berkeley — Mobile Phones as Seismologic Sensors
https://doi.org/10.1109/TASE.2013.2245121
```

Do not quote more than a short phrase from any source. Do not mention SismoSmart in a way that suggests a partnership with USGS, NIST, or UC Berkeley.

- [ ] **Step 4: Create locale index files and hub copy**

English hub copy:

```ts
export const englishGuideHub: GuideHubCopy = {
  locale: "en",
  title: "Building Seismic Monitoring Guides | SismoSmart",
  description: "Practical guides to building seismic monitoring, fixed sensors, MEMS accelerometers, sensor placement, earthquake recordings, and natural frequency.",
  eyebrow: "Guides",
  h1: "Understand building seismic monitoring",
  intro: "Clear, evidence-based explanations for residents, building managers, small organizations, and technical readers. These guides explain what monitoring data can show, what it cannot prove, and when qualified engineering review is still required.",
  commercialHeading: "Start with practical questions",
  technicalHeading: "Explore the measurement concepts",
  relatedResourcesHeading: "Related SismoSmart resources",
};
```

Turkish hub copy:

```ts
export const turkishGuideHub: GuideHubCopy = {
  locale: "tr",
  title: "Bina Sismik İzleme Rehberleri | SismoSmart",
  description: "Bina deprem sensörleri, sabit sensörler, MEMS ivmeölçerler, sensör yerleşimi, deprem kayıtları ve doğal frekans için uygulamalı rehberler.",
  eyebrow: "Rehberler",
  h1: "Bina sismik izlemeyi anlayın",
  intro: "Ev sahipleri, apartman yöneticileri, küçük kurumlar ve teknik okuyucular için açık ve kanıta dayalı anlatımlar. Bu rehberler ölçüm verisinin ne gösterebileceğini, neyi kanıtlayamayacağını ve ne zaman yetkili mühendis değerlendirmesi gerektiğini açıklar.",
  commercialHeading: "Pratik sorularla başlayın",
  technicalHeading: "Ölçüm kavramlarını inceleyin",
  relatedResourcesHeading: "İlgili SismoSmart kaynakları",
};
```

- [ ] **Step 5: Write the four commercial guide pairs**

Use this exact content matrix. Each row becomes one English and one Turkish content file; translations must preserve meaning rather than copy sentence order mechanically.

| Key | English slug | Turkish slug | Required section headings | Required claims and boundaries |
|---|---|---|---|---|
| `building-seismic-monitoring-device` | `building-seismic-monitoring-device` | `bina-deprem-sensoru-sismik-izleme` | Direct answer; What the device measures; How fixed monitoring differs from an alarm; Where it is useful; Limitations | Fixed accelerometers record motion at their mounting point; building arrays help engineers compare motion through a structure; a consumer monitor is not a safety certificate. |
| `measuring-building-motion-after-earthquake` | `measuring-building-motion-after-earthquake` | `deprem-sonrasi-bina-hareketi-olcumu` | Direct answer; Acceleration and time history; Comparing locations; From recording to engineering review; Limitations | Post-event records describe measured motion; interpretation depends on building/site/event context; data can support prioritization but not replace inspection. |
| `earthquake-app-vs-fixed-sensor` | `earthquake-app-vs-fixed-building-sensor` | `deprem-uygulamasi-sabit-sensor-farki` | Direct answer; What phone apps do well; Why a fixed reference matters; Alerts versus building records; Choosing the right tool | Phones can participate in dense detection networks but move with users and vary by device; a fixed sensor provides a stable location reference; official alerts and fixed building records solve different problems. |
| `seismic-sensor-placement` | `seismic-sensor-placement-building` | `binada-sismik-sensor-yerlesimi` | Direct answer; Stable mounting; One sensor versus an array; Input and upper-floor motion; Practical pre-installation checklist; Limitations | Placement follows the measurement objective; secure attachment to a stable building surface matters; multiple floors are needed to compare response; no universal placement certifies a building. |

Every guide must include a `Where SismoSmart fits`/`SismoSmart bu tabloda nerede?` section in `sismosmartFit`, explicitly describing the product as pre-launch and the listed capabilities as design targets until pilot validation.

- [ ] **Step 6: Write the two technical guide pairs**

| Key | English slug | Turkish slug | Required section headings | Required claims and boundaries |
|---|---|---|---|---|
| `mems-accelerometers-seismic-monitoring` | `mems-accelerometers-seismic-monitoring` | `mems-ivmeolcer-sismik-izleme` | Direct answer; How MEMS acceleration sensing works; Resolution, range, and noise; Sampling and timing; From low-cost sensing to useful data; Limitations | MEMS devices can support structural and strong-motion applications when range, noise, sampling, timing, mounting, and calibration match the objective; low cost alone does not guarantee engineering-quality data. |
| `building-natural-frequency-monitoring` | `building-natural-frequency-structural-monitoring` | `bina-dogal-frekansi-yapisal-izleme` | Direct answer; What natural frequency means; Ambient vibration and strong motion; Why frequency can vary; Trend monitoring; Limitations | Dynamic characteristics can be estimated from measured vibration; frequency changes can result from damage but also environment, occupancy, amplitude, and analysis choices; a change is a review signal, not a diagnosis. |

- [ ] **Step 7: Implement the catalog over locale indexes**

Create `src/lib/guides/catalog.ts` after the locale index exports exist in the same working change. Use maps keyed by locale, slug, and translation key. `getGuideBySlug` must validate `localeValue` with `isGuideLocale`; do not cast arbitrary strings. URL helpers are:

```ts
export function getGuideCanonicalPath(guide: GuideContent) {
  return `/${guide.locale}/guides/${guide.slug}`;
}

export function getGuideMarkdownPath(guide: GuideContent) {
  return `${getGuideCanonicalPath(guide)}.md`;
}
```

`getGuideLocaleSwitchPathMap()` must contain both hub paths and both detail paths for every translation key, each mapping only to real English/Turkish targets.

- [ ] **Step 8: Run the focused content tests**

Expected: all guide-content tests PASS.

- [ ] **Step 9: Commit the content catalog**

```bash
git add src/lib/guides tests/guide-content.test.mjs
git commit -m "feat: add bilingual seismic monitoring guides"
```

---

### Task 3: Render guide hubs and detail pages with partial-locale metadata

**Files:**
- Create: `src/components/guides/guide-hub-page.tsx`
- Create: `src/components/guides/guide-detail-page.tsx`
- Create: `src/components/guides/guide-links.tsx`
- Create: `src/lib/guides/metadata.ts`
- Create: `src/app/[locale]/guides/page.tsx`
- Create: `src/app/[locale]/guides/[slug]/page.tsx`
- Create: `tests/guide-routing.test.mjs`

**Interfaces:**
- `buildGuideHubMetadata(locale: GuideLocale): Metadata`
- `buildGuideMetadata(guide: GuideContent): Metadata`
- `GuideLinks({ locale, translationKeys, heading }: Props)` renders crawlable anchors.
- Route `generateStaticParams()` for hubs returns exactly `[{locale:"en"},{locale:"tr"}]`.
- Detail route params return exactly twelve locale/slug pairs.

- [ ] **Step 1: Write failing route and metadata tests**

Create `tests/guide-routing.test.mjs` and import the route modules plus catalog. Verify:

```js
assert.deepEqual(hubRoute.generateStaticParams(), [{ locale: "en" }, { locale: "tr" }]);
assert.equal(detailRoute.generateStaticParams().length, 12);
```

For one English and one Turkish guide, call `generateMetadata` and assert:

```js
assert.equal(metadata.alternates.canonical, `https://sismosmart.com${canonicalPath}`);
assert.deepEqual(Object.keys(metadata.alternates.languages).sort(), ["en", "tr", "x-default"]);
assert.equal(metadata.alternates.types["text/markdown"], `${canonicalPathAbsolute}.md`);
assert.equal(metadata.openGraph.url, canonicalPathAbsolute);
```

Read component source and require semantic `<main id="content">`, one `<h1>`, visible `<time>`, `<article>`, references, safety notice, and ordinary `<a href>` links.

- [ ] **Step 2: Run the route test and verify red**

Expected: FAIL because the route and metadata modules do not exist.

- [ ] **Step 3: Implement guide-only metadata**

`src/lib/guides/metadata.ts` must not call `buildPageMetadata`, because that helper advertises all six locales. Build metadata with:

```ts
alternates: {
  canonical,
  languages: getGuideAlternates(guide.translationKey),
  types: { "text/markdown": `${siteConfig.url}${getGuideMarkdownPath(guide)}` },
}
```

Hub alternates are exactly:

```ts
{
  en: `${siteConfig.url}/en/guides`,
  tr: `${siteConfig.url}/tr/guides`,
  "x-default": `${siteConfig.url}/en/guides`,
}
```

Use `openGraph.type = "article"` for details and `"website"` for hubs. Use existing 1200×630 SismoSmart OG image; do not invent per-guide images.

- [ ] **Step 4: Implement the hub component**

Render:

- eyebrow, H1, intro;
- four commercial guides under the localized commercial heading;
- two technical guides under the localized technical heading;
- links to localized product, technology, how-it-works, FAQ, glossary, and pilot pages;
- no client-only navigation requirement.

- [ ] **Step 5: Implement the detail component**

Render fields in this order:

1. breadcrumb links Home → Guides → current title;
2. eyebrow, H1, summary;
3. published/updated dates with ISO `dateTime`;
4. key takeaways;
5. sections;
6. limitations;
7. SismoSmart fit;
8. related glossary links to `/${locale}/glossary` with fragment-safe term labels only if stable IDs exist; otherwise link to the glossary page without fabricated fragments;
9. related guides via `GuideLinks`;
10. reference list with `rel="noreferrer"` and visible organization names;
11. safety notice;
12. restrained CTA to localized product or pilot route.

- [ ] **Step 6: Implement route not-found boundaries**

Both routes first validate `locale` against `guideLocales`. Detail route then resolves the slug with `getGuideBySlug`. Unsupported locale or slug calls `notFound()`.

- [ ] **Step 7: Run focused tests, typecheck, and commit**

```bash
node --import ./tests/alias-loader.mjs --test tests/guide-content.test.mjs tests/guide-routing.test.mjs
npm run typecheck
git add src/app/[locale]/guides src/components/guides src/lib/guides/metadata.ts tests/guide-routing.test.mjs
git commit -m "feat: render bilingual guide pages"
```

---

### Task 4: Add Article and breadcrumb structured data

**Files:**
- Create: `src/lib/guides/structured-data.ts`
- Modify: `src/app/[locale]/guides/page.tsx`
- Modify: `src/app/[locale]/guides/[slug]/page.tsx`
- Modify: `tests/guide-routing.test.mjs`

**Interfaces:**
- `getGuideHubStructuredData(locale: GuideLocale): object[]`
- `getGuideStructuredData(guide: GuideContent): object[]`

- [ ] **Step 1: Add failing structured-data tests**

For each guide, require one `Article` and one `BreadcrumbList`. Assert:

```js
assert.equal(article.headline, guide.h1);
assert.equal(article.description, guide.description);
assert.equal(article.url, `https://sismosmart.com${getGuideCanonicalPath(guide)}`);
assert.equal(article.datePublished, guide.publishedAt);
assert.equal(article.dateModified, guide.updatedAt);
assert.equal(article.inLanguage, guide.locale);
assert.deepEqual(article.author, { "@type": "Organization", name: "SismoSmart", url: "https://sismosmart.com" });
assert.deepEqual(article.publisher, article.author);
```

Breadcrumb positions are Home=1, Guides=2, article=3. Hub structured data uses `CollectionPage` plus a two-item breadcrumb.

- [ ] **Step 2: Verify red, implement minimal JSON-LD, and render it**

Use the existing `StructuredData` component. Do not add fake person authors, ratings, reviews, offers, or certification properties.

- [ ] **Step 3: Run tests and commit**

```bash
node --import ./tests/alias-loader.mjs --test tests/guide-routing.test.mjs
git add src/lib/guides/structured-data.ts src/app/[locale]/guides tests/guide-routing.test.mjs
git commit -m "feat: add guide article structured data"
```

---

### Task 5: Integrate XML sitemap, human-readable sitemap, and LLM discovery

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/sitemap.md/route.ts`
- Modify: `src/app/llms.txt/route.ts`
- Modify: `src/app/llms-full.txt/route.ts`
- Modify: `src/app/markdown/route.ts`
- Modify: `tests/seo-governance.test.mjs`
- Modify: `tests/agent-discovery.test.mjs`

**Interfaces:**
- Sitemap produces existing 84 localized routes plus 14 guide routes, total 98 entries.
- Guide entries advertise only `en`, `tr`, `x-default`.
- Existing entries still advertise all six locales plus `x-default`.

- [ ] **Step 1: Write failing sitemap/discovery tests**

Update sitemap count:

```js
const existingCount = locales.length * (1 + staticPageKeys.length);
assert.equal(entries.length, existingCount + 14);
```

Separate guide entries by `url.includes("/guides")`; assert fourteen unique URLs and exact alternate keys `["en", "tr", "x-default"]`. Existing entries retain the old seven-key contract.

Require discovery bodies to include:

```text
https://sismosmart.com/en/guides
https://sismosmart.com/tr/guides
https://sismosmart.com/en/guides/building-seismic-monitoring-device
https://sismosmart.com/en/guides/building-seismic-monitoring-device.md
```

- [ ] **Step 2: Verify red**

Run focused SEO and agent-discovery tests. Expected: guide URLs absent.

- [ ] **Step 3: Add sitemap entries**

Use catalog functions rather than duplicating slugs. Hubs use priority `0.8`, guides use `0.7`, `changeFrequency: "monthly"`, and `lastModified` from guide `updatedAt`. Do not use the current clock for guide dates.

- [ ] **Step 4: Update text discovery routes**

- `sitemap.md`: add `## English guides` and `## Turkish guides`.
- `llms.txt`: add the English hub and all six English guides under `## Guides`.
- `llms-full.txt`: include both hubs and concise summaries for all twelve guides.
- `/markdown`: list the hub and guide same-path Markdown URLs separately from the legacy static page list.

- [ ] **Step 5: Run tests and commit**

```bash
node --import ./tests/alias-loader.mjs --test tests/seo-governance.test.mjs tests/agent-discovery.test.mjs
git add src/app/sitemap.ts src/app/sitemap.md/route.ts src/app/llms.txt/route.ts src/app/llms-full.txt/route.ts src/app/markdown/route.ts tests/seo-governance.test.mjs tests/agent-discovery.test.mjs
git commit -m "feat: publish guide discovery metadata"
```

---

### Task 6: Add same-path guide Markdown and nested content negotiation

**Files:**
- Create: `src/lib/guides/markdown.ts`
- Create: `src/app/markdown/guides/[locale]/route.ts`
- Create: `src/app/markdown/guides/[locale]/[slug]/route.ts`
- Modify: `src/proxy.ts`
- Modify: `src/lib/guides/metadata.ts`
- Modify: `tests/agent-negotiation.test.mjs`
- Modify: `tests/guide-routing.test.mjs`
- Modify: `tests/repository-contract.test.mjs`

**Interfaces:**
- `renderGuideHubMarkdown(locale: GuideLocale): string`
- `renderGuideMarkdown(guide: GuideContent): string`
- Internal hub path: `/markdown/guides/{locale}`
- Internal detail path: `/markdown/guides/{locale}/{slug}`

- [ ] **Step 1: Write failing Markdown and Proxy tests**

Add rewrite cases:

```js
["/en/guides.md", "/markdown/guides/en"],
["/tr/guides/bina-deprem-sensoru-sismik-izleme.md", "/markdown/guides/tr/bina-deprem-sensoru-sismik-izleme"],
```

Add negotiation cases for HTML paths with `Accept: text/markdown`. Add pass-through cases for `/es/guides`, missing guide slugs, POST requests, and unrelated nested routes.

Route response assertions:

- `content-type: text/markdown; charset=utf-8`
- `Vary: Accept`
- canonical `Link` header points to HTML
- frontmatter has `title`, `description`, `locale`, `canonical_url`, `published_at`, `last_updated`
- body has `## Key takeaways` or `## Önemli noktalar`, `## References`/`## Kaynaklar`, safety, related guides, and `## Sitemap`.

- [ ] **Step 2: Verify red**

Run agent-negotiation and guide-routing tests.

- [ ] **Step 3: Implement Markdown renderers and response routes**

Keep visible HTML and Markdown sourced from the same `GuideContent`. Escape YAML with the existing JSON-string strategy. Do not fetch pages over HTTP.

- [ ] **Step 4: Refactor Proxy parsing into explicit resolvers**

Preserve existing one-segment static routes. Add a guide resolver before the existing fallback:

```ts
function resolveGuideMarkdownRewrite(pathname: string, directMarkdown: boolean) {
  // Accept only /{en|tr}/guides(.md), /{en|tr}/guides/{known-slug}(.md)
  // Return the internal /markdown/guides/... path or null.
}
```

The Proxy must validate the slug through `getGuideBySlug`; it must not rewrite arbitrary nested paths.

- [ ] **Step 5: Run focused tests, typecheck, and commit**

```bash
node --import ./tests/alias-loader.mjs --test tests/agent-negotiation.test.mjs tests/guide-routing.test.mjs tests/repository-contract.test.mjs
npm run typecheck
git add src/lib/guides/markdown.ts src/app/markdown/guides src/proxy.ts src/lib/guides/metadata.ts tests/agent-negotiation.test.mjs tests/guide-routing.test.mjs tests/repository-contract.test.mjs
git commit -m "feat: add guide markdown negotiation"
```

---

### Task 7: Add crawlable internal links and optimize English/Turkish commercial pages

**Files:**
- Modify: `src/lib/pages.ts`
- Modify: `src/app/[locale]/layout.tsx`
- Modify: `src/lib/page-content/en.ts`
- Modify: `src/lib/page-content/tr.ts`
- Modify: `src/components/localized-pages/product-page.tsx`
- Modify: `src/components/localized-pages/how-it-works-page.tsx`
- Modify: `src/components/localized-pages/info-page.tsx`
- Modify: `tests/guide-content.test.mjs`
- Modify: `tests/seo-governance.test.mjs`
- Modify: `tests/localized-page-modularization.test.mjs` if renderer dependency limits require it

**Interfaces:**
- `getGuideNavigationLink(locale: Locale): SiteLink | null` returns only English/Turkish links.
- `GuideLinks` consumes translation keys and locale, and renders nothing for non-guide locales.

- [ ] **Step 1: Write failing title/H1 and orphan-link tests**

Require exact commercial metadata/H1 direction:

```js
assert.equal(en.product.meta.title, "Building Seismic Monitoring Device | SismoSmart");
assert.equal(tr.product.meta.title, "Bina Deprem Sensörü ve Sismik İzleme Cihazı | SismoSmart");
assert.match(en.product.title, /seismic monitoring device/i);
assert.match(tr.product.title, /bina deprem sensörü|sismik izleme cihazı/i);
```

Also require English/Turkish technology and how-it-works metadata to include natural user language around building motion/seismic monitoring without repeating the same keyword twice.

Create an orphan check that gathers hub links, commercial page guide links, and related guide links; every guide canonical path must have at least one incoming HTML link from another indexable page.

- [ ] **Step 2: Verify red**

Run guide-content and SEO tests.

- [ ] **Step 3: Add shared navigation safely**

Add `Guides`/`Rehberler` to the footer for `en` and `tr`. For other locales, do not render a guide link. Do not add guides to the already crowded primary desktop navigation.

The locale switch script must not produce nonexistent guide URLs. Import `getGuideLocaleSwitchPathMap()` into the localized layout, serialize its public path-only map into the existing inline script, and look up the current relative path before generic substitution. On a guide hub or detail path, `en` and `tr` use the mapped real route; `es`, `id`, `pt`, and `it` resolve to `/${nextLocale}`. All non-guide paths continue through the existing generic substitution logic.

- [ ] **Step 4: Optimize commercial copy**

English product:

```text
Title: Building Seismic Monitoring Device | SismoSmart
H1: A building seismic monitoring device for homes and small buildings
```

Turkish product:

```text
Title: Bina Deprem Sensörü ve Sismik İzleme Cihazı | SismoSmart
H1: Evler ve küçük binalar için sismik izleme cihazı
```

Descriptions must retain pre-launch status and avoid claiming current certified performance. Update English/Turkish technology and how-it-works titles/H1s similarly, but keep each natural and distinct. Do not change the four other locale copies.

- [ ] **Step 5: Add contextual guide blocks**

- Product: device definition, app-vs-fixed-sensor, placement.
- Technology: MEMS and natural frequency.
- How it works: post-earthquake measurement and placement.
- Hub: links to all guides and existing product resources.

Use varied localized headings and anchors; do not repeat exact-match text in every block.

- [ ] **Step 6: Run focused tests and commit**

```bash
node --import ./tests/alias-loader.mjs --test tests/guide-content.test.mjs tests/seo-governance.test.mjs tests/localized-page-modularization.test.mjs
npm run typecheck
git add src/lib/pages.ts src/app/[locale]/layout.tsx src/lib/page-content/en.ts src/lib/page-content/tr.ts src/components/localized-pages src/components/guides/guide-links.tsx tests
git commit -m "feat: connect guides to commercial pages"
```

---

### Task 8: Add safe read-only Search Console performance reporting

**Files:**
- Create: `scripts/ops/search-console-performance-lib.mjs`
- Modify: `scripts/ops/search-console.mjs`
- Create: `tests/search-console-performance.test.mjs`
- Modify: `tests/repository-contract.test.mjs`
- Modify: `docs/operations/analytics-observability.md` or the existing Search Console operations section

**Interfaces:**
- `normalizeSearchConsoleRows(rows): SafeRow[]`
- `isBrandQuery(query: string): boolean`
- `summarizePerformance({ current, previous, startDate, endDate }): SafePerformanceSummary`
- CLI: `npm run ops:search-console -- performance [startDate] [endDate] [--compare]`

Safe row shape:

```js
{
  key: string,
  clicks: number,
  impressions: number,
  ctrPercent: number,
  position: number,
}
```

Summary shape:

```js
{
  period: { startDate, endDate },
  totals: { clicks, impressions, ctrPercent, position },
  nonBrand: { queryCount, clicks, impressions },
  topQueries: [],
  topPages: [],
  countries: [],
  comparison: null | {
    previousPeriod: { startDate, endDate },
    clicksDelta,
    impressionsDelta,
    ctrPointDelta,
    positionDelta,
  },
}
```

- [ ] **Step 1: Write deterministic failing unit tests**

Cover:

- weighted totals are taken from API aggregate rows, not averaged from rounded child rows;
- CTR is converted from fraction to percentage and rounded to two decimals;
- position is rounded to two decimals;
- queries containing `sismosmart`, whitespace/case variants, or the canonical domain are brand queries;
- `sismo`, `seismic monitor`, and Turkish generic phrases are not automatically treated as brand terms;
- malformed/negative/non-finite metrics normalize to zero;
- previous-period deltas preserve direction, and lower average position produces a negative numeric delta without labeling it automatically good/bad;
- output contains no auth client, headers, tokens, raw response, or credentials.

- [ ] **Step 2: Verify red**

Run `tests/search-console-performance.test.mjs`; expected missing module.

- [ ] **Step 3: Implement the pure aggregation library**

Keep all Google API calls out of this file. Sort top queries/pages/countries by impressions descending, then clicks descending, then key ascending. Limit each list to 25.

- [ ] **Step 4: Add the read-only CLI command**

Extend usage with:

```text
performance [startDate] [endDate] [--compare]
```

Default period: the most recent complete 28-day window ending three days before today, matching Search Console data latency. Query dimensions separately for `query`, `page`, and `country`; also request a dimensionless aggregate for totals. When `--compare` is present, query the immediately preceding equal-length period.

Use only `webmasters.searchanalytics.query`; do not call `sites.add`, `sitemaps.submit`, URL Inspection, or indexing APIs from this command.

- [ ] **Step 5: Document safe operation**

Document that the command must run through the existing `prd_ops` Doppler boundary, prints only aggregates, and does not persist private reports.

- [ ] **Step 6: Run tests and commit**

```bash
node --import ./tests/alias-loader.mjs --test tests/search-console-performance.test.mjs tests/repository-contract.test.mjs
git add scripts/ops/search-console-performance-lib.mjs scripts/ops/search-console.mjs tests/search-console-performance.test.mjs tests/repository-contract.test.mjs docs/operations
git commit -m "feat: report search console performance safely"
```

---

### Task 9: Extend browser/accessibility coverage and run all local gates

**Files:**
- Modify: `scripts/test/browser-quality-lib.mjs`
- Modify: `tests/browser-quality.test.mjs`
- Modify: `tests/browser-quality-page.test.mjs` only if article semantics need a focused assertion
- Modify: `docs/superpowers/plans/2026-07-26-seo-topic-cluster.md` — check completed boxes and record evidence

- [x] **Step 1: Write the failing route-policy test**

Extend expected routes with:

```js
["en-guides", "/en/guides"],
["tr-guide-device", "/tr/guides/bina-deprem-sensoru-sismik-izleme"],
```

Keep mobile runs limited to the existing home/product subset unless layout evidence shows a need for one guide mobile run. If adding one, use `en-guides` only to bound CI duration.

- [x] **Step 2: Verify red and update browser route policy**

Add the two routes to `browserQualityRoutes`. The existing page scenario must verify status 200, visible main/H1, no serious/critical axe violations, no duplicate IDs, and no horizontal overflow.

- [x] **Step 3: Run focused tests**

```bash
node --import ./tests/alias-loader.mjs --test \
  tests/guide-content.test.mjs \
  tests/guide-routing.test.mjs \
  tests/search-console-performance.test.mjs \
  tests/agent-discovery.test.mjs \
  tests/agent-negotiation.test.mjs \
  tests/seo-governance.test.mjs \
  tests/browser-quality.test.mjs
```

Expected: PASS.

- [x] **Step 4: Run full static gates**

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm audit --audit-level=high
```

Expected:

- no lint/type errors;
- all tests pass;
- build emits `/en/guides`, `/tr/guides`, and twelve detail pages;
- no guide routes for the other four locales;
- zero blocking dependency vulnerabilities.

- [x] **Step 5: Run representative HTTP checks on the production build**

Start `next start` on loopback and verify:

```text
/en/guides                         200 text/html
/tr/guides/bina-deprem-sensoru-sismik-izleme 200 text/html
/en/guides/building-seismic-monitoring-device.md 200 text/markdown
/en/guides/building-seismic-monitoring-device + Accept:text/markdown 200 text/markdown
/es/guides                         404
/en/guides/missing                 404
```

Check canonical, exact partial `hreflang`, Markdown alternate, Article JSON-LD, BreadcrumbList, dates, reference links, and safety notice.

- [x] **Step 6: Run pinned browser quality**

Use the same analytics-enabled public IDs as CI, without printing them:

```bash
npm run browser:install
npm run test:browser
```

Expected: all prior scenarios plus the two guide scenarios pass; form and consent evidence remains unchanged.

- [x] **Step 7: Scan the public diff**

Reject additions matching private keys, bearer tokens, OAuth refresh tokens, private IPs, `/srv/`, `/home/`, Windows drive paths, private endpoints, raw Search Console responses, or credential-looking assignments.

- [x] **Step 8: Commit final validation changes**

```bash
git add scripts/test tests docs/superpowers/plans/2026-07-26-seo-topic-cluster.md
git commit -m "test: validate bilingual SEO guide cluster"
```

---

#### Task 9 evidence

- TDD route-policy RED: expected eight routes while the policy exposed six; exit 1.
- Route-policy GREEN: 11/11 tests; guide routes added only to desktop coverage and the mobile filter remained `en-home` plus `tr-product`.
- Focused guide/agent/SEO/browser contracts: 196/196 passing.
- Full repository suite: 467/467 passing; lint and typecheck clean.
- Analytics-enabled production build: 209/209 static pages, including two hubs and twelve guide details; no unsupported-locale guide routes.
- Dependency audit: 0 vulnerabilities.
- Loopback production checks: three representative HTML responses, two Markdown responses, and two negative 404 routes passed; canonical, EN/TR/x-default hreflang, Markdown alternate, Article/BreadcrumbList JSON-LD, dates, HTTPS references, safety notice, canonical `Link`, and `Accept` in `Vary` verified.
- Pinned Chrome Headless Shell `150.0.7871.24`: 14 scenarios passed, including eight desktop routes, the existing two mobile routes, navigation, consent, contact form, and pilot form; zero blocking axe findings, duplicate IDs, or horizontal overflow.
- Public branch diff scan: 7,364 added lines inspected; no credential, private-key, private-network, private-path, or secret-value finding.

### Task 10: Review, pull request, deploy, and production evidence

**Files:**
- No new implementation files expected.
- Update the plan evidence and PR description only.

- [ ] **Step 1: Self-review the complete diff**

Check:

- exactly fourteen new HTML routes;
- no guide routes in unsupported locales;
- no fake expert names or endorsements;
- all references are HTTPS and public;
- visible copy and JSON-LD agree;
- guide locale switching never points to a nonexistent translated guide;
- commercial titles are natural and not stuffed;
- Search Console command is read-only;
- canonical `main` worktree remains untouched.

- [ ] **Step 2: Push branch and open one PR**

PR title:

```text
feat: publish bilingual seismic monitoring guides
```

PR body must summarize public pages, technical SEO, content safety, Search Console reporting, local validation, and explicitly state that rankings are not guaranteed.

- [ ] **Step 3: Wait for all PR checks**

Require:

- commitlint;
- labeler;
- lint;
- full tests;
- build and standalone smoke;
- browser/accessibility;
- gitleaks;
- npm audit;
- CodeQL.

Resolve every bot/review comment before merge.

- [ ] **Step 4: Squash merge and sync canonical main**

Verify canonical `main` and `origin/main` have the same exact SHA and a clean working tree.

- [ ] **Step 5: Run immutable deployment validation**

Dispatch `Deploy Production` with the exact merged SHA and validation-only operation. Require success before production activation.

- [ ] **Step 6: Run transactional production deployment**

Deploy the exact validated SHA. Require production verification success and no rollback.

- [ ] **Step 7: Verify representative production routes**

Check HTML, same-path `.md`, `Accept: text/markdown`, canonical `Link`, `Vary: Accept`, partial `hreflang`, XML sitemap, human sitemap, Article JSON-LD, breadcrumbs, footer link, and unsupported-locale 404 behavior.

- [ ] **Step 8: Verify observability**

Require automatic Analytics Observability and Lighthouse runs for the deployed SHA to complete successfully.

- [ ] **Step 9: Resubmit the sitemap safely**

Run the existing Search Console sitemap submission command through the approved `prd_ops` boundary. Do not attempt unsupported automatic indexing requests. Record only safe success evidence.

- [ ] **Step 10: Record baseline and follow-up window**

Run the new read-only performance command for the pre-release 28-day baseline and record the safe aggregate summary in the PR or milestone comment. Schedule the first meaningful comparison for four weeks after deployment; do not draw ranking conclusions from immediate post-deploy data.

- [ ] **Step 11: Clean the worktree**

Remove the temporary worktree after merge and confirm canonical `main` remains clean and synchronized.
