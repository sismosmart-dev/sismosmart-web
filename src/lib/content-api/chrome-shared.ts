import type { ContentDocument } from "@/lib/content-api/contracts";
import {
  getFooterNavigation, getLayoutChromeLabels, getPrimaryNavigation,
  getSourceNavigationLabels,
} from "@/lib/pages";
import { getCopy, type Locale } from "@/lib/site";

/** Shared public chrome. Stable route targets, links, and warnings are never CMS-managed. */
export function getSourceSiteChrome(locale: Locale): ContentDocument<"site.chrome"> {
  const copy = getCopy(locale);
  const labels = getLayoutChromeLabels(locale);
  return {
    navigation: {
      eyebrow: copy.navigation.eyebrow,
      primaryCta: copy.navigation.primaryCta,
      labels: getSourceNavigationLabels(locale),
    },
    footer: { note: labels.note, explore: labels.explore, legal: copy.footer.legal },
  };
}

export function resolveSiteChrome(locale: Locale, published: ContentDocument<"site.chrome"> | null) {
  const source = getSourceSiteChrome(locale);
  const selected = published ?? source;
  const labels = { ...source.navigation.labels, ...selected.navigation.labels };
  return {
    brandEyebrow: selected.navigation.eyebrow,
    primaryCta: selected.navigation.primaryCta,
    navigation: getPrimaryNavigation(locale, labels),
    footerNavigation: getFooterNavigation(locale, labels),
    footerLabels: { ...getLayoutChromeLabels(locale, labels), note: selected.footer.note, explore: selected.footer.explore },
    legal: selected.footer.legal,
  };
}
