import type { GuideSection } from "@/lib/guides/types";

export function partitionGuideSections(
  sections: readonly GuideSection[],
  limitationsHeading: string,
): {
  contentSections: readonly GuideSection[];
  limitationParagraphs: readonly string[];
} {
  const contentSections: GuideSection[] = [];
  let limitationParagraphs: string[] = [];
  for (const section of sections) {
    if (section.heading === limitationsHeading) {
      limitationParagraphs = section.paragraphs;
    } else {
      contentSections.push(section);
    }
  }
  return { contentSections, limitationParagraphs };
}
