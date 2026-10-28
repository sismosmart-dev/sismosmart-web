import { pathToFileURL } from "node:url";

import { probePublicRoutes } from "./production-health-probes.mjs";

const PUBLIC_BASE_URL = "https://sismosmart.com";

export function summarizePublicHealth(report) {
  const routes = Array.isArray(report?.routes) ? report.routes : [];
  if (routes.length !== 8) {
    return { ok: false, checked: routes.length, failed: ["route-count"] };
  }
  const failed = routes
    .filter((route) => !route?.cold?.ok || !route?.warm?.ok)
    .map((route) => String(route.key));
  return { ok: Boolean(report.ok) && failed.length === 0, checked: routes.length, failed };
}

export async function runPublicHealth({ probe = probePublicRoutes, log = console.log } = {}) {
  const result = await probe({ config: { publicBaseUrl: PUBLIC_BASE_URL } });
  const summary = summarizePublicHealth(result);
  // Only public route keys and aggregate counts are logged; no headers,
  // addresses, response bodies, account identifiers or secret material.
  log(`PUBLIC_HEALTH ok=${summary.ok} checked=${summary.checked} failed=${summary.failed.length}`);
  for (const key of summary.failed) log(`PUBLIC_HEALTH_FAILED_ROUTE key=${key}`);
  // When the historical Cloudflare 525 recurs, retain only safe correlation
  // evidence (UTC time, the public CF-Ray ID and colo) in this tokenless job.
  // Do not dump raw headers, URLs, response bodies or network endpoints.
  for (const route of Array.isArray(result?.routes) ? result.routes : []) {
    const key = String(route?.key ?? "");
    if (!/^[a-z][a-z-]{0,30}$/.test(key)) continue;
    for (const sample of ["cold", "warm"]) {
      const measurement = route?.[sample];
      if (measurement?.status !== 525) continue;
      const candidate = String(measurement.cfRay ?? "");
      const ray = /^[A-Fa-f0-9]{8,32}-[A-Za-z]{3}$/.test(candidate)
        ? candidate : "unavailable";
      const colo = ray === "unavailable" ? "unknown" : ray.split("-")[1].toUpperCase();
      const date = new Date(measurement.observedAtUtc ?? NaN);
      const utc = Number.isFinite(date.getTime()) ? date.toISOString() : "unknown";
      log(`PUBLIC_TLS_525 key=${key} sample=${sample} utc=${utc} cfRay=${ray} colo=${colo}`);
    }
  }
  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runPublicHealth()
    .then((summary) => {
      if (!summary.ok) process.exitCode = 1;
    })
    .catch(() => {
      console.error("PUBLIC_HEALTH error=probe-failed");
      process.exitCode = 1;
    });
}
