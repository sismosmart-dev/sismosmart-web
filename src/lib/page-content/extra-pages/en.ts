import { makeExtraPages } from "@/lib/page-content/extra-pages/shared";

export const enExtraPages = makeExtraPages({
  technology: {
    eyebrow: "Technology",
    metaTitle: "MEMS Sensors for Building Motion | SismoSmart",
    metaDescription:
      "Pre-launch technical overview of MEMS sensing, event buffering, and building-motion analysis; detection and performance will be validated in pilots.",
    title: "How MEMS sensors measure building motion",
    description:
      "SismoSmart is a pre-launch measurement system. This page describes the current design targets for sensing, event recording and reporting, and separates those targets from capabilities that still need pilot evidence.",
    sections: [
      ["MEMS accelerometer", "The current design targets an ADXL355-class MEMS sensor, 250 Hz three-axis sampling and a documented noise objective. Final sensor selection and performance claims require a frozen bill of materials and bench evidence."],
      ["STA/LTA detection", "The device compares the average of the last half second against the average of the last thirty seconds. A sudden jump in that ratio flags a possible event. The method is called STA/LTA and it's a seismology standard. Pilot calibration is intended to separate common building noise from shaking, but false positives and missed events remain possible until field validation is complete."],
      ["Local event buffer", "We are designing local event buffering so a pilot device can keep a bounded motion window when connectivity drops. Buffer duration and upload recovery will be validated end to end in pilots."],
      ["Cloud confirmation", "Matching events across devices is still a goal. The trigger window, confirmation rule and any reduction in false alarms must be established with labelled pilot data before they are presented as validated behavior."],
      ["Structural health tracking", "Changes in measured vibration characteristics may provide engineers with additional evidence over time. The method is still under validation and cannot diagnose damage or determine whether a building is safe."],
      ["Engineer-facing report", "The planned report may summarize measured motion using standard engineering quantities. The exact fields, uncertainty bounds and interpretation workflow will be settled through pilot validation and qualified review."],
      ["Connectivity", "The current architecture targets Wi-Fi for the initial device. Cellular or LoRa connectivity belongs to the roadmap and is not presented as a deployed capability."],
      ["Power", "The current hardware design targets USB-C power and a short supercapacitor bridge. Exact hold-up duration and event-upload behavior require bench and pilot validation."],
      ["Certification", "Certification is planned, not completed. CE/RED, BTK, RoHS, WEEE, FCC or other approvals will only be claimed after documentary evidence exists for the relevant model and market."],
    ],
  },
  pilotProgram: {
    eyebrow: "Pilot program",
    metaTitle: "Pilot program application",
    metaDescription:
      "Pilot applications for apartments, campuses, factories and research buildings. Scope, device count, duration and commercial terms are agreed case by case.",
    title: "We want to see the device in your building first.",
    description:
      "The product isn't on broad sale yet. What we want at this stage is a small number of serious sites and people who'll tell us what doesn't work. If you fit one of the four groups below, the form at the bottom is the way in.",
    sections: [
      ["Apartments", "We start with one device in one flat. If the building management joins in, we add devices on other floors. We help with installation and coordinate with the management."],
      ["Campuses and factories", "Several buildings, one central dashboard. Each building keeps its own recording. Before installing, we go through network topology and security requirements with your IT team."],
      ["Municipal pilots", "Neighborhood-scale rollouts that show where the same earthquake was felt more strongly. Personal data stays entirely out of this flow. Only aggregate per-building or per-location data is shared."],
      ["Research partners", "University earthquake engineering departments. Raw data could be opened to academic analysis in return for feedback and the option of a co-authored paper, but only under a confidentiality and data-sharing agreement. That flow does not exist yet."],
      ["What we offer", "Pilot scope is agreed case by case. Device count, duration, ownership, support and any commercial terms are confirmed in the pilot agreement rather than promised on this public page."],
      ["What we ask in return", "You coordinate installation with the building management or staff. We hold a feedback call of about fifteen minutes a month. If an event happens, we ask for a short note. At the end we'd like to publish a brief case study, and we're happy to leave your name out of it."],
      ["From application to install", "Applications are reviewed with the building, access, network, privacy and safety constraints in mind. Timing, agreement length, shipment and installation steps depend on the selected pilot and are confirmed directly."],
    ],
  },
  investors: {
    eyebrow: "Investors",
    metaTitle: "Investors: SismoSmart seed brief",
    metaDescription:
      "A qualitative pre-launch investor overview. Current financing, pricing, roadmap and commercial assumptions are shared directly because they can change.",
    title: "There's a window after an earthquake that nobody measures.",
    description:
      "After a major earthquake in Türkiye, structural inspection takes weeks. During those weeks families guess, businesses pause and insurance seizes up. SismoSmart is a hardware startup trying to close that window using the building's own data.",
    sections: [
      ["Problem", "Large earthquakes can create inspection backlogs. SismoSmart is exploring whether fixed building-motion data can give qualified engineers additional evidence for prioritization; it does not replace inspection or determine safety."],
      ["Why now", "Modern MEMS sensors and connected embedded hardware make lower-cost fixed monitoring more practical than before. Component economics and final hardware performance remain engineering and commercial assumptions until the design is frozen."],
      ["Market", "The initial commercial focus is Türkiye, with later expansion depending on validated demand, certification, manufacturing and local partners. This public page does not publish an unaudited market-size figure as a current fact."],
      ["Product", "Hardware variants, pricing, subscriptions and unit economics remain planning assumptions. Current commercial terms and the latest financial model are shared directly with qualified investors rather than frozen into public copy."],
      ["Team", "The project combines product/software work with civil and earthquake-engineering input. Team composition and advisory relationships can change; current diligence material is shared directly in investor conversations."],
      ["Competition", "The relevant landscape includes official alert systems, phone-based alerts, professional instrumentation and other monitoring products. SismoSmart's hypothesis is fixed building measurement and post-event evidence; differentiation still requires market and pilot validation."],
      ["Roadmap", "The active sequence is pilot validation, hardware and software refinement, evidence review, certification/manufacturing readiness and launch only when those gates are met. No quarter on this page is a delivery commitment."],
      ["Seed round", "Financing amount, runway, allocation and grant or credit assumptions are dated planning inputs. Current fundraising terms are available directly and should not be inferred from an older public figure."],
      ["What we're looking for", "Angels and seed funds who have seen a hardware startup before. Partners with access to Turkish regulation, manufacturing and insurance networks are worth more to us than fast money. We share the detailed technical document and the financial model under a confidentiality agreement."],
    ],
  },
  faq: {
    eyebrow: "FAQ",
    metaTitle: "Frequently asked questions",
    metaDescription:
      "Direct answers about earthquake warning, building safety, data, privacy, installation and launch timing.",
    title: "Frequently asked questions",
    description:
      "Earthquake products are easy to oversell. We try to keep the device's limits visible. If your question isn't answered here, write to info@sismosmart.com.",
    sections: [
      ["Will this device warn me before an earthquake?", "No. SismoSmart is not an earthquake early-warning service and does not promise advance warning. Pilot work may evaluate low-latency notifications after on-device detection; official alerts remain the source for emergency warnings."],
      ["Can a single device tell me my building is safe?", "It can't. An engineer decides whether a building is safe. The device leaves that engineer solid data to work from."],
      ["What data do you collect?", "Vibration readings, temperature, humidity, pressure and the device's own operating status. We don't link personal information to your device and we don't sell your data to anyone. The Privacy page has the details."],
      ["Is my exact location exposed?", "We know your device's location at neighborhood level, because we need it to match an event against nearby devices. Anything more precise is only shared under an explicit pilot agreement."],
      ["Can researchers access my data?", "Only once the data is anonymized and only under a separate agreement with you. That flow doesn't exist yet; it's on the roadmap."],
      ["How is this different from Google's earthquake alerts?", "Google uses the accelerometer in people's phones. It's free, it's already on every handset, and it works well. But what it measures is the source of the earthquake, not your building. We measure your building instead: how it vibrates, how that changes with the season, what state it's in after an earthquake. A phone can't answer those questions."],
      ["What happens when the internet goes down?", "Local buffering during network loss is in the design. Whether a pilot device retains and later uploads an event depends on the validated hardware, firmware and connectivity path."],
      ["What happens during a power cut?", "A short supercapacitor bridge is part of the hardware design. Exact duration and whether an event can be completed or uploaded during an outage require bench and pilot evidence."],
      ["How hard is installation?", "You plug the USB-C cable into a socket, stick the device to the wall with the adhesive on the back, and pair it from the app. No drill or technician is needed, and setup takes a few minutes."],
      ["How many devices should one building have?", "There is no validated universal device count. Pilot placement depends on the building, measurement objective and engineering review; multi-device layouts are evaluated case by case."],
      ["What do PGA, PGV and MMI mean?", "PGA, PGV and Modified Mercalli intensity are standard earthquake-engineering concepts. A future SismoSmart report may use measured or derived quantities only after the calculation method and uncertainty are validated."],
      ["What does natural frequency tell you?", "A building has measurable vibration characteristics, including natural frequencies. Changes may provide engineers with additional evidence, but they are not a diagnosis and do not by themselves establish damage or safety."],
      ["Which way should the device face?", "There's an upward arrow on the back; point it at the ceiling. Try to align the device's X and Y axes with the building's horizontal directions. Mounted 90 degrees off, the data is still usable, though it carries a little less information."],
      ["Does the device record sound?", "No. There's no microphone inside, only an accelerometer that measures ground vibration. Recording speech or ambient sound would take an entirely different sensor."],
      ["Does my data leave Türkiye?", "Pilot data residency is not final. Before device data is collected, each pilot agreement will identify processing locations, transfers, retention and the applicable legal basis."],
      ["When does it go on sale?", "There is no firm public sale date. SismoSmart remains pre-launch; pilot evidence, hardware readiness, certification and manufacturing will determine the schedule."],
    ],
  },
  security: {
    eyebrow: "Security",
    metaTitle: "Security",
    metaDescription:
      "How we handle website security, consent, device data, encrypted transport and privacy during the pilot phase.",
    title: "The data you never collect is the data you can't leak.",
    description:
      "That's our basic rule. The only thing live right now is the website, but we're building the device side on the same rule.",
    sections: [
      ["Minimal data by default", "The live website currently collects only the data described in the Privacy page. Future device telemetry is still a product and policy design area and will be documented before pilot collection begins."],
      ["Consent before analytics", "Web analytics load only after you consent. You can reset that choice at any time from the link in the footer."],
      ["Encrypted transport", "The website currently uses HTTPS and security headers. Device encryption and key lifecycle stay targets until the implemented protocol is reviewed and validated."],
      ["No secrets reach the browser", "Private keys and service tokens never appear in code that ships to the browser. They stay in protected server-side configuration."],
      ["Vulnerability reporting", "If you find a security issue on the site or in pre-launch materials, write to info@sismosmart.com. We're grateful to researchers who disclose responsibly."],
      ["Device security plan", "Signed firmware, encrypted storage, per-device keys and rollback-capable update design are security targets, not deployed claims. They will be published as current capabilities only after implementation and review evidence exists."],
    ],
  },
});
