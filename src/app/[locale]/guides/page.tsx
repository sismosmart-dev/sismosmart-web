import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StructuredData } from "@/components/structured-data";
import { getGuideHub } from "@/lib/guides/catalog";
import { buildGuideHubMetadata } from "@/lib/guides/metadata";
import { getHubStaticParams, resolveHubLocale } from "@/lib/guides/routing";
import { getGuideHubStructuredData } from "@/lib/guides/structured-data";
import { GuideHubPage } from "@/components/guides/guide-hub-page";

type GuideHubProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return getHubStaticParams();
}

export async function generateMetadata({ params }: GuideHubProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved = resolveHubLocale(locale);
  if (!resolved) return {};
  return buildGuideHubMetadata(resolved);
}

export default async function GuideHubRoute({ params }: GuideHubProps) {
  const { locale } = await params;
  const resolved = resolveHubLocale(locale);
  if (!resolved) notFound();

  const hub = getGuideHub(resolved);

  return (
    <>
      <StructuredData
        data={getGuideHubStructuredData(resolved)}
        id={`${resolved}-guides-structured-data`}
      />
      <GuideHubPage locale={resolved} hub={hub} />
    </>
  );
}
