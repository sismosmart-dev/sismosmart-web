import * as Sentry from "@sentry/nextjs";
import type { Instrumentation } from "next";

import { reportError } from "@/lib/report-error";

/**
 * register() runs once at server startup. It loads the Sentry runtime config
 * only when a DSN is present, so environments without the secret do nothing.
 * instrumentation.ts is server-only and never bundled to the client, so
 * importing Sentry here does not affect the browser payload.
 */
export async function register(): Promise<void> {
  if (!process.env.SENTRY_DSN) return;
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

/**
 * Called whenever the Next.js server captures an error during a request:
 * Server Component renders, route handlers, proxy. It goes to the process log
 * (reportError) and, when Sentry is configured, to Sentry as well.
 * captureRequestError is a safe no-op if Sentry was never initialised.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  reportError(error, {
    routePath: request.path,
    routeType: context.routeType,
    source: "onRequestError",
  });
  await Sentry.captureRequestError(error, request, context);
};
