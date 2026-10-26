import { PageHero } from "@/components/page-hero";
import { getPages } from "@/lib/pages";
import type { Locale } from "@/lib/site";

export function FaqPage({ locale }: { locale: Locale }) {
  const page = getPages(locale).faq;

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
            className="group rounded-lg border border-border bg-surface px-6 py-5 shadow-[0_14px_30px_rgba(5,23,12,0.05)]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-lg text-fg">
              {section.title}
              <span aria-hidden="true" className="text-2xl text-brand group-open:rotate-45">
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
