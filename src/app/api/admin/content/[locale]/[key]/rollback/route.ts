import { executeCmsAdmin } from "@/lib/content-api/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ locale: string; key: string }> }) {
  return executeCmsAdmin(request, context, "rollback");
}
