"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { getErrorCopy } from "@/lib/error-copy";
import { reportError } from "@/lib/report-error";

/**
 * Route-level error boundary. React requires error boundaries to be Client
 * Components, so this is the deliberate client component the project opted into
 * for error handling. It reports the error (the seam an external provider plugs
 * into) and shows a localized recovery screen with a retry and a home link.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = Array.isArray(params.locale) ? params.locale[0] : params.locale;
  const copy = getErrorCopy(locale ?? "");

  useEffect(() => {
    reportError(error, { source: "error-boundary", routePath: `/${locale ?? ""}` });
  }, [error, locale]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <span className="rounded-full border border-danger/40 bg-[color-mix(in_srgb,var(--danger)_12%,var(--surface))] px-4 py-2 text-sm font-semibold text-danger">
        {error.digest ? `Ref ${error.digest.slice(0, 8)}` : "500"}
      </span>
      <h1 className="mt-6 font-heading text-4xl tracking-normal text-fg">{copy.title}</h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-fg-muted">{copy.body}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} type="button">
          {copy.retry}
        </Button>
        <ButtonLink href={`/${locale ?? ""}`} variant="secondary">
          {copy.home}
        </ButtonLink>
      </div>
    </main>
  );
}
