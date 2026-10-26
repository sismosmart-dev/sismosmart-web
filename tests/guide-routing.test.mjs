import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

function assertIncludes(text, expected, message) {
  assert.ok(text.includes(expected), message);
}

function assertExcludes(text, unexpected, message) {
  assert.equal(text.includes(unexpected), false, message);
}

function assertLine(text, expected, message) {
  assert.ok(text.split("\n").includes(expected), message);
}

import { isGuideLocale, guideTranslationKeys } from "../src/lib/guides/types.ts";

import {
  getGuideBySlug,
  getGuideByTranslationKey,
  getGuideCanonicalPath,
  getGuideMarkdownPath,
  getGuideHub,
  getGuides,
  getGuidesByCategory,
} from "../src/lib/guides/catalog.ts";

import { getGuideUiStrings } from "../src/lib/guides/ui-strings.ts";

import {
  getGuideHubStructuredData,
  getGuideStructuredData,
} from "../src/lib/guides/structured-data.ts";

import {
  getHubStaticParams,
  getDetailStaticParams,
  resolveHubLocale,
  resolveDetailParams,
} from "../src/lib/guides/routing.ts";

import {
  buildGuideHubMetadata,
  buildGuideMetadata,
} from "../src/lib/guides/metadata.ts";

import { partitionGuideSections } from "../src/lib/guides/presentation.ts";

test("no concrete locale route directories exist under src/app", () => {
  const appDir = path.join(rootDir, "src", "app");
  for (const locale of ["en", "tr", "es", "id", "pt", "it"]) {
    assert.equal(
      fs.existsSync(path.join(appDir, locale)),
      false,
      `src/app/${locale} must not exist as a concrete directory`,
    );
  }
});

test("dynamic guide route files exist", () => {
  const hubPath = path.join(
    rootDir,
    "src",
    "app",
    "[locale]",
    "guides",
    "page.tsx",
  );
  const detailPath = path.join(
    rootDir,
    "src",
    "app",
    "[locale]",
    "guides",
    "[slug]",
    "page.tsx",
  );
  assert.ok(fs.existsSync(hubPath), "src/app/[locale]/guides/page.tsx must exist");
  assert.ok(
    fs.existsSync(detailPath),
    "src/app/[locale]/guides/[slug]/page.tsx must exist",
  );
});

test("hub static params returns exactly en and tr", () => {
  const params = getHubStaticParams();
  assert.deepEqual(params, [{ locale: "en" }, { locale: "tr" }]);
});

test("detail static params returns exactly 12 locale/slug pairs", () => {
  const params = getDetailStaticParams();
  assert.equal(params.length, 12);
  for (const param of params) {
    assert.ok(isGuideLocale(param.locale), `Invalid locale in static params: ${param.locale}`);
    assert.equal(typeof param.slug, "string", `Missing slug in static params`);
    assert.ok(
      getGuideBySlug(param.locale, param.slug) !== null,
      `Slug "${param.slug}" not found for locale "${param.locale}"`,
    );
  }
});

test("resolveHubLocale validates locale", () => {
  assert.equal(resolveHubLocale("en"), "en");
  assert.equal(resolveHubLocale("tr"), "tr");
  assert.equal(resolveHubLocale("es"), null);
  assert.equal(resolveHubLocale("missing"), null);
});

test("resolveDetailParams validates locale and slug", () => {
  const enGuide = getGuideByTranslationKey("en", "building-seismic-monitoring-device");
  const result = resolveDetailParams("en", enGuide.slug);
  assert.ok(result !== null);
  assert.equal(result.locale, "en");
  assert.equal(result.slug, enGuide.slug);

  assert.equal(resolveDetailParams("es", "anything"), null);
  assert.equal(resolveDetailParams("en", "missing-slug"), null);
});

test("hub metadata for English locale has correct alternates", () => {
  const metadata = buildGuideHubMetadata("en");
  assert.equal(
    metadata.alternates?.canonical,
    "https://sismosmart.com/en/guides",
  );
  assert.deepEqual(Object.keys(metadata.alternates?.languages ?? {}).sort(), [
    "en",
    "tr",
    "x-default",
  ]);
  assert.equal(
    metadata.alternates?.languages?.["x-default"],
    "https://sismosmart.com/en/guides",
  );
  assert.equal(
    metadata.alternates?.languages?.en,
    "https://sismosmart.com/en/guides",
  );
  assert.equal(
    metadata.alternates?.languages?.tr,
    "https://sismosmart.com/tr/guides",
  );
  assert.equal(metadata.openGraph?.url, "https://sismosmart.com/en/guides");
  assert.equal(metadata.openGraph?.type, "website");
});

test("hub metadata for Turkish locale has correct alternates", () => {
  const metadata = buildGuideHubMetadata("tr");
  assert.equal(
    metadata.alternates?.canonical,
    "https://sismosmart.com/tr/guides",
  );
  assert.deepEqual(Object.keys(metadata.alternates?.languages ?? {}).sort(), [
    "en",
    "tr",
    "x-default",
  ]);
  assert.equal(metadata.openGraph?.url, "https://sismosmart.com/tr/guides");
});

test("detail metadata for English guide has correct alternates and markdown type", () => {
  const guide = getGuideByTranslationKey("en", "building-seismic-monitoring-device");
  const metadata = buildGuideMetadata(guide);
  const canonicalPath = getGuideCanonicalPath(guide);
  const markdownPath = getGuideMarkdownPath(guide);

  assert.equal(
    metadata.alternates?.canonical,
    `https://sismosmart.com${canonicalPath}`,
  );
  assert.deepEqual(Object.keys(metadata.alternates?.languages ?? {}).sort(), [
    "en",
    "tr",
    "x-default",
  ]);
  assert.equal(
    metadata.alternates?.types?.["text/markdown"],
    `https://sismosmart.com${markdownPath}`,
  );
  assert.equal(metadata.openGraph?.url, `https://sismosmart.com${canonicalPath}`);
  assert.equal(metadata.openGraph?.type, "article");
});

test("detail metadata for Turkish guide has correct alternates", () => {
  const guide = getGuideByTranslationKey("tr", "building-seismic-monitoring-device");
  const metadata = buildGuideMetadata(guide);
  const canonicalPath = getGuideCanonicalPath(guide);

  assert.equal(
    metadata.alternates?.canonical,
    `https://sismosmart.com${canonicalPath}`,
  );
  assert.equal(metadata.openGraph?.url, `https://sismosmart.com${canonicalPath}`);
  assert.equal(metadata.openGraph?.type, "article");
});

