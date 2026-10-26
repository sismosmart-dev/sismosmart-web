import { resolveHubLocale, getHubStaticParams } from "@/lib/guides/routing";
import { renderGuideHubMarkdown } from "@/lib/guides/markdown";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getHubStaticParams();
}

type HubRouteContext = {
  params: Promise<{ locale: string }>;
};

function notFoundResponse() {
  return new Response("Not found\n", {
    headers: { "content-type": "text/plain; charset=utf-8" },
    status: 404,
  });
}

export async function GET(
  _request: Request,
  { params }: HubRouteContext,
): Promise<Response> {
  const { locale } = await params;
  const resolved = resolveHubLocale(locale);
  if (!resolved) {
    return notFoundResponse();
  }

  const canonicalUrl = `${siteConfig.url}/${resolved}/guides`;

  return new Response(renderGuideHubMarkdown(resolved), {
    headers: {
      "cache-control": "public, max-age=3600",
      "content-type": "text/markdown; charset=utf-8",
      link: `<${canonicalUrl}>; rel="canonical"`,
      vary: "Accept",
    },
  });
}
