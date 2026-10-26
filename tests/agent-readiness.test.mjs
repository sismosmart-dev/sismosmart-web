import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  getHomeStructuredData,
  getPageStructuredData,
} from "../src/lib/structured-data.ts";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

async function loadRoute(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  assert.equal(fs.existsSync(absolutePath), true, `${relativePath} must exist`);
  return import(pathToFileURL(absolutePath).href);
}

test("llms.txt is served as cacheable plain text", async () => {
  const { GET } = await loadRoute("src/app/llms.txt/route.ts");
  const response = GET();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8");
  assert.match(response.headers.get("cache-control") ?? "", /max-age=3600/);
  assert.match(await response.text(), /^# SismoSmart/m);
});

test("llms.txt summary does not overstate validation-pending device capabilities", async () => {
  const { GET } = await loadRoute("src/app/llms.txt/route.ts");
  const body = await GET().text();

  assert.match(body, /pre-launch building seismic monitoring/i);
  assert.match(body, /design targets pending pilot validation/i);
  assert.doesNotMatch(body, /can notify a paired phone/i);
});

test("machine-readable sitemap and full context routes are public plain text", async () => {
  const sitemapModule = await loadRoute("src/app/sitemap.md/route.ts");
  const llmsFullModule = await loadRoute("src/app/llms-full.txt/route.ts");

  const sitemapResponse = sitemapModule.GET();
  const llmsFullResponse = llmsFullModule.GET();
  const sitemapBody = await sitemapResponse.text();
  const llmsFullBody = await llmsFullResponse.text();

  for (const response of [sitemapResponse, llmsFullResponse]) {
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8");
    assert.match(response.headers.get("cache-control") ?? "", /max-age=3600/);
  }

  assert.match(sitemapBody, /^# SismoSmart site map/m);
  assert.match(sitemapBody, /https:\/\/sismosmart\.com\/sitemap\.xml/);
  assert.match(sitemapBody, /https:\/\/sismosmart\.com\/llms-full\.txt/);
  assert.match(llmsFullBody, /^# SismoSmart expanded context/m);
  assert.match(llmsFullBody, /not yet generally available/i);
  assert.match(llmsFullBody, /https:\/\/sismosmart\.com\/en\/privacy/);
});

test("BrandMark creates instance-safe SVG definition identifiers", () => {
  const source = readText("src/components/brand-mark.tsx");

  assert.match(source, /useId/);
  assert.match(source, /replace\(\/\[\^a-zA-Z0-9_-\]\/g,\s*["']{2}\)/);
  assert.doesNotMatch(source, /id=["']brand-surface["']/);
  assert.doesNotMatch(source, /id=["']brand-wave["']/);
});

test("structured data exposes canonical identity and freshness fields", () => {
  for (const locale of ["en", "tr"]) {
    const home = getHomeStructuredData(locale);
    const homePage = home.find((entry) => entry["@type"] === "WebPage");
    const homeBreadcrumb = home.find((entry) => entry["@type"] === "BreadcrumbList");
    assert.equal(homePage?.url, `https://sismosmart.com/${locale}`);
    assert.equal(homeBreadcrumb?.itemListElement?.[0]?.item, `https://sismosmart.com/${locale}`);

    const howTo = getPageStructuredData(locale, "howItWorks").find(
      (entry) => entry["@type"] === "HowTo",
    );
    assert.equal(howTo?.url, `https://sismosmart.com/${locale}/how-it-works`);

    const technology = getPageStructuredData(locale, "technology").find(
      (entry) => entry["@type"] === "TechArticle",
    );
    assert.equal(technology?.url, `https://sismosmart.com/${locale}/technology`);
    assert.match(technology?.dateModified ?? "", /^\d{4}-\d{2}-\d{2}$/);

    const faq = getPageStructuredData(locale, "faq").find(
      (entry) => entry["@type"] === "FAQPage",
    );
    assert.equal(typeof faq?.name, "string");
    assert.ok((faq?.name?.length ?? 0) > 0);
    assert.equal(typeof faq?.description, "string");
    assert.ok((faq?.description?.length ?? 0) > 0);
    assert.equal(faq?.url, `https://sismosmart.com/${locale}/faq`);
  }
});


test("public pages advertise llms discovery and permissive snippet previews", async () => {
  const layoutSource = readText("src/app/layout.tsx");
  assert.match(layoutSource, /rel=["']describedby["']/);
  assert.match(layoutSource, /llms\.txt/);

  const { buildPageMetadata } = await import("../src/lib/metadata.ts");
  const metadata = buildPageMetadata("en", "/", "Title", "Description");
  assert.equal(metadata.robots?.index, true);
  assert.equal(metadata.robots?.follow, true);
  assert.equal(metadata.robots?.["max-snippet"], -1);
  assert.equal(metadata.robots?.["max-image-preview"], "large");
});

test("machine-readable freshness dates reflect the current public content review", () => {
  const agentDiscovery = readText("src/lib/agent-discovery.ts");
  const structuredData = readText("src/lib/structured-data.ts");

  assert.match(agentDiscovery, /agentContentLastUpdated = "2026-10-01"/);
  assert.match(structuredData, /structuredDataModifiedDate = "2026-10-01"/);
});

test("English press metadata gives agents enough page context", () => {
  const source = readText("src/lib/page-content/en.ts");
  const match = source.match(
    /press:\s*\{[\s\S]*?meta:\s*\{\s*title:\s*["']Press kit["'],\s*description:\s*["']([^"']+)["']/,
  );

  assert.ok(match, "English press metadata must be present");
  assert.ok(match[1].length >= 50, `press description is only ${match[1].length} characters`);
});