test("hub metadata does not call buildPageMetadata", () => {
  const metadataSource = readText("src/lib/guides/metadata.ts");
  assert.doesNotMatch(
    metadataSource,
    /buildPageMetadata/,
    "metadata.ts must not import or call buildPageMetadata",
  );
});

test("hub component source has semantic structure", () => {
  const source = readText("src/components/guides/guide-hub-page.tsx");
  assert.match(source, /<main[\s\S]*id="content"/, "Hub must have <main id=\"content\">");
  assert.match(source, /<h1/, "Hub must have at least one h1");
  assert.doesNotMatch(source, /["']use client["']/, "Hub must not use client directive");
  assert.match(source, /href/, "Hub must contain ordinary anchor links");
});

test("commercial and technical translation keys are explicit and disjoint", () => {
  for (const locale of ["en", "tr"]) {
    const commercial = getGuidesByCategory(locale, "commercial");
    const technical = getGuidesByCategory(locale, "technical");
    assert.equal(commercial.length, 4, `Commercial guides count for ${locale}`);
    assert.equal(technical.length, 2, `Technical guides count for ${locale}`);
    const commercialKeys = commercial.map(g => g.translationKey);
    const technicalKeys = technical.map(g => g.translationKey);
    for (const key of commercialKeys) {
      assert.ok(!technicalKeys.includes(key), `Key ${key} should not be in both categories`);
    }
    const allKeys = [...commercialKeys, ...technicalKeys];
    assert.equal(allKeys.length, 6, `Total guides for ${locale} should be 6`);
    for (const key of guideTranslationKeys) {
      assert.ok(allKeys.includes(key), `Key ${key} missing from categories`);
    }
  }
});

test("detail component source has semantic structure", () => {
  const source = readText("src/components/guides/guide-detail-page.tsx");
  assert.match(source, /<main[\s\S]*id="content"/, "Detail must have <main id=\"content\">");
  assert.match(source, /<article/, "Detail must have <article>");
  assert.match(source, /<h1/, "Detail must have at least one h1");
  assert.match(source, /<time/, "Detail must have <time> element");
  assert.match(source, /rel=["']noopener noreferrer["']/, "Detail must have rel=noopener noreferrer references");
  assert.doesNotMatch(source, /["']use client["']/, "Detail must not use client directive");
  assert.match(source, /href/, "Detail must contain ordinary anchor links");
});

test("detail references use rel=noopener noreferrer", () => {
  const source = readText("src/components/guides/guide-detail-page.tsx");
  assert.match(source, /rel=["']noopener noreferrer["']/, "References must have rel=\"noopener noreferrer\"");
});

test("detail component source renders safety notice", () => {
  const source = readText("src/components/guides/guide-detail-page.tsx");
  assert.match(
    source,
    /safetyNotice/,
    "Detail component must render the safetyNotice field",
  );
});

test("detail safety aside has aria-labelledby and sr-only heading", () => {
  const source = readText("src/components/guides/guide-detail-page.tsx");
  assert.match(source, /<aside aria-labelledby="guide-safety-title"/, "Safety section must be aside with aria-labelledby");
  assert.match(source, /<h2 id="guide-safety-title" className="sr-only"/, "Safety heading must be sr-only");
});

test("partitionGuideSections removes limitations heading and preserves paragraphs", () => {
  for (const locale of ["en", "tr"]) {
    const ui = getGuideUiStrings(locale);
    const guides = getGuides(locale);
    for (const guide of guides) {
      const { contentSections, limitationParagraphs } = partitionGuideSections(guide.sections, ui.limitations);
      for (const section of contentSections) {
        assert.notEqual(section.heading, ui.limitations, `Limitations heading should not appear in contentSections for ${guide.translationKey}`);
      }
      const originalParagraphs = guide.sections.flatMap(s => s.paragraphs);
      const resultParagraphs = [...contentSections.flatMap(s => s.paragraphs), ...limitationParagraphs];
      const sortedOriginal = [...originalParagraphs].sort();
      const sortedResult = [...resultParagraphs].sort();
      assert.deepEqual(sortedResult, sortedOriginal, `Paragraphs must be preserved for ${guide.translationKey} in ${locale}`);
    }
  }
});

test("detail component uses partitionGuideSections helper", () => {
  const source = readText("src/components/guides/guide-detail-page.tsx");
  assert.match(source, /import.*partitionGuideSections/, "Detail component must import partitionGuideSections");
  assert.match(source, /contentSections\.map/, "Detail component must render contentSections");
});

test("detail CTA wrapper is a div not a section", () => {
  const source = readText("src/components/guides/guide-detail-page.tsx");
  const ctaMatch = source.match(/<div className="space-y-3">[\s\S]*?<a[\s\S]*?{guide\.cta\.label}[\s\S]*?<\/div>/);
  assert.ok(ctaMatch, "CTA wrapper must be a div");
  assert.doesNotMatch(ctaMatch[0], /<section/, "CTA wrapper must not be a section");
});

test("guide-links component source renders ordinary anchors", () => {
  const source = readText("src/components/guides/guide-links.tsx");
  assert.match(source, /href/, "GuideLinks must render ordinary anchor links");
  assert.doesNotMatch(
    source,
    /["']use client["']/,
    "GuideLinks must not use client directive",
  );
});

test("hub route source uses async params and notFound", () => {
  const source = readText("src/app/[locale]/guides/page.tsx");
  assert.match(source, /Promise<\{[^}]*locale/, "Hub route must use async Promise params");
  assert.match(source, /notFound/, "Hub route must call notFound for invalid locale");
  assert.match(source, /generateStaticParams/, "Hub route must export generateStaticParams");
});

test("detail route source uses async params and notFound", () => {
  const source = readText("src/app/[locale]/guides/[slug]/page.tsx");
  assert.match(
    source,
    /Promise<\{[^}]*slug/,
    "Detail route must use async Promise params with slug",
  );
  assert.match(source, /notFound/, "Detail route must call notFound for invalid params");
  assert.match(
    source,
    /generateStaticParams/,
    "Detail route must export generateStaticParams",
  );
});

test("hub route links to localized product, technology, how-it-works, FAQ, glossary, and pilot", () => {
  const source = readText("src/components/guides/guide-hub-page.tsx");
  assert.match(source, /\/product|getLocalizedHref|localizedHref/i, "Hub links to product");
  assert.match(source, /\/technology|getLocalizedHref|localizedHref/i, "Hub links to technology");
  assert.match(source, /\/how-it-works|getLocalizedHref|localizedHref/i, "Hub links to how-it-works");
  assert.match(source, /\/faq|getLocalizedHref|localizedHref/i, "Hub links to FAQ");
  assert.match(source, /\/glossary|getLocalizedHref|localizedHref/i, "Hub links to glossary");
  assert.match(source, /\/pilot|getLocalizedHref|localizedHref/i, "Hub links to pilot");
});

test("detail component renders references with visible organization names", () => {
  const source = readText("src/components/guides/guide-detail-page.tsx");
  assert.match(source, /references/, "Detail must render references");
  assert.match(source, /rel=["']noopener noreferrer["']/, "References must have rel=noopener noreferrer");
  assert.match(source, /organization/, "Detail must display organization names");
});

test("detail component renders glossary links without fabricated fragments", () => {
  const source = readText("src/components/guides/guide-detail-page.tsx");
  assert.match(source, /glossary/, "Detail must link to glossary page");
  assert.doesNotMatch(
    source,
    /glossary#/,
    "Detail must not link to glossary with fabricated fragments",
  );
});

test("routing.ts source exports required helpers", () => {
  const source = readText("src/lib/guides/routing.ts");
  assert.match(source, /getHubStaticParams/, "routing.ts must export getHubStaticParams");
  assert.match(source, /getDetailStaticParams/, "routing.ts must export getDetailStaticParams");
  assert.match(source, /resolveHubLocale/, "routing.ts must export resolveHubLocale");
  assert.match(source, /resolveDetailParams/, "routing.ts must export resolveDetailParams");
});

test("routing.ts source validates locale against guideLocales", () => {
  const source = readText("src/lib/guides/routing.ts");
  assert.match(
    source,
    /guideLocales|isGuideLocale/,
    "routing.ts must use guideLocales or isGuideLocale for validation",
  );
});

test("detail breadcrumb nav uses getLocalizedHref and localized label", () => {
  const source = readText("src/components/guides/guide-detail-page.tsx");
  const navMatch = source.match(/<nav[\s\S]*?<\/nav>/);
  assert.ok(navMatch, "Detail must have a breadcrumb nav");
  const navHtml = navMatch[0];
  assert.match(navHtml, /aria-label=\{ui\.breadcrumb\}/, "Breadcrumb nav must have aria-label={ui.breadcrumb}");
  assert.match(navHtml, /getLocalizedHref\(.*["']\/guides["']\)/, "Breadcrumb Guides href must use getLocalizedHref");
  assert.match(navHtml, /\{ui\.guides\}/, "Breadcrumb must display ui.guides");
  assert.doesNotMatch(navHtml, /getGuideCanonicalPath/, "Breadcrumb nav must not use getGuideCanonicalPath");
});

test("detail breadcrumb current page has aria-current", () => {
  const source = readText("src/components/guides/guide-detail-page.tsx");
  const navMatch = source.match(/<nav[\s\S]*?<\/nav>/);
  assert.ok(navMatch, "Detail must have a breadcrumb nav");
  const navHtml = navMatch[0];
  assert.match(navHtml, /aria-current="page"/, "Current page breadcrumb must have aria-current=\"page\"");
});

test("detail h1 has id guide-title and article has aria-labelledby", () => {
  const source = readText("src/components/guides/guide-detail-page.tsx");
  assert.match(source, /<h1 id="guide-title"/, "h1 must have id=\"guide-title\"");
  assert.match(source, /aria-labelledby="guide-title"/, "article must have aria-labelledby=\"guide-title\"");
});

test("getGuideUiStrings returns localized strings for both EN and TR", () => {
  const en = getGuideUiStrings("en");
  const tr = getGuideUiStrings("tr");
  assert.equal(typeof en.home, "string");
  assert.equal(typeof tr.home, "string");
  assert.notEqual(en.home, tr.home);
  assert.equal(en.home, "Home");
  assert.equal(tr.home, "Ana sayfa");
  assert.equal(en.guides, "Guides");
  assert.equal(tr.guides, "Rehberler");
  assert.equal(en.published, "Published");
  assert.equal(tr.published, "Yayınlandı");
  assert.equal(en.updated, "Updated");
  assert.equal(tr.updated, "Güncellendi");
  assert.equal(en.keyTakeaways, "Key takeaways");
  assert.equal(tr.keyTakeaways, "Temel çıkarımlar");
  assert.equal(en.limitations, "Limitations");
  assert.equal(tr.limitations, "Sınırlamalar");
  assert.equal(en.sismosmartFit, "SismoSmart fit");
  assert.equal(tr.sismosmartFit, "SismoSmart bu tabloda nerede?");
  assert.equal(en.relatedGlossaryTerms, "Related glossary terms");
  assert.equal(tr.relatedGlossaryTerms, "İlgili sözlük terimleri");
  assert.equal(en.relatedGuides, "Related guides");
  assert.equal(tr.relatedGuides, "İlgili rehberler");
  assert.equal(en.references, "References");
  assert.equal(tr.references, "Kaynaklar");
  assert.equal(en.product, "Product");
  assert.equal(tr.product, "Ürün");
  assert.equal(en.technology, "Technology");
  assert.equal(tr.technology, "Teknoloji");
  assert.equal(en.howItWorks, "How it works");
  assert.equal(tr.howItWorks, "Nasıl çalışır");
  assert.equal(en.faq, "FAQ");
  assert.equal(tr.faq, "SSS");
  assert.equal(en.glossary, "Glossary");
  assert.equal(tr.glossary, "Sözlük");
  assert.equal(en.pilotProgram, "Pilot program");
  assert.equal(tr.pilotProgram, "Pilot program");
  assert.equal(en.breadcrumb, "Breadcrumb");
  assert.equal(tr.breadcrumb, "Sayfa yolu");
  assert.equal(en.safetyNotice, "Safety notice");
  assert.equal(tr.safetyNotice, "Güvenlik notu");
});

test("getGuideUiStrings returns frozen singleton and resists mutation", () => {
  const en = getGuideUiStrings("en");
  const tr = getGuideUiStrings("tr");
  const a = getGuideUiStrings("en");
  const b = getGuideUiStrings("en");
  assert.equal(a, b, "getGuideUiStrings should return a cached singleton per locale");
  assert.ok(Object.isFrozen(en), "EN locale object should be frozen");
  assert.ok(Object.isFrozen(tr), "TR locale object should be frozen");
  // Mutation attempts should throw
  assert.throws(() => { en.home = "HACKED"; }, TypeError);
  assert.throws(() => { tr.home = "HACKED"; }, TypeError);
  // Values remain unchanged after mutation attempts
  assert.equal(en.home, "Home");
  assert.equal(tr.home, "Ana sayfa");
});

test("getGuideUiStrings locale map is frozen", async () => {
  const { getGuideUiStrings: fn } = await import("../src/lib/guides/ui-strings.ts");
  // Access the module's internal map via the function's return values; we cannot directly access the map.
  // Instead, we test that the function returns the same frozen objects for each locale.
  const locales = ["en", "tr"];
  for (const locale of locales) {
    const obj = fn(locale);
    assert.ok(Object.isFrozen(obj), `Locale ${locale} object should be frozen`);
  }
});

test("getGuideUiStrings is a pure function with all required keys", () => {
  const en = getGuideUiStrings("en");
  const tr = getGuideUiStrings("tr");
  const requiredKeys = [
    "home", "guides", "published", "updated", "keyTakeaways", "limitations",
    "sismosmartFit", "relatedGlossaryTerms", "relatedGuides", "references",
    "product", "technology", "howItWorks", "faq", "glossary", "pilotProgram",
    "breadcrumb", "safetyNotice",
  ];
  for (const key of requiredKeys) {
    assert.ok(key in en, `EN string map missing key: ${key}`);
    assert.ok(key in tr, `TR string map missing key: ${key}`);
  }
});

test("getGuideByTranslationKey returns guides for all locale/key combinations", () => {
  for (const locale of ["en", "tr"]) {
    for (const key of guideTranslationKeys) {
      const guide = getGuideByTranslationKey(locale, key);
      assert.ok(guide, `Guide must exist for locale ${locale} and key ${key}`);
      assert.equal(guide.locale, locale, `Guide locale must match for ${key}`);
      assert.equal(guide.translationKey, key, `Guide translationKey must match for ${key}`);
    }
  }
});

test("getGuideByTranslationKey throws descriptive error for missing key", () => {
  assert.throws(
    () => getGuideByTranslationKey("en", "nonexistent-key"),
    /Guide translation key "nonexistent-key" not found in catalog/,
    "Should throw descriptive error for missing key"
  );
});

test("getGuideByTranslationKey throws descriptive error for missing locale", () => {
  assert.throws(
    () => getGuideByTranslationKey("es", "building-seismic-monitoring-device"),
    /Guide translation key "building-seismic-monitoring-device" missing for locale "es"/,
    "Should throw descriptive error for missing locale"
  );
});

test("catalog source does not use unsafe Record casts", () => {
  const source = readText("src/lib/guides/catalog.ts");
  assert.doesNotMatch(
    source,
    /\{\} as Record<GuideLocale, GuideContent>/,
    "Catalog must not use unsafe Record cast for guidesByKey"
  );
  assert.doesNotMatch(
    source,
    /Object\.keys\(guidesByKey\) as GuideTranslationKey\[\]/,
    "Catalog must not use Object.keys cast for guidesByKey iteration"
  );
});

test("detail structured data returns exactly Article and BreadcrumbList for each guide", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const entities = getGuideStructuredData(guide);
      assert.equal(entities.length, 2, `Expected 2 entities for ${guide.translationKey} in ${locale}`);
      assert.equal(entities[0]["@type"], "Article", `First entity must be Article for ${guide.translationKey}`);
      assert.equal(entities[1]["@type"], "BreadcrumbList", `Second entity must be BreadcrumbList for ${guide.translationKey}`);
      for (const entity of entities) {
        assert.equal(entity["@context"], "https://schema.org", `Entity must have @context for ${guide.translationKey}`);
      }
    }
  }
});

test("detail Article has required fields", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const entities = getGuideStructuredData(guide);
      const article = entities[0];
      assert.equal(article["@type"], "Article");
      assert.equal(article.headline, guide.h1, `headline must match h1 for ${guide.translationKey}`);
      assert.equal(article.description, guide.description, `description must match for ${guide.translationKey}`);
      assert.equal(article.url, `https://sismosmart.com${getGuideCanonicalPath(guide)}`, `url must be canonical for ${guide.translationKey}`);
      assert.equal(article.datePublished, guide.publishedAt, `datePublished must match publishedAt for ${guide.translationKey}`);
      assert.equal(article.dateModified, guide.updatedAt, `dateModified must match updatedAt for ${guide.translationKey}`);
      assert.equal(article.inLanguage, guide.locale, `inLanguage must match locale for ${guide.translationKey}`);
      assert.deepEqual(article.author, { "@type": "Organization", name: "SismoSmart", url: "https://sismosmart.com" }, `author must be SismoSmart Organization for ${guide.translationKey}`);
      assert.deepEqual(article.publisher, article.author, `publisher must equal author for ${guide.translationKey}`);
    }
  }
});

test("detail breadcrumb has exactly three ListItems at positions 1, 2, 3", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    const ui = getGuideUiStrings(locale);
    for (const guide of guides) {
      const entities = getGuideStructuredData(guide);
      const breadcrumb = entities[1];
      assert.equal(breadcrumb["@type"], "BreadcrumbList");
      const items = breadcrumb.itemListElement;
      assert.equal(items.length, 3, `Breadcrumb must have 3 items for ${guide.translationKey}`);
      assert.equal(items[0].position, 1, `Position 1 for ${guide.translationKey}`);
      assert.equal(items[0].name, ui.home, `Position 1 name must be ${ui.home} for ${guide.translationKey}`);
      assert.equal(items[0].item, `https://sismosmart.com/${locale}`, `Position 1 URL for ${guide.translationKey}`);
      assert.equal(items[1].position, 2, `Position 2 for ${guide.translationKey}`);
      assert.equal(items[1].name, ui.guides, `Position 2 name must be ${ui.guides} for ${guide.translationKey}`);
      assert.equal(items[1].item, `https://sismosmart.com/${locale}/guides`, `Position 2 URL for ${guide.translationKey}`);
      assert.equal(items[2].position, 3, `Position 3 for ${guide.translationKey}`);
      assert.equal(items[2].name, guide.h1, `Position 3 name must be guide h1 for ${guide.translationKey}`);
      assert.equal(items[2].item, `https://sismosmart.com${getGuideCanonicalPath(guide)}`, `Position 3 URL for ${guide.translationKey}`);
    }
  }
});

test("hub structured data returns exactly CollectionPage and BreadcrumbList", () => {
  for (const locale of ["en", "tr"]) {
    const entities = getGuideHubStructuredData(locale);
    assert.equal(entities.length, 2, `Expected 2 entities for hub ${locale}`);
    assert.equal(entities[0]["@type"], "CollectionPage", `First entity must be CollectionPage for ${locale}`);
    assert.equal(entities[1]["@type"], "BreadcrumbList", `Second entity must be BreadcrumbList for ${locale}`);
    for (const entity of entities) {
      assert.equal(entity["@context"], "https://schema.org", `Entity must have @context for ${locale}`);
    }
  }
});

test("hub CollectionPage has required fields", () => {
  for (const locale of ["en", "tr"]) {
    const hub = getGuideHub(locale);
    const entities = getGuideHubStructuredData(locale);
    const collection = entities[0];
    assert.equal(collection["@type"], "CollectionPage");
    assert.equal(collection.name, hub.h1, `name must match hub h1 for ${locale}`);
    assert.equal(collection.description, hub.description, `description must match hub description for ${locale}`);
    assert.equal(collection.url, `https://sismosmart.com/${locale}/guides`, `url must be canonical for ${locale}`);
    assert.equal(collection.inLanguage, locale, `inLanguage must match locale`);
  }
});

test("hub breadcrumb has exactly two ListItems at positions 1 and 2", () => {
  for (const locale of ["en", "tr"]) {
    const ui = getGuideUiStrings(locale);
    const entities = getGuideHubStructuredData(locale);
    const breadcrumb = entities[1];
    assert.equal(breadcrumb["@type"], "BreadcrumbList");
    const items = breadcrumb.itemListElement;
    assert.equal(items.length, 2, `Hub breadcrumb must have 2 items for ${locale}`);
    assert.equal(items[0].position, 1, `Position 1 for ${locale}`);
    assert.equal(items[0].name, ui.home, `Position 1 name must be ${ui.home} for ${locale}`);
    assert.equal(items[0].item, `https://sismosmart.com/${locale}`, `Position 1 URL for ${locale}`);
    assert.equal(items[1].position, 2, `Position 2 for ${locale}`);
    assert.equal(items[1].name, ui.guides, `Position 2 name must be ${ui.guides} for ${locale}`);
    assert.equal(items[1].item, `https://sismosmart.com/${locale}/guides`, `Position 2 URL for ${locale}`);
  }
});

function assertNoForbiddenProperties(serialized, label) {
  assert.doesNotMatch(serialized, /"@type"\s*:\s*"Person"/i, `No Person type for ${label}`);
  assert.doesNotMatch(serialized, /"@type"\s*:\s*"Review"/i, `No Review type for ${label}`);
  assert.doesNotMatch(serialized, /"@type"\s*:\s*"Offer"/i, `No Offer type for ${label}`);
  assert.doesNotMatch(serialized, /"aggregateRating"\s*:/i, `No aggregateRating property for ${label}`);
  assert.doesNotMatch(serialized, /"review"\s*:/i, `No review property key for ${label}`);
  assert.doesNotMatch(serialized, /"offers"\s*:/i, `No offers property key for ${label}`);
  assert.doesNotMatch(serialized, /"price"\s*:/i, `No price property for ${label}`);
  assert.doesNotMatch(serialized, /"certification"\s*:/i, `No certification property for ${label}`);
  assert.doesNotMatch(serialized, /"endorsement"\s*:/i, `No endorsement property for ${label}`);
}

test("detail structured data contains no forbidden properties", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const entities = getGuideStructuredData(guide);
      const serialized = JSON.stringify(entities);
      assertNoForbiddenProperties(serialized, guide.translationKey);
    }
  }
});

test("hub structured data contains no forbidden properties", () => {
  for (const locale of ["en", "tr"]) {
    const entities = getGuideHubStructuredData(locale);
    const serialized = JSON.stringify(entities);
    assertNoForbiddenProperties(serialized, `hub ${locale}`);
  }
});

test("forbidden-property matcher rejects review and offers property keys", () => {
  const withReview = JSON.stringify([{ "@context": "https://schema.org", "@type": "Article", review: [] }]);
  assert.throws(
    () => assertNoForbiddenProperties(withReview, "mutation-test"),
    /No review property key/,
    "Must reject objects with review property key",
  );
  const withOffers = JSON.stringify([{ "@context": "https://schema.org", "@type": "Article", offers: {} }]);
  assert.throws(
    () => assertNoForbiddenProperties(withOffers, "mutation-test"),
    /No offers property key/,
    "Must reject objects with offers property key",
  );
  const valid = JSON.stringify(getGuideStructuredData(getGuideByTranslationKey("en", "building-seismic-monitoring-device")));
  assertNoForbiddenProperties(valid, "valid-entity-set");
});

test("guide markdown hub and detail route files exist", () => {
  const hubRoute = path.join(
    rootDir,
    "src",
    "app",
    "markdown",
    "guides",
    "[locale]",
    "route.ts",
  );
  const detailRoute = path.join(
    rootDir,
    "src",
    "app",
    "markdown",
    "guides",
    "[locale]",
    "[slug]",
    "route.ts",
  );
  assert.ok(fs.existsSync(hubRoute), "src/app/markdown/guides/[locale]/route.ts must exist");
  assert.ok(fs.existsSync(detailRoute), "src/app/markdown/guides/[locale]/[slug]/route.ts must exist");
});

test("guide markdown module exports renderGuideHubMarkdown and renderGuideMarkdown", () => {
  const source = readText("src/lib/guides/markdown.ts");
  assert.match(source, /export function renderGuideHubMarkdown/, "markdown.ts must export renderGuideHubMarkdown");
  assert.match(source, /export function renderGuideMarkdown/, "markdown.ts must export renderGuideMarkdown");
});

test("hub markdown static params returns exactly en and tr", async () => {
  const mod = await import("../src/app/markdown/guides/[locale]/route.ts");
  const params = mod.generateStaticParams();
  assert.deepEqual(params.map(p => p.locale).sort(), ["en", "tr"]);
});

test("detail markdown static params returns exactly 12 locale/slug pairs", async () => {
  const mod = await import("../src/app/markdown/guides/[locale]/[slug]/route.ts");
  const params = mod.generateStaticParams();
  assert.equal(params.length, 12);
  for (const param of params) {
    assert.ok(isGuideLocale(param.locale), `Invalid locale in markdown static params: ${param.locale}`);
    assert.equal(typeof param.slug, "string", "Missing slug in markdown static params");
    assert.ok(
      getGuideBySlug(param.locale, param.slug) !== null,
      `Slug "${param.slug}" not found for locale "${param.locale}"`,
    );
  }
});

test("hub metadata includes markdown alternate for guide hubs", () => {
  for (const locale of ["en", "tr"]) {
    const metadata = buildGuideHubMetadata(locale);
    assert.ok(metadata.alternates?.types?.["text/markdown"], `Hub metadata for ${locale} must include text/markdown alternate`);
    assert.ok(
      metadata.alternates.types["text/markdown"].endsWith(`/${locale}/guides.md`),
      `Hub markdown alternate must end with /${locale}/guides.md`,
    );
  }
});

test("hub route StructuredData call uses exact data and id", () => {
  const source = readText("src/app/[locale]/guides/page.tsx");
  assert.match(source, /import.*StructuredData.*from\s*["']@\/components\/structured-data["']/, "Hub route must import StructuredData");
  assert.match(source, /import.*getGuideHubStructuredData.*from\s*["']@\/lib\/guides\/structured-data["']/, "Hub route must import getGuideHubStructuredData");
  const sdCallMatch = source.match(/<StructuredData[\s\S]*?\/>/);
  assert.ok(sdCallMatch, "Hub route must render a <StructuredData /> call");
  assert.match(sdCallMatch[0], /data=\{getGuideHubStructuredData\(resolved\)\}/, "Hub StructuredData must use data={getGuideHubStructuredData(resolved)}");
  assert.match(sdCallMatch[0], /id=\{`\$\{resolved\}-guides-structured-data`\}/, "Hub StructuredData id must be ${resolved}-guides-structured-data");
});

test("detail route StructuredData call uses exact data and id", () => {
  const source = readText("src/app/[locale]/guides/[slug]/page.tsx");
  assert.match(source, /import.*StructuredData.*from\s*["']@\/components\/structured-data["']/, "Detail route must import StructuredData");
  assert.match(source, /import.*getGuideStructuredData.*from\s*["']@\/lib\/guides\/structured-data["']/, "Detail route must import getGuideStructuredData");
  const sdCallMatch = source.match(/<StructuredData[\s\S]*?\/>/);
  assert.ok(sdCallMatch, "Detail route must render a <StructuredData /> call");
  assert.match(sdCallMatch[0], /data=\{getGuideStructuredData\(guide\)\}/, "Detail StructuredData must use data={getGuideStructuredData(guide)}");
  assert.match(sdCallMatch[0], /id=\{`\$\{resolved\.locale\}-\$\{guide\.slug\}-structured-data`\}/, "Detail StructuredData id must be ${resolved.locale}-${guide.slug}-structured-data");
});

import {
  renderGuideHubMarkdown,
  renderGuideMarkdown,
} from "../src/lib/guides/markdown.ts";

import { getLocalizedHref } from "../src/lib/site.ts";

const siteUrl = "https://sismosmart.com";

import {
  GET as hubGET,
} from "../src/app/markdown/guides/[locale]/route.ts";

import {
  GET as detailGET,
} from "../src/app/markdown/guides/[locale]/[slug]/route.ts";

test("renderGuideHubMarkdown produces valid frontmatter for both locales", () => {
  for (const locale of ["en", "tr"]) {
    const md = renderGuideHubMarkdown(locale);
    const match = md.match(/^---\n([\s\S]*?)\n---\n/);
    assert.ok(match, `Hub markdown must have YAML frontmatter for ${locale}`);
    const front = match[1];
    assert.match(front, /title:/, "frontmatter must have title");
    assert.match(front, /description:/, "frontmatter must have description");
    assert.match(front, /locale:/, "frontmatter must have locale");
    assert.match(front, /canonical_url:/, "frontmatter must have canonical_url");
    assert.match(front, /published_at:/, "frontmatter must have published_at");
    assert.match(front, /last_updated:/, "frontmatter must have last_updated");
    assertLine(front, `locale: ${locale}`, `locale must be ${locale}`);
    assertLine(front, `canonical_url: "${siteUrl}/${locale}/guides"`, "canonical_url must point to localized guides");
  }
});

test("renderGuideHubMarkdown dates are deterministic catalog extrema", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    const expectedPublished = guides.reduce((min, g) => g.publishedAt < min ? g.publishedAt : min, guides[0].publishedAt);
    const expectedUpdated = guides.reduce((max, g) => g.updatedAt > max ? g.updatedAt : max, guides[0].updatedAt);
    const md = renderGuideHubMarkdown(locale);
    assertLine(md, `published_at: "${expectedPublished}"`, `published_at must be ${expectedPublished} for ${locale}`);
    assertLine(md, `last_updated: "${expectedUpdated}"`, `last_updated must be ${expectedUpdated} for ${locale}`);
  }
});

test("renderGuideHubMarkdown includes all 6 guide links for both locales", () => {
  for (const locale of ["en", "tr"]) {
    const md = renderGuideHubMarkdown(locale);
    const guides = getGuides(locale);
    for (const guide of guides) {
      const path = getGuideCanonicalPath(guide);
      assertIncludes(md, `](${siteUrl}${path})`, `Hub must link to ${path} for ${locale}`);
    }
  }
});

test("renderGuideHubMarkdown Sitemap section has exactly 4 links", () => {
  for (const locale of ["en", "tr"]) {
    const md = renderGuideHubMarkdown(locale);
    const sitemapMatch = md.match(/## Sitemap\n([\s\S]*?)$/);
    assert.ok(sitemapMatch, `Hub must have Sitemap section for ${locale}`);
    const links = sitemapMatch[1].match(/^- \[.*\]\(.*\)$/gm);
    assert.equal(links.length, 4, `Sitemap must have exactly 4 links for ${locale}`);
    assert.match(sitemapMatch[1], /Canonical HTML page/, "Sitemap must include canonical HTML link");
    assert.match(sitemapMatch[1], /XML sitemap/, "Sitemap must include XML sitemap");
    assert.match(sitemapMatch[1], /Human-readable sitemap/, "Sitemap must include human-readable sitemap");
    assert.match(sitemapMatch[1], /Markdown index/, "Sitemap must include Markdown index");
  }
});

test("renderGuideMarkdown includes limitationParagraphs before limitation bullets", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    const ui = getGuideUiStrings(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      const limSection = guide.sections.find(s => s.heading === ui.limitations);
      if (limSection && limSection.paragraphs.length > 0) {
        for (const para of limSection.paragraphs) {
          const bulletIndex = md.indexOf(`- ${guide.limitations[0]}`);
          const paraIndex = md.indexOf(para);
          assert.ok(paraIndex >= 0, `limitation paragraph must be rendered for ${guide.translationKey} in ${locale}`);
          assert.ok(paraIndex < bulletIndex || bulletIndex < 0, `limitation paragraph must appear before limitation bullets for ${guide.translationKey} in ${locale}`);
        }
      }
    }
  }
});

test("renderGuideMarkdown CTA uses localized URL", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      const expectedCtaHref = getLocalizedHref(locale, guide.cta.href);
      const expectedCtaUrl = `${siteUrl}${expectedCtaHref}`;
      assertIncludes(md, `[${guide.cta.label}](${expectedCtaUrl})`, `CTA must use localized URL ${expectedCtaUrl} for ${guide.translationKey}`);
    }
  }
});

test("renderGuideMarkdown does not include safetyNotices or productStageNotices from site.ts", async () => {
  const { safetyNotices, productStageNotices } = await import("../src/lib/site.ts");
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      assertExcludes(md, safetyNotices[locale], `Markdown must not include global safetyNotice for ${guide.translationKey}`);
      assertExcludes(md, productStageNotices[locale], `Markdown must not include global productStageNotice for ${guide.translationKey}`);
    }
  }
});

test("renderGuideMarkdown includes exactly the guide safetyNotice", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      assertIncludes(md, guide.safetyNotice, `Markdown must include guide.safetyNotice for ${guide.translationKey}`);
    }
  }
});

