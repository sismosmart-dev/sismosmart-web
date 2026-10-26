import {
  agentPageKeys,
  getAgentPageDescriptor,
} from "@/lib/agent-discovery";
import { localeLabels, locales, siteConfig } from "@/lib/site";
import {
  getGuides,
  getGuideMarkdownPath,
  getGuideHub,
} from "@/lib/guides/catalog";
import { guideLocales } from "@/lib/guides/types";

export const dynamic = "force-static";

export function GET(): Response {
  const sections = locales
    .map((locale) => {
      const links = agentPageKeys
        .map((pageKey) => {
          const page = getAgentPageDescriptor(locale, pageKey);
          return `- [${page.title}](${page.markdownUrl})`;
        })
        .join("\n");

      return `## ${localeLabels[locale]}\n\n${links}`;
    })
    .join("\n\n");

  const guideSection = guideLocales
    .map((locale) => {
      const hub = getGuideHub(locale);
      const hubMarkdown = `/${locale}/guides.md`;
      const guides = getGuides(locale);
      const detailLinks = guides
        .map((guide) => {
          const markdown = getGuideMarkdownPath(guide);
          return `- [${guide.title}](${siteConfig.url}${markdown})`;
        })
        .join("\n");
      return `### ${hub.title}\n\n- [${hub.h1}](${siteConfig.url}${hubMarkdown})\n\n${detailLinks}`;
    })
    .join("\n\n");

  const body = `# ${siteConfig.name} Markdown alternatives

> Localized Markdown views generated from the same public page copy used by the HTML website.

${sections}

## Guide Markdown

${guideSection}

## Other machine-readable resources

- [Public agent guidance](${siteConfig.url}/AGENTS.md)
- [Human-readable sitemap](${siteConfig.url}/sitemap.md)
- [OpenAPI contract](${siteConfig.url}/openapi.json)
- [Concise LLM summary](${siteConfig.url}/llms.txt)
- [Expanded LLM context](${siteConfig.url}/llms-full.txt)
`;

  return new Response(body, {
    headers: {
      "cache-control": "public, max-age=3600",
      "content-type": "text/markdown; charset=utf-8",
    },
  });
}
