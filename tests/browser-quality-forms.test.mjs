import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  chooseNecessaryConsentIfVisible,
  fillAndSubmit,
  runFormScenarios,
  validateForwardingRecords,
} from "../scripts/test/browser-quality-forms.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readText(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), "utf8");
}

function validRecords() {
  return [
    {
      authorizationMatches: true,
      contentTypeMatches: true,
      formMatches: true,
      locale: "en",
      pagePath: "/en/contact",
      route: "contact",
      source: "contact-page",
      utmSource: "ci",
    },
    {
      authorizationMatches: true,
      contentTypeMatches: true,
      formMatches: true,
      locale: "tr",
      pagePath: "/tr/pilot-program",
      route: "waitlist",
      source: "pilot-program",
      utmSource: "ci",
    },
  ];
}

test("browser runner delegates form scenarios to a focused module", () => {
  const runner = readText("scripts/test/browser-quality.mjs");
  const forms = readText("scripts/test/browser-quality-forms.mjs");

  assert.match(forms, /export async function chooseNecessaryConsentIfVisible/);
  assert.match(forms, /export async function fillAndSubmit/);
  assert.match(forms, /export function validateForwardingRecords/);
  assert.match(forms, /export async function runFormScenarios/);
  assert.match(runner, /from "\.\/browser-quality-forms\.mjs"/);
  assert.doesNotMatch(runner, /async function chooseNecessaryConsentIfVisible/);
  assert.doesNotMatch(runner, /async function fillAndSubmit/);
  assert.doesNotMatch(runner, /async function runFormScenarios/);
  assert.doesNotMatch(runner, /data-analytics-form=/);
  assert.doesNotMatch(runner, /browser-contact@example\.com/);
  assert.doesNotMatch(runner, /browser-pilot@example\.com/);
});

test("form consent preparation handles visible, hidden, and missing banners", async () => {
  const calls = [];
  const visiblePage = {
    $eval: async (selector) => {
      calls.push(["eval", selector]);
      return true;
    },
    click: async (selector) => calls.push(["click", selector]),
    waitForFunction: async (_callback, options) => calls.push(["wait", options]),
  };

  await chooseNecessaryConsentIfVisible(visiblePage);
  assert.deepEqual(calls, [
    ["eval", "[data-cookie-consent]"],
    ["click", '[data-cookie-choice="necessary"]'],
    ["wait", { timeout: 5_000 }],
  ]);

  let hiddenClicks = 0;
  await chooseNecessaryConsentIfVisible({
    $eval: async () => false,
    click: async () => {
      hiddenClicks += 1;
    },
    waitForFunction: async () => {
      hiddenClicks += 1;
    },
  });
  assert.equal(hiddenClicks, 0);

  await chooseNecessaryConsentIfVisible({
    $eval: async () => {
      throw new Error("missing");
    },
    click: async () => assert.fail("missing banner must not click"),
    waitForFunction: async () => assert.fail("missing banner must not wait"),
  });
});

test("form submission preserves field population, response matching, and success state", async () => {
  const calls = [];
  let responsePredicate;
  let evalCount = 0;
  const response = {
    json: async () => ({ ok: true }),
    status: () => 200,
  };
  const page = {
    $eval: async (selector) => {
      calls.push(["eval", selector]);
      evalCount += 1;
      if (evalCount === 1) return { invalid: [], valid: true };
      return { state: "success", text: "Sent" };
    },
    click: async (selector) => calls.push(["click", selector]),
    select: async (selector, value) => calls.push(["select", selector, value]),
    type: async (selector, value) => calls.push(["type", selector, value]),
    waitForFunction: async (_callback, options, selector) =>
      calls.push(["wait-function", options, selector]),
    waitForResponse: (predicate, options) => {
      responsePredicate = predicate;
      calls.push(["wait-response", options]);
      return Promise.resolve(response);
    },
    waitForSelector: async (selector, options) =>
      calls.push(["wait-selector", selector, options]),
  };

  await fillAndSubmit(
    page,
    'form[data-analytics-form="contact"]',
    { email: "person@example.test", name: "Example Person" },
    { topic: "support" },
  );

  assert.equal(
    responsePredicate({
      request: () => ({ method: () => "POST" }),
      url: () => "http://127.0.0.1:3456/api/contact",
    }),
    true,
  );
  assert.equal(
    responsePredicate({
      request: () => ({ method: () => "POST" }),
      url: () => "https://example.test/api/contact",
    }),
    false,
  );
  assert.equal(
    responsePredicate({
      request: () => ({ method: () => "GET" }),
      url: () => "http://127.0.0.1:3456/api/contact",
    }),
    false,
  );
  assert.equal(
    responsePredicate({
      request: () => ({ method: () => "POST" }),
      url: () => "http://127.0.0.1:3456/status",
    }),
    false,
  );

  assert.deepEqual(calls, [
    ["wait-selector", 'form[data-analytics-form="contact"] [name="email"]', { visible: true }],
    ["type", 'form[data-analytics-form="contact"] [name="email"]', "person@example.test"],
    ["wait-selector", 'form[data-analytics-form="contact"] [name="name"]', { visible: true }],
    ["type", 'form[data-analytics-form="contact"] [name="name"]', "Example Person"],
    ["select", 'form[data-analytics-form="contact"] [name="topic"]', "support"],
    ["click", 'form[data-analytics-form="contact"] [name="consent"]'],
    ["eval", 'form[data-analytics-form="contact"]'],
    ["wait-response", { timeout: 15_000 }],
    ["click", 'form[data-analytics-form="contact"] [type="submit"]'],
    ["wait-function", { timeout: 15_000 }, 'form[data-analytics-form="contact"]'],
    ["eval", 'form[data-analytics-form="contact"] [data-form-status]'],
  ]);
});

