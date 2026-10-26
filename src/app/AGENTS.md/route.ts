import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export function GET(): Response {
  const body = `# ${siteConfig.name} public agent guidance

## Overview

${siteConfig.name} publishes a multilingual public website about a pre-launch seismic monitoring device for homes and small buildings. Canonical HTML pages are available under language-prefixed routes, and each canonical page has a same-path Markdown representation.

## Installation

No installation is required to read the public website. Start with [llms.txt](${siteConfig.url}/llms.txt), the [human-readable sitemap](${siteConfig.url}/sitemap.md), or a localized page such as [English home](${siteConfig.url}/en).

For public source review, use the repository documentation linked from the website and follow the supported Node.js version declared by the project before running its documented npm commands.

## Configuration

Public page content does not require credentials. Language routes use one of: en, tr, es, id, pt, or it. Request a page with an explicit \`Accept: text/markdown\` header or append \`.md\` to a localized canonical route to receive Markdown.

## Usage

Prefer canonical HTML URLs when citing the website. Use Markdown representations for structured reading, [OpenAPI](${siteConfig.url}/openapi.json) for the public form contract, and [llms-full.txt](${siteConfig.url}/llms-full.txt) for expanded context.

## Validation

Check [sitemap.xml](${siteConfig.url}/sitemap.xml) for canonical indexable pages, [sitemap.md](${siteConfig.url}/sitemap.md) for human-readable discovery, and each Markdown response's canonical Link header before treating it as an alternate representation.

## Safety and limitations

${siteConfig.name} is not an emergency service and does not determine whether a building is safe. Product, hardware, detection, connectivity, performance, and certification details remain pre-launch design targets until pilot validation and formal approval. Do not infer private infrastructure, credentials, pricing, availability, or engineering conclusions that are not stated on the canonical public pages.
`;

  return new Response(body, {
    headers: {
      "cache-control": "public, max-age=3600",
      "content-type": "text/markdown; charset=utf-8",
    },
  });
}
