import type { GuideContent, GuideHubCopy } from "@/lib/guides/types";

import { buildingSeismicMonitoringDeviceTr } from "@/lib/guides/content/tr/building-seismic-monitoring-device";
import { measuringBuildingMotionAfterEarthquakeTr } from "@/lib/guides/content/tr/measuring-building-motion-after-earthquake";
import { earthquakeAppVsFixedSensorTr } from "@/lib/guides/content/tr/earthquake-app-vs-fixed-sensor";
import { seismicSensorPlacementTr } from "@/lib/guides/content/tr/seismic-sensor-placement";
import { memsAccelerometersSeismicMonitoringTr } from "@/lib/guides/content/tr/mems-accelerometers-seismic-monitoring";
import { buildingNaturalFrequencyMonitoringTr } from "@/lib/guides/content/tr/building-natural-frequency-monitoring";

export const turkishGuides: readonly GuideContent[] = [
  buildingSeismicMonitoringDeviceTr,
  measuringBuildingMotionAfterEarthquakeTr,
  earthquakeAppVsFixedSensorTr,
  seismicSensorPlacementTr,
  memsAccelerometersSeismicMonitoringTr,
  buildingNaturalFrequencyMonitoringTr,
];

export const turkishGuideHub: GuideHubCopy = {
  locale: "tr",
  title: "Bina Sismik İzleme Rehberleri | SismoSmart",
  description:
    "Bina deprem sensörleri, sabit sensörler, MEMS ivmeölçerler, sensör yerleşimi, deprem kayıtları ve doğal frekans için uygulamalı rehberler.",
  eyebrow: "Rehberler",
  h1: "Bina sismik izlemeyi anlayın",
  intro:
    "Ev sahipleri, apartman yöneticileri, küçük kurumlar ve teknik okuyucular için açık ve kanıta dayalı anlatımlar. Bu rehberler ölçüm verisinin ne gösterebileceğini, neyi kanıtlayamayacağını ve ne zaman yetkili mühendis değerlendirmesi gerektiğini açıklar.",
  commercialHeading: "Pratik sorularla başlayın",
  technicalHeading: "Ölçüm kavramlarını inceleyin",
  relatedResourcesHeading: "İlgili SismoSmart kaynakları",
};
