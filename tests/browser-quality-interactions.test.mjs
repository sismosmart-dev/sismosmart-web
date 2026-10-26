import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  clickVisibleLink,
  runConsentScenario,
  runNavigationScenario,
} from "../scripts/test/browser-quality-interactions.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readText(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), "utf8");
}

test("browser runner delegates navigation and consent interactions", () => {
  const runner = readText("scripts/test/browser-quality.mjs");
  const interactions = readText("scripts/test/browser-quality-interactions.mjs");

  assert.match(interactions, /export async function clickVisibleLink/);
  assert.match(interactions, /export async function runNavigationScenario/);
  assert.match(interactions, /export async function runConsentScenario/);
  assert.match(runner, /from "\.\/browser-quality-interactions\.mjs"/);
  assert.doesNotMatch(runner, /async function clickVisibleLink/);
  assert.doesNotMatch(runner, /async function runNavigationScenario/);
  assert.doesNotMatch(runner, /async function runConsentScenario/);
  assert.doesNotMatch(runner, /sismosmart_cookie_consent/);
});

test("visible-link helper preserves target evaluation and missing-link guidance", async () => {
  const calls = [];
  const page = {
    evaluate: async (callback, href) => {
      calls.push([callback.toString(), href]);
      return true;
    },
  };

  await clickVisibleLink(page, "/en/product");
  assert.equal(calls.length, 1);
  assert.equal(calls[0][1], "/en/product");
  assert.match(calls[0][0], /getBoundingClientRect/);
  assert.match(calls[0][0], /visibility/);
  assert.match(calls[0][0], /link\.click/);

  await assert.rejects(
    () => clickVisibleLink({ evaluate: async () => false }, "/missing"),
    new Error("Visible navigation link not found for /missing."),
  );
});

test("navigation scenario preserves paths, wait budget, success evidence, and cleanup", async () => {
  const calls = [];
  const page = {
    $eval: async (selector) => {
      calls.push(["eval", selector]);
      return "/tr/product";
    },
    close: async () => calls.push(["close"]),
    goto: async (url, options) => calls.push(["goto", url, options]),
    url: () => "http://127.0.0.1:3000/en/product",
    waitForFunction: async (_callback, options) =>
      calls.push(["wait", options]),
    waitForSelector: async (selector, options) =>
      calls.push(["wait-selector", selector, options]),
  };

  const result = await runNavigationScenario({
    baseUrl: "http://127.0.0.1:3000",
    blockedExternalHosts: new Set(),
    browser: {},
    clickVisibleLinkImpl: async (_page, href) => calls.push(["click", href]),
    preparePageImpl: async (_browser, _blocked, viewport) => {
      calls.push(["prepare", viewport]);
      return page;
    },
  });

  assert.deepEqual(result, {
    key: "navigation",
    locale: "en",
    path: "/en/product",
    status: 200,
  });
  assert.deepEqual(calls, [
    ["prepare", { height: 900, width: 1440 }],
    [
      "goto",
      "http://127.0.0.1:3000/en",
      { waitUntil: "domcontentloaded" },
    ],
    ["wait", { timeout: 15_000 }],
    ["click", "/en/product"],
    [
      "wait-selector",
      '[data-locale-switch="tr"]',
      { timeout: 15_000 },
    ],
    ["eval", '[data-locale-switch="tr"]'],
    ["close"],
  ]);
});

test("navigation mismatch preserves diagnostic, screenshot attempt, and cleanup", async () => {
  const calls = [];
  const page = {
    close: async () => calls.push("close"),
    goto: async () => {},
    url: () => "http://127.0.0.1:3000/en/technology",
    waitForFunction: async () => {},
  };

  await assert.rejects(
    () =>
      runNavigationScenario({
        baseUrl: "http://127.0.0.1:3000",
        blockedExternalHosts: new Set(),
        browser: {},
        clickVisibleLinkImpl: async () => {},
        preparePageImpl: async () => page,
        screenshotFailureImpl: async (_page, key) => calls.push(["shot", key]),
      }),
    new Error("Navigation ended at /en/technology."),
  );
  assert.deepEqual(calls, [["shot", "navigation"], "close"]);
});

test("consent scenario preserves necessary-only persistence, reset, and cleanup", async () => {
  const calls = [];
  const evaluationResults = [undefined, "necessary", null];
  const page = {
    $eval: async (selector) => {
      calls.push(["eval", selector]);
      return true;
    },
    click: async (selector) => calls.push(["click", selector]),
    close: async () => calls.push(["close"]),
    evaluate: async (_callback, key) => {
      calls.push(["storage", key]);
      return evaluationResults.shift();
    },
    goto: async (url, options) => calls.push(["goto", url, options]),
    reload: async (options) => calls.push(["reload", options]),
    waitForSelector: async (selector, options) =>
      calls.push(["wait", selector, options]),
  };

  const result = await runConsentScenario({
    baseUrl: "http://127.0.0.1:3000",
    blockedExternalHosts: new Set(),
    browser: {},
    preparePageImpl: async (_browser, _blocked, viewport) => {
      calls.push(["prepare", viewport]);
      return page;
    },
  });

  assert.deepEqual(result, {
    key: "consent",
    locale: "en",
    path: "/en",
    status: 200,
  });
  assert.deepEqual(calls, [
    ["prepare", { height: 900, width: 1440 }],
    [
      "goto",
      "http://127.0.0.1:3000/en",
      { waitUntil: "domcontentloaded" },
    ],
    ["storage", "sismosmart_cookie_consent"],
    ["reload", { waitUntil: "domcontentloaded" }],
    ["wait", "[data-cookie-consent]", { visible: true }],
    ["click", '[data-cookie-choice="necessary"]'],
    ["storage", "sismosmart_cookie_consent"],
    ["eval", "[data-cookie-consent]"],
    ["click", "[data-cookie-reset]"],
    ["wait", "[data-cookie-consent]", { visible: true }],
    ["storage", "sismosmart_cookie_consent"],
    ["close"],
  ]);
});

test("consent failure preserves error, screenshot attempt, and cleanup", async () => {
  const calls = [];
  const evaluationResults = [undefined, "analytics"];
  const page = {
    $eval: async () => false,
    click: async () => {},
    close: async () => calls.push("close"),
    evaluate: async () => evaluationResults.shift(),
    goto: async () => {},
    reload: async () => {},
    waitForSelector: async () => {},
  };

  await assert.rejects(
    () =>
      runConsentScenario({
        baseUrl: "http://127.0.0.1:3000",
        blockedExternalHosts: new Set(),
        browser: {},
        preparePageImpl: async () => page,
        screenshotFailureImpl: async (_page, key) => calls.push(["shot", key]),
      }),
    new Error("Necessary-only consent choice was not persisted and hidden."),
  );
  assert.deepEqual(calls, [["shot", "consent"], "close"]);
});
