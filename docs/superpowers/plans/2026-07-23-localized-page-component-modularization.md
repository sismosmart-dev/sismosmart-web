# Localized Page Component Modularization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the oversized localized page renderer into focused page-type components while preserving every public route and rendered behavior.

**Architecture:** Keep `src/components/localized-subpage.tsx` as the stable synchronous dispatcher. Move page-specific labels, imports, and JSX into named components under `src/components/localized-pages/`, with the shared information-page renderer accepting an explicit restricted page-key union.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, Node test runner, existing browser/accessibility harness, no new dependencies.

## Global Constraints

- Keep `renderStaticPage(locale, pageKey)` signature and null behavior unchanged.
- Keep current JSX order, classes, IDs, ARIA attributes, links, image priority, forms, and chart behavior unchanged.
- Do not modify localized copy, route segments, metadata, structured data, or production controls.
- Do not add dependencies, dynamic imports, lazy-loading boundaries, or production mutations.
- Keep this pull request limited to the localized application-page renderer.
- Inspect every bot, agent, security, dependency, inline-review, submitted-review, annotation, and workflow result before merge.

---

### Task 1: Establish the modularization contract and extract the label-heavy pages

**Files:**
- Create: `tests/localized-page-modularization.test.mjs`
- Modify: `package.json`
- Create: `src/components/localized-pages/product-page.tsx`
- Create: `src/components/localized-pages/how-it-works-page.tsx`
- Create: `src/components/localized-pages/about-page.tsx`
- Modify: `src/components/localized-subpage.tsx`

**Interfaces:**
- Produces: `ProductPage({ locale }: { locale: Locale })`
- Produces: `HowItWorksPage({ locale }: { locale: Locale })`
- Produces: `AboutPage({ locale }: { locale: Locale })`
- Preserves: `renderStaticPage(locale: Locale, pageKey: StaticPageKey)`

- [ ] **Step 1: Write a failing architecture test**

Create `tests/localized-page-modularization.test.mjs` with assertions that the three modules exist, export their named components, own their corresponding label dictionaries, and are imported by the dispatcher:

```js
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const modules = [
  ["product-page.tsx", "ProductPage", "productLabels"],
  ["how-it-works-page.tsx", "HowItWorksPage", "howItWorksLabels"],
  ["about-page.tsx", "AboutPage", "aboutLabels"],
];

test("label-heavy localized pages own their rendering dependencies", () => {
  const dispatcher = read("src/components/localized-subpage.tsx");
  for (const [file, component, labels] of modules) {
    const source = read(`src/components/localized-pages/${file}`);
    assert.match(source, new RegExp(`export function ${component}`));
    assert.match(source, new RegExp(`const ${labels}`));
    assert.match(dispatcher, new RegExp(component));
    assert.doesNotMatch(dispatcher, new RegExp(`const ${labels}`));
  }
});
```

- [ ] **Step 2: Register the focused test**

Add `tests/localized-page-modularization.test.mjs` to both `test` and `test:coverage` immediately after `tests/agent-discovery.test.mjs` in `package.json`.

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```bash
node --import ./tests/alias-loader.mjs --test tests/localized-page-modularization.test.mjs
```

Expected: FAIL because the page-type modules do not exist and the label dictionaries remain in `localized-subpage.tsx`.

- [ ] **Step 4: Extract product rendering unchanged**

Move `productLabels` (current lines 73-282) and the complete `renderProductPage` implementation (current lines 514-694) into `src/components/localized-pages/product-page.tsx`. Change only the declaration to:

```tsx
export function ProductPage({ locale }: { locale: Locale }) {
```

Keep the current function body byte-for-byte except for the new prop wrapper. Keep the current `ProductVisual` props, including `priority`, and keep the comparison wrapper with `aria-label`, `overflow-x-auto`, and `tabIndex={0}`.

- [ ] **Step 5: Extract how-it-works rendering unchanged**

Move `howItWorksLabels` (current lines 283-382) and the complete `renderHowItWorksPage` implementation (current lines 695-795) into `src/components/localized-pages/how-it-works-page.tsx`. Change only the declaration to:

