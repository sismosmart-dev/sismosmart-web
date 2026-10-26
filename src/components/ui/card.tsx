import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  /** Adds the hover lift used by grids of linked or scannable cards. */
  interactive?: boolean;
  as?: "div" | "article" | "li";
  className?: string;
};

export function Card({
  children,
  interactive = false,
  as: Tag = "article",
  className,
}: CardProps) {
  const classes = [
    "rounded-lg border border-border bg-surface p-6 shadow-2",
    interactive
      ? "transition hover:-translate-y-1 hover:border-primary-300 hover:shadow-3"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <Tag className={classes}>{children}</Tag>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-heading text-2xl tracking-normal text-fg">{children}</h3>
  );
}

export function CardBody({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-base leading-7 text-fg-muted">{children}</p>;
}
