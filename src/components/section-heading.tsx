type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  invert?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  invert = false,
}: SectionHeadingProps) {
  return (
    <div className="max-w-3xl space-y-4">
      <p
        className={`text-sm font-semibold uppercase tracking-normal ${
          invert ? "text-brand-bright" : "text-[var(--primary-600)]"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`font-heading text-3xl tracking-normal sm:text-4xl ${
          invert ? "text-white" : "text-fg"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`text-lg leading-8 ${
            invert ? "text-emerald-50/80" : "text-fg-muted"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
