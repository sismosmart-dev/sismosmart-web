import {
  preparePage,
  screenshotFailure,
} from "./browser-quality-page.mjs";

const CONSENT_KEY = "sismosmart_cookie_consent";

export async function clickVisibleLink(page, href) {
  const clicked = await page.evaluate((targetHref) => {
    const link = [...document.querySelectorAll(`a[href="${targetHref}"]`)].find(
      (candidate) => {
        const rect = candidate.getBoundingClientRect();
        const style = getComputedStyle(candidate);
        return (
          rect.width > 0 && rect.height > 0 && style.visibility !== "hidden"
        );
      },
    );
    if (!link) return false;
    link.click();
    return true;
  }, href);
  if (!clicked)
    throw new Error(`Visible navigation link not found for ${href}.`);
}

export async function runNavigationScenario({
  baseUrl,
  blockedExternalHosts,
  browser,
  clickVisibleLinkImpl = clickVisibleLink,
  preparePageImpl = preparePage,
  screenshotFailureImpl = screenshotFailure,
}) {
  const page = await preparePageImpl(browser, blockedExternalHosts, {
    height: 900,
    width: 1440,
  });
  try {
    await page.goto(`${baseUrl}/en`, { waitUntil: "domcontentloaded" });
    await Promise.all([
      page.waitForFunction(() => window.location.pathname === "/en/product", {
        timeout: 15_000,
      }),
      clickVisibleLinkImpl(page, "/en/product"),
    ]);
    const currentPath = new URL(page.url()).pathname;
    if (currentPath !== "/en/product") {
      throw new Error(`Navigation ended at ${currentPath}.`);
    }
    await page.waitForSelector('[data-locale-switch="tr"]', {
      timeout: 15_000,
    });
    const trHref = await page.$eval('[data-locale-switch="tr"]', (link) =>
      link.getAttribute("href"),
    );
    if (trHref !== "/tr/product") {
      throw new Error(
        `Locale switch did not preserve product path: ${trHref}.`,
      );
    }
    return { key: "navigation", locale: "en", path: currentPath, status: 200 };
  } catch (error) {
    await screenshotFailureImpl(page, "navigation").catch(() => {});
    throw error;
  } finally {
    await page.close();
  }
}

export async function runConsentScenario({
  baseUrl,
  blockedExternalHosts,
  browser,
  preparePageImpl = preparePage,
  screenshotFailureImpl = screenshotFailure,
}) {
  const page = await preparePageImpl(browser, blockedExternalHosts, {
    height: 900,
    width: 1440,
  });
  try {
    await page.goto(`${baseUrl}/en`, { waitUntil: "domcontentloaded" });
    await page.evaluate((key) => localStorage.removeItem(key), CONSENT_KEY);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-cookie-consent]", { visible: true });
    await page.click('[data-cookie-choice="necessary"]');
    const choice = await page.evaluate(
      (key) => localStorage.getItem(key),
      CONSENT_KEY,
    );
    const hiddenAfterChoice = await page.$eval(
      "[data-cookie-consent]",
      (element) => element.hidden,
    );
    if (choice !== "necessary" || !hiddenAfterChoice) {
      throw new Error(
        "Necessary-only consent choice was not persisted and hidden.",
      );
    }
    await page.click("[data-cookie-reset]");
    await page.waitForSelector("[data-cookie-consent]", { visible: true });
    const resetChoice = await page.evaluate(
      (key) => localStorage.getItem(key),
      CONSENT_KEY,
    );
    if (resetChoice !== null)
      throw new Error("Consent reset did not clear storage.");
    return { key: "consent", locale: "en", path: "/en", status: 200 };
  } catch (error) {
    await screenshotFailureImpl(page, "consent").catch(() => {});
    throw error;
  } finally {
    await page.close();
  }
}
