import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import puppeteer from "puppeteer-core";

const analyticsConfig = JSON.parse(
  await fs.readFile(new URL("../../config/analytics.json", import.meta.url), "utf8"),
);
import {
  buildCheck,
  classifyAnalyticsRequest,
  countPageViewRequests,
  countRequests,
  getLogicalPageViewEvidence,
  summarizeChecks,
} from "./analytics-audit-lib.mjs";
import { parseCliArgs } from "./config.mjs";

const navigationTimeoutMs = 45_000;
const auditFormPath = "/__analytics-audit-form";

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function findChromeExecutable() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Try the next known executable path.
    }
  }

  throw new Error(
    "Chrome/Chromium was not found. Set PUPPETEER_EXECUTABLE_PATH to an installed browser.",
  );
}

function isGrantedConsentEntry(entry) {
  return (
    Array.isArray(entry) &&
    entry[0] === "consent" &&
    entry[1] === "update" &&
    entry[2]?.analytics_storage === "granted"
  );
}

function isDeniedConsentEntry(entry, mode = null) {
  return (
    Array.isArray(entry) &&
    entry[0] === "consent" &&
    (!mode || entry[1] === mode) &&
    entry[2]?.analytics_storage === "denied"
  );
}

function hasClarityConsent(calls, expected) {
  return calls.some(
    (entry) =>
      Array.isArray(entry) &&
      entry[0] === "consentv2" &&
      entry[1]?.analytics_Storage === expected,
  );
}

function hasFormSuccessEvent(dataLayer) {
  return dataLayer.some(
    (entry) =>
      Array.isArray(entry) &&
      entry[0] === "event" &&
      entry[1] === analyticsConfig.events.formSuccess &&
      entry[2]?.form_type === "observability_audit",
  );
}

function normalizeObservedRequest(request) {
  const classification = classifyAnalyticsRequest(request.url());
  return {
    kind: classification.kind,
    eventName: classification.eventName,
    method: request.method(),
    failed: false,
    // Kept for analytics traffic only, so a failing loader check reports what
    // was actually observed instead of an empty details object.
    url: classification.kind === "other" ? null : request.url(),
  };
}

function describeRequests(requests, kind) {
  const matched = requests.filter((request) => request.kind === kind);
  return { count: matched.length, urls: matched.map((request) => request.url) };
}

/**
 * Requests served from the browser cache never reach the interception handler,
 * and a slow third-party response can land after a fixed dwell. Poll the
 * observed requests instead of assuming the loader arrived within the sleep.
 */
async function waitForRequestKind(requests, kind, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (countRequests(requests, kind) > 0) return true;
    await sleep(250);
  }
  return false;
}

