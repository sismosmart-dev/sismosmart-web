import type { GuideContent } from "@/lib/guides/types";

export const buildingSeismicMonitoringDeviceEn: GuideContent = {
  translationKey: "building-seismic-monitoring-device",
  locale: "en",
  slug: "building-seismic-monitoring-device",
  title: "Building Seismic Monitoring Device: What It Measures",
  description:
    "Learn what a fixed building seismic monitoring device measures, how it differs from a phone app or alarm, and when installation adds value for residents and managers.",
  eyebrow: "Guides",
  h1: "Building Seismic Monitoring Device: What It Measures",
  summary:
    "A building seismic monitoring device is a fixed accelerometer that records how a specific structure moves during earthquakes and everyday vibration. Unlike a phone that travels with its owner, a permanently mounted sensor provides a stable reference point at the installation location. The recorded data can help residents, building managers, and engineers understand how different parts of a building respond to shaking, but the device itself is a measurement tool rather than a safety certification or an official alert system.",
  keyTakeaways: [
    "Fixed accelerometers record motion at the point where they are mounted, giving engineers a reliable spatial reference.",
    "Building arrays with sensors on multiple floors help compare how motion varies through a structure.",
    "A consumer-grade monitor is not a substitute for a qualified structural engineer or official inspection.",
  ],
  sections: [
    {
      heading: "Direct answer",
      paragraphs: [
        "A building seismic monitoring device permanently measures acceleration, vibration, and time at its installation point. Because it stays in one place, the data it produces describes the behavior of that specific mounting location rather than a general area. This makes fixed sensors useful for understanding a building's response to an earthquake or to ambient forces such as wind and mechanical equipment.",
      ],
    },
    {
      heading: "What the device measures",
      paragraphs: [
        "The sensor inside the device records acceleration in three axes: vertical, and two horizontal directions. It timestamps each reading so engineers can reconstruct a time history of motion during an event. Frequency content, peak acceleration, and duration are extracted from these records to characterize how strongly and how long the building moved.",
      ],
      bullets: [
        "Peak ground or floor acceleration at the mounting point.",
        "Frequency content and dominant vibration modes.",
        "Duration of significant shaking.",
        "Comparison across sensors when an array is installed.",
      ],
    },
    {
      heading: "How fixed monitoring differs from an alarm",
      paragraphs: [
        "An alarm or notification system is designed to alert people when shaking is detected or predicted. A fixed monitoring device focuses on recording what actually happened at a known location so the data can be reviewed afterward. The two serve different purposes: one informs immediate action, while the other supports post-event understanding.",
      ],
    },
    {
      heading: "Where it is useful",
      paragraphs: [
        "Fixed monitoring is useful in multi-story residential buildings, older structures where baselines are unknown, small commercial properties, and locations near seismic activity. Building managers can use the data to decide whether professional inspection is warranted after an event. Residents benefit from transparent, verifiable records of what the building experienced.",
      ],
    },
    {
      heading: "Limitations",
      paragraphs: [
        "A single sensor on one floor does not describe the motion of the entire building. Accelerometers measure motion, not structural damage directly. The data requires interpretation by a qualified professional to draw conclusions about building safety. Weather, soil conditions, and equipment vibration can also influence readings, so context matters when analyzing results.",
      ],
    },
  ],
  limitations: [
    "A single sensor on one floor does not represent the behavior of the entire building.",
    "Motion data describes movement, not structural damage, so it cannot confirm a building is safe.",
    "Interpretation requires professional engineering judgment and knowledge of the building's construction.",
    "Environmental factors such as wind, temperature, and equipment can influence measured vibration.",
  ],
  sismosmartFit: [
    "SismoSmart is a pre-launch product designed to place fixed MEMS accelerometers in buildings. Its current design targets include three-axis recording, time-stamped data, and remote access to readings.",
    "These capabilities are design targets until pilot validation confirms real-world performance in occupied buildings.",
  ],
  references: [
    {
      label: "USGS National Strong Motion Project",
      organization: "USGS",
      url: "https://earthquake.usgs.gov/monitoring/nsmp/",
    },
    {
      label: "USGS Earthquake Monitoring of Structures",
      organization: "USGS",
      url: "https://earthquake.usgs.gov/monitoring/nsmp/buildings/",
    },
    {
      label: "USGS Monitoring Earthquake Shaking in Buildings",
      organization: "USGS",
      url: "https://pubs.usgs.gov/fs/2003/fs068-03/",
    },
  ],
  relatedGuides: [
    "measuring-building-motion-after-earthquake",
    "seismic-sensor-placement",
    "earthquake-app-vs-fixed-sensor",
  ],
  relatedGlossaryTerms: ["accelerometer", "strong motion", "MEMS"],
  publishedAt: "2026-07-26",
  updatedAt: "2026-07-26",
  safetyNotice:
    "A building monitoring device records motion data. It does not certify that a building is safe, and it does not replace review by a qualified engineer after an earthquake.",
  cta: {
    label: "Learn about SismoSmart",
    href: "/product",
    description: "See how SismoSmart approaches fixed building monitoring.",
  },
};
