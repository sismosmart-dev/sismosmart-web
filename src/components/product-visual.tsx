import Image from "next/image";

import { withBasePath } from "@/lib/base-path";

type ProductVisualProps = {
  altText: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  meterTopLabel: string;
  meterTopValue: string;
  meterBottomLabel: string;
  meterBottomValue: string;
  compact?: boolean;
  imageSrc?: string;
  imageHeight?: number;
  imageWidth?: number;
  priority?: boolean;
};

export function ProductVisual({
  altText,
  eyebrow,
  title,
  description,
  bullets,
  meterTopLabel,
  meterTopValue,
  meterBottomLabel,
  meterBottomValue,
  compact = false,
  imageSrc,
  imageHeight,
  imageWidth,
  priority = false,
}: ProductVisualProps) {
  const imageSizes = compact ? "(min-width: 1024px) 32vw, 82vw" : "(min-width: 1024px) 38vw, 82vw";
  const src = imageSrc ??
    withBasePath(
      compact
        ? "/images/device/sismosmart-device-front.webp"
        : "/images/device/sismosmart-device-hero.webp",
    );
  const width = imageWidth ?? (compact ? 1131 : 1036);
  const height = imageHeight ?? (compact ? 1176 : 1195);

  return (
    <aside className={`product-panel mx-0 w-full max-w-[22rem] sm:mx-auto sm:max-w-full ${compact ? "product-panel--compact" : ""}`}>
      {!compact ? (
        <div className="product-panel__header">
          <span className="status-pill">{eyebrow}</span>
          <div className="space-y-3">
            <h2 className="font-heading text-2xl tracking-normal text-white sm:text-3xl">
              {title}
            </h2>
            <p className="text-sm leading-7 text-emerald-50/80 sm:text-base">
              {description}
            </p>
          </div>
        </div>
      ) : null}

      <div className="product-panel__visual">
        <div className="product-panel__halo" />
        {compact && !imageSrc ? (
          // The product page uses pre-generated responsive WebP assets so the
          // LCP image avoids server-side optimization and oversized decoding.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={altText}
            className="product-panel__image"
            decoding="async"
            fetchPriority={priority ? "high" : undefined}
            height={333}
            loading={priority ? "eager" : "lazy"}
            sizes={imageSizes}
            src={withBasePath("/images/device/sismosmart-device-front-320.webp")}
            srcSet={`${withBasePath("/images/device/sismosmart-device-front-320.webp")} 320w, ${withBasePath("/images/device/sismosmart-device-front-640.webp")} 640w`}
            width={320}
          />
        ) : (
          <Image
            alt={altText}
            className="product-panel__image"
            fetchPriority={priority || !compact ? "high" : undefined}
            height={height}
            priority={priority || !compact}
            sizes={imageSizes}
            src={src}
            unoptimized={compact}
            width={width}
          />
        )}
        <div className="product-panel__meter product-panel__meter--top">
          <span>{meterTopLabel}</span>
          <strong>{meterTopValue}</strong>
        </div>
        <div className="product-panel__meter product-panel__meter--bottom">
          <span>{meterBottomLabel}</span>
          <strong>{meterBottomValue}</strong>
        </div>
      </div>

      <div className="grid gap-3">
        {bullets.map((item) => (
          <div key={item} className="signal-card">
            {item}
          </div>
        ))}
      </div>
    </aside>
  );
}
