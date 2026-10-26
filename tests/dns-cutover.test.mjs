import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

import {
  classifyLegacyEndpoint,
  createUnconfiguredLegacyEndpoint,
  ipv4InAnyCidr,
  ipv4InCidr,
  normalizeHostnames,
  sameStringSet,
  summarizeChecks,
} from "../scripts/ops/dns-cutover-lib.mjs";

test("hostname comparisons ignore order, case, duplicates, and trailing dots", () => {
  assert.equal(
    sameStringSet(
      ["RYLEIGH.NS.CLOUDFLARE.COM.", "dane.ns.cloudflare.com", "dane.ns.cloudflare.com"],
      ["dane.ns.cloudflare.com.", "ryleigh.ns.cloudflare.com"],
    ),
    true,
  );
  assert.deepEqual(normalizeHostnames(["B.example.", "a.example", "b.example"]), [
    "a.example",
    "b.example",
  ]);
});

test("IPv4 CIDR checks identify Cloudflare-style network membership", () => {
  assert.equal(ipv4InCidr("104.21.95.88", "104.16.0.0/13"), true);
  assert.equal(ipv4InCidr("172.67.170.61", "172.64.0.0/13"), true);
  assert.equal(ipv4InCidr("203.0.113.10", "104.16.0.0/13"), false);
  assert.equal(
    ipv4InAnyCidr("172.67.170.61", ["104.16.0.0/13", "172.64.0.0/13"]),
    true,
  );
  assert.throws(() => ipv4InCidr("999.1.1.1", "104.16.0.0/13"), /Invalid IPv4/);
  assert.throws(() => ipv4InCidr("104.21.95.88", "104.16.0.0/99"), /Invalid IPv4 CIDR/);
});

test("legacy endpoint is acceptable only when DNS is clean and content is generic", () => {
  assert.deepEqual(
    classifyLegacyEndpoint({
      dnsReferencesLegacy: false,
      domainBodyHash: "same",
      randomBodyHash: "same",
      certificateAuthorized: false,
    }),
    {
      acceptable: true,
      classification: "isolated-provider-catch-all",
      reason:
        "The legacy address is absent from DNS and serves the same generic provider page for arbitrary Host values.",
    },
  );

  assert.equal(
    classifyLegacyEndpoint({
      dnsReferencesLegacy: true,
      domainBodyHash: "same",
      randomBodyHash: "same",
      certificateAuthorized: false,
    }).acceptable,
    false,
  );
  assert.equal(
    classifyLegacyEndpoint({
      dnsReferencesLegacy: false,
      domainBodyHash: "domain-specific",
      randomBodyHash: "generic",
      certificateAuthorized: false,
    }).classification,
    "domain-specific-legacy-content",
  );
  assert.equal(
    classifyLegacyEndpoint({
      dnsReferencesLegacy: false,
      domainBodyHash: "same",
      randomBodyHash: "same",
      certificateAuthorized: true,
    }).classification,
    "legacy-certificate-authorized",
  );
});

test("an absent retired origin produces a stable non-blocking report state", () => {
  assert.deepEqual(createUnconfiguredLegacyEndpoint(), {
    configured: false,
    ipv4: null,
    domainResponse: null,
    randomResponse: null,
    classification: {
      acceptable: true,
      classification: "not-configured",
      reason: "No distinct legacy origin address is configured; endpoint-specific checks were skipped.",
    },
    dnsReferencesLegacy: null,
  });
});

test("apex HTTPS audit accepts the permanent locale redirect", async () => {
  const config = JSON.parse(
    await fs.readFile(new URL("../config/dns-cutover.json", import.meta.url), "utf8"),
  );
  const apex = config.httpsChecks.find((check) => check.hostname === "sismosmart.com");

  assert.ok(apex);
  assert.ok(apex.allowedStatuses.includes(308));
});

test("check summaries fail only on error-severity failures", () => {
  assert.deepEqual(
    summarizeChecks([
      { ok: true, severity: "error" },
      { ok: false, severity: "warning" },
      { ok: false, severity: "error" },
    ]),
    {
      passed: 1,
      failed: 1,
      warnings: 1,
      ok: false,
    },
  );
});
