import "server-only";

import { cache } from "react";

import { readPublishedOverride } from "@/lib/content-api/storage";
import { getCmsGuide } from "@/lib/content-api/guides";
import { getGuideHub, getGuides } from "@/lib/guides/catalog";
import type { GuideContent, GuideLocale, GuideHubCopy } from "@/lib/guides/types";

/** Request-scoped published hub and related guide card copy; canonical URLs remain source-controlled. */
export const getCmsGuideHub = cache(async (locale: GuideLocale): Promise<{ hub: GuideHubCopy; guides: GuideContent[] }> => {
  const base = getGuideHub(locale);
  if (process.env.CMS_DB_ENABLED !== "true") return { hub: base, guides: [...getGuides(locale)] };
  const [copy, ...guides] = await Promise.all([
    readPublishedOverride(locale, "guides.hub"),
    ...getGuides(locale).map((guide) => getCmsGuide(locale, guide.slug)),
  ]);
  return { hub: { ...base, ...copy }, guides: guides.filter((guide): guide is GuideContent => guide !== null) };
});
