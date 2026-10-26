import { getAnalyticsPublicConfig } from "@/lib/analytics-config";
import type { Locale } from "@/lib/site";

const analytics = getAnalyticsPublicConfig();
const hasAnalytics = Boolean(
  analytics.enabled && (analytics.gaId || analytics.gtmId || analytics.clarityId),
);

const labels: Record<
  Locale,
  {
    accept: string;
    description: string;
    necessary: string;
    title: string;
  }
> = {
  tr: {
    title: "Gizlilik tercihleri",
    description:
      "Analitik çerezleri yalnızca deneyimi ölçmek ve siteyi iyileştirmek için, onayınız olursa yükleriz.",
    accept: "Kabul et",
    necessary: "Sadece zorunlu",
  },
  en: {
    title: "Privacy preferences",
    description:
      "We load analytics cookies only with your consent, so we can measure and improve the site experience.",
    accept: "Accept",
    necessary: "Necessary only",
  },
  es: {
    title: "Preferencias de privacidad",
    description:
      "Cargamos analítica solo con su consentimiento para medir y mejorar la experiencia del sitio.",
    accept: "Aceptar",
    necessary: "Solo necesarias",
  },
  it: {
    title: "Preferenze privacy",
    description:
      "Carichiamo gli analytics solo con il tuo consenso per misurare e migliorare l'esperienza del sito.",
    accept: "Accetta",
    necessary: "Solo necessari",
  },
  id: {
    title: "Preferensi privasi",
    description:
      "Kami memuat analitik hanya dengan persetujuan Anda untuk mengukur dan meningkatkan pengalaman situs.",
    accept: "Setuju",
    necessary: "Hanya wajib",
  },
  pt: {
    title: "Preferências de privacidade",
    description:
      "Carregamos analytics apenas com o seu consentimento para medir e melhorar a experiência do site.",
    accept: "Aceitar",
    necessary: "Apenas necessários",
  },
};

