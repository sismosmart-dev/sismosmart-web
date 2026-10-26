import * as Sentry from "@sentry/nextjs";

/**
 * Edge-runtime Sentry init for any route explicitly configured for the edge runtime.
 * Inert unless SENTRY_DSN is set. See sentry.server.config.ts for why there is
 * no browser config.
 */
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release:
      process.env.NEXT_PUBLIC_COMMIT_SHA ||
      (process.env.npm_package_version
        ? `sismosmart-web@${process.env.npm_package_version}`
        : "sismosmart-web@0.1.2"),
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    beforeSend(event, hint) {
      const error = hint.originalException;
      const message =
        (error instanceof Error ? error.message : "") ||
        event.exception?.values?.[0]?.value ||
        "";
      if (message.includes("NEXT_NOT_FOUND") || message.includes("404")) {
        return null;
      }
      return event;
    },
  });
}
