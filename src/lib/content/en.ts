import type { SiteCopy } from "@/lib/site";

export const enCopy: SiteCopy = {
  accessibility: {
    skipToContent: "Skip to content",
  },
  meta: {
    title: "Seismic monitoring for your building",
    description:
      "SismoSmart is a pre-launch building seismic monitor designed to record motion during shaking and give qualified engineers data for post-event review.",
  },
  navigation: {
    eyebrow: "Seismic monitoring for buildings",
    primaryCta: "Pilot application",
    links: [
      { label: "Technology", href: "/technology" },
      { label: "Product", href: "/product" },
      { label: "Pilot", href: "/pilot-program" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  hero: {
    badge: "Early-stage hardware startup",
    title: "We're building a device that measures how your building moves in an earthquake.",
    description:
      "SismoSmart is a wall-mounted device we're developing to measure and record building motion. It is still pre-launch: detection, notification, connectivity and performance will be validated in pilots. The goal is to leave a qualified engineer a useful motion record after shaking.",
    primaryCta: "Apply for pilot",
    secondaryCta: "Investor brief",
    tertiaryCta: "See the technology",
    primaryHref: "/pilot-program",
    secondaryHref: "/investors",
    tertiaryHref: "/technology",
    stats: [
      { label: "Mounting", value: "Wall-fixed" },
      { label: "Detection", value: "On-device" },
      { label: "Sampling target", value: "250 Hz, 3-axis" },
      { label: "Power target", value: "30-60 s supercap" },
    ],
    deviceEyebrow: "The SismoSmart device",
    deviceTitle: "A 100 × 100 mm device that mounts on the wall and runs off a socket",
    deviceDescription:
      "You stick it to the wall, plug it in, pair it from the app and give it your Wi-Fi. After that it runs on its own, measuring the building's vibration without getting in your way. The features below are still at the design stage.",
    deviceSpecs: [
      "Three-axis motion sensing",
      "Local event recording on the device",
      "Encryption of device data",
    ],
    meterTopLabel: "Detection",
    meterTopValue: "Validation pending",
    meterBottomLabel: "Data",
    meterBottomValue: "Encryption planned",
    imageAlt: "SismoSmart seismic monitoring device with status LED",
  },
  trust: {
    eyebrow: "Where we stand",
    title: "There are things this device cannot do.",
    description:
      "SismoSmart is still in its pilot phase. It aims to record what happens inside your building and turn that into data you can look at afterwards. We are not competing with national alerting systems or with the structural inspection that follows an earthquake; both stay where they are. We are trying to fill the gap between them.",
    items: [
      { label: "Stage", value: "Pilot" },
      { label: "Main job", value: "Motion recording" },
      { label: "Structural decision", value: "Stays with the engineer" },
    ],
  },
  howItWorks: {
    eyebrow: "How it works",
    title: "Setup takes a few minutes. The rest runs in the background.",
    description:
      "In pilots we are testing whether the device can learn a building's normal vibration profile and separate unusual motion from everyday noise. False positives and missed events are still possible.",
    steps: [
      {
        title: "Mount it on a wall",
        description:
          "Pick a stable indoor wall. The adhesive strip comes pre-applied, and there are screw holes if you would rather fix it properly.",
      },
      {
        title: "Pair from the app",
        description:
          "The SismoSmart app finds the device over Bluetooth. You enter your Wi-Fi password once, and that's it.",
      },
      {
        title: "It learns the building",
        description:
          "In pilots we are trying to build a baseline from ordinary vibration such as traffic and wind. We won't call the method reliable until it has field evidence.",
      },
      {
        title: "It notifies you when shaking starts",
        description:
          "The design aims to issue a notification after on-device detection. Notification timing and multi-device confirmation will be tested in pilots.",
      },
      {
        title: "It records the event",
        description:
          "In the design, an event is stored on the device and uploaded to the cloud when there is a connection. We won't present this as a working feature until pilots have tested the full path.",
      },
      {
        title: "More than one device",
        description:
          "Several devices may give useful evidence on motion between floors and on matching events. Accuracy and the effect on false alarms still need pilot data.",
      },
    ],
  },
  features: {
    eyebrow: "What it does",
    title: "It quietly does several separate jobs at once.",
    description:
      "The product is being designed around event recording and longer-term building-motion evidence. Notification, structural-health interpretation and other features are not yet validated. They are goals we are working toward, not guaranteed outcomes.",
    items: [
      {
        accent: "01",
        title: "Detects tremors",
        description:
          "The current design targets an ADXL355-class MEMS sensor and 250 Hz three-axis sampling. Bench and pilot evidence are still required for detection and performance claims.",
      },
      {
        accent: "02",
        title: "Notifies your phone",
        description:
          "How notification will behave still has to be validated in pilots. SismoSmart is not an emergency service or an official warning system; follow official alerts and emergency guidance.",
      },
      {
        accent: "03",
        title: "Tracks your building's health",
        description:
          "A change in measured vibration characteristics may give engineers additional evidence over time. It is not a diagnosis and cannot determine whether a building is safe.",
      },
      {
        accent: "04",
        title: "Reports after an earthquake",
        description:
          "The planned post-event report aims to summarize measured motion for qualified review. Its contents and interpretation will be validated in pilots.",
      },
      {
        accent: "05",
        title: "Reads temperature and humidity too",
        description:
          "Environmental sensing is designed to help engineers separate seasonal effects from other changes. It does not by itself identify damage.",
      },
      {
        accent: "06",
        title: "Matching across devices",
        description:
          "Matching events across several devices is a design goal. Its effect on confirmation time and false alarms has not yet been shown in pilot evidence.",
      },
    ],
  },
  demo: {
    eyebrow: "Data flow",
    title: "Measurement starts at the device and ends on your phone.",
    description:
      "In the design, measurement happens on the device and data is sent securely when there is a connection. Device security, reporting and long-term trend views will be validated in pilots.",
    previewLabel: "Building record",
    networkLabel: "Neighborhood mesh",
    sensorLabel: "Device",
    sensorValue: "Active",
    eventLabel: "Last event",
    eventValue: "Recorded, reviewable",
    bullets: [
      "The current design targets an ADXL355-class sensor, 250 Hz three-axis sampling and a documented noise objective; final performance awaits a frozen bill of materials and bench evidence.",
      "You can see your building's vibration data without handing over personal information.",
      "The device makes no decisions; it collects data for the engineer to review.",
    ],
    cta: "See the technology",
    ctaHref: "/technology",
  },
  proof: {
    eyebrow: "Pilot path",
    title: "We want to try this in a handful of real buildings first.",
    description:
      "Before we scale the product we want to see it in the field. Feedback from the first pilots will decide what the finished device looks like. For now we're talking to three groups.",
    cards: [
      {
        title: "Apartments",
        description:
          "Pilot device count, duration, ownership and commercial terms are agreed case by case. This page does not commit to free hardware or a fixed pilot term.",
        highlight: "Pilot terms agreed",
      },
      {
        title: "Campuses and factories",
        description:
          "Facilities with more than one building. One device per building, all of them visible from a single dashboard.",
        highlight: "Enterprise",
      },
      {
        title: "University partnerships",
        description:
          "Research access would require explicit pilot terms, privacy controls and a separate data-sharing agreement. It is not the default data flow.",
        highlight: "Research collaboration",
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    description:
      "If your question isn't here, write to info@sismosmart.com and we'll answer it. The full list is on the FAQ page.",
    items: [
      {
        title: "Will this device warn me before an earthquake?",
        description:
          "No. SismoSmart is not an earthquake early-warning service and does not promise advance warning. Pilot work may evaluate low-latency notifications after on-device detection, but official alerts remain the source for emergency warnings.",
      },
      {
        title: "How is this different from Google's earthquake alerts?",
        description:
          "Google uses the accelerometer in people's phones. It's free, it's already on every handset, and it works well. But what it measures is the source of the earthquake, not your building. We measure your building instead: how it vibrates, how that changes with the season, what state it's in after an earthquake. A phone can't answer those questions.",
      },
      {
        title: "Can a single device tell me my building is safe?",
        description:
          "It can't. An engineer decides whether a building is safe. The device leaves that engineer solid data to work from.",
      },
      {
        title: "Is installation difficult?",
        description:
          "You plug the USB-C cable into a socket, stick the device to the wall with the adhesive on the back, and pair it from the app. No drill or technician is needed, and setup takes a few minutes.",
      },
      {
        title: "What happens during a power or internet outage?",
        description:
          "The current design targets local buffering during network loss and a short supercapacitor bridge during power loss. Exact duration and end-to-end upload behavior will be confirmed through hardware and pilot testing.",
      },
      {
        title: "When does it go on sale?",
        description:
          "There is no firm public sale date. SismoSmart remains pre-launch; pilot evidence, hardware readiness, certification and manufacturing will determine the schedule. Subscribe for confirmed updates.",
      },
    ],
  },
  newsletter: {
    eyebrow: "Get in touch",
    title: "Let's talk before launch.",
    description:
      "If you're a building manager who wants a pilot, an investor, or someone from a partner organization, tell us briefly what you're after. We'll point you to the right person.",
    inputLabel: "Email",
    placeholder: "you@company.com",
    button: "Send",
    consent:
      "I agree to receive emails about SismoSmart launch, pilot, and investor news.",
    note: "We use your email only for this purpose.",
    loading: "Sending...",
    success: "Your message reached us. We'll get back to you shortly.",
    error: "Something went wrong. Please try again.",
    missingEndpoint:
      "Form isn't connected yet. You can email info@sismosmart.com directly.",
    rateLimited:
      "Too many attempts. Please try again in a few minutes.",
  },
  footer: {
    legal: "SismoSmart. All rights reserved.",
  },
};