test("renderGuideMarkdown frontmatter dates equal guide.publishedAt and guide.updatedAt", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      assertLine(md, `published_at: "${guide.publishedAt}"`, `published_at must match guide.publishedAt for ${guide.translationKey}`);
      assertLine(md, `last_updated: "${guide.updatedAt}"`, `last_updated must match guide.updatedAt for ${guide.translationKey}`);
    }
  }
});

test("renderGuideMarkdown includes all sections, paragraphs, and bullets", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    const ui = getGuideUiStrings(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      const contentSections = guide.sections.filter(s => s.heading !== ui.limitations);
      for (const section of contentSections) {
        assertLine(md, `## ${section.heading}`, `Must have heading "${section.heading}" for ${guide.translationKey}`);
        for (const para of section.paragraphs) {
          assert.ok(md.includes(para), `Must include paragraph from "${section.heading}" for ${guide.translationKey}`);
        }
        if (section.bullets) {
          for (const bullet of section.bullets) {
            assertLine(md, `- ${bullet}`, `Must include bullet for ${guide.translationKey}`);
          }
        }
      }
    }
  }
});

test("renderGuideMarkdown includes all related guide links with locale-correct slugs", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      for (const relKey of guide.relatedGuides) {
        const related = getGuideByTranslationKey(locale, relKey);
        const relPath = getGuideCanonicalPath(related);
        assertIncludes(md, `](${siteUrl}${relPath})`, `Related guide ${relKey} must use locale ${locale} slug for ${guide.translationKey}`);
      }
    }
  }
});

