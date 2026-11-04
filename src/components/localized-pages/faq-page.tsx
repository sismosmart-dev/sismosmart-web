import type { RoutePagesCopy } from "@/lib/page-copy";
import { PageHero } from "@/components/page-hero";
import { getPages } from "@/lib/pages";
import type { Locale } from "@/lib/site";

export function FaqPage({ locale, pages }: { locale: Locale; pages?: RoutePagesCopy }) {
  const page = pages?.faq ?? getPages(locale).faq;

  return (
    <main className="flex flex-1 flex-col gap-8 pb-16 pt-8 sm:gap-10 sm:pt-10" id="content">
      <PageHero
        description={page.description}
        eyebrow={page.eyebrow}
        title={page.title}
      />

      <section className="grid gap-4">
        {page.sections.map((section) => (
          <details
            key={section.title}
            className="group rounded-lg border border-border bg-surface px-6 py-5 shadow-2 transition hover:border-primary-300 open:border-primary-400"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-lg text-fg focus-visible:outline-2 focus-visible:outline-primary-600">
              <span>{section.title}</span>
              <span aria-hidden="true" className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xl font-bold text-primary-600 transition duration-200 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-4 text-base leading-7 text-fg-muted">
              {section.description}
            </p>
          </details>
        ))}
      </section>
    </main>
  );
}
