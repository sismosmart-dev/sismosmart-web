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
