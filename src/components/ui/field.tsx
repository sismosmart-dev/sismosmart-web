import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/**
 * Shared form primitives. The three forms (contact, pilot, newsletter) used to
 * repeat the same control styling with two different focus-ring colours and a
 * status message painted in fixed red/emerald that stayed light in dark mode.
 * These primitives give one control style and a theme-aware status. The focus
 * ring is handled by the global :focus-visible rule, so controls don't carry
 * their own.
 */
const controlClass =
  "min-h-[3.25rem] w-full rounded-md border border-border bg-surface px-4 text-base text-fg outline-none placeholder:text-fg-subtle hover:border-border-strong";

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-2 text-sm font-medium text-fg-muted" htmlFor={htmlFor}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${controlClass} ${className ?? ""}`} {...props} />;
}

export function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={`${controlClass} min-h-40 py-3 ${className ?? ""}`} {...props} />
  );
}

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${controlClass} ${className ?? ""}`} {...props} />;
}

export function ConsentCheckbox({
  label,
  name = "consent",
}: {
  label: string;
  name?: string;
}) {
  return (
    <label className="flex items-start gap-3 text-sm leading-6 text-fg-muted">
      <input
        required
        className="mt-1 h-4 w-4 rounded border-border-strong text-primary-600 accent-[var(--primary-600)]"
        name={name}
        type="checkbox"
        value="true"
      />
      <span>{label}</span>
    </label>
  );
}

/**
 * The aria-live status line. Colours are tinted off the semantic tokens with
 * color-mix so both the error and success states read correctly in light and
 * dark. Toggled by the shared JsonFormScript via data-state.
 */
export function FormStatus() {
  return (
    <p
      aria-live="polite"
      className="rounded-md border px-4 py-3 text-sm font-medium outline-none data-[state=error]:border-danger/40 data-[state=error]:bg-[color-mix(in_srgb,var(--danger)_12%,var(--surface))] data-[state=error]:text-danger data-[state=success]:border-primary-300/60 data-[state=success]:bg-[color-mix(in_srgb,var(--primary-500)_14%,var(--surface))] data-[state=success]:text-primary-700"
      data-form-status=""
      hidden
      tabIndex={-1}
    />
  );
}
