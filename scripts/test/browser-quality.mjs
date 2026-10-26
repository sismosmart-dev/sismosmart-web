import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

import {
  browserQualityRoutes,
  sanitizeBrowserResult,
} from "./browser-quality-lib.mjs";

import {
  browserQualityRevision,
  resolveBrowserExecutable,
} from "./browser-quality-executable.mjs";
export {
  browserQualityRevision,
  getBrowserExecutableCandidates,
  resolveBrowserExecutable,
} from "./browser-quality-executable.mjs";
import {
  safeFailureMessage,
  startMockReceiver,
  startNextServer,
} from "./browser-quality-server.mjs";
export { isAddressInUseFailure } from "./browser-quality-server.mjs";
import { runPageScenario } from "./browser-quality-page.mjs";
import { runFormScenarios } from "./browser-quality-forms.mjs";
import {
  runConsentScenario,
  runNavigationScenario,
} from "./browser-quality-interactions.mjs";
import { publishBrowserQualityReport } from "./browser-quality-report.mjs";
export { formatBrowserSafeSummary } from "./browser-quality-report.mjs";

const require = createRequire(import.meta.url);
const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

async function readAxeSource() {
  const axePath = require.resolve("axe-core/axe.min.js");
  return fs.readFile(axePath, "utf8");
}

export async function runBrowserQuality() {
  await fs.access(path.join(PROJECT_ROOT, ".next", "BUILD_ID"));
  const browserExecutable = await resolveBrowserExecutable();
  const axeSource = await readAxeSource();
  const mock = await startMockReceiver();
  let app = null;
  let browser = null;
  const blockedExternalHosts = new Set();
  const scenarios = [];
  const failures = [];

  try {
    app = await startNextServer(mock.baseUrl);
    browser = await puppeteer.launch({
      args: ["--disable-dev-shm-usage", "--no-sandbox"],
      executablePath: browserExecutable,
      headless: true,
    });

    const desktop = { height: 900, width: 1440 };
    const mobile = { height: 844, isMobile: true, width: 390 };
    for (const route of browserQualityRoutes) {
      try {
        scenarios.push(
          await runPageScenario({
            axeSource,
            baseUrl: app.baseUrl,
            blockedExternalHosts,
            browser,
            key: `${route.key}-desktop`,
            locale: route.locale,
            routePath: route.path,
            viewport: desktop,
          }),
        );
      } catch (error) {
        failures.push({
          key: `${route.key}-desktop`,
          message: safeFailureMessage(error),
        });
      }
    }
    for (const route of browserQualityRoutes.filter((item) =>
      ["en-home", "tr-product"].includes(item.key),
    )) {
      try {
        scenarios.push(
          await runPageScenario({
            axeSource,
            baseUrl: app.baseUrl,
            blockedExternalHosts,
            browser,
            key: `${route.key}-mobile`,
            locale: route.locale,
            routePath: route.path,
            viewport: mobile,
          }),
        );
      } catch (error) {
        failures.push({
          key: `${route.key}-mobile`,
          message: safeFailureMessage(error),
        });
      }
    }

    for (const [key, task] of [
      [
        "navigation",
        () =>
          runNavigationScenario({
            baseUrl: app.baseUrl,
            blockedExternalHosts,
            browser,
          }),
      ],
      [
        "consent",
        () =>
          runConsentScenario({
            baseUrl: app.baseUrl,
            blockedExternalHosts,
            browser,
          }),
      ],
      [
        "forms",
        () =>
          runFormScenarios({
            baseUrl: app.baseUrl,
            blockedExternalHosts,
            browser,
            records: mock.records,
          }),
      ],
    ]) {
      try {
        const result = await task();
        scenarios.push(...(Array.isArray(result) ? result : [result]));
      } catch (error) {
        failures.push({ key, message: safeFailureMessage(error) });
      }
    }
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (app) await app.stop().catch(() => {});
    await mock.close().catch(() => {});
  }

  const report = sanitizeBrowserResult({
    blockedExternalHosts: [...blockedExternalHosts].sort(),
    browserRevision: browserQualityRevision,
    failures,
    forwarding: mock.records,
    generatedAt: new Date().toISOString(),
    ok: failures.length === 0,
    scenarios,
    schemaVersion: 1,
  });
  await publishBrowserQualityReport(report);
  return { exitCode: report.ok ? 0 : 1, report };
}

async function main() {
  const result = await runBrowserQuality();
  process.exitCode = result.exitCode;
}

const isCli =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  main().catch((error) => {
    console.error(`Browser quality audit failed: ${safeFailureMessage(error)}`);
    process.exitCode = 1;
  });
}