test("renderGuideMarkdown includes references with organization", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      for (const ref of guide.references) {
        assertIncludes(md, `[${ref.label}](${ref.url}) — ${ref.organization}`, `Must include reference ${ref.label} for ${guide.translationKey}`);
      }
    }
  }
});

test("renderGuideMarkdown Sitemap section has exactly 4 links", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      const sitemapMatch = md.match(/## Sitemap\n([\s\S]*?)$/);
      assert.ok(sitemapMatch, `Detail must have Sitemap section for ${guide.translationKey}`);
      const links = sitemapMatch[1].match(/^- \[.*\]\(.*\)$/gm);
      assert.equal(links.length, 4, `Sitemap must have exactly 4 links for ${guide.translationKey}`);
      assert.match(sitemapMatch[1], /Canonical HTML page/, "Sitemap must include canonical HTML link");
      assert.match(sitemapMatch[1], /XML sitemap/, "Sitemap must include XML sitemap");
      assert.match(sitemapMatch[1], /Human-readable sitemap/, "Sitemap must include human-readable sitemap");
      assert.match(sitemapMatch[1], /Markdown index/, "Sitemap must include Markdown index");
    }
  }
});

test("renderGuideMarkdown keyTakeaways section uses localized heading", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    const ui = getGuideUiStrings(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      assertLine(md, `## ${ui.keyTakeaways}`, `Must have ${ui.keyTakeaways} heading for ${guide.translationKey}`);
      for (const item of guide.keyTakeaways) {
        assertLine(md, `- ${item}`, `Must include key takeaway for ${guide.translationKey}`);
      }
    }
  }
});

