const BLOCKING_AXE_IMPACTS = new Set(["critical", "serious"]);
const SENSITIVE_RESULT_KEYS = new Set([
  "authorization",
  "browserexecutable",
  "childprocess",
  "cookie",
  "cookies",
  "endpoint",
  "headers",
  "payload",
  "pid",
  "rawbody",
  "rawheaders",
  "rawrequest",
  "serveraddress",
  "token",
]);

export const browserQualityRoutes = [
  { key: "en-home", locale: "en", path: "/en" },
  { key: "tr-home", locale: "tr", path: "/tr" },
  { key: "en-product", locale: "en", path: "/en/product" },
  { key: "tr-product", locale: "tr", path: "/tr/product" },
  { key: "en-contact", locale: "en", path: "/en/contact" },
  { key: "tr-pilot", locale: "tr", path: "/tr/pilot-program" },
  { key: "en-guides", locale: "en", path: "/en/guides" },
  {
    key: "tr-guide-device",
    locale: "tr",
    path: "/tr/guides/bina-deprem-sensoru-sismik-izleme",
  },
];

function finiteNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function filterBlockingAxeViolations(violations = []) {
  return violations
    .filter((violation) => BLOCKING_AXE_IMPACTS.has(violation?.impact))
    .map((violation) => {
      const nodes = Array.isArray(violation.nodes) ? violation.nodes : [];
      const targets = nodes
        .flatMap((node) =>
          Array.isArray(node?.target)
            ? [node.target.map((part) => String(part)).join(" ")]
            : [],
        )
        .map((target) => target.slice(0, 200))
        .slice(0, 5);
      return {
        help: violation.help || "",
        id: violation.id || "unknown",
        impact: violation.impact,
        nodeCount: nodes.length,
        targets,
      };
    });
}

export function findDuplicateIds(ids = []) {
  const counts = new Map();
  for (const value of ids) {
    const id = String(value || "").trim();
    if (!id) continue;
    counts.set(id, (counts.get(id) || 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id, count]) => ({ count, id }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function evaluateLayout({ clientWidth, h1Rect, mainRect, scrollWidth }) {
  const viewportWidth = Math.max(0, finiteNumber(clientWidth));
  const documentWidth = Math.max(0, finiteNumber(scrollWidth));
  const horizontalOverflowPx = Math.max(0, documentWidth - viewportWidth);
  const mainVisible =
    finiteNumber(mainRect?.width) > 0 && finiteNumber(mainRect?.height) > 0;
  const h1Visible =
    finiteNumber(h1Rect?.width) > 0 && finiteNumber(h1Rect?.height) > 0;

  return {
    blocking: horizontalOverflowPx > 1 || !mainVisible || !h1Visible,
    h1Visible,
    horizontalOverflowPx,
    mainVisible,
  };
}

export function isLoopbackUrl(value) {
  if (value === "about:blank" || String(value).startsWith("data:")) return true;

  try {
    const url = new URL(value);
    return (
      url.protocol === "http:" &&
      ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

export function summarizeForwardRequest({
  authorization,
  contentType,
  expectedToken,
  payload,
  route,
}) {
  return {
    authorizationMatches: authorization === `Bearer ${expectedToken}`,
    contentTypeMatches: String(contentType || "")
      .toLowerCase()
      .startsWith("application/json"),
    locale: typeof payload?.locale === "string" ? payload.locale : null,
    pagePath:
      typeof payload?.path === "string"
        ? payload.path
        : typeof payload?.page_path === "string"
          ? payload.page_path
          : null,
    route,
    source: typeof payload?.source === "string" ? payload.source : null,
    utmSource:
      typeof payload?.utm_source === "string" ? payload.utm_source : null,
  };
}

function isSensitiveKey(key) {
  const normalized = String(key).replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (SENSITIVE_RESULT_KEYS.has(normalized)) return true;
  return /(authorization|cookie|password|payload|privatekey|rawbody|secret|token)$/.test(
    normalized,
  );
}

export function sanitizeBrowserResult(value) {
  if (Array.isArray(value)) return value.map((item) => sanitizeBrowserResult(item));
  if (!value || typeof value !== "object") return value;

  const result = {};
  for (const [key, item] of Object.entries(value)) {
    if (isSensitiveKey(key)) continue;
    result[key] = sanitizeBrowserResult(item);
  }
  return result;
}
