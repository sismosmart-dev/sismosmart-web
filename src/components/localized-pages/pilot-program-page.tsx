import Image from "next/image";

import { PageHero } from "@/components/page-hero";
import { PilotProgramForm } from "@/components/pilot-program-form";
import { withBasePath } from "@/lib/base-path";
import { getPages } from "@/lib/pages";
import type { Locale } from "@/lib/site";

export function PilotProgramPage({ locale }: { locale: Locale }) {
  const page = getPages(locale).pilotProgram;

  return (
    <main className="flex flex-1 flex-col gap-8 pb-16 pt-8 sm:gap-10 sm:pt-10" id="content">
      <PageHero
        description={page.description}
        eyebrow={page.eyebrow}
        title={page.title}
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {page.sections.map((section) => (
          <article
            key={section.title}
            className="rounded-lg border border-border bg-surface px-6 py-6 shadow-3"
          >
            <h2 className="font-heading text-2xl text-fg">
              {section.title}
            </h2>
            <p className="mt-3 text-base leading-7 text-fg-muted">
              {section.description}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
        <div className="relative overflow-hidden rounded-xl border border-[rgba(114,174,127,0.2)] bg-primary-950 p-6 shadow-[var(--shadow-inverse)]">
          <Image
            alt={page.title}
            className="h-auto w-full object-contain"
            height={1176}
            sizes="(min-width: 1024px) 38vw, 100vw"
            src={withBasePath("/images/device/sismosmart-device-front.webp")}
            width={1131}
          />
        </div>

        <section className="rounded-xl border border-border bg-surface-2 p-6 shadow-3 sm:p-8">
          <PilotProgramForm locale={locale} />
        </section>
      </section>
    </main>
  );
}
