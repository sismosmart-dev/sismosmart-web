import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { isContentKey, validateContentDocument } from "../src/lib/content-api/contracts.ts";
import { mergeGuideBody } from "../src/lib/content-api/guides-shared.ts";
import { getGuideByTranslationKey } from "../src/lib/guides/catalog.ts";
import { guideTranslationKeys } from "../src/lib/guides/types.ts";
import { renderGuideMarkdown } from "../src/lib/guides/markdown.ts";
import { buildGuideMetadata } from "../src/lib/guides/metadata.ts";
import { getGuideStructuredData } from "../src/lib/guides/structured-data.ts";

const content = {
  title: "Updated SEO title", description: "Updated search description",
  eyebrow: "Research", h1: "Updated on-page guide heading",
  summary: "A carefully reviewed guide summary",
  keyTakeaways: ["Evidence must support claims"],
  sections: [{ heading: "What to know", paragraphs: ["A carefully explained observation."], bullets: ["Not an emergency warning"] }],
  limitations: ["Not a structural safety assessment"],
  sismosmartFit: ["Product feature validation is in progress"],
};

test("six guide identifiers in both guide languages accept safely bounded body overrides", () => {
  assert.equal(guideTranslationKeys.length, 6);
  for (const key of guideTranslationKeys) {
    assert.equal(isContentKey(`guide.${key}.body`), true);
    assert.deepEqual(validateContentDocument(`guide.${key}.body`, content), content);
    for (const locale of ["en", "tr"]) {
      const guide = getGuideByTranslationKey(locale, key);
      const updated = mergeGuideBody(guide, content);
      assert.equal(updated.title, content.title);
      assert.equal(updated.sections[0].heading, content.sections[0].heading);
      for (const field of ["translationKey", "slug", "locale", "references", "relatedGuides", "publishedAt", "updatedAt", "safetyNotice", "cta"]) {
        assert.strictEqual(updated[field], guide[field]);
      }
      assert.strictEqual(mergeGuideBody(guide, null), guide);
    }
  }
});

test("guides reject unregistered identifiers, unsafe markup, unbounded lists and modified citations", () => {
  assert.equal(isContentKey("guide.nonexistent.body"), false);
  assert.equal(isContentKey("guide.building-seismic-monitoring-device.references"), false);
  assert.throws(() => validateContentDocument("guide.building-seismic-monitoring-device.body", { ...content, references: [] }));
  assert.throws(() => validateContentDocument("guide.building-seismic-monitoring-device.body", { ...content, sections: [{ heading: "Hello", paragraphs: ["<iframe>x</iframe>"] }] }), /CMS_HTML_NOT_ALLOWED/);
  assert.throws(() => validateContentDocument("guide.building-seismic-monitoring-device.body", { ...content, keyTakeaways: [] }));
  assert.throws(() => validateContentDocument("guide.building-seismic-monitoring-device.body", { ...content, h1: "a".repeat(241) }));
});

test("guide HTML/SEO/schema and Markdown derive from one published override", () => {
  const guide = mergeGuideBody(getGuideByTranslationKey("en", "building-seismic-monitoring-device"), content);
  const md = renderGuideMarkdown(guide);
  const meta = buildGuideMetadata(guide);
  const schema = getGuideStructuredData(guide);
  assert.match(md, /Updated on-page guide heading/);
  assert.match(md, /A carefully explained observation/);
  assert.equal(meta.title, content.title);
  assert.equal(meta.description, content.description);
  assert.equal(schema[0].headline, content.h1);
  const html = readFileSync("src/app/[locale]/guides/[slug]/page.tsx", "utf8");
  const route = readFileSync("src/app/markdown/guides/[locale]/[slug]/route.ts", "utf8");
  assert.match(html, /await getCmsGuide\(resolved.locale, resolved.slug\)/);
  assert.match(route, /getCmsGuide\(resolved.locale, resolved.slug\)/);
  assert.match(route, /max-age=0, must-revalidate/);
});
