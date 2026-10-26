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
  DOPPLER_CONFIG: "prd_sismosmart",
};

test("one production config can satisfy all contracted required keys", () => {
  assert.equal(checkFetchedDoppler("prd_sismosmart", scoped), true);
});

test("a missing, mistaken or incomplete unified config fails closed", () => {
  assert.throws(() => checkFetchedDoppler("prd_sismosmart", {}), /wrong scope/);
  assert.throws(() => checkFetchedDoppler("prd_sismosmart", {...scoped, DOPPLER_CONFIG: "main"}), /wrong scope/);
  assert.throws(() => checkFetchedDoppler("prd_sismosmart", {...scoped, DNS_ORIGIN_IPV4: ""}), /DNS_ORIGIN_IPV4/);
  assert.throws(() => checkFetchedDoppler("prd_ops", scoped), /Unapproved/);
});
