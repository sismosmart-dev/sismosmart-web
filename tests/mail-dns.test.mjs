import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import test from "node:test";

import {
  compactDmarc,
  dmarcPolicyRank,
  getDkimRsaBits,
  hasAggregateMailbox,
  joinTxtRecord,
  normalizeHostname,
  parseRua,
  parseTagRecord,
} from "../scripts/ops/mail-dns-lib.mjs";

test("mail DNS helpers normalize DNS and TXT values", () => {
  assert.equal(normalizeHostname("Mail.SismoSmart.com."), "mail.sismosmart.com");
  assert.equal(joinTxtRecord(["v=spf1 ", "-all"]), "v=spf1 -all");
});

test("DMARC tag parsing recognizes same-domain aggregate reporting", () => {
  const tags = parseTagRecord(
    "v=DMARC1; p=none; rua=mailto:info@sismosmart.com,mailto:security@example.net; pct=100",
  );

  assert.equal(tags.v, "DMARC1");
  assert.equal(tags.p, "none");
  assert.deepEqual(parseRua(tags.rua), [
    "mailto:info@sismosmart.com",
    "mailto:security@example.net",
  ]);
  assert.equal(hasAggregateMailbox(tags, "info@sismosmart.com"), true);
  assert.deepEqual(compactDmarc(tags), {
    version: "DMARC1",
    policy: "none",
    subdomainPolicy: null,
    aggregateReports: true,
    dkimAlignment: "r",
    spfAlignment: "r",
    percentage: "100",
    reportInterval: "86400",
  });
});

test("DMARC policy ranks support staged enforcement", () => {
  assert.equal(dmarcPolicyRank("none"), 0);
  assert.equal(dmarcPolicyRank("quarantine"), 1);
  assert.equal(dmarcPolicyRank("reject"), 2);
  assert.equal(dmarcPolicyRank("invalid"), -1);
});

test("DKIM parser validates an RSA public key and reports modulus length", () => {
  const { publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "der" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  const record = `v=DKIM1; k=rsa; p=${publicKey.toString("base64")}`;

  assert.equal(getDkimRsaBits(record), 2048);
  assert.equal(getDkimRsaBits("v=DKIM1; p=not-base64"), 0);
});
