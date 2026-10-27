import type { ContentDocument, GuideBodyKey } from "@/lib/content-api/contracts";
import type { GuideContent } from "@/lib/guides/types";

/** Source-controlled identity, citations, dates, safety notices and links never change. */
export function mergeGuideBody(
  guide: GuideContent,
  body: ContentDocument<GuideBodyKey> | null,
): GuideContent {
  return body ? { ...guide, ...body } : guide;
}
