import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";
import { assetPaths } from "@/lib/asset-paths";
import {
  getGuideAlternates,
  getGuideCanonicalPath,
  getGuideMarkdownPath,
  getGuideHub,
} from "@/lib/guides/catalog";
import type { GuideContent, GuideLocale } from "@/lib/guides/types";

const openGraphLocales: Record<GuideLocale, string> = {
  en: "en_US",
  tr: "tr_TR",
};

export function buildGuideHubMetadata(locale: GuideLocale): Metadata {
  const hub = getGuideHub(locale);
  const canonicalPath = `/${locale}/guides`;
  const canonical = `${siteConfig.url}${canonicalPath}`;
  const markdownPath = `/${locale}/guides.md`;
  const ogImage = `${siteConfig.url}${assetPaths.ogImage}`;

  return {
    title: hub.title,
    description: hub.description,
    category: "technology",
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical,
      languages: {
        en: `${siteConfig.url}/en/guides`,
        tr: `${siteConfig.url}/tr/guides`,
        "x-default": `${siteConfig.url}/en/guides`,
      },
      types: {
        "text/markdown": `${siteConfig.url}${markdownPath}`,
      },
    },
    openGraph: {
      title: hub.title,
      description: hub.description,
      url: canonical,
      siteName: siteConfig.name,
      locale: openGraphLocales[locale],
      alternateLocale: (["en", "tr"] as const)
        .filter((l) => l !== locale)
        .map((l) => openGraphLocales[l]),
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} - ${hub.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: hub.title,
      description: hub.description,
      creator: "@sismosmart",
      site: "@sismosmart",
      images: [ogImage],
    },
  };
}

export function buildGuideMetadata(guide: GuideContent): Metadata {
  const canonicalPath = getGuideCanonicalPath(guide);
  const canonical = `${siteConfig.url}${canonicalPath}`;
  const markdownPath = getGuideMarkdownPath(guide);
  const ogImage = `${siteConfig.url}${assetPaths.ogImage}`;
  const alternates = getGuideAlternates(guide.translationKey);

  return {
    title: guide.title,
    description: guide.description,
    category: "technology",
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical,
      languages: alternates,
      types: {
        "text/markdown": `${siteConfig.url}${markdownPath}`,
      },
    },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: canonical,
      siteName: siteConfig.name,
      locale: openGraphLocales[guide.locale],
      alternateLocale: (["en", "tr"] as const)
        .filter((l) => l !== guide.locale)
        .map((l) => openGraphLocales[l]),
      type: "article",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} - ${guide.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
      creator: "@sismosmart",
      site: "@sismosmart",
      images: [ogImage],
    },
  };
}
