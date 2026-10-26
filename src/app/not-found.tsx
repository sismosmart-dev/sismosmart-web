import Link from "next/link";

import { getLayoutChromeLabels } from "@/lib/pages";
import { defaultLocale, locales } from "@/lib/site";

export default function NotFound() {
  const fallback = getLayoutChromeLabels(defaultLocale);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center text-fg">
      <span className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-[var(--primary-600)]">
        404
      </span>
      <h1 className="mt-6 font-heading text-4xl tracking-normal text-fg">
        {fallback.notFoundTitle}
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-fg-muted">
        {fallback.notFoundDescription}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {locales.map((locale) => (
          <Link
            key={locale}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              locale === defaultLocale
                ? "border-[var(--primary-600)] bg-[var(--primary-600)] text-white"
                : "border-border bg-surface text-fg-muted hover:border-[var(--primary-600)] hover:text-[var(--primary-600)]"
            }`}
            href={`/${locale}`}
            hrefLang={locale}
            lang={locale}
          >
            {getLayoutChromeLabels(locale).notFoundHomeCta}
          </Link>
        ))}
      </div>
    </main>
  );
}
