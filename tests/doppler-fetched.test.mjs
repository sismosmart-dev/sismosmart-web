import assert from "node:assert/strict";
import test from "node:test";
import { checkFetchedDoppler } from "../scripts/ops/check-fetched-doppler.mjs";
import { ENVIRONMENT_CONTRACT } from "../config/doppler-contract.mjs";

const combined = Object.fromEntries(
  Object.entries(ENVIRONMENT_CONTRACT)
    .filter(([, policy]) => policy.required)
    .map(([key]) => [key, "fixture-not-a-secret"]),
);
const scoped = {
  ...combined,
  DOPPLER_PROJECT: "sismosmart-web",
  DOPPLER_CONFIG: "main",
};

test("one production config can satisfy all contracted required keys", () => {
  assert.equal(checkFetchedDoppler("main", scoped), true);
});

test("a missing, mistaken or incomplete unified config fails closed", () => {
  assert.throws(() => checkFetchedDoppler("main", {}), /wrong scope/);
  assert.throws(() => checkFetchedDoppler("main", {...scoped, DOPPLER_CONFIG: "prd_ops"}), /wrong scope/);
  assert.throws(() => checkFetchedDoppler("main", {...scoped, DNS_ORIGIN_IPV4: ""}), /DNS_ORIGIN_IPV4/);
  assert.throws(() => checkFetchedDoppler("prd_ops", scoped), /Unapproved/);
});
