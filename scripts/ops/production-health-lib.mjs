const FAILURE_CONCLUSIONS = new Set([
  "action_required",
  "cancelled",
  "failure",
  "stale",
  "timed_out",
]);

const SENSITIVE_KEYS = new Set([
  "authorization",
  "cookie",
  "cookies",
  "originaddress",
  "password",
  "payload",
  "privatekey",
  "query",
  "rawlines",
  "rawrecords",
  "referrer",
  "secrethost",
  "secretvalue",
  "sshhost",
  "token",
  "useragent",
]);

function finiteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function firstFinite(...values) {
  for (const value of values) {
    const parsed = finiteNumber(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

export function evaluateThreshold(value, { warning, critical }) {
  const numeric = finiteNumber(value);
  if (numeric === null) return { severity: "unavailable", value: null };
  if (numeric >= critical) return { severity: "error", value: numeric };
  if (numeric >= warning) return { severity: "warning", value: numeric };
  return { severity: "ok", value: numeric };
}

export function evaluateReleaseState({
  buildId,
  current,
  htaccess,
  passenger,
  processCwds = [],
}) {
  const mismatches = [];

  if (!passenger || current !== passenger) mismatches.push("current");
  if (!passenger || htaccess !== passenger) mismatches.push("htaccess");
  if (!passenger || !processCwds.includes(passenger)) {
    mismatches.push("process-cwd");
  }
  if (!buildId) mismatches.push("build-id");

  return {
    mismatches,
    ok: Boolean(passenger) && mismatches.length === 0,
  };
}

export function aggregateFormAccess(records = []) {
  const summary = {
    clientError: 0,
    serverError: 0,
    serverErrorRate: 0,
    success: 0,
    total: 0,
  };

  for (const record of records) {
    if (record?.route !== "contact" && record?.route !== "waitlist") continue;
    const status = finiteNumber(record?.status);
    if (!Number.isInteger(status) || status < 100 || status > 599) continue;

    summary.total += 1;
    if (status >= 200 && status < 400) summary.success += 1;
    else if (status >= 400 && status < 500) summary.clientError += 1;
    else if (status >= 500) summary.serverError += 1;
  }

  summary.serverErrorRate =
    summary.total === 0 ? 0 : summary.serverError / summary.total;
  return summary;
}

export function normalizeQuota(payload) {
  const data = Array.isArray(payload?.data) ? payload.data[0] : payload?.data;
  const megabytesUsed = finiteNumber(data?.megabytes_used);
  const megabyteLimit = finiteNumber(data?.megabyte_limit);
  const usageBytes = firstFinite(
    data?.byte_usage,
    data?.bytes_used,
    data?.usage_bytes,
    data?.used,
    megabytesUsed === null ? null : megabytesUsed * 1024 * 1024,
  );
  const limitBytes = firstFinite(
    data?.byte_limit,
    data?.bytes_limit,
    data?.limit_bytes,
    data?.limit,
    megabyteLimit === null ? null : megabyteLimit * 1024 * 1024,
  );

  const available = Boolean(limitBytes && limitBytes > 0);
  return {
    available,
    limitBytes: available ? limitBytes : null,
    usageBytes,
    usagePercent:
      available && usageBytes !== null
        ? Math.round((usageBytes / limitBytes) * 10_000) / 100
        : null,
  };
}

export function normalizeResourceUsage(payload) {
  const data = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.data?.items)
      ? payload.data.items
      : [];

  return data
    .map((item) => ({
      description: String(item?.description || item?.id || "resource"),
      id: String(item?.id || item?.description || "resource"),
      maximum: finiteNumber(item?.maximum ?? item?.max),
      usage: finiteNumber(item?.usage ?? item?.current),
    }))
    .filter((item) => item.maximum !== null && item.usage !== null);
}

export function evaluateWorkflowStreak(runs = [], minimumFailures = 2) {
  let consecutiveFailures = 0;

  for (const run of runs) {
    if (!FAILURE_CONCLUSIONS.has(run?.conclusion)) break;
    consecutiveFailures += 1;
  }

  return {
    blocking: consecutiveFailures >= minimumFailures,
    consecutiveFailures,
    latestConclusion: runs[0]?.conclusion || null,
  };
}

export function classifyHealth(report) {
  if (!report?.release?.ok) {
    return { blocking: true, classification: "release-state" };
  }
  if (!report?.dns?.ok) {
    return { blocking: true, classification: "dns" };
  }
  if (!report?.public?.ok && report?.origin?.ok) {
    return { blocking: true, classification: "cloudflare-edge" };
  }
  if (!report?.origin?.ok) {
    return { blocking: true, classification: "origin-passenger" };
  }
  if (report?.forms?.blocking || report?.forms?.ok === false) {
    return { blocking: true, classification: "application-form-runtime" };
  }
  if (report?.capacity?.blocking) {
    return { blocking: true, classification: "capacity" };
  }
  if (report?.workflows?.blocking) {
    return { blocking: true, classification: "github-actions" };
  }
  if ((report?.warnings?.length || 0) > 0) {
    return { blocking: false, classification: "healthy-with-warnings" };
  }
  return { blocking: false, classification: "healthy" };
}

function isSensitiveKey(key) {
  const normalized = String(key).replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (SENSITIVE_KEYS.has(normalized)) return true;
  return /(password|passphrase|privatekey|secret|token)$/.test(normalized);
}

export function sanitizeReport(value) {
  if (Array.isArray(value)) return value.map((item) => sanitizeReport(item));
  if (!value || typeof value !== "object") return value;

  const result = {};
  for (const [key, item] of Object.entries(value)) {
    if (isSensitiveKey(key)) continue;
    result[key] = sanitizeReport(item);
  }
  return result;
}
