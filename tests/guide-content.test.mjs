import assert from "node:assert/strict";
import test from "node:test";

import {
  guideLocales,
  guideTranslationKeys,
  isGuideLocale,
} from "../src/lib/guides/types.ts";

import {
  getGuideAlternates,
  getGuideBySlug,
  getGuideByTranslationKey,
  getGuideCanonicalPath,
  getGuideMarkdownPath,
  getGuides,
  getGuideLocaleSwitchPathMap,
} from "../src/lib/guides/catalog.ts";

import {
  getGuideNavigationLink,
} from "../src/lib/pages.ts";

import { locales } from "../src/lib/site.ts";

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

test("each locale exposes exactly six guides with unique slugs", () => {
  for (const locale of guideLocales) {
    const guides = getGuides(locale);
    assert.equal(guides.length, 6);
    assert.deepEqual(
      guides.map((guide) => guide.translationKey).sort(),
      [...guideTranslationKeys].sort(),
    );
    assert.equal(new Set(guides.map((guide) => guide.slug)).size, 6);
  }
});

test("translation key lookup, slug lookup, and URL helpers are consistent", () => {
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
});

test("every guide satisfies content completeness requirements", () => {
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
});

test("each translation key has equal section counts in English and Turkish", () => {
  for (const key of guideTranslationKeys) {
    const en = getGuideByTranslationKey("en", key);
    const tr = getGuideByTranslationKey("tr", key);
    assert.equal(
      en.sections.length,
      tr.sections.length,
      `Section count mismatch for key "${key}": en=${en.sections.length} tr=${tr.sections.length}`,
    );
  }
});

test("Turkish guides do not contain accidental foreign tokens", () => {
  const turkishCopy = getGuides("tr").map(JSON.stringify).join("\n");
  const prohibited = ["diferentes", "elektroslar", "serjisini"];
  for (const token of prohibited) {
    assert.doesNotMatch(
      turkishCopy,
      new RegExp(token, "i"),
      `Turkish copy contains prohibited token "${token}"`,
    );
  }
});

test("no guide contains prohibited claims", () => {
  const publicCopy = guideLocales
    .flatMap(getGuides)
    .map(JSON.stringify)
    .join("\n");
  const forbiddenPatterns = [
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
  ];
  for (const pattern of forbiddenPatterns)
    assert.doesNotMatch(publicCopy, pattern);
  assert.doesNotMatch(publicCopy, /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/u);
});

test("getGuideNavigationLink returns guides link for EN/TR and null for others", () => {
  const enLink = getGuideNavigationLink("en");
  assert.deepEqual(enLink, { label: "Guides", href: "/guides" });

  const trLink = getGuideNavigationLink("tr");
  assert.deepEqual(trLink, { label: "Rehberler", href: "/guides" });

  for (const locale of locales) {
    if (locale === "en" || locale === "tr") continue;
    assert.equal(
      getGuideNavigationLink(locale),
      null,
      `getGuideNavigationLink("${locale}") must return null`,
    );
  }
});

test("locale switch map covers all hub and detail paths with EN/TR exact mapped routes", () => {
  const switchMap = getGuideLocaleSwitchPathMap();

  assert.equal(switchMap["/en/guides"].tr, "/tr/guides");
  assert.equal(switchMap["/tr/guides"].en, "/en/guides");

  for (const key of guideTranslationKeys) {
    const en = getGuideByTranslationKey("en", key);
    const tr = getGuideByTranslationKey("tr", key);
    const enPath = `/en/guides/${en.slug}`;
    const trPath = `/tr/guides/${tr.slug}`;

    assert.ok(switchMap[enPath], `Switch map must contain ${enPath}`);
    assert.equal(switchMap[enPath].tr, trPath, `${enPath} must map to ${trPath} for TR`);
    assert.ok(switchMap[trPath], `Switch map must contain ${trPath}`);
    assert.equal(switchMap[trPath].en, enPath, `${trPath} must map to ${enPath} for EN`);
    assert.notEqual(en.slug, tr.slug, `${key} must have distinct EN/TR slugs in switch map`);
  }
});

function resolveLocaleSwitchHref({
  relativePath,
  current,
  next,
  basePath = "",
  search = "",
  hash = "",
}) {
  const localesForSwitch = ["en", "tr", "es", "id", "pt", "it"];
  const guideTargets = getGuideLocaleSwitchPathMap()[relativePath];
  let nextPath;

  if (guideTargets) {
    nextPath = next === current ? relativePath : guideTargets[next] || `/${next}`;
  } else {
    const segments = relativePath.split("/").filter(Boolean);
    if (!segments.length) segments.push(current);
    if (localesForSwitch.includes(segments[0])) segments[0] = next;
    else segments.unshift(next);
    nextPath = `/${segments.join("/")}`;
  }

  return `${basePath}${nextPath}${search}${hash}`;
}

