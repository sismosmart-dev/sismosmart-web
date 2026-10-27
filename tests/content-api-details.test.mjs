import assert from "node:assert/strict";
import test from "node:test";
import { detailsPageKeys, isContentKey, validateContentDocument } from "../src/lib/content-api/contracts.ts";
import { mergeSubpageDetails } from "../src/lib/content-api/subpages-shared.ts";
import { getPages } from "../src/lib/pages.ts";

function editable(pageKey, page) {
  if (pageKey === "product") {
    const { deviceDescription, meterTopLabel, meterTopValue, meterBottomLabel, meterBottomValue, imageAlt,
      specs, useCases, comparisonTitle, comparisonDescription, comparisonRows, ctaLabel } = page;
    return { deviceDescription, meterTopLabel, meterTopValue, meterBottomLabel, meterBottomValue, imageAlt,
      specs, useCases, comparisonTitle, comparisonDescription, comparisonRows, ctaLabel };
  }
  if (pageKey === "howItWorks") {
    const { flow, signals, network } = page;
    return { flow, signals, network };
  }
  const { story, principles, timeline, team } = page;
  return { story, principles, timeline, team };
}

test("product/process/about content can be round-tripped across six locales without changing navigation", () => {
  assert.equal(detailsPageKeys.length, 3);
  for (const locale of ["en", "tr", "es", "id", "pt", "it"]) {
    const original = getPages(locale);
    for (const key of detailsPageKeys) {
      assert.equal(isContentKey(`page.${key}.details`), true);
      const document = editable(key, original[key]);
      assert.deepEqual(validateContentDocument(`page.${key}.details`, document), document);
      const patched = mergeSubpageDetails(original, key, document);
      assert.equal(patched[key].title, original[key].title);
      assert.strictEqual(patched[key].meta, original[key].meta);
      assert.strictEqual(mergeSubpageDetails(original, key, null), original);
      if (key === "product") assert.equal(patched.product.ctaHref, original.product.ctaHref);
      for (const sibling of detailsPageKeys.filter(k => k !== key)) assert.strictEqual(patched[sibling], original[sibling]);
      assert.ok(Buffer.byteLength(JSON.stringify({expectedVersion:0,content:document})) < 131_072);
    }
  }
});

test("detailed document edits reject arbitrary links, embedded HTML and oversize collections", () => {
  assert.equal(isContentKey("page.contact.details"), false);
  assert.equal(isContentKey("page.product.ctaHref"), false);
  const base = editable("product", getPages("en").product);
  assert.throws(() => validateContentDocument("page.product.details", { ...base, ctaHref: "https://attacker.example" }));
  assert.throws(() => validateContentDocument("page.product.details", { ...base, specs: [{ label:"<iframe>", value:"x" }] }), /CMS_HTML_NOT_ALLOWED/);
  assert.throws(() => validateContentDocument("page.product.details", { ...base, useCases: Array.from({length:17},()=>({ title:"test",description:"test" })) }));
  const about = editable("about", getPages("en").about);
  assert.throws(() => validateContentDocument("page.about.details", { ...about, story: ["<script>alert(1)</script>"] }), /CMS_HTML_NOT_ALLOWED/);
});
