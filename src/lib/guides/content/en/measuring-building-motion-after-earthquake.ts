import type { GuideContent } from "@/lib/guides/types";

export const measuringBuildingMotionAfterEarthquakeEn: GuideContent = {
  translationKey: "measuring-building-motion-after-earthquake",
  locale: "en",
  slug: "measuring-building-motion-after-earthquake",
  title: "Measuring Building Motion After an Earthquake",
  description:
    "Understand how post-earthquake building motion is measured, what acceleration and time history data show, and when the results support engineering review.",
  eyebrow: "Guides",
  h1: "Measuring Building Motion After an Earthquake",
  summary:
    "After an earthquake, a fixed sensor or portable accelerometer can measure how a building moved during the event. The resulting record shows acceleration over time at a known location, allowing engineers to identify peak values, frequency content, and duration of shaking. These measurements help prioritize inspection decisions, but they describe the building's response, not its structural condition. A recording alone does not confirm whether a building is safe or damaged, and interpretation depends on the building type, site conditions, and characteristics of the earthquake.",
  keyTakeaways: [
    "Post-event records describe measured motion at a specific location, not the structural condition of the building.",
    "Acceleration and time-history data show peak values, frequency content, and duration of shaking.",
    "Data can support prioritization of professional inspection but cannot replace it.",
  ],
  sections: [
    {
      heading: "Direct answer",
      paragraphs: [
        "Measuring building motion after an earthquake means recording acceleration and displacement at one or more points within the structure. The resulting data creates a picture of how strongly and how long the building moved during the event. Engineers use this information to understand the forces the building experienced and to decide whether further investigation is appropriate.",
      ],
    },
    {
      heading: "Acceleration and time history",
      paragraphs: [
        "An accelerometer samples motion many times each second, producing a time series of acceleration values. From this record, analysts extract peak acceleration, the frequency content of motion, and the duration of significant shaking. These characteristics help describe the severity of the event at the building's location.",
      ],
    },
    {
      heading: "Comparing locations",
      paragraphs: [
        "When sensors are installed on multiple floors, the data reveals how motion varies through the building. Lower floors typically follow ground motion more closely, while upper floors may amplify certain frequencies. Comparing readings across levels helps engineers understand how the structure responded as a system.",
      ],
    },
    {
      heading: "From recording to engineering review",
      paragraphs: [
        "Raw acceleration data is the starting point for analysis, not the conclusion. A qualified structural engineer evaluates the measurements alongside information about the building's design, construction, age, and known defects. The combination of sensor data and engineering judgment produces a more complete picture than either source alone.",
      ],
    },
    {
      heading: "Limitations",
      paragraphs: [
        "Motion records describe what happened during a specific event, not the long-term condition of a building. Environmental factors such as temperature, wind, and equipment vibration can influence readings. A single sensor on one floor does not capture the behavior of the entire structure, and data interpretation requires professional expertise.",
      ],
    },
  ],
  limitations: [
    "Measured motion reflects the specific event and sensor location, not the overall building condition.",
    "Environmental factors such as temperature, wind, and equipment vibration can influence readings.",
    "A single sensor does not capture the full response of a multi-story building.",
    "Interpretation requires professional engineering expertise and knowledge of the building.",
  ],
  sismosmartFit: [
    "SismoSmart is a pre-launch system designed to record three-axis acceleration with time-stamped data at fixed points in a building.",
    "These capabilities are design targets until pilot validation confirms how the system performs during real earthquake events in occupied buildings.",
  ],
  references: [
    {
      label: "USGS Monitoring Earthquake Shaking in Buildings to Reduce Loss of Life and Property",
      organization: "USGS",
      url: "https://pubs.usgs.gov/fs/2003/fs068-03/",
    },
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
  ],
  relatedGuides: [
    "building-seismic-monitoring-device",
    "seismic-sensor-placement",
    "building-natural-frequency-monitoring",
  ],
  relatedGlossaryTerms: ["strong motion", "time history", "accelerometer"],
  publishedAt: "2026-07-26",
  updatedAt: "2026-07-26",
  safetyNotice:
    "Post-earthquake motion data supports but does not replace qualified engineering review. Always follow official guidance and consult a structural engineer when building safety is in question.",
  cta: {
    label: "Learn about SismoSmart",
    href: "/product",
    description: "See how SismoSmart approaches post-event motion recording.",
  },
};
