# Extra Page Content Modularization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split locale-specific extra page copy out of `src/lib/pages.ts` while preserving every public page, route, label, metadata value, and content shape.

**Architecture:** Add a shared typed factory, six locale content modules, and a static locale index. Keep `src/lib/pages.ts` as the public registry and navigation/layout API.

**Tech Stack:** TypeScript, Node.js test runner with repository alias loader, Next.js 16, no new dependencies.

## Global Constraints

- Parent issue #14 remains open after this slice.
- Preserve every export and function signature from `src/lib/pages.ts`.
- Preserve copy, punctuation, metadata, section order, route segments, navigation labels, and layout labels exactly.
- Use static imports only and add no runtime fallback.
- Add no credentials, endpoints, private paths, infrastructure identifiers, or dependencies.
- Inspect all bot, agent, security, dependency, review, annotation, and workflow feedback before integration.

---

### Task 1: Establish the modular content contract

**Files:**
- Create: `tests/page-content-modularization.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: existing `getPages(locale)` and `Locale` support.
- Produces: failing architecture and behavior requirements for the extraction.

- [ ] **Step 1: Capture the pre-extraction content snapshot**

Run a Node script through the repository alias loader and write serialized `getPages(locale)` output for `tr`, `en`, `es`, `it`, `id`, and `pt` to `/tmp/sismosmart-extra-pages-before.json`. The snapshot is temporary and must not be committed.

- [ ] **Step 2: Write the failing architecture test**

Create a test that requires:

```text
src/lib/page-content/extra-pages/shared.ts
src/lib/page-content/extra-pages/index.ts
src/lib/page-content/extra-pages/en.ts
src/lib/page-content/extra-pages/tr.ts
src/lib/page-content/extra-pages/es.ts
src/lib/page-content/extra-pages/it.ts
src/lib/page-content/extra-pages/id.ts
src/lib/page-content/extra-pages/pt.ts
```

Assert that:

- every locale module imports and calls `makeExtraPages`;
- `index.ts` maps all six locale keys;
- `pages.ts` imports `extraPagesByLocale`;
- `pages.ts` does not define `ExtraPageInput`, `ExtraPagesInput`, `toInfoPage`, or `makeExtraPages`;
- `pages.ts` does not contain representative embedded copy markers such as `MEMS accelerometer` and `Pilot program application`;
- `pages.ts` is no more than 360 lines.

Add behavior assertions for representative metadata and first/last section titles from all six locales using `getPages`.

- [ ] **Step 3: Register the test**

Add `tests/page-content-modularization.test.mjs` to `test` and `test:coverage` immediately after `tests/localized-page-modularization.test.mjs`.

- [ ] **Step 4: Verify RED**

Run:

```bash
node --import ./tests/alias-loader.mjs --test tests/page-content-modularization.test.mjs
```

Expected: fail because the new modules do not exist and `pages.ts` still owns the content.

---

### Task 2: Extract the shared factory and English content

**Files:**
- Create: `src/lib/page-content/extra-pages/shared.ts`
- Create: `src/lib/page-content/extra-pages/en.ts`
- Modify: `src/lib/pages.ts`
- Test: `tests/page-content-modularization.test.mjs`

**Interfaces:**
- Produces: `makeExtraPages(input)` and `enExtraPages`.

- [ ] **Step 1: Move the conversion types and functions**

Move `ExtraPageInput`, `ExtraPagesInput`, `toInfoPage`, and `makeExtraPages` into `shared.ts`. Export only `makeExtraPages`; keep helper types and `toInfoPage` private. Preserve implementation exactly.

- [ ] **Step 2: Move the English locale block**

Create `en.ts`:

```ts
import { makeExtraPages } from "./shared";

