import { preparePage, screenshotFailure } from "./browser-quality-page.mjs";
import { safeFailureMessage } from "./browser-quality-server.mjs";

export async function chooseNecessaryConsentIfVisible(page) {
  const visible = await page.$eval(
    "[data-cookie-consent]",
    (element) => !element.hidden && element.getBoundingClientRect().width > 0,
  ).catch(() => false);
  if (!visible) return;
  await page.click('[data-cookie-choice="necessary"]');
  await page.waitForFunction(
    () => document.querySelector("[data-cookie-consent]")?.hidden === true,
    { timeout: 5_000 },
  );
}

export async function fillAndSubmit(
  page,
  formSelector,
  fields,
  selects = {},
  { safeFailureMessageImpl = safeFailureMessage } = {},
) {
  for (const [name, value] of Object.entries(fields)) {
    const selector = `${formSelector} [name="${name}"]`;
    await page.waitForSelector(selector, { visible: true });
    await page.type(selector, String(value));
  }
  for (const [name, value] of Object.entries(selects)) {
    await page.select(`${formSelector} [name="${name}"]`, value);
  }
  await page.click(`${formSelector} [name="consent"]`);
  const validity = await page.$eval(formSelector, (form) => ({
    invalid: [...form.elements]
      .filter(
        (element) =>
          typeof element.checkValidity === "function" && !element.checkValidity(),
      )
      .map((element) => element.name || element.type || "unnamed"),
    valid: form.checkValidity(),
  }));
  if (!validity.valid) {
    throw new Error(`Form native validity failed: ${validity.invalid.join(",")}.`);
  }
  const responsePromise = page.waitForResponse(
    (response) => {
      const url = new URL(response.url());
      return (
        url.hostname === "127.0.0.1" &&
        url.pathname.startsWith("/api/") &&
        response.request().method() === "POST"
      );
    },
    { timeout: 15_000 },
  );
  await page.click(`${formSelector} [type="submit"]`);
  let apiResponse;
  try {
    apiResponse = await responsePromise;
  } catch (error) {
    const diagnostic = await page.evaluate((selector) => {
      const form = document.querySelector(selector);
      const status = form?.querySelector("[data-form-status]");
      const submit = form?.querySelector("[type='submit']");
      return {
        handlerInstalled: Boolean(window.__sismosmartJsonForms),
        invalid: form
          ? [...form.elements]
              .filter(
                (element) =>
                  typeof element.checkValidity === "function" &&
                  !element.checkValidity(),
              )
              .map((element) => element.name || element.type || "unnamed")
          : ["form-missing"],
        resources: performance
          .getEntriesByType("resource")
          .map((entry) => entry.name)
          .filter((value) => value.includes("/api/"))
          .map((value) => {
            try {
              return new URL(value, window.location.origin).pathname;
            } catch {
              return "/invalid-url";
            }
          }),
        statusState: status?.dataset.state || null,
        statusText: status?.textContent?.trim() || "",
        submitDisabled: Boolean(submit?.disabled),
      };
    }, formSelector);
    throw new Error(
      `${safeFailureMessageImpl(error)} diagnostic=${JSON.stringify(diagnostic)}`,
    );
  }
  const apiPayload = await apiResponse.json().catch(() => ({}));
  await page.waitForFunction(
    (selector) => {
      const state = document.querySelector(`${selector} [data-form-status]`)
        ?.dataset.state;
      return state === "success" || state === "error";
    },
    { timeout: 15_000 },
    formSelector,
  );
  const formStatus = await page.$eval(
    `${formSelector} [data-form-status]`,
    (element) => ({
      state: element.dataset.state || null,
      text: element.textContent?.trim() || "",
    }),
  );
  if (apiResponse.status() !== 200 || formStatus.state !== "success") {
    throw new Error(
      `Form API status=${apiResponse.status()} code=${apiPayload?.code || "unknown"} state=${formStatus.state} text=${formStatus.text}`,
    );
  }
}

export function validateForwardingRecords(records) {
  if (records.length !== 2) {
    throw new Error(
      `Expected 2 forwarded form records, received ${records.length}.`,
    );
  }
  const contactRecord = records.find((record) => record.route === "contact");
  const pilotRecord = records.find((record) => record.route === "waitlist");
  for (const [label, record] of [
    ["contact", contactRecord],
    ["waitlist", pilotRecord],
  ]) {
    if (
      !record?.authorizationMatches ||
      !record?.contentTypeMatches ||
      !record?.formMatches ||
      record.utmSource !== "ci"
    ) {
      throw new Error(`${label} mock forwarding evidence was incomplete.`);
    }
  }
  if (
    contactRecord.locale !== "en" ||
    contactRecord.source !== "contact-page" ||
    contactRecord.pagePath !== "/en/contact"
  ) {
    throw new Error(
      "Contact forwarding metadata did not match the rendered form.",
    );
  }
  if (
    pilotRecord.locale !== "tr" ||
    pilotRecord.source !== "pilot-program" ||
    pilotRecord.pagePath !== "/tr/pilot-program"
  ) {
    throw new Error(
      "Pilot forwarding metadata did not match the rendered form.",
    );
  }
}

export async function runFormScenarios({
  baseUrl,
  blockedExternalHosts,
  browser,
  chooseNecessaryConsentIfVisibleImpl = chooseNecessaryConsentIfVisible,
  fillAndSubmitImpl = fillAndSubmit,
  preparePageImpl = preparePage,
  records,
  screenshotFailureImpl = screenshotFailure,
}) {
  const results = [];

  const contact = await preparePageImpl(browser, blockedExternalHosts, {
    height: 900,
    width: 1440,
  });
  try {
    await contact.goto(`${baseUrl}/en/contact?utm_source=ci`, {
      waitUntil: "domcontentloaded",
    });
    await chooseNecessaryConsentIfVisibleImpl(contact);
    await fillAndSubmitImpl(contact, 'form[data-analytics-form="contact"]', {
      email: "browser-contact@example.com",
      message: "Synthetic browser message for local mock validation only.",
      name: "Browser Contact Test",
      subject: "Local browser integration",
    });
    results.push({
      key: "contact-form",
      locale: "en",
      path: "/en/contact",
      status: 200,
    });
  } catch (error) {
    await screenshotFailureImpl(contact, "contact-form").catch(() => {});
    throw error;
  } finally {
    await contact.close();
  }

  const pilot = await preparePageImpl(browser, blockedExternalHosts, {
    height: 900,
    width: 1440,
  });
  try {
    await pilot.goto(`${baseUrl}/tr/pilot-program?utm_source=ci`, {
      waitUntil: "domcontentloaded",
    });
    await chooseNecessaryConsentIfVisibleImpl(pilot);
    await fillAndSubmitImpl(
      pilot,
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
      {
        building_type: "campus",
        interest_type: "campuses",
      },
    );
    results.push({
      key: "pilot-form",
      locale: "tr",
      path: "/tr/pilot-program",
      status: 200,
    });
  } catch (error) {
    await screenshotFailureImpl(pilot, "pilot-form").catch(() => {});
    throw error;
  } finally {
    await pilot.close();
  }

  validateForwardingRecords(records);
  return results;
}
