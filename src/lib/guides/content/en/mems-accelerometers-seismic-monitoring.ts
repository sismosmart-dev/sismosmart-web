import type { GuideContent } from "@/lib/guides/types";

export const memsAccelerometersSeismicMonitoringEn: GuideContent = {
  translationKey: "mems-accelerometers-seismic-monitoring",
  locale: "en",
  slug: "mems-accelerometers-seismic-monitoring",
  title: "MEMS Accelerometers for Seismic Monitoring: Key Concepts",
  description:
    "Understand how MEMS accelerometers work in seismic monitoring, including resolution, range, noise, sampling, timing, and what makes low-cost sensing useful data.",
  eyebrow: "Guides",
  h1: "MEMS Accelerometers for Seismic Monitoring: Key Concepts",
  summary:
    "MEMS accelerometers are compact, low-cost sensors that measure acceleration using a microscopic mechanical structure on a silicon chip. They can support seismic and structural monitoring when their range, noise floor, sampling rate, timing accuracy, mounting, and calibration are matched to the measurement objective. Low cost alone does not guarantee engineering-quality data. Understanding the tradeoffs between resolution, dynamic range, and noise helps readers evaluate whether a MEMS-based device is suitable for a given application.",
  keyTakeaways: [
    "MEMS devices can support structural and strong-motion applications when range, noise, sampling, and timing are matched to the objective.",
    "Low cost alone does not guarantee engineering-quality data; the full specification matters.",
    "Resolution, range, noise floor, and calibration must be considered together for useful measurements.",
  ],
  sections: [
    {
      heading: "Direct answer",
      paragraphs: [
        "MEMS accelerometers use a tiny proof mass suspended by silicon springs. When the sensor moves, the proof mass displaces, and the change is measured electrically. This principle produces a voltage or digital signal proportional to acceleration. MEMS technology enables small, affordable sensors that can be deployed in buildings, bridges, and other structures.",
      ],
    },
    {
      heading: "How MEMS acceleration sensing works",
      paragraphs: [
        "Inside the MEMS element, a proof mass is suspended over a silicon substrate with tiny electrodes. Acceleration causes the mass to move relative to the substrate, changing the capacitance between the electrodes. This capacitance change is converted into a calibrated acceleration reading. The three-axis configuration provides measurement in vertical and two horizontal directions simultaneously.",
      ],
    },
    {
      heading: "Resolution, range, and noise",
      paragraphs: [
        "Resolution describes the smallest acceleration change the sensor can detect. Range defines the maximum acceleration it can measure before saturation. The noise floor determines the smallest signal that rises above background electrical noise. For strong-motion applications, the range must accommodate high acceleration levels without clipping. For ambient vibration monitoring, a low noise floor is more important.",
      ],
      bullets: [
        "Range of plus or minus several g is typical for strong-motion monitoring.",
        "Noise floor in the micro-g range supports ambient vibration studies.",
        "Resolution and range must be balanced; increasing one can reduce the other.",
      ],
    },
    {
      heading: "Sampling and timing",
      paragraphs: [
        "MEMS accelerometers sample at rates from tens to hundreds of samples per second. Higher sampling rates capture higher-frequency motion. Timing accuracy matters when combining data from multiple sensors or comparing records with external seismic data. Clock drift and synchronization errors can introduce timing offsets that complicate analysis.",
      ],
    },
    {
      heading: "From low-cost sensing to useful data",
      paragraphs: [
        "A low-cost MEMS sensor can produce useful data when it is properly mounted, calibrated, and paired with reliable timing. The path from raw sensor output to engineering-grade information requires attention to installation quality, data validation, and calibration against known references. Without these steps, even a capable sensor may produce results that are difficult to interpret.",
      ],
    },
    {
      heading: "Limitations",
      paragraphs: [
        "MEMS sensors have limitations compared to dedicated research-grade instruments. They may have higher noise floors, narrower bandwidth, or less precise timing. Environmental factors such as temperature can affect readings. Careful specification selection and installation practices help, but they do not eliminate these inherent differences.",
      ],
    },
  ],
  limitations: [
    "MEMS sensors generally have higher noise floors than research-grade instruments.",
    "Temperature and environmental conditions can affect MEMS sensor output.",
    "Timing accuracy requires careful synchronization, especially in multi-sensor arrays.",
    "Proper calibration and installation are necessary to achieve useful engineering data.",
  ],
  sismosmartFit: [
    "SismoSmart is a pre-launch system designed around three-axis MEMS accelerometers with target specifications for range, noise, and sampling.",
    "These design targets are pending pilot validation to confirm that the selected MEMS components meet real-world monitoring requirements in occupied buildings.",
  ],
  references: [
    {
      label: "USGS Ambient Vibration and Earthquake Strong-Motion Data Sets",
      organization: "USGS",
      url: "https://pubs.usgs.gov/of/2004/1375/",
    },
    {
      label: "NIST Measurement of Structural Response Characteristics of Full-Scale Buildings",
      organization: "NIST",
      url: "https://doi.org/10.6028/NIST.IR.4511",
    },
    {
      label: "USGS ShakeNet portable wireless structural sensor network",
      organization: "USGS",
      url: "https://pubs.usgs.gov/publication/ofr20151134",
    },
  ],
  relatedGuides: [
    "building-seismic-monitoring-device",
    "seismic-sensor-placement",
    "building-natural-frequency-monitoring",
  ],
  relatedGlossaryTerms: ["MEMS", "accelerometer", "noise floor"],
  publishedAt: "2026-07-26",
  updatedAt: "2026-07-26",
  safetyNotice:
    "MEMS accelerometer data does not determine whether a building is safe. Results require interpretation by a qualified engineer.",
  cta: {
    label: "Learn about SismoSmart",
    href: "/product",
    description: "See how SismoSmart approaches MEMS-based monitoring.",
  },
};
