import type { Metadata } from "next";

import { getMarkdownAlternativeUrl } from "@/lib/agent-discovery";
import { assetPaths } from "@/lib/asset-paths";
import { locales, siteConfig, type Locale } from "@/lib/site";

const openGraphLocales: Record<Locale, string> = {
  tr: "tr_TR",
  en: "en_US",
  es: "es_ES",
  it: "it_IT",
  id: "id_ID",
  pt: "pt_PT",
};

export function buildPageMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
): Metadata {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const markdownAlternative = getMarkdownAlternativeUrl(locale, normalizedPath);
  const localizedPath = normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`;
  const languages = Object.fromEntries(
    locales.map((entry) => [
      entry,
      normalizedPath === "/"
        ? `${siteConfig.url}/${entry}`
        : `${siteConfig.url}/${entry}${normalizedPath}`,
    ]),
  );
  const ogImage = `${siteConfig.url}${assetPaths.ogImage}`;

  return {
    title,
    description,
    category: "technology",
    robots: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
    alternates: {
      canonical: `${siteConfig.url}${localizedPath}`,
      languages: {
        ...languages,
        "x-default":
          normalizedPath === "/"
            ? `${siteConfig.url}/en`
            : `${siteConfig.url}/en${normalizedPath}`,
      },
      ...(markdownAlternative
        ? { types: { "text/markdown": markdownAlternative } }
        : {}),
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}${localizedPath}`,
      siteName: siteConfig.name,
      locale: openGraphLocales[locale],
      alternateLocale: locales
        .filter((entry) => entry !== locale)
        .map((entry) => openGraphLocales[entry]),
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} - ${title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@sismosmart",
      site: "@sismosmart",
      images: [ogImage],
    },
  };
}
