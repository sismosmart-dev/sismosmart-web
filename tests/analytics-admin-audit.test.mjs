import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyAdminFailure,
  summarizeAdminServices,
  validateGoogleAnalyticsStatus,
  validateSearchConsoleStatus,
  validateTagManagerStatus,
} from "../scripts/ops/analytics-admin-audit-lib.mjs";

test("Google OAuth invalid_grant is classified as degraded authentication", () => {
  const result = classifyAdminFailure("Error: invalid_grant");
  assert.equal(result.category, "auth-degraded");
  assert.equal(result.severity, "warning");
});

test("insufficient Google scopes are classified as degraded authentication", () => {
  const result = classifyAdminFailure("Request had insufficient authentication scopes.");
  assert.equal(result.category, "auth-degraded");
  assert.equal(result.severity, "warning");
});

test("unexpected administrative command failures remain hard errors", () => {
  const result = classifyAdminFailure("permission denied while reading resource");
  assert.equal(result.category, "command-failure");
  assert.equal(result.severity, "error");
});

test("GA4 verification booleans produce hard resource checks", () => {
  const checks = validateGoogleAnalyticsStatus({
    verification: {
      accountAccessible: true,
      propertyAccessible: true,
      webStreamAccessible: true,
      measurementIdMatches: false,
    },
  });
  assert.equal(checks.length, 4);
  assert.equal(checks.filter((item) => !item.passed).length, 1);
  assert.equal(checks.at(-1).name, "GA4 measurement ID matches");
});

test("GTM verification requires container, workspace, tags, and trigger references", () => {
  const checks = validateTagManagerStatus({
    verification: {
      containerPublicIdMatches: true,
      workspaceResolved: true,
      tagsPresent: true,
      triggersPresent: true,
    },
    tagCount: 2,
    triggerCount: 0,
  });
  assert.ok(checks.every((item) => item.passed));
});

test("Search Console verification requires accessible and verified domain", () => {
  const checks = validateSearchConsoleStatus({
    verification: { siteAccessible: true, domainVerified: false },
  });
  assert.equal(checks.filter((item) => !item.passed).length, 1);
});

test("degraded authentication is blocking and remains visible", () => {
  const summary = summarizeAdminServices([
    {
      service: "google-analytics",
      status: "degraded",
      checks: [],
    },
    {
      service: "browser-independent-resource",
      status: "verified",
      checks: [{ name: "resource", passed: true }],
    },
  ]);

  assert.equal(summary.ok, false);
  assert.equal(summary.degraded, true);
  assert.deepEqual(summary.degradedServices, ["google-analytics"]);
});

test("resource mismatches remain blocking", () => {
  const summary = summarizeAdminServices([
    {
      service: "google-analytics",
      status: "failed",
      checks: [{ name: "measurement", passed: false }],
    },
  ]);

  assert.equal(summary.ok, false);
  assert.equal(summary.failedChecks, 1);
  assert.deepEqual(summary.failedServices, ["google-analytics"]);
});
