import { makeExtraPages } from "@/lib/page-content/extra-pages/shared";

export const itExtraPages = makeExtraPages({
  technology: {
    eyebrow: "Tecnologia",
    metaTitle: "Tecnologia: come misura SismoSmart",
    metaDescription:
      "Panoramica tecnica pre-lancio su obiettivi di progetto per sensori, registrazione eventi e analisi; rilevamento e prestazioni restano soggetti a validazione pilota.",
    title: "Cosa c'è dentro il dispositivo e come il dato arriva fino a te",
    description:
      "SismoSmart è un sistema di misura in fase pre-lancio. Questa pagina descrive gli obiettivi di progetto attuali per rilevamento, registrazione degli eventi e report, e li distingue dalle funzioni che richiedono ancora evidenza pilota.",
    sections: [
      ["Accelerometro MEMS", "Il progetto attuale mira a un sensore MEMS classe ADXL355, campionamento triassiale a 250 Hz e un obiettivo di rumore documentato. Selezione finale e affermazioni sulle prestazioni richiedono una distinta base (BOM) congelata e prove di banco."],
      ["Rilevamento STA/LTA", "Il dispositivo confronta la media dell'ultimo mezzo secondo con quella degli ultimi trenta secondi. Quando quel rapporto sale di colpo, viene segnalato un possibile evento. Il metodo si chiama STA/LTA ed è uno standard in sismologia. La calibrazione pilota mira a distinguere il normale rumore dell'edificio da una scossa, ma sono possibili falsi positivi o eventi mancati finché la validazione sul campo non è completa."],
      ["Buffer evento locale", "Il buffering locale durante una perdita di connettività è un obiettivo di progetto. Durata e recupero dell'invio restano soggetti a validazione pilota end-to-end."],
      ["Conferma cloud", "La correlazione tra più dispositivi è un obiettivo di progetto. Finestra di trigger, regola di conferma ed effetto sui falsi allarmi devono essere dimostrati con dati pilota etichettati."],
      ["Monitoraggio della salute strutturale", "Cambiamenti nelle caratteristiche di vibrazione misurate possono fornire ulteriori elementi a un ingegnere. Il metodo è in validazione e non diagnostica danni né determina la sicurezza dell'edificio."],
      ["Report per l'ingegnere", "Il report pianificato può riassumere il movimento misurato con grandezze standard. Campi, incertezza e interpretazione restano soggetti a validazione pilota e revisione professionale."],
      ["Connettività", "L'architettura attuale mira al Wi-Fi per il dispositivo iniziale. Connettività cellulare o LoRa resta in roadmap e non è presentata come capacità già distribuita."],
      ["Alimentazione", "Il progetto hardware mira ad alimentazione USB-C e a un breve ponte con supercondensatore. Durata e comportamento di invio durante un blackout richiedono prove di banco e pilota."],
      ["Certificazione", "La certificazione è pianificata, non completata. CE/RED, BTK, RoHS, WEEE, FCC o altre approvazioni saranno dichiarate solo quando esiste documentazione per modello e mercato pertinenti."],
    ],
  },
  pilotProgram: {
    eyebrow: "Programma pilota",
    metaTitle: "Candidatura al programma pilota",
    metaDescription:
      "Candidature pilota per appartamenti, campus, fabbriche ed edifici di ricerca. Ambito, numero di dispositivi, durata e condizioni commerciali vengono concordati caso per caso.",
    title: "Vogliamo vedere il dispositivo prima nel tuo edificio.",
    description:
      "Il prodotto non è ancora in vendita ampia. Quello che cerchiamo in questa fase sono pochi siti seri e persone disposte a dirci cosa non funziona. Se rientri in uno dei quattro gruppi qui sotto, il modulo in fondo è la porta d'ingresso.",
    sections: [
      ["Appartamenti", "Partiamo con un dispositivo in un appartamento. Se l'amministratore partecipa, ne aggiungiamo altri su piani diversi. Aiutiamo con l'installazione e con il coordinamento con l'amministrazione."],
      ["Campus e fabbriche", "Più edifici, un'unica dashboard centrale. Ogni edificio conserva la propria registrazione. Prima di installare rivediamo insieme al tuo team IT la topologia di rete e i requisiti di sicurezza."],
      ["Piloti comunali", "Distribuzioni a scala di quartiere che mostrano dove lo stesso terremoto è stato avvertito più forte. I dati personali restano completamente fuori da questo flusso. Viene condiviso solo l'aggregato per edificio o per area."],
      ["Partner di ricerca", "Dipartimenti universitari di ingegneria sismica. I dati grezzi potrebbero essere aperti all'analisi accademica in cambio di riscontri e della possibilità di una pubblicazione congiunta, ma solo con un accordo di riservatezza e uno di condivisione dati. Quel flusso non esiste ancora."],
      ["Cosa offriamo", "L'ambito del pilota viene concordato caso per caso. Numero di dispositivi, durata, proprietà, supporto e condizioni commerciali sono definiti nell'accordo e non promessi su questa pagina."],
      ["Cosa chiediamo in cambio", "Che tu coordini l'installazione con l'amministrazione o con lo staff dell'edificio. Facciamo una chiamata di feedback di circa quindici minuti al mese. Se capita un evento, ti chiediamo una nota breve. Alla fine ci piacerebbe pubblicare un breve case study, e volentieri lasciamo fuori il tuo nome."],
      ["Dalla candidatura all'installazione", "Le candidature vengono valutate insieme a edificio, accesso, rete, privacy e sicurezza. Tempi, contratto, spedizione e installazione dipendono dal pilota scelto e vengono confermati direttamente."],
    ],
  },
  investors: {
    eyebrow: "Investitori",
    metaTitle: "Investitori: brief del round pre-seed",
    metaDescription:
      "Panoramica qualitativa per investitori in fase pre-lancio. Finanziamento, prezzi, roadmap e ipotesi commerciali correnti vengono condivisi direttamente perché possono cambiare.",
    title: "Dopo un terremoto c'è una finestra che nessuno misura.",
    description:
      "Dopo un terremoto importante in Turchia l'ispezione strutturale richiede settimane. In quelle settimane le famiglie tirano a indovinare, le aziende si fermano e le assicurazioni si ingolfano. SismoSmart è una startup hardware che prova a chiudere quella finestra usando i dati dell'edificio stesso.",
    sections: [
      ["Problema", "I grandi terremoti possono creare arretrati nelle ispezioni. SismoSmart verifica se dati fissi sul movimento dell'edificio possano fornire elementi aggiuntivi per la priorità; non sostituisce l'ispezione né decide la sicurezza."],
      ["Perché ora", "Sensori MEMS moderni e hardware connesso rendono più pratico il monitoraggio fisso a costi inferiori. Economia dei componenti e prestazioni finali restano ipotesi finché il progetto non è congelato."],
      ["Mercato", "Il primo focus commerciale è la Turchia. L'espansione successiva dipende da domanda validata, certificazione, produzione e partner locali; questa pagina non pubblica stime di mercato non revisionate come fatti correnti."],
      ["Prodotto", "Varianti hardware, prezzi, abbonamenti e unit economics restano ipotesi di pianificazione. Termini correnti e modello finanziario sono condivisi direttamente con investitori qualificati."],
      ["Team", "Il progetto combina prodotto/software con contributi di ingegneria civile e sismica. Composizione del team e relazioni di advisory possono cambiare; il materiale di diligence aggiornato viene condiviso direttamente."],
      ["Concorrenza", "Il panorama comprende allerte ufficiali, allerte mobili, strumentazione professionale e altri prodotti di monitoraggio. L'ipotesi SismoSmart è misura fissa dell'edificio ed evidenza post-evento; la differenziazione richiede validazione."],
      ["Roadmap", "La sequenza attiva è validazione pilota, affinamento hardware/software, revisione dell'evidenza, preparazione a certificazione e produzione, e lancio solo quando questi gate sono soddisfatti. Nessun trimestre è una promessa."],
      ["Il round", "Importo del round, autonomia di cassa, allocazione e ipotesi su grant o crediti sono input di pianificazione datati. I termini correnti sono condivisi direttamente e non vanno dedotti da vecchie cifre pubbliche."],
      ["Cosa cerchiamo", "Business angel e fondi in fase iniziale che abbiano già visto una startup hardware. I partner con accesso alla regolamentazione, alla manifattura e alle reti assicurative in Turchia valgono per noi più del denaro veloce. La documentazione tecnica dettagliata e il modello finanziario li condividiamo sotto accordo di riservatezza."],
    ],
  },
  faq: {
    eyebrow: "FAQ",
    metaTitle: "Domande frequenti",
    metaDescription:
      "Risposte dirette su avvisi terremoto, sicurezza dell'edificio, dati, privacy, installazione e tempi di lancio.",
    title: "Domande frequenti",
    description:
      "I prodotti per terremoti rischiano facilmente di promettere troppo. Noi proviamo a tenere ben visibili i limiti del dispositivo. Se non trovi qui la risposta alla tua domanda, scrivi a info@sismosmart.com.",
    sections: [
      ["Questo dispositivo mi avviserà prima del terremoto?", "No. SismoSmart non è un servizio di allerta precoce e non promette preavviso. Il pilota può valutare notifiche a bassa latenza dopo il rilevamento locale; per le emergenze segui gli avvisi ufficiali."],
      ["Un singolo dispositivo può dirmi se il mio edificio è sicuro?", "Non può. Chi dichiara un edificio sicuro o non sicuro è un ingegnere, non un apparecchio. Quello che fa il dispositivo è lasciare a quell'ingegnere qualcosa di solido su cui lavorare."],
      ["Quali dati raccogliete?", "Letture di vibrazione, temperatura, umidità, pressione e lo stato di funzionamento del dispositivo stesso. Non colleghiamo informazioni personali al dispositivo e non vendiamo i tuoi dati a nessuno. I dettagli sono nella pagina Privacy."],
      ["La mia posizione esatta è esposta?", "Conosciamo la posizione del tuo dispositivo a livello di quartiere, perché ci serve per incrociare un evento con i dispositivi vicini. Qualsiasi cosa più precisa viene condivisa solo con un accordo pilota esplicito."],
      ["I ricercatori possono accedere ai miei dati?", "Solo una volta anonimizzati e solo con un accordo separato con te. Quel flusso non esiste ancora; è in roadmap."],
      ["Che differenza c'è con gli avvisi di Google?", "Google usa l'accelerometro dei telefoni. È gratis, ce l'hanno tutti e funziona bene. Ma quello che misura è l'origine del terremoto, non il tuo edificio. Noi facciamo l'opposto: come vibra il tuo edificio, come cambia con le stagioni, in che stato resta dopo il terremoto. A queste domande un telefono non risponde."],
      ["Cosa succede quando salta internet?", "Il buffering locale durante una perdita di rete è un obiettivo di progetto. Conservazione e invio successivo dell'evento dipendono da hardware, firmware e connettività validati."],
      ["E se manca la corrente?", "Un breve ponte con supercondensatore è un obiettivo hardware. Durata esatta e completamento o invio dell'evento durante il blackout richiedono prove di banco e pilota."],
      ["Quanto è difficile installarlo?", "Colleghi il cavo USB-C alla presa, attacchi il dispositivo al muro con l'adesivo sul retro e lo abbini dall'app. Niente trapano e niente tecnico. Cinque minuti."],
      ["Quanti dovrebbero esserci in un edificio?", "Non esiste un numero universale validato. Il posizionamento dipende dall'edificio, dall'obiettivo di misura e dalla revisione ingegneristica; le configurazioni multi-dispositivo sono valutate caso per caso."],
      ["Cosa significano PGA, PGV e MMI?", "PGA, PGV e intensità Modified Mercalli sono concetti standard. Un futuro report SismoSmart userà grandezze misurate o derivate solo dopo la validazione del metodo e dell'incertezza."],
      ["Cosa dice la frequenza naturale?", "Un edificio ha caratteristiche di vibrazione misurabili, incluse frequenze naturali. I cambiamenti possono fornire ulteriori elementi a un ingegnere, ma non diagnosticano danni o sicurezza da soli."],
      ["In che direzione deve andare il dispositivo?", "Sul retro c'è una freccia verso l'alto: puntala verso il soffitto. Cerca di allineare gli assi X e Y del dispositivo alle direzioni orizzontali dell'edificio. Montato girato di 90 gradi i dati restano utilizzabili, anche se portano un po' meno informazione."],
      ["Il dispositivo registra suoni?", "No. Non c'è microfono, solo un accelerometro che misura la vibrazione del suolo. Registrare voci o suoni ambientali richiederebbe un sensore completamente diverso."],
      ["I miei dati lasciano la Turchia?", "La residenza dei dati del pilota non è ancora definitiva. Prima della raccolta, ogni accordo indicherà luoghi di trattamento, trasferimenti, conservazione e base giuridica applicabile."],
      ["Quando esce sul mercato?", "Non c'è una data pubblica definitiva di vendita. SismoSmart resta in pre-lancio; evidenza pilota, maturità hardware, certificazione e produzione determineranno il calendario."],
    ],
  },
  security: {
    eyebrow: "Sicurezza",
    metaTitle: "Sicurezza",
    metaDescription:
      "Come gestiamo la sicurezza del sito, il consenso, i dati del dispositivo, il trasporto cifrato e la privacy durante la fase pilota.",
    title: "Il dato che non raccogli è il dato che non puoi perdere.",
    description:
      "È la nostra regola di base. Al momento l'unica cosa online è il sito, ma il lato dispositivo lo stiamo costruendo con la stessa regola.",
    sections: [
      ["Pochi dati per impostazione predefinita", "Il sito live raccoglie attualmente solo i dati descritti nella Privacy. La futura telemetria del dispositivo resta un'area di progetto e policy che verrà documentata prima del pilota."],
      ["Consenso prima dell'analitica", "L'analitica web si carica solo dopo il tuo consenso. Puoi revocare quella scelta in qualsiasi momento dal link nel piè di pagina."],
      ["Trasporto cifrato", "Il sito usa attualmente HTTPS e header di sicurezza. Cifratura del dispositivo e ciclo di vita delle chiavi sono obiettivi di progetto finché il protocollo implementato non viene revisionato e validato."],
      ["Nessun segreto arriva al browser", "Chiavi private e token di servizio non compaiono mai nel codice che arriva al browser. Restano in una configurazione protetta lato server."],
      ["Segnalazione vulnerabilità", "Se trovi un problema di sicurezza nel sito o nei materiali pre-lancio, scrivi a info@sismosmart.com. Siamo grati a chi divulga in modo responsabile."],
      ["Piano di sicurezza del dispositivo", "Firmware firmato, storage cifrato, chiavi per dispositivo e aggiornamenti con rollback sono obiettivi di sicurezza, non capacità distribuite. Saranno pubblicati come correnti solo dopo evidenza di implementazione e revisione."],
    ],
  },
});
