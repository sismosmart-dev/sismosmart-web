import { NextResponse, type NextRequest } from "next/server";

import { forwardFormPayload, normalizeFormEndpoint } from "@/app/api/_lib/forwarding";

import {
  contactSchema,
  getClientKey,
  hasSpamTrap,
  RateLimiter,
  readLimitedJsonBody,
  waitlistSchema,
  type FormTarget,
  type ParsedPayload,
} from "@/app/api/_lib/validation";

export { contactSchema, waitlistSchema, type FormTarget };

const rateLimiter = new RateLimiter();

function isRateLimited(request: NextRequest) {
  const key = getClientKey(
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-forwarded-for"),
    request.headers.get("x-real-ip"),
  );
  return rateLimiter.isLimited(key);
}

function getEndpoint(target: FormTarget) {
  return target === "waitlist"
    ? process.env.WAITLIST_FORM_ENDPOINT || ""
    : process.env.CONTACT_FORM_ENDPOINT || "";
}

export function handleFormStatus(target: FormTarget) {
  const configured = Boolean(normalizeFormEndpoint(getEndpoint(target)));

  return NextResponse.json(
    { configured, ok: configured, target },
    { status: configured ? 200 : 503 },
  );
}

async function forwardPayload(target: FormTarget, payload: ParsedPayload) {
  const result = await forwardFormPayload({
    authToken: process.env.FORM_FORWARD_AUTH_TOKEN,
    endpoint: getEndpoint(target),
    payload,
    target,
  });

  if (!result.ok) {
    return NextResponse.json(result, {
      status: result.code === "FORM_ENDPOINT_MISSING" ? 503 : 502,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function handleFormRequest(
  request: NextRequest,
  target: FormTarget,
  schema: typeof waitlistSchema | typeof contactSchema,
) {
  const bodyResult = await readLimitedJsonBody(request);
  if (!bodyResult.ok) {
    return NextResponse.json(
      { code: bodyResult.code, ok: false },
      { status: bodyResult.code === "PAYLOAD_TOO_LARGE" ? 413 : 400 },
    );
  }

  if (!bodyResult.value || typeof bodyResult.value !== "object") {
    return NextResponse.json(
      { code: "INVALID_JSON", ok: false },
      { status: 400 },
    );
  }

  const payload = bodyResult.value as Record<string, unknown>;
  if (isRateLimited(request)) {
    return NextResponse.json(
      { code: "RATE_LIMITED", ok: false },
      { status: 429 },
    );
  }

  if (hasSpamTrap(payload)) {
    return NextResponse.json({ ok: true });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_FAILED", ok: false },
      { status: 400 },
    );
  }

  return forwardPayload(target, parsed.data);
}
