import "server-only";

import { readPublishedOverride } from "@/lib/content-api/storage";
import { getCopy, type Locale, type SiteCopy } from "@/lib/site";

/** Only approved published fields overlay the existing typed TypeScript content. */
export async function getHomeCopy(locale: Locale): Promise<SiteCopy> {
  const fallback = getCopy(locale);
  const [hero, meta] = await Promise.all([
    readPublishedOverride(locale, "home.hero"),
    readPublishedOverride(locale, "home.meta"),
  ]);
  return {
    ...fallback,
    hero: { ...fallback.hero, ...hero },
    meta: { ...fallback.meta, ...meta },
  };
}
