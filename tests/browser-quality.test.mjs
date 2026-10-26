import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  browserQualityRoutes,
  evaluateLayout,
  filterBlockingAxeViolations,
  findDuplicateIds,
  isLoopbackUrl,
  sanitizeBrowserResult,
  summarizeForwardRequest,
} from "../scripts/test/browser-quality-lib.mjs";
import {
  formatBrowserSafeSummary,
  getBrowserExecutableCandidates,
  isAddressInUseFailure,
} from "../scripts/test/browser-quality.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readText(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), "utf8");
}

test("browser route policy covers commercial pages and bilingual guide routes", () => {
  assert.deepEqual(
    browserQualityRoutes.map(({ key, path }) => [key, path]),
    [
      ["en-home", "/en"],
      ["tr-home", "/tr"],
      ["en-product", "/en/product"],
      ["tr-product", "/tr/product"],
      ["en-contact", "/en/contact"],
      ["tr-pilot", "/tr/pilot-program"],
      ["en-guides", "/en/guides"],
      ["tr-guide-device", "/tr/guides/bina-deprem-sensoru-sismik-izleme"],
    ],
  );
  assert.equal(
    browserQualityRoutes.every((route) => ["en", "tr"].includes(route.locale)),
    true,
  );
});

test("browser mobile policy remains limited to the existing home and product scenarios", () => {
  const runner = readText("scripts/test/browser-quality.mjs");
  assert.match(
    runner,
    /\["en-home", "tr-product"\]\.includes\(item\.key\)/,
  );
  assert.doesNotMatch(
    runner,
    /\["en-home", "tr-product", "en-guides"\]/,
  );
});

test("only serious and critical axe violations block CI", () => {
  const violations = [
    { id: "minor", impact: "minor", nodes: [{}] },
    { id: "moderate", impact: "moderate", nodes: [{}] },
    {
      id: "serious",
      impact: "serious",
      nodes: [{ target: ["#first"] }, { target: ["main", ".second"] }],
    },
    { id: "critical", impact: "critical", nodes: [{ target: ["button"] }] },
    { id: "unknown", impact: null, nodes: [{}] },
  ];

  assert.deepEqual(
    filterBlockingAxeViolations(violations).map(({ id, nodeCount, targets }) => ({
      id,
      nodeCount,
      targets,
    })),
    [
      { id: "serious", nodeCount: 2, targets: ["#first", "main .second"] },
      { id: "critical", nodeCount: 1, targets: ["button"] },
    ],
  );
});

test("duplicate ID detection is stable and ignores empty values", () => {
  assert.deepEqual(
    findDuplicateIds(["brand", "", "content", "brand", "content", "brand"]),
    [
      { count: 3, id: "brand" },
      { count: 2, id: "content" },
    ],
  );
});

test("layout evaluation allows one CSS pixel tolerance and requires visible key content", () => {
  assert.deepEqual(
    evaluateLayout({
      clientWidth: 390,
      h1Rect: { height: 48, width: 320 },
      mainRect: { height: 900, width: 390 },
      scrollWidth: 391,
    }),
    {
      blocking: false,
      h1Visible: true,
      horizontalOverflowPx: 1,
      mainVisible: true,
    },
  );

  assert.deepEqual(
    evaluateLayout({
      clientWidth: 390,
      h1Rect: { height: 0, width: 0 },
      mainRect: { height: 900, width: 390 },
      scrollWidth: 400,
    }),
    {
      blocking: true,
      h1Visible: false,
      horizontalOverflowPx: 10,
      mainVisible: true,
    },
  );
});

test("loopback policy allows only local HTTP browser requests", () => {
  for (const url of [
    "http://127.0.0.1:3000/en",
    "http://localhost:3000/tr",
    "http://[::1]:3000/en/product",
    "data:text/plain,hello",
    "about:blank",
  ]) {
    assert.equal(isLoopbackUrl(url), true, url);
  }

  for (const url of [
    "https://sismosmart.com/en",
    "https://www.googletagmanager.com/gtag/js",
    "http://192.0.2.1:3000/en",
  ]) {
    assert.equal(isLoopbackUrl(url), false, url);
  }
});

test("forwarding summary retains only expected non-sensitive evidence", () => {
  assert.deepEqual(
    summarizeForwardRequest({
      authorization: "Bearer browser-test-token",
      contentType: "application/json; charset=utf-8",
      expectedToken: "browser-test-token",
      payload: {
        consent: true,
        email: "browser-contact@example.com",
        locale: "en",
        message: "Synthetic browser message for local mock validation only.",
        name: "Browser Test",
        path: "/en/contact",
        source: "contact-page",
        utm_source: "ci",
      },
      route: "contact",
    }),
    {
      authorizationMatches: true,
      contentTypeMatches: true,
      locale: "en",
      pagePath: "/en/contact",
      route: "contact",
      source: "contact-page",
      utmSource: "ci",
    },
  );
});

test("browser result sanitizer removes infrastructure and raw request material recursively", () => {
  assert.deepEqual(
    sanitizeBrowserResult({
      browserExecutable: "/tmp/chrome",
      childProcess: { pid: 123 },
      endpoint: "http://127.0.0.1:3333/contact",
      nested: {
        authorization: "Bearer secret",
        cookie: "private",
        ok: true,
        payload: { email: "person@example.com" },
        rawBody: "private",
      },
      ok: true,
      token: "secret",
    }),
    {
      nested: { ok: true },
      ok: true,
    },
  );
});

test("browser executable candidates prioritize explicit paths and pin the repository cache", () => {
  const candidates = getBrowserExecutableCandidates({
    cacheDir: "/repo/.cache/puppeteer",
    env: {
      CHROME_PATH: "/custom/chrome",
      PUPPETEER_EXECUTABLE_PATH: "/custom/headless-shell",
    },
    platform: "linux",
  });

  assert.equal(candidates[0], "/custom/headless-shell");
  assert.equal(candidates[1], "/custom/chrome");
  assert.ok(
    candidates.some(
      (candidate) =>
        candidate.includes("/repo/.cache/puppeteer") &&
        candidate.includes("150.0.7871.24"),
    ),
  );
  assert.ok(candidates.includes("/usr/bin/google-chrome"));
});

test("safe browser summary exposes scenario evidence without paths or payloads", () => {
  const summary = formatBrowserSafeSummary({
    blockedExternalHosts: ["www.googletagmanager.com"],
    browserExecutable: "/repo/.cache/puppeteer/chrome",
    failures: [{ key: "en-home", message: "serious accessibility violation" }],
    forwarding: [
      {
        authorizationMatches: true,
        contentTypeMatches: true,
        locale: "en",
        pagePath: "/en/contact",
        route: "contact",
        source: "contact-page",
        utmSource: "ci",
      },
    ],
    ok: false,
    rawPayload: { email: "private@example.com" },
    scenarios: [{ key: "en-home", blockingAxeCount: 1, duplicateIds: [] }],
  });

  assert.match(summary, /^BROWSER_QUALITY_SAFE /);
  assert.match(summary, /"ok":false/);
  assert.match(summary, /"key":"en-home"/);
  assert.match(summary, /"route":"contact"/);
  assert.equal(summary.includes("/repo/.cache"), false);
  assert.equal(summary.includes("private@example.com"), false);
});

test("port collision detection is narrow and retry-safe", () => {
  assert.equal(isAddressInUseFailure("listen EADDRINUSE: address already in use"), true);
  assert.equal(isAddressInUseFailure(new Error("EADDRINUSE on 127.0.0.1")), true);
  assert.equal(isAddressInUseFailure("Next readiness timed out"), false);
});
