import type { ReactNode } from "react";

type StatItem = {
  label: string;
  value: string;
};

/**
 * Readout of a measured or fixed quantity. Rendered as a definition list so the
 * label/value pairing survives without styling, and set in a tabular face so a
 * column of numbers lines up the way it would on an instrument.
 */
export function StatGrid({
  items,
  columns = 4,
  tone = "default",
}: {
  items: StatItem[];
  columns?: 3 | 4;
  tone?: "default" | "inverse";
}) {
  const grid = columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";
  const labelTone = tone === "inverse" ? "text-white/60" : "text-fg-subtle";
  const valueTone = tone === "inverse" ? "text-white" : "text-fg";
  const cardTone =
    tone === "inverse"
      ? "border-white/12 bg-white/5"
      : "border-border bg-surface-2";

  return (
    <dl className={`grid gap-3 ${grid}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-md border px-4 py-3 ${cardTone}`}
        >
          <dt
            className={`text-xs font-semibold uppercase tracking-wide ${labelTone}`}
          >
            {item.label}
          </dt>
          <dd
            className={`mt-1.5 font-heading text-lg tabular-nums ${valueTone}`}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "signal";
}) {
  const tones = {
    default: "border-border-strong bg-surface text-fg-muted",
    // Tinted from the primary token so it stays legible on both light and dark
    // surfaces, rather than a fixed light pill that washes out in dark mode.
    signal:
      "border-primary-300/60 bg-[color-mix(in_srgb,var(--primary-500)_14%,var(--surface))] text-primary-700",
  };

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
