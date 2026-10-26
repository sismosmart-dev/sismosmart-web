import type { GuideContent, GuideHubCopy } from "@/lib/guides/types";

import { buildingSeismicMonitoringDeviceEn } from "@/lib/guides/content/en/building-seismic-monitoring-device";
import { measuringBuildingMotionAfterEarthquakeEn } from "@/lib/guides/content/en/measuring-building-motion-after-earthquake";
import { earthquakeAppVsFixedSensorEn } from "@/lib/guides/content/en/earthquake-app-vs-fixed-sensor";
import { seismicSensorPlacementEn } from "@/lib/guides/content/en/seismic-sensor-placement";
import { memsAccelerometersSeismicMonitoringEn } from "@/lib/guides/content/en/mems-accelerometers-seismic-monitoring";
import { buildingNaturalFrequencyMonitoringEn } from "@/lib/guides/content/en/building-natural-frequency-monitoring";

export const englishGuides: readonly GuideContent[] = [
  buildingSeismicMonitoringDeviceEn,
  measuringBuildingMotionAfterEarthquakeEn,
  earthquakeAppVsFixedSensorEn,
  seismicSensorPlacementEn,
  memsAccelerometersSeismicMonitoringEn,
  buildingNaturalFrequencyMonitoringEn,
];

export const englishGuideHub: GuideHubCopy = {
  locale: "en",
  title: "Building Seismic Monitoring Guides | SismoSmart",
  description:
    "Practical guides to building seismic monitoring, fixed sensors, MEMS accelerometers, sensor placement, earthquake recordings, and natural frequency.",
  eyebrow: "Guides",
  h1: "Understand building seismic monitoring",
  intro:
    "Clear, evidence-based explanations for residents, building managers, small organizations, and technical readers. These guides explain what monitoring data can show, what it cannot prove, and when qualified engineering review is still required.",
  commercialHeading: "Start with practical questions",
  technicalHeading: "Explore the measurement concepts",
  relatedResourcesHeading: "Related SismoSmart resources",
};
