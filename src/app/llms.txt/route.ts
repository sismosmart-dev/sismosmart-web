import {
  getAgentPageDescriptor,
  type AgentPageKey,
} from "@/lib/agent-discovery";
import { locales, siteConfig } from "@/lib/site";
import { getGuideCanonicalPath, getGuideMarkdownPath, getGuideByTranslationKey } from "@/lib/guides/catalog";
import { guideTranslationKeys } from "@/lib/guides/types";

/** A concise, link-first public summary following the llmstxt.org convention. */
export const dynamic = "force-static";

const englishPageKeys: Array<{
  label: string;
  pageKey: AgentPageKey;
  note: string;
}> = [
  { label: "Home", pageKey: "home", note: "What SismoSmart is and who it is for." },
  { label: "Product", pageKey: "product", note: "The device, its specifications, and installation concept." },
  { label: "How it works", pageKey: "howItWorks", note: "From vibration to measurement and notification." },
  { label: "Technology", pageKey: "technology", note: "The sensing, connectivity, and data approach." },
  { label: "Pilot program", pageKey: "pilotProgram", note: "Multi-device pilots for buildings and organizations." },
  { label: "FAQ", pageKey: "faq", note: "Common questions about accuracy, privacy, and alerts." },
  { label: "About", pageKey: "about", note: "The team and why the product exists." },
  { label: "Contact", pageKey: "contact", note: "Public contact channels and form." },
  { label: "Glossary", pageKey: "glossary", note: "Definitions of seismic and building-motion terminology." },
];

export function GET(): Response {
  const keyPages = englishPageKeys
    .map((entry) => {
      const page = getAgentPageDescriptor("en", entry.pageKey);
      return `- [${entry.label}](${page.canonicalUrl}): ${entry.note} [Markdown](${page.markdownUrl})`;
    })
    .join("\n");
  const homeMarkdown = getAgentPageDescriptor("en", "home").markdownUrl;

  const guideLinks = guideTranslationKeys
    .map((key) => {
      const guide = getGuideByTranslationKey("en", key);
      const canonical = getGuideCanonicalPath(guide);
      const markdown = getGuideMarkdownPath(guide);
      return `- [${guide.title}](${siteConfig.url}${canonical}): ${guide.description} [Markdown](${siteConfig.url}${markdown})`;
    })
    .join("\n");

  const body = `# ${siteConfig.name}

> ${siteConfig.name} is a pre-launch building seismic monitoring project developing a wall-mounted device to record building motion for qualified post-event review. Detection, notification, connectivity, performance, and certification remain design targets pending pilot validation.

${siteConfig.name} is being developed for homes and small buildings. The site is published in ${locales.length} languages (${locales.join(", ")}); English is the default.

## Key pages

${keyPages}

## Guides

- [English guide hub](${siteConfig.url}/en/guides): Hub for all English guides. [Markdown](${siteConfig.url}/en/guides.md)

${guideLinks}

## Notes for language models

- Canonical domain: ${siteConfig.url}
- Localized routes use /{lang}/... where lang is one of ${locales.join(", ")}.
- Same-path Markdown starts at ${homeMarkdown} and is also available with an explicit Accept: text/markdown request.
- Public agent guidance: ${siteConfig.url}/AGENTS.md
- Terminology: ${siteConfig.url}/en/glossary
- Sitemap: ${siteConfig.url}/sitemap.xml
- Human-readable sitemap: ${siteConfig.url}/sitemap.md
- Expanded context: ${siteConfig.url}/llms-full.txt
- OpenAPI contract: ${siteConfig.url}/openapi.json
- ${siteConfig.name} is not an emergency service and does not determine whether a building is safe.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
