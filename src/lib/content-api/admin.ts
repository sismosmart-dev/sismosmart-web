import "server-only";

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { readLimitedJsonBody } from "@/app/api/_lib/validation";
import { authorizeContentAdmin, sameOrigin } from "@/lib/content-api/auth";
import { isContentKey, isContentLocale, type ContentKey } from "@/lib/content-api/contracts";
import { CmsMutationError, mutateContent, type CmsMutation } from "@/lib/content-api/mutations";
import { getCmsPool } from "@/lib/content-api/storage";
import { readAdminContent } from "@/lib/content-api/query";
import type { Locale } from "@/lib/site";

const draftPayload = z.strictObject({
  expectedVersion: z.number().int().min(0),
  content: z.unknown(),
});
const publishPayload = z.strictObject({ expectedVersion: z.number().int().min(0) });
const rollbackPayload = z.strictObject({
  expectedVersion: z.number().int().min(0),
  targetVersion: z.number().int().min(1),
});

type RouteContext = { params: Promise<{ locale: string; key: string }> };

function reply(code: string, status: number) {
  return NextResponse.json({ ok: false, code }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function executeCmsAdmin(request: Request, context: RouteContext, action: CmsMutation["action"]) {
  if (process.env.CMS_DB_ENABLED !== "true" || process.env.CMS_WRITE_ENABLED !== "true") {
    return reply("CMS_DISABLED", 503);
  }
  if (!authorizeContentAdmin(request.headers.get("authorization"))) return reply("NOT_AUTHORIZED", 401);
  if (!sameOrigin(request.headers.get("origin"))) return reply("ORIGIN_FORBIDDEN", 403);
  const { locale, key } = await context.params;
  if (!isContentLocale(locale) || !isContentKey(key)) return reply("NOT_FOUND", 404);
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return reply("JSON_REQUIRED", 415);
  }
  const body = await readLimitedJsonBody(request, 8_192);
  if (!body.ok) return reply(body.code, body.code === "PAYLOAD_TOO_LARGE" ? 413 : 400);
  const parsed = (action === "draft" ? draftPayload : action === "publish" ? publishPayload : rollbackPayload).safeParse(body.value);
  if (!parsed.success) return reply("VALIDATION_FAILED", 400);
  try {
    const pool = await getCmsPool();
    if (!pool) return reply("CMS_DISABLED", 503);
    const connection = await pool.getConnection();
    try {
      const mutation = { action, ...parsed.data } as CmsMutation;
      const result = await mutateContent(connection, locale as Locale, key as ContentKey, mutation);
      if (action !== "draft") {
        try { revalidatePath(`/${locale}`, "page"); }
        catch { console.error("CMS_CACHE_REVALIDATION_FAILED"); }
      }
      return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
    } finally { connection.release(); }
  } catch (error) {
    if (error instanceof CmsMutationError) {
      return reply(error.code, error.code === "CMS_CONFLICT" ? 409 : 422);
    }
    if (error instanceof z.ZodError || (error instanceof Error && error.message === "CMS_HTML_NOT_ALLOWED")) {
      return reply("VALIDATION_FAILED", 400);
    }
    console.error("CMS_ADMIN_UNAVAILABLE");
    return reply("CMS_UNAVAILABLE", 503);
  }
}

/** Authenticated preview only; public users cannot read drafts or history. */
export async function inspectCmsAdmin(request: Request, context: RouteContext) {
  if (process.env.CMS_DB_ENABLED !== "true" || process.env.CMS_WRITE_ENABLED !== "true") {
    return reply("CMS_DISABLED", 503);
  }
  if (!authorizeContentAdmin(request.headers.get("authorization"))) return reply("NOT_AUTHORIZED", 401);
  if (!sameOrigin(request.headers.get("origin"))) return reply("ORIGIN_FORBIDDEN", 403);
  const { locale, key } = await context.params;
  if (!isContentLocale(locale) || !isContentKey(key)) return reply("NOT_FOUND", 404);
  try {
    const pool = await getCmsPool();
    if (!pool) return reply("CMS_DISABLED", 503);
    const data = await readAdminContent(pool, locale, key);
    return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    console.error("CMS_ADMIN_UNAVAILABLE");
    return reply("CMS_UNAVAILABLE", 503);
  }
}
