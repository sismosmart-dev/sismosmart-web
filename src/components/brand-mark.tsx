import { useId } from "react";

type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className = "h-12 w-12" }: BrandMarkProps) {
  const idPrefix = `brand-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const surfaceId = `${idPrefix}-surface`;
  const waveId = `${idPrefix}-wave`;

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        fill={`url(#${surfaceId})`}
        height="56"
        rx="20"
        stroke="#79DC83"
        strokeOpacity="0.28"
        strokeWidth="1.5"
        width="56"
        x="4"
        y="4"
      />
      <path
        d="M14 35.5H22L27 25L33 42L38 31L42 35.5H50"
        stroke={`url(#${waveId})`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
      />
      <circle cx="32" cy="18" fill="#79DC83" r="3.5" />
      <defs>
        <linearGradient id={surfaceId} x1="10" x2="55" y1="8" y2="58">
          <stop stopColor="#102517" />
          <stop offset="1" stopColor="#09140D" />
        </linearGradient>
        <linearGradient id={waveId} x1="14" x2="50" y1="25" y2="38">
          <stop stopColor="#79DC83" />
          <stop offset="1" stopColor="#2E7D32" />
        </linearGradient>
      </defs>
    </svg>
  );
}