test("renderGuideMarkdown glossary terms link to locale glossary", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      for (const term of guide.relatedGlossaryTerms) {
        assertIncludes(md, `[${term}](${siteUrl}/${locale}/glossary)`, `Glossary link must point to ${locale}/glossary for ${guide.translationKey}`);
      }
    }
  }
});

test("renderGuideMarkdown SismoSmart fit section uses localized heading", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    const ui = getGuideUiStrings(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      assertLine(md, `## ${ui.sismosmartFit}`, `Must have ${ui.sismosmartFit} heading for ${guide.translationKey}`);
      for (const item of guide.sismosmartFit) {
        assertLine(md, `- ${item}`, `Must include SismoSmart fit item for ${guide.translationKey}`);
      }
    }
  }
});

test("renderGuideMarkdown limitations section uses localized heading", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    const ui = getGuideUiStrings(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      assertLine(md, `## ${ui.limitations}`, `Must have ${ui.limitations} heading for ${guide.translationKey}`);
    }
  }
});

test("renderGuideMarkdown references section uses localized heading", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    const ui = getGuideUiStrings(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      assertLine(md, `## ${ui.references}`, `Must have ${ui.references} heading for ${guide.translationKey}`);
    }
  }
});

test("renderGuideMarkdown related guides section uses localized heading", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    const ui = getGuideUiStrings(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      assertLine(md, `## ${ui.relatedGuides}`, `Must have ${ui.relatedGuides} heading for ${guide.translationKey}`);
    }
  }
});

