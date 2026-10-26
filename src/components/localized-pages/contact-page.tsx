import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { withBasePath } from "@/lib/base-path";
import { getPages } from "@/lib/pages";
import type { Locale } from "@/lib/site";

export function ContactPage({ locale }: { locale: Locale }) {
  const page = getPages(locale).contact;

  return (
    <main className="flex flex-1 flex-col gap-8 pb-16 pt-8 sm:gap-10 sm:pt-10" id="content">
      <PageHero
        description={page.description}
        eyebrow={page.eyebrow}
        title={page.title}
      />

      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
        <div className="space-y-6">
          <SectionHeading
            description={page.description}
            eyebrow={page.eyebrow}
            title={page.title}
          />
          <div className="grid gap-4">
            {page.channels.map((channel) => (
              <a
                key={channel.title}
                className="rounded-lg border border-border bg-surface px-6 py-6 shadow-3 hover:-translate-y-1"
                href={withBasePath(channel.href)}
                rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
                target={channel.href.startsWith("http") ? "_blank" : undefined}
              >
                <p className="text-sm font-semibold uppercase tracking-normal text-[var(--primary-600)]">
                  {channel.title}
                </p>
                <h2 className="mt-3 font-heading text-2xl tracking-normal text-fg">
                  {channel.value}
                </h2>
                <p className="mt-3 text-base leading-7 text-fg-muted">
                  {channel.description}
                </p>
              </a>
            ))}
          </div>
        </div>

        <section className="rounded-xl border border-border bg-[var(--surface-2)] p-6 shadow-3 sm:p-8">
          <ContactForm copy={page.form} locale={locale} />
        </section>
      </section>
    </main>
  );
}
