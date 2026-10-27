import "server-only";

import { mergeHomeSections } from "@/lib/content-api/home-shared";
import { readPublishedOverride } from "@/lib/content-api/storage";
import { getCopy, type Locale, type SiteCopy } from "@/lib/site";

/** Only approved published fields overlay the existing typed TypeScript content. */
export async function getHomeCopy(locale: Locale): Promise<SiteCopy> {
  const fallback = getCopy(locale);
  const [hero, meta, sections] = await Promise.all([
    readPublishedOverride(locale, "home.hero"),
    readPublishedOverride(locale, "home.meta"),
    readPublishedOverride(locale, "home.sections"),
  ]);
  const publishedSections = mergeHomeSections(fallback, sections);
  return {
    ...publishedSections,
    hero: { ...publishedSections.hero, ...hero },
    meta: { ...publishedSections.meta, ...meta },
  };
}
