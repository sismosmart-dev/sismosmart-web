import { JsonFormScript } from "@/components/json-form-script";
import { Button } from "@/components/ui/button";
import {
  ConsentCheckbox,
  Field,
  FormStatus,
  TextArea,
  TextInput,
} from "@/components/ui/field";
import { withBasePath } from "@/lib/base-path";
import type { ContactFormCopy } from "@/lib/page-copy";
import type { Locale } from "@/lib/site";

type ContactFormProps = {
  copy: ContactFormCopy;
  locale: Locale;
};

export function ContactForm({ copy, locale }: ContactFormProps) {
  const endpoint = withBasePath("/api/contact");

  return (
    <>
      <form
        className="space-y-4"
        data-analytics-form="contact"
        data-endpoint={endpoint}
        data-error={copy.errorMessage}
        data-json-form=""
        data-loading={copy.loadingLabel}
        data-missing-endpoint={copy.missingEndpointMessage}
        data-rate-limited={copy.rateLimitedMessage}
        data-success={copy.successMessage}
      >
        <input name="locale" type="hidden" value={locale} />
        <input name="source" type="hidden" value="contact-page" />
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={copy.nameLabel}>
            <TextInput autoComplete="name" name="name" required type="text" />
          </Field>
          <Field label={copy.emailLabel}>
            <TextInput autoComplete="email" name="email" required type="email" />
          </Field>
        </div>

        <Field label={copy.subjectLabel}>
          <TextInput name="subject" required type="text" />
        </Field>

        <Field label={copy.messageLabel}>
          <TextArea name="message" required />
        </Field>

        <ConsentCheckbox label={copy.consentLabel} />

        <FormStatus />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-fg-subtle">{copy.note}</p>
          <Button data-idle-label={copy.buttonLabel} type="submit">
            {copy.buttonLabel}
          </Button>
        </div>
      </form>
      <JsonFormScript />
    </>
  );
}
