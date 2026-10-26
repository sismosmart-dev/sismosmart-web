/**
 * One place that server-side errors flow through. Right now it writes to the
 * process log, which on the cPanel/Passenger host lands in the app's stderr, so
 * an unhandled error stops being invisible. It is also the single seam an
 * external reporter plugs into: when a Sentry DSN is configured, call
 * Sentry.captureException from here (and from instrumentation's register()),
 * so the wiring lives in one spot instead of being sprinkled across the app.
 */

export type ErrorContext = {
  routePath?: string;
  routeType?: string;
  source?: string;
  [key: string]: unknown;
};

export function reportError(error: unknown, context: ErrorContext = {}): void {
  const where = context.routePath ? ` at ${context.routePath}` : "";
  console.error(`[sismosmart] unhandled error${where}`, error, context);

  if (typeof window === "undefined" && process.env.SENTRY_DSN) {
    import("@sentry/nextjs")
      .then((Sentry) => {
        Sentry.captureException(error, { extra: context });
      })
      .catch(() => {});
  }
}
