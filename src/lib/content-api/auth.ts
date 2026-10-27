import { createHash, timingSafeEqual } from "node:crypto";

/** A separate 32+-character random CMS token is required for any admin action. */
export function authorizeContentAdmin(
  authorization: string | null,
  configuredToken: string | undefined = process.env.CMS_ADMIN_TOKEN,
) {
  if (!configuredToken || configuredToken.length < 32 || !/^[\x21-\x7e]+$/.test(configuredToken)) return false;
  const presented = /^Bearer ([A-Za-z0-9_-]{32,256})$/.exec(authorization || "")?.[1] || "";
  const expected = createHash("sha256").update(configuredToken).digest();
  const actual = createHash("sha256").update(presented).digest();
  return timingSafeEqual(expected, actual) && presented.length === configuredToken.length;
}

export function sameOrigin(origin: string | null, configured: string = "https://sismosmart.com") {
  if (!origin) return true; // CLI server-to-server Bearer access has no browser Origin.
  try { return new URL(origin).origin === new URL(configured).origin; } catch { return false; }
}
