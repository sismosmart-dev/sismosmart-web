import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import test from "node:test";

import { assessPublicDnsMail, inspectPublicDnsMail } from "../scripts/ops/public-dns-mail.mjs";

const { publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const publicKeyBytes = publicKey.export({ format: "der", type: "spki" }).toString("base64");
const okAnswers = {
  nameservers: ["dane.ns.cloudflare.com", "ryleigh.ns.cloudflare.com"],
  mx: [{ priority: 0, exchange: "mail.sismosmart.com" }],
  spf: [["v=spf1 include:relay.mailbaby.net -all"], ["google-site-verification=test"]],
  dmarc: [["v=DMARC1; p=none; pct=100; rua=mailto:info@sismosmart.com"]],
  dkim: [[`v=DKIM1; k=rsa; p=${publicKeyBytes}`]],
};

function clone(input) { return structuredClone(input); }

function resolverFor(answers) {
  return {
    resolveNs: async () => answers.nameservers,
    resolveMx: async () => answers.mx,
    resolveTxt: async (name) => {
      if (name.startsWith("_dmarc.")) return answers.dmarc;
      if (name.startsWith("default._domainkey.")) return answers.dkim;
      return answers.spf;
    },
  };
}

test("public DNS/mail audits exactly five check families without privileged data", async () => {
  const logs = [];
  const report = await inspectPublicDnsMail({ resolver: resolverFor(okAnswers), log: (line) => logs.push(line) });
  assert.equal(report.ok, true);
  assert.deepEqual(report.failed, []);
  assert.deepEqual(Object.values(report.checks), [true, true, true, true, true]);
  assert.deepEqual(logs, ["PUBLIC_DNS_MAIL ok=true checks=5 failed=0"]);
});

test("wrong delegation, MX, weak SPF, bad DKIM, or DMARC mismatch fail closed", () => {
  for (const [key, edit] of [
    ["nameservers", (v) => { v.nameservers = ["wrong.example.com"]; }],
    ["mx", (v) => { v.mx[0].exchange = "wrong.example.com"; }],
    ["spf", (v) => { v.spf = [["v=spf1 -all"]]; }],
    ["dmarc", (v) => { v.dmarc = [["v=DMARC1; p=none; pct=100"]]; }],
    ["dkim", (v) => { v.dkim = [["v=DKIM1; p=broken"]]; }],
  ]) {
    const answers = clone(okAnswers);
    edit(answers);
    const report = assessPublicDnsMail(answers);
    assert.equal(report.ok, false, key);
    assert.equal(report.checks[key], false, key);
  }
});

test("public resolver failure logs only check name and does not pass", async () => {
  const logs = [];
  const resolver = resolverFor(okAnswers);
  resolver.resolveMx = async () => { throw new Error("resolver details must not be logged"); };
  const result = await inspectPublicDnsMail({ resolver, log: (line) => logs.push(line) });
  assert.deepEqual(result, { ok: false, failed: ["mx"] });
  assert.match(logs.join("\n"), /PUBLIC_DNS_MAIL_FAILED key=mx/);
  assert.doesNotMatch(logs.join("\n"), /resolver details/);
});