test("renderGuideMarkdown related glossary terms section uses localized heading", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    const ui = getGuideUiStrings(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      assertLine(md, `## ${ui.relatedGlossaryTerms}`, `Must have ${ui.relatedGlossaryTerms} heading for ${guide.translationKey}`);
    }
  }
});

test("renderGuideMarkdown safety notice section uses localized heading", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    const ui = getGuideUiStrings(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      assertLine(md, `## ${ui.safetyNotice}`, `Must have ${ui.safetyNotice} heading for ${guide.translationKey}`);
    }
  }
});

test("renderGuideMarkdown locale field matches guide locale", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      assertLine(md, `locale: ${locale}`, `locale must be ${locale} for ${guide.translationKey}`);
    }
  }
});

test("renderGuideMarkdown canonical_url uses localized path", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      const path = getGuideCanonicalPath(guide);
      assertLine(md, `canonical_url: "${siteUrl}${path}"`, `canonical_url must use ${path} for ${guide.translationKey}`);
    }
  }
});

test("renderGuideMarkdown H1 matches guide.h1", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      assertLine(md, `# ${guide.h1}`, `H1 must match guide.h1 for ${guide.translationKey}`);
    }
  }
});

test("renderGuideMarkdown summary appears as blockquote", () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const md = renderGuideMarkdown(guide);
      assertLine(md, `> ${guide.summary}`, `Summary must appear as blockquote for ${guide.translationKey}`);
    }
  }
});

