import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import { isContentKey, validateContentDocument } from "../src/lib/content-api/contracts.ts";
import { mergeHomeSections } from "../src/lib/content-api/home-shared.ts";
import { mergeContactCopy } from "../src/lib/content-api/contact-shared.ts";
import { getCopy } from "../src/lib/site.ts";
import { getPages } from "../src/lib/pages.ts";

const locales = ["en", "tr", "es", "id", "pt", "it"];
const homeFields = ["hero", "trust", "howItWorks", "features", "demo", "proof", "faq", "newsletter"];

function homeBody(source) {
  const { title, description, primaryHref, secondaryHref, tertiaryHref, ...hero } = source.hero;
  void title; void description; void primaryHref; void secondaryHref; void tertiaryHref;
  return { hero, trust: source.trust, howItWorks: source.howItWorks, features: source.features,
    demo: (({ ctaHref, ...rest }) => rest)(source.demo), proof: source.proof,
    faq: source.faq, newsletter: source.newsletter };
}

test("home secondary sections in all 6 locales preserve protected URLs and source-copy fallback", () => {
  assert.equal(isContentKey("home.sections"), true);
  for (const locale of locales) {
    const source = getCopy(locale);
    const content = homeBody(source);
    assert.deepEqual(Object.keys(content), homeFields);
    assert.deepEqual(validateContentDocument("home.sections", content), content);
    const updated = mergeHomeSections(source, content);
    assert.strictEqual(updated.hero.primaryHref, source.hero.primaryHref);
    assert.strictEqual(updated.hero.secondaryHref, source.hero.secondaryHref);
    assert.strictEqual(updated.hero.tertiaryHref, source.hero.tertiaryHref);
    assert.strictEqual(updated.demo.ctaHref, source.demo.ctaHref);
    assert.strictEqual(updated.meta, source.meta);
    assert.strictEqual(mergeHomeSections(source, null), source);
    assert.ok(Buffer.byteLength(JSON.stringify({ content, expectedVersion: 0 })) < 131_072);
  }
});

test("contact page in 6 locales changes visible channels/form copy but preserves destinations and backend behavior", () => {
  assert.equal(isContentKey("page.contact.copy"), true);
  for (const locale of locales) {
    const pages = getPages(locale);
    const document = {
      channels: pages.contact.channels.map(({ title, description, value }) => ({ title, description, value })),
      form: pages.contact.form,
    };
    assert.deepEqual(validateContentDocument("page.contact.copy", document), document);
    const changed = mergeContactCopy(pages, document);
    for (let i=0; i<document.channels.length;i++) assert.equal(changed.contact.channels[i].href, pages.contact.channels[i].href);
    assert.deepEqual(changed.contact.form, pages.contact.form);
    assert.strictEqual(changed.contact.meta, pages.contact.meta);
    assert.strictEqual(mergeContactCopy(pages, null), pages);
    assert.strictEqual(mergeContactCopy(pages, { ...document, channels: [] }), pages);
    assert.ok(Buffer.byteLength(JSON.stringify({ content: document, expectedVersion: 0 })) < 131_072);
  }
});

test("home and contact reject unsafe HTML and unapproved link modifications", () => {
  const home = homeBody(getCopy("en"));
  assert.throws(() => validateContentDocument("home.sections", { ...home, hero: { ...home.hero, primaryHref: "https://untrusted.example" } }));
  assert.throws(() => validateContentDocument("home.sections", { ...home, faq: { ...home.faq, items: [{ title: "Q", description: "<img src=x>" }] } }), /CMS_HTML_NOT_ALLOWED/);
  const pages = getPages("en");
  const channels = pages.contact.channels.map(({ title, description, value }) => ({ title, description, value }));
  assert.throws(() => validateContentDocument("page.contact.copy", { channels: [{ ...channels[0], href: "https://evil.example" }], form: pages.contact.form }));
});

test("resolved public home and contact readers use source fallback and published overrides only", () => {
  const home = readFileSync("src/lib/content-api/home.ts", "utf8");
  const contact = readFileSync("src/lib/content-api/subpages.ts", "utf8");
  assert.match(home, /readPublishedOverride\(locale, "home.sections"\)/);
  assert.match(home, /mergeHomeSections\(fallback, sections\)/);
  assert.match(contact, /pageKey === "contact"/);
  assert.match(contact, /mergeContactCopy/);
});
