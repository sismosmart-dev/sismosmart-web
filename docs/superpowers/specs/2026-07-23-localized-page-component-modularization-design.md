# Localized Page Component Modularization Design

## Goal

Reduce maintenance and review risk in the localized application-page renderer without changing public routes, rendered copy, metadata, structured data, accessibility behavior, or production controls.

This is the first small delivery for issue #14. It covers only `src/components/localized-subpage.tsx`; deployment, production-health, browser-runner, and content-source decomposition remain separate pull requests.

## Current problem

`src/components/localized-subpage.tsx` is approximately 1,110 lines and owns several unrelated responsibilities:

- locale-specific structural labels for product, technology, how-it-works, and about pages;
- seven page-type renderers;
- common informational-page rendering;
- the page-key routing switch;
- imports for forms, imagery, charts, headings, buttons, and layout helpers.

The public route module is already thin, but reviewing any page-type change requires loading the entire renderer and its unrelated labels.

## Approaches considered

### Extract only locale label dictionaries

This would reduce some visual density but leave all page renderers and imports in one large module. It does not create clear page-type ownership and would not materially satisfy issue #14.

### Introduce a dynamic component registry

A registry with dynamic imports could make the dispatcher concise, but it would alter bundling and rendering behavior for a refactor whose goal is behavioral equivalence. It also adds indirection without a current need for runtime extensibility.

### Extract page-type modules and keep a static dispatcher

Each page type owns its labels, dependencies, and renderer. A small static dispatcher keeps the existing page-key control flow explicit and preserves synchronous rendering. This is the selected approach.

## Architecture

Create `src/components/localized-pages/` with focused modules:

- `product-page.tsx`
- `how-it-works-page.tsx`
- `pilot-program-page.tsx`
- `faq-page.tsx`
- `about-page.tsx`
- `contact-page.tsx`
- `info-page.tsx`

Each module exports one named React component accepting the minimum required props. Locale-specific structural labels stay beside the component that consumes them.

`src/components/localized-subpage.tsx` remains the stable public entry point. It imports the focused components, validates the locale, and maps `StaticPageKey` values through the existing explicit switch. The route module continues importing only `renderStaticPage` from this file.

## Interfaces

Page-specific modules use a consistent locale-only interface where possible:

```ts
export function ProductPage({ locale }: { locale: Locale })
```

The shared information renderer also receives the validated page key:

```ts
export function InfoPage({
  locale,
  pageKey,
}: {
  locale: Locale;
  pageKey: "technology" | "investors" | "security" | "press" | "privacy" | "terms";
})
```

`renderStaticPage(locale, pageKey)` keeps its existing signature and return behavior, including returning `null` for unsupported inputs.

## Data flow

1. The localized route validates the URL locale and page segment.
2. The route calls `renderStaticPage(locale, pageKey)`.
3. The dispatcher selects one focused page component.
4. The selected component reads current localized copy from `getPages(locale)` and renders the same JSX structure as before.
5. Metadata and structured-data generation remain outside this refactor and are unchanged.

## Behavior-preservation rules

- Keep the current JSX element order, classes, IDs, ARIA attributes, links, image settings, and form placement.
- Keep product-image priority behavior unchanged.
- Keep the keyboard-scrollable comparison table and its accessible label unchanged.
- Keep every locale-specific structural label exactly as currently published.
- Keep information-page technology chart behavior unchanged.
- Do not change `src/lib/pages.ts`, localized content, route segments, or structured-data generation.
- Do not add dependencies or lazy-loading boundaries.

## Testing strategy

Add a focused modularization contract that verifies:

- `localized-subpage.tsx` is a small dispatcher and no longer owns page JSX or label dictionaries;
- every expected page-type module exists and exports its named component;
- the dispatcher routes every current `StaticPageKey` to the correct component;
- product priority and comparison accessibility contracts reference the new product module;
- the existing full repository, browser, accessibility, and build checks remain green.

The refactor will follow a red-green cycle: first update or add tests that expect the new boundaries, verify failure against the monolith, then move code without changing rendered behavior.

## Public repository and production safety

This change contains no credentials, endpoints, provider identifiers, origin data, internal paths, production mutation, or workflow change. It changes only source organization and tests.

## Pull-request boundary

The pull request will contain only this application-renderer decomposition and its documentation/tests. Operations modules listed in issue #14 will be handled in later small pull requests. Before merge, every bot, agent, security, dependency, inline-review, submitted-review, annotation, and workflow result must be inspected.

## Non-goals

- No product redesign or copy change.
- No route, metadata, structured-data, SEO, or Markdown discovery change.
- No deployment, production-health, or browser-runner refactor.
- No framework, dependency, or build-system migration.
