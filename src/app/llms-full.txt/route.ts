import { getAgentPageDescriptor } from "@/lib/agent-discovery";
import { getPages, routeSegments } from "@/lib/pages";
import { locales, siteConfig } from "@/lib/site";
import {
  getGuides,
  getGuideCanonicalPath,
  getGuideHub,
} from "@/lib/guides/catalog";
import { guideLocales } from "@/lib/guides/types";

export const dynamic = "force-static";

const pages = getPages("en");

function absolutePath(path: string) {
  return path === "/" ? `${siteConfig.url}/en` : `${siteConfig.url}/en${path}`;
}

export function GET(): Response {
  const guideSections = guideLocales
    .map((locale) => {
      const hub = getGuideHub(locale);
      const guides = getGuides(locale);
      const hubPath = `/${locale}/guides`;
      const detailLines = guides
        .map((guide) => {
          const canonical = getGuideCanonicalPath(guide);
          return `- [${guide.title}](${siteConfig.url}${canonical}): ${guide.summary}`;
        })
        .join("\n");
      return `### ${hub.title}\n\n- [Guide hub](${siteConfig.url}${hubPath}): ${hub.description}\n\n${detailLines}`;
    })
    .join("\n\n");

  const body = `# ${siteConfig.name} expanded context

> ${siteConfig.description}

## Product status

${siteConfig.name} is a pre-launch seismic monitoring product. It is not yet generally available, and no public retail price or general-availability date has been published. Pilot participation is the current public path for organizations and building owners.

## What the device does

The wall-mounted device measures three-axis building motion during shaking, stores an event recording, and can notify a paired phone when configured thresholds are crossed. The recording is intended to help a qualified engineer review what happened after an earthquake. The device does not certify that a building is safe and is not a substitute for a structural inspection.

## How measurement and reporting work

- The device observes vibration continuously and distinguishes sustained shaking from short local disturbances.
- Event data is buffered locally so a recording can survive a temporary internet interruption.
- Confirmed recordings can be summarized with common earthquake-engineering measurements such as peak ground acceleration and peak ground velocity.
- Longer-term structural-health indicators are informational signals for professional review, not automatic safety decisions.

## Intended audiences

- Residents and small-building owners who want a record of how their building moved.
- Building managers running multi-device pilots.
- Campuses, factories, municipalities, and research teams evaluating building-level monitoring.
- Engineers who may review exported event information after an earthquake.

## Installation and connectivity

The current product concept uses wall mounting, USB-C power, and 2.4 GHz Wi-Fi. Installation details, network requirements, and pilot support are described on the product and pilot pages.

## Privacy and consent

The public website uses consent-controlled analytics. Form submissions are validated and forwarded through server-side endpoints. Product and pilot data handling is described in the privacy and security pages. ${siteConfig.name} does not claim to sell personal data.

## Important limits

- Earthquake warning time can be very short or nonexistent for nearby events.
- A device cannot declare a building safe or unsafe.
- Public product specifications may change before general availability.
- Pricing, ratings, certifications, and shipping dates should not be inferred when they are not explicitly published.

## Canonical public pages

- [Home](${absolutePath(routeSegments.home)}): ${siteConfig.description}
- [Product](${absolutePath(routeSegments.product)}): ${pages.product.description}
- [How it works](${absolutePath(routeSegments.howItWorks)}): ${pages.howItWorks.description}
- [Technology](${absolutePath(routeSegments.technology)}): ${pages.technology.description}
- [Pilot program](${absolutePath(routeSegments.pilotProgram)}): ${pages.pilotProgram.description}
- [FAQ](${absolutePath(routeSegments.faq)}): ${pages.faq.description}
- [Privacy](${absolutePath(routeSegments.privacy)}): ${pages.privacy.description}
- [Security](${absolutePath(routeSegments.security)}): ${pages.security.description}
- [Contact](${absolutePath(routeSegments.contact)}): ${pages.contact.description}
- [Glossary](${absolutePath(routeSegments.glossary)}): ${pages.glossary.description}

## Guide topics

${guideSections}

## Languages and indexes

The public site is available in ${locales.length} languages: ${locales.join(", ")}. English is the default locale, and localized pages use the same route structure under their locale prefix.

- [XML sitemap](${siteConfig.url}/sitemap.xml)
- [Human-readable site map](${siteConfig.url}/sitemap.md)
- [Concise LLM summary](${siteConfig.url}/llms.txt)
- [English home Markdown](${getAgentPageDescriptor("en", "home").markdownUrl})
- [English product Markdown](${getAgentPageDescriptor("en", "product").markdownUrl})
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
