type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
}: PageHeroProps) {
  return (
    <section className="grid-glow mx-0 min-w-0 max-w-[22rem] overflow-hidden rounded-2xl border border-card-border bg-surface px-6 py-10 shadow-[0_20px_60px_var(--shadow-color)] sm:max-w-none sm:px-10 lg:px-12 lg:py-14">
      <div className={`grid min-w-0 gap-8 ${aside ? "lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)] lg:items-center" : ""}`}>
        <div className="min-w-0 max-w-4xl space-y-5">
          <p className="text-sm font-semibold uppercase tracking-normal text-brand-bright">
            {eyebrow}
          </p>
          <h1 className="max-w-full break-words font-heading text-3xl leading-tight tracking-normal text-foreground sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-text-muted sm:text-xl">
            {description}
          </p>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {aside}
      </div>
    </section>
  );
}