export const enExtraPages = makeExtraPages({
  // existing English object moved verbatim
});
```

- [ ] **Step 3: Verify the English module mechanically**

Compare the extracted English object text and serialized `getPages("en")` output with the pre-extraction snapshot. No content difference is allowed.

- [ ] **Step 4: Commit the shared boundary**

Commit the shared factory and English extraction only after the focused test and TypeScript check pass for this intermediate state.

---

### Task 3: Extract the remaining locale content and static index

**Files:**
- Create: `src/lib/page-content/extra-pages/tr.ts`
- Create: `src/lib/page-content/extra-pages/es.ts`
- Create: `src/lib/page-content/extra-pages/it.ts`
- Create: `src/lib/page-content/extra-pages/id.ts`
- Create: `src/lib/page-content/extra-pages/pt.ts`
- Create: `src/lib/page-content/extra-pages/index.ts`
- Modify: `src/lib/pages.ts`
- Test: `tests/page-content-modularization.test.mjs`

**Interfaces:**
- Consumes: `makeExtraPages(input)`.
- Produces: `extraPagesByLocale: Record<Locale, ExtraRoutePagesCopy>`.

- [ ] **Step 1: Move each locale block verbatim**

For every remaining locale, create a module with one exported value:

```ts
export const trExtraPages = makeExtraPages({ ... });
export const esExtraPages = makeExtraPages({ ... });
export const itExtraPages = makeExtraPages({ ... });
export const idExtraPages = makeExtraPages({ ... });
export const ptExtraPages = makeExtraPages({ ... });
```

Do not edit copy while moving it.

- [ ] **Step 2: Create the static index**

Create `index.ts` with static imports and:

```ts
export const extraPagesByLocale: Record<Locale, ExtraRoutePagesCopy> = {
  tr: trExtraPages,
  en: enExtraPages,
  es: esExtraPages,
  it: itExtraPages,
  id: idExtraPages,
  pt: ptExtraPages,
};
```

Export the shared output type from `shared.ts` or derive it locally without widening the page shape.

- [ ] **Step 3: Reduce `pages.ts` to registry and navigation responsibilities**

Import `extraPagesByLocale`, remove the embedded factory and locale object, and leave `getPages` unchanged:

```ts
export function getPages(locale: Locale) {
  return {
    ...pagesByLocale[locale],
    ...extraPagesByLocale[locale],
  };
}
```

- [ ] **Step 4: Verify GREEN and content equivalence**

Run the focused test and serialize all six `getPages(locale)` values again. Compare the result byte-for-byte with `/tmp/sismosmart-extra-pages-before.json`.

- [ ] **Step 5: Commit the locale extraction**

Commit all remaining locale modules, the index, `pages.ts`, package script registration, and architecture test.

---

### Task 4: Complete repository validation and integration review

**Files:**
- Test: complete repository
- Review: full branch diff and GitHub feedback

**Interfaces:**
- Consumes: completed extraction.
- Produces: validated pull request for the third #14 slice.

- [ ] **Step 1: Run complete local validation**

```bash
npm run lint
npm run typecheck
npm test
NEXT_PUBLIC_ANALYTICS_ENABLED=true npm run build
npm audit --audit-level=high
npm run test:browser
```

Expected: all commands pass.

- [ ] **Step 2: Review diff and public safety**

Run:

```bash
git diff origin/main...HEAD --check
git diff --stat origin/main...HEAD
git status --short
```

Confirm only the planned content modules, registry, tests, package scripts, and documents changed. Scan for credentials, private keys, private addresses, internal paths, provider identifiers, and legacy repository identities.

- [ ] **Step 3: Publish a draft pull request**

Push `refactor/issue-14-extra-page-content`, open a draft PR related to #14 without using an automatic closing keyword, and request SismoSmart review.

- [ ] **Step 4: Inspect every GitHub feedback channel**

Review issue and PR comments, bot and agent suggestions, inline comments, submitted reviews, dependency/security findings, workflow checks, and warning/failure annotations. Resolve actionable findings before integration.

- [ ] **Step 5: Integrate and verify main**

Integrate only when all checks are green, preserve SismoSmart author/committer identity, keep issue #14 open, and verify Mainline Policy, Security, and CI on the resulting `main` revision.
