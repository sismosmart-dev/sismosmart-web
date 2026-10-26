import net from "node:net";

export function normalizeHostname(value) {
  return String(value || "")
    .trim()
    .replace(/\.$/, "")
    .toLowerCase();
}

export function normalizeHostnames(values) {
  return [...new Set(values.map(normalizeHostname).filter(Boolean))].sort();
}

export function sameStringSet(left, right) {
  const normalizedLeft = normalizeHostnames(left);
  const normalizedRight = normalizeHostnames(right);

  return (
    normalizedLeft.length === normalizedRight.length &&
    normalizedLeft.every((value, index) => value === normalizedRight[index])
  );
}

export function ipv4ToBigInt(value) {
  if (net.isIP(value) !== 4) {
    throw new Error(`Invalid IPv4 address: ${value}`);
  }

  return value.split(".").reduce((result, octet) => {
    return (result << 8n) + BigInt(Number.parseInt(octet, 10));
  }, 0n);
}

export function ipv4InCidr(address, cidr) {
  const [network, rawPrefix] = String(cidr).trim().split("/", 2);
  const prefix = Number.parseInt(rawPrefix, 10);

  if (net.isIP(network) !== 4 || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    throw new Error(`Invalid IPv4 CIDR: ${cidr}`);
  }

  const shift = BigInt(32 - prefix);
  return ipv4ToBigInt(address) >> shift === ipv4ToBigInt(network) >> shift;
}

export function ipv4InAnyCidr(address, cidrs) {
  return cidrs.some((cidr) => ipv4InCidr(address, cidr));
}

export function classifyLegacyEndpoint({
  dnsReferencesLegacy,
  domainBodyHash,
  randomBodyHash,
  certificateAuthorized,
}) {
  if (dnsReferencesLegacy) {
    return {
      acceptable: false,
      classification: "dns-referenced-legacy-endpoint",
      reason: "At least one current DNS answer still references the legacy address.",
    };
  }

  if (certificateAuthorized) {
    return {
      acceptable: false,
      classification: "legacy-certificate-authorized",
      reason: "The legacy endpoint still presents a certificate authorized for the production hostname.",
    };
  }

  if (domainBodyHash && domainBodyHash === randomBodyHash) {
    return {
      acceptable: true,
      classification: "isolated-provider-catch-all",
      reason:
        "The legacy address is absent from DNS and serves the same generic provider page for arbitrary Host values.",
    };
  }

  return {
    acceptable: false,
    classification: "domain-specific-legacy-content",
    reason: "The legacy endpoint serves content that differs from the provider catch-all response.",
  };
}

export function createUnconfiguredLegacyEndpoint() {
  return {
    configured: false,
    ipv4: null,
    domainResponse: null,
    randomResponse: null,
    classification: {
      acceptable: true,
      classification: "not-configured",
      reason: "No distinct legacy origin address is configured; endpoint-specific checks were skipped.",
    },
    dnsReferencesLegacy: null,
  };
}

export function buildCheck(name, ok, details, severity = "error") {
  return {
    name,
    ok: Boolean(ok),
    severity,
    details,
  };
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
