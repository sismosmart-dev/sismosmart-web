"use client";

import { useEffect } from "react";

import { reportError } from "@/lib/report-error";

/**
 * Last-resort boundary for errors thrown in the root layout itself. It replaces
 * the whole document, so it renders its own <html>/<body> and can't rely on the
 * app's fonts or tokens. Kept minimal and in English, since by definition the
 * localized layout failed to render.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { source: "global-error" });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f7faf7",
          color: "#0b1f1a",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Something went wrong</h1>
        <p style={{ maxWidth: "34rem", lineHeight: 1.6, color: "#475467" }}>
          An unexpected error occurred while loading the page. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            cursor: "pointer",
            borderRadius: "0.5rem",
            border: "none",
            background: "#2e7d32",
            color: "#ffffff",
            padding: "0.75rem 1.5rem",
            fontSize: "0.95rem",
            fontWeight: 600,
          }}
          type="button"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
