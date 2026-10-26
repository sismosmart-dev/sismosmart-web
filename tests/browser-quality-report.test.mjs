import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  formatBrowserSafeSummary,
  publishBrowserQualityReport,
} from "../scripts/test/browser-quality-report.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readText(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), "utf8");
}

function sampleReport() {
  return {
    blockedExternalHosts: ["example.invalid"],
    browserExecutable: "PRIVATE_BROWSER_PATH_SENTINEL",
    browserRevision: "test-revision",
    failures: [{ key: "en-home", message: "synthetic failure" }],
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
    generatedAt: "2026-07-23T00:00:00.000Z",
    ok: false,
    rawPayload: { email: "PRIVATE_EMAIL_SENTINEL" },
    scenarios: [
      {
        blockingAxeCount: 1,
        duplicateIds: [],
        key: "en-home",
        layout: { blocking: true, horizontalOverflowPx: 0 },
        locale: "en",
        path: "/en",
        status: 200,
        viewport: "1440x900",
      },
    ],
    schemaVersion: 1,
  };
}

test("browser runner delegates publication to a focused report module", () => {
  const runner = readText("scripts/test/browser-quality.mjs");
  const reporting = readText("scripts/test/browser-quality-report.mjs");

  assert.match(reporting, /export function formatBrowserSafeSummary/);
  assert.match(reporting, /export async function publishBrowserQualityReport/);
  assert.match(runner, /import \{ publishBrowserQualityReport \}/);
  assert.match(runner, /export \{ formatBrowserSafeSummary \}/);
  assert.doesNotMatch(runner, /fs\.(?:chmod|writeFile)/);
  assert.doesNotMatch(runner, /result\.json/);
  assert.doesNotMatch(runner, /BROWSER_QUALITY_SAFE/);
});

test("browser report publisher preserves private artifact and console behavior", async () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "browser-quality-report-"));
  const artifactRoot = path.join(directory, ".artifacts", "browser-quality");
  const logs = [];

  try {
    const report = sampleReport();
    const outputPath = await publishBrowserQualityReport(report, {
      artifactRoot,
      logger: (line) => logs.push(line),
      projectRoot: directory,
    });

    assert.equal(outputPath, path.join(artifactRoot, "result.json"));
    const raw = readFileSync(outputPath, "utf8");
    assert.ok(raw.endsWith("\n"));
    const persisted = JSON.parse(raw);
    assert.equal(persisted.ok, false);
    assert.equal(persisted.browserExecutable, undefined);
    assert.equal(persisted.rawPayload, undefined);
    assert.equal(statSync(outputPath).mode & 0o777, 0o600);

    assert.equal(logs.length, 2);
    assert.match(logs[0], /^BROWSER_QUALITY_SAFE /);
    assert.match(logs[0], /"key":"en-home"/);
    assert.doesNotMatch(logs[0], /PRIVATE_BROWSER_PATH_SENTINEL/);
    assert.doesNotMatch(logs[0], /PRIVATE_EMAIL_SENTINEL/);
    assert.equal(
      logs[1],
      "Browser quality report: .artifacts/browser-quality/result.json",
    );
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("safe summary remains available from the focused module", () => {
  const summary = formatBrowserSafeSummary(sampleReport());
  assert.match(summary, /^BROWSER_QUALITY_SAFE /);
  assert.match(summary, /"ok":false/);
  assert.match(summary, /"route":"contact"/);
  assert.doesNotMatch(summary, /PRIVATE_BROWSER_PATH_SENTINEL/);
  assert.doesNotMatch(summary, /PRIVATE_EMAIL_SENTINEL/);
});
