import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getAgentPageDescriptor } from "../src/lib/agent-discovery.ts";
import { renderAgentPageMarkdown } from "../src/lib/markdown-content.ts";
import { mergeSubpageIntro } from "../src/lib/content-api/subpages-shared.ts";
import { getPages } from "../src/lib/pages.ts";
import { getCopy } from "../src/lib/site.ts";

const pageIntro = {
  eyebrow: "Updated intro eyebrow",
  title: "New HTML heading and Markdown descriptor",
  description: "Description now shared by visitor HTML and Markdown copy.",
  meta: { title: "New SEO title | SismoSmart", description: "SEO copy rendered in dynamic Markdown." },
};

test("Markdown frontmatter, title and page body resolve the same published subpage intro", () => {
  const pages = mergeSubpageIntro(getPages("en"), "product", pageIntro);
  const markdown = renderAgentPageMarkdown("en", "product", { pages });
  const descriptor = getAgentPageDescriptor("en", "product", pages.product.meta);
  assert.match(markdown, /title: "New SEO title \| SismoSmart"/);
  assert.match(markdown, /description: "SEO copy rendered in dynamic Markdown."/);
  assert.match(markdown, /# New SEO title \| SismoSmart/);
  assert.equal(descriptor.title, pageIntro.meta.title);
  assert.equal(descriptor.description, pageIntro.meta.description);
  assert.equal(pages.product.title, pageIntro.title);
  assert.equal(pages.product.description, pageIntro.description);
  assert.match(markdown, /https:\/\/sismosmart\.com\/en\/product/);
});

test("home Markdown uses published hero copy and SEO title, but retains safe source fallback", () => {
  const base = getCopy("en");
  const homeCopy = {
    ...base,
    hero: { ...base.hero, description: "Published home hero description for the Markdown mirror." },
    meta: { ...base.meta, title: "Published home SEO title" },
  };
  const published = renderAgentPageMarkdown("en", "home", { homeCopy });
  assert.match(published, /# Published home SEO title/);
  assert.match(published, /Published home hero description for the Markdown mirror/);
  const fallback = renderAgentPageMarkdown("en", "home");
  assert.match(fallback, new RegExp(base.meta.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("dynamic localized route avoids hour-long stale Markdown after CMS publish", () => {
  const route = readFileSync("src/app/markdown/[locale]/[page]/route.ts", "utf8");
  assert.match(route, /dynamic = "force-dynamic"/);
  assert.match(route, /process.env.CMS_DB_ENABLED === "true"/);
  assert.match(route, /getCmsSubpageCopy/);
  assert.match(route, /getHomeCopy/);
  assert.match(route, /max-age=0, must-revalidate/);
  assert.match(route, /renderAgentPageMarkdown\(resolved.locale, resolved.pageKey, \{ pages, homeCopy \}\)/);
});
