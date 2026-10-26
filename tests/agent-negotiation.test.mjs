import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { NextRequest } from "next/server.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const proxyPath = path.join(rootDir, "src/proxy.ts");

async function loadProxy() {
  assert.equal(fs.existsSync(proxyPath), true, "src/proxy.ts must exist");
  return import(pathToFileURL(proxyPath).href);
}

function rewritePath(response) {
  const value = response.headers.get("x-middleware-rewrite");
  return value ? new URL(value).pathname : null;
}

test("direct same-path Markdown mirrors rewrite to the internal renderer", async () => {
  const { proxy } = await loadProxy();
  for (const [pathname, expected] of [
    ["/en.md", "/markdown/en/home"],
    ["/en/product.md", "/markdown/en/product"],
    ["/tr/glossary.md", "/markdown/tr/glossary"],
  ]) {
    const response = proxy(new NextRequest(`https://sismosmart.com${pathname}`));
    assert.equal(rewritePath(response), expected);
  }
});

test("explicit Markdown Accept requests negotiate the same public resource", async () => {
  const { proxy } = await loadProxy();
  for (const [pathname, expected] of [
    ["/en", "/markdown/en/home"],
    ["/en/contact", "/markdown/en/contact"],
  ]) {
    const response = proxy(
      new NextRequest(`https://sismosmart.com${pathname}`, {
        headers: { Accept: "text/markdown" },
      }),
    );
    assert.equal(rewritePath(response), expected);
  }
});

test("nested guide hub and detail Markdown paths rewrite before legacy fallback", async () => {
  const { proxy } = await loadProxy();
  for (const [pathname, expected] of [
    ["/en/guides", "/markdown/guides/en"],
    ["/tr/guides", "/markdown/guides/tr"],
    ["/en/guides/building-seismic-monitoring-device", "/markdown/guides/en/building-seismic-monitoring-device"],
    ["/tr/guides/bina-deprem-sensoru-sismik-izleme", "/markdown/guides/tr/bina-deprem-sensoru-sismik-izleme"],
  ]) {
    const response = proxy(
      new NextRequest(`https://sismosmart.com${pathname}`, {
        headers: { Accept: "text/markdown" },
      }),
    );
    assert.equal(rewritePath(response), expected, `Expected rewrite ${pathname} -> ${expected}`);
  }
});

test("guide detail direct Markdown path rewrites correctly", async () => {
  const { proxy } = await loadProxy();
  for (const [pathname, expected] of [
    ["/en/guides/building-seismic-monitoring-device.md", "/markdown/guides/en/building-seismic-monitoring-device"],
    ["/tr/guides/bina-deprem-sensoru-sismik-izleme.md", "/markdown/guides/tr/bina-deprem-sensoru-sismik-izleme"],
  ]) {
    const response = proxy(new NextRequest(`https://sismosmart.com${pathname}`));
    assert.equal(rewritePath(response), expected, `Expected rewrite ${pathname} -> ${expected}`);
  }
});

test("direct hub Markdown path rewrites correctly for both locales", async () => {
  const { proxy } = await loadProxy();
  for (const [pathname, expected] of [
    ["/en/guides.md", "/markdown/guides/en"],
    ["/tr/guides.md", "/markdown/guides/tr"],
  ]) {
    const response = proxy(new NextRequest(`https://sismosmart.com${pathname}`));
    assert.equal(rewritePath(response), expected, `Expected rewrite ${pathname} -> ${expected}`);
  }
});

test("proxy does not rewrite unsupported guide locales for direct .md paths", async () => {
  const { proxy } = await loadProxy();
  for (const locale of ["es", "id", "pt", "it"]) {
    const response = proxy(
      new NextRequest(`https://sismosmart.com/${locale}/guides.md`),
    );
    assert.equal(rewritePath(response), null, `Should not rewrite /${locale}/guides.md`);
  }
});

test("proxy does not rewrite unsupported guide locales for detail .md paths", async () => {
  const { proxy } = await loadProxy();
  for (const locale of ["es", "id", "pt", "it"]) {
    const response = proxy(
      new NextRequest(`https://sismosmart.com/${locale}/guides/building-seismic-monitoring-device.md`),
    );
    assert.equal(rewritePath(response), null, `Should not rewrite /${locale}/guides/detail.md`);
  }
});

test("proxy does not rewrite nested guide paths without .md", async () => {
  const { proxy } = await loadProxy();
  for (const path of [
    "/en/guides/building-seismic-monitoring-device/extra",
    "/en/guides/building-seismic-monitoring-device/extra.md",
  ]) {
    const response = proxy(
      new NextRequest(`https://sismosmart.com${path}`, {
        headers: { Accept: "text/markdown" },
      }),
    );
    assert.equal(rewritePath(response), null, `Should not rewrite ${path}`);
  }
});

