import analyticsConfig from "../../config/analytics.json";

export type AnalyticsPublicConfig = Readonly<{
  enabled: boolean;
  gaId: string;
  gtmId: string;
  clarityId: string;
  consentKey: string;
  formSuccessEvent: string;
}>;

function envOrFallback(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

export function getAnalyticsPublicConfig(): AnalyticsPublicConfig {
  const enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";

  return {
    enabled,
    gaId: enabled
      ? envOrFallback(
          process.env.NEXT_PUBLIC_GA_ID,
          analyticsConfig.public.gaMeasurementId,
        )
      : "",
    gtmId: enabled
      ? envOrFallback(process.env.NEXT_PUBLIC_GTM_ID, analyticsConfig.public.gtmPublicId)
      : "",
    clarityId: enabled
      ? envOrFallback(
          process.env.NEXT_PUBLIC_CLARITY_ID,
          analyticsConfig.public.clarityProjectId,
        )
      : "",
    consentKey: analyticsConfig.consent.storageKey,
    formSuccessEvent: analyticsConfig.events.formSuccess,
  };
}

export { analyticsConfig };
