import assert from "node:assert/strict";
import test from "node:test";
import { isContentKey, isSectionsPageKey, sectionPageKeys, validateContentDocument } from "../src/lib/content-api/contracts.ts";
import { mergeSubpageSections } from "../src/lib/content-api/subpages-shared.ts";
import { getPages } from "../src/lib/pages.ts";

const locales = ["en", "tr", "es", "id", "pt", "it"];
const replacement = { sections: [
  { title: "Editorially reviewed question", description: "The safe, reviewed answer." },
  { title: "What this does not do", description: "It is not an official emergency early warning service." },
] };

test("nine editorial pages have 54 independently keyed locale section documents", () => {
  assert.equal(sectionPageKeys.length, 9);
  for (const locale of locales) {
    const original = getPages(locale);
    for (const key of sectionPageKeys) {
      const documentKey = `page.${key}.sections`;
      assert.equal(isSectionsPageKey(key), true);
      assert.equal(isContentKey(documentKey), true);
      assert.deepEqual(validateContentDocument(documentKey, replacement), replacement);
      const merged = mergeSubpageSections(original, key, replacement);
      assert.deepEqual(merged[key].sections, replacement.sections);
      assert.strictEqual(merged[key].meta, original[key].meta);
      assert.equal(merged[key].title, original[key].title);
      assert.strictEqual(mergeSubpageSections(original, key, null), original);
      for (const other of sectionPageKeys.filter((x) => x !== key)) assert.strictEqual(merged[other], original[other]);
    }
  }
});

test("section documents reject unsafe HTML, unknown pages, oversized or malformed records", () => {
  assert.equal(isContentKey("page.product.sections"), false);
  assert.equal(isContentKey("page.contact.sections"), false);
  assert.equal(isContentKey("page.faq.sections_extra"), false);
  assert.equal(isContentKey("page.terms.sections"), true);
  assert.throws(() => validateContentDocument("page.faq.sections", { sections: [] }));
  assert.throws(() => validateContentDocument("page.faq.sections", { sections: [{ title: "abc", description: "hi", url: "https://x" }] }));
  assert.throws(() => validateContentDocument("page.faq.sections", { sections: [{ title: "abc", description: "<img src=x>" }] }), /CMS_HTML_NOT_ALLOWED/);
  assert.throws(() => validateContentDocument("page.terms.sections", { sections: [{ title: "abc", description: "a".repeat(4_001) }] }));
  assert.throws(() => validateContentDocument("page.privacy.sections", { sections: Array.from({ length: 41 }, () => ({ title: "x", description: "y" })) }));
});
