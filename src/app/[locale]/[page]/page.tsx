import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { renderStaticPage } from "@/components/localized-subpage";
import { StructuredData } from "@/components/structured-data";
import {
  resolveStaticPageKey,
  routeSegments,
  staticPageKeys,
} from "@/lib/pages";
import { getCmsSubpageCopy } from "@/lib/content-api/subpages";
import { getPageStructuredData } from "@/lib/structured-data";
import { buildPageMetadata } from "@/lib/metadata";
import { isLocale, locales, type Locale } from "@/lib/site";

// CMS-enabled pages read only a small, validated intro override per request.
export const dynamic = "force-dynamic";

type LocalizedStaticPageProps = {
  params: Promise<{ locale: string; page: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    staticPageKeys.map((pageKey) => ({
      locale,
      page: routeSegments[pageKey].slice(1),
    })),
  );
}

export async function generateMetadata({
  params,
}: LocalizedStaticPageProps): Promise<Metadata> {
  const { locale, page } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const pageKey = resolveStaticPageKey(page);

  if (!pageKey) {
    return {};
  }

  const metadata = (await getCmsSubpageCopy(locale, pageKey))[pageKey].meta;
  return buildPageMetadata(
    locale,
    routeSegments[pageKey],
    metadata.title,
    metadata.description,
  );
}

export default async function LocalizedStaticPage({
  params,
}: LocalizedStaticPageProps) {
  const { locale, page } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const pageKey = resolveStaticPageKey(page);

  if (!pageKey) {
    notFound();
  }

  const pages = await getCmsSubpageCopy(locale, pageKey);

  return (
    <>
      <StructuredData
        data={getPageStructuredData(locale as Locale, pageKey, pages)}
        id={`${locale}-${pageKey}-structured-data`}
      />
      {renderStaticPage(locale as Locale, pageKey, pages)}
    </>
  );
}
