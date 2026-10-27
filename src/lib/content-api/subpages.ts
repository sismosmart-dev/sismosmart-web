import "server-only";

import { cache } from "react";

import { isSectionsPageKey, isDetailsPageKey } from "@/lib/content-api/contracts";
import { mergeContactCopy } from "@/lib/content-api/contact-shared";
import { mergeSubpageIntro, mergeSubpageSections, mergeSubpageDetails } from "@/lib/content-api/subpages-shared";
import { readPublishedOverride } from "@/lib/content-api/storage";
import { getPages, type StaticPageKey } from "@/lib/pages";
import type { RoutePagesCopy } from "@/lib/page-copy";
import type { Locale } from "@/lib/site";

/** The same validated published intro feeds HTML, SEO metadata and JSON-LD. */
export const getCmsSubpageCopy = cache(async (locale: Locale, pageKey: StaticPageKey): Promise<RoutePagesCopy> => {
  const pages = getPages(locale);
  const [intro, sections, details, contact] = await Promise.all([
    readPublishedOverride(locale, `page.${pageKey}.intro`),
    isSectionsPageKey(pageKey) ? readPublishedOverride(locale, `page.${pageKey}.sections`) : Promise.resolve(null),
    isDetailsPageKey(pageKey) ? readPublishedOverride(locale, `page.${pageKey}.details`) : Promise.resolve(null),
    pageKey === "contact" ? readPublishedOverride(locale, "page.contact.copy") : Promise.resolve(null),
  ]);
  const withIntro = mergeSubpageIntro(pages, pageKey, intro);
  const withSections = isSectionsPageKey(pageKey) ? mergeSubpageSections(withIntro, pageKey, sections) : withIntro;
  const withDetails = isDetailsPageKey(pageKey) ? mergeSubpageDetails(withSections, pageKey, details) : withSections;
  return pageKey === "contact" ? mergeContactCopy(withDetails, contact) : withDetails;
});
