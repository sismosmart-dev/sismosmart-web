import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildCheck,
  classifyAnalyticsRequest,
  countPageViewRequests,
  countRequests,
  getLogicalPageViewEvidence,
  summarizeChecks,
} from "../scripts/ops/analytics-audit-lib.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const analyticsConfig = JSON.parse(
  fs.readFileSync(path.join(rootDir, "config/analytics.json"), "utf8"),
);

test("analytics request classification distinguishes loaders and GA events", () => {
  assert.deepEqual(
    classifyAnalyticsRequest("https://www.googletagmanager.com/gtm.js?id=GTM-TEST"),
    { kind: "gtm-loader", eventName: null },
  );
  assert.deepEqual(
    classifyAnalyticsRequest("https://www.googletagmanager.com/gtag/js?id=G-TEST"),
    { kind: "ga-loader", eventName: null },
  );
  assert.deepEqual(
    classifyAnalyticsRequest("https://www.clarity.ms/tag/example?ref=gtm"),
    { kind: "clarity-loader", eventName: null },
  );
  assert.deepEqual(
    classifyAnalyticsRequest("https://analytics.google.com/g/collect?v=2&en=page_view"),
    { kind: "ga-collect", eventName: "page_view" },
  );
  assert.deepEqual(
    classifyAnalyticsRequest("https://stats.g.doubleclick.net/g/collect?v=2&en=page_view"),
    { kind: "ga-collect", eventName: "page_view" },
  );
});

test("page-view counting accepts unlabeled beacon collects before form submission", () => {
  const requests = [
    { kind: "ga-collect", eventName: null },
    { kind: "ga-collect", eventName: "page_view" },
    { kind: "ga-collect", eventName: "sismosmart_form_success" },
    { kind: "gtm-loader", eventName: null },
  ];

  assert.equal(countPageViewRequests(requests), 2);
});

test("logical page-view evidence deduplicates mirrored beacons behind one config command", () => {
  const dataLayer = [
    ["consent", "default", { analytics_storage: "denied" }],
    ["config", "G-TEST", { send_page_view: true }],
  ];
  const requests = [
    { kind: "ga-collect", eventName: null },
    { kind: "ga-collect", eventName: "page_view" },
  ];

  assert.deepEqual(getLogicalPageViewEvidence(dataLayer, requests, "G-TEST"), {
    configCommandCount: 1,
    beaconCount: 2,
    logicalPageViewCount: 1,
    networkFanoutBounded: true,
  });

  assert.equal(
    getLogicalPageViewEvidence(
      [...dataLayer, ["config", "G-TEST", { send_page_view: true }]],
      requests,
      "G-TEST",
    ).logicalPageViewCount,
    0,
  );
});

test("analytics request counts can target a specific GA event", () => {
  const requests = [
    { url: "https://analytics.google.com/g/collect?en=page_view" },
    { url: "https://analytics.google.com/g/collect?en=sismosmart_form_success" },
    { url: "https://www.googletagmanager.com/gtm.js?id=GTM-TEST" },
  ];

  assert.equal(countRequests(requests, "ga-collect"), 2);
  assert.equal(countRequests(requests, "ga-collect", "page_view"), 1);
  assert.equal(countRequests(requests, "gtm-loader"), 1);
});

test("analytics checks treat warning-only observations as successful", () => {
  const checks = [
    buildCheck("pass", true, {}),
    buildCheck("warning", false, {}, "warning"),
  ];
  assert.deepEqual(summarizeChecks(checks), {
    passed: 1,
    failed: 0,
    warnings: 1,
    ok: true,
  });
});

test("canonical analytics config defines production resources and consent events", () => {
  assert.equal(analyticsConfig.canonicalSource, "config/analytics.json");
  assert.match(analyticsConfig.public.gaMeasurementId, /^G-/);
  assert.match(analyticsConfig.public.gtmPublicId, /^GTM-/);
  assert.ok(analyticsConfig.public.clarityProjectId);
  assert.equal(analyticsConfig.googleAnalytics.defaultUri, "https://sismosmart.com");
  assert.equal(analyticsConfig.consent.defaultState, "denied");
  assert.deepEqual(analyticsConfig.consent.supportedChoices, ["accepted", "necessary"]);
  assert.equal(analyticsConfig.events.formSuccess, "sismosmart_form_success");
  assert.deepEqual(analyticsConfig.locales, ["en", "tr", "es", "id", "pt", "it"]);
});
