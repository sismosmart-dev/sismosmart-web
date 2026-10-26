import type { BaseRoutePagesCopy } from "@/lib/page-copy";

export const esPages: BaseRoutePagesCopy = {
  product: {
    meta: {
      title: "El dispositivo SismoSmart",
      description:
        "Dispositivo sísmico previo al lanzamiento para casas y edificios pequeños, diseñado para registrar movimiento; prestaciones, conectividad e informes siguen sujetos a validación piloto.",
    },
    eyebrow: "Producto",
    title: "El dispositivo",
    description:
      "Dispositivo de pared alimentado por USB-C en fase previa al lanzamiento. El sensor, la conectividad, los informes y el rendimiento siguen siendo objetivos de diseño.",
    deviceDescription:
      "La carcasa piloto está pensada para montaje fijo en pared. El hardware y las instrucciones finales se confirmarán con el dispositivo validado.",
    meterTopLabel: "Sensor",
    meterTopValue: "Objetivo MEMS",
    meterBottomLabel: "Datos",
    meterBottomValue: "Objetivo de seguridad",
    imageAlt: "Dispositivo SismoSmart, vista frontal",
    specs: [
      { label: "Sensor", value: "Objetivo MEMS clase ADXL355" },
      { label: "Conectividad", value: "Objetivo Wi-Fi + Bluetooth" },
      { label: "Instalación", value: "Objetivo de piloto" },
      { label: "Estado", value: "Objetivo LED RGB + app" },
    ],
    useCases: [
      { title: "Casas y apartamentos", description: "Entornos candidatos para pilotos de medición fija; la colocación se acuerda por edificio." },
      { title: "Campus y fábricas", description: "Pilotos con varios edificios pueden evaluar visibilidad centralizada cuando el flujo esté validado." },
      { title: "Talleres y oficinas", description: "El uso en edificios pequeños es una hipótesis de piloto, no una implantación comercial validada." },
      { title: "Universidades", description: "El acceso para investigación requiere acuerdos explícitos, controles de privacidad y un propósito definido." },
    ],
    comparisonTitle: "Cómo se compara",
    comparisonDescription:
      "SismoSmart se diseña como dispositivo fijo entre la medición solo con teléfono y la instrumentación profesional. Sensibilidad, informes y coste siguen siendo supuestos de validación o comerciales.",
    comparisonRows: [
      { label: "Instalación", sismosmart: "Proceso piloto", traditional: "Instalación profesional variable", mobile: "Configuración de app" },
      { label: "Dispositivo fijo", sismosmart: "Objetivo: montado al edificio", traditional: "Sí", mobile: "No, el teléfono se mueve" },
      { label: "Interpretación estructural", sismosmart: "Validación pendiente", traditional: "Flujo de experto", mobile: "No evalúa el edificio" },
      { label: "Precio", sismosmart: "Pre-lanzamiento; sin precio público", traditional: "Precio profesional", mobile: "A menudo gratis" },
    ],
    ctaLabel: "Solicitar piloto",
    ctaHref: "/pilot-program",
  },
  howItWorks: {
    meta: {
      title: "Cómo funciona SismoSmart",
      description:
        "Diseño previo al lanzamiento para medir movimiento, guardar datos de eventos y preparar información para validación piloto y revisión profesional.",
    },
    eyebrow: "Cómo funciona",
    title: "Dispositivo, nube, app: juntos.",
    description:
      "El diseño actual combina medición local, un flujo de datos conectado y una capa de app/informe. Detección, notificaciones, correlación e informes siguen pendientes de validación piloto.",
    flow: [
      { title: "Monta el dispositivo", description: "La colocación piloto se decide en una superficie interior estable según el edificio y el objetivo de medición." },
      { title: "Empareja con el teléfono", description: "Bluetooth y Wi-Fi son objetivos del flujo de aprovisionamiento; la seguridad final requiere revisión de implementación." },
      { title: "Construye una referencia", description: "La calibración piloto busca registrar vibración cotidiana y evaluar si puede separarse movimiento inusual." },
      { title: "Registra un evento", description: "El diseño apunta a captura local y vista posterior en app/informe; tiempos y completitud siguen en validación." },
    ],
    signals: [
      { title: "Detección en el dispositivo", description: "Es un objetivo de diseño. Umbrales, falsos positivos, eventos perdidos y fiabilidad requieren evidencia piloto etiquetada." },
      { title: "Informe post-evento", description: "Un informe futuro puede resumir magnitudes validadas para revisión profesional. No determina la seguridad." },
      { title: "Solo los datos necesarios", description: "Los datos del sitio web se documentan aparte. La telemetría futura del dispositivo se define antes de recoger datos piloto." },
    ],
    network: [
      { title: "Correlación entre dispositivos", description: "Es un objetivo de diseño; su efecto en confirmación y falsas alarmas aún no está demostrado." },
      { title: "Evidencia estructural en el tiempo", description: "Cambios medidos pueden aportar evidencia adicional a un ingeniero; no son un diagnóstico." },
      { title: "Interfaz simple", description: "Una vista clara de estado es un objetivo de producto; estados y umbrales finales dependen de la validación." },
    ],
  },
  about: {
    meta: { title: "Acerca de", description: "Quién construye SismoSmart y por qué. El equipo y nuestra mirada tras los terremotos de 2023." },
    eyebrow: "Acerca de",
    title: "Vivimos en Türkiye. Queremos edificios sanos.",
    description:
      "Nos reunimos después de los terremotos de Kahramanmaraş de 2023 y de los temblores recientes en torno a Estambul. Queríamos saber cómo responden nuestras casas y nuestra ciudad. Por eso hicimos el dispositivo.",
    story: [
      "Después de un gran terremoto en Türkiye, revisar edificios toma semanas o meses. Mientras tanto, las familias no saben si pueden volver a casa.",
      "No eliminaremos esa espera por completo. Al final tiene que entrar un ingeniero al edificio. Pero antes de que llegue puede existir una capa de datos que indique qué edificios conviene revisar primero. Eso es lo que estamos construyendo.",
      "El equipo tiene un asesor académico en ingeniería civil, dos investigadores MSc y un fundador en hardware y software. Estamos en Türkiye. Probamos el dispositivo en nuestras casas.",
    ],
    principles: [
      { title: "Informar sin asustar", description: "No haremos marketing de desastres. El dispositivo crea preparación, no pánico." },
      { title: "Decir los límites", description: "Diremos lo que no hacemos. No somos alerta oficial. No reemplazamos el reporte de un ingeniero." },
      { title: "Devolver los datos", description: "Los datos de tu edificio son tuyos. Agregados anónimos pueden ir a academia o gobierno. Los datos personales no se venden." },
    ],
    timeline: [
      { period: "Completado", title: "Base de producto y sistema", description: "El concepto inicial y la arquitectura del sistema están definidos. Las afirmaciones públicas siguen limitadas por el registro de evidencia." },
      { period: "Actual", title: "Validación piloto", description: "Hardware, detección, notificaciones, conectividad e informes se validan antes de ampliar las afirmaciones." },
      { period: "Siguiente", title: "Evidencia y cierre de diseño", description: "La lista de materiales (BOM), los algoritmos y los supuestos operativos solo se congelan después de revisar evidencia de banco y campo." },
      { period: "Después", title: "Certificación y fabricación", description: "Certificación, fabricación y lanzamiento siguen a las etapas de evidencia. No hay una fecha pública comprometida." },
    ],
    team: [
      { name: "Fundador", role: "Hardware, software, producto", bio: "Responsable de sistemas embebidos, IoT, nube y producto." },
      { name: "Asesor académico", role: "Ingeniería sísmica", bio: "Doctor en ingeniería civil. Valida científicamente los algoritmos de salud estructural." },
      { name: "Ingenieros civiles", role: "Salud estructural y pilotos", bio: "Dos investigadores MSc. Llevan los algoritmos de edificio y la validación en campo." },
    ],
  },
  contact: {
    meta: { title: "Contacto", description: "Si quieres hablar con SismoSmart, este es el canal. Producto, piloto, prensa o inversores." },
    eyebrow: "Contacto",
    title: "Escribe, respondemos.",
    description: "El canal más rápido ahora es email. Un asunto claro llega a la persona correcta.",
    channels: [
      { title: "General", description: "Preguntas de producto, pilotos, interés de compra", value: "info@sismosmart.com", href: "mailto:info@sismosmart.com" },
      { title: "Prensa", description: "Entrevistas, kit de prensa, colaboración", value: "press@sismosmart.com", href: "mailto:press@sismosmart.com" },
      { title: "LinkedIn", description: "Actualizaciones profesionales y de empresa", value: "linkedin.com/company/sismosmart", href: "https://www.linkedin.com/company/sismosmart" },
    ],
    form: {
      nameLabel: "Tu nombre",
      emailLabel: "Email",
      subjectLabel: "Asunto",
      messageLabel: "Tu mensaje",
      buttonLabel: "Enviar",
      consentLabel: "Acepto que esta información se procese para revisar y responder mi mensaje.",
      note: "Solo usamos esta información para responder tu mensaje.",
      loadingLabel: "Enviando...",
      successMessage: "Tu mensaje fue enviado. Responderemos lo antes posible.",
      errorMessage: "Algo salió mal. Inténtalo de nuevo.",
      missingEndpointMessage: "El formulario aún no está conectado. Escribe a info@sismosmart.com.",
      rateLimitedMessage:
        "Demasiados intentos. Inténtalo de nuevo en unos minutos.",
    },
  },
  privacy: {
    meta: { title: "Privacidad", description: "Qué datos recogemos, por qué los usamos y con quién los compartimos. Sin rodeos." },
    eyebrow: "Privacidad",
    title: "Política de privacidad",
    description: "No recogemos datos que no necesitamos. Usamos lo que recogemos solo para lo dicho. No lo vendemos.",
    sections: [
      { title: "Datos que recogemos", description: "En el sitio activo: email, formulario de contacto y preferencias de cookies. Los datos previstos para un piloto pueden incluir movimiento, medidas ambientales, estado y ubicación aproximada; las categorías exactas se documentan antes de recogerlas." },
      { title: "Para qué los usamos", description: "Los datos actuales del sitio se usan para responder mensajes, gestionar solicitudes piloto y enviar comunicaciones consentidas. Los fines de futuros datos del dispositivo se definen en el acuerdo antes de recogerlos." },
      { title: "Con quién los compartimos", description: "Los formularios pueden pasar por el proveedor configurado. Procesadores, lugares de tratamiento, transferencias y conservación de futuros datos del dispositivo se definen antes del piloto. No vendemos datos personales." },
      { title: "Tus derechos", description: "Puedes acceder, corregir, borrar o exportar tus datos. Escribe a info@sismosmart.com." },
    ],
  },
  terms: {
    meta: { title: "Términos de uso", description: "Condiciones básicas para usar el sitio y la información previa al lanzamiento." },
    eyebrow: "Términos",
    title: "Términos de uso",
    description: "El sitio está antes del lanzamiento. Estos términos aplican a esta fase.",
    sections: [
      { title: "Informativo", description: "Este sitio informa sobre SismoSmart y acepta solicitudes piloto. No es un servicio sísmico oficial ni un canal de alerta." },
      { title: "No es garantía", description: "El dispositivo se está desarrollando para apoyar la preparación y revisión posterior al evento. No reemplaza alertas oficiales, instrucciones de emergencia ni reportes de ingeniería." },
      { title: "Propiedad intelectual", description: "El nombre, logo, diseño y contenido de SismoSmart pertenecen a SismoSmart. No pueden reproducirse sin permiso." },
      { title: "Contacto", description: "Preguntas a info@sismosmart.com." },
    ],
  },
  press: {
    meta: { title: "Kit de prensa", description: "Información, visuales y contacto para prensa." },
    eyebrow: "Prensa",
    title: "Kit de prensa",
    description: "Un recurso de una página para medios, socios y entrevistas.",
    sections: [
      { title: "Descripción breve", description: "SismoSmart desarrolla un dispositivo sísmico previo al lanzamiento para casas y edificios pequeños, diseñado para registrar movimiento y apoyar la revisión posterior por profesionales. La validación piloto, la certificación y la fabricación determinarán el calendario." },
      { title: "Contacto de prensa", description: "Para entrevistas, imágenes o demo: press@sismosmart.com." },
    ],
    links: [
      { title: "Logo", description: "Logo SVG vectorial", href: "/logo-symbol.svg" },
      { title: "Imagen de producto", description: "Render de alta resolución", href: "/images/device/sismosmart-device-front.png" },
      { title: "Imagen social", description: "Tarjeta 1200x630", href: "/images/og/sismosmart-og.png" },
    ],
  },
};
