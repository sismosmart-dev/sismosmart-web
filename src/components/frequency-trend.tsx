/**
 * Natural-frequency trend, the visual counterpart to the "structural health
 * tracking" section on the technology page. It shows the one thing that makes
 * the product's monitoring claim concrete: a building's natural frequency holds
 * roughly steady (with a small seasonal wobble) for months, then steps down and
 * stays down after an event. That permanent drop is the early sign of stiffness
 * loss the copy talks about.
 *
 * It is a schematic, not recorded data, and is generated deterministically (no
 * Date/Math.random) so the markup is stable across server renders.
 */

type FrequencyTrendProps = {
  title: string;
  baselineLabel: string;
  eventLabel: string;
  className?: string;
};

const WIDTH = 720;
const HEIGHT = 240;
const PAD_L = 44;
const PAD_R = 16;
const PAD_T = 18;
const PAD_B = 28;

const MONTHS = 12;
const EVENT_MONTH = 7;

// Frequency band shown on the Y axis, in Hz. A five-storey RC building sits
// around here, matching the FAQ answer.
const F_MIN = 2.8;
const F_MAX = 3.5;
const F_HEALTHY = 3.32;
const F_AFTER = 3.05;

function xAt(month: number): number {
  const inner = WIDTH - PAD_L - PAD_R;
  return PAD_L + (month / MONTHS) * inner;
}

function yAt(freq: number): number {
  const inner = HEIGHT - PAD_T - PAD_B;
  const t = (freq - F_MIN) / (F_MAX - F_MIN);
  return PAD_T + (1 - t) * inner;
}

function freqAt(month: number): number {
  // Seasonal wobble: buildings stiffen slightly in cold months. Small, so it
  // reads as noise around the baseline rather than as a trend.
  const seasonal = Math.sin((month / MONTHS) * Math.PI * 2) * 0.03;
  if (month < EVENT_MONTH) return F_HEALTHY + seasonal;
  // The event drops the frequency and it does not recover.
  const settle = Math.min(1, (month - EVENT_MONTH) / 0.6);
  return F_HEALTHY + seasonal - (F_HEALTHY - F_AFTER) * settle;
}

function buildLine(): string {
  const points: string[] = [];
  for (let i = 0; i <= MONTHS * 4; i += 1) {
    const month = i / 4;
    points.push(`${xAt(month).toFixed(1)},${yAt(freqAt(month)).toFixed(1)}`);
  }
  return points.join(" ");
}

export function FrequencyTrend({
  title,
  baselineLabel,
  eventLabel,
  className,
}: FrequencyTrendProps) {
  const line = buildLine();
  const eventX = xAt(EVENT_MONTH);
  const ticks = [F_MIN, 3.0, 3.2, F_MAX];

  return (
    <svg
      aria-label={title}
      className={className}
      role="img"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    >
      {/* Y grid + Hz ticks */}
      <g>
        {ticks.map((f) => (
          <g key={f}>
            <line
              opacity="0.14"
              stroke="currentColor"
              strokeWidth="1"
              x1={PAD_L}
              x2={WIDTH - PAD_R}
              y1={yAt(f)}
              y2={yAt(f)}
            />
            <text
              fill="currentColor"
              fontSize="12"
              opacity="0.6"
              textAnchor="end"
              x={PAD_L - 8}
              y={yAt(f) + 4}
            >
              {f.toFixed(1)}
            </text>
          </g>
        ))}
      </g>

      {/* Healthy baseline */}
      <line
        opacity="0.5"
        stroke="var(--signal)"
        strokeDasharray="5 6"
        strokeWidth="1.25"
        x1={PAD_L}
        x2={WIDTH - PAD_R}
        y1={yAt(F_HEALTHY)}
        y2={yAt(F_HEALTHY)}
      />
      <text
        fill="var(--signal)"
        fontSize="12"
        fontWeight="600"
        x={PAD_L + 6}
        y={yAt(F_HEALTHY) - 8}
      >
        {baselineLabel}
      </text>

      {/* Event marker */}
      <line
        stroke="var(--amber)"
        strokeWidth="1.5"
        x1={eventX}
        x2={eventX}
        y1={PAD_T}
        y2={HEIGHT - PAD_B}
      />
      <text
        fill="var(--amber)"
        fontSize="12"
        fontWeight="700"
        x={eventX + 6}
        y={PAD_T + 12}
      >
        {eventLabel}
      </text>

      {/* Trend line */}
      <polyline
        fill="none"
        points={line}
        stroke="var(--signal)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.25"
      />
    </svg>
  );
}
