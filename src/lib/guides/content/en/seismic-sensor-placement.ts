import type { GuideContent } from "@/lib/guides/types";

export const seismicSensorPlacementEn: GuideContent = {
  translationKey: "seismic-sensor-placement",
  locale: "en",
  slug: "seismic-sensor-placement-building",
  title: "Seismic Sensor Placement in Buildings: Mounting and Planning",
  description:
    "Learn how to approach seismic sensor placement in buildings, including stable mounting, single-sensor vs array decisions, and a practical pre-installation checklist.",
  eyebrow: "Guides",
  h1: "Seismic Sensor Placement in Buildings: Mounting and Planning",
  summary:
    "Seismic sensor placement in a building starts with the measurement objective. A securely mounted sensor on a stable surface provides a reliable reference point, while sensors on multiple floors reveal how motion varies through the structure. Placement affects data quality: a loose mount introduces noise, and a location near heavy machinery may obscure the signals engineers actually need. There is no universal placement that certifies a building; instead, the goal is to install sensors where they can capture meaningful motion for the questions being asked.",
  keyTakeaways: [
    "Placement follows the measurement objective: define what you need to learn before deciding where to mount.",
    "Secure attachment to a stable building surface is essential for reliable data.",
    "Multiple floors are needed to compare structural response; a single point has limits.",
  ],
  sections: [
    {
      heading: "Direct answer",
      paragraphs: [
        "Seismic sensor placement means choosing where and how to attach accelerometers within a building so the data they record is meaningful. Good placement produces consistent, interpretable results; poor placement introduces noise or misses important behavior. The process starts with defining the question the monitoring is intended to answer.",
      ],
    },
    {
      heading: "Stable mounting",
      paragraphs: [
        "A sensor must be firmly attached to a structural element that moves with the building, not with furniture, partitions, or loose finishes. Concrete, steel, or solid masonry surfaces are preferred. The mounting method should transmit vibration faithfully without introducing resonance or slippage.",
      ],
      bullets: [
        "Attach to structural elements, not non-structural partitions.",
        "Avoid locations near motors, HVAC units, or other vibration sources.",
        "Verify the mount is rigid and will not loosen over time.",
      ],
    },
    {
      heading: "One sensor versus an array",
      paragraphs: [
        "A single sensor at a reference point describes motion at that location. An array of sensors on different floors reveals how motion amplifies or attenuates through the building. Arrays are more informative but require more planning, installation effort, and data management.",
      ],
    },
    {
      heading: "Input and upper-floor motion",
      paragraphs: [
        "Ground-floor sensors capture input motion from the soil. Upper-floor sensors record how the building modifies that input. Comparing the two helps engineers understand the building's dynamic behavior and whether certain floors experience stronger motion than others.",
      ],
    },
    {
      heading: "Practical pre-installation checklist",
      paragraphs: [
        "Before installation, confirm the measurement objective, identify structural mounting points, verify access and power, and plan data storage and retrieval. Document the sensor location, orientation, and mount type so future analysis can account for installation details.",
      ],
    },
    {
      heading: "Limitations",
      paragraphs: [
        "Placement decisions are specific to each building and each objective. No single placement strategy fits every structure. Sensor data reflects the behavior at the mounting point and may not represent other locations without additional sensors.",
      ],
    },
  ],
  limitations: [
    "No universal placement strategy fits every building or every measurement objective.",
    "A sensor records motion at its own location, which may not represent other floors or areas.",
    "Environmental factors and nearby equipment can influence readings at any placement.",
    "Installation details must be documented for accurate analysis, which adds planning effort.",
  ],
  sismosmartFit: [
    "SismoSmart is a pre-launch system designed for fixed installation with clear mounting guidance and multi-floor deployment.",
    "This approach is a design target until pilot validation confirms the system's real-world placement and data quality in occupied buildings.",
  ],
  references: [
    {
      label: "USGS Monitoring Earthquake Shaking in Federal Buildings",
      organization: "USGS",
      url: "https://pubs.usgs.gov/fs/2005/3052/",
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
    "mems-accelerometers-seismic-monitoring",
    "measuring-building-motion-after-earthquake",
  ],
  relatedGlossaryTerms: ["sensor placement", "array", "mounting"],
  publishedAt: "2026-07-26",
  updatedAt: "2026-07-26",
  safetyNotice:
    "Sensor placement does not certify a building as safe. Consult a qualified engineer to determine appropriate monitoring objectives and interpret results.",
  cta: {
    label: "Learn about SismoSmart",
    href: "/product",
    description: "See how SismoSmart approaches sensor placement guidance.",
  },
};
