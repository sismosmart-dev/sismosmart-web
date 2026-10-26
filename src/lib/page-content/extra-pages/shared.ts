import type { InfoPageCopy, RoutePagesCopy } from "@/lib/page-copy";

type ExtraPageInput = {
  eyebrow: string;
  metaTitle: string;
  metaDescription: string;
  title: string;
  description: string;
  sections: Array<[string, string]>;
};

type ExtraPagesInput = {
  technology: ExtraPageInput;
  pilotProgram: ExtraPageInput;
  investors: ExtraPageInput;
  faq: ExtraPageInput;
  security: ExtraPageInput;
};

function toInfoPage(page: ExtraPageInput): InfoPageCopy {
  return {
    meta: {
      title: page.metaTitle,
      description: page.metaDescription,
    },
    eyebrow: page.eyebrow,
    title: page.title,
    description: page.description,
    sections: page.sections.map(([title, description]) => ({ title, description })),
  };
}

export type ExtraRoutePagesCopy = Pick<
  RoutePagesCopy,
  "technology" | "pilotProgram" | "investors" | "faq" | "security"
>;

export function makeExtraPages(input: ExtraPagesInput): ExtraRoutePagesCopy {
  return {
    technology: toInfoPage(input.technology),
    pilotProgram: toInfoPage(input.pilotProgram),
    investors: toInfoPage(input.investors),
    faq: toInfoPage(input.faq),
    security: toInfoPage(input.security),
  };
}
