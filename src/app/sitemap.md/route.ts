import {
  getAgentPageDescriptor,
  agentPageKeys,
} from "@/lib/agent-discovery";
import { localeLabels, locales, siteConfig } from "@/lib/site";
import {
  getGuides,
  getGuideCanonicalPath,
  getGuideMarkdownPath,
} from "@/lib/guides/catalog";
import { guideLocales } from "@/lib/guides/types";

export const dynamic = "force-static";

export function GET(): Response {
  const languages = locales
    .map((locale) => {
      const home = getAgentPageDescriptor(locale, "home");
      return `- [${localeLabels[locale]}](${home.canonicalUrl}) ([Markdown](${home.markdownUrl}))`;
    })
    .join("\n");

  const englishPages = agentPageKeys
    .map((pageKey) => {
      const page = getAgentPageDescriptor("en", pageKey);
      return `- [${page.title}](${page.canonicalUrl}): ${page.description} ([Markdown](${page.markdownUrl}))`;
    })
    .join("\n");

  const guideSections = guideLocales
    .map((locale) => {
      const label = locale === "en" ? "English" : "Turkish";
      const guides = getGuides(locale);
      const hubPath = `/${locale}/guides`;
      const hubMarkdown = `${hubPath}.md`;
      const detailLines = guides
        .map((guide) => {
          const canonical = getGuideCanonicalPath(guide);
          const markdown = getGuideMarkdownPath(guide);
          return `- [${guide.title}](${siteConfig.url}${canonical}): ${guide.description} ([Markdown](${siteConfig.url}${markdown}))`;
        })
        .join("\n");
      return `## ${label} guides\n\n- [${label} guide hub](${siteConfig.url}${hubPath}) ([Markdown](${siteConfig.url}${hubMarkdown}))\n\n${detailLines}`;
    })
    .join("\n\n");

  const body = `# ${siteConfig.name} site map

> Human-readable navigation for ${siteConfig.name}'s public website.

## Languages

${languages}

## English key pages

${englishPages}

${guideSections}

## Machine-readable indexes

- [XML sitemap](${siteConfig.url}/sitemap.xml)
- [LLM summary](${siteConfig.url}/llms.txt)
- [Expanded LLM context](${siteConfig.url}/llms-full.txt)
- [Public agent guidance](${siteConfig.url}/AGENTS.md)
- [Terminology glossary](${siteConfig.url}/en/glossary)
- [Markdown alternatives index](${siteConfig.url}/markdown)
- [OpenAPI contract](${siteConfig.url}/openapi.json)
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