async function createPage(browser, baseUrl, locale, choice) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  const requests = [];

  page.setDefaultNavigationTimeout(navigationTimeoutMs);
  page.setDefaultTimeout(navigationTimeoutMs);
  await page.setRequestInterception(true);

  page.on("request", async (request) => {
    const requestUrl = new URL(request.url());
    if (requestUrl.pathname === auditFormPath) {
      requests.push({ kind: "audit-form", eventName: null, method: request.method(), failed: false });
      await request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, audit: true }),
      });
      return;
    }

    requests.push(normalizeObservedRequest(request));
    await request.continue();
  });

  await page.evaluateOnNewDocument(
    ({ consentKey, initialChoice }) => {
      if (initialChoice) {
        window.localStorage.setItem(consentKey, initialChoice);
      } else {
        window.localStorage.removeItem(consentKey);
      }

      const calls = [];
      function clarityAuditStub(...args) {
        calls.push(args);
        clarityAuditStub.q = clarityAuditStub.q || [];
        clarityAuditStub.q.push(args);
      }
      clarityAuditStub.q = [];
      window.__sismosmartClarityCalls = calls;
      window.clarity = clarityAuditStub;
    },
    { consentKey: analyticsConfig.consent.storageKey, initialChoice: choice },
  );

  const url = new URL(`/${locale}`, baseUrl);
  url.searchParams.set("sismosmart_audit", "1");
  url.searchParams.set("audit_locale", locale);
  await page.goto(url.toString(), { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#sismosmart-cookie-consent-script");
  if (choice === "accepted") {
    await waitForRequestKind(requests, "gtm-loader", 5_000);
  }
  await sleep(choice === "accepted" ? 8_000 : 1_500);

  return { context, page, requests };
}

async function readPageState(page) {
  return page.evaluate((consentKey) => {
    const dataLayer = (window.dataLayer || []).map((entry) => {
      if (Array.isArray(entry)) return entry;
      if (entry && typeof entry === "object" && Number.isInteger(entry.length)) {
        return Array.from(entry);
      }
      return entry;
    });
    const banner = document.querySelector("[data-cookie-consent]");
    return {
      storedChoice: window.localStorage.getItem(consentKey),
      bannerHidden: banner?.hidden ?? null,
      dataLayer,
      clarityCalls: window.__sismosmartClarityCalls || [],
      scriptIds: [...document.querySelectorAll("script[id]")].map((script) => script.id),
      analyticsApiPresent: Boolean(window.__sismosmartAnalytics),
      clarityApiPresent: typeof window.clarity === "function",
    };
  }, analyticsConfig.consent.storageKey);
}

async function submitSyntheticForm(page) {
  await page.evaluate(
    ({ endpointPath, eventName }) => {
      const form = document.createElement("form");
      form.id = "sismosmart-observability-audit-form";
      form.dataset.jsonForm = "";
      form.dataset.endpoint = endpointPath;
      form.dataset.analyticsForm = "observability_audit";
      form.dataset.success = "ok";
      form.dataset.error = "error";

      const status = document.createElement("p");
      status.dataset.formStatus = "";
      status.hidden = true;
      form.appendChild(status);

      const input = document.createElement("input");
      input.name = "audit_event";
      input.value = eventName;
      form.appendChild(input);
      document.body.appendChild(form);
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    },
    { endpointPath: auditFormPath, eventName: analyticsConfig.events.formSuccess },
  );

  await page.waitForFunction(() => {
    const status = document.querySelector(
      "#sismosmart-observability-audit-form [data-form-status]",
    );
    return status?.dataset.state === "success";
  });
  await sleep(2_000);
}

async function resetConsent(page) {
  await page.evaluate(() => {
    document.cookie = "_clck=audit; Path=/; SameSite=Lax";
    document.cookie = "_clsk=audit; Path=/; SameSite=Lax";
  });
  await page.click("[data-cookie-reset]");
  const trackResult = await page.evaluate((eventName) => {
    return window.__sismosmartAnalytics?.track(eventName, { source: "after_reset" }) ?? null;
  }, analyticsConfig.events.audit);
  await sleep(1_000);
  const state = await readPageState(page);
  const cookieNames = (await page.cookies()).map((cookie) => cookie.name).sort();
  return { state, cookieNames, trackResult };
}

async function runScenario(browser, baseUrl, locale, choice) {
  const { context, page, requests } = await createPage(
    browser,
    baseUrl,
    locale,
    choice,
  );

  try {
    let state = await readPageState(page);
    const pageViewCount = countPageViewRequests(requests);
    if (choice === "necessary" || choice === "accepted") {
      await submitSyntheticForm(page);
      state = await readPageState(page);
    }

    const reset = choice === "accepted" ? await resetConsent(page) : null;
    return {
      locale,
      choice: choice || "unset",
      state,
      reset,
      requests,
      pageViewCount,
    };
  } finally {
    await context.close();
  }
}

function evaluateScenario(scenario, enforceCanonicalNetwork) {
  const checks = [];
  const { choice, locale, requests, reset, state } = scenario;
  const prefix = `${locale}/${choice}`;
  const pageViewEvidence = getLogicalPageViewEvidence(
    state.dataLayer,
    requests,
    analyticsConfig.public.gaMeasurementId,
  );
  const defaultIndex = state.dataLayer.findIndex((entry) => isDeniedConsentEntry(entry, "default"));
  const firstMeasurementIndex = state.dataLayer.findIndex(
    (entry) => Array.isArray(entry) && ["js", "config"].includes(entry[0]),
  );

  checks.push(
    buildCheck(`${prefix}: analytics API`, state.analyticsApiPresent, {}),
    buildCheck(`${prefix}: consent defaults denied`, defaultIndex >= 0, { defaultIndex }),
    buildCheck(
      `${prefix}: default precedes measurement`,
      firstMeasurementIndex < 0 || defaultIndex < firstMeasurementIndex,
      { defaultIndex, firstMeasurementIndex },
    ),
  );

  if (choice === "unset") {
    checks.push(
      buildCheck(`${prefix}: banner visible`, state.bannerHidden === false, state),
      buildCheck(`${prefix}: no stored choice`, state.storedChoice === null, state),
      buildCheck(`${prefix}: no GA loader`, countRequests(requests, "ga-loader") === 0, {}),
      buildCheck(`${prefix}: no GTM loader`, countRequests(requests, "gtm-loader") === 0, {}),
      buildCheck(`${prefix}: no Clarity loader`, countRequests(requests, "clarity-loader") === 0, {}),
      buildCheck(`${prefix}: no GA collect`, countRequests(requests, "ga-collect") === 0, {}),
    );
  }

  if (choice === "necessary") {
    checks.push(
      buildCheck(`${prefix}: stored necessary`, state.storedChoice === "necessary", state),
      buildCheck(`${prefix}: banner hidden`, state.bannerHidden === true, state),
      buildCheck(
        `${prefix}: Google update denied`,
        state.dataLayer.some((entry) => isDeniedConsentEntry(entry, "update")),
        {},
      ),
      buildCheck(
        `${prefix}: Clarity update denied`,
        hasClarityConsent(state.clarityCalls, "denied"),
        { clarityCalls: state.clarityCalls },
      ),
      buildCheck(`${prefix}: no loaders`, ["ga-loader", "gtm-loader", "clarity-loader"].every((kind) => countRequests(requests, kind) === 0), {}),
      buildCheck(`${prefix}: no GA collect`, countRequests(requests, "ga-collect") === 0, {}),
      buildCheck(`${prefix}: form event suppressed`, !hasFormSuccessEvent(state.dataLayer), {}),
    );
  }

  if (choice === "accepted") {
    const scriptIds = state.scriptIds.filter((id) =>
      ["sismosmart-ga-loader", "sismosmart-gtm-loader", "sismosmart-clarity"].includes(id),
    );
    checks.push(
      buildCheck(`${prefix}: stored accepted`, state.storedChoice === "accepted", state),
      buildCheck(`${prefix}: banner hidden`, state.bannerHidden === true, state),
      buildCheck(
        `${prefix}: Google update granted`,
        state.dataLayer.some(isGrantedConsentEntry),
        {},
      ),
      buildCheck(
        `${prefix}: Clarity update granted`,
        hasClarityConsent(state.clarityCalls, "granted"),
        { clarityCalls: state.clarityCalls },
      ),
      buildCheck(
        `${prefix}: GA loader count`,
        countRequests(requests, "ga-loader") <= 1,
        { enforceCanonicalNetwork, ...describeRequests(requests, "ga-loader") },
      ),
      // The injected tag is the invariant we control, so it is asserted exactly.
      // The network count only guards against a second fetch: a cached response
      // never reaches the request handler, so a missing observation must not
      // fail the audit. A genuinely broken GTM still trips the consent, Clarity
      // loader and page view checks below.
      buildCheck(
        `${prefix}: one GTM loader tag`,
        scriptIds.filter((id) => id === "sismosmart-gtm-loader").length === 1,
        { scriptIds },
      ),
      buildCheck(
        `${prefix}: GTM loader network fanout`,
        countRequests(requests, "gtm-loader") <= 2,
        describeRequests(requests, "gtm-loader"),
      ),
      buildCheck(
        `${prefix}: one Clarity loader`,
        countRequests(requests, "clarity-loader") === 1,
        describeRequests(requests, "clarity-loader"),
      ),
      buildCheck(
        `${prefix}: one GA config command`,
        pageViewEvidence.configCommandCount === 1,
        { configCommandCount: pageViewEvidence.configCommandCount },
      ),
      buildCheck(
        `${prefix}: logical page view count`,
        enforceCanonicalNetwork
          ? pageViewEvidence.logicalPageViewCount === 1
          : pageViewEvidence.configCommandCount === 1 && pageViewEvidence.networkFanoutBounded,
        { enforceCanonicalNetwork, ...pageViewEvidence },
      ),
      buildCheck(
        `${prefix}: page view network fanout`,
        pageViewEvidence.networkFanoutBounded,
        { beaconCount: pageViewEvidence.beaconCount },
      ),
      buildCheck(`${prefix}: form success event queued`, hasFormSuccessEvent(state.dataLayer), {}),
      buildCheck(
        `${prefix}: form success collect sent`,
        countRequests(requests, "ga-collect", analyticsConfig.events.formSuccess) >= 1,
        {},
        "warning",
      ),
      buildCheck(`${prefix}: no duplicate script IDs`, new Set(scriptIds).size === scriptIds.length, { scriptIds }),
      buildCheck(`${prefix}: Clarity API available`, state.clarityApiPresent, {}),
      buildCheck(`${prefix}: reset cleared storage`, reset?.state.storedChoice === null, reset),
      buildCheck(`${prefix}: reset shows banner`, reset?.state.bannerHidden === false, reset),
      buildCheck(
        `${prefix}: reset denies Google`,
        reset?.state.dataLayer.some((entry) => isDeniedConsentEntry(entry, "update")),
        reset,
      ),
      buildCheck(
        `${prefix}: reset denies Clarity`,
        hasClarityConsent(reset?.state.clarityCalls || [], "denied"),
        reset,
      ),
      buildCheck(
        `${prefix}: reset clears Clarity cookies`,
        !reset?.cookieNames.some((name) => ["_clck", "_clsk"].includes(name)),
        reset,
      ),
      buildCheck(`${prefix}: tracking disabled after reset`, reset?.trackResult === false, reset),
    );
  }

  return checks;
}

async function main() {
  const { options } = parseCliArgs();
  const baseUrl = String(options["base-url"] || process.env.ANALYTICS_AUDIT_BASE_URL || "https://sismosmart.com");
  const outputPath = options.output ? path.resolve(String(options.output)) : null;
  const requestedLocales = String(options.locales || analyticsConfig.locales.join(","))
    .split(",")
    .map((locale) => locale.trim())
    .filter(Boolean);
  const unsupported = requestedLocales.filter((locale) => !analyticsConfig.locales.includes(locale));
  if (unsupported.length > 0) {
    throw new Error(`Unsupported locale(s): ${unsupported.join(", ")}`);
  }

  const executablePath = await findChromeExecutable();
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const scenarios = [];
  try {
    for (const locale of requestedLocales) {
      for (const choice of [null, "necessary", "accepted"]) {
        scenarios.push(await runScenario(browser, baseUrl, locale, choice));
      }
    }
  } finally {
    await browser.close();
  }

  const canonicalHost = new URL(analyticsConfig.googleAnalytics.defaultUri).hostname;
  const enforceCanonicalNetwork = new URL(baseUrl).hostname === canonicalHost;
  const checks = scenarios.flatMap((scenario) =>
    evaluateScenario(scenario, enforceCanonicalNetwork),
  );
  const summary = summarizeChecks(checks);
  const compactScenarios = scenarios.map((scenario) => {
    const pageViewEvidence = getLogicalPageViewEvidence(
      scenario.state.dataLayer,
      scenario.requests,
      analyticsConfig.public.gaMeasurementId,
    );
    return {
      locale: scenario.locale,
      choice: scenario.choice,
      storedChoice: scenario.state.storedChoice,
      bannerHidden: scenario.state.bannerHidden,
      requestCounts: Object.fromEntries(
        ["ga-loader", "gtm-loader", "clarity-loader", "ga-collect", "clarity-collect"].map(
          (kind) => [kind, countRequests(scenario.requests, kind)],
        ),
      ),
      pageViewCount: scenario.pageViewCount,
      logicalPageViewCount: pageViewEvidence.logicalPageViewCount,
      gaConfigCommandCount: pageViewEvidence.configCommandCount,
      formSuccessCount: countRequests(
        scenario.requests,
        "ga-collect",
        analyticsConfig.events.formSuccess,
      ),
      reset: scenario.reset
        ? {
            storedChoice: scenario.reset.state.storedChoice,
            bannerHidden: scenario.reset.state.bannerHidden,
            cookieNames: scenario.reset.cookieNames,
            trackResult: scenario.reset.trackResult,
          }
        : null,
    };
  });

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    executablePath,
    locales: requestedLocales,
    enforceCanonicalNetwork,
    scenarios: compactScenarios,
    checks,
    summary,
  };

  console.table(
    compactScenarios.map((scenario) => ({
      locale: scenario.locale,
      choice: scenario.choice,
      stored: scenario.storedChoice,
      bannerHidden: scenario.bannerHidden,
      ga: scenario.requestCounts["ga-loader"],
      gtm: scenario.requestCounts["gtm-loader"],
      clarity: scenario.requestCounts["clarity-loader"],
      pageviews: scenario.logicalPageViewCount,
      formEvents: scenario.formSuccessCount,
    })),
  );
  console.table(
    checks.map((check) => ({
      status: check.ok ? "PASS" : check.severity === "warning" ? "WARN" : "FAIL",
      check: check.name,
    })),
  );

  if (outputPath) {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`ANALYTICS_AUDIT_REPORT path=${outputPath}`);
  }

  console.log(
    `ANALYTICS_AUDIT_RESULT ok=${summary.ok} passed=${summary.passed} failed=${summary.failed} warnings=${summary.warnings}`,
  );
  if (!summary.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
