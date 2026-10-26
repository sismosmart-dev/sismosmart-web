import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { LaunchInterestForm } from "@/components/launch-interest-form";
import { ProductVisual } from "@/components/product-visual";
import { SectionHeading } from "@/components/section-heading";
import { Seismogram } from "@/components/seismogram";
import { withBasePath } from "@/lib/base-path";
import { StructuredData } from "@/components/structured-data";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge, StatGrid } from "@/components/ui/stat";
import { buildPageMetadata } from "@/lib/metadata";
import { routeSegments } from "@/lib/pages";
import { getHomeStructuredData } from "@/lib/structured-data";
import { getCopy, getLocalizedHref, isLocale, type Locale } from "@/lib/site";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const copy = getCopy(locale);
  return buildPageMetadata(locale, routeSegments.home, copy.meta.title, copy.meta.description);
}

export default async function LocaleHomePage({ params }: LocalePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const activeLocale = locale as Locale;
  const copy = getCopy(activeLocale);

  return (
    <>
      <StructuredData
        data={getHomeStructuredData(activeLocale)}
        id={`${activeLocale}-home-structured-data`}
      />
      <main
        className="flex min-w-0 flex-1 flex-col gap-12 overflow-x-hidden pb-16 pt-8 sm:gap-16 sm:pt-10"
        id="content"
      >
        <section className="grid-glow relative overflow-hidden py-10 sm:py-14 lg:py-18">
          <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.98fr)] lg:items-center">
            <div className="min-w-0 space-y-8">
              <Badge tone="signal">
                <span className="h-2 w-2 rounded-full bg-[var(--signal)] shadow-[0_0_12px_var(--signal-soft)]" />
                {copy.hero.badge}
              </Badge>

              <div className="max-w-3xl space-y-5">
                <h1 className="max-w-full break-words font-heading text-3xl leading-tight tracking-normal text-fg sm:text-5xl lg:text-6xl">
                  {copy.hero.title}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-fg-muted sm:text-xl">
                  {copy.hero.description}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink
                  href={getLocalizedHref(activeLocale, copy.hero.primaryHref)}
                  size="lg"
                >
                  {copy.hero.primaryCta}
                </ButtonLink>
                <ButtonLink
                  href={getLocalizedHref(activeLocale, copy.hero.secondaryHref)}
                  size="lg"
                  variant="secondary"
                >
                  {copy.hero.secondaryCta}
                </ButtonLink>
                {copy.hero.tertiaryCta && copy.hero.tertiaryHref ? (
                  <ButtonLink
                    href={getLocalizedHref(activeLocale, copy.hero.tertiaryHref)}
                    size="lg"
                    variant="ghost"
                  >
                    {copy.hero.tertiaryCta}
                  </ButtonLink>
                ) : null}
              </div>

              <StatGrid items={copy.hero.stats} />
            </div>

            <ProductVisual
              altText={copy.hero.imageAlt}
              bullets={copy.hero.deviceSpecs}
              description={copy.hero.deviceDescription}
              eyebrow={copy.hero.deviceEyebrow}
              meterBottomLabel={copy.hero.meterBottomLabel}
              meterBottomValue={copy.hero.meterBottomValue}
              meterTopLabel={copy.hero.meterTopLabel}
              meterTopValue={copy.hero.meterTopValue}
              title={copy.hero.deviceTitle}
            />
          </div>
        </section>

        {/*
          The recording. Everything the product claims rests on the shape of this
          trace, so it earns a full-width band rather than a card in a grid.
        */}
        <section
          data-reveal
          className="content-auto overflow-hidden rounded-xl border border-[rgba(114,174,127,0.2)] bg-[var(--primary-950)] px-6 py-10 shadow-[var(--shadow-inverse)] sm:px-8"
          id="signal"
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
            <div className="space-y-5">
              <SectionHeading
                description={copy.demo.description}
                eyebrow={copy.demo.eyebrow}
                invert
                title={copy.demo.title}
              />
              <ul className="space-y-3">
                {copy.demo.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex gap-3 text-base leading-7 text-emerald-50/80"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--signal)]"
                    />
                    {bullet}
                  </li>
                ))}
              </ul>
              <ButtonLink
                href={getLocalizedHref(activeLocale, copy.demo.ctaHref)}
                variant="signal"
              >
                {copy.demo.cta}
              </ButtonLink>
            </div>

            <figure className="space-y-3">
              <div className="signal-header text-xs font-semibold uppercase text-emerald-50/60">
                <span>{copy.demo.previewLabel}</span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--signal)]" />
                  {copy.demo.sensorValue}
                </span>
              </div>
              <div className="overflow-hidden rounded-lg border border-[rgba(114,174,127,0.22)] bg-black/25 p-2 text-emerald-50/40">
                <Seismogram
                  className="h-44 w-full sm:h-56"
                  pLabel="P"
                  sLabel="S"
                  title={copy.demo.title}
                />
              </div>
              <figcaption className="flex flex-wrap justify-between gap-2 text-xs text-emerald-50/60">
                <span>{copy.demo.eventLabel}</span>
                <span className="tabular-nums">{copy.demo.eventValue}</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section
          data-reveal
          className="content-auto rounded-xl border border-border bg-surface px-6 py-8 shadow-3 sm:px-8"
          id="trust"
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)] lg:items-center">
            <SectionHeading
              description={copy.trust.description}
              eyebrow={copy.trust.eyebrow}
              title={copy.trust.title}
            />
            <StatGrid columns={3} items={copy.trust.items} />
          </div>
        </section>

        <section
          data-reveal
          className="content-auto rounded-xl border border-border bg-surface-2 px-6 py-10 shadow-2 sm:px-8"
          id="how-it-works"
        >
          <SectionHeading
            description={copy.howItWorks.description}
            eyebrow={copy.howItWorks.eyebrow}
            title={copy.howItWorks.title}
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(280px,0.76fr)_minmax(0,1.24fr)] lg:items-stretch">
            <div className="relative overflow-hidden rounded-lg border border-[rgba(114,174,127,0.2)] bg-[var(--primary-950)] p-5 shadow-[var(--shadow-inverse)]">
              <div className="absolute inset-x-8 top-6 h-24 rounded-full bg-[var(--signal)]/20 blur-3xl" />
              <Image
                alt={copy.hero.imageAlt}
                className="relative z-10 h-full max-h-[32rem] w-full object-contain"
                height={1424}
                sizes="(min-width: 1024px) 32vw, 90vw"
                src={withBasePath("/images/device/sismosmart-device-installation.webp")}
                width={1228}
              />
            </div>

            <ol className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {copy.howItWorks.steps.map((step, index) => (
                <Card as="li" key={step.title}>
                  <div className="mb-5 flex items-center gap-4">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-600 font-heading text-sm tabular-nums text-fg-on-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="h-px flex-1 bg-[linear-gradient(90deg,var(--primary-300),transparent)]" />
                  </div>
                  <h3 className="font-heading text-xl tracking-normal text-fg">
                    {step.title}
                  </h3>
                  <CardBody>{step.description}</CardBody>
                </Card>
              ))}
            </ol>
          </div>
        </section>

        <section className="content-auto space-y-6" data-reveal id="features">
          <SectionHeading
            description={copy.features.description}
            eyebrow={copy.features.eyebrow}
            title={copy.features.title}
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {copy.features.items.map((feature) => (
              <Card interactive key={feature.title}>
                <Badge tone="signal">{feature.accent}</Badge>
                <div className="mt-4">
                  <CardTitle>{feature.title}</CardTitle>
                  <CardBody>{feature.description}</CardBody>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="content-auto space-y-6" data-reveal id="proof">
          <SectionHeading
            description={copy.proof.description}
            eyebrow={copy.proof.eyebrow}
            title={copy.proof.title}
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {copy.proof.cards.map((card) => (
              <Card interactive key={card.title}>
                <Badge tone="signal">{card.highlight}</Badge>
                <div className="mt-4">
                  <CardTitle>{card.title}</CardTitle>
                  <CardBody>{card.description}</CardBody>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section
          data-reveal
          className="content-auto rounded-xl border border-border bg-surface px-6 py-10 shadow-3 sm:px-8"
          id="faq"
        >
          <SectionHeading
            description={copy.faq.description}
            eyebrow={copy.faq.eyebrow}
            title={copy.faq.title}
          />

          <div className="mt-8 space-y-4">
            {copy.faq.items.map((item) => (
              <details
                key={item.title}
                className="group rounded-md border border-border bg-surface-2 px-5 py-4 transition open:border-primary-300"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-lg tracking-normal text-fg">
                  <span>{item.title}</span>
                  <span
                    aria-hidden="true"
                    className="text-lg text-primary-600 transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl text-base leading-7 text-fg-muted">
                  {item.description}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section
          data-reveal
          className="content-auto rounded-xl border border-border bg-surface-2 px-6 py-10 shadow-2 sm:px-8"
          id="newsletter"
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.94fr)] lg:items-center">
            <div className="space-y-5">
              <SectionHeading
                description={copy.newsletter.description}
                eyebrow={copy.newsletter.eyebrow}
                title={copy.newsletter.title}
              />
              <p className="text-sm leading-6 text-fg-subtle">{copy.newsletter.note}</p>
            </div>

            <div className="rounded-lg border border-border bg-surface p-6 shadow-3">
              <LaunchInterestForm
                buttonLabel={copy.newsletter.button}
                consentLabel={copy.newsletter.consent}
                emailPlaceholder={copy.newsletter.placeholder}
                errorMessage={copy.newsletter.error}
                inputLabel={copy.newsletter.inputLabel}
                loadingLabel={copy.newsletter.loading}
                locale={activeLocale}
                missingEndpointMessage={copy.newsletter.missingEndpoint}
                rateLimitedMessage={copy.newsletter.rateLimited}
                successMessage={copy.newsletter.success}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
