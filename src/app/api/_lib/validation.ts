import { z } from "zod";

import { locales } from "@/lib/site";

export const rateLimitWindowMs = 10 * 60 * 1000;
export const maxRequestsPerWindow = 8;
export const maxFormBodyBytes = 32 * 1024;

export type LimitedJsonResult =
  | { ok: true; value: unknown }
  | { code: "INVALID_JSON" | "PAYLOAD_TOO_LARGE"; ok: false };

export async function readLimitedJsonBody(
  request: Request,
  maxBytes = maxFormBodyBytes,
): Promise<LimitedJsonResult> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength) {
    const parsedLength = Number.parseInt(declaredLength, 10);
    if (Number.isFinite(parsedLength) && parsedLength > maxBytes) {
      return { code: "PAYLOAD_TOO_LARGE", ok: false };
    }
  }

  if (!request.body) {
    return { code: "INVALID_JSON", ok: false };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel("payload too large").catch(() => undefined);
        return { code: "PAYLOAD_TOO_LARGE", ok: false };
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return {
      ok: true,
      value: JSON.parse(new TextDecoder().decode(bytes)) as unknown,
    };
  } catch {
    return { code: "INVALID_JSON", ok: false };
  }
}

const consentSchema = z
  .union([z.literal(true), z.literal("true"), z.literal("on")])
  .transform(() => true);

const optionalText = z.string().trim().max(500).optional();
const optionalLongText = z.string().trim().max(3000).optional();

const optionalNumber = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    return value;
  },
  z.coerce.number().int().min(0).max(100000).optional(),
);

const baseFields = {
  consent: consentSchema,
  locale: z.enum(locales).optional(),
  path: z.string().trim().max(300).optional(),
  source: z.string().trim().max(100).optional(),
  utm_campaign: z.string().trim().max(200).optional(),
  utm_content: z.string().trim().max(200).optional(),
  utm_medium: z.string().trim().max(200).optional(),
  utm_source: z.string().trim().max(200).optional(),
  utm_term: z.string().trim().max(200).optional(),
  website: z.string().trim().max(500).optional(),
};

export const waitlistSchema = z.object({
  ...baseFields,
  building_type: optionalText,
  country: optionalText,
  email: z.string().trim().email().max(320),
  interest_type: z.string().trim().max(120).optional(),
  message: optionalLongText,
  name: optionalText,
  number_of_buildings: optionalNumber,
  organization: optionalText,
  role: optionalText,
});

export const contactSchema = z.object({
  ...baseFields,
  email: z.string().trim().email().max(320),
  message: z.string().trim().min(10).max(3000),
  name: z.string().trim().min(2).max(160),
  subject: z.string().trim().min(2).max(180),
});

export type FormTarget = "contact" | "waitlist";
export type ParsedPayload = z.infer<typeof waitlistSchema> | z.infer<typeof contactSchema>;

// Cloudflare overwrites CF-Connecting-IP with the visitor address before
// forwarding a proxied request to the origin. Prefer that value so separate
// visitors do not collapse onto the same Cloudflare-to-origin proxy hop.
// The final X-Forwarded-For hop remains the non-Cloudflare fallback because
// the nearest reverse proxy is the only hop the application can trust there.
export function getClientKey(
  cfConnectingIp: string | null,
  forwardedFor: string | null,
  realIp: string | null,
) {
  const cloudflareClient = cfConnectingIp?.trim();
  const nearestHop = forwardedFor?.split(",").pop()?.trim();
  return cloudflareClient || nearestHop || realIp || "unknown";
}

export function hasSpamTrap(payload: Record<string, unknown>) {
  const trapValues = ["website", "company_url", "homepage"].map((key) => payload[key]);
  return trapValues.some((value) => typeof value === "string" && value.trim().length > 0);
}

// Per-process in-memory store: this limiter only shares state within a single
// Node worker. If the deploy target ever runs more than one worker process
// for this app (e.g. Passenger scales beyond one instance), each process
// enforces its own independent 8-requests/10-min budget, so the effective
// site-wide cap becomes (workers x 8) rather than a hard 8. Making this
// globally accurate requires a shared store (Redis/KV/etc.); until then this
// is a best-effort guard, not a hard limit.
export class RateLimiter {
  private store = new Map<string, { count: number; resetAt: number }>();

  private prune(now: number) {
    for (const [key, entry] of this.store) {
      if (entry.resetAt <= now) {
        this.store.delete(key);
      }
    }
  }

  isLimited(key: string, now = Date.now()) {
    this.prune(now);

    const existing = this.store.get(key);
    if (!existing || existing.resetAt <= now) {
      if (this.store.size >= 5000) {
        const oldestKey = this.store.keys().next().value;
        if (oldestKey !== undefined) this.store.delete(oldestKey);
      }
      this.store.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
      return false;
    }

    existing.count += 1;
    return existing.count > maxRequestsPerWindow;
  }
}
