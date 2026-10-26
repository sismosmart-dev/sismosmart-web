import type { FormTarget, ParsedPayload } from "@/app/api/_lib/validation";

export const formForwardTimeoutMs = 10_000;

export type FormForwardResult =
  | { ok: true }
  | { code: "FORM_ENDPOINT_MISSING" | "FORM_FORWARD_FAILED"; ok: false };

export function normalizeFormEndpoint(
  endpoint: string | undefined,
  allowInsecureHttp = process.env.NODE_ENV !== "production",
) {
  if (!endpoint) return null;
  try {
    const url = new URL(endpoint);
    const isHttps = url.protocol === "https:";
    const isLocalHttp =
      (url.hostname === "127.0.0.1" || url.hostname === "localhost") && url.protocol === "http:";
    return isHttps || isLocalHttp || (url.protocol === "http:" && allowInsecureHttp)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export async function forwardFormPayload({
  authToken,
  endpoint,
  fetchImpl = fetch,
  now = () => new Date(),
  payload,
  target,
  timeoutMs = formForwardTimeoutMs,
}: {
  authToken?: string;
  endpoint?: string;
  fetchImpl?: typeof fetch;
  now?: () => Date;
  payload: ParsedPayload;
  target: FormTarget;
  timeoutMs?: number;
}): Promise<FormForwardResult> {
  const url = normalizeFormEndpoint(endpoint);
  if (!url) return { code: "FORM_ENDPOINT_MISSING", ok: false };

  const headers: HeadersInit = {
    "content-type": "application/json",
  };
  if (authToken) headers.authorization = `Bearer ${authToken}`;

  try {
    const response = await fetchImpl(url, {
      body: JSON.stringify({
        form: target,
        payload,
        receivedAt: now().toISOString(),
      }),
      headers,
      method: "POST",
      signal: AbortSignal.timeout(timeoutMs),
    });
    const ok = response.ok;
    await response.text().catch(() => "");
    if (!ok) {
      return { code: "FORM_FORWARD_FAILED", ok: false };
    }
  } catch {
    return { code: "FORM_FORWARD_FAILED", ok: false };
  }

  return { ok: true };
}
