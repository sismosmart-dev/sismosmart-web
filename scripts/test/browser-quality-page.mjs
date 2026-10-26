import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  evaluateLayout,
  filterBlockingAxeViolations,
  findDuplicateIds,
  isLoopbackUrl,
} from "./browser-quality-lib.mjs";

const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const ARTIFACT_ROOT = path.join(PROJECT_ROOT, ".artifacts", "browser-quality");

export async function preparePage(browser, blockedExternalHosts, viewport) {
  const page = await browser.newPage();
  await page.setBypassCSP(true);
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await page.setCacheEnabled(false);
  await page.setViewport(viewport);
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const url = request.url();
    if (isLoopbackUrl(url)) {
      request.continue().catch(() => {});
      return;
    }
    try {
      blockedExternalHosts.add(new URL(url).hostname);
    } catch {
      blockedExternalHosts.add("unparseable-external-request");
    }
    request.abort("blockedbyclient").catch(() => {});
  });
  return page;
}

export async function collectPageQuality(page, axeSource) {
  const pageState = await page.evaluate(() => {
    const main = document.querySelector("main#content");
    const h1 = document.querySelector("h1");
    const mainRect = main?.getBoundingClientRect();
    const h1Rect = h1?.getBoundingClientRect();
    return {
      clientWidth: document.documentElement.clientWidth,
      h1Rect: h1Rect
        ? { height: h1Rect.height, width: h1Rect.width }
        : { height: 0, width: 0 },
      ids: [...document.querySelectorAll("[id]")].map((element) => element.id),
      lang: document.documentElement.lang,
      mainRect: mainRect
        ? { height: mainRect.height, width: mainRect.width }
        : { height: 0, width: 0 },
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
  await page.addScriptTag({ content: axeSource });
  const axe = await page.evaluate(async () =>
    globalThis.axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
      },
    }),
  );
  const blockingAxe = filterBlockingAxeViolations(axe.violations);
  const duplicateIds = findDuplicateIds(pageState.ids);
  const layout = evaluateLayout(pageState);
  return {
    blockingAxe,
    duplicateIds,
    lang: pageState.lang,
    layout,
    totalAxeViolations: axe.violations.length,
  };
}

export async function screenshotFailure(
  page,
  key,
  { artifactRoot = ARTIFACT_ROOT } = {},
) {
  await fs.mkdir(artifactRoot, { recursive: true });
  const safeKey = key.replace(/[^a-z0-9_-]/gi, "-");
  await page.screenshot({
    fullPage: true,
    path: path.join(artifactRoot, `${safeKey}.png`),
  });
}

export async function runPageScenario({
  axeSource,
  baseUrl,
  blockedExternalHosts,
  browser,
  collectPageQualityImpl = collectPageQuality,
  key,
  locale,
  preparePageImpl = preparePage,
  routePath,
  screenshotFailureImpl = screenshotFailure,
  viewport,
}) {
  const page = await preparePageImpl(browser, blockedExternalHosts, viewport);
  try {
    const response = await page.goto(`${baseUrl}${routePath}`, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready;
    });
    const quality = await collectPageQualityImpl(page, axeSource);
    const status = response?.status() ?? null;
    const blocking =
      status !== 200 ||
      quality.lang !== locale ||
      quality.blockingAxe.length > 0 ||
      quality.duplicateIds.length > 0 ||
      quality.layout.blocking;
    if (blocking) {
      throw new Error(
        `status=${status} lang=${quality.lang} axe=${quality.blockingAxe.length}:${quality.blockingAxe.map((item) => item.id).join(",") || "none"} axeTargets=${quality.blockingAxe.flatMap((item) => item.targets || []).join("|") || "none"} duplicateIds=${quality.duplicateIds.length} overflow=${quality.layout.horizontalOverflowPx}`,
      );
    }
    return {
      blockingAxeCount: 0,
      duplicateIds: [],
      key,
      layout: quality.layout,
      locale,
      path: routePath,
      status,
      totalAxeViolations: quality.totalAxeViolations,
      viewport: `${viewport.width}x${viewport.height}`,
    };
  } catch (error) {
    await screenshotFailureImpl(page, key).catch(() => {});
    throw error;
  } finally {
    await page.close();
  }
}
