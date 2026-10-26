import type { BaseRoutePagesCopy } from "@/lib/page-copy";

export const ptPages: BaseRoutePagesCopy = {
  product: {
    meta: {
      title: "O dispositivo SismoSmart",
      description:
        "Dispositivo sísmico em pré-lançamento para casas e prédios pequenos, projetado para registrar movimento; desempenho, conectividade e relatórios seguem sujeitos à validação piloto.",
    },
    eyebrow: "Produto",
    title: "O dispositivo",
    description:
      "Dispositivo de parede alimentado por USB-C em fase de pré-lançamento. Sensor, conexão, relatórios e desempenho ainda são metas de projeto.",
    deviceDescription:
      "A caixa piloto é pensada para montagem fixa na parede. Hardware e instruções finais serão confirmados com o dispositivo validado.",
    meterTopLabel: "Sensor",
    meterTopValue: "Meta MEMS",
    meterBottomLabel: "Dados",
    meterBottomValue: "Meta de segurança",
    imageAlt: "Dispositivo SismoSmart, vista frontal",
    specs: [
      { label: "Sensor", value: "Meta MEMS classe ADXL355" },
      { label: "Conexão", value: "Meta Wi-Fi + Bluetooth" },
      { label: "Instalação", value: "Meta de setup piloto" },
      { label: "Status", value: "Meta LED RGB + app" },
    ],
    useCases: [
      { title: "Casas e apartamentos", description: "Locais candidatos a piloto para medição fixa; a posição é definida por prédio." },
      { title: "Campi e fábricas", description: "Pilotos multi-prédio podem avaliar visibilidade centralizada depois que o fluxo for validado." },
      { title: "Oficinas e escritórios", description: "O uso em prédios pequenos é hipótese de piloto, não implantação comercial validada." },
      { title: "Parcerias universitárias", description: "Acesso de pesquisa exige acordos explícitos, controles de privacidade e objetivo definido de compartilhamento." },
    ],
    comparisonTitle: "Como se compara",
    comparisonDescription:
      "A SismoSmart é projetada como dispositivo fixo entre sensores de celular e instrumentação profissional. Sensibilidade, relatórios e custo ainda são premissas de validação ou comerciais.",
    comparisonRows: [
      { label: "Instalação", sismosmart: "Processo piloto", traditional: "Instalação profissional varia", mobile: "Configuração de app" },
      { label: "Dispositivo fixo", sismosmart: "Meta: preso ao prédio", traditional: "Sim", mobile: "Não, o celular se move" },
      { label: "Interpretação estrutural", sismosmart: "Validação pendente", traditional: "Fluxo de especialista", mobile: "Não avalia o prédio" },
      { label: "Preço", sismosmart: "Pré-lançamento; sem preço público", traditional: "Preço de sistema profissional", mobile: "Muitas vezes grátis" },
    ],
    ctaLabel: "Candidatar-se ao piloto",
    ctaHref: "/pilot-program",
  },
  howItWorks: {
    meta: {
      title: "Como o SismoSmart funciona",
      description:
        "Projeto em pré-lançamento para medir movimento, guardar dados de eventos e preparar informação para validação piloto e revisão profissional.",
    },
    eyebrow: "Como funciona",
    title: "Dispositivo, cloud, app: juntos.",
    description:
      "O projeto atual combina medição local, um caminho de dados conectado e uma camada de app/relatório. Detecção, notificações, correlação e relatórios seguem em validação piloto.",
    flow: [
      { title: "Instale o dispositivo", description: "A posição piloto é escolhida numa superfície interna estável conforme o prédio e o objetivo de medição." },
      { title: "Pareie com o celular", description: "Bluetooth e Wi-Fi são metas de provisionamento; a segurança final depende de revisão da implementação." },
      { title: "Construa uma referência", description: "A calibração piloto busca registrar vibração cotidiana e testar a separação de movimentos incomuns." },
      { title: "Registre um evento", description: "O projeto mira captura local e visualização posterior em app/relatório; tempo e completude seguem em validação." },
    ],
    signals: [
      { title: "Detecção no dispositivo", description: "É uma meta de projeto. Limiares, falsos positivos, eventos perdidos e confiabilidade exigem evidência piloto rotulada." },
      { title: "Relatório pós-evento", description: "Um relatório futuro pode resumir grandezas validadas para revisão profissional. Não determina segurança." },
      { title: "Só os dados necessários", description: "O fluxo do site é documentado separadamente. Telemetria futura do dispositivo será definida antes da coleta piloto." },
    ],
    network: [
      { title: "Correlação entre dispositivos", description: "É uma meta de projeto; o efeito em confirmação e falsos alarmes ainda não foi demonstrado." },
      { title: "Evidência estrutural ao longo do tempo", description: "Mudanças medidas podem fornecer evidência adicional a engenheiros; não são diagnóstico." },
      { title: "Interface simples", description: "Uma visão clara de status é meta de produto; estados e limiares finais dependem da validação." },
    ],
  },
  about: {
    meta: {
      title: "Sobre",
      description:
        "Quem constrói o SismoSmart e por quê. O time, o ponto de vista, para onde vamos.",
    },
    eyebrow: "Sobre",
    title: "Vivemos na Turquia. Queremos prédios íntegros.",
    description:
      "Nos reunimos depois dos terremotos de Kahramanmaraş em 2023 e de tremores recentes ao redor de Istambul. Queríamos saber como nossas casas e a cidade reagem a terremotos. Então criamos o dispositivo.",
    story: [
      "Depois de um grande terremoto na Turquia, inspeções de prédios levam semanas, às vezes meses. Nesse período, famílias não sabem se podem voltar para casa.",
      "Não vamos eliminar essa espera por completo. No fim, um engenheiro precisa entrar no prédio. Mas antes de ele chegar, pode existir uma camada de dados que indique quais prédios convém examinar primeiro. É nisso que estamos trabalhando.",
      "Nosso time tem um consultor acadêmico em engenharia civil, dois pesquisadores MSc em engenharia civil e um fundador em embedded e software. Estamos todos na Turquia. Testamos o dispositivo nas nossas casas.",
    ],
    principles: [
      {
        title: "Informar sem assustar",
        description:
          "Nada de marketing do medo. O dispositivo cria preparo, não pânico.",
      },
      {
        title: "Ser claro sobre limites",
        description:
          "Vamos dizer abertamente o que não fazemos. Não somos um sistema oficial. Não substituímos o relatório de um engenheiro.",
      },
      {
        title: "Devolver os dados ao dono",
        description:
          "Os dados do seu prédio são seus. Agregados anônimos podem ajudar universidades ou governo. Dados pessoais não estão à venda.",
      },
    ],
    timeline: [
      { period: "Concluído", title: "Base de produto e sistema", description: "O conceito inicial e a arquitetura do sistema estão definidos. As alegações públicas continuam limitadas pelo registro de evidências." },
      { period: "Atual", title: "Validação piloto", description: "Hardware, detecção, notificações, conectividade e relatórios são validados antes de ampliar alegações." },
      { period: "Próximo", title: "Evidência e congelamento de projeto", description: "BOM, algoritmos e premissas operacionais só são congelados depois da revisão de evidência de bancada e campo." },
      { period: "Depois", title: "Certificação e fabricação", description: "Certificação, fabricação e lançamento vêm depois das etapas de evidência. Não há data pública comprometida." },
    ],
    team: [
      {
        name: "Fundador",
        role: "Hardware, software, produto",
        bio: "Responsável por sistemas embedded, IoT, cloud e produto.",
      },
      {
        name: "Consultor acadêmico",
        role: "Engenharia de terremotos",
        bio: "PhD em engenharia civil. Validação científica dos algoritmos estruturais.",
      },
      {
        name: "Engenheiros civis",
        role: "Estrutura e locais piloto",
        bio: "Dois pesquisadores MSc em engenharia civil. Lideram algoritmos do prédio e validação em campo.",
      },
    ],
  },
  contact: {
    meta: {
      title: "Contato",
      description:
        "Quer falar com a SismoSmart? Aqui está o canal certo. Produto, piloto, imprensa ou investidores.",
    },
    eyebrow: "Contato",
    title: "Escreva. Vamos responder.",
    description:
      "Neste momento, o canal mais rápido é email. Um assunto claro chega à pessoa certa.",
    channels: [
      {
        title: "Geral",
        description: "Perguntas sobre o produto, candidatura ao piloto, interesse de compra",
        value: "info@sismosmart.com",
        href: "mailto:info@sismosmart.com",
      },
      {
        title: "Imprensa",
        description: "Entrevistas, press kit, parceria",
        value: "press@sismosmart.com",
        href: "mailto:press@sismosmart.com",
      },
      {
        title: "LinkedIn",
        description: "Atualizações profissionais e notícias da empresa",
        value: "linkedin.com/company/sismosmart",
        href: "https://www.linkedin.com/company/sismosmart",
      },
    ],
    form: {
      nameLabel: "Seu nome",
      emailLabel: "Email",
      subjectLabel: "Assunto",
      messageLabel: "Sua mensagem",
      buttonLabel: "Enviar",
      consentLabel:
        "Concordo que estas informações sejam processadas para que vocês possam ler e responder minha mensagem.",
      note: "Usamos estas informações apenas para responder sua mensagem.",
      loadingLabel: "Enviando...",
      successMessage: "Sua mensagem foi enviada. Responderemos assim que possível.",
      errorMessage: "Algo deu errado. Tente novamente em breve.",
      missingEndpointMessage:
        "O formulário ainda não está conectado. Escreva para info@sismosmart.com.",
      rateLimitedMessage:
        "Tentativas demais. Tente de novo daqui a alguns minutos.",
    },
  },
  privacy: {
    meta: {
      title: "Privacidade",
      description:
        "Quais dados coletamos, por que usamos, com quem compartilhamos. Explicado sem rodeio.",
    },
    eyebrow: "Privacidade",
    title: "Política de privacidade",
    description:
      "Não coletamos dados que não precisamos. Usamos o que coletamos só para o que dissemos. Não vendemos.",
    sections: [
      {
        title: "Dados que coletamos",
        description:
          "No site ativo: email de inscrição, mensagens do formulário e escolhas de cookies. Dados planejados para um piloto podem incluir movimento, medições ambientais, status e localização aproximada; as categorias exatas são documentadas antes da coleta.",
      },
      {
        title: "Para que usamos",
        description:
          "Dados atuais do site são usados para responder mensagens, gerir candidaturas piloto e enviar comunicações consentidas. As finalidades de futuros dados do dispositivo são definidas no acordo antes da coleta.",
      },
      {
        title: "Com quem compartilhamos",
        description:
          "Envios de formulário podem passar pelo provedor configurado. Processadores, locais de tratamento, transferências e retenção de futuros dados do dispositivo são definidos antes do piloto. Não vendemos dados pessoais a terceiros.",
      },
      {
        title: "Seus direitos",
        description:
          "Você pode acessar, corrigir, excluir ou exportar seus dados. Para KVKK e GDPR, escreva para info@sismosmart.com.",
      },
    ],
  },
  terms: {
    meta: {
      title: "Termos de uso",
      description:
        "Termos básicos para usar o site e as informações pré-lançamento.",
    },
    eyebrow: "Termos",
    title: "Termos de uso",
    description: "O site está em pré-lançamento. Os termos abaixo valem para esta fase.",
    sections: [
      {
        title: "Informativo",
        description:
          "Este site informa sobre a SismoSmart e recebe candidaturas ao piloto. Não é um serviço sismológico oficial nem canal de alerta de terremoto.",
      },
      {
        title: "Não é garantia",
        description:
          "O dispositivo está sendo desenvolvido para apoiar preparação e revisão pós-evento. Não substitui sistemas oficiais, instruções de emergência ou relatório de engenheiro estrutural.",
      },
      {
        title: "Propriedade intelectual",
        description:
          "Nome, logo, design do produto e conteúdo do site pertencem à SismoSmart. Não podem ser reproduzidos sem permissão.",
      },
      {
        title: "Contato",
        description: "Perguntas para info@sismosmart.com.",
      },
    ],
  },
  press: {
    meta: {
      title: "Press kit",
      description: "Informações, imagens e contatos para imprensa.",
    },
    eyebrow: "Imprensa",
    title: "Press kit",
    description:
      "Uma página para mídia, organizações parceiras e pedidos de entrevista.",
    sections: [
      {
        title: "Descrição curta",
        description:
          "A SismoSmart desenvolve um dispositivo de monitoramento sísmico em pré-lançamento para casas e prédios pequenos, projetado para registrar movimento e apoiar revisão profissional pós-evento. Validação piloto, certificação e fabricação definirão o calendário.",
      },
      {
        title: "Contato de imprensa",
        description:
          "Para entrevistas, imagens de imprensa ou demos: press@sismosmart.com.",
      },
    ],
    links: [
      {
        title: "Logo",
        description: "Logo vetorial SVG",
        href: "/logo-symbol.svg",
      },
      {
        title: "Imagem do produto",
        description: "Render do dispositivo em alta resolução",
        href: "/images/device/sismosmart-device-front.png",
      },
      {
        title: "Imagem social",
        description: "Cartão de compartilhamento 1200x630",
        href: "/images/og/sismosmart-og.png",
      },
    ],
  },
};
