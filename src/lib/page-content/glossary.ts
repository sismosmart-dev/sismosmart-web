import type { InfoPageCopy } from "@/lib/page-copy";
import type { Locale } from "@/lib/site";

export const glossaryPagesByLocale: Record<Locale, InfoPageCopy> = {
  en: {
    meta: {
      title: "Seismic monitoring glossary | SismoSmart",
      description:
        "Plain-language definitions for the seismic monitoring and building-motion terms used throughout the SismoSmart website.",
    },
    eyebrow: "Terminology",
    title: "Seismic monitoring glossary",
    description:
      "Definitions for the main sensing, earthquake and engineering terms used on this site.",
    sections: [
      {
        title: "Acceleration",
        description:
          "The rate at which motion changes. A seismic sensor measures acceleration over time so the shape and intensity of building movement can be recorded.",
      },
      {
        title: "Accelerometer",
        description:
          "A sensor that measures acceleration. In a seismic device it records how a surface speeds up and slows down along one or more axes.",
      },
      {
        title: "Ambient vibration",
        description:
          "Small, continuous vibration caused by wind, traffic and machinery. It can reveal a building's natural frequencies without an earthquake.",
      },
      {
        title: "Array",
        description:
          "A group of sensors installed at several points, for example on different floors, so their records can be compared.",
      },
      {
        title: "Building motion",
        description:
          "The movement of a building during vibration or an earthquake. It is not the same as a structural safety assessment.",
      },
      {
        title: "Event recording",
        description:
          "A time-stamped series of sensor measurements captured around a detected shaking event for later technical review.",
      },
      {
        title: "MEMS",
        description:
          "Micro-electro-mechanical system: a microscopic mechanical structure on a silicon chip. MEMS accelerometers are small, low-cost sensors that measure acceleration.",
      },
      {
        title: "Modal analysis",
        description:
          "A way to describe a structure's vibration as separate modes, each with its own frequency and shape. Engineers use it to interpret how a building moves.",
      },
      {
        title: "Mounting",
        description:
          "How a sensor is attached to a structure. A loose or flexible mount can add noise or its own resonance to the measurement.",
      },
      {
        title: "Natural frequency",
        description:
          "A frequency at which a structure tends to vibrate when disturbed. It depends on mass, stiffness and geometry, and it can shift with temperature, occupancy and the amplitude of shaking.",
      },
      {
        title: "Noise floor",
        description:
          "The smallest signal a sensor can tell apart from its own background electrical noise.",
      },
      {
        title: "P wave",
        description:
          "The primary seismic wave. It normally travels faster than other earthquake waves and may arrive first at a sensor.",
      },
      {
        title: "S wave",
        description:
          "The secondary seismic wave. It normally arrives after the P wave and moves material perpendicular to its direction of travel.",
      },
      {
        title: "Seismic monitoring",
        description:
          "The continuous or event-based measurement of ground or building motion. Monitoring supports observation; it does not certify that a building is safe.",
      },
      {
        title: "Seismic network",
        description:
          "A set of instruments, or phones, spread over an area to detect and record shaking.",
      },
      {
        title: "Sensor",
        description:
          "The measurement component that converts physical building movement into digital data.",
      },
      {
        title: "Sensor placement",
        description:
          "The choice of where and how sensors are installed in a building. It affects data quality and what the data can show.",
      },
      {
        title: "Strong motion",
        description:
          "Shaking strong enough, as in an earthquake, that it is recorded by instruments built not to saturate at high acceleration.",
      },
      {
        title: "Structural engineer",
        description:
          "A qualified engineer who evaluates how structures behave and can interpret measurements together with inspections, plans and other evidence.",
      },
      {
        title: "Time history",
        description:
          "A record of a measured quantity, such as acceleration, over time. Also called a time series.",
      },
    ],
  },
  tr: {
    meta: {
      title: "Sismik izleme sözlüğü | SismoSmart",
      description:
        "SismoSmart sitesinde kullanılan sismik izleme ve bina hareketi terimlerinin sade Türkçe açıklamaları.",
    },
    eyebrow: "Terminoloji",
    title: "Sismik izleme sözlüğü",
    description:
      "Bu sitede kullanılan temel algılama, deprem ve mühendislik terimlerinin açıklamaları.",
    sections: [
      {
        title: "Bina hareketi",
        description:
          "Titreşim veya deprem sırasında binanın hareketidir. Yapısal güvenlik değerlendirmesi ile aynı şey değildir.",
      },
      {
        title: "Çevresel titreşim",
        description:
          "Rüzgâr, trafik ve makinelerin yol açtığı küçük ve sürekli titreşim. Deprem olmadan da binanın doğal frekanslarını ortaya çıkarabilir.",
      },
      {
        title: "Dizi",
        description:
          "Birkaç noktaya, örneğin farklı katlara yerleştirilen sensör grubu. Kayıtların birbiriyle karşılaştırılmasını sağlar.",
      },
      {
        title: "Doğal frekans",
        description:
          "Bir yapının bozulduğunda titreşmeye eğilimli olduğu frekans. Kütleye, rijitliğe ve geometriye bağlıdır; sıcaklık, kullanım yükü ve sarsıntının genliğiyle kayabilir.",
      },
      {
        title: "Güçlü hareket",
        description:
          "Deprem gibi, yüksek ivmede doygunluğa ulaşmayacak şekilde yapılmış cihazlarla kaydedilen şiddetli sarsıntı.",
      },
      {
        title: "Gürültü zemin değeri",
        description:
          "Bir sensörün kendi arka plan elektriksel gürültüsünden ayırt edebildiği en küçük sinyal.",
      },
      {
        title: "İnşaat mühendisi",
        description:
          "Yapıların davranışını değerlendiren ve ölçümleri inceleme, proje ve diğer kanıtlarla birlikte yorumlayabilen yetkin mühendistir.",
      },
      {
        title: "İvme",
        description:
          "Hızın zamanla değişim oranıdır. Sismik sensör, bina hareketinin biçimini ve şiddetini kaydetmek için zaman içinde ivmeyi ölçer.",
      },
      {
        title: "İvmeölçer",
        description:
          "İvmeyi ölçen sensör. Sismik bir cihazda, bir yüzeyin bir ya da birkaç eksende nasıl hızlanıp yavaşladığını kaydeder.",
      },
      {
        title: "MEMS",
        description:
          "Mikro-elektro-mekanik sistem: silikon çip üzerindeki mikroskobik bir mekanik yapı. MEMS ivmeölçerler ivmeyi ölçen küçük ve düşük maliyetli sensörlerdir.",
      },
      {
        title: "Modal analiz",
        description:
          "Bir yapının titreşimini, her birinin kendi frekansı ve biçimi olan ayrı modlara bölerek anlatma yöntemi. Mühendisler binanın nasıl hareket ettiğini yorumlamak için kullanır.",
      },
      {
        title: "Montaj",
        description:
          "Sensörün yapıya nasıl tutturulduğu. Gevşek ya da esnek bir montaj, ölçüme gürültü veya kendi rezonansını katabilir.",
      },
      {
        title: "Olay kaydı",
        description:
          "Algılanan bir sarsıntının çevresinde, daha sonra teknik inceleme yapılabilmesi için kaydedilen zaman damgalı sensör ölçümleri dizisidir.",
      },
      {
        title: "P dalgası",
        description:
          "Birincil sismik dalgadır. Genellikle diğer deprem dalgalarından daha hızlı ilerler ve sensöre ilk ulaşabilir.",
      },
      {
        title: "S dalgası",
        description:
          "İkincil sismik dalgadır. Genellikle P dalgasından sonra ulaşır ve malzemeyi ilerleme yönüne dik hareket ettirir.",
      },
      {
        title: "Sensör",
        description:
          "Fiziksel bina hareketini sayısal veriye dönüştüren ölçüm bileşenidir.",
      },
      {
        title: "Sensör yerleşimi",
        description:
          "Sensörlerin binada nereye ve nasıl kurulacağına dair seçim. Veri kalitesini ve verinin neyi gösterebileceğini etkiler.",
      },
      {
        title: "Sismik ağ",
        description:
          "Sarsıntıyı algılamak ve kaydetmek için bir alana yayılmış cihazlar ya da telefonlar topluluğu.",
      },
      {
        title: "Sismik izleme",
        description:
          "Zemin veya bina hareketinin sürekli ya da olay bazlı ölçümüdür. İzleme gözlem sağlar; binanın güvenli olduğunu belgelemez.",
      },
      {
        title: "Zaman serisi",
        description:
          "İvme gibi ölçülen bir büyüklüğün zaman içindeki kaydı.",
      },
    ],
  },
  es: {
    meta: {
      title: "Glosario de monitoreo sísmico | SismoSmart",
      description:
        "Definiciones claras de los términos de monitoreo sísmico y movimiento de edificios usados en el sitio de SismoSmart.",
    },
    eyebrow: "Terminología",
    title: "Glosario de monitoreo sísmico",
    description:
      "Definiciones de los principales términos de sensores, terremotos e ingeniería usados en este sitio.",
    sections: [
      {
        title: "Aceleración",
        description:
          "La rapidez con la que cambia el movimiento. Un sensor sísmico mide la aceleración a lo largo del tiempo para registrar la forma y la intensidad del movimiento del edificio.",
      },
      {
        title: "Movimiento del edificio",
        description:
          "El movimiento de un edificio durante una vibración o un terremoto. No equivale a una evaluación de seguridad estructural.",
      },
      {
        title: "Registro de evento",
        description:
          "Una serie de mediciones del sensor con marca de tiempo capturada alrededor de un evento de sacudida para su revisión técnica posterior.",
      },
      {
        title: "Onda P",
        description:
          "La onda sísmica primaria. Normalmente viaja más rápido que otras ondas y puede llegar primero al sensor.",
      },
      {
        title: "Onda S",
        description:
          "La onda sísmica secundaria. Normalmente llega después de la onda P y mueve el material de forma perpendicular a su dirección de propagación.",
      },
      {
        title: "Sensor",
        description:
          "El componente de medición que convierte el movimiento físico del edificio en datos digitales.",
      },
      {
        title: "Monitoreo sísmico",
        description:
          "La medición continua o basada en eventos del movimiento del suelo o del edificio. El monitoreo aporta observación; no certifica que un edificio sea seguro.",
      },
      {
        title: "Ingeniero estructural",
        description:
          "Un profesional cualificado que evalúa el comportamiento de las estructuras e interpreta las mediciones junto con inspecciones, planos y otras evidencias.",
      },
    ],
  },
  id: {
    meta: {
      title: "Glosarium pemantauan seismik | SismoSmart",
      description:
        "Definisi sederhana untuk istilah pemantauan seismik dan gerakan bangunan yang digunakan di situs SismoSmart.",
    },
    eyebrow: "Terminologi",
    title: "Glosarium pemantauan seismik",
    description:
      "Definisi istilah utama tentang sensor, gempa, dan rekayasa yang digunakan di situs ini.",
    sections: [
      {
        title: "Percepatan",
        description:
          "Laju perubahan gerakan. Sensor seismik mengukur percepatan dari waktu ke waktu untuk merekam bentuk dan intensitas gerakan bangunan.",
      },
      {
        title: "Gerakan bangunan",
        description:
          "Gerakan bangunan saat terjadi getaran atau gempa. Ini tidak sama dengan penilaian keselamatan struktur.",
      },
      {
        title: "Rekaman peristiwa",
        description:
          "Rangkaian pengukuran sensor bertanda waktu yang direkam di sekitar peristiwa guncangan untuk ditinjau secara teknis kemudian.",
      },
      {
        title: "Gelombang P",
        description:
          "Gelombang seismik primer. Biasanya bergerak lebih cepat daripada gelombang gempa lain dan dapat tiba lebih dahulu di sensor.",
      },
      {
        title: "Gelombang S",
        description:
          "Gelombang seismik sekunder. Biasanya tiba setelah gelombang P dan menggerakkan material tegak lurus terhadap arah rambatnya.",
      },
      {
        title: "Sensor",
        description:
          "Komponen pengukuran yang mengubah gerakan fisik bangunan menjadi data digital.",
      },
      {
        title: "Pemantauan seismik",
        description:
          "Pengukuran gerakan tanah atau bangunan secara terus-menerus atau berbasis peristiwa. Pemantauan mendukung observasi; bukan sertifikasi bahwa bangunan aman.",
      },
      {
        title: "Insinyur struktur",
        description:
          "Insinyur berkualifikasi yang mengevaluasi perilaku struktur dan menafsirkan pengukuran bersama inspeksi, gambar, serta bukti lainnya.",
      },
    ],
  },
  pt: {
    meta: {
      title: "Glossário de monitorização sísmica | SismoSmart",
      description:
        "Definições claras dos termos de monitorização sísmica e movimento de edifícios usados no site da SismoSmart.",
    },
    eyebrow: "Terminologia",
    title: "Glossário de monitorização sísmica",
    description:
      "Definições dos principais termos de sensores, sismos e engenharia usados neste site.",
    sections: [
      {
        title: "Aceleração",
        description:
          "A rapidez com que o movimento muda. Um sensor sísmico mede a aceleração ao longo do tempo para registar a forma e a intensidade do movimento do edifício.",
      },
      {
        title: "Movimento do edifício",
        description:
          "O movimento de um edifício durante vibração ou um sismo. Não é o mesmo que uma avaliação de segurança estrutural.",
      },
      {
        title: "Registo de evento",
        description:
          "Uma série de medições do sensor com marca temporal captada em torno de um evento de vibração para revisão técnica posterior.",
      },
      {
        title: "Onda P",
        description:
          "A onda sísmica primária. Normalmente viaja mais depressa do que outras ondas e pode chegar primeiro ao sensor.",
      },
      {
        title: "Onda S",
        description:
          "A onda sísmica secundária. Normalmente chega depois da onda P e move o material perpendicularmente à direção de propagação.",
      },
      {
        title: "Sensor",
        description:
          "O componente de medição que converte o movimento físico do edifício em dados digitais.",
      },
      {
        title: "Monitorização sísmica",
        description:
          "A medição contínua ou baseada em eventos do movimento do solo ou do edifício. A monitorização apoia a observação; não certifica que um edifício é seguro.",
      },
      {
        title: "Engenheiro de estruturas",
        description:
          "Um engenheiro qualificado que avalia o comportamento das estruturas e interpreta medições juntamente com inspeções, projetos e outras evidências.",
      },
    ],
  },
  it: {
    meta: {
      title: "Glossario del monitoraggio sismico | SismoSmart",
      description:
        "Definizioni chiare dei termini di monitoraggio sismico e movimento degli edifici usati nel sito SismoSmart.",
    },
    eyebrow: "Terminologia",
    title: "Glossario del monitoraggio sismico",
    description:
      "Definizioni dei principali termini relativi a sensori, terremoti e ingegneria usati in questo sito.",
    sections: [
      {
        title: "Accelerazione",
        description:
          "La velocità con cui cambia il movimento. Un sensore sismico misura l'accelerazione nel tempo per registrare forma e intensità del movimento dell'edificio.",
      },
      {
        title: "Movimento dell'edificio",
        description:
          "Il movimento di un edificio durante una vibrazione o un terremoto. Non equivale a una valutazione della sicurezza strutturale.",
      },
      {
        title: "Registrazione dell'evento",
        description:
          "Una serie di misurazioni del sensore con data e ora, acquisita intorno a un evento di scuotimento per una successiva revisione tecnica.",
      },
      {
        title: "Onda P",
        description:
          "L'onda sismica primaria. Di norma viaggia più velocemente delle altre onde e può arrivare per prima al sensore.",
      },
      {
        title: "Onda S",
        description:
          "L'onda sismica secondaria. Di norma arriva dopo l'onda P e muove il materiale perpendicolarmente alla direzione di propagazione.",
      },
      {
        title: "Sensore",
        description:
          "Il componente di misura che converte il movimento fisico dell'edificio in dati digitali.",
      },
      {
        title: "Monitoraggio sismico",
        description:
          "La misurazione continua o basata su eventi del movimento del suolo o dell'edificio. Il monitoraggio supporta l'osservazione; non certifica che un edificio sia sicuro.",
      },
      {
        title: "Ingegnere strutturale",
        description:
          "Un ingegnere qualificato che valuta il comportamento delle strutture e interpreta le misurazioni insieme a ispezioni, progetti e altre evidenze.",
      },
    ],
  },
};
