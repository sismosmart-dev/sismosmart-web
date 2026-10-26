import { NextResponse } from "next/server";

import { webManifest } from "@/app/manifest-data";

export function GET() {
  return NextResponse.json(webManifest, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "application/manifest+json; charset=utf-8",
    },
  });
}
