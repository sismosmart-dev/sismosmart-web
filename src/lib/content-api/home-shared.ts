import type { ContentDocument } from "@/lib/content-api/contracts";
import type { SiteCopy } from "@/lib/site";

/** Source-controlled links, routes and verification notices cannot be changed by content updates. */
export function mergeHomeSections(source: SiteCopy, sections: ContentDocument<"home.sections"> | null): SiteCopy {
  if (!sections) return source;
  const { hero, demo, ...other } = sections;
  return {
    ...source,
    hero: { ...source.hero, ...hero },
    demo: { ...source.demo, ...demo },
    ...other,
  };
}
