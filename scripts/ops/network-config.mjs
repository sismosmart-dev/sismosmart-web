function isIpv4(value) {
  if (typeof value !== "string") return false;
  const parts = value.split(".");
  return parts.length === 4 && parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const number = Number(part);
    return number >= 0 && number <= 255 && String(number) === part;
  });
}

function normalizeProtectedValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function hydrateNetworkConfig(config, environment = process.env, { requireLegacy = false } = {}) {
  const originIpv4 = normalizeProtectedValue(environment.DNS_ORIGIN_IPV4);
  const legacyIpv4 = normalizeProtectedValue(environment.DNS_LEGACY_IPV4);
  const missing = [];

  if (!originIpv4) missing.push("DNS_ORIGIN_IPV4");
  if (requireLegacy && !legacyIpv4) missing.push("DNS_LEGACY_IPV4");

  if (missing.length > 0) {
    throw new Error(`Missing required protected network configuration: ${missing.join(", ")}`);
  }

  if (!isIpv4(originIpv4)) {
    throw new Error("DNS_ORIGIN_IPV4 must be a valid IPv4 address.");
  }

  if (legacyIpv4 && !isIpv4(legacyIpv4)) {
    throw new Error("DNS_LEGACY_IPV4 must be a valid IPv4 address.");
  }

  if (legacyIpv4 && originIpv4 === legacyIpv4) {
    throw new Error("DNS origin and legacy addresses must differ.");
  }

  return {
    ...config,
    originIpv4,
    ...(legacyIpv4 ? { legacyIpv4 } : {}),
  };
}
