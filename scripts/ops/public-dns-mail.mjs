import dns from "node:dns/promises";
import { pathToFileURL } from "node:url";

import {
  dmarcPolicyRank,
  getDkimRsaBits,
  hasAggregateMailbox,
  joinTxtRecord,
  normalizeHostname,
  parseTagRecord,
} from "./mail-dns-lib.mjs";

import mailPolicy from "../../config/mail-dns.json" with { type: "json" };
import dnsPolicy from "../../config/dns-cutover.json" with { type: "json" };

function equalSets(left, right) {
  return left.length === right.length && left.every((item) => right.includes(item));
}

export function assessPublicDnsMail({ nameservers, mx, spf, dmarc, dkim }, {
  domainPolicy = dnsPolicy,
  mailConfig = mailPolicy,
} = {}) {
  const expectedNs = domainPolicy.expectedNameservers.map(normalizeHostname).sort();
  const observedNs = [...new Set(nameservers.map(normalizeHostname))].sort();
  const spfRecords = spf.map(joinTxtRecord).filter((txt) => /^v=spf1\s/i.test(txt));
  const dmarcRecords = dmarc.map(joinTxtRecord).filter((txt) => /^v=dmarc1\s*;/i.test(txt));
  const dmarcTags = parseTagRecord(dmarcRecords[0]);
  const dkimRecords = dkim.map(joinTxtRecord).filter((txt) => /^v=dkim1\s*;/i.test(txt));
  const correctMx = mx.length === 1 && mx[0].priority === mailConfig.mx.priority &&
    normalizeHostname(mx[0].exchange) === normalizeHostname(mailConfig.mx.exchange);
  const spfTxt = spfRecords[0] || "";
  const checks = {
    nameservers: equalSets(observedNs, expectedNs),
    mx: correctMx,
    spf: spfRecords.length === 1 &&
      spfTxt.split(/\s+/).includes(mailConfig.spf.requiredInclude) &&
      spfTxt.trim().endsWith(mailConfig.spf.requiredTerminal),
    dmarc: dmarcRecords.length === 1 &&
      dmarcPolicyRank(dmarcTags.p) >= dmarcPolicyRank(mailConfig.dmarc.minimumPolicy) &&
      (dmarcTags.pct || "100") === mailConfig.dmarc.expectedPercentage &&
      hasAggregateMailbox(dmarcTags, mailConfig.dmarc.reportMailbox),
    dkim: dkimRecords.length === 1 &&
      getDkimRsaBits(dkimRecords[0]) >= mailConfig.dkim.minimumRsaBits,
  };
  return { ok: Object.values(checks).every(Boolean), checks };
}

export async function inspectPublicDnsMail({ resolver = dns, log = console.log } = {}) {
  const domain = mailPolicy.domain;
  const answers = await Promise.allSettled([
    resolver.resolveNs(domain),
    resolver.resolveMx(domain),
    resolver.resolveTxt(domain),
    resolver.resolveTxt(`_dmarc.${domain}`),
    resolver.resolveTxt(`${mailPolicy.dkim.selector}._domainkey.${domain}`),
  ]);
  const keys = ["nameservers", "mx", "spf", "dmarc", "dkim"];
  if (answers.some((item) => item.status === "rejected")) {
    const failed = keys.filter((_, i) => answers[i].status === "rejected");
    log(`PUBLIC_DNS_MAIL ok=false checks=5 failed=${failed.length} lookup=unavailable`);
    for (const name of failed) log(`PUBLIC_DNS_MAIL_FAILED key=${name}`);
    return { ok: false, failed };
  }
  const [nameservers, mx, spf, dmarc, dkim] = answers.map((answer) => answer.value);
  const summary = assessPublicDnsMail({ nameservers, mx, spf, dmarc, dkim });
  const failed = keys.filter((key) => !summary.checks[key]);
  log(`PUBLIC_DNS_MAIL ok=${summary.ok} checks=5 failed=${failed.length}`);
  for (const name of failed) log(`PUBLIC_DNS_MAIL_FAILED key=${name}`);
  return { ...summary, failed };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  inspectPublicDnsMail()
    .then((report) => { if (!report.ok) process.exitCode = 1; })
    .catch(() => { console.error("PUBLIC_DNS_MAIL error=unexpected"); process.exitCode = 1; });
}
