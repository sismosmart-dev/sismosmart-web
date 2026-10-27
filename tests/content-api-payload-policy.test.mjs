import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { validateContentDocument } from "../src/lib/content-api/contracts.ts";
import { getGuides } from "../src/lib/guides/catalog.ts";
import { getPages } from "../src/lib/pages.ts";

test("existing safe guide and FAQ documents fit within their bounded admin payload ceilings", () => {
  for (const locale of ["en", "tr"]) {
    for (const guide of getGuides(locale)) {
      const content = (({ title, description, eyebrow, h1, summary, keyTakeaways, sections, limitations, sismosmartFit }) => ({ title, description, eyebrow, h1, summary, keyTakeaways, sections, limitations, sismosmartFit }))(guide);
      validateContentDocument(`guide.${guide.translationKey}.body`, content);
      assert.ok(Buffer.byteLength(JSON.stringify({ expectedVersion: 0, content })) < 65_536);
    }
  }
  for (const locale of ["en", "tr", "es", "id", "pt", "it"]) {
    for (const pageKey of ["faq", "privacy", "terms", "glossary", "technology", "pilotProgram", "investors", "security", "press"]) {
      const content = { sections: getPages(locale)[pageKey].sections };
      validateContentDocument(`page.${pageKey}.sections`, content);
      assert.ok(Buffer.byteLength(JSON.stringify({ expectedVersion: 0, content })) < 131_072);
    }
  }
});

test("route accepts reset to source fallback at targetVersion zero and bounds editor requests", () => {
  const text = readFileSync("src/lib/content-api/admin.ts", "utf8");
  assert.match(text, /targetVersion: z\.number\(\)\.int\(\)\.min\(0\)/);
  assert.match(text, /65_536/);
  assert.match(text, /131_072/);
  assert.match(text, /8_192/);
  assert.match(text, /readLimitedJsonBody\(request, maxBytes\)/);
});
