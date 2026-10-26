import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import sitemap from "../src/app/sitemap.ts";
import robots from "../src/app/robots.ts";
import { webManifest } from "../src/app/manifest-data.ts";
import { buildPageMetadata } from "../src/lib/metadata.ts";
import {
  getFooterNavigation,
  getPages,
  getPrimaryNavigation,
  routeSegments,
  staticPageKeys,
} from "../src/lib/pages.ts";
import {
  locales,
  productStageNotices,
  safetyNotices,
  siteConfig,
} from "../src/lib/site.ts";

import {
  getGuides,
  getGuideCanonicalPath,
  getGuideAlternates,
  getGuideByTranslationKey,
} from "../src/lib/guides/catalog.ts";
import { guideLocales, guideTranslationKeys } from "../src/lib/guides/types.ts";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

async function read(relativePath) {
  return fs.readFile(path.join(root, relativePath), "utf8");
}

async function exists(relativePath) {
  try {
    await fs.access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

test("root permanently redirects to the intentional default locale", async () => {
  const source = await read("src/app/page.tsx");
  const nextConfig = await read("next.config.ts");
  assert.match(source, /permanentRedirect/);
  assert.match(source, /defaultLocale/);
  assert.match(nextConfig, /destination:\s*basePath \? basePath\.concat\("\/en"\) : "\/en"[^}]*?permanent:\s*true/);
  assert.doesNotMatch(source, /Continue to SismoSmart/);
});

test("canonical metadata and hreflang stay aligned for every locale and route", () => {
  const routePaths = ["/", ...staticPageKeys.map((key) => routeSegments[key])];
  for (const locale of locales) {
    for (const routePath of routePaths) {
      const metadata = buildPageMetadata(locale, routePath, "Title", "Description");
      const suffix = routePath === "/" ? "" : routePath;
      const canonical = `${siteConfig.url}/${locale}${suffix}`;
      assert.equal(metadata.alternates?.canonical, canonical);
      assert.equal(
        metadata.alternates?.types?.["text/markdown"],
        `${canonical}.md`,
      );
      assert.equal(metadata.openGraph?.url, canonical);
      assert.equal(metadata.alternates?.languages?.["x-default"], `${siteConfig.url}/en${suffix}`);
      for (const alternateLocale of locales) {
        assert.equal(
          metadata.alternates?.languages?.[alternateLocale],
          `${siteConfig.url}/${alternateLocale}${suffix}`,
        );
      }
    }
  }
});

test("sitemap contains each canonical indexable locale route exactly once", () => {
  const entries = sitemap();
  const expectedStaticCount = locales.length * (1 + staticPageKeys.length);
  const guideDetailCount = guideLocales.length * guideTranslationKeys.length;
  const hubCount = guideLocales.length;
  const expectedCount = expectedStaticCount + hubCount + guideDetailCount;
  assert.equal(entries.length, expectedCount);
  const urls = entries.map((entry) => entry.url);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(urls.every((url) => url.startsWith(`${siteConfig.url}/`)));
  assert.ok(urls.every((url) => !url.includes("/api/")));
  assert.ok(!urls.includes(siteConfig.url));
  for (const entry of entries) {
    const isGuide = entry.url.includes("/guides");
    assert.equal(entry.alternates?.languages?.["x-default"]?.startsWith(`${siteConfig.url}/en`), true);
    if (isGuide) {
      assert.deepEqual(
        Object.keys(entry.alternates?.languages || {}).sort(),
        ["en", "tr", "x-default"].sort(),
      );
    } else {
      assert.deepEqual(
        Object.keys(entry.alternates?.languages || {}).sort(),
        [...locales, "x-default"].sort(),
      );
    }
  }
});

test("sitemap contains exactly 98 entries: 84 static plus 14 guide entries", () => {
  const entries = sitemap();
  const expectedStaticCount = locales.length * (1 + staticPageKeys.length);
  const guideDetailCount = guideLocales.length * guideTranslationKeys.length;
  const hubCount = guideLocales.length;
  const expectedTotal = expectedStaticCount + hubCount + guideDetailCount;
  assert.equal(entries.length, expectedTotal, `Expected ${expectedTotal} sitemap entries (84 static + ${hubCount} hubs + ${guideDetailCount} details)`);
});

test("sitemap guide entries advertise exactly en, tr, x-default alternates", () => {
  const entries = sitemap();
  const guideUrls = entries
    .filter((e) => e.url.includes("/guides"))
    .map((e) => e.url);
  assert.equal(guideUrls.length, 14, "Expected 14 guide URLs in sitemap");

  for (const entry of entries.filter((e) => e.url.includes("/guides"))) {
    const alternates = entry.alternates?.languages || {};
    const keys = Object.keys(alternates).sort();
    assert.deepEqual(keys, ["en", "tr", "x-default"], `Guide ${entry.url} must have exactly en, tr, x-default alternates`);
    assert.equal(alternates["x-default"].startsWith(`${siteConfig.url}/en/guides`), true);
  }
});

test("sitemap hub entries use monthly frequency, priority 0.8, and max updatedAt of locale guides", () => {
  const entries = sitemap();
  for (const locale of guideLocales) {
    const hub = entries.find((e) => e.url === `${siteConfig.url}/${locale}/guides`);
    assert.ok(hub, `Hub entry for ${locale}/guides must exist`);
    assert.equal(hub.changeFrequency, "monthly");
    assert.equal(hub.priority, 0.8);
    const guides = getGuides(locale);
    const maxUpdatedAt = guides.reduce((max, g) => (g.updatedAt > max ? g.updatedAt : max), guides[0].updatedAt);
    assert.equal(hub.lastModified.toISOString().startsWith(maxUpdatedAt), true, `Hub lastModified must equal max updatedAt ${maxUpdatedAt}`);
  }
});

test("sitemap detail guide entries use monthly frequency, priority 0.7, and exact updatedAt", () => {
  const entries = sitemap();
  for (const locale of guideLocales) {
    for (const key of guideTranslationKeys) {
      const guides = getGuides(locale);
      const guide = guides.find((g) => g.translationKey === key);
      assert.ok(guide, `Guide ${key} for ${locale} must exist`);
      const canonicalPath = getGuideCanonicalPath(guide);
      const entry = entries.find((e) => e.url === `${siteConfig.url}${canonicalPath}`);
      assert.ok(entry, `Detail entry for ${canonicalPath} must exist`);
      assert.equal(entry.changeFrequency, "monthly");
      assert.equal(entry.priority, 0.7);
      assert.equal(entry.lastModified.toISOString().startsWith(guide.updatedAt), true, `Detail lastModified must equal updatedAt ${guide.updatedAt}`);
    }
  }
});

test("sitemap detail guide alternates exactly match getGuideAlternates with distinct EN/TR slugs", () => {
  const entries = sitemap();
  for (const key of guideTranslationKeys) {
    const alternates = getGuideAlternates(key);
    const enGuide = getGuideByTranslationKey("en", key);
    const trGuide = getGuideByTranslationKey("tr", key);
    assert.notEqual(enGuide.slug, trGuide.slug, `${key} must have distinct EN/TR slugs`);
    for (const locale of guideLocales) {
      const guide = getGuideByTranslationKey(locale, key);
      const canonicalPath = getGuideCanonicalPath(guide);
      const entry = entries.find((e) => e.url === `${siteConfig.url}${canonicalPath}`);
      assert.ok(entry, `Detail entry for ${canonicalPath} must exist`);
      assert.deepEqual(
        entry.alternates.languages,
        alternates,
        `${canonicalPath} alternates must equal getGuideAlternates("${key}")`,
      );
    }
  }
});

test("sitemap detail guide alternates fail when EN slug is used for TR entry", () => {
  const entries = sitemap();
  for (const key of guideTranslationKeys) {
    const enGuide = getGuideByTranslationKey("en", key);
    const trGuide = getGuideByTranslationKey("tr", key);
    const trCanonicalPath = getGuideCanonicalPath(trGuide);
    const trEntry = entries.find((e) => e.url === `${siteConfig.url}${trCanonicalPath}`);
    assert.ok(trEntry, `TR detail entry for ${trCanonicalPath} must exist`);
    const wrongAlternate = `https://sismosmart.com/tr/guides/${enGuide.slug}`;
    assert.notEqual(
      trEntry.alternates.languages.tr,
      wrongAlternate,
      `TR alternate for ${trCanonicalPath} must NOT use EN slug "${enGuide.slug}"`,
    );
  }
});

test("sitemap does not contain unsupported locale guide URLs", () => {
  const entries = sitemap();
  const unsupportedLocales = ["es", "id", "pt", "it"];
  for (const entry of entries) {
    for (const locale of unsupportedLocales) {
      assert.doesNotMatch(entry.url, new RegExp(`/${locale}/guides`), `Must not contain unsupported /${locale}/guides URL`);
    }
  }
});

test("robots and manifest point at canonical public resources", () => {
  const policy = robots();
  assert.equal(policy.host, siteConfig.url);
  assert.equal(policy.sitemap, `${siteConfig.url}/sitemap.xml`);
  assert.ok(policy.rules.disallow.includes("/api/"));
  assert.equal(webManifest.start_url, "/en");
  assert.equal(webManifest.scope, "/");
});

test("private repository metadata records homepage and no-license decision", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  assert.equal(packageJson.private, true);
  assert.equal(packageJson.homepage, siteConfig.url);
  assert.equal(packageJson.license, "UNLICENSED");
  assert.equal(packageJson.repository?.url, "https://github.com/SismoSmart/sismosmart-web.git");
  const license = await read("LICENSE");
  assert.match(license, /All rights reserved/i);
  assert.match(license, /no license is granted/i);
  assert.doesNotMatch(license, /confidential/i);
});