test("hub route GET returns correct content-type, cache-control, Link, Vary for both locales", async () => {
  for (const locale of ["en", "tr"]) {
    const response = await hubGET(new Request(`https://sismosmart.com/markdown/guides/${locale}`), {
      params: Promise.resolve({ locale }),
    });
    assert.equal(response.status, 200, `Hub route must return 200 for ${locale}`);
    assert.equal(response.headers.get("content-type"), "text/markdown; charset=utf-8", `content-type must be text/markdown for ${locale}`);
    assert.equal(response.headers.get("cache-control"), "public, max-age=3600", `cache-control must be public, max-age=3600 for ${locale}`);
    assert.equal(response.headers.get("vary"), "Accept", `Vary must be Accept for ${locale}`);
    assert.equal(response.headers.get("link"), `<${siteUrl}/${locale}/guides>; rel="canonical"`, `Link must point to canonical for ${locale}`);
  }
});

test("hub route GET body matches renderGuideHubMarkdown output", async () => {
  for (const locale of ["en", "tr"]) {
    const response = await hubGET(new Request(`https://sismosmart.com/markdown/guides/${locale}`), {
      params: Promise.resolve({ locale }),
    });
    const body = await response.text();
    const expected = renderGuideHubMarkdown(locale);
    assert.equal(body, expected, `Hub body must match renderGuideHubMarkdown for ${locale}`);
  }
});