test("proxy passes through POST requests to guide paths", async () => {
  const { proxy } = await loadProxy();
  const response = proxy(
    new NextRequest("https://sismosmart.com/en/guides", {
      method: "POST",
      headers: { Accept: "text/markdown" },
    }),
  );
  assert.equal(rewritePath(response), null, "POST should not rewrite");
});

test("proxy does not rewrite unknown guide slugs", async () => {
  const { proxy } = await loadProxy();
  const response = proxy(
    new NextRequest("https://sismosmart.com/en/guides/nonexistent-slug", {
      headers: { Accept: "text/markdown" },
    }),
  );
  assert.equal(rewritePath(response), null);
  assert.equal(response.headers.get("x-middleware-next"), "1");
});

test("proxy does not rewrite unsupported guide locales", async () => {
  const { proxy } = await loadProxy();
  for (const locale of ["es", "id", "pt", "it"]) {
    const response = proxy(
      new NextRequest(`https://sismosmart.com/${locale}/guides`, {
        headers: { Accept: "text/markdown" },
      }),
    );
    assert.equal(rewritePath(response), null, `Should not rewrite /${locale}/guides`);
  }
});

test("proxy resolves guide hub before legacy markdown fallback", async () => {
  const { proxy } = await loadProxy();
  const response = proxy(
    new NextRequest("https://sismosmart.com/en/guides", {
      headers: { Accept: "text/markdown" },
    }),
  );
  assert.equal(rewritePath(response), "/markdown/guides/en", "Guide hub must resolve to /markdown/guides/en");
});

test("proxy resolves guide detail before legacy markdown fallback", async () => {
  const { proxy } = await loadProxy();
  const response = proxy(
    new NextRequest("https://sismosmart.com/en/guides/building-seismic-monitoring-device", {
      headers: { Accept: "text/markdown" },
    }),
  );
  assert.equal(rewritePath(response), "/markdown/guides/en/building-seismic-monitoring-device", "Guide detail must resolve before legacy fallback");
});

test("proxy rejects Accept headers where text/markdown q is zero or negative", async () => {
  const { proxy } = await loadProxy();
  for (const accept of [
    "text/markdown;q=0",
    "text/markdown;q=0.0",
    "text/markdown;q=0.00",
    "text/markdown;q=0.000",
    "text/markdown;q=0.0000",
    "text/markdown;q=-1",
    "text/markdown;q=NaN",
    "text/markdown;q=Infinity",
    "text/markdown;q=",
  ]) {
    const response = proxy(
      new NextRequest("https://sismosmart.com/en/product", {
        headers: { Accept: accept },
      }),
    );
    assert.equal(rewritePath(response), null, `Should not rewrite for Accept: ${accept}`);
  }
});

test("proxy accepts Accept headers with positive finite q values", async () => {
  const { proxy } = await loadProxy();
  for (const accept of [
    "text/markdown;q=1",
    "text/markdown;q=1.0",
    "text/markdown;q=0.5",
    "text/markdown;q=0.1",
    "text/markdown;q=0.01",
    "text/markdown;q=0.001",
    "text/markdown;q=0.0001",
  ]) {
    const response = proxy(
      new NextRequest("https://sismosmart.com/en/product", {
        headers: { Accept: accept },
      }),
    );
    assert.notEqual(rewritePath(response), null, `Should rewrite for Accept: ${accept}`);
  }
});

test("HEAD requests negotiate Markdown while ordinary browser and unsafe requests pass through", async () => {
  const { proxy } = await loadProxy();
  const head = proxy(
    new NextRequest("https://sismosmart.com/en/product", {
      method: "HEAD",
      headers: { Accept: "text/markdown, text/plain;q=0.9" },
    }),
  );
  assert.equal(rewritePath(head), "/markdown/en/product");

  for (const request of [
    new NextRequest("https://sismosmart.com/en/product", {
      headers: { Accept: "text/html,application/xhtml+xml" },
    }),
    new NextRequest("https://sismosmart.com/en/product", {
      headers: { Accept: "*/*" },
    }),
    new NextRequest("https://sismosmart.com/api/contact", {
      headers: { Accept: "text/markdown" },
    }),
    new NextRequest("https://sismosmart.com/_next/static/chunk.js", {
      headers: { Accept: "text/markdown" },
    }),
    new NextRequest("https://sismosmart.com/en/contact", {
      method: "POST",
      headers: { Accept: "text/markdown" },
    }),
    new NextRequest("https://sismosmart.com/en/missing.md"),
  ]) {
    const response = proxy(request);
    assert.equal(rewritePath(response), null);
    assert.equal(response.headers.get("x-middleware-next"), "1");
  }
});
