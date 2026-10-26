import { siteConfig } from "@/lib/site";
import type { GuideContent, GuideLocale } from "@/lib/guides/types";
import { getGuideHub, getGuideCanonicalPath } from "@/lib/guides/catalog";
import { getGuideUiStrings } from "@/lib/guides/ui-strings";

function guideArticle(guide: GuideContent): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.h1,
    description: guide.description,
    url: `${siteConfig.url}${getGuideCanonicalPath(guide)}`,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    inLanguage: guide.locale,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

function guideBreadcrumb(guide: GuideContent): object {
  const ui = getGuideUiStrings(guide.locale);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: ui.home,
        item: `${siteConfig.url}/${guide.locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: ui.guides,
        item: `${siteConfig.url}/${guide.locale}/guides`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.h1,
        item: `${siteConfig.url}${getGuideCanonicalPath(guide)}`,
      },
    ],
  };
}

function hubCollectionPage(locale: GuideLocale): object {
  const hub = getGuideHub(locale);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: hub.h1,
    description: hub.description,
    url: `${siteConfig.url}/${locale}/guides`,
    inLanguage: locale,
  };
}

function hubBreadcrumb(locale: GuideLocale): object {
  const ui = getGuideUiStrings(locale);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: ui.home,
        item: `${siteConfig.url}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: ui.guides,
        item: `${siteConfig.url}/${locale}/guides`,
      },
    ],
  };
}

export function getGuideHubStructuredData(locale: GuideLocale): object[] {
  return [hubCollectionPage(locale), hubBreadcrumb(locale)];
}

export function getGuideStructuredData(guide: GuideContent): object[] {
  return [guideArticle(guide), guideBreadcrumb(guide)];
}
