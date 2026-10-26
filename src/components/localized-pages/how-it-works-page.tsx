import Image from "next/image";

import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { GuideLinks } from "@/components/guides/guide-links";
import { withBasePath } from "@/lib/base-path";
import { getPages } from "@/lib/pages";
import type { Locale } from "@/lib/site";
import type { GuideTranslationKey } from "@/lib/guides/types";

const howItWorksGuideKeys: readonly GuideTranslationKey[] = [
  "measuring-building-motion-after-earthquake",
  "seismic-sensor-placement",
] as const;

const howItWorksLabels: Record<
  Locale,
  {
    flowEyebrow: string;
    flowTitle: string;
    flowDescription: string;
    signalsEyebrow: string;
    signalsTitle: string;
    signalsDescription: string;
    networkEyebrow: string;
    networkTitle: string;
    networkDescription: string;
    guideLinksHeading?: string;
  }
> = {
  tr: {
    flowEyebrow: "Kurulum",
    flowTitle: "Duvardan rapora giden yol",
    flowDescription:
      "Sizin yapmanız gereken kısım birkaç dakika sürüyor, ağır işi bundan sonra cihaz üstleniyor.",
    signalsEyebrow: "Sarsıntı",
    signalsTitle: "Cihaz önce kendi kararını verir, doğrulamayı sonra yapar",
    signalsDescription:
      "Sarsıntı anındaki hızlı tespit kadar, sarsıntı bittikten sonra elde kalan kayıt da değerli.",
    networkEyebrow: "Birlikte kullanım",
    networkTitle: "Cihaz sayısı arttıkça veri güvenilirleşiyor",
    networkDescription:
      "Yakındaki cihazlar aynı olayı görünce kayıt doğrulanmış sayılıyor ve yanlış alarm ihtimali düşüyor.",
    guideLinksHeading: "Sensör yerleşiminden deprem sonrası ölçüme",
  },
  en: {
    flowEyebrow: "Setup",
    flowTitle: "From wall to report",
    flowDescription:
      "The setup is simple. The device does the heavy work after that.",
    signalsEyebrow: "Shaking",
    signalsTitle: "The device acts first, then checks nearby signals",
    signalsDescription:
      "Fast local detection matters. So does the report after the shaking stops.",
    networkEyebrow: "Together",
    networkTitle: "One device is useful. Several are better.",
    networkDescription:
      "Nearby devices help confirm the same event and reduce false alarms.",
    guideLinksHeading: "From sensor placement to post-earthquake measurement",
  },
  es: {
    flowEyebrow: "Instalación",
    flowTitle: "De la pared al informe",
    flowDescription:
      "La instalación es simple. Después, el dispositivo hace el trabajo pesado.",
    signalsEyebrow: "Temblor",
    signalsTitle: "El dispositivo actúa primero y luego revisa señales cercanas",
    signalsDescription:
      "La detección local rápida importa. También el informe después del temblor.",
    networkEyebrow: "Juntos",
    networkTitle: "Un dispositivo ayuda. Varios ayudan más.",
    networkDescription:
      "Los dispositivos cercanos confirman el mismo evento y reducen falsas alarmas.",
  },
  it: {
    flowEyebrow: "Installazione",
    flowTitle: "Dalla parete al report",
    flowDescription:
      "L'installazione è semplice. Dopo, il dispositivo fa il lavoro pesante.",
    signalsEyebrow: "Scossa",
    signalsTitle: "Il dispositivo agisce prima, poi controlla i segnali vicini",
    signalsDescription:
      "Il rilevamento locale rapido conta. Conta anche il report dopo la scossa.",
    networkEyebrow: "Insieme",
    networkTitle: "Un dispositivo è utile. Più dispositivi sono meglio.",
    networkDescription:
      "I dispositivi vicini confermano lo stesso evento e riducono i falsi allarmi.",
  },
  id: {
    flowEyebrow: "Pemasangan",
    flowTitle: "Dari dinding ke laporan",
    flowDescription:
      "Pemasangannya sederhana. Setelah itu perangkat yang bekerja keras.",
    signalsEyebrow: "Guncangan",
    signalsTitle: "Perangkat bertindak dulu, lalu memeriksa sinyal sekitar",
    signalsDescription:
      "Deteksi lokal yang cepat penting. Laporan setelah guncangan berhenti juga penting.",
    networkEyebrow: "Bersama",
    networkTitle: "Satu perangkat berguna. Beberapa lebih baik.",
    networkDescription:
      "Perangkat sekitar membantu mengonfirmasi kejadian yang sama dan mengurangi alarm salah.",
  },
  pt: {
    flowEyebrow: "Instalação",
    flowTitle: "Da parede ao relatório",
    flowDescription:
      "A instalação é simples. Depois disso, o dispositivo faz o trabalho pesado.",
    signalsEyebrow: "Tremor",
    signalsTitle: "O dispositivo age primeiro e depois confere sinais próximos",
    signalsDescription:
      "Detecção local rápida importa. O relatório depois do tremor também.",
    networkEyebrow: "Juntos",
    networkTitle: "Um dispositivo é útil. Vários são melhores.",
    networkDescription:
      "Dispositivos próximos confirmam o mesmo evento e reduzem falsos alarmes.",
  },
};

