import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { isContentKey, validateContentDocument } from "../src/lib/content-api/contracts.ts";
import { mergeSubpageIntro } from "../src/lib/content-api/subpages-shared.ts";
import { getPages, staticPageKeys } from "../src/lib/pages.ts";

const locales = ["tr", "en", "es", "id", "pt", "it"];
const changed = {
  eyebrow: "New short eyebrow",
  title: "New page title",
  description: "New description for a page introduction",
  meta: { title: "New SEO title | SismoSmart", description: "New search meta description" },
};

test("all 13 static pages across six locales register a single strongly validated intro key", () => {
  assert.equal(staticPageKeys.length, 13);
  for (const locale of locales) {
    for (const key of staticPageKeys) {
      assert.equal(isContentKey(`page.${key}.intro`), true);
      assert.deepEqual(validateContentDocument(`page.${key}.intro`, changed), changed);
      const base = getPages(locale);
      const patched = mergeSubpageIntro(base, key, changed);
      assert.notEqual(patched, base);
      assert.equal(patched[key].title, changed.title);
      assert.equal(patched[key].meta.description, changed.meta.description);
      assert.equal(patched[key].description, changed.description);
      assert.equal(patched[key].eyebrow, changed.eyebrow);
      assert.equal(patched.product.specs?.length, base.product.specs.length);
      for (const other of staticPageKeys.filter(x => x !== key)) {
        assert.strictEqual(patched[other], base[other]);
      }
      assert.strictEqual(mergeSubpageIntro(base, key, null), base);
    }
  }
});

test("intro API strictly rejects unknown keys, extra fields and HTML in nested metadata", () => {
  assert.equal(isContentKey("page.home.intro"), false);
  assert.equal(isContentKey("page.admin.intro"), false);
  assert.equal(isContentKey("page.product.meta"), false);
  assert.equal(isContentKey("page.product.intro' OR 1=1"), false);
  assert.throws(() => validateContentDocument("page.product.intro", { ...changed, externalAdmin: "yes" }));
  assert.throws(() => validateContentDocument("page.product.intro", { ...changed, meta: { ...changed.meta, title: "<script>alert(1)</script>" } }), /CMS_HTML_NOT_ALLOWED/);
  assert.throws(() => validateContentDocument("page.product.intro", { ...changed, meta: { ...changed.meta, more: "unsafe" } }));
  assert.throws(() => validateContentDocument("page.product.intro", { ...changed, description: "" }));
  assert.throws(() => validateContentDocument("page.product.intro", { ...changed, title: "a".repeat(241) }));
});

test("route metadata, JSON-LD and page rendering all receive same resolved copy", () => {
  const route = readFileSync("src/app/[locale]/[page]/page.tsx", "utf8");
  const renderer = readFileSync("src/components/localized-subpage.tsx", "utf8");
  const structured = readFileSync("src/lib/structured-data.ts", "utf8");
  assert.match(route, /dynamic = "force-dynamic"/);
  assert.match(route, /getCmsSubpageCopy\(locale, pageKey\)/);
  assert.match(route, /getPageStructuredData\(locale as Locale, pageKey, pages\)/);
  assert.match(route, /renderStaticPage\(locale as Locale, pageKey, pages\)/);
  assert.match(structured, /pages: RoutePagesCopy = getPages\(locale\)/);
  assert.match(renderer, /pages\?: RoutePagesCopy/);
  for (const part of ["about", "contact", "faq", "how-it-works", "info", "pilot-program", "product"]) {
    const text = readFileSync(`src/components/localized-pages/${part}-page.tsx`, "utf8");
    assert.match(text, /pages\??: RoutePagesCopy/);
  }
});
