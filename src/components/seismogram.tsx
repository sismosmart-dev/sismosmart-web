/**
 * A seismogram drawn from a synthesised event rather than from decorative bars.
 *
 * The trace is not real recorded data and is not presented as such: it is a
 * schematic of the shape the device is built to capture. It carries the two
 * arrivals that matter to the product story, because the gap between them is
 * the entire basis for the "a few seconds, not minutes" claim in the FAQ:
 *
 *   P wave  fast, small amplitude, arrives first
 *   S wave  slower, large amplitude, does the damage
 *
 * Generation is deterministic (fixed seed, no Date/Math.random), so the markup
 * is stable across server renders and diffs cleanly.
 */

type SeismogramProps = {
  /** Samples across the trace. Higher looks smoother and costs more markup. */
  samples?: number;
  /** Labels are passed in so the component stays locale-agnostic. */
  pLabel: string;
  sLabel: string;
  className?: string;
  title: string;
};

const WIDTH = 720;
const HEIGHT = 220;
const MID = HEIGHT / 2;

/** Mulberry32. Deterministic, tiny, good enough for a decorative trace. */
function makeRandom(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Where each phase of the event sits along the trace, as a fraction of width. */
const P_ARRIVAL = 0.28;
const S_ARRIVAL = 0.46;

function amplitudeAt(t: number): number {
  // Ambient noise floor: the building is never perfectly still.
  if (t < P_ARRIVAL) return 0.05;

  // P wave: a small, sharp onset that decays into the pre-S quiet.
  if (t < S_ARRIVAL) {
    const age = (t - P_ARRIVAL) / (S_ARRIVAL - P_ARRIVAL);
    return 0.05 + 0.28 * Math.exp(-3.2 * age);
  }

  // S wave and coda: large arrival, then an exponential ring-down.
  const age = (t - S_ARRIVAL) / (1 - S_ARRIVAL);
  const onset = Math.min(1, age / 0.06);
  return 0.05 + onset * 0.95 * Math.exp(-3.4 * age);
}

function buildTrace(samples: number): string {
  const random = makeRandom(20260711);
  const points: string[] = [];

  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const envelope = amplitudeAt(t);

    // Two oscillators plus noise: enough structure that the trace reads as a
    // signal rather than as a jitter, without pretending to be real physics.
    const carrier =
      Math.sin(t * 96) * 0.6 + Math.sin(t * 231 + 1.4) * 0.3 + (random() - 0.5) * 0.5;

    const y = MID - carrier * envelope * (MID - 12);
    const x = t * WIDTH;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return points.join(" ");
}

export function Seismogram({
  samples = 420,
  pLabel,
  sLabel,
  className,
  title,
}: SeismogramProps) {
  const trace = buildTrace(samples);
  const pX = P_ARRIVAL * WIDTH;
  const sX = S_ARRIVAL * WIDTH;

  return (
    <svg
      aria-label={title}
      className={className}
      preserveAspectRatio="none"
      role="img"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    >
      {/* Graticule. Instrument, not decoration: it gives the trace a scale. */}
      <g stroke="currentColor" strokeWidth="1" opacity="0.12">
        {[0, 1, 2, 3, 4].map((row) => (
          <line
            key={`h-${row}`}
            x1="0"
            x2={WIDTH}
            y1={(HEIGHT / 4) * row}
            y2={(HEIGHT / 4) * row}
          />
        ))}
        {Array.from({ length: 13 }, (_, column) => (
          <line
            key={`v-${column}`}
            x1={(WIDTH / 12) * column}
            x2={(WIDTH / 12) * column}
            y1="0"
            y2={HEIGHT}
          />
        ))}
      </g>

      {/* Zero line */}
      <line
        opacity="0.35"
        stroke="currentColor"
        strokeDasharray="4 6"
        strokeWidth="1"
        x1="0"
        x2={WIDTH}
        y1={MID}
        y2={MID}
      />

      {/* Arrival markers: dashed for early P-arrival, solid for damaging S-arrival for non-color differentiation */}
      {[
        { x: pX, label: pLabel, dashed: true },
        { x: sX, label: sLabel, dashed: false },
      ].map((arrival) => (
        <g key={arrival.label}>
          <line
            stroke="var(--signal)"
            strokeDasharray={arrival.dashed ? "4 4" : undefined}
            strokeWidth="1.5"
            opacity={arrival.dashed ? "0.7" : "0.55"}
            x1={arrival.x}
            x2={arrival.x}
            y1="10"
            y2={HEIGHT - 10}
          />
          <text
            fill="var(--signal)"
            fontSize="13"
            fontWeight="700"
            x={arrival.x + 6}
            y="24"
          >
            {arrival.label}
          </text>
        </g>
      ))}

      <polyline
        fill="none"
        points={trace}
        stroke="var(--signal)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}
