import { resolveHubLocale, getHubStaticParams } from "@/lib/guides/routing";
import { renderGuideHubMarkdown } from "@/lib/guides/markdown";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

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
  const content = process.env.CMS_DB_ENABLED === "true"
    ? await (await import("@/lib/content-api/guide-hub")).getCmsGuideHub(resolved)
    : undefined;

  return new Response(renderGuideHubMarkdown(resolved, content), {
    headers: {
      "cache-control": "public, max-age=0, must-revalidate",
      "content-type": "text/markdown; charset=utf-8",
      link: `<${canonicalUrl}>; rel="canonical"`,
      vary: "Accept",
    },
  });
}
