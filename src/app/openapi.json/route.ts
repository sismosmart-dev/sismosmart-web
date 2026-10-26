import { openApiDocument } from "@/lib/openapi";

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(JSON.stringify(openApiDocument), {
    headers: {
      "cache-control": "public, max-age=3600",
      "content-type": "application/json; charset=utf-8",
    },
  });
}