test("all locales expose equivalent safety and pre-launch notices", () => {
  assert.deepEqual(Object.keys(safetyNotices).sort(), [...locales].sort());
  assert.deepEqual(Object.keys(productStageNotices).sort(), [...locales].sort());
  for (const locale of locales) {
    assert.ok(safetyNotices[locale].length >= 70);
    assert.ok(productStageNotices[locale].length >= 70);
  }
});

test("public technical copy avoids unsupported absolute detection and residency claims", async () => {
  const pageSources = await Promise.all([
    read("src/lib/pages.ts"),
    ...locales.flatMap((locale) => [
      read(`src/lib/content/${locale}.ts`),
      read(`src/lib/page-content/${locale}.ts`),
      read(`src/lib/page-content/extra-pages/${locale}.ts`),
    ]),
  ]);
  const pages = pageSources.join("\n");
  assert.doesNotMatch(pages, /won't cross the threshold|Kapı çarpması ya da ayak sesi eşiği geçmez/);
  assert.doesNotMatch(pages, /AWS(?:'s|\'nin| de)? (?:Turkey|Türkiye|Turquía|Turki|Turchia|Turquia)/i);
  assert.doesNotMatch(
    pages,
    /lab-grade|laboratuvar kalites(?:inde|indeki)|quality of laboratory|qualità di laboratorio/i,
  );
  assert.match(pages, /false positives and missed events remain possible/);
  assert.match(pages, /Pilot data residency is not final/);
});

test("public copy does not publish expired 2026 launch promises as current commitments", async () => {
  const pageSources = await Promise.all(
    locales.flatMap((locale) => [
      read(`src/lib/content/${locale}.ts`),
      read(`src/lib/page-content/${locale}.ts`),
      read(`src/lib/page-content/extra-pages/${locale}.ts`),
    ]),
  );
  const pages = pageSources.join("\n");

  for (const stale of [
    /Pilots start in summer 2026/i,
    /Pilotlar 2026 yazında başlıyor/i,
    /Los pilotos empiezan en verano de 2026/i,
    /Os pilotos começam no meio de 2026/i,
    /I pilota partono nell'estate 2026/i,
    /Q3 2026: five to ten pilot installations/i,
    /2026 Q3: 5-10 pilot kurulum/i,
    /Q1 2027: CE certification and first production run of 1,000 units/i,
    /2027 Q1: CE sertifikası ve ilk 1\.000 cihazın üretimi/i,
  ]) {
    assert.doesNotMatch(pages, stale);
  }
});

test("technical claims have an evidence and translation governance register", async () => {
  const claims = await read("docs/governance/technical-claims-register.md");
  for (const phrase of [
    "Claim class",
    "Evidence status",
    "Approved wording",
    "Translation rule",
    "not an emergency service",
    "pilot validation",
    "certification",
    "data residency",
  ]) {
    assert.match(claims, new RegExp(phrase, "i"));
  }
});

test("browser runbook documents deterministic coverage and privacy boundaries", async () => {
  const runbook = await read("docs/operations/browser-quality.md");
  for (const phrase of [
    "Chrome Headless Shell `150.0.7871.24`",
    "loopback mock receiver",
    "serious",
    "critical",
    "duplicate DOM ID",
    "horizontal overflow",
    "synthetic",
    "three days",
    "BROWSER_QUALITY_SAFE",
  ]) {
    assert.match(runbook, new RegExp(phrase, "i"));
  }
});

test("form runtime documents proxy trust, retry, and rate-limit boundaries", async () => {
  const runtime = await read("docs/operations/form-runtime.md");
  for (const phrase of [
    "CF-Connecting-IP",
    "Passenger",
    "per-process",
    "best-effort",
    "not a hard global limit",
    "non-idempotent",
    "no automatic retry",
    "shared store",
  ]) {
    assert.match(runtime, new RegExp(phrase, "i"));
  }
});

test("maintenance ownership and configuration boundaries are documented", async () => {
  const maintenance = await read("docs/operations/maintenance-ownership.md");
  for (const phrase of [
    "Deployments",
    "DNS",
    "Cloudflare",
    "cPanel",
    "Analytics",
    "Incident response",
    "second administrator",
    "quarterly",
    "local-only",
    "CI-only",
    "runtime-only",
    "secret rotation",
  ]) {
    assert.match(maintenance, new RegExp(phrase, "i"));
  }
  const gitignore = await read(".gitignore");
  assert.match(gitignore, /^\/\.serena\/$/m);
  assert.match(gitignore, /^\/\.cache\/$/m);
});

test("private historical reports are excluded under a public retention policy", async () => {
  assert.equal(await exists("AGENT_RUN_LOG.md"), false);
  assert.equal(await exists("ANALYSIS_REPORT.md"), false);
  assert.equal(await exists("docs/archive/2026-07-initial-audit/AGENT_RUN_LOG.md"), false);
  assert.equal(await exists("docs/archive/2026-07-initial-audit/ANALYSIS_REPORT.md"), false);
  const policy = await read("docs/archive/README.md");
  assert.match(policy, /retention/i);
  assert.match(policy, /historical/i);
  assert.match(policy, /not imported into the public repository/i);
});

test("exact EN product meta title and H1 match contracts", () => {
  const pages = getPages("en");
  assert.equal(pages.product.meta.title, "Building Seismic Monitoring Device | SismoSmart");
  assert.equal(pages.product.title, "A building seismic monitoring device for homes and small buildings");
  assert.match(pages.product.meta.description, /pre-launch|pilot/i);
  assert.doesNotMatch(pages.product.meta.description, /certified|proven performance/i);
});

test("exact TR product meta title and H1 match contracts", () => {
  const pages = getPages("tr");
  assert.equal(pages.product.meta.title, "Bina Deprem Sensörü ve Sismik İzleme Cihazı | SismoSmart");
  assert.equal(pages.product.title, "Evler ve küçük binalar için sismik izleme cihazı");
  assert.match(pages.product.meta.description, /lansman öncesi/i);
  assert.doesNotMatch(pages.product.meta.description, /sertifikalı|kanıtlanmış performans/i);
});

test("EN technology metadata and H1 use natural building-motion language without repetition", () => {
  const pages = getPages("en");
  const title = pages.technology.meta.title;
  const h1 = pages.technology.title;
  const seismicTitleMatches = (title.match(/seismic monitoring/gi) || []).length;
  const seismicH1Matches = (h1.match(/seismic monitoring/gi) || []).length;
  assert.match(title, /building motion|MEMS|seismic monitoring/i);
  assert.match(h1, /building motion|MEMS|seismic monitoring/i);
  assert.ok(seismicTitleMatches <= 1);
  assert.ok(seismicH1Matches <= 1);
  assert.notEqual(title, h1);
  assert.match(pages.technology.meta.description, /pre-launch|pilot/i);
  assert.doesNotMatch(pages.technology.meta.description, /certified field performance|proven performance/i);
});

test("TR technology metadata and H1 use natural building-motion language without repetition", () => {
  const pages = getPages("tr");
  const title = pages.technology.meta.title;
  const h1 = pages.technology.title;
  const sismikTitleMatches = (title.match(/sismik izleme/gi) || []).length;
  const sismikH1Matches = (h1.match(/sismik izleme/gi) || []).length;
  assert.match(title, /bina hareket|MEMS|sismik izleme/i);
  assert.match(h1, /bina hareket|MEMS|sismik izleme/i);
  assert.ok(sismikTitleMatches <= 1);
  assert.ok(sismikH1Matches <= 1);
  assert.notEqual(title, h1);
  assert.match(pages.technology.meta.description, /lansman|pilot doğrulama/i);
  assert.doesNotMatch(pages.technology.meta.description, /sertifikalı saha performansı|kanıtlanmış performans/i);
});

test("EN how-it-works metadata and H1 describe building-motion measurement and reporting distinctly", () => {
  const pages = getPages("en");
  const howTitle = pages.howItWorks.meta.title;
  const howH1 = pages.howItWorks.title;
  const combined = `${howTitle} ${howH1}`;
  assert.match(combined, /building motion/i);
  assert.match(combined, /measur|report/i);
  assert.notEqual(howTitle, pages.product.meta.title);
  assert.notEqual(howTitle, pages.technology.meta.title);
  assert.notEqual(howH1, pages.product.title);
  assert.notEqual(howH1, pages.technology.title);
  assert.match(pages.howItWorks.meta.description, /pre-launch|pilot/i);
});

test("TR how-it-works metadata and H1 describe building-motion measurement and reporting distinctly", () => {
  const pages = getPages("tr");
  const howTitle = pages.howItWorks.meta.title;
  const howH1 = pages.howItWorks.title;
  const combined = `${howTitle} ${howH1}`;
  assert.match(combined, /bina hareket/i);
  assert.match(combined, /ölç|rapor/i);
  assert.notEqual(howTitle, pages.product.meta.title);
  assert.notEqual(howTitle, pages.technology.meta.title);
  assert.notEqual(howH1, pages.product.title);
  assert.notEqual(howH1, pages.technology.title);
  assert.match(pages.howItWorks.meta.description, /lansman|pilot/i);
});

test("ES, ID, IT, and PT commercial titles stay stable while claims metadata is validation-aware", () => {
  const expected = {
    es: {
      product: ["El dispositivo SismoSmart", "El dispositivo"],
      technology: ["Tecnología: cómo mide SismoSmart", "Qué hay dentro del dispositivo y cómo te llega el dato"],
      howItWorks: ["Cómo funciona SismoSmart", "Dispositivo, nube, app: juntos."],
    },
    id: {
      product: ["Perangkat SismoSmart", "Perangkat"],
      technology: ["Teknologi: bagaimana SismoSmart mengukur", "Apa yang ada di dalam perangkat, dan bagaimana datanya sampai ke Anda"],
      howItWorks: ["Cara kerja SismoSmart", "Perangkat, cloud, app: bersama."],
    },
    it: {
      product: ["Il dispositivo SismoSmart", "Il dispositivo"],
      technology: ["Tecnologia: come misura SismoSmart", "Cosa c'è dentro il dispositivo e come il dato arriva fino a te"],
      howItWorks: ["Come funziona SismoSmart", "Dispositivo, cloud, app: insieme."],
    },
    pt: {
      product: ["O dispositivo SismoSmart", "O dispositivo"],
      technology: ["Tecnologia: como o SismoSmart mede", "O que tem dentro do dispositivo e como o dado chega até você"],
      howItWorks: ["Como o SismoSmart funciona", "Dispositivo, cloud, app: juntos."],
    },
  };

  const validationTerms = /pre|pilot|valid|target|objetiv|meta|projeto|progett|pra-peluncuran|design/i;

  for (const [locale, snapshot] of Object.entries(expected)) {
    const pages = getPages(locale);
    for (const [pageKey, values] of Object.entries(snapshot)) {
      const [metaTitle, h1] = values;
      assert.equal(pages[pageKey].meta.title, metaTitle, locale + "/" + pageKey + " meta title changed");
      assert.equal(pages[pageKey].title, h1, locale + "/" + pageKey + " H1 changed");
      assert.match(
        pages[pageKey].meta.description,
        validationTerms,
        locale + "/" + pageKey + " meta description must expose pre-launch/validation modality",
      );
    }
  }
});

test("footer navigation appends guide link only for EN/TR", () => {
  const enFooter = getFooterNavigation("en");
  const enGuideLink = enFooter.find((item) => item.href === "/guides");
  assert.ok(enGuideLink, "EN footer must contain a guide link");
  assert.equal(enGuideLink.label, "Guides");

  const trFooter = getFooterNavigation("tr");
  const trGuideLink = trFooter.find((item) => item.href === "/guides");
  assert.ok(trGuideLink, "TR footer must contain a guide link");
  assert.equal(trGuideLink.label, "Rehberler");

  for (const locale of locales) {
    if (locale === "en" || locale === "tr") continue;
    const footer = getFooterNavigation(locale);
    const guideLink = footer.find((item) => item.href === "/guides");
    assert.equal(
      guideLink,
      undefined,
      `${locale} footer must NOT contain a guide link`,
    );
  }
});

test("primary navigation does not add a guide link for any locale", () => {
  for (const locale of locales) {
    const primary = getPrimaryNavigation(locale);
    const guideLink = primary.find((item) => item.href === "/guides");
    assert.equal(
      guideLink,
      undefined,
      `${locale} primary navigation must NOT contain a guide link`,
    );
  }
});

function extractConstStringArray(source, name) {
  const match = source.match(
    new RegExp(`const\\s+${name}[^=]*=\\s*\\[([\\s\\S]*?)\\]\\s+as const;`),
  );
  assert.ok(match, `${name} must be declared as a const array`);
  return [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]);
}

test("commercial pages use exact contextual guide translation-key sets", () => {
  assert.deepEqual(
    extractConstStringArray(
      readTextSync("src/components/localized-pages/product-page.tsx"),
      "productGuideKeys",
    ),
    [
      "building-seismic-monitoring-device",
      "earthquake-app-vs-fixed-sensor",
      "seismic-sensor-placement",
    ],
  );
  assert.deepEqual(
    extractConstStringArray(
      readTextSync("src/components/localized-pages/info-page.tsx"),
      "technologyGuideKeys",
    ),
    [
      "mems-accelerometers-seismic-monitoring",
      "building-natural-frequency-monitoring",
    ],
  );
  assert.deepEqual(
    extractConstStringArray(
      readTextSync("src/components/localized-pages/how-it-works-page.tsx"),
      "howItWorksGuideKeys",
    ),
    [
      "measuring-building-motion-after-earthquake",
      "seismic-sensor-placement",
    ],
  );
});

test("product, technology, and how-it-works use six distinct EN/TR guide headings", () => {
  const sources = [
    readTextSync("src/components/localized-pages/product-page.tsx"),
    readTextSync("src/components/localized-pages/info-page.tsx"),
    readTextSync("src/components/localized-pages/how-it-works-page.tsx"),
  ].join("\n");
  const headings = [
    "Choosing and placing a fixed building sensor",
    "Sabit bina sensörü seçimi ve yerleşimi",
    "MEMS sensing and structural response guides",
    "MEMS algılama ve yapı davranışı rehberleri",
    "From sensor placement to post-earthquake measurement",
    "Sensör yerleşiminden deprem sonrası ölçüme",
  ];
  for (const heading of headings) assert.match(sources, new RegExp(heading));
  assert.equal(new Set(headings).size, headings.length);
});

test("GuideLinks accepts all site locales but renders only supported guide locales", () => {
  const source = readTextSync("src/components/guides/guide-links.tsx");
  assert.match(source, /locale:\s*Locale/);
  assert.match(source, /isGuideLocale\(locale\)/);
  assert.match(source, /if\s*\(!isGuideLocale\(locale\)\)\s*return null/);
  assert.match(source, /getGuideByTranslationKey\(locale, key\)/);
  assert.match(source, /getGuideCanonicalPath\(guide\)/);
  assert.doesNotMatch(source, /target=["']_blank["']/);
});

test("locale-switch script maps the current guide path before generic locale substitution", () => {
  const layout = readTextSync("src/app/[locale]/layout.tsx");
  const mobile = readTextSync("src/components/mobile-navigation.tsx");
  assert.match(layout, /getGuideLocaleSwitchPathMap/);
  assert.match(layout, /guideSwitchMap\[relativePath\]/);
  assert.match(layout, /next\s*===\s*current\s*\?\s*relativePath/);
  assert.match(layout, /guideTargets\[next\]\s*\|\|\s*["']\/["']\s*\+\s*next/);
  assert.doesNotMatch(layout, /guideSwitchMap\[candidatePath\]/);
  assert.match(layout, /window\.location\.search\s*\+\s*window\.location\.hash/);
  assert.match(layout, /data-locale-switch/);
  assert.match(mobile, /data-locale-switch/);
});

function readTextSync(relativePath) {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  return readFileSync(path.join(rootDir, relativePath), "utf8");
}
