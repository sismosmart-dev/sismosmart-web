import dns from "node:dns/promises";
import net from "node:net";
import { performance } from "node:perf_hooks";

function rounded(value) {
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
}

export function safeErrorCode(error) {
  const code = String(error?.code || "REQUEST_FAILED");
  return /^[A-Z0-9_]+$/.test(code) ? code : "REQUEST_FAILED";
}

export async function resolvePublicDns({
  hostname,
  lookupImpl = dns.lookup,
  nowImpl = () => performance.now(),
}) {
  const startedAt = nowImpl();
  try {
    const addresses = await lookupImpl(hostname, { all: true });
    return {
      durationMs: rounded(nowImpl() - startedAt),
      ok: addresses.length > 0,
    };
  } catch (error) {
    return {
      durationMs: rounded(nowImpl() - startedAt),
      errorCode: safeErrorCode(error),
      ok: false,
    };
  }
}

export async function resolveOriginAddress({
  config,
  isIpImpl = net.isIP,
  lookupImpl = dns.lookup,
}) {
  try {
    const family = isIpImpl(config.sshHost);
    if (family) {
      return { address: config.sshHost, family, ok: true };
    }
    const resolved = await lookupImpl(config.sshHost);
    return { address: resolved.address, family: resolved.family, ok: true };
  } catch (error) {
    return { errorCode: safeErrorCode(error), ok: false };
  }
}
