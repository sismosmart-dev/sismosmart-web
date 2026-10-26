import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sanitizeBrowserResult } from "./browser-quality-lib.mjs";

const DEFAULT_PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const DEFAULT_ARTIFACT_ROOT = path.join(
  DEFAULT_PROJECT_ROOT,
  ".artifacts",
  "browser-quality",
);

export function formatBrowserSafeSummary(report) {
  const safe = sanitizeBrowserResult({
    blockedExternalHosts: report?.blockedExternalHosts || [],
    failures: (report?.failures || []).map((failure) => ({
      key: failure.key,
      message: failure.message,
    })),
    forwarding: report?.forwarding || [],
    ok: Boolean(report?.ok),
    scenarios: (report?.scenarios || []).map((scenario) => ({
      blockingAxeCount: scenario.blockingAxeCount || 0,
      duplicateIds: scenario.duplicateIds || [],
      key: scenario.key,
      layout: scenario.layout || null,
      locale: scenario.locale || null,
      path: scenario.path || null,
      status: scenario.status ?? null,
      viewport: scenario.viewport || null,
    })),
  });
  return `BROWSER_QUALITY_SAFE ${JSON.stringify(safe)}`;
}

export async function publishBrowserQualityReport(
  report,
  {
    artifactRoot = DEFAULT_ARTIFACT_ROOT,
    fsImpl = fs,
    logger = console.log,
    pathImpl = path,
    projectRoot = DEFAULT_PROJECT_ROOT,
  } = {},
) {
  await fsImpl.mkdir(artifactRoot, { recursive: true });
  const outputPath = pathImpl.join(artifactRoot, "result.json");
  await fsImpl.writeFile(
    outputPath,
    `${JSON.stringify(sanitizeBrowserResult(report), null, 2)}\n`,
    { mode: 0o600 },
  );
  await fsImpl.chmod(outputPath, 0o600);

  logger(formatBrowserSafeSummary(report));
  logger(`Browser quality report: ${pathImpl.relative(projectRoot, outputPath)}`);
  return outputPath;
}
