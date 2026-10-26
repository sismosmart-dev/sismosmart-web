import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BrandMark } from "@/components/brand-mark";
import { CookieConsent } from "@/components/cookie-consent";
import { MobileNavigation } from "@/components/mobile-navigation";
import { ScrollReveal } from "@/components/scroll-reveal";
import { StructuredData } from "@/components/structured-data";
import { ThemeToggle } from "@/components/theme-toggle";
import { assetPaths } from "@/lib/asset-paths";
import { appBasePath, withBasePath } from "@/lib/base-path";
import { buildPageMetadata } from "@/lib/metadata";
import {
  getFooterNavigation,
  getLayoutChromeLabels,
  getPrimaryNavigation,
  routeSegments,
} from "@/lib/pages";
import { getGlobalStructuredData } from "@/lib/structured-data";
import {
  getCopy,
  getLocalizedHref,
  isLocale,
  localeLabels,
  locales,
  productStageNotices,
  safetyNotices,
  siteConfig,
} from "@/lib/site";
import { getGuideLocaleSwitchPathMap } from "@/lib/guides/catalog";

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const copy = getCopy(locale);
  const metadata = buildPageMetadata(locale, "/", copy.meta.title, copy.meta.description);

  return {
    ...metadata,
    icons: {
      icon: [
        { url: assetPaths.favicon16, sizes: "16x16", type: "image/png" },
        { url: assetPaths.favicon32, sizes: "32x32", type: "image/png" },
        { url: withBasePath("/logo-symbol.svg"), type: "image/svg+xml" },
      ],
      shortcut: assetPaths.favicon32,
      apple: assetPaths.appleTouchIcon,
    },
    manifest: withBasePath("/site.webmanifest"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const copy = getCopy(locale);
  const navigation = getPrimaryNavigation(locale);
  const mobileNavigation = navigation.map((item) => ({
    href: getLocalizedHref(locale, item.href),
    label: item.label,
  }));
  const mobileLanguages = locales.map((entry) => ({
    href: withBasePath(`/${entry}`),
    isActive: entry === locale,
    label: localeLabels[entry],
    locale: entry,
  }));
  const footerNavigation = getFooterNavigation(locale);
  const footerLabels = getLayoutChromeLabels(locale);

  const primaryCtaHref = getLocalizedHref(locale, routeSegments.pilotProgram);

  return (
    <div className="min-h-screen">
      <script
        id={`document-language-${locale}`}
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(locale)};`,
        }}
      />
      <StructuredData
        data={getGlobalStructuredData(locale)}
        id={`global-structured-data-${locale}`}
      />
      <a
        className="skip-link"
        href="#content"
      >
        {copy.accessibility.skipToContent}
      </a>

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        {/* The glass blur lives on an inner layer, not on <header> itself: a
            backdrop-filter on the header would become the containing block for
            the mobile nav's fixed overlay and trap it inside the header. */}
        <header className="sticky top-0 z-40 -mx-4 px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 border-b border-white/10 bg-[rgba(4,13,8,0.78)] backdrop-blur-xl"
          />
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center justify-between gap-4">
              <a className="flex items-center gap-3" href={withBasePath(`/${locale}`)}>
                <BrandMark />
                <span>
                  <span className="block font-heading text-lg tracking-normal text-white">
                    {siteConfig.name}
                  </span>
                  <span className="text-sm text-emerald-50/70">
                    {copy.navigation.eyebrow}
                  </span>
                </span>
              </a>

              <MobileNavigation
                closeLabel={footerLabels.close}
                ctaHref={primaryCtaHref}
                ctaLabel={copy.navigation.primaryCta}
                languages={mobileLanguages}
                menuLabel={footerLabels.menu}
                navigation={mobileNavigation}
              />
            </div>

            <div className="hidden flex-col gap-4 lg:flex lg:items-end">
              <nav
                aria-label={footerLabels.nav}
                className="flex flex-wrap items-center gap-2 text-sm text-emerald-50/72"
              >
                {navigation.map((item) => (
                  <a
                    key={item.label}
                    className="rounded-full px-3 py-2 hover:bg-white/5 hover:text-white"
                    href={getLocalizedHref(locale, item.href)}
                  >
                    {item.label}
                  </a>
                ))}
                <a
                  className="hidden rounded-full border border-brand-bright/30 bg-brand-bright/10 px-4 py-2 font-semibold text-white lg:inline-flex"
                  href={primaryCtaHref}
                >
                  {copy.navigation.primaryCta}
                </a>
              </nav>

              <nav aria-label="Languages" className="flex flex-wrap items-center gap-2 text-sm">
                <ThemeToggle label={footerLabels.theme} />
                {locales.map((entry) => (
                  <a
                    key={entry}
                    className={`rounded-full border px-3 py-1.5 ${
                      entry === locale
                        ? "border-brand-bright bg-brand-bright/10 text-white"
                        : "border-white/15 bg-white/10 text-white/70 hover:-translate-y-0.5 hover:border-brand-bright/40 hover:bg-white/15 hover:text-white"
                    }`}
                    data-locale-switch={entry}
                    href={withBasePath(`/${entry}`)}
                    hrefLang={entry}
                    lang={entry}
                  >
                    {localeLabels[entry]}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </header>

        {children}
        <ScrollReveal />
        <CookieConsent locale={locale} />
        <script
          id={`locale-switch-script-${locale}`}
          dangerouslySetInnerHTML={{
            __html: `
(() => {
  const locales = ${JSON.stringify(locales)};
  const current = ${JSON.stringify(locale)};
  const basePath = ${JSON.stringify(appBasePath)};
  const guideSwitchMap = ${JSON.stringify(getGuideLocaleSwitchPathMap())};
  const relativePath = basePath && window.location.pathname.startsWith(basePath)
    ? window.location.pathname.slice(basePath.length) || "/"
    : window.location.pathname;
  const path = relativePath.split("/").filter(Boolean);
  const guideTargets = guideSwitchMap[relativePath];
  for (const link of document.querySelectorAll("[data-locale-switch]")) {
    const next = link.getAttribute("data-locale-switch");
    if (!next || !locales.includes(next)) continue;
    let nextPath;
    if (guideTargets) {
      nextPath = next === current ? relativePath : guideTargets[next] || "/" + next;
    } else {
      const segments = path.length ? [...path] : [current];
      if (locales.includes(segments[0])) segments[0] = next;
      else segments.unshift(next);
      nextPath = "/" + segments.join("/");
    }
    link.setAttribute("href", basePath + nextPath + window.location.search + window.location.hash);
  }
})();
`,
          }}
        />

        <footer className="mt-auto border-t border-border py-12 text-fg-muted">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <BrandMark className="h-14 w-14" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-normal text-[var(--primary-600)]">
                    {siteConfig.name}
                  </p>
                  <h2 className="mt-2 font-heading text-3xl tracking-normal text-fg">
                    {footerLabels.note}
                  </h2>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                {siteConfig.socialLinks.map((item) => (
                  <a
                    key={item.label}
                    aria-label={`${item.label} SismoSmart`}
                    className="rounded-full border border-border px-4 py-2 hover:-translate-y-0.5 hover:border-[var(--primary-600)] hover:text-[var(--primary-600)]"
                    href={item.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <section>
                <h3 className="font-heading text-lg text-fg">{footerLabels.explore}</h3>
                <ul className="mt-4 space-y-3 text-sm text-fg-muted">
                  {footerNavigation.map((item) => (
                    <li key={item.label}>
                      <a
                        className="hover:text-[var(--primary-600)]"
                        href={getLocalizedHref(locale, item.href)}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="font-heading text-lg text-fg">{footerLabels.contact}</h3>
                <ul className="mt-4 space-y-3 text-sm text-fg-muted">
                  <li>
                    <a className="hover:text-[var(--primary-600)]" href={`mailto:${siteConfig.email}`}>
                      {siteConfig.email}
                    </a>
                  </li>
                  <li>
                    <a className="hover:text-[var(--primary-600)]" href={`mailto:${siteConfig.pressEmail}`}>
                      {siteConfig.pressEmail}
                    </a>
                  </li>
                  <li>
                    <a
                      className="hover:text-[var(--primary-600)]"
                      href="https://www.linkedin.com/company/sismosmart"
                      rel="noreferrer"
                      target="_blank"
                    >
                      LinkedIn
                    </a>
                  </li>
                </ul>
              </section>
            </div>
          </div>

          <div className="mt-10 grid gap-3 rounded-lg border border-amber/30 bg-surface-2 px-5 py-5 text-sm leading-6 text-fg-muted">
            <p>{safetyNotices[locale]}</p>
            <p>{productStageNotices[locale]}</p>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-sm text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} {copy.footer.legal}</p>
            <button
              className="w-fit rounded-full border border-border px-4 py-2 text-left text-sm font-semibold text-fg-muted hover:border-[var(--primary-600)] hover:text-[var(--primary-600)]"
              data-cookie-reset=""
              type="button"
            >
              {footerLabels.privacy}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
