import type { Metadata } from "next";
import { IBM_Plex_Sans, Sora } from "next/font/google";
import "./globals.css";

import { THEME_PREPAINT_SCRIPT } from "@/components/theme-toggle";
import { withBasePath } from "@/lib/base-path";
import { defaultLocale, isLocale, siteConfig } from "@/lib/site";

const headingFont = Sora({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
});

const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  referrer: "strict-origin-when-cross-origin",
  icons: {
    icon: withBasePath("/logo-symbol.svg"),
    shortcut: withBasePath("/logo-symbol.svg"),
    apple: withBasePath("/logo-symbol.svg"),
  },
  manifest: withBasePath("/site.webmanifest"),
  openGraph: {
    siteName: siteConfig.name,
  },
  twitter: {
    site: "@sismosmart",
    creator: "@sismosmart",
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params?: Promise<{ locale?: string }>;
}>) {
  const resolvedParams = params ? await params : {};
  const lang = resolvedParams.locale && isLocale(resolvedParams.locale)
    ? resolvedParams.locale
    : defaultLocale;

  return (
    <html
      suppressHydrationWarning
      lang={lang}
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <head>
        <link rel="describedby" href={withBasePath("/llms.txt")} />
        <script dangerouslySetInnerHTML={{ __html: THEME_PREPAINT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
