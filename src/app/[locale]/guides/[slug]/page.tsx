import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StructuredData } from "@/components/structured-data";
import { getGuideBySlug } from "@/lib/guides/catalog";
import { buildGuideMetadata } from "@/lib/guides/metadata";
import { getDetailStaticParams, resolveDetailParams } from "@/lib/guides/routing";
import { getGuideStructuredData } from "@/lib/guides/structured-data";
import { GuideDetailPage } from "@/components/guides/guide-detail-page";

type GuideDetailProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return getDetailStaticParams();
}

export async function generateMetadata({ params }: GuideDetailProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolved = resolveDetailParams(locale, slug);
  if (!resolved) return {};
  const guide = getGuideBySlug(resolved.locale, resolved.slug);
  if (!guide) return {};
  return buildGuideMetadata(guide);
}

export default async function GuideDetailRoute({ params }: GuideDetailProps) {
  const { locale, slug } = await params;
  const resolved = resolveDetailParams(locale, slug);
  if (!resolved) notFound();

  const guide = getGuideBySlug(resolved.locale, resolved.slug);
  if (!guide) notFound();

  return (
    <>
      <StructuredData
        data={getGuideStructuredData(guide)}
        id={`${resolved.locale}-${guide.slug}-structured-data`}
      />
      <GuideDetailPage locale={resolved.locale} guide={guide} />
    </>
  );
}
