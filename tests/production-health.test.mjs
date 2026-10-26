import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  aggregateFormAccess,
  classifyHealth,
  evaluateReleaseState,
  evaluateThreshold,
  evaluateWorkflowStreak,
  normalizeQuota,
  normalizeResourceUsage,
  sanitizeReport,
} from "../scripts/ops/production-health-lib.mjs";
import {
  buildRemoteInspectionScript,
  formatSafeLogSummary,
  parseRemoteInspection,
  productionHealthPublicRoutes,
  runProductionHealth,
} from "../scripts/ops/production-health.mjs";

test("capacity thresholds distinguish ok, warning, and error values", () => {
  assert.deepEqual(
    evaluateThreshold(84, { warning: 85, critical: 95 }),
    { severity: "ok", value: 84 },
  );
  assert.deepEqual(
    evaluateThreshold(85, { warning: 85, critical: 95 }),
    { severity: "warning", value: 85 },
  );
  assert.deepEqual(
    evaluateThreshold(95, { warning: 85, critical: 95 }),
    { severity: "error", value: 95 },
  );
});

test("missing threshold measurements are explicitly unavailable", () => {
  assert.deepEqual(
    evaluateThreshold(undefined, { warning: 85, critical: 95 }),
    { severity: "unavailable", value: null },
  );
});

test("release state requires current, Passenger, htaccess, process cwd, and build id to agree", () => {
  const result = evaluateReleaseState({
    buildId: "build-1",
    current: "/releases/1",
    htaccess: "/releases/1",
    passenger: "/releases/1",
    processCwds: ["/releases/1"],
  });

  assert.deepEqual(result, { mismatches: [], ok: true });
});