```tsx
export function HowItWorksPage({ locale }: { locale: Locale }) {
```

Keep the existing local variables and JSX body unchanged.

- [ ] **Step 6: Extract about rendering unchanged**

Move `aboutLabels` (current lines 383-482) and the complete `renderAboutPage` implementation (current lines 876-974) into `src/components/localized-pages/about-page.tsx`. Change only the declaration to:

```tsx
export function AboutPage({ locale }: { locale: Locale }) {
```

Keep the existing local variables and JSX body unchanged.

- [ ] **Step 7: Update the dispatcher**

Import the three named components and replace their switch branches with:

```tsx
case "product":
  return <ProductPage locale={locale} />;
case "howItWorks":
  return <HowItWorksPage locale={locale} />;
case "about":
  return <AboutPage locale={locale} />;
```

- [ ] **Step 8: Run the focused architecture test**

Run:

```bash
node --import ./tests/alias-loader.mjs --test tests/localized-page-modularization.test.mjs
```

Expected: PASS for the three extracted modules. The existing repository source-location contract is intentionally updated only after the full extraction in Task 3.

- [ ] **Step 9: Commit the first extraction**

```bash
git add package.json tests/localized-page-modularization.test.mjs \
  src/components/localized-subpage.tsx \
  src/components/localized-pages/product-page.tsx \
  src/components/localized-pages/how-it-works-page.tsx \
  src/components/localized-pages/about-page.tsx
git diff --cached --check
git commit -m "refactor: extract localized feature pages"
```

---

### Task 2: Extract the remaining page renderers and reduce the dispatcher

**Files:**
- Modify: `tests/localized-page-modularization.test.mjs`
- Create: `src/components/localized-pages/pilot-program-page.tsx`
- Create: `src/components/localized-pages/faq-page.tsx`
- Create: `src/components/localized-pages/contact-page.tsx`
- Create: `src/components/localized-pages/info-page.tsx`
- Modify: `src/components/localized-subpage.tsx`

**Interfaces:**
- Produces: `PilotProgramPage({ locale }: { locale: Locale })`
- Produces: `FaqPage({ locale }: { locale: Locale })`
- Produces: `ContactPage({ locale }: { locale: Locale })`
- Produces: `InfoPage({ locale, pageKey }: { locale: Locale; pageKey: InfoPageKey })`
- Produces: `InfoPageKey = "technology" | "investors" | "security" | "press" | "privacy" | "terms"`

- [ ] **Step 1: Extend the test and verify RED**

Add expected modules and a dispatcher-size boundary:

```js
const remainingModules = [
  ["pilot-program-page.tsx", "PilotProgramPage"],
  ["faq-page.tsx", "FaqPage"],
  ["contact-page.tsx", "ContactPage"],
  ["info-page.tsx", "InfoPage"],
];

test("localized page dispatcher contains routing only", () => {
  const dispatcher = read("src/components/localized-subpage.tsx");
  assert.ok(dispatcher.split("\n").length <= 90);
  assert.doesNotMatch(dispatcher, /<main\b/);
  assert.doesNotMatch(dispatcher, /const (frequencyTrendLabels|productLabels|howItWorksLabels|aboutLabels)/);
});
```

Run the focused test and expect failure because the remaining modules do not exist and the dispatcher still contains JSX.

- [ ] **Step 2: Extract pilot, FAQ, and contact components**

Move each complete renderer body from `localized-subpage.tsx` without JSX or copy changes: pilot lines 796-842, FAQ lines 843-875, and contact lines 975-1023. Change only their declarations to:

```tsx
export function PilotProgramPage({ locale }: { locale: Locale }) {
export function FaqPage({ locale }: { locale: Locale }) {
export function ContactPage({ locale }: { locale: Locale }) {
```

Each declaration opens the existing function body in its own file; the closing braces remain those of the moved functions.

Keep `PilotProgramForm` and `ContactForm` imports only in their owning modules.

- [ ] **Step 3: Extract the shared information component**

Move `frequencyTrendLabels` and `renderInfoPage` into `info-page.tsx`. Define and export:

