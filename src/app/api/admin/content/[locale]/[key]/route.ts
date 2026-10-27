import { executeCmsAdmin, inspectCmsAdmin } from "@/lib/content-api/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ locale: string; key: string }> }) {
  return executeCmsAdmin(request, context, "draft");
}

export async function GET(request: Request, context: { params: Promise<{ locale: string; key: string }> }) {
  return inspectCmsAdmin(request, context);
}
