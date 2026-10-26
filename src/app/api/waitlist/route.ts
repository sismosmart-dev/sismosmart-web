import type { NextRequest } from "next/server";

import { handleFormRequest, handleFormStatus, waitlistSchema } from "@/app/api/_lib/forms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return handleFormStatus("waitlist");
}

export function POST(request: NextRequest) {
  return handleFormRequest(request, "waitlist", waitlistSchema);
}
