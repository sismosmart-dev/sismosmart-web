import {
  agentPageKeys,
  getAgentPageDescriptor,
  resolveAgentPage,
} from "@/lib/agent-discovery";
import { renderAgentPageMarkdown } from "@/lib/markdown-content";
import { routeSegments } from "@/lib/pages";
import { locales } from "@/lib/site";

export const dynamic = "force-static";

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

  const descriptor = getAgentPageDescriptor(resolved.locale, resolved.pageKey);
  return new Response(
    renderAgentPageMarkdown(resolved.locale, resolved.pageKey),
    {
      headers: {
        "cache-control": "public, max-age=3600",
        "content-type": "text/markdown; charset=utf-8",
        link: `<${descriptor.canonicalUrl}>; rel="canonical"`,
        vary: "Accept",
      },
    },
  );
}
