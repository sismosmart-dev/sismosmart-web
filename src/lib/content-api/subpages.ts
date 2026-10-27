import "server-only";

import { cache } from "react";

import { mergeSubpageIntro } from "@/lib/content-api/subpages-shared";
import { readPublishedOverride } from "@/lib/content-api/storage";
import { getPages, type StaticPageKey } from "@/lib/pages";
import type { RoutePagesCopy } from "@/lib/page-copy";
import type { Locale } from "@/lib/site";

/** The same validated published intro feeds HTML, SEO metadata and JSON-LD. */
export const getCmsSubpageCopy = cache(async (locale: Locale, pageKey: StaticPageKey): Promise<RoutePagesCopy> => {
  const pages = getPages(locale);
  const intro = await readPublishedOverride(locale, `page.${pageKey}.intro`);
  return mergeSubpageIntro(pages, pageKey, intro);
});
