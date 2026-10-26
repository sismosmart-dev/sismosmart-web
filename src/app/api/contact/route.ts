import type { NextRequest } from "next/server";

import { contactSchema, handleFormRequest, handleFormStatus } from "@/app/api/_lib/forms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return handleFormStatus("contact");
}

export function POST(request: NextRequest) {
  return handleFormRequest(request, "contact", contactSchema);
}