test("form submission rejects native validity before posting", async () => {
  let submitted = false;
  const page = {
    $eval: async () => ({ invalid: ["email", "message"], valid: false }),
    click: async (selector) => {
      if (selector.includes('type="submit"')) submitted = true;
    },
    select: async () => {},
    type: async () => {},
    waitForResponse: () => {
      submitted = true;
      return Promise.resolve();
    },
    waitForSelector: async () => {},
  };

  await assert.rejects(
    () =>
      fillAndSubmit(page, "form", { email: "invalid" }),
    new Error("Form native validity failed: email,message."),
  );
  assert.equal(submitted, false);
});

test("form submission preserves bounded safe timeout diagnostics", async () => {
  let evalCount = 0;
  const page = {
    $eval: async () => {
      evalCount += 1;
      return { invalid: [], valid: true };
    },
    click: async () => {},
    evaluate: async () => ({
      handlerInstalled: true,
      invalid: [],
      resources: ["/api/contact"],
      statusState: "pending",
      statusText: "Sending",
      submitDisabled: true,
    }),
    select: async () => {},
    type: async () => {},
    waitForResponse: () =>
      new Promise((_, reject) => setImmediate(() => reject(new Error("raw timeout")))),
    waitForSelector: async () => {},
  };

  await assert.rejects(
    () =>
      fillAndSubmit(page, "form", { email: "person@example.test" }, {}, {
        safeFailureMessageImpl: () => "safe timeout",
      }),
    new Error(
      'safe timeout diagnostic={"handlerInstalled":true,"invalid":[],"resources":["/api/contact"],"statusState":"pending","statusText":"Sending","submitDisabled":true}',
    ),
  );
  assert.equal(evalCount, 1);
});

test("form submission preserves API and rendered-state failure diagnostics", async () => {
  let evalCount = 0;
  const page = {
    $eval: async () => {
      evalCount += 1;
      if (evalCount === 1) return { invalid: [], valid: true };
      return { state: "error", text: "Try again" };
    },
    click: async () => {},
    select: async () => {},
    type: async () => {},
    waitForFunction: async () => {},
    waitForResponse: () =>
      Promise.resolve({
        json: async () => ({ code: "upstream_failed" }),
        status: () => 502,
      }),
    waitForSelector: async () => {},
  };

  await assert.rejects(
    () => fillAndSubmit(page, "form", { email: "person@example.test" }),
    new Error(
      "Form API status=502 code=upstream_failed state=error text=Try again",
    ),
  );
});

test("forwarding evidence validation preserves count, security, and metadata rules", () => {
  assert.doesNotThrow(() => validateForwardingRecords(validRecords()));

  assert.throws(
    () => validateForwardingRecords(validRecords().slice(0, 1)),
    new Error("Expected 2 forwarded form records, received 1."),
  );

  const incomplete = validRecords();
  incomplete[0] = { ...incomplete[0], authorizationMatches: false };
  assert.throws(
    () => validateForwardingRecords(incomplete),
    new Error("contact mock forwarding evidence was incomplete."),
  );

  const wrongContact = validRecords();
  wrongContact[0] = { ...wrongContact[0], source: "other" };
  assert.throws(
    () => validateForwardingRecords(wrongContact),
    new Error("Contact forwarding metadata did not match the rendered form."),
  );

  const wrongPilot = validRecords();
  wrongPilot[1] = { ...wrongPilot[1], locale: "en" };
  assert.throws(
    () => validateForwardingRecords(wrongPilot),
    new Error("Pilot forwarding metadata did not match the rendered form."),
  );
});

