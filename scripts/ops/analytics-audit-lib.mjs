const analyticsHosts = new Set([
  "analytics.google.com",
  "region1.analytics.google.com",
  "region1.google-analytics.com",
  "stats.g.doubleclick.net",
  "www.google-analytics.com",
]);

export function classifyAnalyticsRequest(rawUrl) {
  const url = new URL(rawUrl);
  const host = url.hostname.toLowerCase();
  const path = url.pathname;

  if (host === "www.googletagmanager.com" && path === "/gtag/js") {
    return { kind: "ga-loader", eventName: null };
  }
  if (host === "www.googletagmanager.com" && path === "/gtm.js") {
    return { kind: "gtm-loader", eventName: null };
  }
  if (host === "www.clarity.ms" && path.startsWith("/tag/")) {
    return { kind: "clarity-loader", eventName: null };
  }
  if (host.endsWith("clarity.ms")) {
    return { kind: "clarity-collect", eventName: null };
  }
  if (analyticsHosts.has(host) && path.includes("/g/collect")) {
    return { kind: "ga-collect", eventName: url.searchParams.get("en") };
  }
  return { kind: "other", eventName: null };
}

export function normalizeDataLayerEntry(entry) {
  if (Array.isArray(entry)) return entry;
  if (entry && typeof entry === "object" && Number.isInteger(entry.length)) {
    return Array.from(entry);
  }
  return entry;
}

export function countRequests(requests, kind, eventName = null) {
  return requests.filter((request) => {
    const classification = request.kind
      ? { kind: request.kind, eventName: request.eventName ?? null }
      : classifyAnalyticsRequest(request.url);
    return (
      classification.kind === kind &&
      (eventName === null || classification.eventName === eventName)
    );
  }).length;
}

export function countPageViewRequests(requests) {
  return requests.filter((request) => {
    const classification = request.kind
      ? { kind: request.kind, eventName: request.eventName ?? null }
      : classifyAnalyticsRequest(request.url);
    return (
      classification.kind === "ga-collect" &&
      (classification.eventName === null || classification.eventName === "page_view")
    );
  }).length;
}

export function countDataLayerCommands(dataLayer, command, argument = null) {
  return dataLayer.filter((entry) => {
    const normalized = normalizeDataLayerEntry(entry);
    return (
      Array.isArray(normalized) &&
      normalized[0] === command &&
      (argument === null || normalized[1] === argument)
    );
  }).length;
}

export function getLogicalPageViewEvidence(dataLayer, requests, measurementId) {
  const configCommandCount = countDataLayerCommands(dataLayer, "config", measurementId);
  const beaconCount = countPageViewRequests(requests);
  const networkFanoutBounded = beaconCount <= 2;
  return {
    configCommandCount,
    beaconCount,
    logicalPageViewCount:
      configCommandCount === 1 && beaconCount >= 1 && networkFanoutBounded ? 1 : 0,
    networkFanoutBounded,
  };
}

export function buildCheck(name, ok, details, severity = "error") {
  return { name, ok: Boolean(ok), severity, details };
}

export function summarizeChecks(checks) {
  const failed = checks.filter((check) => !check.ok && check.severity === "error");
  const warnings = checks.filter((check) => !check.ok && check.severity === "warning");
  return {
    passed: checks.filter((check) => check.ok).length,
    failed: failed.length,
    warnings: warnings.length,
    ok: failed.length === 0,
  };
}