```ts
export type InfoPageKey =
  | "technology"
  | "investors"
  | "security"
  | "press"
  | "privacy"
  | "terms";
```

Move the complete `renderInfoPage` implementation from current lines 1024-1110 and change only its declaration to:

```tsx
export function InfoPage({
  locale,
  pageKey,
}: {
  locale: Locale;
  pageKey: InfoPageKey;
}) {
```

Keep the existing `page`, `trend`, and JSX body unchanged.

- [ ] **Step 4: Reduce `localized-subpage.tsx` to routing only**

The final file imports the seven components plus `isLocale`, `locales`, `Locale`, and `StaticPageKey`. Its switch remains explicit and returns component elements. Information keys share the `InfoPage` branch.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```bash
node --import ./tests/alias-loader.mjs --test tests/localized-page-modularization.test.mjs
```

Expected: PASS, with the dispatcher at or below 90 lines and no page JSX or page-specific label dictionaries.

- [ ] **Step 6: Commit the remaining extraction**

```bash
git add tests/localized-page-modularization.test.mjs \
  src/components/localized-subpage.tsx \
  src/components/localized-pages/pilot-program-page.tsx \
  src/components/localized-pages/faq-page.tsx \
  src/components/localized-pages/contact-page.tsx \
  src/components/localized-pages/info-page.tsx
git diff --cached --check
git commit -m "refactor: modularize localized page renderers"
```

---

### Task 3: Move source-location contracts and verify behavioral equivalence

**Files:**
- Modify: `tests/repository-contract.test.mjs`
- Test: `tests/localized-page-modularization.test.mjs`
- Test: all repository and browser checks

**Interfaces:**
- Consumes: `ProductPage`, dispatcher, and the existing browser-quality route policy.
- Preserves: public routes, product LCP image contract, comparison accessibility, forms, and analytics consent behavior.

- [ ] **Step 1: Update repository source-location assertions**

Change only assertions that intentionally read the old monolith:

```js
const productPage = readText("src/components/localized-pages/product-page.tsx");
```

Use `productPage` for the `meterTopValue={page.meterTopValue}` plus `priority` assertion and for the comparison `aria-label` / `overflow-x-auto` / `tabIndex={0}` assertion. Do not weaken the regexes.

- [ ] **Step 2: Run focused repository tests**

Run:

```bash
node --import ./tests/alias-loader.mjs --test \
  tests/localized-page-modularization.test.mjs \
  tests/repository-contract.test.mjs \
  tests/agent-discovery.test.mjs
```

Expected: PASS.

- [ ] **Step 3: Run complete quality validation**

Run:

```bash
npm run lint
npm run typecheck
npm test
NEXT_PUBLIC_ANALYTICS_ENABLED=true npm run build
npm audit --audit-level=high
```

Expected: all commands pass, all localized routes remain generated, and audit reports zero vulnerabilities at the configured threshold.

- [ ] **Step 4: Run browser and accessibility validation**

Run the pinned browser workflow in the supported environment:

```bash
npm run browser:install
NEXT_PUBLIC_ANALYTICS_ENABLED=true npm run build
npm run test:browser
```

Expected: every page, navigation, consent, contact-form, pilot-form, forwarding, accessibility, duplicate-ID, and layout scenario passes.

- [ ] **Step 5: Review the final diff for behavioral changes and disclosure**

Verify:

```bash
git diff origin/main...HEAD --check
git diff --stat origin/main...HEAD
git status --short
```

Inspect all added and moved source for credentials, private endpoints, provider identifiers, private addresses, internal paths, and accidental copy changes. Expected: none.

- [ ] **Step 6: Commit contract updates**

```bash
git add tests/repository-contract.test.mjs
git diff --cached --check
git commit -m "test: preserve localized page behavior"
```

- [ ] **Step 7: Publish a draft pull request and inspect feedback**

Push `refactor/issue-14-localized-page-components`, open a draft PR that relates to #14 without closing the parent issue, request SismoSmart review, and inspect all bot, agent, security, dependency, inline-review, submitted-review, workflow, and annotation channels before integration.
