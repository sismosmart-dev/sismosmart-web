import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { renderStaticPage } from "@/components/localized-subpage";
import { StructuredData } from "@/components/structured-data";
import {
  getPages,
  resolveStaticPageKey,
  routeSegments,
  staticPageKeys,
} from "@/lib/pages";
import { getPageStructuredData } from "@/lib/structured-data";
import { buildPageMetadata } from "@/lib/metadata";
import { isLocale, locales, type Locale } from "@/lib/site";

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

  const metadata = getPages(locale)[pageKey].meta;
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

  return (
    <>
      <StructuredData
        data={getPageStructuredData(locale as Locale, pageKey)}
        id={`${locale}-${pageKey}-structured-data`}
      />
      {renderStaticPage(locale as Locale, pageKey)}
    </>
  );
}
