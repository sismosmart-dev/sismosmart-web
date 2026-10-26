import type { BaseRoutePagesCopy } from "@/lib/page-copy";

export const itPages: BaseRoutePagesCopy = {
  product: {
    meta: {
      title: "Il dispositivo SismoSmart",
      description:
        "Dispositivo sismico in fase pre-lancio per case e piccoli edifici, progettato per registrare il movimento; prestazioni, connettività e report restano soggetti a validazione pilota.",
    },
    eyebrow: "Prodotto",
    title: "Il dispositivo",
    description:
      "Dispositivo a parete alimentato via USB-C in fase pre-lancio. Sensore, connettività, report e prestazioni restano obiettivi di progetto.",
    deviceDescription:
      "La scocca pilota è pensata per il montaggio fisso a parete. Hardware e istruzioni finali saranno confermati con il dispositivo validato.",
    meterTopLabel: "Sensore",
    meterTopValue: "Target MEMS",
    meterBottomLabel: "Dati",
    meterBottomValue: "Target di sicurezza",
    imageAlt: "Dispositivo SismoSmart, vista frontale",
    specs: [
      { label: "Sensore", value: "Target MEMS classe ADXL355" },
      { label: "Connessione", value: "Target Wi-Fi + Bluetooth" },
      { label: "Installazione", value: "Target setup pilota" },
      { label: "Stato", value: "Target LED RGB + app" },
    ],
    useCases: [
      { title: "Case e appartamenti", description: "Contesti candidati al pilota per misure fisse; il posizionamento viene concordato per edificio." },
      { title: "Campus e fabbriche", description: "Piloti multi-edificio possono valutare una vista centralizzata dopo la validazione del flusso." },
      { title: "Officine e uffici", description: "L'uso in piccoli edifici è un'ipotesi pilota, non un'implementazione commerciale validata." },
      { title: "Università", description: "L'accesso alla ricerca richiede accordi espliciti, controlli privacy e uno scopo definito di condivisione." },
    ],
    comparisonTitle: "Come si confronta",
    comparisonDescription:
      "SismoSmart è progettato come dispositivo fisso tra sensori da telefono e strumentazione professionale. Sensibilità, report e costo restano ipotesi di validazione o commerciali.",
    comparisonRows: [
      { label: "Installazione", sismosmart: "Processo pilota", traditional: "Installazione professionale variabile", mobile: "Setup app" },
      { label: "Dispositivo fisso", sismosmart: "Target: montato sull'edificio", traditional: "Sì", mobile: "No, il telefono si muove" },
      { label: "Interpretazione strutturale", sismosmart: "Validazione in corso", traditional: "Flusso esperto", mobile: "Non valuta l'edificio" },
      { label: "Prezzo", sismosmart: "Pre-lancio; nessun prezzo pubblico", traditional: "Prezzo sistema professionale", mobile: "Spesso gratis" },
    ],
    ctaLabel: "Candidati al pilota",
    ctaHref: "/pilot-program",
  },
  howItWorks: {
    meta: {
      title: "Come funziona SismoSmart",
      description:
        "Progetto in fase pre-lancio per misurare il movimento, conservare dati evento e preparare informazioni per validazione pilota e revisione professionale.",
    },
    eyebrow: "Come funziona",
    title: "Dispositivo, cloud, app: insieme.",
    description:
      "Il progetto attuale combina misura locale, un percorso dati connesso e uno strato app/report. Rilevamento, notifiche, correlazione e report restano in validazione pilota.",
    flow: [
      { title: "Monta il dispositivo", description: "Il posizionamento pilota viene scelto su una superficie interna stabile in base all'edificio e all'obiettivo di misura." },
      { title: "Abbinalo al telefono", description: "Bluetooth e Wi-Fi sono obiettivi di provisioning; la sicurezza finale dipende dalla revisione dell'implementazione." },
      { title: "Costruisci una baseline", description: "La calibrazione pilota mira a registrare le vibrazioni quotidiane e testare la separazione dei movimenti insoliti." },
      { title: "Registra un evento", description: "Il progetto mira a cattura locale e vista successiva in app/report; tempi e completezza restano da validare." },
    ],
    signals: [
      { title: "Rilevamento nel dispositivo", description: "È un obiettivo di progetto. Soglie, falsi positivi, eventi mancati e affidabilità richiedono evidenza pilota etichettata." },
      { title: "Report post-evento", description: "Un report futuro può riassumere grandezze validate per revisione professionale. Non determina la sicurezza." },
      { title: "Solo i dati necessari", description: "Il flusso dati del sito è documentato a parte. La telemetria futura sarà definita prima della raccolta pilota." },
    ],
    network: [
      { title: "Correlazione tra dispositivi", description: "È un obiettivo di progetto; l'effetto su conferma e falsi allarmi non è ancora dimostrato." },
      { title: "Evidenza strutturale nel tempo", description: "Cambiamenti misurati possono fornire elementi aggiuntivi a un ingegnere; non sono una diagnosi." },
      { title: "Interfaccia semplice", description: "Una vista di stato chiara è un obiettivo di prodotto; stati e soglie finali dipendono dalla validazione." },
    ],
  },
  about: {
    meta: {
      title: "Chi siamo",
      description:
        "Chi costruisce SismoSmart e perché. Il team, il punto di vista, dove vogliamo arrivare.",
    },
    eyebrow: "Chi siamo",
    title: "Viviamo in Turchia. Vogliamo edifici solidi.",
    description:
      "Ci siamo riuniti dopo i terremoti di Kahramanmaraş del 2023 e le scosse recenti attorno a Istanbul. Volevamo capire come reagiscono le nostre case e la città. Così abbiamo costruito il dispositivo.",
    story: [
      "Dopo un grande terremoto in Turchia, i controlli degli edifici richiedono settimane, a volte mesi. Nel frattempo le famiglie non sanno se possono rientrare.",
      "Non elimineremo del tutto l'attesa. Alla fine un ingegnere deve entrare nell'edificio. Ma prima del suo arrivo può esistere uno strato di dati che indichi quali edifici controllare per primi. È quello su cui stiamo lavorando.",
      "Nel team ci sono un consulente accademico in ingegneria civile, due ricercatori MSc in ingegneria civile e un fondatore su embedded e software. Siamo tutti in Turchia. Testiamo il dispositivo nelle nostre case.",
    ],
    principles: [
      {
        title: "Informare senza spaventare",
        description:
          "Niente marketing della paura. Il dispositivo crea preparazione, non panico.",
      },
      {
        title: "Dire i limiti",
        description:
          "Diremo chiaramente cosa non facciamo. Non siamo un sistema ufficiale. Non sostituiamo il report di un ingegnere.",
      },
      {
        title: "Restituire i dati al proprietario",
        description:
          "I dati del tuo edificio sono tuoi. Aggregati anonimi possono aiutare università o istituzioni. I dati personali non sono in vendita.",
      },
    ],
    timeline: [
      { period: "Completato", title: "Base di prodotto e sistema", description: "Il concetto iniziale e l'architettura di sistema sono definiti. Le affermazioni pubbliche restano vincolate dal registro delle evidenze." },
      { period: "Attuale", title: "Validazione pilota", description: "Hardware, rilevamento, notifiche, connettività e report vengono validati prima di ampliare le affermazioni." },
      { period: "Successivo", title: "Evidenza e congelamento del progetto", description: "BOM, algoritmi e ipotesi operative vengono congelati solo dopo la revisione delle prove di banco e campo." },
      { period: "Più avanti", title: "Certificazione e produzione", description: "Certificazione, produzione e lancio seguono i gate di evidenza. Non è promessa una data pubblica di consegna." },
    ],
    team: [
      {
        name: "Fondatore",
        role: "Hardware, software, prodotto",
        bio: "Responsabile di sistemi embedded, IoT, cloud e prodotto.",
      },
      {
        name: "Consulente accademico",
        role: "Ingegneria dei terremoti",
        bio: "PhD in ingegneria civile. Validazione scientifica degli algoritmi strutturali.",
      },
      {
        name: "Ingegneri civili",
        role: "Struttura e siti pilota",
        bio: "Due ricercatori MSc in ingegneria civile. Guidano algoritmi lato edificio e validazione sul campo.",
      },
    ],
  },
  contact: {
    meta: {
      title: "Contatto",
      description:
        "Vuoi parlare con SismoSmart? Qui trovi il canale giusto. Prodotto, pilota, stampa o investitori.",
    },
    eyebrow: "Contatto",
    title: "Scrivi, rispondiamo.",
    description:
      "Al momento il canale più rapido è l'email. Un oggetto chiaro arriva alla persona giusta.",
    channels: [
      {
        title: "Generale",
        description: "Domande sul prodotto, candidature pilota, interesse all'acquisto",
        value: "info@sismosmart.com",
        href: "mailto:info@sismosmart.com",
      },
      {
        title: "Stampa",
        description: "Interviste, press kit, partnership",
        value: "press@sismosmart.com",
        href: "mailto:press@sismosmart.com",
      },
      {
        title: "LinkedIn",
        description: "Aggiornamenti professionali e notizie aziendali",
        value: "linkedin.com/company/sismosmart",
        href: "https://www.linkedin.com/company/sismosmart",
      },
    ],
    form: {
      nameLabel: "Il tuo nome",
      emailLabel: "Email",
      subjectLabel: "Oggetto",
      messageLabel: "Il tuo messaggio",
      buttonLabel: "Invia",
      consentLabel:
        "Accetto che queste informazioni vengano trattate per leggere e rispondere al mio messaggio.",
      note: "Usiamo queste informazioni solo per rispondere al messaggio.",
      loadingLabel: "Invio...",
      successMessage: "Messaggio inviato. Risponderemo appena possibile.",
      errorMessage: "Qualcosa non ha funzionato. Riprova tra poco.",
      missingEndpointMessage:
        "Il modulo non è ancora collegato. Scrivi a info@sismosmart.com.",
      rateLimitedMessage:
        "Troppi tentativi. Riprova tra qualche minuto.",
    },
  },
  privacy: {
    meta: {
      title: "Privacy",
      description:
        "Quali dati raccogliamo, perché li usiamo, con chi li condividiamo. Spiegato in modo semplice.",
    },
    eyebrow: "Privacy",
    title: "Informativa privacy",
    description:
      "Non raccogliamo dati che non servono. Usiamo ciò che raccogliamo solo per lo scopo dichiarato. Non li vendiamo.",
    sections: [
      {
        title: "Dati che raccogliamo",
        description:
          "Sul sito attivo: email di iscrizione, messaggi del modulo e preferenze cookie. I dati previsti per un pilota possono includere movimento, misure ambientali, stato e posizione approssimativa; le categorie esatte vengono documentate prima della raccolta.",
      },
      {
        title: "Per cosa li usiamo",
        description:
          "I dati attuali del sito sono usati per rispondere ai messaggi, gestire candidature pilota e inviare comunicazioni consentite. Le finalità dei futuri dati del dispositivo vengono definite nell'accordo prima della raccolta.",
      },
      {
        title: "Con chi li condividiamo",
        description:
          "Gli invii dei moduli possono passare dal provider configurato. Processori, luoghi di trattamento, trasferimenti e conservazione dei futuri dati del dispositivo vengono definiti prima del pilota. Non vendiamo dati personali a terzi.",
      },
      {
        title: "I tuoi diritti",
        description:
          "Puoi accedere, correggere, cancellare o esportare i tuoi dati. Per KVKK e GDPR scrivi a info@sismosmart.com.",
      },
    ],
  },
  terms: {
    meta: {
      title: "Termini d'uso",
      description:
        "Termini base per usare il sito e le informazioni pre-lancio.",
    },
    eyebrow: "Termini",
    title: "Termini d'uso",
    description: "Il sito è pre-lancio. I termini sotto valgono per questa fase.",
    sections: [
      {
        title: "Informativo",
        description:
          "Questo sito informa su SismoSmart e accetta candidature pilota. Non è un servizio sismologico ufficiale o un canale di allerta terremoto.",
      },
      {
        title: "Non è una garanzia",
        description:
          "Il dispositivo è in sviluppo per supportare preparazione e revisione post-evento. Non sostituisce sistemi ufficiali, istruzioni di emergenza o il report di un ingegnere strutturale.",
      },
      {
        title: "Proprietà intellettuale",
        description:
          "Nome, logo, design prodotto e contenuti del sito appartengono a SismoSmart. Non possono essere riprodotti senza permesso.",
      },
      {
        title: "Contatto",
        description: "Domande a info@sismosmart.com.",
      },
    ],
  },
  press: {
    meta: {
      title: "Press kit",
      description: "Informazioni, immagini e contatti per la stampa.",
    },
    eyebrow: "Stampa",
    title: "Press kit",
    description:
      "Una pagina per media, partner e richieste di intervista.",
    sections: [
      {
        title: "Descrizione breve",
        description:
          "SismoSmart sviluppa un dispositivo di monitoraggio sismico in fase pre-lancio per case e piccoli edifici, progettato per registrare il movimento e supportare la revisione professionale post-evento. Validazione pilota, certificazione e produzione determineranno il calendario.",
      },
      {
        title: "Contatto stampa",
        description:
          "Per interviste, immagini stampa o demo: press@sismosmart.com.",
      },
    ],
    links: [
      {
        title: "Logo",
        description: "Logo vettoriale SVG",
        href: "/logo-symbol.svg",
      },
      {
        title: "Immagine prodotto",
        description: "Render del dispositivo ad alta risoluzione",
        href: "/images/device/sismosmart-device-front.png",
      },
      {
        title: "Immagine social",
        description: "Scheda di condivisione 1200x630",
        href: "/images/og/sismosmart-og.png",
      },
    ],
  },
};