function consentScript(config: {
  clarityId: string;
  consentKey: string;
  formSuccessEvent: string;
  gaId: string;
  gtmId: string;
}) {
  return `
(() => {
  const config = ${JSON.stringify(config)};
  const banner = document.querySelector("[data-cookie-consent]");
  if (!banner) return;

  const denied = {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };
  const granted = {
    ad_storage: "granted",
    analytics_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
  };
  const clarityDenied = {
    ad_Storage: "denied",
    analytics_Storage: "denied",
  };
  const clarityGranted = {
    ad_Storage: "granted",
    analytics_Storage: "granted",
  };

  function ensureGtag() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };
  }

  function ensureClarity() {
    if (!config.clarityId) return;
    window.clarity = window.clarity || function clarity(){
      window.clarity.q = window.clarity.q || [];
      window.clarity.q.push(arguments);
    };
  }

  function updateGoogleConsent(choice) {
    if (!config.gaId && !config.gtmId) return;
    ensureGtag();
    window.gtag("consent", "update", choice === "accepted" ? granted : denied);
  }

  function clearClarityCookies() {
    for (const name of ["_clck", "_clsk"]) {
      document.cookie = name + "=; Max-Age=0; Path=/; SameSite=Lax";
      document.cookie =
        name +
        "=; Max-Age=0; Path=/; Domain=." +
        window.location.hostname.replace(/^www\./, "") +
        "; SameSite=Lax";
    }
  }

  function updateClarityConsent(choice) {
    if (!config.clarityId) return;
    ensureClarity();
    window.clarity(
      "consentv2",
      choice === "accepted" ? clarityGranted : clarityDenied,
    );
    if (choice !== "accepted") {
      window.clarity("consent", false);
      clearClarityCookies();
    }
  }

  function loadScript(id, src, beforeFirstScript) {
    if (!src || document.getElementById(id)) return;
    const script = document.createElement("script");
    script.async = true;
    script.id = id;
    script.src = src;
    if (beforeFirstScript) {
      document.getElementsByTagName("script")[0]?.parentNode?.insertBefore(
        script,
        document.getElementsByTagName("script")[0],
      );
    } else {
      document.head.appendChild(script);
    }
  }

  function loadAnalytics() {
    if (config.gtmId) {
      if (document.getElementById("sismosmart-gtm-loader")) return;
      ensureGtag();
      if (config.gaId) {
        window.gtag("js", new Date());
        window.gtag("config", config.gaId, {
          anonymize_ip: true,
          send_page_view: true,
        });
      }
      window.dataLayer.push({ event: "gtm.js", "gtm.start": new Date().getTime() });
      loadScript(
        "sismosmart-gtm-loader",
        "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(config.gtmId),
        true,
      );
      return;
    }

    if (config.gaId) {
      ensureGtag();
      window.gtag("js", new Date());
      window.gtag("config", config.gaId, {
        anonymize_ip: true,
        send_page_view: true,
      });
      loadScript(
        "sismosmart-ga-loader",
        "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(config.gaId),
      );
      return;
    }

    if (config.clarityId) {
      ensureClarity();
      loadScript(
        "sismosmart-clarity",
        "https://www.clarity.ms/tag/" + encodeURIComponent(config.clarityId),
      );
    }
  }

  function applyChoice(choice) {
    updateGoogleConsent(choice);
    updateClarityConsent(choice);
    if (choice === "accepted") loadAnalytics();
  }

  function safeGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, val) {
    try { window.localStorage.setItem(key, val); } catch (e) {}
  }
  function safeRemove(key) {
    try { window.localStorage.removeItem(key); } catch (e) {}
  }

  function track(eventName, parameters) {
    if (!eventName || safeGet(config.consentKey) !== "accepted") {
      return false;
    }
    const eventParameters = {
      ...(parameters || {}),
      transport_type: "beacon",
    };
    if (config.gaId) {
      ensureGtag();
      window.gtag("event", eventName, {
        ...eventParameters,
        send_to: config.gaId,
      });
      return true;
    }
    if (config.gtmId) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: eventName, ...eventParameters });
      return true;
    }
    return false;
  }

  if (config.gaId || config.gtmId) {
    ensureGtag();
    window.gtag("consent", "default", denied);
    window.gtag("set", "ads_data_redaction", true);
  }

  window.__sismosmartAnalytics = {
    eventNames: { formSuccess: config.formSuccessEvent },
    getConsent: () => safeGet(config.consentKey),
    track,
  };

  document.addEventListener("click", (event) => {
    const resetButton = event.target.closest("[data-cookie-reset]");
    if (!resetButton) return;
    safeRemove(config.consentKey);
    banner.hidden = false;
    updateGoogleConsent("necessary");
    updateClarityConsent("necessary");
  });

  const stored = safeGet(config.consentKey);
  if (stored === "accepted" || stored === "necessary") {
    applyChoice(stored);
    return;
  }

  banner.hidden = false;
  banner.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cookie-choice]");
    if (!button) return;
    const choice = button.dataset.cookieChoice;
    if (choice !== "accepted" && choice !== "necessary") return;
    safeSet(config.consentKey, choice);
    applyChoice(choice);
    banner.hidden = true;
  });
})();
`;
}

export function CookieConsent({ locale }: { locale: Locale }) {
  if (!hasAnalytics) {
    return null;
  }

  const copy = labels[locale];

  return (
    <>
      <aside
        aria-label={copy.title}
        className="fixed bottom-4 left-4 z-50 max-w-[22rem] rounded-[1.25rem] border border-border bg-surface p-4 text-fg shadow-[0_18px_45px_rgba(5,23,12,0.18)] sm:left-auto sm:right-4 sm:max-w-md"
        data-cookie-consent=""
        hidden
      >
        <h2 className="font-heading text-lg tracking-normal">{copy.title}</h2>
        <p className="mt-2 text-sm leading-6 text-fg-muted">{copy.description}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-fg-muted hover:border-[var(--primary-600)] hover:text-[var(--primary-600)]"
            data-cookie-choice="necessary"
            type="button"
          >
            {copy.necessary}
          </button>
          <button
            className="rounded-full bg-[var(--primary-600)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-700)]"
            data-cookie-choice="accepted"
            type="button"
          >
            {copy.accept}
          </button>
        </div>
      </aside>
      <script
        id="sismosmart-cookie-consent-script"
        dangerouslySetInnerHTML={{
          __html: consentScript({
            clarityId: analytics.clarityId,
            consentKey: analytics.consentKey,
            formSuccessEvent: analytics.formSuccessEvent,
            gaId: analytics.gaId,
            gtmId: analytics.gtmId,
          }),
        }}
      />
    </>
  );
}
