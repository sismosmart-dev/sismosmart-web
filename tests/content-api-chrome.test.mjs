import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import { createChromeCache } from "../src/lib/content-api/chrome-cache.ts";
import { getSourceSiteChrome, resolveSiteChrome } from "../src/lib/content-api/chrome-shared.ts";
import { isContentKey, validateContentDocument } from "../src/lib/content-api/contracts.ts";
import { getFooterNavigation, getPrimaryNavigation } from "../src/lib/pages.ts";
import { getCopy, locales, safetyNotices, productStageNotices } from "../src/lib/site.ts";

test("six locales expose bounded site.chrome documents without routes or URLs", () => {
  assert.equal(isContentKey("site.chrome"), true);
  for (const locale of locales) {
    const source = getSourceSiteChrome(locale);
    assert.deepEqual(validateContentDocument("site.chrome", source), source);
    assert.equal(source.navigation.labels.guides !== undefined, locale === "en" || locale === "tr");
    assert.ok(Buffer.byteLength(JSON.stringify({ expectedVersion: 0, content: source })) < 8_192);
    const changed = {
      navigation: {
        ...source.navigation,
        eyebrow: `Edited ${locale} eyebrow`,
        primaryCta: `Edited ${locale} CTA`,
        labels: { ...source.navigation.labels, product: `Edited ${locale} Product`, ...(source.navigation.labels.guides ? { guides: "Updated guides" } : {}) },
      },
      footer: { ...source.footer, note: `Edited ${locale} footer`, explore: "More", legal: "Example legal text" },
    };
    assert.deepEqual(validateContentDocument("site.chrome", changed), changed);
    const result = resolveSiteChrome(locale, changed);
    assert.equal(result.brandEyebrow, changed.navigation.eyebrow);
    assert.equal(result.primaryCta, changed.navigation.primaryCta);
    assert.equal(result.navigation[0].label, changed.navigation.labels.product);
    assert.equal(result.navigation[0].href, getPrimaryNavigation(locale)[0].href);
    assert.deepEqual(result.navigation.map((item) => item.href), getPrimaryNavigation(locale).map((item) => item.href));
    assert.deepEqual(result.footerNavigation.map((item) => item.href), getFooterNavigation(locale).map((item) => item.href));
    assert.equal(result.footerNavigation[0].label, changed.navigation.labels.product);
    assert.equal(result.footerLabels.note, changed.footer.note);
    assert.equal(result.footerLabels.explore, changed.footer.explore);
    assert.equal(result.legal, changed.footer.legal);
    assert.deepEqual(resolveSiteChrome(locale, null).navigation, getPrimaryNavigation(locale));
    assert.deepEqual(resolveSiteChrome(locale, null).footerNavigation, getFooterNavigation(locale));
    assert.equal(getCopy(locale).navigation.eyebrow, source.navigation.eyebrow);
    assert.ok(safetyNotices[locale] && productStageNotices[locale]);
  }
});

test("site chrome rejects HTML, unknown/unsafe fields, oversized and empty text", () => {
  const doc = getSourceSiteChrome("en");
  assert.throws(() => validateContentDocument("site.chrome", {
    ...doc, navigation: { ...doc.navigation, redirect: "https://untrusted.example" },
  }));
  assert.throws(() => validateContentDocument("site.chrome", {
    ...doc, navigation: { ...doc.navigation, labels: { ...doc.navigation.labels, product: "<svg onload=alert(1)>" } },
  }), /CMS_HTML_NOT_ALLOWED/);
  assert.throws(() => validateContentDocument("site.chrome", {
    ...doc, footer: { ...doc.footer, socialLinks: [{ href: "https://untrusted.example" }] },
  }));
  assert.throws(() => validateContentDocument("site.chrome", {
    ...doc, footer: { ...doc.footer, note: "" },
  }));
  assert.throws(() => validateContentDocument("site.chrome", {
    ...doc, navigation: { ...doc.navigation, labels: { ...doc.navigation.labels, product: "x".repeat(241) } },
  }));
  assert.equal(isContentKey("site.chrome.malicious"), false);
});

test("shared chrome read-through coalesces requests and expires by locale", async () => {
  let now = 1_000;
  const calls = [];
  const cached = createChromeCache(async (locale) => { calls.push(locale); return { label: `${locale}-${calls.length}` }; }, { now: () => now, ttlMs: 5_000 });
  const [a, b] = await Promise.all([cached("en"), cached("en")]);
  assert.deepEqual(a, b);
  assert.deepEqual(calls, ["en"]);
  assert.deepEqual(await cached("en"), a);
  assert.equal((await cached("tr")).label, "tr-2");
  now += 5_001;
  assert.equal((await cached("en")).label, "en-3");
  assert.equal((await cached("tr")).label, "tr-4");
  assert.deepEqual(calls, ["en", "tr", "en", "tr"]);
});

test("optional CMS read failure is not permanently cached", async () => {
  let attempts = 0;
  let now = 0;
  const cached = createChromeCache(async () => { attempts++; if (attempts === 1) throw new Error("unavailable"); return { ok: true }; }, { now: () => now, ttlMs: 5_000 });
  await assert.rejects(cached("en"), /unavailable/);
  assert.deepEqual(await cached("en"), { ok: true });
  now += 100;
  assert.deepEqual(await cached("en"), { ok: true });
  assert.equal(attempts, 2);
});

test("the locale layout reads approved chrome and never changes destinations/notices", () => {
  const layout = readFileSync("src/app/[locale]/layout.tsx", "utf8");
  const admin = readFileSync("src/lib/content-api/admin.ts", "utf8");
  const reader = readFileSync("src/lib/content-api/chrome.ts", "utf8");
  assert.match(layout, /await getCmsSiteChrome\(locale\)/);
  assert.match(layout, /\{chrome\.brandEyebrow\}/);
  assert.match(layout, /ctaLabel=\{chrome\.primaryCta\}/);
  assert.match(layout, /\{chrome\.legal\}/);
  assert.match(layout, /safetyNotices\[locale\]/);
  assert.match(layout, /productStageNotices\[locale\]/);
  assert.match(admin, /key === "site\.chrome" \? "layout" : "page"/);
  assert.match(reader, /process\.env\.CMS_DB_ENABLED !== "true"/);
});
