import { createPublicKey } from "node:crypto";

export function normalizeHostname(value) {
  return String(value || "")
    .trim()
    .replace(/\.$/, "")
    .toLowerCase();
}

export function joinTxtRecord(record) {
  return Array.isArray(record) ? record.join("") : String(record || "");
}

export function parseTagRecord(record) {
  const tags = {};

  for (const part of String(record || "").split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    const key = part.slice(0, separator).trim().toLowerCase();
    const value = part.slice(separator + 1).trim();
    if (key) tags[key] = value;
  }

  return tags;
}

export function parseRua(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function hasAggregateMailbox(tags, address) {
  const expected = `mailto:${String(address).trim().toLowerCase()}`;
  return parseRua(tags.rua).includes(expected);
}

export function getDkimRsaBits(record) {
  const tags = parseTagRecord(record);
  if (String(tags.v || "").toUpperCase() !== "DKIM1" || !tags.p) {
    return 0;
  }

  try {
    const key = createPublicKey({
      key: Buffer.from(tags.p, "base64"),
      format: "der",
      type: "spki",
    });
    return key.asymmetricKeyDetails?.modulusLength || 0;
  } catch {
    return 0;
  }
}

export function dmarcPolicyRank(policy) {
  return { none: 0, quarantine: 1, reject: 2 }[String(policy || "").toLowerCase()] ?? -1;
}

export function compactDmarc(tags) {
  return {
    version: tags.v || null,
    policy: tags.p || null,
    subdomainPolicy: tags.sp || null,
    aggregateReports: Boolean(tags.rua),
    dkimAlignment: tags.adkim || "r",
    spfAlignment: tags.aspf || "r",
    percentage: tags.pct || "100",
    reportInterval: tags.ri || "86400",
  };
}
