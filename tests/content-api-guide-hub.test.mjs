import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import { isContentKey, validateContentDocument } from "../src/lib/content-api/contracts.ts";
import { getGuideHub, getGuides } from "../src/lib/guides/catalog.ts";
import { renderGuideHubMarkdown } from "../src/lib/guides/markdown.ts";
import { buildGuideHubMetadata } from "../src/lib/guides/metadata.ts";
import { getGuideHubStructuredData } from "../src/lib/guides/structured-data.ts";

test("guide hub text and edited child guide card titles are consistent in EN/TR, Markdown, SEO and JSON-LD", () => {
  assert.equal(isContentKey("guides.hub"), true);
  for (const locale of ["en", "tr"]) {
    const original = getGuideHub(locale);
    const { locale: ignored, ...content } = original;
    void ignored;
    assert.deepEqual(validateContentDocument("guides.hub", content), content);
    const updated = { ...original, ...content, h1: "Published hub heading", description: "Published guide directory" };
    const guides = getGuides(locale).map((g, i) => i === 0 ? { ...g, h1: "Updated guide first heading" } : g);
    const md = renderGuideHubMarkdown(locale, { hub: updated, guides });
    assert.match(md, /# Published hub heading/);
    assert.match(md, /Updated guide first heading/);
    assert.equal(buildGuideHubMetadata(locale, updated).description, "Published guide directory");
    assert.equal(getGuideHubStructuredData(locale, updated)[0].name, "Published hub heading");
  }
});

test("hub source is never allowed to change canonical locale or arbitrary hrefs", () => {
  const hub = getGuideHub("en");
  const { locale: ignored, ...body } = hub;
  void ignored;
  assert.throws(() => validateContentDocument("guides.hub", { ...body, locale: "fr" }));
  assert.throws(() => validateContentDocument("guides.hub", { ...body, intro: "<iframe src=evil>" }), /CMS_HTML_NOT_ALLOWED/);
  const html = readFileSync("src/app/[locale]/guides/page.tsx", "utf8");
  const route = readFileSync("src/app/markdown/guides/[locale]/route.ts", "utf8");
  assert.match(html, /await getCmsGuideHub\(resolved\)/);
  assert.match(route, /getCmsGuideHub\(resolved\)/);
  assert.match(route, /max-age=0, must-revalidate/);
});
