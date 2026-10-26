import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { getPages } from "@/lib/pages";
import type { Locale } from "@/lib/site";

const aboutLabels: Record<
  Locale,
  {
    storyEyebrow: string;
    storyTitle: string;
    storyDescription: string;
    timelineEyebrow: string;
    timelineTitle: string;
    timelineDescription: string;
    teamEyebrow: string;
    teamTitle: string;
    teamDescription: string;
  }
> = {
  tr: {
    storyEyebrow: "Hikaye",
    storyTitle: "Bunu neden yaptık",
    storyDescription:
      "Depremden sonra mühendisin gelmesini beklerken insanların elinde hiçbir bilgi olmuyor. Başlangıç noktamız bu boşluktu.",
    timelineEyebrow: "Yol",
    timelineTitle: "Sırada ne var",
    timelineDescription:
      "Prototipi bitirdikten sonra sırada pilot kurulumlar, saha verisi ve sertifikasyon var.",
    teamEyebrow: "Ekip",
    teamTitle: "Probleme yakın küçük bir ekip",
    teamDescription:
      "Ürünü mühendislik çalışması ve gerçek evlerden gelen geri bildirim şekillendiriyor.",
  },
  en: {
    storyEyebrow: "Story",
    storyTitle: "Why we built this",
    storyDescription:
      "After earthquakes, people need clear information before the engineer arrives.",
    timelineEyebrow: "Path",
    timelineTitle: "What happens next",
    timelineDescription:
      "Prototype, pilots, field data and certification.",
    teamEyebrow: "Team",
    teamTitle: "A small team close to the problem",
    teamDescription:
      "The product is shaped by engineering work and feedback from real homes.",
  },
  es: {
    storyEyebrow: "Historia",
    storyTitle: "Por qué construimos esto",
    storyDescription:
      "Después de un terremoto, la gente necesita información clara antes de que llegue el ingeniero.",
    timelineEyebrow: "Camino",
    timelineTitle: "Qué viene después",
    timelineDescription:
      "Prototipo, pilotos, datos de campo y certificación.",
    teamEyebrow: "Equipo",
    teamTitle: "Un equipo pequeño cerca del problema",
    teamDescription:
      "El producto se forma con trabajo de ingeniería y feedback de hogares reales.",
  },
  it: {
    storyEyebrow: "Storia",
    storyTitle: "Perché lo abbiamo costruito",
    storyDescription:
      "Dopo un terremoto, le persone hanno bisogno di informazioni chiare prima che arrivi l'ingegnere.",
    timelineEyebrow: "Percorso",
    timelineTitle: "Cosa succede dopo",
    timelineDescription:
      "Prototipo, piloti, dati sul campo e certificazione.",
    teamEyebrow: "Team",
    teamTitle: "Un piccolo team vicino al problema",
    teamDescription:
      "Il prodotto prende forma dal lavoro ingegneristico e dai feedback di case reali.",
  },
  id: {
    storyEyebrow: "Cerita",
    storyTitle: "Mengapa kami membangunnya",
    storyDescription:
      "Setelah gempa, orang butuh informasi jelas sebelum engineer datang.",
    timelineEyebrow: "Jalur",
    timelineTitle: "Langkah berikutnya",
    timelineDescription:
      "Prototipe, pilot, data lapangan, dan sertifikasi.",
    teamEyebrow: "Tim",
    teamTitle: "Tim kecil yang dekat dengan masalah",
    teamDescription:
      "Produk dibentuk oleh kerja engineering dan masukan dari rumah nyata.",
  },
  pt: {
    storyEyebrow: "História",
    storyTitle: "Por que construímos isso",
    storyDescription:
      "Depois de terremotos, as pessoas precisam de informação clara antes do engenheiro chegar.",
    timelineEyebrow: "Caminho",
    timelineTitle: "O que vem depois",
    timelineDescription:
      "Protótipo, pilotos, dados de campo e certificação.",
    teamEyebrow: "Time",
    teamTitle: "Um time pequeno perto do problema",
    teamDescription:
      "O produto é moldado por engenharia e feedback de casas reais.",
  },
};

export function AboutPage({ locale }: { locale: Locale }) {
  const labels = aboutLabels[locale];
  const page = getPages(locale).about;

  return (
    <main className="flex flex-1 flex-col gap-8 pb-16 pt-8 sm:gap-10 sm:pt-10" id="content">
      <PageHero
        description={page.description}
        eyebrow={page.eyebrow}
        title={page.title}
      />

      <section className="rounded-xl border border-border bg-surface px-6 py-10 shadow-3 sm:px-8">
        <SectionHeading
          description={labels.storyDescription}
          eyebrow={labels.storyEyebrow}
          title={labels.storyTitle}
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="space-y-5 text-lg leading-8 text-fg-muted">
            {page.story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="grid gap-4">
            {page.principles.map((item) => (
              <article
                key={item.title}
                className="rounded-lg border border-border bg-[var(--surface-2)] px-5 py-5"
              >
                <h3 className="font-heading text-xl tracking-normal text-fg">
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

      <section className="space-y-6">
        <SectionHeading
          description={labels.timelineDescription}
          eyebrow={labels.timelineEyebrow}
          title={labels.timelineTitle}
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {page.timeline.map((item) => (
            <article
              key={`${item.period}-${item.title}`}
              className="rounded-lg border border-border bg-[var(--surface-2)] px-6 py-6 shadow-2"
            >
              <p className="text-sm font-semibold uppercase tracking-normal text-[var(--primary-600)]">
                {item.period}
              </p>
              <h3 className="mt-4 font-heading text-2xl tracking-normal text-fg">
                {item.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-fg-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[rgba(114,174,127,0.2)] bg-primary-950 px-6 py-10 shadow-[var(--shadow-inverse)] sm:px-8">
        <SectionHeading
          description={labels.teamDescription}
          eyebrow={labels.teamEyebrow}
          invert
          title={labels.teamTitle}
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {page.team.map((member) => (
            <article
              key={member.name}
              className="rounded-lg border border-white/10 bg-black/20 px-6 py-6"
            >
              <h3 className="font-heading text-2xl tracking-normal text-white">
                {member.name}
              </h3>
              <p className="mt-2 text-sm font-semibold uppercase tracking-normal text-[var(--signal)]">
                {member.role}
              </p>
              <p className="mt-4 text-base leading-7 text-emerald-50/78">
                {member.bio}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
