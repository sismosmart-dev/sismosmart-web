import {
  agentPageKeys,
  getAgentPageDescriptor,
  resolveAgentPage,
} from "@/lib/agent-discovery";
import { renderAgentPageMarkdown } from "@/lib/markdown-content";
import { routeSegments } from "@/lib/pages";
import { locales } from "@/lib/site";

// CMS content changes must be visible in Markdown without a new deployment.
export const dynamic = "force-dynamic";

type MarkdownRouteContext = {
  params: Promise<{ locale: string; page: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    agentPageKeys.map((pageKey) => ({
      locale,
      page: pageKey === "home" ? "home" : routeSegments[pageKey].slice(1),
    })),
  );
}

function notFoundResponse() {
  return new Response("Not found\n", {
    headers: { "content-type": "text/plain; charset=utf-8" },
    status: 404,
  });
}

export async function GET(
  _request: Request,
  { params }: MarkdownRouteContext,
): Promise<Response> {
  const { locale, page } = await params;
  const resolved = resolveAgentPage(locale, page);
  if (!resolved) {
    return notFoundResponse();
  }

  // Lazy imports preserve the original, dependency-free Markdown route while
  // the production CMS flag is disabled. No SQL is contacted in this mode.
  let pages;
  let homeCopy;
  if (process.env.CMS_DB_ENABLED === "true") {
    if (resolved.pageKey === "home") {
      const { getHomeCopy } = await import("@/lib/content-api/home");
      homeCopy = await getHomeCopy(resolved.locale);
    } else {
      const { getCmsSubpageCopy } = await import("@/lib/content-api/subpages");
      pages = await getCmsSubpageCopy(resolved.locale, resolved.pageKey);
    }
  }
  const metadata = resolved.pageKey === "home" ? homeCopy?.meta : pages?.[resolved.pageKey].meta;
  const descriptor = getAgentPageDescriptor(resolved.locale, resolved.pageKey, metadata);
  return new Response(
    renderAgentPageMarkdown(resolved.locale, resolved.pageKey, { pages, homeCopy }),
    {
      headers: {
        "cache-control": "public, max-age=0, must-revalidate",
        "content-type": "text/markdown; charset=utf-8",
        link: `<${descriptor.canonicalUrl}>; rel="canonical"`,
        vary: "Accept",
      },
    },
  );
}
