import type { GuideContent } from "@/lib/guides/types";

export const earthquakeAppVsFixedSensorEn: GuideContent = {
  translationKey: "earthquake-app-vs-fixed-sensor",
  locale: "en",
  slug: "earthquake-app-vs-fixed-building-sensor",
  title: "Earthquake App vs Fixed Building Sensor: Key Differences",
  description:
    "Compare earthquake apps and fixed building sensors to understand what each does well, when a fixed reference matters, and how alerts differ from building records.",
  eyebrow: "Guides",
  h1: "Earthquake App vs Fixed Building Sensor: Key Differences",
  summary:
    "Earthquake apps and fixed building sensors both relate to seismic events, but they serve different purposes. Phone apps can participate in dense detection networks and provide notifications, yet they move with the user, vary by device model, and are not fixed to a building. A permanently installed sensor stays at a known location, records motion consistently, and produces data that describes the building's response rather than the phone owner's experience. Understanding the distinction helps residents and managers choose the right tool for each need.",
  keyTakeaways: [
    "Phones can participate in dense detection networks but move with users and vary by device.",
    "A fixed sensor provides a stable location reference for consistent building measurements.",
    "Official alerts and fixed building records address different problems and should not be confused.",
  ],
  sections: [
    {
      heading: "Direct answer",
      paragraphs: [
        "An earthquake app runs on a smartphone and uses the phone's sensors, crowd-sourced data, or server-based detection to provide notifications. A fixed building sensor is a dedicated accelerometer mounted at a specific point in a building. The app is portable and user-oriented; the sensor is stationary and structure-oriented.",
      ],
    },
    {
      heading: "What phone apps do well",
      paragraphs: [
        "Phone-based earthquake applications can deliver fast notifications, contribute data to research networks, and raise awareness. Because millions of phones are distributed across a wide area, they can help detect shaking in locations where traditional instruments are sparse. Their strength lies in reach and accessibility.",
      ],
    },
    {
      heading: "Why a fixed reference matters",
      paragraphs: [
        "A fixed sensor stays at the same coordinates and the same point within a building. This consistency means every recording is directly comparable because the sensor position does not change. When engineers need to analyze building behavior over time or compare events, a stable reference point is essential.",
      ],
    },
    {
      heading: "Alerts versus building records",
      paragraphs: [
        "Alerts inform people that an earthquake is happening or may be approaching. Building records describe what the structure actually experienced. The two are complementary: alerts support immediate protective action, while records support post-event understanding and inspection decisions.",
      ],
    },
    {
      heading: "Choosing the right tool",
      paragraphs: [
        "Phone apps are useful for personal awareness and community participation. Fixed sensors are useful for building-specific measurement, long-term monitoring, and professional analysis. A building manager assessing structural response after an event needs the kind of data a fixed sensor provides, not the approximate information a phone can offer.",
      ],
    },
  ],
  limitations: [
    "Phone sensors are not calibrated for structural monitoring and vary across devices.",
    "A fixed sensor alone does not cover an entire building unless an array is installed.",
    "Neither apps nor individual sensors replace official alerts from recognized agencies.",
    "Data interpretation requires professional judgment regardless of the recording device.",
  ],
  sismosmartFit: [
    "SismoSmart is a pre-launch system that uses fixed MEMS accelerometers to provide building-specific motion records.",
    "This fixed-location approach is a design target until pilot validation demonstrates its performance compared to mobile alternatives in real-world conditions.",
  ],
  references: [
    {
      label: "UC Berkeley MyShake project and research references",
      organization: "UC Berkeley",
      url: "https://myshake.berkeley.edu/about-us",
    },
    {
      label: "USGS Seismographs: Keeping Track of Earthquakes",
      organization: "USGS",
      url: "https://www.usgs.gov/programs/earthquake-hazards/seismographs-keeping-track-earthquakes",
    },
    {
      label: "UC Berkeley Mobile Phones as Seismologic Sensors",
      organization: "UC Berkeley",
      url: "https://doi.org/10.1109/TASE.2013.2245121",
    },
  ],
  relatedGuides: [
    "building-seismic-monitoring-device",
    "seismic-sensor-placement",
    "measuring-building-motion-after-earthquake",
  ],
  relatedGlossaryTerms: ["accelerometer", "seismic network", "strong motion"],
  publishedAt: "2026-07-26",
  updatedAt: "2026-07-26",
  safetyNotice:
    "Neither a phone app nor a fixed sensor determines whether a building is safe. Follow official alerts and consult a qualified engineer for structural assessment.",
  cta: {
    label: "Learn about SismoSmart",
    href: "/product",
    description: "See how SismoSmart approaches fixed building monitoring.",
  },
};