test("release state reports every inconsistent pointer without exposing paths", () => {
  const result = evaluateReleaseState({
    buildId: "",
    current: "/releases/old",
    htaccess: "/releases/other",
    passenger: "/releases/new",
    processCwds: ["/releases/old"],
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.mismatches, [
    "current",
    "htaccess",
    "process-cwd",
    "build-id",
  ]);
  assert.equal(JSON.stringify(result).includes("/releases/"), false);
});

test("form access aggregation keeps status classes only", () => {
  assert.deepEqual(
    aggregateFormAccess([
      { route: "contact", status: 200 },
      { route: "contact", status: 400 },
      { route: "waitlist", status: 429 },
      { route: "waitlist", status: 502 },
      { route: "other", status: 500 },
      { route: "contact", status: "invalid" },
    ]),
    {
      clientError: 2,
      serverError: 1,
      serverErrorRate: 0.25,
      success: 1,
      total: 4,
    },
  );
});

test("cPanel quota normalization accepts byte fields and calculates usage percent", () => {
  assert.deepEqual(
    normalizeQuota({
      data: {
        byte_limit: 10_000,
        byte_usage: 8_500,
      },
    }),
    {
      available: true,
      limitBytes: 10_000,
      usageBytes: 8_500,
      usagePercent: 85,
    },
  );
});

test("unlimited or unavailable cPanel quota remains non-blocking", () => {
  assert.deepEqual(normalizeQuota({ data: { byte_limit: 0, byte_usage: 12 } }), {
    available: false,
    limitBytes: null,
    usageBytes: 12,
    usagePercent: null,
  });
});

test("resource usage normalization keeps named usage and maximum values", () => {
  const result = normalizeResourceUsage({
    data: [
      { description: "CPU Usage", id: "cpu", maximum: 100, usage: 18 },
      { description: "I/O Usage", id: "io", maximum: "10", usage: "2" },
      { description: "Bad", id: "bad", maximum: null, usage: "not-a-number" },
    ],
  });

  assert.deepEqual(result, [
    { description: "CPU Usage", id: "cpu", maximum: 100, usage: 18 },
    { description: "I/O Usage", id: "io", maximum: 10, usage: 2 },
  ]);
});

test("two latest failed workflow runs are blocking", () => {
  assert.deepEqual(
    evaluateWorkflowStreak(
      [
        { conclusion: "failure" },
        { conclusion: "timed_out" },
        { conclusion: "success" },
      ],
      2,
    ),
    {
      blocking: true,
      consecutiveFailures: 2,
      latestConclusion: "failure",
    },
  );
});

test("a successful latest workflow run clears the failure streak", () => {
  assert.deepEqual(
    evaluateWorkflowStreak(
      [{ conclusion: "success" }, { conclusion: "failure" }],
      2,
    ),
    {
      blocking: false,
      consecutiveFailures: 0,
      latestConclusion: "success",
    },
  );
});

test("fault classification prioritizes release mismatch over network symptoms", () => {
  assert.deepEqual(
    classifyHealth({
      capacity: { blocking: true },
      dns: { ok: false },
      forms: { blocking: true },
      origin: { ok: false },
      public: { ok: false },
      release: { ok: false },
      warnings: ["slow"],
      workflows: { blocking: true },
    }),
    { blocking: true, classification: "release-state" },
  );
});

test("fault classification identifies Cloudflare edge failure when origin is healthy", () => {
  assert.deepEqual(
    classifyHealth({
      capacity: { blocking: false },
      dns: { ok: true },
      forms: { blocking: false, ok: true },
      origin: { ok: true },
      public: { ok: false },
      release: { ok: true },
      warnings: [],
      workflows: { blocking: false },
    }),
    { blocking: true, classification: "cloudflare-edge" },
  );
});

test("fault classification assigns simultaneous public and origin failure to origin-passenger", () => {
  assert.deepEqual(
    classifyHealth({
      capacity: { blocking: false },
      dns: { ok: true },
      forms: { blocking: false, ok: true },
      origin: { ok: false },
      public: { ok: false },
      release: { ok: true },
      warnings: [],
      workflows: { blocking: false },
    }),
    { blocking: true, classification: "origin-passenger" },
  );
});

test("healthy reports with non-blocking observations remain warnings", () => {
  assert.deepEqual(
    classifyHealth({
      capacity: { blocking: false },
      dns: { ok: true },
      forms: { blocking: false, ok: true },
      origin: { ok: true },
      public: { ok: true },
      release: { ok: true },
      warnings: ["public warm TTFB above baseline"],
      workflows: { blocking: false },
    }),
    { blocking: false, classification: "healthy-with-warnings" },
  );
});

test("report sanitization removes sensitive keys recursively", () => {
  const safe = sanitizeReport({
    nested: {
      originAddress: "192.0.2.10",
      rawLines: ["request with private data"],
      secretValue: "secret",
      status: "ok",
    },
    ok: true,
    sshHost: "origin.example.invalid",
    token: "credential",
  });

  assert.deepEqual(safe, {
    nested: { status: "ok" },
    ok: true,
  });
});


const runtimeConfig = {
  cpanelHost: "https://cpanel.example.invalid:2083",
  cpanelToken: "not-serialized",
  domain: "sismosmart.com",
  publicBaseUrl: "https://sismosmart.com",
  remoteAppDomain: "sismosmart.com",
  remoteAppRoot: "apps/sismosmart-web/current",
  remoteAppUri: "/",
  remoteHome: "/home/example",
  remotePublicRoot: "public_html",
  remoteReleasesRoot: "apps/sismosmart-web/releases",
  sshHost: "origin.example.invalid",
  sshUser: "example",
};

const healthyRemote = {
  buildId: "build-1",
  current: "/home/example/apps/sismosmart-web/releases/1",
  filesystemUsagePercent: 50,
  formRecords: [],
  htaccess: "/home/example/apps/sismosmart-web/releases/1",
  passenger: "/home/example/apps/sismosmart-web/releases/1",
  processCwds: ["/home/example/apps/sismosmart-web/releases/1"],
  releaseBytes: 500_000_000,
  releaseCount: 6,
};

function healthyRouteSet({ publicEdge = false, ttfbMs = 100 } = {}) {
  return {
    ok: true,
    routes: [
      {
        cold: { ok: true, status: 200, ttfbMs },
        key: "en",
        warm: {
          cloudflare: publicEdge,
          configured: true,
          ok: true,
          status: 200,
          ttfbMs,
        },
      },
      {
        cold: { ok: true, status: 200, ttfbMs },
        key: "contact",
        warm: {
          configured: true,
          ok: true,
          status: 200,
          target: "contact",
          ttfbMs,
        },
      },
      {
        cold: { ok: true, status: 200, ttfbMs },
        key: "waitlist",
        warm: {
          configured: true,
          ok: true,
          status: 200,
          target: "waitlist",
          ttfbMs,
        },
      },
    ],
  };
}

function successfulWorkflowRuns() {
  return {
    deploy: [{ conclusion: "success" }],
    lighthouse: [{ conclusion: "success" }],
    security: [{ conclusion: "success" }],
  };
}

test("runtime classifies an edge failure when origin remains healthy", async () => {
  const result = await runProductionHealth({
    config: runtimeConfig,
    inspectRemote: async () => healthyRemote,
    now: () => new Date("2026-07-20T18:00:00.000Z"),
    probeOrigin: async () => healthyRouteSet(),
    probePublic: async () => ({
      ok: false,
      routes: [
        {
          cold: { ok: false, status: 503, ttfbMs: 100 },
          key: "en",
          warm: { cloudflare: true, ok: false, status: 503, ttfbMs: 100 },
        },
      ],
    }),
    readCpanel: async () => ({
      quotaPayload: { data: { byte_limit: 10_000, byte_usage: 1_000 } },
      resourcePayload: { data: [] },
      warnings: [],
    }),
    readWorkflowRuns: async () => successfulWorkflowRuns(),
    resolveOrigin: async () => ({ address: "192.0.2.10", family: 4, ok: true }),
    resolvePublic: async () => ({ durationMs: 2, ok: true }),
  });

  assert.equal(result.exitCode, 1);
  assert.equal(result.report.classification, "cloudflare-edge");
  assert.equal(JSON.stringify(result.report).includes("192.0.2.10"), false);
  assert.equal(JSON.stringify(result.report).includes("/home/example"), false);
});

test("runtime keeps shared-host latency warning-only", async () => {
  const result = await runProductionHealth({
    config: runtimeConfig,
    inspectRemote: async () => healthyRemote,
    now: () => new Date("2026-07-20T18:00:00.000Z"),
    probeOrigin: async () => healthyRouteSet({ ttfbMs: 1_300 }),
    probePublic: async () => healthyRouteSet({ publicEdge: true, ttfbMs: 1_600 }),
    readCpanel: async () => ({
      quotaPayload: { data: { byte_limit: 10_000, byte_usage: 1_000 } },
      resourcePayload: { data: [] },
      warnings: [],
    }),
    readWorkflowRuns: async () => successfulWorkflowRuns(),
    resolveOrigin: async () => ({ address: "192.0.2.10", family: 4, ok: true }),
    resolvePublic: async () => ({ durationMs: 2, ok: true }),
  });

  assert.equal(result.exitCode, 0);
  assert.equal(result.report.classification, "healthy-with-warnings");
  assert.ok(result.report.warnings.some((warning) => warning.includes("public warm TTFB")));
  assert.ok(result.report.warnings.some((warning) => warning.includes("origin warm TTFB")));
});

test("runtime blocks critical capacity and repeated workflow failures", async () => {
  const result = await runProductionHealth({
    config: runtimeConfig,
    inspectRemote: async () => ({
      ...healthyRemote,
      filesystemUsagePercent: 96,
      releaseBytes: 2_500_000_000,
      releaseCount: 13,
    }),
    probeOrigin: async () => healthyRouteSet(),
    probePublic: async () => healthyRouteSet({ publicEdge: true }),
    readCpanel: async () => ({
      quotaPayload: { data: { byte_limit: 10_000, byte_usage: 9_500 } },
      resourcePayload: { data: [] },
      warnings: [],
    }),
    readWorkflowRuns: async () => ({
      deploy: [{ conclusion: "success" }],
      lighthouse: [{ conclusion: "failure" }, { conclusion: "timed_out" }],
      security: [{ conclusion: "success" }],
    }),
    resolveOrigin: async () => ({ address: "192.0.2.10", family: 4, ok: true }),
    resolvePublic: async () => ({ durationMs: 2, ok: true }),
  });

  assert.equal(result.exitCode, 1);
  assert.equal(result.report.classification, "capacity");
  assert.equal(result.report.capacity.blocking, true);
  assert.equal(result.report.workflows.blocking, true);
});


test("production health probes the canonical PWA manifest route", () => {
  const manifest = productionHealthPublicRoutes.find(
    (route) => route.key === "manifest",
  );

  assert.equal(manifest?.path, "/site.webmanifest");
  assert.deepEqual(manifest?.expectedStatuses, [200]);
});

test("remote inspection script keeps the domain in a shell variable", () => {
  const script = buildRemoteInspectionScript({
    config: runtimeConfig,
    htaccessPath: "/home/example/public_html/.htaccess",
    passenger: "/home/example/apps/sismosmart-web/releases/1",
    remoteAppRoot: "/home/example/apps/sismosmart-web/current",
    remoteReleasesRoot: "/home/example/apps/sismosmart-web/releases",
  });

  assert.match(script, /domain='sismosmart\.com'/);
  assert.match(script, /\$HOME\/access-logs\/\$\{domain\}-ssl_log/);
});

test("remote inspection script parses representative cPanel access logs without failing", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "production-health-"));
  const home = path.join(root, "home");
  const publicRoot = path.join(root, "public_html");
  const releasesRoot = path.join(root, "releases");
  const passenger = path.join(releasesRoot, "active");
  const current = path.join(root, "current");

  try {
    mkdirSync(path.join(passenger, ".next"), { recursive: true });
    mkdirSync(path.join(releasesRoot, "old"), { recursive: true });
    mkdirSync(publicRoot, { recursive: true });
    mkdirSync(path.join(home, "access-logs"), { recursive: true });
    symlinkSync(passenger, current);
    writeFileSync(path.join(passenger, ".next", "BUILD_ID"), "build-live\n");
    writeFileSync(
      path.join(publicRoot, ".htaccess"),
      `PassengerAppRoot "${passenger}"\n`,
    );
    writeFileSync(
      path.join(home, "access-logs", runtimeConfig.domain),
      [
        '198.51.100.10 - - [20/Jul/2026:18:00:00 +0000] "GET /api/contact HTTP/1.1" 200 42 "-" "agent"',
        '198.51.100.11 - - [20/Jul/2026:18:00:01 +0000] "POST /api/waitlist?source=test HTTP/1.1" 502 10 "-" "agent"',
        '198.51.100.12 - - [20/Jul/2026:18:00:02 +0000] "GET /en HTTP/1.1" 200 10 "-" "agent"',
        '198.51.100.13 - - [20/Jul/2026:18:00:03 +0000] "GET /api/contacted HTTP/1.1" 500 10 "-" "agent"',
      ].join("\n"),
    );

    const config = {
      ...runtimeConfig,
      remoteHome: home,
      sshUser: process.env.USER || "root",
    };
    const script = buildRemoteInspectionScript({
      config,
      htaccessPath: path.join(publicRoot, ".htaccess"),
      passenger,
      remoteAppRoot: current,
      remoteReleasesRoot: releasesRoot,
    });
    const stdout = execFileSync("bash", ["-c", script], {
      encoding: "utf8",
      env: { ...process.env, HOME: home },
    });
    const result = parseRemoteInspection(stdout, passenger);

    assert.equal(result.current, passenger);
    assert.equal(result.htaccess, passenger);
    assert.equal(result.buildId, "build-live");
    assert.equal(result.releaseCount, 2);
    assert.ok(result.releaseBytes > 0);
    assert.equal(result.formLogAvailable, true);
    assert.deepEqual(result.formRecords, [
      { route: "contact", status: 200 },
      { route: "waitlist", status: 502 },
    ]);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("remote inspection marks form logs unavailable when tail fails after discovery", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "production-health-tail-"));
  const home = path.join(root, "home");
  const publicRoot = path.join(root, "public_html");
  const releasesRoot = path.join(root, "releases");
  const passenger = path.join(releasesRoot, "active");
  const current = path.join(root, "current");
  const fakeBin = path.join(root, "bin");

  try {
    mkdirSync(path.join(passenger, ".next"), { recursive: true });
    mkdirSync(publicRoot, { recursive: true });
    mkdirSync(path.join(home, "access-logs"), { recursive: true });
    mkdirSync(fakeBin, { recursive: true });
    symlinkSync(passenger, current);
    writeFileSync(path.join(passenger, ".next", "BUILD_ID"), "build-live\n");
    writeFileSync(
      path.join(publicRoot, ".htaccess"),
      `PassengerAppRoot "${passenger}"\n`,
    );
    writeFileSync(
      path.join(home, "access-logs", runtimeConfig.domain),
      '198.51.100.10 - - [20/Jul/2026:18:00:00 +0000] "GET /api/contact HTTP/1.1" 200 42 "-" "agent"\n',
    );
    writeFileSync(path.join(fakeBin, "tail"), "#!/usr/bin/env bash\nexit 1\n", {
      mode: 0o755,
    });

    const config = {
      ...runtimeConfig,
      remoteHome: home,
      sshUser: process.env.USER || "root",
    };
    const script = buildRemoteInspectionScript({
      config,
      htaccessPath: path.join(publicRoot, ".htaccess"),
      passenger,
      remoteAppRoot: current,
      remoteReleasesRoot: releasesRoot,
    });
    const stdout = execFileSync("bash", ["-c", script], {
      encoding: "utf8",
      env: { ...process.env, HOME: home, PATH: `${fakeBin}:${process.env.PATH}` },
    });
    const result = parseRemoteInspection(stdout, passenger);

    assert.equal(result.formLogAvailable, false);
    assert.deepEqual(result.formRecords, []);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("runtime warms public and origin routes before inspecting Passenger process state", async () => {
  const events = [];
  const probe = (name, options = {}) => async () => {
    events.push(`${name}:start`);
    await new Promise((resolve) => setTimeout(resolve, 5));
    events.push(`${name}:end`);
    return healthyRouteSet(options);
  };

  const result = await runProductionHealth({
    config: runtimeConfig,
    inspectRemote: async () => {
      events.push("inspect");
      assert.ok(events.includes("public:end"));
      assert.ok(events.includes("origin:end"));
      return healthyRemote;
    },
    probeOrigin: probe("origin"),
    probePublic: probe("public", { publicEdge: true }),
    readCpanel: async () => ({
      quotaPayload: { data: { byte_limit: 10_000, byte_usage: 1_000 } },
      resourcePayload: { data: [] },
      warnings: [],
    }),
    readWorkflowRuns: async () => successfulWorkflowRuns(),
    resolveOrigin: async () => ({ address: "192.0.2.10", family: 4, ok: true }),
    resolvePublic: async () => ({ durationMs: 2, ok: true }),
  });

  assert.equal(result.exitCode, 0);
  assert.deepEqual(events.slice(-1), ["inspect"]);
});

test("unavailable remote measurements are not described as threshold breaches", async () => {
  const result = await runProductionHealth({
    config: runtimeConfig,
    inspectRemote: async () => {
      throw new Error("synthetic remote failure with private path /home/example");
    },
    probeOrigin: async () => healthyRouteSet(),
    probePublic: async () => healthyRouteSet({ publicEdge: true }),
    readCpanel: async () => ({
      quotaPayload: null,
      resourcePayload: null,
      warnings: [],
    }),
    readWorkflowRuns: async () => successfulWorkflowRuns(),
    resolveOrigin: async () => ({ address: "192.0.2.10", family: 4, ok: true }),
    resolvePublic: async () => ({ durationMs: 2, ok: true }),
  });

  assert.equal(result.report.classification, "release-state");
  assert.deepEqual(result.report.release.mismatches, ["inspection-unavailable"]);
  assert.equal(
    result.report.warnings.some((warning) => warning.includes("above the warning threshold")),
    false,
  );
  assert.ok(
    result.report.warnings.some((warning) => warning.includes("release inspection is unavailable")),
  );
  assert.equal(JSON.stringify(result.report).includes("/home/example"), false);
});

test("safe log summary preserves actionable evidence without infrastructure paths", () => {
  const summary = formatSafeLogSummary({
    blocking: true,
    capacity: {
      filesystem: { severity: "warning", value: 88 },
      quota: { severity: "unavailable", usagePercent: null },
      releaseBytes: { severity: "ok", value: 556_634_112 },
      releaseCount: { severity: "ok", value: 6 },
    },
    classification: "release-state",
    forms: {
      access: { serverError: 0, serverErrorRate: 0, total: 0 },
      ok: true,
    },
    origin: {
      routes: [
        {
          cold: { errorCode: null, ok: true, status: 200 },
          key: "en",
          warm: { errorCode: null, ok: true, status: 200 },
        },
      ],
    },
    public: {
      routes: [
        {
          cold: { errorCode: null, ok: false, status: 429 },
          key: "contact",
          warm: { errorCode: null, ok: true, status: 200 },
        },
        {
          cold: { errorCode: null, ok: true, status: 200 },
          key: "en",
          warm: { errorCode: null, ok: true, status: 200 },
        },
      ],
    },
    release: {
      mismatches: ["process-cwd"],
      ok: false,
      privatePath: "/home/example/releases/1",
    },
    warnings: ["host filesystem usage is above the warning threshold"],
    workflows: {
      blocking: false,
      targets: {
        deploy: { consecutiveFailures: 0, latestConclusion: "success" },
      },
    },
  });

  assert.match(summary, /^PRODUCTION_HEALTH_SAFE /);
  assert.match(summary, /"releaseMismatches":\["process-cwd"\]/);
  assert.match(summary, /"releaseCount":\{"severity":"ok","value":6\}/);
  assert.match(summary, /"publicFailures":\[\{"key":"contact"/);
  assert.match(summary, /"status":429/);
  assert.match(summary, /"originFailures":\[\]/);
  assert.equal(summary.includes("/home/example"), false);
});

test("runtime exposes cPanel failure classes only for manual capacity diagnostics", async () => {
  let cpanelOptions;
  const result = await runProductionHealth({
    capacityDiagnostics: true,
    config: runtimeConfig,
    inspectRemote: async () => ({
      ...healthyRemote,
      capacityDiagnostics: { categories: {} },
      formLogAvailable: true,
    }),
    probeOrigin: async () => healthyRouteSet(),
    probePublic: async () => healthyRouteSet({ publicEdge: true }),
    readCpanel: async (options) => {
      cpanelOptions = options;
      return {
        diagnostics: {
          quota: "TLS_HOSTNAME_MISMATCH",
          resources: "HTTP_4XX",
        },
        quotaPayload: null,
        resourcePayload: null,
        warnings: [
          "cPanel quota usage could not be read",
          "cPanel LVE resource usage could not be read",
        ],
      };
    },
    readWorkflowRuns: async () => successfulWorkflowRuns(),
    resolveOrigin: async () => ({ address: "192.0.2.10", family: 4, ok: true }),
    resolvePublic: async () => ({ durationMs: 2, ok: true }),
  });

  assert.equal(cpanelOptions.includeDiagnostics, true);
  assert.deepEqual(result.report.capacity.diagnostics.cpanel, {
    quota: "TLS_HOSTNAME_MISMATCH",
    resources: "HTTP_4XX",
  });
});
