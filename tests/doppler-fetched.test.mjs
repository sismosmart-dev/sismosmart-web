import assert from "node:assert/strict";
import test from "node:test";
import { checkFetchedDoppler } from "../scripts/ops/check-fetched-doppler.mjs";

const ops = {
  DOPPLER_PROJECT: "sismosmart-web",
  DOPPLER_CONFIG: "prd_ops",
  PUBLIC_BASE_URL: "https://example.org",
  CPANEL_HOST: "https://example.org:2083",
  DOMAIN: "example.org",
  SSH_HOST: "example.org",
  SSH_USER: "observer",
  DNS_ORIGIN_IPV4: "192.0.2.1",
};

test("fetched secret grant must match Doppler project/config", () => {
  assert.equal(checkFetchedDoppler("prd_ops", ops), true);
  assert.throws(() => checkFetchedDoppler("prd_ops", {}), /wrong scope/);
  assert.throws(() => checkFetchedDoppler("prd_ops", {...ops, DOPPLER_CONFIG: "prd_deploy"}), /wrong scope/);
  assert.throws(() => checkFetchedDoppler("prd_ops", {...ops, DNS_ORIGIN_IPV4: ""}), /DNS_ORIGIN_IPV4/);
  assert.throws(() => checkFetchedDoppler("invalid", ops), /Unapproved/);
});

test("app and deploy credentials have distinct mandatory key contracts", () => {
  const deploy = {...ops, DOPPLER_CONFIG: "prd_deploy"};
  assert.equal(checkFetchedDoppler("prd_deploy", deploy), true);
  const app = {
    DOPPLER_PROJECT: "sismosmart-web",
    DOPPLER_CONFIG: "prd_app",
    CONTACT_FORM_ENDPOINT: "https://example.org/contact",
    WAITLIST_FORM_ENDPOINT: "https://example.org/waitlist",
  };
  assert.equal(checkFetchedDoppler("prd_app", app), true);
  assert.throws(() => checkFetchedDoppler("prd_deploy", app), /wrong scope/);
});
