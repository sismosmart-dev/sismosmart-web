# Browser and accessibility quality gate

## Purpose

`npm run test:browser` validates the production Next.js build in a real pinned Chrome Headless Shell browser without using production endpoints, credentials, or user data. The same gate runs as `ci/browser` inside the main CI workflow.

## Covered behavior

The audit exercises representative English and Turkish routes at desktop and mobile widths:

- `/en` and `/tr`;
- `/en/product` and `/tr/product`;
- `/en/contact`;
- `/tr/pilot-program`;
- `/en/guides`;
- `/tr/guides/bina-deprem-sensoru-sismik-izleme`;
- navigation from the English home page to the localized product page;
- locale switching while preserving the current route;
- cookie consent necessary-only selection and reset;
- contact and pilot form submission through the real local API routes.

Form submissions use synthetic `example.com` identities and a loopback mock receiver. The mock keeps only booleans and selected non-sensitive metadata needed to prove route, locale, source, path, and UTM propagation. It never writes raw request bodies, cookies, IP addresses, endpoint values, or tokens to the report.

## Browser and network boundary

The supported browser revision is Chrome Headless Shell `150.0.7871.24`, installed under the ignored repository-local `.cache/puppeteer` directory. CI installs its Linux runtime dependencies through the browser installer.

The application and mock receiver bind to ephemeral loopback ports. Browser request interception allows loopback HTTP only and aborts external analytics, font, or third-party requests. The production environment and GitHub deployment environments are not referenced.

## Accessibility and layout policy

For every representative page, the gate verifies:

- the document language matches the locale;
- no axe-core `serious` or `critical` WCAG 2.x violation exists;
- no duplicate DOM ID exists;
- `main#content` and the first `h1` are visible and non-zero sized;
- horizontal overflow does not exceed one CSS pixel;
- horizontally scrollable comparison content is keyboard reachable.

Minor or moderate axe observations remain visible in the JSON report but are not treated as equivalent to serious or critical failures. Duplicate IDs and responsive overflow are checked separately from axe so regressions cannot disappear through rule configuration.

## Artifacts and privacy

The safe result is written to `.artifacts/browser-quality/result.json` with restrictive file permissions. A full-page screenshot is created only for a failing scenario. CI uploads that failure directory for three days; upload failure is non-blocking and cannot change the browser gate result.

The safe log line begins with `BROWSER_QUALITY_SAFE` and contains only scenario keys, route paths, locale, status, aggregate accessibility/layout evidence, and sanitized mock-forwarding evidence.

## Local use

```bash
npm ci
npm run browser:install
NEXT_PUBLIC_ANALYTICS_ENABLED=true \
NEXT_PUBLIC_GA_ID=G-BROWSERTEST \
NEXT_PUBLIC_GTM_ID=GTM-BROWSERTEST \
NEXT_PUBLIC_CLARITY_ID=BROWSERTEST \
npm run build
npm run test:browser
```

Linux hosts need the standard Chrome Headless Shell runtime libraries. The GitHub runner installs them automatically; restricted local agents may provide them through an external `LD_LIBRARY_PATH` without changing the repository or system package database.

## Failure triage

1. Read the `BROWSER_QUALITY_SAFE` line and identify the failing scenario and axe rule ID or form diagnostic.
2. Inspect the matching screenshot under `.artifacts/browser-quality/` when present.
3. Reproduce only the failing scenario locally; do not weaken the WCAG severity, duplicate-ID, document-language, or overflow assertions to make CI green.
4. For form failures, verify native validity, cookie-banner state, API response code, local mock evidence, and forwarding policy in `form-runtime.md`.
5. Fix the product or runner defect with a regression test, then rerun the complete browser gate and normal test suite.