test("contact and pilot scenarios preserve order, values, results, and cleanup", async () => {
  const calls = [];
  const pages = [
    {
      close: async () => calls.push(["close", "contact"]),
      goto: async (url, options) => calls.push(["goto", "contact", url, options]),
    },
    {
      close: async () => calls.push(["close", "pilot"]),
      goto: async (url, options) => calls.push(["goto", "pilot", url, options]),
    },
  ];
  let pageIndex = 0;

  const results = await runFormScenarios({
    baseUrl: "http://127.0.0.1:3000",
    blockedExternalHosts: new Set(),
    browser: {},
    chooseNecessaryConsentIfVisibleImpl: async (page) =>
      calls.push(["consent", page === pages[0] ? "contact" : "pilot"]),
    fillAndSubmitImpl: async (page, selector, fields, selects) =>
      calls.push([
        "submit",
        page === pages[0] ? "contact" : "pilot",
        selector,
        fields,
        selects,
      ]),
    preparePageImpl: async (_browser, _blocked, viewport) => {
      calls.push(["prepare", viewport]);
      return pages[pageIndex++];
    },
    records: validRecords(),
  });

  assert.deepEqual(results, [
    { key: "contact-form", locale: "en", path: "/en/contact", status: 200 },
    { key: "pilot-form", locale: "tr", path: "/tr/pilot-program", status: 200 },
  ]);
  assert.deepEqual(calls, [
    ["prepare", { height: 900, width: 1440 }],
    ["goto", "contact", "http://127.0.0.1:3000/en/contact?utm_source=ci", { waitUntil: "domcontentloaded" }],
    ["consent", "contact"],
    [
      "submit",
      "contact",
      'form[data-analytics-form="contact"]',
      {
        email: "browser-contact@example.com",
        message: "Synthetic browser message for local mock validation only.",
        name: "Browser Contact Test",
        subject: "Local browser integration",
      },
      undefined,
    ],
    ["close", "contact"],
    ["prepare", { height: 900, width: 1440 }],
    ["goto", "pilot", "http://127.0.0.1:3000/tr/pilot-program?utm_source=ci", { waitUntil: "domcontentloaded" }],
    ["consent", "pilot"],
    [
      "submit",
      "pilot",
      'form[data-analytics-form="pilot_program"]',
      {
        country: "Türkiye",
        email: "browser-pilot@example.com",
        message: "Yalnızca yerel mock doğrulaması için sentetik bina notu.",
        name: "Browser Pilot Test",
        number_of_buildings: "3",
        organization: "Example Test Organization",
        role: "Test Engineer",
      },
      { building_type: "campus", interest_type: "campuses" },
    ],
    ["close", "pilot"],
  ]);
});

test("form scenario failures preserve screenshot keys and page cleanup", async () => {
  const contactCalls = [];
  const contactPage = {
    close: async () => contactCalls.push("close"),
    goto: async () => {},
  };
  await assert.rejects(
    () =>
      runFormScenarios({
        baseUrl: "http://127.0.0.1:3000",
        blockedExternalHosts: new Set(),
        browser: {},
        chooseNecessaryConsentIfVisibleImpl: async () => {},
        fillAndSubmitImpl: async () => {
          throw new Error("contact failed");
        },
        preparePageImpl: async () => contactPage,
        records: validRecords(),
        screenshotFailureImpl: async (_page, key) => contactCalls.push(["shot", key]),
      }),
    new Error("contact failed"),
  );
  assert.deepEqual(contactCalls, [["shot", "contact-form"], "close"]);

  const pilotCalls = [];
  const contactPage2 = {
    close: async () => pilotCalls.push("contact-close"),
    goto: async () => {},
  };
  const pilotPage = {
    close: async () => pilotCalls.push("pilot-close"),
    goto: async () => {},
  };
  let prepareCount = 0;
  let submitCount = 0;
  await assert.rejects(
    () =>
      runFormScenarios({
        baseUrl: "http://127.0.0.1:3000",
        blockedExternalHosts: new Set(),
        browser: {},
        chooseNecessaryConsentIfVisibleImpl: async () => {},
        fillAndSubmitImpl: async () => {
          submitCount += 1;
          if (submitCount === 2) throw new Error("pilot failed");
        },
        preparePageImpl: async () =>
          prepareCount++ === 0 ? contactPage2 : pilotPage,
        records: validRecords(),
        screenshotFailureImpl: async (_page, key) => pilotCalls.push(["shot", key]),
      }),
    new Error("pilot failed"),
  );
  assert.deepEqual(pilotCalls, [
    "contact-close",
    ["shot", "pilot-form"],
    "pilot-close",
  ]);
});
