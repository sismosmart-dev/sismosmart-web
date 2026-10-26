import type { MetadataRoute } from "next";

import { routeSegments, staticPageKeys } from "@/lib/pages";
import { locales, siteConfig } from "@/lib/site";
import { getGuides, getGuideCanonicalPath, getGuideAlternates } from "@/lib/guides/catalog";
import { guideLocales } from "@/lib/guides/types";

function languageAlternates(path: string) {
  return Object.fromEntries(
    locales.map((locale) => [
      locale,
      path === "/" ? `${siteConfig.url}/${locale}` : `${siteConfig.url}/${locale}${path}`,
    ]),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push({
      url: `${siteConfig.url}/${locale}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
          languages: {
            ...languageAlternates("/"),
            "x-default": `${siteConfig.url}/en`,
          },
      },
    });

    for (const pageKey of staticPageKeys) {
      const path = routeSegments[pageKey];

      entries.push({
        url: `${siteConfig.url}/${locale}${path}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: {
          languages: {
            ...languageAlternates(path),
            "x-default": `${siteConfig.url}/en${path}`,
          },
        },
      });
    }
  }

  for (const locale of guideLocales) {
    const guides = getGuides(locale);
    const maxUpdatedAt = guides.reduce(
      (max, g) => (g.updatedAt > max ? g.updatedAt : max),
      guides[0].updatedAt,
    );

    entries.push({
      url: `${siteConfig.url}/${locale}/guides`,
      lastModified: new Date(maxUpdatedAt),
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: {
          en: `${siteConfig.url}/en/guides`,
          tr: `${siteConfig.url}/tr/guides`,
          "x-default": `${siteConfig.url}/en/guides`,
        },
      },
    });

    for (const guide of guides) {
      const canonicalPath = getGuideCanonicalPath(guide);

      entries.push({
        url: `${siteConfig.url}${canonicalPath}`,
        lastModified: new Date(guide.updatedAt),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: getGuideAlternates(guide.translationKey),
        },
      });
    }
  }

  return entries;
}
