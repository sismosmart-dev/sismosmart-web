import type { BaseRoutePagesCopy } from "@/lib/page-copy";

export const enPages: BaseRoutePagesCopy = {
  product: {
    meta: {
      title: "Building Seismic Monitoring Device | SismoSmart",
      description:
        "A pre-launch building seismic monitoring device for homes and small buildings, designed to record motion during shaking and support qualified post-event review.",
    },
    eyebrow: "Product",
    title: "A building seismic monitoring device for homes and small buildings",
    description:
      "A wall-mounted, USB-C powered pre-launch device. Sensor choice, connectivity, reporting and performance stay targets until pilot validation is complete.",
    deviceDescription:
      "The pilot enclosure is designed for wall mounting with USB-C power. Final installation hardware and instructions will be confirmed with the validated device.",
    meterTopLabel: "Sensor",
    meterTopValue: "ADXL355-class target",
    meterBottomLabel: "Data",
    meterBottomValue: "Security target",
    imageAlt: "SismoSmart seismic monitoring device, front view",
    specs: [
      { label: "Sensor", value: "ADXL355-class design target" },
      { label: "Connectivity", value: "Wi-Fi + Bluetooth target" },
      { label: "Installation", value: "Pilot setup target" },
      { label: "Status", value: "RGB LED + app target" },
    ],
    useCases: [
      {
        title: "Homes and apartments",
        description: "Candidate pilot settings for fixed building-motion recording; placement is agreed for each building.",
      },
      {
        title: "Campuses and factories",
        description: "Multi-building pilots may evaluate centralized visibility after the device and dashboard path is validated.",
      },
      {
        title: "Workshops and offices",
        description: "Small-building use is part of the pilot hypothesis, not a validated commercial deployment.",
      },
      {
        title: "University partnerships",
        description: "Research access requires explicit agreements, privacy controls and a defined data-sharing purpose.",
      },
    ],
    comparisonTitle: "How it compares",
    comparisonDescription:
      "SismoSmart is being designed as a fixed, building-mounted measurement device between phone-only sensing and professional instrumentation. Sensitivity, reporting and cost comparisons remain validation or commercial assumptions.",
    comparisonRows: [
      {
        label: "Setup",
        sismosmart: "Pilot process",
        traditional: "Professional installation varies",
        mobile: "App setup",
      },
      {
        label: "Fixed device",
        sismosmart: "Design target: building-mounted",
        traditional: "Yes",
        mobile: "No, the phone moves",
      },
      {
        label: "Structural interpretation",
        sismosmart: "Validation pending",
        traditional: "Qualified expert workflow",
        mobile: "Not a building assessment",
      },
      {
        label: "Price",
        sismosmart: "Pre-launch; no public price",
        traditional: "Professional-system pricing",
        mobile: "Often free",
      },
    ],
    ctaLabel: "Apply for pilot",
    ctaHref: "/pilot-program",
  },
  howItWorks: {
    meta: {
      title: "How Building Motion Is Measured | SismoSmart",
      description:
        "See the pre-launch SismoSmart design for measuring building motion, buffering event data and preparing information for pilot validation and qualified review.",
    },
    eyebrow: "How it works",
    title: "How SismoSmart measures building motion and prepares a report",
    description:
      "The current design has three parts: local sensing, a connected data path and an app/report layer. Detection, notification, cloud correlation and report behavior will be validated in pilots.",
    flow: [
      { title: "Mount the device", description: "Pilot placement is selected on a stable indoor surface with the building and measurement objective in mind." },
      { title: "Pair with your phone", description: "Bluetooth and Wi-Fi setup are in the design; the production security flow will be settled after implementation review." },
      { title: "Build a baseline", description: "Pilot calibration is intended to record ordinary vibration and test whether unusual motion can be separated from everyday noise." },
      { title: "Record an event", description: "The design targets local event capture and a later app/report view. Notification timing and report completeness remain validation items." },
    ],
    signals: [
      { title: "Detection on the device", description: "On-device detection is in the design. Thresholds, false positives, missed events and notification reliability need labelled pilot evidence." },
      { title: "Post-event report", description: "A future report may summarize validated measured quantities for qualified review. It is not a safety determination." },
      { title: "Only the necessary data", description: "The live website data flow is documented separately. Future device telemetry, retention and processing are defined before pilot collection begins." },
    ],
    network: [
      { title: "Multi-device correlation", description: "Cross-device confirmation is still a goal. Its timing and effect on false alarms have not been shown with pilot evidence." },
      { title: "Structural evidence over time", description: "Changes in measured vibration characteristics may provide additional evidence to engineers; they are not a diagnosis." },
      { title: "Simple interface", description: "We plan a short device/app status view. Final states and thresholds depend on validated behavior." },
    ],
  },
  about: {
    meta: {
      title: "About SismoSmart",
      description: "The team behind SismoSmart, our perspective after the 2023 earthquakes, and and how we validate the device from pilot to launch. Based in Türkiye, testing in our own homes.",
    },
    eyebrow: "About",
    title: "We live in Türkiye. We want our buildings to be sound.",
    description:
      "We came together after the 2023 Kahramanmaraş earthquakes and recent tremors around Istanbul. We wanted to know how our homes and our city respond to earthquakes. So we built the device.",
    story: [
      "After a major earthquake in Türkiye, building inspections take weeks, sometimes months. During that time, families don't know if they can return home.",
      "We can't remove that wait entirely; in the end an engineer has to walk into the building. But a layer of data can exist before they arrive, one that shows which buildings should be looked at first. That's what we're working on.",
      "Our team has a civil engineering academic advisor, two MSc civil engineering researchers, and a founder on embedded and software. We're all based in Türkiye. We test the device in our own homes.",
    ],
    principles: [
      { title: "Inform without scaring", description: "No disaster marketing. The device creates preparedness, not panic." },
      { title: "Be clear about limits", description: "We'll openly state what we don't do. Not an official warning system. Not a substitute for an engineer's report." },
      { title: "Return data to its owner", description: "Your building's data is yours. Anonymized aggregates may go to academia or government. Personal data isn't for sale." },
    ],
    timeline: [
      { period: "Completed", title: "Product and system foundation", description: "The initial product concept and system architecture are established. Public claims still remain bounded by the evidence register." },
      { period: "Current", title: "Pilot validation", description: "Hardware, detection, notification, connectivity and reporting targets are being validated before broader claims are made." },
      { period: "Next", title: "Evidence and design freeze", description: "Bill of materials, algorithms and operating assumptions are frozen only after bench and field evidence is reviewed." },
      { period: "Later", title: "Certification and manufacturing", description: "Certification, manufacturing and launch follow the evidence gates. No public delivery date is committed." },
    ],
    team: [
      { name: "Founder", role: "Hardware, software, product", bio: "Responsible for embedded systems, IoT, cloud, and the product." },
      { name: "Academic advisor", role: "Earthquake engineering", bio: "PhD in civil engineering. Scientific validation of structural health algorithms." },
      { name: "Civil engineers", role: "Structural health and pilot sites", bio: "Two MSc civil engineering researchers. Lead the building-side algorithms and pilot validation." },
    ],
  },
  contact: {
    meta: {
      title: "Contact SismoSmart",
      description: "Reach the SismoSmart team for product questions, pilot applications, press inquiries, or investor conversations. Email is the fastest channel.",
    },
    eyebrow: "Contact",
    title: "Write, we'll write back.",
    description: "The fastest channel right now is email. A clear subject line reaches the right person.",
    channels: [
      { title: "General", description: "Product questions, pilot applications, purchase interest", value: "info@sismosmart.com", href: "mailto:info@sismosmart.com" },
      { title: "Press", description: "Interviews, press kit, partnership", value: "press@sismosmart.com", href: "mailto:press@sismosmart.com" },
      { title: "LinkedIn", description: "Professional updates and company news", value: "linkedin.com/company/sismosmart", href: "https://www.linkedin.com/company/sismosmart" },
    ],
    form: {
      nameLabel: "Your name",
      emailLabel: "Email",
      subjectLabel: "Subject",
      messageLabel: "Your message",
      buttonLabel: "Send",
      consentLabel: "I agree to have this information processed so you can review and reply to my message.",
      note: "We only use this information to respond to your message.",
      loadingLabel: "Sending...",
      successMessage: "Your message has been sent. We'll respond as soon as possible.",
      errorMessage: "Something went wrong. Please try again shortly.",
      missingEndpointMessage: "The form isn't connected yet. Please email info@sismosmart.com.",
      rateLimitedMessage:
        "Too many attempts. Please try again in a few minutes.",
    },
  },
  privacy: {
    meta: { title: "Privacy", description: "What data we collect, why we use it, who we share it with. Plainly explained." },
    eyebrow: "Privacy",
    title: "Privacy policy",
    description: "We don't collect data we don't need. We use what we collect only for what we said. We don't sell it.",
    sections: [
      { title: "Data we collect", description: "On the live website: your email when you subscribe, contact-form information, and cookie choices. Planned pilot device data may include motion and environmental measurements, device status and approximate location; exact categories are documented before collection begins." },
      { title: "What we use it for", description: "Current website data is used to respond to messages, handle pilot applications and send consented updates. Any future device-data purposes, including connectivity or event analysis, are defined in the pilot agreement before collection." },
      { title: "Who we share it with", description: "Form submissions may pass through the configured form provider. Future device processors, processing locations, transfers and retention are identified before pilot data is collected. We do not sell personal data to third parties for advertising or otherwise." },
      { title: "Your rights", description: "You can access, correct, delete, or export your data. Under KVKK and GDPR, write to info@sismosmart.com." },
    ],
  },
  terms: {
    meta: { title: "Terms of use", description: "Basic terms for using the website and pre-launch information." },
    eyebrow: "Terms",
    title: "Terms of use",
    description: "The site is pre-launch. The terms below apply to this phase.",
    sections: [
      { title: "Informational", description: "This site informs about SismoSmart and accepts pilot applications. It is not an official seismic service or earthquake warning channel." },
      { title: "Not a guarantee", description: "The device is being developed to support post-event preparedness and review. It does not replace official warning systems, emergency instructions, or a structural engineer's report." },
      { title: "Intellectual property", description: "The SismoSmart name, logo, product design, and site content belong to SismoSmart. They may not be reproduced without permission." },
      { title: "Contact", description: "Questions to info@sismosmart.com." },
    ],
  },
  press: {
    meta: { title: "Press kit", description: "Press information, approved visuals, product context, and media contact details for SismoSmart." },
    eyebrow: "Press",
    title: "Press kit",
    description: "One-page resource for media, partner organizations, and interview requests.",
    sections: [
      { title: "Short description", description: "SismoSmart is developing a pre-launch seismic monitoring device for homes and small buildings, designed to record building motion for qualified post-event review. Pilot validation, certification and manufacturing will determine launch timing." },
      { title: "Press contact", description: "For interviews, press images, or demo requests: press@sismosmart.com." },
    ],
    links: [
      { title: "Logo", description: "SVG vector logo", href: "/logo-symbol.svg" },
      { title: "Product image", description: "High-resolution device render", href: "/images/device/sismosmart-device-front.png" },
      { title: "Social media image", description: "1200x630 share card", href: "/images/og/sismosmart-og.png" },
    ],
  },
};