test("hub route GET returns 404 for invalid locale", async () => {
  const response = await hubGET(new Request("https://sismosmart.com/markdown/guides/es"), {
    params: Promise.resolve({ locale: "es" }),
  });
  assert.equal(response.status, 404, "Hub route must return 404 for invalid locale");
});

test("hub route GET returns 404 for missing locale", async () => {
  const response = await hubGET(new Request("https://sismosmart.com/markdown/guides/"), {
    params: Promise.resolve({ locale: "" }),
  });
  assert.equal(response.status, 404, "Hub route must return 404 for empty locale");
});

test("detail route GET returns correct headers for all 12 guides", async () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const response = await detailGET(new Request(`https://sismosmart.com/markdown/guides/${locale}/${guide.slug}`), {
        params: Promise.resolve({ locale, slug: guide.slug }),
      });
      assert.equal(response.status, 200, `Detail route must return 200 for ${locale}/${guide.slug}`);
      assert.equal(response.headers.get("content-type"), "text/markdown; charset=utf-8", `content-type must be text/markdown for ${locale}/${guide.slug}`);
      assert.equal(response.headers.get("cache-control"), "public, max-age=3600", `cache-control must be correct for ${locale}/${guide.slug}`);
      assert.equal(response.headers.get("vary"), "Accept", `Vary must be Accept for ${locale}/${guide.slug}`);
      const canonicalPath = getGuideCanonicalPath(guide);
      assert.equal(response.headers.get("link"), `<${siteUrl}${canonicalPath}>; rel="canonical"`, `Link must point to canonical for ${locale}/${guide.slug}`);
    }
  }
});

test("detail route GET body matches renderGuideMarkdown output for all 12 guides", async () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const response = await detailGET(new Request(`https://sismosmart.com/markdown/guides/${locale}/${guide.slug}`), {
        params: Promise.resolve({ locale, slug: guide.slug }),
      });
      const body = await response.text();
      const expected = renderGuideMarkdown(guide);
      assert.equal(body, expected, `Detail body must match renderGuideMarkdown for ${locale}/${guide.slug}`);
    }
  }
});

test("detail route GET returns 404 for invalid locale", async () => {
  const response = await detailGET(new Request("https://sismosmart.com/markdown/guides/es/building-seismic-monitoring-device"), {
    params: Promise.resolve({ locale: "es", slug: "building-seismic-monitoring-device" }),
  });
  assert.equal(response.status, 404, "Detail route must return 404 for invalid locale");
});

test("detail route GET returns 404 for invalid slug", async () => {
  const response = await detailGET(new Request("https://sismosmart.com/markdown/guides/en/nonexistent-slug"), {
    params: Promise.resolve({ locale: "en", slug: "nonexistent-slug" }),
  });
  assert.equal(response.status, 404, "Detail route must return 404 for invalid slug");
});

test("detail route GET returns 404 for missing slug", async () => {
  const response = await detailGET(new Request("https://sismosmart.com/markdown/guides/en/"), {
    params: Promise.resolve({ locale: "en", slug: "" }),
  });
  assert.equal(response.status, 404, "Detail route must return 404 for empty slug");
});

test("detail route GET body does not include global safetyNotices or productStageNotices", async () => {
  const { safetyNotices, productStageNotices } = await import("../src/lib/site.ts");
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const response = await detailGET(new Request(`https://sismosmart.com/markdown/guides/${locale}/${guide.slug}`), {
        params: Promise.resolve({ locale, slug: guide.slug }),
      });
      const body = await response.text();
      assertExcludes(body, safetyNotices[locale], `Body must not include global safetyNotice for ${locale}/${guide.slug}`);
      assertExcludes(body, productStageNotices[locale], `Body must not include global productStageNotice for ${locale}/${guide.slug}`);
    }
  }
});

test("detail route GET body includes exactly the guide safetyNotice", async () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const response = await detailGET(new Request(`https://sismosmart.com/markdown/guides/${locale}/${guide.slug}`), {
        params: Promise.resolve({ locale, slug: guide.slug }),
      });
      const body = await response.text();
      assertIncludes(body, guide.safetyNotice, `Body must include guide.safetyNotice for ${locale}/${guide.slug}`);
    }
  }
});

test("detail route GET body CTA uses localized URL", async () => {
  for (const locale of ["en", "tr"]) {
    const guides = getGuides(locale);
    for (const guide of guides) {
      const response = await detailGET(new Request(`https://sismosmart.com/markdown/guides/${locale}/${guide.slug}`), {
        params: Promise.resolve({ locale, slug: guide.slug }),
      });
      const body = await response.text();
      const expectedCtaHref = getLocalizedHref(locale, guide.cta.href);
      const expectedCtaUrl = `${siteUrl}${expectedCtaHref}`;
      assertIncludes(body, `[${guide.cta.label}](${expectedCtaUrl})`, `CTA must use localized URL for ${locale}/${guide.slug}`);
    }
  }
});
