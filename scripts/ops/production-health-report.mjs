import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { sanitizeReport } from "./production-health-lib.mjs";

function safeFailureProbe(probe) {
  return {
    cloudflare: Boolean(probe?.cloudflare),
    configured:
      typeof probe?.configured === "boolean" ? probe.configured : null,
    errorCode: probe?.errorCode || null,
    ok: Boolean(probe?.ok),
    status: probe?.status ?? null,
    target: probe?.target || null,
  };
}

const CPANEL_DIAGNOSTIC_CLASSES = new Set([
  "CONFIG_UNAVAILABLE",
  "HTTP_4XX",
  "HTTP_5XX",
  "NETWORK_OR_UNKNOWN",
  "SUCCESS",
  "TIMEOUT",
  "TLS_HOSTNAME_MISMATCH",
  "TLS_OTHER",
  "UAPI_FAILURE",
]);

function safeCpanelDiagnosticClass(value) {
  return CPANEL_DIAGNOSTIC_CLASSES.has(value) ? value : "NETWORK_OR_UNKNOWN";
}

function safeCpanelDiagnostics(diagnostics) {
  return {
    quota: safeCpanelDiagnosticClass(diagnostics?.quota),
    resources: safeCpanelDiagnosticClass(diagnostics?.resources),
  };
}

function safeCapacityDiagnostics(diagnostics) {
  if (!diagnostics) return null;
  const categories = diagnostics.categories || {};
  return {
    categories: {
      apps: categories.apps ?? 0,
      public: categories.public ?? 0,
      logs: categories.logs ?? 0,
      mail: categories.mail ?? 0,
      cache: categories.cache ?? 0,
      localData: categories.localData ?? 0,
      tmp: categories.tmp ?? 0,
      backups: categories.backups ?? 0,
      other: categories.other ?? 0,
    },
    ...(diagnostics.cpanel
      ? { cpanel: safeCpanelDiagnostics(diagnostics.cpanel) }
      : {}),
    filesystemAvailableBytes: diagnostics.filesystemAvailableBytes ?? null,
    filesystemTotalBytes: diagnostics.filesystemTotalBytes ?? null,
    filesystemUsedBytes: diagnostics.filesystemUsedBytes ?? null,
    homeBytes: diagnostics.homeBytes ?? null,
  };
}

function failedRouteSummaries(routeSet) {
  return (routeSet?.routes || [])
    .filter((route) => !route?.cold?.ok || !route?.warm?.ok)
    .map((route) => ({
      key: route.key,
      cold: safeFailureProbe(route.cold),
      warm: safeFailureProbe(route.warm),
    }));
}

export function formatSafeLogSummary(report) {
  const safe = sanitizeReport({
    blocking: Boolean(report?.blocking),
    capacity: {
      filesystem: report?.capacity?.filesystem || null,
      ...(report?.capacity?.diagnostics
        ? { diagnostics: safeCapacityDiagnostics(report.capacity.diagnostics) }
        : {}),
      quota: report?.capacity?.quota
        ? {
            severity: report.capacity.quota.severity,
            usagePercent: report.capacity.quota.usagePercent,
          }
        : null,
      releaseBytes: report?.capacity?.releaseBytes || null,
      releaseCount: report?.capacity?.releaseCount || null,
    },
    classification: report?.classification || "unknown",
    forms: {
      access: report?.forms?.access || null,
      ok: Boolean(report?.forms?.ok),
    },
    originFailures: failedRouteSummaries(report?.origin),
    publicFailures: failedRouteSummaries(report?.public),
    releaseMismatches: report?.release?.mismatches || [],
    warnings: report?.warnings || [],
    workflows: report?.workflows || null,
  });
  return `PRODUCTION_HEALTH_SAFE ${JSON.stringify(safe)}`;
}

export function formatProductionHealthMarkdown(report) {
  const lines = [
    "## Production health",
    "",
    `- Classification: **${report.classification}**`,
    `- Blocking: **${report.blocking ? "yes" : "no"}**`,
    `- DNS: ${report.dns.ok ? "healthy" : "failed"}`,
    `- Public edge: ${report.public.ok ? "healthy" : "failed"}`,
    `- Origin/Passenger: ${report.origin.ok ? "healthy" : "failed"}`,
    `- Release state: ${report.release.ok ? "consistent" : report.release.mismatches.join(", ")}`,
    `- Form runtime: ${report.forms.ok ? "healthy" : "failed"}`,
    `- Capacity critical: ${report.capacity.blocking ? "yes" : "no"}`,
    `- Repeated workflow failures: ${report.workflows.blocking ? "yes" : "no"}`,
  ];

  if (report.warnings.length > 0) {
    lines.push("", "### Warnings", "");
    for (const warning of report.warnings) lines.push(`- ${warning}`);
  }
  return `${lines.join("\n")}\n`;
}

export function escapeWorkflowCommandValue(value) {
  return String(value)
    .replaceAll("%", "%25")
    .replaceAll("\r", "%0D")
    .replaceAll("\n", "%0A");
}

export async function writeProductionHealthReport(
  report,
  {
    env = process.env,
    fsImpl = fs,
    logger = console.log,
    resolvePath = path.resolve,
  } = {},
) {
  const outputPath = resolvePath(
    env.PRODUCTION_HEALTH_OUTPUT || ".artifacts/production-health.json",
  );
  await fsImpl.mkdir(path.dirname(outputPath), { recursive: true });
  await fsImpl.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, {
    mode: 0o600,
  });
  await fsImpl.chmod(outputPath, 0o600);

  if (env.GITHUB_STEP_SUMMARY) {
    await fsImpl.appendFile(
      env.GITHUB_STEP_SUMMARY,
      formatProductionHealthMarkdown(report),
      "utf8",
    );
  }

  for (const warning of report.warnings) {
    logger(
      `::warning title=Production health::${escapeWorkflowCommandValue(warning)}`,
    );
  }

  logger(
    `PRODUCTION_HEALTH classification=${report.classification} blocking=${report.blocking} warnings=${report.warnings.length}`,
  );
  logger(formatSafeLogSummary(report));
  logger(`Production health report: ${outputPath}`);
}
