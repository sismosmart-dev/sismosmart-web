import process from "node:process";
import { pathToFileURL } from "node:url";

import {
  requireConfig,
  requireSshAuth,
} from "../deploy/config.mjs";
import {
  classifyHealth,
  evaluateReleaseState,
  normalizeQuota,
  normalizeResourceUsage,
  sanitizeReport,
} from "./production-health-lib.mjs";

import {
  probeOriginRoutes,
  probePublicRoutes,
} from "./production-health-probes.mjs";
export {
  productionHealthPublicRoutes,
  probeOriginRoutes,
  probePublicRoutes,
} from "./production-health-probes.mjs";

import {
  resolveOriginAddress,
  resolvePublicDns,
  safeErrorCode,
} from "./production-health-resolution.mjs";
export {
  resolveOriginAddress,
  resolvePublicDns,
} from "./production-health-resolution.mjs";

import { inspectRemoteProduction } from "./production-health-inspection.mjs";
export {
  buildRemoteInspectionScript,
  inspectRemoteProduction,
  parseRemoteInspection,
} from "./production-health-inspection.mjs";

import { readCpanelHealth } from "./production-health-cpanel.mjs";
export { readCpanelHealth } from "./production-health-cpanel.mjs";

import { readTargetWorkflowRuns } from "./production-health-workflows.mjs";
export { readTargetWorkflowRuns } from "./production-health-workflows.mjs";

import {
  buildProductionHealthCapacityResult,
  buildProductionHealthFormsResult,
  buildProductionHealthWorkflowResult,
  findWarmRoute,
  summarizeProductionHealthRouteSet,
} from "./production-health-aggregation.mjs";

import { writeProductionHealthReport } from "./production-health-report.mjs";
export { formatSafeLogSummary } from "./production-health-report.mjs";

async function callOrFallback(task, fallback) {
  try {
    return await task();
  } catch (error) {
    return fallback(error);
  }
}

export async function runProductionHealth({
  capacityDiagnostics = String(
    process.env.PRODUCTION_HEALTH_CAPACITY_DIAGNOSTICS || "",
  ).toLowerCase() === "true",
  config,
  inspectRemote = inspectRemoteProduction,
  now = () => new Date(),
  probeOrigin = probeOriginRoutes,
  probePublic = probePublicRoutes,
  readCpanel = readCpanelHealth,
  readWorkflowRuns = readTargetWorkflowRuns,
  resolveOrigin = resolveOriginAddress,
  resolvePublic = resolvePublicDns,
} = {}) {
  if (!config) throw new Error("Production health config is required.");

  const warnings = [];
  const hostname = new URL(config.publicBaseUrl).hostname;

  const dnsResult = await callOrFallback(
    () => resolvePublic({ config, hostname }),
    (error) => ({ errorCode: safeErrorCode(error), ok: false }),
  );
  const originResolution = await callOrFallback(
    () => resolveOrigin({ config, hostname }),
    (error) => ({ errorCode: safeErrorCode(error), ok: false }),
  );

  const cpanelPromise = callOrFallback(
    () => readCpanel({ config, includeDiagnostics: capacityDiagnostics }),
    () => ({
      quotaPayload: null,
      resourcePayload: null,
      warnings: ["cPanel quota/resource usage could not be read"],
    }),
  );
  const workflowPromise = callOrFallback(
    () => readWorkflowRuns({ config }),
    () => null,
  );
  const [publicRaw, originRaw] = await Promise.all([
    callOrFallback(
      () => probePublic({ config, hostname }),
      (error) => ({ errorCode: safeErrorCode(error), ok: false, routes: [] }),
    ),
    callOrFallback(
      () => probeOrigin({ config, hostname, origin: originResolution }),
      (error) => ({ errorCode: safeErrorCode(error), ok: false, routes: [] }),
    ),
  ]);
  const remoteRaw = await callOrFallback(
    () => inspectRemote({ capacityDiagnostics, config }),
    () => null,
  );
  const [cpanelRaw, workflowRuns] = await Promise.all([
    cpanelPromise,
    workflowPromise,
  ]);

  const publicResult = summarizeProductionHealthRouteSet(publicRaw);
  const originResult = summarizeProductionHealthRouteSet(originRaw);
  const publicWarmTtfb = findWarmRoute(publicRaw, "en")?.ttfbMs;
  const originWarmTtfb = findWarmRoute(originRaw, "en")?.ttfbMs;
  if (Number.isFinite(publicWarmTtfb) && publicWarmTtfb > 1500) {
    warnings.push("public warm TTFB is above 1500 ms");
  }
  if (Number.isFinite(originWarmTtfb) && originWarmTtfb > 1200) {
    warnings.push("origin warm TTFB is above 1200 ms");
  }
  if (!originResolution.ok) {
    warnings.push("origin address could not be resolved from the SSH host");
  }

  const release = remoteRaw
    ? evaluateReleaseState(remoteRaw)
    : { mismatches: ["inspection-unavailable"], ok: false };
  if (!remoteRaw) warnings.push("release inspection is unavailable");
  const quota = normalizeQuota(cpanelRaw?.quotaPayload);
  const resources = normalizeResourceUsage(cpanelRaw?.resourcePayload);
  warnings.push(...(cpanelRaw?.warnings || []));
  const capacity = buildProductionHealthCapacityResult(remoteRaw, quota, resources, warnings);
  if (capacityDiagnostics && cpanelRaw?.diagnostics) {
    capacity.diagnostics = {
      ...(capacity.diagnostics || {}),
      cpanel: cpanelRaw.diagnostics,
    };
  }
  const forms = buildProductionHealthFormsResult(publicRaw, remoteRaw, warnings);

  let workflows;
  if (workflowRuns) {
    workflows = buildProductionHealthWorkflowResult(workflowRuns, warnings);
  } else {
    warnings.push("target workflow history could not be read");
    workflows = { blocking: false, targets: {} };
  }

  const reportBase = {
    capacity,
    dns: {
      durationMs: dnsResult.durationMs ?? null,
      errorCode: dnsResult.errorCode || null,
      ok: Boolean(dnsResult.ok),
    },
    forms,
    generatedAt: now().toISOString(),
    origin: originResult,
    public: publicResult,
    release: {
      buildIdPresent: Boolean(remoteRaw?.buildId),
      mismatches: release.mismatches,
      ok: release.ok,
    },
    schemaVersion: 1,
    warnings: [...new Set(warnings)],
    workflows,
  };
  const health = classifyHealth(reportBase);
  const report = sanitizeReport({ ...reportBase, ...health });

  return {
    exitCode: health.blocking ? 1 : 0,
    report,
  };
}

async function main() {
  const config = requireSshAuth(
    requireConfig([
      "domain",
      "publicBaseUrl",
      "remoteAppDomain",
      "remoteAppRoot",
      "remoteAppUri",
      "remoteHome",
      "remotePublicRoot",
      "remoteReleasesRoot",
      "sshHost",
      "sshUser",
    ]),
  );
  const result = await runProductionHealth({ config });
  await writeProductionHealthReport(result.report);
  process.exitCode = result.exitCode;
}

const isCli =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  main().catch((error) => {
    console.error(`Production health audit failed: ${safeErrorCode(error)}`);
    process.exitCode = 1;
  });
}
