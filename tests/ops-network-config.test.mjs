import assert from "node:assert/strict";
import test from "node:test";

import { hydrateNetworkConfig } from "../scripts/ops/network-config.mjs";

const baseConfig = Object.freeze({ domain: "example.com" });

test("network audit addresses come from protected environment values", () => {
  assert.deepEqual(
    hydrateNetworkConfig(
      baseConfig,
      {
        DNS_ORIGIN_IPV4: "203.0.113.10",
        DNS_LEGACY_IPV4: "198.51.100.20",
      },
      { requireLegacy: true },
    ),
    {
      domain: "example.com",
      originIpv4: "203.0.113.10",
      legacyIpv4: "198.51.100.20",
    },
  );
});

test("legacy address is optional when only delegation moved", () => {
  assert.deepEqual(
    hydrateNetworkConfig(baseConfig, { DNS_ORIGIN_IPV4: "203.0.113.10" }),
    {
      domain: "example.com",
      originIpv4: "203.0.113.10",
    },
  );

  assert.deepEqual(
    hydrateNetworkConfig(baseConfig, {
      DNS_ORIGIN_IPV4: "203.0.113.10",
      DNS_LEGACY_IPV4: "   ",
    }),
    {
      domain: "example.com",
      originIpv4: "203.0.113.10",
    },
  );
});

test("a configured optional legacy address must be a valid IPv4 address", () => {
  assert.throws(
    () =>
      hydrateNetworkConfig(baseConfig, {
        DNS_ORIGIN_IPV4: "203.0.113.10",
        DNS_LEGACY_IPV4: "not-an-ip",
      }),
    (error) => {
      assert.match(error.message, /DNS_LEGACY_IPV4 must be a valid IPv4 address/);
      assert.doesNotMatch(error.message, /not-an-ip/);
      return true;
    },
  );
});

test("network audit configuration fails closed without exposing values", () => {
  assert.throws(
    () => hydrateNetworkConfig(baseConfig, {}),
    /Missing required protected network configuration: DNS_ORIGIN_IPV4/,
  );
  assert.throws(
    () =>
      hydrateNetworkConfig(
        baseConfig,
        {
          DNS_ORIGIN_IPV4: "not-an-ip",
          DNS_LEGACY_IPV4: "198.51.100.20",
        },
        { requireLegacy: true },
      ),
    (error) => {
      assert.match(error.message, /DNS_ORIGIN_IPV4 must be a valid IPv4 address/);
      assert.doesNotMatch(error.message, /not-an-ip/);
      return true;
    },
  );
});

test("requiring legacy configuration still fails closed when it is absent", () => {
  assert.throws(
    () =>
      hydrateNetworkConfig(
        baseConfig,
        { DNS_ORIGIN_IPV4: "203.0.113.10" },
        { requireLegacy: true },
      ),
    /Missing required protected network configuration: DNS_LEGACY_IPV4/,
  );
});

test("origin and legacy addresses must differ whenever legacy is configured", () => {
  assert.throws(
    () =>
      hydrateNetworkConfig(baseConfig, {
        DNS_ORIGIN_IPV4: "203.0.113.10",
        DNS_LEGACY_IPV4: "203.0.113.10",
      }),
    /origin and legacy addresses must differ/,
  );
});
