import type { RoutePagesCopy } from "@/lib/page-copy";
import type { StaticPageKey } from "@/lib/pages";
import type { ContentDocument, PageIntroKey } from "@/lib/content-api/contracts";

export function mergeSubpageIntro(
  pages: RoutePagesCopy,
  pageKey: StaticPageKey,
  intro: ContentDocument<PageIntroKey> | null,
): RoutePagesCopy {
  if (!intro) return pages;
  return { ...pages, [pageKey]: { ...pages[pageKey], ...intro } };
}

/** Apply approved editorial cards only to matching pages; never overwrite links or form controls. */
export function mergeSubpageSections<K extends import("@/lib/content-api/contracts").SectionPageKey>(
  pages: RoutePagesCopy,
  pageKey: K,
  content: import("@/lib/content-api/contracts").ContentDocument<`page.${K}.sections`> | null,
): RoutePagesCopy {
  if (!content) return pages;
  return { ...pages, [pageKey]: { ...pages[pageKey], sections: content.sections } };
}

/** Page-specific text, no CTA destinations or form endpoints can be overwritten. */
export function mergeSubpageDetails<K extends import("@/lib/content-api/contracts").DetailsPageKey>(
  pages: RoutePagesCopy,
  pageKey: K,
  content: import("@/lib/content-api/contracts").ContentDocument<`page.${K}.details`> | null,
): RoutePagesCopy {
  if (!content) return pages;
  return { ...pages, [pageKey]: { ...pages[pageKey], ...content } };
}
