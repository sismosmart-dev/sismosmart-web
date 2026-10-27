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