test("guide locale switching uses exact mapped routes and unsupported targets fall back home", () => {
  const switchMap = getGuideLocaleSwitchPathMap();

  for (const [relativePath, mappedTargets] of Object.entries(switchMap)) {
    const current = relativePath.startsWith("/tr/") ? "tr" : "en";
    for (const next of locales) {
      const expectedPath = next === current
        ? relativePath
        : mappedTargets[next] || `/${next}`;
      assert.equal(
        resolveLocaleSwitchHref({
          relativePath,
          current,
          next,
          basePath: "/app",
          search: "?source=locale",
          hash: "#details",
        }),
        `/app${expectedPath}?source=locale#details`,
        `${relativePath} -> ${next} must use mapped guide route or locale home`,
      );
    }
  }
});

test("non-guide locale switching preserves generic path substitution", () => {
  assert.equal(
    resolveLocaleSwitchHref({
      relativePath: "/en/product",
      current: "en",
      next: "tr",
      basePath: "/app",
      search: "?campaign=test",
      hash: "#overview",
    }),
    "/app/tr/product?campaign=test#overview",
  );
  assert.equal(
    resolveLocaleSwitchHref({
      relativePath: "/technology",
      current: "en",
      next: "it",
    }),
    "/it/technology",
  );
});

test("every canonical guide detail path has at least one incoming crawlable HTML link", () => {
  const incomingLinks = {};

  for (const key of guideTranslationKeys) {
    const en = getGuideByTranslationKey("en", key);
    const tr = getGuideByTranslationKey("tr", key);
    incomingLinks[`/en/guides/${en.slug}`] = [];
    incomingLinks[`/tr/guides/${tr.slug}`] = [];
  }

  const enHubGuides = getGuides("en");
  const trHubGuides = getGuides("tr");
  for (const guide of enHubGuides) {
    const path = `/en/guides/${guide.slug}`;
    if (incomingLinks[path]) incomingLinks[path].push("/en/guides");
  }
  for (const guide of trHubGuides) {
    const path = `/tr/guides/${guide.slug}`;
    if (incomingLinks[path]) incomingLinks[path].push("/tr/guides");
  }

  const commercialSources = {
    product: [
      "building-seismic-monitoring-device",
      "earthquake-app-vs-fixed-sensor",
      "seismic-sensor-placement",
    ],
    technology: [
      "mems-accelerometers-seismic-monitoring",
      "building-natural-frequency-monitoring",
    ],
    "how-it-works": [
      "measuring-building-motion-after-earthquake",
      "seismic-sensor-placement",
    ],
  };
  for (const locale of guideLocales) {
    for (const [sourceSegment, keys] of Object.entries(commercialSources)) {
      for (const key of keys) {
        const guide = getGuideByTranslationKey(locale, key);
        const target = getGuideCanonicalPath(guide);
        incomingLinks[target].push(`/${locale}/${sourceSegment}`);
      }
    }
  }

  for (const key of guideTranslationKeys) {
    const enGuide = getGuideByTranslationKey("en", key);
    const trGuide = getGuideByTranslationKey("tr", key);
    const enPath = `/en/guides/${enGuide.slug}`;
    const trPath = `/tr/guides/${trGuide.slug}`;

    const enRelated = enGuide.relatedGuides || [];
    for (const relatedKey of enRelated) {
      const relatedEn = getGuideByTranslationKey("en", relatedKey);
      const relatedPath = `/en/guides/${relatedEn.slug}`;
      if (incomingLinks[relatedPath]) incomingLinks[relatedPath].push(enPath);
    }

    const trRelated = trGuide.relatedGuides || [];
    for (const relatedKey of trRelated) {
      const relatedTr = getGuideByTranslationKey("tr", relatedKey);
      const relatedPath = `/tr/guides/${relatedTr.slug}`;
      if (incomingLinks[relatedPath]) incomingLinks[relatedPath].push(trPath);
    }
  }

  for (const [path, sources] of Object.entries(incomingLinks)) {
    assert.ok(
      sources.length > 0,
      `Guide path ${path} must have at least one incoming crawlable HTML link`,
    );
  }
});

test("mutation-sensitive: TR guide links must not use EN slugs", () => {
  for (const key of guideTranslationKeys) {
    const enGuide = getGuideByTranslationKey("en", key);
    const trGuide = getGuideByTranslationKey("tr", key);
    assert.notEqual(
      trGuide.slug,
      enGuide.slug,
      `TR slug for "${key}" must not equal EN slug "${enGuide.slug}"`,
    );
    const trPath = getGuideCanonicalPath(trGuide);
    assert.doesNotMatch(
      trPath,
      new RegExp(enGuide.slug),
      `TR canonical path ${trPath} must not contain EN slug`,
    );
  }
});

test("mutation-sensitive: unsupported guide targets never keep a guides path", () => {
  for (const relativePath of Object.keys(getGuideLocaleSwitchPathMap())) {
    const current = relativePath.startsWith("/tr/") ? "tr" : "en";
    for (const unsupported of ["es", "id", "pt", "it"]) {
      const href = resolveLocaleSwitchHref({ relativePath, current, next: unsupported });
      assert.equal(href, `/${unsupported}`);
      assert.doesNotMatch(href, /\/guides(?:\/|$)/);
    }
  }
});
