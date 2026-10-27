import "server-only";

import { cache } from "react";

import { mergeGuideBody } from "@/lib/content-api/guides-shared";
import { readPublishedOverride } from "@/lib/content-api/storage";
import { getGuideBySlug } from "@/lib/guides/catalog";
import type { GuideLocale } from "@/lib/guides/types";

/** One request-scoped published snapshot shared by HTML, metadata and JSON-LD. */
export const getCmsGuide = cache(async (locale: GuideLocale, slug: string) => {
  const guide = getGuideBySlug(locale, slug);
  if (!guide) return null;
  const body = await readPublishedOverride(locale, `guide.${guide.translationKey}.body`);
  return mergeGuideBody(guide, body);
});
