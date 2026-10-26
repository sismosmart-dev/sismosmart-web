import { makeExtraPages } from "@/lib/page-content/extra-pages/shared";

export const esExtraPages = makeExtraPages({
  technology: {
    eyebrow: "Tecnología",
    metaTitle: "Tecnología: cómo mide SismoSmart",
    metaDescription:
      "Resumen técnico previo al lanzamiento: objetivos de diseño para sensores, registro de eventos y análisis; detección y rendimiento siguen sujetos a validación piloto.",
    title: "Qué hay dentro del dispositivo y cómo te llega el dato",
    description:
      "SismoSmart es un sistema de medición previo al lanzamiento. Esta página describe los objetivos de diseño actuales para detección, registro de eventos e informes, y los separa de las capacidades que aún necesitan evidencia piloto.",
    sections: [
      ["Acelerómetro MEMS", "El diseño actual apunta a un sensor MEMS de clase ADXL355, muestreo triaxial a 250 Hz y un objetivo de ruido documentado. La selección final y las afirmaciones de rendimiento requieren una lista de materiales (BOM) congelada y pruebas de banco."],
      ["Detección STA/LTA", "El dispositivo compara el promedio del último medio segundo con el de los últimos treinta segundos. Cuando esa razón salta de golpe, se marca un posible evento. El método se llama STA/LTA y es un estándar en sismología. La calibración piloto busca separar el ruido habitual del edificio de una sacudida, pero puede haber falsos positivos o eventos no detectados hasta completar la validación de campo."],
      ["Búfer local de eventos", "El almacenamiento local de un evento durante una pérdida de conectividad es un objetivo de diseño. La duración del búfer y la recuperación del envío siguen sujetos a validación piloto de extremo a extremo."],
      ["Confirmación en la nube", "La correlación entre varios dispositivos es un objetivo de diseño. La ventana de disparo, la regla de confirmación y cualquier efecto sobre falsas alarmas deben demostrarse con datos piloto etiquetados."],
      ["Seguimiento de salud estructural", "Los cambios en características de vibración medidas pueden aportar evidencia adicional a un ingeniero. El método sigue en validación y no diagnostica daños ni determina si un edificio es seguro."],
      ["Informe para el ingeniero", "El informe previsto puede resumir movimiento medido con magnitudes estándar de ingeniería. Campos, incertidumbre e interpretación siguen sujetos a validación piloto y revisión profesional."],
      ["Conectividad", "La arquitectura actual apunta a Wi-Fi para el primer dispositivo. La conectividad celular o LoRa pertenece a la hoja de ruta y no se presenta como capacidad desplegada."],
      ["Energía", "El diseño de hardware apunta a alimentación USB-C y a un puente corto con supercondensador. La duración y el comportamiento de envío durante cortes requieren pruebas de banco y piloto."],
      ["Certificación", "La certificación está planificada, no completada. CE/RED, BTK, RoHS, WEEE, FCC u otras aprobaciones solo se afirmarán cuando exista documentación para el modelo y mercado correspondientes."],
    ],
  },
  pilotProgram: {
    eyebrow: "Programa piloto",
    metaTitle: "Solicitud del programa piloto",
    metaDescription:
      "Solicitudes piloto para apartamentos, campus, fábricas y edificios de investigación. Alcance, número de dispositivos, duración y condiciones se acuerdan caso por caso.",
    title: "Queremos ver el dispositivo primero en tu edificio.",
    description:
      "El producto aún no está en venta amplia. Lo que buscamos en esta etapa son pocos sitios serios y gente que nos diga qué no funciona. Si encajas en uno de los cuatro grupos de abajo, el formulario al pie es la entrada.",
    sections: [
      ["Apartamentos", "Empezamos con un dispositivo en una vivienda. Si la administración se suma, añadimos equipos en otros pisos. Ayudamos con la instalación y con la coordinación con la administración."],
      ["Campus y fábricas", "Varios edificios, un único panel central. Cada edificio guarda su propio registro. Antes de instalar repasamos la topología de red y los requisitos de seguridad con tu equipo de TI."],
      ["Pilotos municipales", "Despliegues a escala de barrio que muestran dónde se sintió con más fuerza el mismo terremoto. Los datos personales quedan completamente fuera de este flujo. Solo se comparte el agregado por edificio o por ubicación."],
      ["Socios de investigación", "Departamentos universitarios de ingeniería sísmica. Los datos crudos podrían abrirse al análisis académico a cambio de comentarios y de la opción de una publicación conjunta, pero solo con un acuerdo de confidencialidad y uso de datos. Ese flujo todavía no existe."],
      ["Lo que ofrecemos", "El alcance piloto se acuerda caso por caso. Número de dispositivos, duración, propiedad, soporte y condiciones comerciales se fijan en el acuerdo y no se prometen en esta página."],
      ["Lo que pedimos a cambio", "Que coordines la instalación con la administración o el personal del edificio. Hacemos una llamada de seguimiento de unos quince minutos al mes. Si ocurre un evento, te pedimos una nota breve. Al final nos gustaría publicar un caso de estudio corto, y con gusto dejamos tu nombre fuera."],
      ["De la solicitud a la instalación", "Las solicitudes se revisan junto con las condiciones del edificio, acceso, red, privacidad y seguridad. Plazos, contrato, envío e instalación dependen del piloto seleccionado y se confirman directamente."],
    ],
  },
  investors: {
    eyebrow: "Inversores",
    metaTitle: "Inversores: resumen de la ronda semilla",
    metaDescription:
      "Resumen cualitativo para inversores antes del lanzamiento. Financiación, precios, hoja de ruta y supuestos comerciales actuales se comparten directamente porque pueden cambiar.",
    title: "Hay una ventana después del terremoto que nadie mide.",
    description:
      "Tras un terremoto fuerte en Türkiye, la inspección estructural tarda semanas. En esas semanas las familias adivinan, los negocios se paran y los seguros se atascan. SismoSmart es una startup de hardware que intenta cerrar esa ventana con los datos del propio edificio.",
    sections: [
      ["Problema", "Los grandes terremotos pueden generar colas de inspección. SismoSmart investiga si los datos fijos de movimiento del edificio pueden aportar evidencia adicional para priorizar; no sustituye la inspección ni decide la seguridad."],
      ["Por qué ahora", "Los sensores MEMS y el hardware conectado hacen más práctico el monitoreo fijo de menor coste. La economía de componentes y el rendimiento final siguen siendo supuestos hasta congelar el diseño."],
      ["Mercado", "El foco comercial inicial es Türkiye. La expansión posterior depende de demanda validada, certificación, fabricación y socios locales; esta página no publica una cifra de mercado no auditada como hecho actual."],
      ["Producto", "Variantes de hardware, precios, suscripciones y economía unitaria siguen siendo supuestos de planificación. Las condiciones actuales y el modelo financiero se comparten directamente con inversores cualificados."],
      ["Equipo", "El proyecto combina producto y software con aportes de ingeniería civil y sísmica. La composición del equipo y las relaciones de asesoría pueden cambiar; el material de diligencia actual se comparte directamente."],
      ["Competencia", "El panorama incluye alertas oficiales, alertas móviles, instrumentación profesional y otros productos de monitoreo. La hipótesis de SismoSmart es medición fija del edificio y evidencia posterior al evento; la diferenciación requiere validación."],
      ["Hoja de ruta", "La secuencia activa es validación piloto, refinamiento de hardware y software, revisión de evidencia, preparación de certificación y fabricación, y lanzamiento solo cuando se cumplan esos hitos. No hay un trimestre comprometido."],
      ["Ronda semilla", "Importe, autonomía de caja, asignación y supuestos de ayudas o créditos son datos de planificación fechados. Las condiciones actuales de financiación se comparten directamente y no deben inferirse de una cifra pública antigua."],
      ["A quién buscamos", "Inversores ángel y fondos semilla que hayan visto antes una startup de hardware. Los socios con acceso a la regulación, la fabricación y las redes de seguros en Türkiye valen más para nosotros que el dinero rápido. Compartimos la documentación técnica detallada y el modelo financiero bajo acuerdo de confidencialidad."],
    ],
  },
  faq: {
    eyebrow: "FAQ",
    metaTitle: "Preguntas frecuentes",
    metaDescription:
      "Respuestas directas sobre alertas, seguridad del edificio, datos, privacidad, instalación y fechas de lanzamiento.",
    title: "Preguntas frecuentes",
    description:
      "Los productos de terremotos se prometen de más con facilidad. Nosotros intentamos dejar los límites del dispositivo a la vista. Si tu pregunta no está respondida aquí, escribe a info@sismosmart.com.",
    sections: [
      ["¿Este dispositivo me avisará antes del terremoto?", "No. SismoSmart no es un servicio de alerta temprana y no promete aviso previo. El piloto puede evaluar notificaciones de baja latencia después de la detección local; para emergencias, sigue alertas oficiales."],
      ["¿Un solo dispositivo puede decirme si mi edificio es seguro?", "No puede. Quien declara un edificio seguro o inseguro es un ingeniero, no un aparato. Lo que hace el dispositivo es dejarle a ese ingeniero algo sólido con lo que trabajar."],
      ["¿Qué datos recogen?", "Lecturas de vibración, temperatura, humedad, presión y el estado de funcionamiento del propio dispositivo. No vinculamos información personal al dispositivo y no vendemos tus datos a nadie. La página de Privacidad tiene el detalle."],
      ["¿Se expone mi ubicación exacta?", "Conocemos la ubicación de tu dispositivo a nivel de barrio, porque la necesitamos para cruzar un evento con los dispositivos cercanos. Cualquier cosa más precisa solo se comparte con un acuerdo piloto explícito."],
      ["¿Pueden los investigadores acceder a mis datos?", "Solo una vez anonimizados y solo bajo un acuerdo separado contigo. Ese flujo todavía no existe; está en la hoja de ruta."],
      ["¿En qué se diferencia de las alertas de Google?", "Google usa el acelerómetro de los teléfonos. Es gratis, ya está en todos los móviles y funciona bien. Pero lo que mide es el origen del terremoto, no tu edificio. Nosotros hacemos lo contrario: cómo vibra tu edificio, cómo cambia con la estación y en qué estado queda después. Un teléfono no responde a eso."],
      ["¿Qué pasa cuando se cae internet?", "El búfer local durante una caída de red es un objetivo de diseño. Que un piloto conserve y reenvíe un evento depende del hardware, firmware y conectividad validados."],
      ["¿Y si se corta la luz?", "Un puente corto con supercondensador es un objetivo de hardware. Duración exacta y finalización o envío del evento durante el corte requieren evidencia de banco y piloto."],
      ["¿Es difícil instalarlo?", "Enchufas el cable USB-C, pegas el dispositivo a la pared con el adhesivo de atrás y lo emparejas desde la app. Sin taladro y sin técnico. Cinco minutos."],
      ["¿Cuántos debería tener un edificio?", "No hay un número universal validado. La colocación depende del edificio, del objetivo de medición y de la revisión de ingeniería; los esquemas con varios dispositivos se evalúan caso por caso."],
      ["¿Qué significan PGA, PGV y MMI?", "PGA, PGV y la intensidad Modified Mercalli son conceptos estándar. Un futuro informe de SismoSmart solo usará magnitudes medidas o derivadas cuando método e incertidumbre estén validados."],
      ["¿Qué dice la frecuencia natural?", "Un edificio tiene características de vibración medibles, incluidas frecuencias naturales. Los cambios pueden aportar evidencia a un ingeniero, pero no diagnostican daños ni seguridad por sí solos."],
      ["¿En qué dirección debe ir el dispositivo?", "Hay una flecha hacia arriba en la parte trasera; que apunte al techo. Intenta alinear los ejes X e Y del dispositivo con las direcciones horizontales del edificio. Montado a 90 grados los datos siguen sirviendo, aunque aportan algo menos de información."],
      ["¿El dispositivo graba sonido?", "No. No lleva micrófono, solo un acelerómetro que mide la vibración del suelo. Grabar voz o sonido ambiente exigiría un sensor completamente distinto."],
      ["¿Mis datos salen de Türkiye?", "La residencia de datos del piloto aún no es definitiva. Antes de recoger datos del dispositivo, cada acuerdo indicará lugares de tratamiento, transferencias, conservación y base jurídica aplicable."],
      ["¿Cuándo sale a la venta?", "No hay una fecha pública firme de venta. SismoSmart sigue en pre-lanzamiento; evidencia piloto, madurez del hardware, certificación y fabricación determinarán el calendario."],
    ],
  },
  security: {
    eyebrow: "Seguridad",
    metaTitle: "Seguridad",
    metaDescription:
      "Cómo manejamos la seguridad del sitio, el consentimiento, los datos del dispositivo, el transporte cifrado y la privacidad durante la fase piloto.",
    title: "El dato que nunca recoges es el dato que no puedes filtrar.",
    description:
      "Esa es nuestra regla básica. Ahora mismo lo único en producción es el sitio web, pero el lado del dispositivo lo construimos con la misma regla.",
    sections: [
      ["Mínimo dato por defecto", "El sitio web en vivo recoge actualmente solo los datos descritos en Privacidad. La telemetría futura del dispositivo sigue siendo un área de diseño de producto y política que se documentará antes del piloto."],
      ["Consentimiento antes de la analítica", "La analítica web se carga solo después de que des tu consentimiento. Puedes revertir esa elección cuando quieras desde el enlace del pie de página."],
      ["Transporte cifrado", "El sitio web usa actualmente HTTPS y cabeceras de seguridad. El cifrado del dispositivo y el ciclo de vida de claves son objetivos de diseño hasta que el protocolo implementado sea revisado y validado."],
      ["Ningún secreto llega al navegador", "Las claves privadas y los tokens de servicio nunca aparecen en el código que llega al navegador. Se quedan en una configuración protegida del lado del servidor."],
      ["Reporte de vulnerabilidades", "Si encuentras un problema de seguridad en el sitio o en materiales previos al lanzamiento, escribe a info@sismosmart.com. Agradecemos a quienes divulgan de forma responsable."],
      ["Plan de seguridad del dispositivo", "Firmware firmado, almacenamiento cifrado, claves por dispositivo y actualizaciones con rollback son objetivos de seguridad, no capacidades desplegadas. Solo se publicarán como actuales con evidencia de implementación y revisión."],
    ],
  },
});
