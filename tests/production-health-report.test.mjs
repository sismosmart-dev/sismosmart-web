import assert from "node:assert/strict";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  escapeWorkflowCommandValue,
  formatProductionHealthMarkdown,
  formatSafeLogSummary,
  writeProductionHealthReport,
} from "../scripts/ops/production-health-report.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readText(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), "utf8");
}

function sampleReport() {
  return {
    blocking: false,
    capacity: {
      blocking: false,
      filesystem: { severity: "ok", value: 21 },
      quota: { severity: "warning", usagePercent: 81 },
      releaseBytes: 1234,
      releaseCount: 6,
    },
    classification: "healthy-with-warnings",
    dns: { ok: true },
    forms: {
      access: { contact: { "2xx": 3 }, waitlist: { "2xx": 2 } },
      ok: true,
    },
    origin: { ok: true, routes: [] },
    public: { ok: true, routes: [] },
    release: { mismatches: [], ok: true },
    warnings: ["public warm TTFB is 1.25s\nreview"],
    workflows: { blocking: false },
  };
}

test("production health runtime delegates reporting to a focused module", () => {
  const runtime = readText("scripts/ops/production-health.mjs");
  const reporting = readText("scripts/ops/production-health-report.mjs");

  for (const exported of [
    "escapeWorkflowCommandValue",
    "formatProductionHealthMarkdown",
    "formatSafeLogSummary",
    "writeProductionHealthReport",
  ]) {
    assert.match(reporting, new RegExp(`export (?:async )?function ${exported}`));
  }

  assert.match(runtime, /import \{ writeProductionHealthReport \}/);
  assert.match(runtime, /export \{ formatSafeLogSummary \}/);
  assert.doesNotMatch(runtime, /fs\.(?:appendFile|chmod|mkdir|writeFile)/);
  assert.doesNotMatch(runtime, /PRODUCTION_HEALTH_SAFE/);
});

test("safe log and Markdown summaries preserve actionable evidence", () => {
  const report = sampleReport();
  report.release.privatePath = "PRIVATE_PATH_SENTINEL";
  report.public.routes = [
    {
      cold: { address: "TEST_ADDRESS_SENTINEL", ok: false, status: 523 },
      key: "en",
      warm: { ok: true, status: 200 },
    },
  ];

  const safe = formatSafeLogSummary(report);
  assert.match(safe, /^PRODUCTION_HEALTH_SAFE /);
  assert.match(safe, /"classification":"healthy-with-warnings"/);
  assert.match(safe, /"status":523/);
  assert.doesNotMatch(safe, /PRIVATE_PATH_SENTINEL/);
  assert.doesNotMatch(safe, /TEST_ADDRESS_SENTINEL/);

  const markdown = formatProductionHealthMarkdown(report);
  assert.match(markdown, /^## Production health/m);
  assert.match(markdown, /Classification: \*\*healthy-with-warnings\*\*/);
  assert.match(markdown, /Blocking: \*\*no\*\*/);
  assert.match(markdown, /DNS: healthy/);
  assert.match(markdown, /Public edge: healthy/);
  assert.match(markdown, /Origin\/Passenger: healthy/);
  assert.match(markdown, /Release state: consistent/);
  assert.match(markdown, /Capacity critical: no/);
  assert.match(markdown, /Repeated workflow failures: no/);
  assert.match(markdown, /### Warnings/);
  assert.match(markdown, /public warm TTFB/);
  assert.ok(markdown.endsWith("\n"));
});

test("workflow command escaping protects GitHub annotation boundaries", () => {
  assert.equal(
    escapeWorkflowCommandValue("load 100%\r\nreview"),
    "load 100%25%0D%0Areview",
  );
});

test("report writer preserves private artifact and console behavior", async () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "production-health-report-"));
  const outputPath = path.join(directory, "nested", "report.json");
  const summaryPath = path.join(directory, "summary.md");
  const logs = [];
  writeFileSync(summaryPath, "before\n");

  try {
    const report = sampleReport();
    await writeProductionHealthReport(report, {
      env: {
        GITHUB_STEP_SUMMARY: summaryPath,
        PRODUCTION_HEALTH_OUTPUT: outputPath,
      },
      logger: (line) => logs.push(line),
    });

    const raw = readFileSync(outputPath, "utf8");
    assert.ok(raw.endsWith("\n"));
    assert.deepEqual(JSON.parse(raw), report);
    assert.equal(statSync(outputPath).mode & 0o777, 0o600);

    const summary = readFileSync(summaryPath, "utf8");
    assert.match(summary, /^before\n## Production health/m);
    assert.match(summary, /healthy-with-warnings/);

    assert.equal(
      logs[0],
      "::warning title=Production health::public warm TTFB is 1.25s%0Areview",
    );
    assert.equal(
      logs[1],
      "PRODUCTION_HEALTH classification=healthy-with-warnings blocking=false warnings=1",
    );
    assert.match(logs[2], /^PRODUCTION_HEALTH_SAFE /);
    assert.equal(logs[3], `Production health report: ${outputPath}`);
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("safe log includes only allowlisted capacity diagnostic fields", () => {
  const report = sampleReport();
  report.capacity.diagnostics = {
    categories: { apps: 400, logs: 500, other: 100, privateName: 9000 },
    filesystemAvailableBytes: 300,
    filesystemTotalBytes: 10000,
    filesystemUsedBytes: 9700,
    homeBytes: 1000,
    privatePath: "/home/private",
  };

  const safe = formatSafeLogSummary(report);
  assert.match(safe, /"diagnostics":/);
  assert.match(safe, /"homeBytes":1000/);
  assert.match(safe, /"apps":400/);
  assert.match(safe, /"other":100/);
  assert.doesNotMatch(safe, /privateName/);
  assert.doesNotMatch(safe, /privatePath/);
  assert.doesNotMatch(safe, /home\/private/);
});

test("safe log allowlists cPanel diagnostic classes", () => {
  const report = sampleReport();
  report.capacity.diagnostics = {
    categories: {},
    cpanel: {
      quota: "TLS_HOSTNAME_MISMATCH",
      resources: "HTTP_4XX",
      privateDetail: "PRIVATE_PROVIDER_DETAIL",
    },
  };

  const safe = formatSafeLogSummary(report);
  assert.match(safe, /"cpanel":\{"quota":"TLS_HOSTNAME_MISMATCH","resources":"HTTP_4XX"\}/);
  assert.doesNotMatch(safe, /PRIVATE_PROVIDER_DETAIL/);
  assert.doesNotMatch(safe, /privateDetail/);
});
