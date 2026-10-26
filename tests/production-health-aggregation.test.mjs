import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildProductionHealthCapacityResult,
  buildProductionHealthFormsResult,
  buildProductionHealthWorkflowResult,
  findWarmRoute,
  summarizeProductionHealthProbe,
  summarizeProductionHealthRouteSet,
} from "../scripts/ops/production-health-aggregation.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readText(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), "utf8");
}

function formRoute(key, { configured = true, ok = true, target = key } = {}) {
  return {
    cold: { ok: true },
    key,
    warm: { configured, ok, target },
  };
}

function formRecords(statuses, route = "contact") {
  return statuses.map((status) => ({ route, status }));
}

test("production health runtime delegates deterministic aggregation to a focused module", () => {
  const runtime = readText("scripts/ops/production-health.mjs");
  const aggregation = readText("scripts/ops/production-health-aggregation.mjs");

  const exports = [
    "buildProductionHealthCapacityResult",
    "buildProductionHealthFormsResult",
    "buildProductionHealthWorkflowResult",
    "findWarmRoute",
    "summarizeProductionHealthProbe",
    "summarizeProductionHealthRouteSet",
  ];
  for (const exportName of exports) {
    assert.match(aggregation, new RegExp(`export function ${exportName}`));
  }
  for (const runtimeImport of exports.filter(
    (name) => name !== "summarizeProductionHealthProbe",
  )) {
    assert.match(runtime, new RegExp(runtimeImport));
  }

  assert.match(
    runtime,
    /from "\.\/production-health-aggregation\.mjs"/,
  );
  assert.doesNotMatch(runtime, /function warmRoute\(/);
  assert.doesNotMatch(runtime, /function summarizeProbe\(/);
  assert.doesNotMatch(runtime, /function summarizeRouteSet\(/);
  assert.doesNotMatch(runtime, /function capacityResult\(/);
  assert.doesNotMatch(runtime, /function formsResult\(/);
  assert.doesNotMatch(runtime, /function workflowResult\(/);
});

test("warm-route lookup preserves first-match and missing behavior", () => {
  const first = { ok: true, marker: "first" };
  const second = { ok: true, marker: "second" };
  const routeSet = {
    routes: [
      { key: "contact", warm: first },
      { key: "contact", warm: second },
      { key: "waitlist" },
    ],
  };

  assert.equal(findWarmRoute(routeSet, "contact"), first);
  assert.equal(findWarmRoute(routeSet, "waitlist"), undefined);
  assert.equal(findWarmRoute(routeSet, "missing"), undefined);
  assert.equal(findWarmRoute({}, "contact"), undefined);
  assert.equal(findWarmRoute(null, "contact"), undefined);
});

test("probe summarization preserves safe fields and null semantics", () => {
  assert.equal(summarizeProductionHealthProbe(null), null);

  const summarized = summarizeProductionHealthProbe({
    cacheStatus: "",
    cloudflare: 1,
    configured: false,
    connectMs: 0,
    errorCode: "",
    lookupMs: 4.5,
    ok: 1,
    privateAddress: "not-retained",
    status: 200,
    target: "home",
    tlsMs: 8,
    totalMs: 20,
    ttfbMs: 12,
  });

  assert.deepEqual(summarized, {
    cacheStatus: null,
    cloudflare: true,
    configured: false,
    connectMs: 0,
    errorCode: null,
    lookupMs: 4.5,
    ok: true,
    status: 200,
    target: "home",
    tlsMs: 8,
    totalMs: 20,
    ttfbMs: 12,
  });
  assert.equal("privateAddress" in summarized, false);

  const withoutConfigured = summarizeProductionHealthProbe({ ok: false });
  assert.equal("configured" in withoutConfigured, true);
  assert.equal(withoutConfigured.configured, undefined);
});

test("route-set summarization preserves order, positions, and empty fallback", () => {
  const result = summarizeProductionHealthRouteSet({
    ok: 1,
    routes: [
      {
        key: "en",
        cold: { ok: false, status: 503, target: "home" },
        warm: { ok: true, status: 200, target: "home", raw: "removed" },
      },
      {
        key: "contact",
        cold: null,
        warm: { configured: true, ok: true, status: 200, target: "contact" },
      },
    ],
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.routes.map((route) => route.key), ["en", "contact"]);
  assert.equal(result.routes[0].cold.ok, false);
  assert.equal(result.routes[0].warm.ok, true);
  assert.equal("raw" in result.routes[0].warm, false);
  assert.equal(result.routes[1].cold, null);
  assert.equal(result.routes[1].warm.configured, true);
  assert.deepEqual(summarizeProductionHealthRouteSet(null), {
    ok: false,
    routes: [],
  });
});

test("capacity aggregation preserves warning thresholds and resource rounding", () => {
  const warnings = ["existing warning"];
  const result = buildProductionHealthCapacityResult(
    {
      filesystemUsagePercent: 85,
      releaseBytes: 1024 ** 3 + 1,
      releaseCount: 9,
    },
    {
      available: true,
      limitBytes: 100,
      usageBytes: 80,
      usagePercent: 80,
    },
    [{ description: "CPU", id: "cpu", maximum: 3, usage: 1 }],
    warnings,
  );

  assert.deepEqual(warnings, [
    "existing warning",
    "host filesystem usage is above the warning threshold",
    "release count is above the warning threshold",
    "release bytes is above the warning threshold",
    "account quota is above the warning threshold",
  ]);
  assert.equal(result.blocking, false);
  assert.deepEqual(result.filesystem, { severity: "warning", value: 85 });
  assert.deepEqual(result.releaseCount, { severity: "warning", value: 9 });
  assert.equal(result.quota.severity, "warning");
  assert.deepEqual(result.resources, [
    {
      description: "CPU",
      id: "cpu",
      maximum: 3,
      usage: 1,
      usagePercent: 33.33,
    },
  ]);
});

test("critical shared filesystem usage stays non-blocking without account quota evidence", () => {
  const warnings = [];
  const result = buildProductionHealthCapacityResult(
    {
      filesystemUsagePercent: 97,
      releaseBytes: 579_616_768,
      releaseCount: 6,
    },
    {
      available: false,
      limitBytes: null,
      usageBytes: null,
      usagePercent: null,
    },
    [],
    warnings,
  );

  assert.equal(result.filesystem.severity, "error");
  assert.equal(result.blocking, false);
  assert.deepEqual(warnings, [
    "host filesystem usage is above the critical threshold",
    "account quota limit is unavailable",
  ]);
});

test("capacity aggregation preserves critical blocking and warning order", () => {
  const warnings = [];
  const result = buildProductionHealthCapacityResult(
    {
      filesystemUsagePercent: 95,
      releaseBytes: 2 * 1024 ** 3 + 1,
      releaseCount: 13,
    },
    { available: true, usagePercent: 90 },
    [{ id: "io", maximum: 0, usage: 4 }],
    warnings,
  );

  assert.equal(result.blocking, true);
  assert.deepEqual(warnings, [
    "host filesystem usage is above the critical threshold",
    "release count is above the critical threshold",
    "release bytes is above the critical threshold",
    "account quota is above the critical threshold",
  ]);
  assert.equal(result.resources[0].usagePercent, null);
  assert.equal(result.resources[0].usage, 4);
});

test("capacity aggregation preserves unavailable measurements and quota warning", () => {
  const warnings = [];
  const result = buildProductionHealthCapacityResult(
    null,
    {
      available: false,
      limitBytes: null,
      usageBytes: 12,
      usagePercent: null,
    },
    [],
    warnings,
  );

  assert.equal(result.blocking, false);
  assert.deepEqual(warnings, [
    "host filesystem usage measurement is unavailable",
    "release count measurement is unavailable",
    "release bytes measurement is unavailable",
    "account quota limit is unavailable",
  ]);
  assert.equal(result.quota.severity, "unavailable");
});

test("form aggregation preserves successful runtime and access evidence", () => {
  const warnings = [];
  const result = buildProductionHealthFormsResult(
    {
      routes: [formRoute("contact"), formRoute("waitlist")],
    },
    {
      formLogAvailable: true,
      formRecords: [
        { route: "contact", status: 200 },
        { route: "waitlist", status: 302 },
        { route: "other", status: 500 },
      ],
    },
    warnings,
  );

  assert.deepEqual(warnings, []);
  assert.deepEqual(result, {
    access: {
      clientError: 0,
      serverError: 0,
      serverErrorRate: 0,
      success: 2,
      total: 2,
    },
    blocking: false,
    ok: true,
    runtime: { contact: true, waitlist: true },
  });
});

test("form aggregation preserves unavailable and server-error warning branches", () => {
  const unavailableWarnings = [];
  const unavailable = buildProductionHealthFormsResult(
    { routes: [formRoute("contact"), formRoute("waitlist")] },
    { formLogAvailable: false, formRecords: [] },
    unavailableWarnings,
  );
  assert.equal(unavailable.blocking, false);
  assert.deepEqual(unavailableWarnings, [
    "form access-log aggregation is unavailable",
  ]);

  const errorWarnings = [];
  const withErrors = buildProductionHealthFormsResult(
    { routes: [formRoute("contact"), formRoute("waitlist")] },
    {
      formLogAvailable: true,
      formRecords: [
        ...formRecords([500, 502], "contact"),
        ...formRecords([200, 200, 200, 200, 200, 200, 200, 200], "waitlist"),
      ],
    },
    errorWarnings,
  );
  assert.equal(withErrors.blocking, false);
  assert.deepEqual(errorWarnings, ["form access logs contain server errors"]);
});

test("form aggregation preserves blocking threshold and target semantics", () => {
  const warnings = [];
  const result = buildProductionHealthFormsResult(
    {
      routes: [
        formRoute("contact", { target: "wrong-target" }),
        formRoute("waitlist", { configured: false }),
      ],
    },
    {
      formLogAvailable: true,
      formRecords: [
        ...formRecords([500, 500, 500, 500, 500], "contact"),
        ...formRecords(Array(20).fill(200), "waitlist"),
      ],
    },
    warnings,
  );

  assert.equal(result.blocking, true);
  assert.equal(result.access.serverErrorRate, 0.2);
  assert.equal(result.ok, false);
  assert.deepEqual(result.runtime, { contact: true, waitlist: false });
  assert.deepEqual(warnings, ["form access logs contain server errors"]);
});

test("workflow aggregation preserves target order, warning order, and blocking", () => {
  const warnings = ["existing warning"];
  const result = buildProductionHealthWorkflowResult(
    {
      deploy: [
        { conclusion: "failure" },
        { conclusion: "success" },
      ],
      lighthouse: [{ conclusion: "success" }],
      security: [
        { conclusion: "failure" },
        { conclusion: "timed_out" },
        { conclusion: "success" },
      ],
    },
    warnings,
  );

  assert.deepEqual(Object.keys(result.targets), [
    "deploy",
    "lighthouse",
    "security",
  ]);
  assert.deepEqual(warnings, [
    "existing warning",
    "deploy workflow latest run failed once",
  ]);
  assert.deepEqual(result.targets.deploy, {
    blocking: false,
    consecutiveFailures: 1,
    latestConclusion: "failure",
  });
  assert.deepEqual(result.targets.security, {
    blocking: true,
    consecutiveFailures: 2,
    latestConclusion: "failure",
  });
  assert.equal(result.blocking, true);
});

test("workflow aggregation preserves all targets for missing input", () => {
  const warnings = [];
  const result = buildProductionHealthWorkflowResult(null, warnings);

  assert.equal(result.blocking, false);
  assert.deepEqual(warnings, []);
  assert.deepEqual(result.targets, {
    deploy: {
      blocking: false,
      consecutiveFailures: 0,
      latestConclusion: null,
    },
    lighthouse: {
      blocking: false,
      consecutiveFailures: 0,
      latestConclusion: null,
    },
    security: {
      blocking: false,
      consecutiveFailures: 0,
      latestConclusion: null,
    },
  });
});

test("capacity aggregation carries diagnostics only when inspection provides them", () => {
  const diagnostics = {
    categories: { apps: 400, logs: 500, other: 100 },
    filesystemAvailableBytes: 300,
    filesystemTotalBytes: 10000,
    filesystemUsedBytes: 9700,
    homeBytes: 1000,
  };
  const warnings = [];
  const result = buildProductionHealthCapacityResult(
    {
      capacityDiagnostics: diagnostics,
      filesystemUsagePercent: 20,
      releaseBytes: 10,
      releaseCount: 1,
    },
    { available: true, usagePercent: 10 },
    [],
    warnings,
  );

  assert.deepEqual(result.diagnostics, diagnostics);
  const without = buildProductionHealthCapacityResult(
    { filesystemUsagePercent: 20, releaseBytes: 10, releaseCount: 1 },
    { available: true, usagePercent: 10 },
    [],
    [],
  );
  assert.equal("diagnostics" in without, false);
});
