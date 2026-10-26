import {
  aggregateFormAccess,
  evaluateThreshold,
  evaluateWorkflowStreak,
} from "./production-health-lib.mjs";
import { productionHealthWorkflowTargets } from "./production-health-workflows.mjs";

const GIB = 1024 ** 3;
export function findWarmRoute(routeSet, key) {
  return routeSet?.routes?.find((route) => route.key === key)?.warm;
}

export function summarizeProductionHealthProbe(probe) {
  if (!probe) return null;
  return {
    cacheStatus: probe.cacheStatus || null,
    cloudflare: Boolean(probe.cloudflare),
    configured:
      typeof probe.configured === "boolean" ? probe.configured : undefined,
    connectMs: probe.connectMs ?? null,
    errorCode: probe.errorCode || null,
    lookupMs: probe.lookupMs ?? null,
    ok: Boolean(probe.ok),
    status: probe.status ?? null,
    target: probe.target,
    tlsMs: probe.tlsMs ?? null,
    totalMs: probe.totalMs ?? null,
    ttfbMs: probe.ttfbMs ?? null,
  };
}

export function summarizeProductionHealthRouteSet(routeSet) {
  return {
    ok: Boolean(routeSet?.ok),
    routes: (routeSet?.routes || []).map((route) => ({
      cold: summarizeProductionHealthProbe(route.cold),
      key: route.key,
      warm: summarizeProductionHealthProbe(route.warm),
    })),
  };
}

export function buildProductionHealthCapacityResult(remote, quota, resources, warnings) {
  const filesystem = evaluateThreshold(remote?.filesystemUsagePercent, {
    critical: 95,
    warning: 85,
  });
  const releaseCount = evaluateThreshold(remote?.releaseCount, {
    critical: 13,
    warning: 9,
  });
  const releaseBytes = evaluateThreshold(remote?.releaseBytes, {
    critical: 2 * GIB + 1,
    warning: GIB + 1,
  });
  const quotaThreshold = quota.available
    ? evaluateThreshold(quota.usagePercent, { critical: 90, warning: 80 })
    : null;
  const normalizedResources = resources.map((resource) => {
    const usagePercent =
      resource.maximum > 0
        ? Math.round((resource.usage / resource.maximum) * 10_000) / 100
        : null;
    return {
      ...resource,
      usagePercent,
    };
  });

  for (const [label, measurement] of [
    ["host filesystem usage", filesystem],
    ["release count", releaseCount],
    ["release bytes", releaseBytes],
    ["account quota", quotaThreshold],
  ]) {
    if (measurement?.severity === "warning") {
      warnings.push(`${label} is above the warning threshold`);
    }
    if (measurement?.severity === "error") {
      warnings.push(`${label} is above the critical threshold`);
    }
    if (measurement?.severity === "unavailable") {
      warnings.push(`${label} measurement is unavailable`);
    }
  }

  if (!quota.available) warnings.push("account quota limit is unavailable");

  return {
    // `df` reflects the host filesystem on shared hosting, not the account quota.
    // Keep it visible as capacity evidence, but only account/app-scoped limits block.
    blocking: [releaseCount, releaseBytes, quotaThreshold].some(
      (measurement) => measurement?.severity === "error",
    ),
    filesystem,
    ...(remote?.capacityDiagnostics
      ? { diagnostics: remote.capacityDiagnostics }
      : {}),
    quota: { ...quota, severity: quotaThreshold?.severity || "unavailable" },
    releaseBytes,
    releaseCount,
    resources: normalizedResources,
  };
}

export function buildProductionHealthFormsResult(publicSet, remote, warnings) {
  const contact = findWarmRoute(publicSet, "contact");
  const waitlist = findWarmRoute(publicSet, "waitlist");
  const runtimeOk = Boolean(
    contact?.ok &&
      contact?.configured &&
      contact?.target === "contact" &&
      waitlist?.ok &&
      waitlist?.configured &&
      waitlist?.target === "waitlist",
  );
  const access = aggregateFormAccess(remote?.formRecords || []);
  const blocking =
    access.serverError >= 5 && access.serverErrorRate >= 0.2;

  if (!remote?.formLogAvailable && access.total === 0) {
    warnings.push("form access-log aggregation is unavailable");
  } else if (access.serverError > 0) {
    warnings.push("form access logs contain server errors");
  }

  return {
    access,
    blocking,
    ok: runtimeOk,
    runtime: {
      contact: Boolean(contact?.ok && contact?.configured),
      waitlist: Boolean(waitlist?.ok && waitlist?.configured),
    },
  };
}

export function buildProductionHealthWorkflowResult(runsByTarget, warnings) {
  const targets = {};
  for (const key of Object.keys(productionHealthWorkflowTargets)) {
    const result = evaluateWorkflowStreak(runsByTarget?.[key] || [], 2);
    targets[key] = result;
    if (result.consecutiveFailures === 1) {
      warnings.push(`${key} workflow latest run failed once`);
    }
  }
  return {
    blocking: Object.values(targets).some((target) => target.blocking),
    targets,
  };
}
