import type { GuideContent } from "@/lib/guides/types";

export const buildingNaturalFrequencyMonitoringEn: GuideContent = {
  translationKey: "building-natural-frequency-monitoring",
  locale: "en",
  slug: "building-natural-frequency-structural-monitoring",
  title: "Building Natural Frequency Monitoring: What Changes Mean",
  description:
    "Learn what natural frequency means for buildings, how ambient vibration and strong motion reveal it, why frequency varies, and when trend monitoring is useful.",
  eyebrow: "Guides",
  h1: "Building Natural Frequency Monitoring: What Changes Mean",
  summary:
    "Every building has natural frequencies at which it tends to vibrate, determined by its mass, stiffness, and geometry. Monitoring these frequencies over time can reveal changes in dynamic behavior, but the changes can result from damage, environmental conditions, occupancy, amplitude of motion, or analysis choices. A shift in measured frequency is a signal that something may have changed, not a diagnosis of structural health. Interpreting frequency data requires engineering judgment and knowledge of the building's context.",
  keyTakeaways: [
    "Dynamic characteristics can be estimated from measured vibration using ambient or strong-motion data.",
    "Frequency changes can result from damage but also from environment, occupancy, amplitude, and analysis methods.",
    "A change in frequency is a review signal, not a diagnosis; it prompts further investigation rather than confirming safety.",
  ],
  sections: [
    {
      heading: "Direct answer",
      paragraphs: [
        "Natural frequency monitoring measures how a building vibrates at its preferred frequencies. By tracking these frequencies over time, engineers can detect changes in the building's dynamic behavior. Changes may indicate structural modification, damage, or simply a shift in environmental or occupancy conditions.",
      ],
    },
    {
      heading: "What natural frequency means",
      paragraphs: [
        "A building's natural frequency is the rate at which it freely oscillates when disturbed. It depends on the building's mass distribution, structural stiffness, and geometry. Shorter, stiffer buildings tend to have higher natural frequencies than taller, more flexible structures. These frequencies can be estimated from vibration measurements taken during ambient conditions or earthquake events.",
      ],
    },
    {
      heading: "Ambient vibration and strong motion",
      paragraphs: [
        "Ambient vibration monitoring uses everyday forces such as wind, traffic, and mechanical equipment to excite the building. The resulting small-amplitude vibrations can reveal natural frequencies without requiring an earthquake. Strong-motion monitoring captures the building's response during seismic events, which may excite different modes of vibration and provide information about behavior at higher amplitudes.",
      ],
    },
    {
      heading: "Why frequency can vary",
      paragraphs: [
        "Measured natural frequency is not a fixed number. Temperature affects material stiffness. Occupancy changes mass distribution. Stronger motion can engage nonlinear structural behavior that shifts apparent frequency. Analysis methods, window lengths, and signal processing choices also influence the result. These factors mean that frequency variation is expected and does not automatically indicate damage.",
      ],
    },
    {
      heading: "Trend monitoring",
      paragraphs: [
        "Tracking frequency over weeks, months, and years establishes a baseline for the building's normal behavior. A sudden departure from the baseline or a gradual trend may warrant closer inspection. The value of trend monitoring lies in detecting changes that merit professional review, not in providing a pass-or-fail assessment.",
      ],
    },
    {
      heading: "Limitations",
      paragraphs: [
        "Frequency data alone cannot identify the cause of a change. Multiple factors can produce similar shifts. Interpreting frequency trends requires knowing the building's construction, maintenance history, and environmental context. A single frequency measurement or even a series of measurements does not constitute a structural health diagnosis.",
      ],
    },
  ],
  limitations: [
    "Frequency changes can result from many causes, not just structural damage.",
    "Environmental and occupancy conditions influence measured frequency independently of structural state.",
    "Interpreting trends requires detailed knowledge of the building and professional engineering judgment.",
    "Frequency data describes dynamic behavior, not the condition of specific structural elements.",
  ],
  sismosmartFit: [
    "SismoSmart is a pre-launch system designed to record vibration data that can be used to estimate building natural frequencies over time.",
    "This trend-monitoring capability is a design target until pilot validation demonstrates reliable frequency estimation in real building conditions.",
  ],
  references: [
    {
      label: "NIST Measurement of Structural Response Characteristics of Full-Scale Buildings",
      organization: "NIST",
      url: "https://doi.org/10.6028/NIST.IR.4511",
    },
    {
      label: "USGS Ambient Vibration and Earthquake Strong-Motion Data Sets",
      organization: "USGS",
      url: "https://pubs.usgs.gov/of/2004/1375/",
    },
    {
      label: "USGS Monitoring Earthquake Shaking in Buildings to Reduce Loss of Life and Property",
      organization: "USGS",
      url: "https://pubs.usgs.gov/fs/2003/fs068-03/",
    },
  ],
  relatedGuides: [
    "measuring-building-motion-after-earthquake",
    "mems-accelerometers-seismic-monitoring",
    "building-seismic-monitoring-device",
  ],
  relatedGlossaryTerms: ["natural frequency", "ambient vibration", "modal analysis"],
  publishedAt: "2026-07-26",
  updatedAt: "2026-07-26",
  safetyNotice:
    "A change in natural frequency is a signal that warrants professional review. It does not determine whether a building is safe; consult a qualified engineer for structural assessment.",
  cta: {
    label: "Learn about SismoSmart",
    href: "/product",
    description: "See how SismoSmart approaches natural frequency monitoring.",
  },
};
