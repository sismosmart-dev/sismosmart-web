# Extra Page Content Modularization Design

## Goal

Move locale-specific technology, pilot program, investors, FAQ, and security page copy out of `src/lib/pages.ts` without changing public routes, page shapes, metadata, navigation, layout labels, or generated output.

This is the third small delivery for issue #14. The parent issue remains open for deployment orchestration, production-health orchestration, browser-runner, and any later content-source decomposition work.

## Current problem

`src/lib/pages.ts` is approximately 960 lines and combines four responsibilities:

- route segment and page-key contracts;
- base and extra page-content assembly;
- approximately 640 lines of locale-specific extra page copy;
- navigation and layout chrome labels.

Base route copy already lives in locale modules under `src/lib/page-content/`. Extra page copy remains embedded in the registry, making content review and translation maintenance require reading unrelated routing and navigation code.

## Approaches considered

### Move all extra copy into one file

This would reduce `pages.ts`, but the new file would remain a large multi-locale monolith and would not improve translation ownership.

### Use dynamic imports or a runtime registry

This would make locale loading more configurable but would change the current static module graph and introduce unnecessary runtime and bundling risk.

### Create one typed module per locale

Create a shared factory and six locale modules, then assemble them through a static index. This follows the existing base-content pattern, keeps imports static, and allows locale changes to be reviewed independently. This is the selected approach.

## Architecture

### `src/lib/page-content/extra-pages/shared.ts`

Owns the private input types and the existing mechanical conversion from tuple sections to `InfoPageCopy` objects:

- `ExtraPageInput`;
- `ExtraPagesInput`;
- `makeExtraPages(input)`.

The output type remains:

```ts
Pick<RoutePagesCopy, "technology" | "pilotProgram" | "investors" | "faq" | "security">
```

### Locale modules

Create:

- `src/lib/page-content/extra-pages/en.ts`;
- `src/lib/page-content/extra-pages/tr.ts`;
- `src/lib/page-content/extra-pages/es.ts`;
- `src/lib/page-content/extra-pages/it.ts`;
- `src/lib/page-content/extra-pages/id.ts`;
- `src/lib/page-content/extra-pages/pt.ts`.

Each module exports exactly one locale value created with `makeExtraPages`. Copy, punctuation, section ordering, metadata, and page keys are moved verbatim.

### `src/lib/page-content/extra-pages/index.ts`

Imports the six locale values and exports one statically typed `extraPagesByLocale` record keyed by `Locale`.

### `src/lib/pages.ts`

Continues to own:

- `routeSegments`;
- `PageKey` and `StaticPageKey`;
- `staticPageKeys`;
- base page-content mapping;
- `getPages`;
- route resolution;
- navigation labels and functions;
- layout labels and `getLayoutChromeLabels`.

It imports `extraPagesByLocale` and no longer contains locale-specific extra page copy or conversion helpers.

## Behavior-preservation rules

- Keep every exported name and function signature from `src/lib/pages.ts` unchanged.
- Keep all route segments and static page keys unchanged.
- Keep every locale's metadata, eyebrow, title, description, section title, section description, and section order unchanged.
- Keep the returned `getPages(locale)` object shape unchanged.
- Keep navigation and layout labels unchanged.
- Keep all imports static; add no runtime loading or fallback behavior.
- Add no dependency and change no build, deployment, analytics, form, or production behavior.

## Testing strategy

Add `tests/page-content-modularization.test.mjs` to verify:

- the shared factory, locale modules, and static index exist;
- every locale module exports through `makeExtraPages`;
- the index contains all six supported locales;
- `pages.ts` imports the index, contains no embedded extra-page factory or representative extra-copy markers, and stays below a focused line-count ceiling;
- `getPages` returns unchanged representative metadata and section content for all locales;
- route, navigation, layout, SEO, Markdown, and agent-discovery tests remain green.

The extraction is validated by comparing serialized `getPages(locale)` output before and after the move for all six locales.

## Public repository safety

The change moves existing public website copy only. It adds no credentials, endpoint values, private infrastructure paths, provider identifiers, production addresses, or secret material.

## Pull-request boundary

The pull request contains only extra-page content extraction, architecture tests, and design/plan documentation. Issue #14 remains open for the remaining modularization slices. Every bot, agent, security, dependency, inline-review, submitted-review, check-annotation, and workflow result must be inspected before integration.

## Non-goals

- No copy editing or translation improvement.
- No route, metadata, navigation, or layout change.
- No dynamic locale loading.
- No base page-content refactor.
- No deployment, operations, or browser-runner change.
