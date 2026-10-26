import type { SiteCopy } from "@/lib/site";

export const esCopy: SiteCopy = {
  accessibility: { skipToContent: "Ir al contenido" },
  meta: {
    title: "Monitoreo sísmico para tu edificio",
    description:
      "SismoSmart es un monitor sísmico de edificio previo al lanzamiento, diseñado para registrar movimiento durante una sacudida y aportar datos para la revisión posterior de profesionales cualificados.",
  },
  navigation: {
    eyebrow: "Monitoreo sísmico para edificios",
    primaryCta: "Solicitud piloto",
    links: [
      { label: "Tecnología", href: "/technology" },
      { label: "Producto", href: "/product" },
      { label: "Piloto", href: "/pilot-program" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  hero: {
    badge: "Startup de hardware en etapa temprana",
    title: "Estamos desarrollando un dispositivo que mide cómo se mueve tu edificio en un terremoto.",
    description:
      "SismoSmart es un dispositivo de pared previo al lanzamiento, diseñado para medir y registrar el movimiento del edificio. La detección, las notificaciones, la conectividad y el rendimiento siguen sujetos a validación piloto.",
    primaryCta: "Solicitar piloto",
    secondaryCta: "Resumen para inversores",
    tertiaryCta: "Ver la tecnología",
    primaryHref: "/pilot-program",
    secondaryHref: "/investors",
    tertiaryHref: "/technology",
    stats: [
      { label: "Montaje", value: "Fijo en pared" },
      { label: "Detección", value: "En el dispositivo" },
      { label: "Objetivo de muestreo", value: "250 Hz, 3 ejes" },
      { label: "Objetivo de energía", value: "30-60 s supercap" },
    ],
    deviceEyebrow: "El dispositivo SismoSmart",
    deviceTitle: "Un dispositivo de 100 × 100 mm que se fija a la pared y funciona desde el enchufe",
    deviceDescription:
      "Lo pegas a la pared, lo enchufas, lo emparejas desde la app y le das tu Wi-Fi. Después funciona solo: mide la vibración del edificio sin molestar en el día a día. Las funciones de abajo aún están en fase de diseño.",
    deviceSpecs: [
      "Medición en tres ejes",
      "Registro local de eventos en el dispositivo",
      "Cifrado de los datos del dispositivo",
    ],
    meterTopLabel: "Detección",
    meterTopValue: "Validación pendiente",
    meterBottomLabel: "Datos",
    meterBottomValue: "Cifrado previsto",
    imageAlt: "Dispositivo SismoSmart de monitoreo sísmico con LED de estado",
  },
  trust: {
    eyebrow: "Dónde estamos",
    title: "Hay cosas que este dispositivo no puede hacer.",
    description:
      "SismoSmart sigue en fase piloto. Lo que hace es registrar lo que pasa dentro de tu edificio y convertirlo en datos que puedas revisar después. No competimos con los sistemas oficiales de alerta ni con la inspección estructural posterior al terremoto. Ambos siguen en su sitio. Nosotros cubrimos el hueco que queda entre ellos.",
    items: [
      { label: "Etapa", value: "Piloto" },
      { label: "Trabajo principal", value: "Registrar movimiento" },
      { label: "Decisión estructural", value: "La tiene el ingeniero" },
    ],
  },
  howItWorks: {
    eyebrow: "Cómo funciona",
    title: "La instalación toma unos minutos y el resto ocurre en segundo plano.",
    description:
      "La calibración piloto busca aprender el perfil de vibración normal del edificio y probar si el movimiento inusual puede separarse del ruido cotidiano. Siguen siendo posibles falsos positivos y eventos no detectados.",
    steps: [
      { title: "Móntalo en una pared", description: "Elige una pared interior estable. La tira adhesiva ya viene puesta, y también hay orificios por si prefieres atornillarlo." },
      { title: "Empareja desde la app", description: "La app encuentra el dispositivo por Bluetooth. Escribes la clave del Wi-Fi una vez y ya está." },
      { title: "Aprende el edificio", description: "La calibración piloto busca construir una línea base con vibraciones cotidianas, como el tráfico y el viento. El método aún necesita evidencia de campo antes de poder describirse como fiable." },
      { title: "Notifica cuando empieza la sacudida", description: "El diseño puede emitir una notificación tras la detección local. El tiempo de aviso y la lógica de confirmación entre dispositivos siguen sujetos a validación piloto." },
      { title: "Registra el evento", description: "El diseño incluye almacenamiento local del evento y envío a la nube cuando hay conectividad. El flujo completo debe validarse en piloto antes de tratarlo como capacidad desplegada." },
      { title: "Más dispositivos, mejor resultado", description: "Varios equipos pueden aportar evidencia útil sobre el movimiento relativo entre pisos y la correlación de eventos. La precisión y el efecto sobre las falsas alarmas siguen necesitando validación piloto." },
    ],
  },
  features: {
    eyebrow: "Qué hace",
    title: "En realidad hace varios trabajos distintos a la vez.",
    description:
      "El producto se está diseñando alrededor del registro de eventos y de evidencia de movimiento del edificio a más largo plazo. Las notificaciones y la interpretación estructural son objetivos de validación, no resultados garantizados.",
    items: [
      { accent: "01", title: "Objetivo de detección", description: "El diseño actual apunta a un sensor MEMS de clase ADXL355 y muestreo triaxial a 250 Hz. Las afirmaciones de detección y rendimiento requieren evidencia de banco y de piloto." },
      { accent: "02", title: "Objetivo de notificación", description: "Las notificaciones siguen pendientes de validación piloto. SismoSmart no es un servicio de emergencia ni un sistema oficial de alerta; sigue siempre las alertas oficiales." },
      { accent: "03", title: "Evidencia estructural", description: "Un cambio en las características de vibración medidas puede aportar evidencia adicional a un ingeniero. No es un diagnóstico ni determina si un edificio es seguro." },
      { accent: "04", title: "Informa después del terremoto", description: "El informe posterior al evento que se planea busca resumir el movimiento medido para una revisión cualificada. Los campos del informe y su interpretación siguen sujetos a validación piloto." },
      { accent: "05", title: "Objetivo ambiental", description: "La medición ambiental es un objetivo de diseño para ayudar a separar efectos estacionales de otros cambios. Por sí sola no identifica daños." },
      { accent: "06", title: "Correlación entre dispositivos", description: "La correlación entre varios dispositivos es un objetivo de diseño. Su efecto sobre la confirmación y las falsas alarmas aún no está establecido con evidencia piloto." },
    ],
  },
  demo: {
    eyebrow: "Flujo de datos",
    title: "La medición empieza en el dispositivo y termina en tu teléfono.",
    description:
      "El diseño actual mide localmente y pretende transferir los datos del dispositivo de forma segura cuando haya conectividad. La seguridad del dispositivo, los informes y las tendencias siguen pendientes de validación.",
    previewLabel: "Registro del edificio",
    networkLabel: "Red de barrio",
    sensorLabel: "Dispositivo",
    sensorValue: "Activo",
    eventLabel: "Último evento",
    eventValue: "Registrado, revisable",
    bullets: [
      "El diseño actual apunta a un sensor de clase ADXL355, muestreo triaxial a 250 Hz y un objetivo de ruido documentado; el rendimiento final requiere una lista de materiales (BOM) congelada y pruebas de banco.",
      "Puedes ver los datos de vibración de tu edificio sin entregar información personal.",
      "El dispositivo no decide por el ingeniero. Le da mejores datos.",
    ],
    cta: "Ver la tecnología",
    ctaHref: "/technology",
  },
  proof: {
    eyebrow: "Camino piloto",
    title: "Queremos probarlo primero en unos pocos edificios reales.",
    description:
      "Antes de escalar el producto queremos verlo en campo. El feedback de los primeros pilotos decidirá cómo queda el dispositivo final. Por ahora hablamos con tres grupos.",
    cards: [
      { title: "Apartamentos", description: "El número de dispositivos, la duración, la propiedad y las condiciones comerciales se acuerdan caso por caso. Esta página no promete hardware gratuito ni un plazo fijo.", highlight: "Condiciones por acuerdo" },
      { title: "Campus y fábricas", description: "Instalaciones con más de un edificio. Un dispositivo por edificio, todos visibles desde un único panel.", highlight: "Empresarial" },
      { title: "Universidades", description: "El acceso para investigación requeriría condiciones explícitas, controles de privacidad y un acuerdo de intercambio de datos. No es el flujo predeterminado.", highlight: "Colaboración académica" },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Preguntas frecuentes",
    description: "Si tu pregunta está aquí, la respuesta también. Si no, escribe a info@sismosmart.com y te respondemos. La lista completa está en la página de FAQ.",
    items: [
      { title: "¿Me avisará antes de un terremoto?", description: "No. SismoSmart no es un servicio de alerta temprana y no promete aviso previo. El piloto puede evaluar notificaciones de baja latencia después de la detección local; para emergencias, sigue las alertas oficiales." },
      { title: "¿En qué se diferencia de las alertas de Google?", description: "Google usa el acelerómetro de los teléfonos. Es gratis, ya está en todos los móviles y funciona bien. Pero lo que mide es el origen del terremoto, no tu edificio. Nosotros hacemos lo contrario: cómo vibra tu edificio, cómo cambia con la estación y en qué estado queda después. Un teléfono no responde eso." },
      { title: "¿Un dispositivo dice si mi edificio es seguro?", description: "No puede. Quien declara un edificio seguro o inseguro es un ingeniero, no un aparato. Lo que hace el dispositivo es dejarle a ese ingeniero algo sólido con lo que trabajar." },
      { title: "¿Es difícil instalarlo?", description: "Enchufas el cable USB-C, pegas el dispositivo a la pared con el adhesivo de atrás y lo emparejas desde la app. Sin taladro y sin técnico. Cinco minutos." },
      { title: "¿Qué pasa si se corta la luz o internet?", description: "El diseño actual apunta a almacenamiento local durante una caída de red y a un puente corto con supercondensador durante un corte eléctrico. La duración exacta y el envío de extremo a extremo siguen sujetos a validación." },
      { title: "¿Cuándo sale a la venta?", description: "No hay una fecha pública firme de venta. SismoSmart sigue antes del lanzamiento; la evidencia piloto, la preparación del hardware, la certificación y la fabricación determinarán el calendario." },
    ],
  },
  newsletter: {
    eyebrow: "Contáctanos",
    title: "Hablemos antes del lanzamiento.",
    description:
      "Si eres una administración de edificio que quiere un piloto, un inversor o alguien de una organización socia, cuéntanos brevemente qué buscas. Te ponemos con la persona correcta.",
    inputLabel: "Email",
    placeholder: "tu@empresa.com",
    button: "Enviar",
    consent: "Acepto recibir emails sobre lanzamiento, pilotos e inversores de SismoSmart.",
    note: "Usamos tu email solo para este propósito.",
    loading: "Enviando...",
    success: "Tu mensaje nos llegó. Te respondemos pronto.",
    error: "Algo salió mal. Inténtalo de nuevo.",
    missingEndpoint: "El formulario aún no está conectado. Puedes escribir a info@sismosmart.com.",
    rateLimited:
      "Demasiados intentos. Inténtalo de nuevo en unos minutos.",
  },
  footer: {
    legal: "SismoSmart. Todos los derechos reservados.",
  },
};
