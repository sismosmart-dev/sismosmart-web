import "server-only";

import { createChromeCache } from "@/lib/content-api/chrome-cache";
import { resolveSiteChrome } from "@/lib/content-api/chrome-shared";
import { readPublishedOverride } from "@/lib/content-api/storage";
import type { Locale } from "@/lib/site";

// Six bounded per-worker entries at most, with in-flight coalescing. Published
// layout copy is eventually consistent across workers (5s maximum TTL).
const cachedRead = createChromeCache((locale: Locale) => readPublishedOverride(locale, "site.chrome"));

export async function getCmsSiteChrome(locale: Locale) {
  // A disabled CMS must never consult SQL or reuse a previously cached override.
  if (process.env.CMS_DB_ENABLED !== "true") return resolveSiteChrome(locale, null);
  return resolveSiteChrome(locale, await cachedRead(locale));
}
