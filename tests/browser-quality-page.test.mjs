import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  collectPageQuality,
  preparePage,
  runPageScenario,
  screenshotFailure,
} from "../scripts/test/browser-quality-page.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readText(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), "utf8");
}

test("browser runner delegates reusable page quality to a focused module", () => {
  const runner = readText("scripts/test/browser-quality.mjs");
  const pageModule = readText("scripts/test/browser-quality-page.mjs");

  assert.match(pageModule, /export async function preparePage/);
  assert.match(pageModule, /export async function collectPageQuality/);
  assert.match(pageModule, /export async function screenshotFailure/);
  assert.match(pageModule, /export async function runPageScenario/);
  assert.match(runner, /from "\.\/browser-quality-page\.mjs"/);
  assert.doesNotMatch(runner, /setRequestInterception/);
  assert.doesNotMatch(runner, /globalThis\.axe\.run/);
  assert.doesNotMatch(runner, /fullPage: true/);
  assert.doesNotMatch(runner, /async function runPageScenario/);
});

test("page preparation preserves deterministic setup and request isolation", async () => {
  const calls = [];
  let requestHandler = null;
  const page = {
    emulateMediaFeatures: async (features) => calls.push(["media", features]),
    on: (event, handler) => {
      calls.push(["on", event]);
      requestHandler = handler;
    },
    setBypassCSP: async (value) => calls.push(["csp", value]),
    setCacheEnabled: async (value) => calls.push(["cache", value]),
    setRequestInterception: async (value) => calls.push(["interception", value]),
    setViewport: async (value) => calls.push(["viewport", value]),
  };
  const browser = { newPage: async () => page };
  const blocked = new Set();
  const viewport = { height: 844, isMobile: true, width: 390 };

  assert.equal(await preparePage(browser, blocked, viewport), page);
  assert.deepEqual(calls, [
    ["csp", true],
    ["media", [{ name: "prefers-reduced-motion", value: "reduce" }]],
    ["cache", false],
    ["viewport", viewport],
    ["interception", true],
    ["on", "request"],
  ]);

  const request = (url) => {
    const actions = [];
    requestHandler({
      abort: async (reason) => actions.push(["abort", reason]),
      continue: async () => actions.push(["continue"]),
      url: () => url,
    });
    return actions;
  };

  assert.deepEqual(request("http://127.0.0.1:3000/en"), [["continue"]]);
  assert.deepEqual(request("https://assets.example.test/app.js"), [
    ["abort", "blockedbyclient"],
  ]);
  assert.deepEqual(request("not a valid url"), [["abort", "blockedbyclient"]]);
  assert.deepEqual([...blocked], [
    "assets.example.test",
    "unparseable-external-request",
  ]);
});

test("page quality collection preserves DOM, axe, duplicate, and layout evidence", async () => {
  const evaluations = [
    {
      clientWidth: 390,
      h1Rect: { height: 48, width: 320 },
      ids: ["brand", "content", "brand"],
      lang: "en",
      mainRect: { height: 900, width: 390 },
      scrollWidth: 395,
    },
    {
      violations: [
        { id: "minor", impact: "minor", nodes: [{}] },
        {
          id: "serious",
          impact: "serious",
          nodes: [{ target: ["main", "button"] }],
        },
      ],
    },
  ];
  const scripts = [];
  const page = {
    addScriptTag: async (options) => scripts.push(options),
    evaluate: async () => evaluations.shift(),
  };

  const quality = await collectPageQuality(page, "synthetic axe source");
  assert.deepEqual(scripts, [{ content: "synthetic axe source" }]);
  assert.deepEqual(quality, {
    blockingAxe: [
      {
        help: "",
        id: "serious",
        impact: "serious",
        nodeCount: 1,
        targets: ["main button"],
      },
    ],
    duplicateIds: [{ count: 2, id: "brand" }],
    lang: "en",
    layout: {
      blocking: true,
      h1Visible: true,
      horizontalOverflowPx: 5,
      mainVisible: true,
    },
    totalAxeViolations: 2,
  });
});

test("failure screenshots preserve private artifact naming and full-page capture", async () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "browser-page-shot-"));
  const screenshots = [];
  try {
    await screenshotFailure(
      { screenshot: async (options) => screenshots.push(options) },
      "EN home / unsafe?",
      { artifactRoot: directory },
    );
    assert.equal(screenshots.length, 1);
    assert.equal(screenshots[0].fullPage, true);
    assert.equal(path.dirname(screenshots[0].path), directory);
    assert.equal(path.basename(screenshots[0].path), "EN-home---unsafe-.png");
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("route scenario preserves success evidence and page cleanup", async () => {
  const calls = [];
  const page = {
    close: async () => calls.push("close"),
    evaluate: async () => calls.push("fonts"),
    goto: async (url, options) => {
      calls.push(["goto", url, options]);
      return { status: () => 200 };
    },
  };
  const result = await runPageScenario({
    axeSource: "axe",
    baseUrl: "http://127.0.0.1:3000",
    blockedExternalHosts: new Set(),
    browser: {},
    collectPageQualityImpl: async () => ({
      blockingAxe: [],
      duplicateIds: [],
      lang: "en",
      layout: {
        blocking: false,
        h1Visible: true,
        horizontalOverflowPx: 0,
        mainVisible: true,
      },
      totalAxeViolations: 1,
    }),
    key: "en-home-desktop",
    locale: "en",
    preparePageImpl: async () => page,
    routePath: "/en",
    viewport: { height: 900, width: 1440 },
  });

  assert.deepEqual(result, {
    blockingAxeCount: 0,
    duplicateIds: [],
    key: "en-home-desktop",
    layout: {
      blocking: false,
      h1Visible: true,
      horizontalOverflowPx: 0,
      mainVisible: true,
    },
    locale: "en",
    path: "/en",
    status: 200,
    totalAxeViolations: 1,
    viewport: "1440x900",
  });
  assert.deepEqual(calls, [
    [
      "goto",
      "http://127.0.0.1:3000/en",
      { timeout: 30_000, waitUntil: "domcontentloaded" },
    ],
    "fonts",
    "close",
  ]);
});

test("blocking route scenario preserves diagnostics, screenshot attempt, and cleanup", async () => {
  const calls = [];
  const page = {
    close: async () => calls.push("close"),
    evaluate: async () => {},
    goto: async () => ({ status: () => 503 }),
  };

  await assert.rejects(
    () =>
      runPageScenario({
        axeSource: "axe",
        baseUrl: "http://127.0.0.1:3000",
        blockedExternalHosts: new Set(),
        browser: {},
        collectPageQualityImpl: async () => ({
          blockingAxe: [
            { id: "color-contrast", targets: ["main button"] },
          ],
          duplicateIds: [{ count: 2, id: "brand" }],
          lang: "tr",
          layout: {
            blocking: true,
            h1Visible: true,
            horizontalOverflowPx: 12,
            mainVisible: true,
          },
          totalAxeViolations: 1,
        }),
        key: "en-home-desktop",
        locale: "en",
        preparePageImpl: async () => page,
        routePath: "/en",
        screenshotFailureImpl: async (_page, key) => calls.push(["shot", key]),
        viewport: { height: 900, width: 1440 },
      }),
    /status=503 lang=tr axe=1:color-contrast axeTargets=main button duplicateIds=1 overflow=12/,
  );
  assert.deepEqual(calls, [["shot", "en-home-desktop"], "close"]);
});
