import { URL, URLSearchParams } from "node:url";
import process from "node:process";

import { ensureRequiredEnv } from "./config.mjs";

function normalizeCpanelHost() {
  ensureRequiredEnv(["CPANEL_HOST", "CPANEL_API_TOKEN", "SSH_USER"]);

  return process.env.CPANEL_HOST.endsWith("/")
    ? process.env.CPANEL_HOST
    : `${process.env.CPANEL_HOST}/`;
}

function flattenCpanelData(rawData) {
  if (!Array.isArray(rawData)) {
    return [];
  }

  return rawData.flatMap((entry) => {
    if (Array.isArray(entry?.record)) {
      return entry.record;
    }

    return entry ? [entry] : [];
  });
}

export async function callCpanelApi2(module, func, params = {}) {
  const host = normalizeCpanelHost();
  const url = new URL("json-api/cpanel", host);
  const query = new URLSearchParams({
    cpanel_jsonapi_user: process.env.SSH_USER,
    cpanel_jsonapi_apiversion: "2",
    cpanel_jsonapi_module: module,
    cpanel_jsonapi_func: func,
  });

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }

  url.search = query.toString();

  const response = await fetch(url, {
    headers: {
      Authorization: `cpanel ${process.env.SSH_USER}:${process.env.CPANEL_API_TOKEN}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`cPanel API request failed with ${response.status}.`);
  }

  const payload = await response.json();
  const event = payload?.cpanelresult?.event;

  if (event?.result === 0) {
    throw new Error(event.reason || "cPanel API request failed.");
  }

  return payload;
}

export async function fetchZoneRecords(domain) {
  const payload = await callCpanelApi2("ZoneEdit", "fetchzone_records", {
    domain,
  });

  return flattenCpanelData(payload?.cpanelresult?.data);
}

function normalizeRecordName(name) {
  return String(name || "").replace(/\.$/, "").toLowerCase();
}

export async function ensureTxtRecord({ domain, name, value, ttl = 300 }) {
  const records = await fetchZoneRecords(domain);
  const targetName = normalizeRecordName(name || domain);
  const existing = records.find(
    (record) =>
      String(record.type || "").toUpperCase() === "TXT" &&
      normalizeRecordName(record.name) === targetName &&
      String(record.txtdata || record.record || "").trim() === String(value).trim(),
  );

  if (existing) {
    return {
      changed: false,
      record: existing,
    };
  }

  const payload = await callCpanelApi2("ZoneEdit", "add_zone_record", {
    domain,
    name: name || domain,
    type: "TXT",
    txtdata: value,
    ttl,
  });

  return {
    changed: true,
    result: payload?.cpanelresult?.data || [],
  };
}
