import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StructuredData } from "@/components/structured-data";
import { getCmsGuideHub } from "@/lib/content-api/guide-hub";
import { buildGuideHubMetadata } from "@/lib/guides/metadata";
import { getHubStaticParams, resolveHubLocale } from "@/lib/guides/routing";
import { getGuideHubStructuredData } from "@/lib/guides/structured-data";
import { GuideHubPage } from "@/components/guides/guide-hub-page";

export const dynamic = "force-dynamic";

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
  const { hub } = await getCmsGuideHub(resolved);
  return buildGuideHubMetadata(resolved, hub);
}

export default async function GuideHubRoute({ params }: GuideHubProps) {
  const { locale } = await params;
  const resolved = resolveHubLocale(locale);
  if (!resolved) notFound();

  const { hub, guides } = await getCmsGuideHub(resolved);

  return (
    <>
      <StructuredData
        data={getGuideHubStructuredData(resolved, hub)}
        id={`${resolved}-guides-structured-data`}
      />
      <GuideHubPage locale={resolved} hub={hub} guides={guides} />
    </>
  );
}