export function HowItWorksPage({ locale }: { locale: Locale }) {
  const labels = howItWorksLabels[locale];
  const page = getPages(locale).howItWorks;

  return (
    <main className="flex flex-1 flex-col gap-8 pb-16 pt-8 sm:gap-10 sm:pt-10" id="content">
      <PageHero
        description={page.description}
        eyebrow={page.eyebrow}
        title={page.title}
      />

      <section className="space-y-6">
        <SectionHeading
          description={labels.flowDescription}
          eyebrow={labels.flowEyebrow}
          title={labels.flowTitle}
        />
        <div className="grid gap-5 lg:grid-cols-4">
          {page.flow.map((step, index) => (
            <article
              key={step.title}
              className="rounded-lg border border-border bg-surface px-6 py-6 shadow-[0_16px_32px_rgba(5,23,12,0.06)]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 font-heading text-sm text-fg-on-primary">
                0{index + 1}
              </span>
              <h3 className="mt-4 font-heading text-2xl tracking-normal text-fg">
                {step.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-fg-muted">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[rgba(114,174,127,0.2)] bg-primary-950 px-6 py-10 shadow-[var(--shadow-inverse)] sm:px-8">
        <SectionHeading
          description={labels.signalsDescription}
          eyebrow={labels.signalsEyebrow}
          invert
          title={labels.signalsTitle}
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {page.signals.map((item) => (
            <article
              key={item.title}
              className="rounded-lg border border-white/10 bg-black/20 px-6 py-6"
            >
              <h3 className="font-heading text-2xl tracking-normal text-white">
                {item.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-emerald-50/78">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(340px,0.92fr)_minmax(0,1.08fr)]">
        <div className="relative overflow-hidden rounded-xl border border-[rgba(114,174,127,0.2)] bg-primary-950 p-6 shadow-[var(--shadow-inverse)]">
          <Image
            alt={page.title}
            className="h-auto w-full object-contain"
            height={1424}
            sizes="(min-width: 1024px) 38vw, 100vw"
            src={withBasePath("/images/device/sismosmart-device-installation.webp")}
            width={1228}
          />
        </div>
        <div className="rounded-xl border border-border bg-surface px-6 py-8 shadow-3 sm:px-8">
          <SectionHeading
            description={labels.networkDescription}
            eyebrow={labels.networkEyebrow}
            title={labels.networkTitle}
          />
          <div className="mt-6 grid gap-4">
            {page.network.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-border bg-surface-2 p-5"
              >
                <h3 className="font-heading text-xl text-fg">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-fg-muted">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {labels.guideLinksHeading ? (
        <GuideLinks
          heading={labels.guideLinksHeading}
          locale={locale}
          translationKeys={howItWorksGuideKeys}
        />
      ) : null}

    </main>
  );
}
