import { JsonFormScript } from "@/components/json-form-script";
import { Button } from "@/components/ui/button";
import { ConsentCheckbox, FormStatus, TextInput } from "@/components/ui/field";
import { withBasePath } from "@/lib/base-path";
import type { Locale } from "@/lib/site";

type LaunchInterestFormProps = {
  buttonLabel: string;
  consentLabel: string;
  emailPlaceholder: string;
  inputLabel: string;
  loadingLabel: string;
  locale: Locale;
  errorMessage: string;
  missingEndpointMessage: string;
  rateLimitedMessage: string;
  successMessage: string;
};

export function LaunchInterestForm({
  buttonLabel,
  consentLabel,
  emailPlaceholder,
  inputLabel,
  loadingLabel,
  locale,
  errorMessage,
  missingEndpointMessage,
  rateLimitedMessage,
  successMessage,
}: LaunchInterestFormProps) {
  const endpoint = withBasePath("/api/waitlist");

  return (
    <>
      <form
        className="space-y-4"
        data-analytics-form="waitlist"
        data-endpoint={endpoint}
        data-error={errorMessage}
        data-json-form=""
        data-loading={loadingLabel}
        data-missing-endpoint={missingEndpointMessage}
        data-rate-limited={rateLimitedMessage}
        data-success={successMessage}
      >
        <input name="locale" type="hidden" value={locale} />
        <input name="source" type="hidden" value="homepage-newsletter" />
        <label className="sr-only" aria-hidden="true">
          Website
          <input
            autoComplete="off"
            className="hidden"
            name="website"
            tabIndex={-1}
            type="text"
          />
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="launch-email">
            {inputLabel}
          </label>
          <TextInput
            autoComplete="email"
            className="flex-1"
            id="launch-email"
            name="email"
            placeholder={emailPlaceholder}
            required
            type="email"
          />
          <Button className="sm:min-h-[3.25rem]" data-idle-label={buttonLabel} type="submit">
            {buttonLabel}
          </Button>
        </div>

        <ConsentCheckbox label={consentLabel} />

        <FormStatus />
      </form>
      <JsonFormScript />
    </>
  );
}
