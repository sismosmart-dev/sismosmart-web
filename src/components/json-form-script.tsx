const scriptId = "sismosmart-json-form-script";

const script = `
(() => {
  if (window.__sismosmartJsonForms) return;
  window.__sismosmartJsonForms = true;

  function setStatus(form, type, message, shouldFocus) {
    const status = form.querySelector("[data-form-status]");
    if (!status) return;
    status.hidden = !message;
    status.textContent = message || "";
    status.dataset.state = type || "";
    if (shouldFocus && message && typeof status.focus === "function") {
      status.focus();
    }
  }

  document.addEventListener("submit", async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches("[data-json-form]")) {
      return;
    }

    event.preventDefault();

    const endpoint = form.dataset.endpoint;
    if (!endpoint) {
      setStatus(form, "error", form.dataset.missingEndpoint || form.dataset.error || "", true);
      return;
    }

    if (!form.reportValidity()) {
      return;
    }

    const submit = form.querySelector("[type='submit']");
    const loadingLabel = form.dataset.loading || submit?.textContent || "";
    const idleLabel = submit?.dataset.idleLabel || submit?.textContent || "";
    if (submit) {
      submit.disabled = true;
      submit.textContent = loadingLabel;
    }
    setStatus(form, "", "");

    const data = Object.fromEntries(new FormData(form).entries());
    if ("consent" in data) data.consent = true;
    if (data.number_of_buildings === "") delete data.number_of_buildings;
    if (data.number_of_buildings) data.number_of_buildings = Number(data.number_of_buildings);

    data.path = window.location.pathname;
    const search = new URLSearchParams(window.location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => {
      const value = search.get(key);
      if (value) data[key] = value;
    });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let responseData = null;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        responseData = await response.json().catch(() => null);
      }

      if (!response.ok) {
        const code = responseData?.code;
        const byCode = {
          FORM_ENDPOINT_MISSING: form.dataset.missingEndpoint,
          RATE_LIMITED: form.dataset.rateLimited,
        };
        const message = byCode[code] || form.dataset.error;
        setStatus(form, "error", message || "", true);
        return;
      }

      form.reset();
      setStatus(form, "success", form.dataset.success || "", true);
      const formType = form.dataset.analyticsForm || "unknown";
      const analytics = window.__sismosmartAnalytics;
      analytics?.track(analytics.eventNames?.formSuccess || "sismosmart_form_success", {
        form_type: formType,
        locale: document.documentElement.lang || "unknown",
        page_path: window.location.pathname,
      });
    } catch {
      setStatus(form, "error", form.dataset.error || "", true);
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = idleLabel;
      }
    }
  });
})();
`;

export function JsonFormScript() {
  return (
    <script
      id={scriptId}
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
