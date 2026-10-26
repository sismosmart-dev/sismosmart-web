import type { SiteCopy } from "@/lib/site";

export const ptCopy: SiteCopy = {
  accessibility: { skipToContent: "Ir para o conteúdo" },
  meta: {
    title: "Monitoramento sísmico para seu prédio",
    description:
      "SismoSmart é um monitor sísmico de edifícios em pré-lançamento, projetado para registrar movimento durante um tremor e fornecer dados para revisão posterior por profissionais qualificados.",
  },
  navigation: {
    eyebrow: "Monitoramento sísmico para prédios",
    primaryCta: "Inscrição piloto",
    links: [
      { label: "Tecnologia", href: "/technology" },
      { label: "Produto", href: "/product" },
      { label: "Piloto", href: "/pilot-program" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  hero: {
    badge: "Startup de hardware em fase inicial",
    title: "Estamos desenvolvendo um dispositivo que mede como seu prédio se move em um terremoto.",
    description:
      "SismoSmart é um dispositivo de parede em pré-lançamento, projetado para medir e registrar o movimento do prédio. Detecção, notificações, conectividade e desempenho ainda dependem de validação piloto.",
    primaryCta: "Inscrever no piloto",
    secondaryCta: "Resumo para investidores",
    tertiaryCta: "Ver a tecnologia",
    primaryHref: "/pilot-program",
    secondaryHref: "/investors",
    tertiaryHref: "/technology",
    stats: [
      { label: "Montagem", value: "Fixo na parede" },
      { label: "Detecção", value: "No dispositivo" },
      { label: "Meta de amostragem", value: "250 Hz, 3 eixos" },
      { label: "Meta de energia", value: "30-60 s supercap" },
    ],
    deviceEyebrow: "O dispositivo SismoSmart",
    deviceTitle: "Um dispositivo de 100 × 100 mm que se fixa na parede e funciona na tomada",
    deviceDescription:
      "Você cola na parede, liga na tomada, pareia pelo app e passa o Wi-Fi. Depois ele trabalha sozinho: mede a vibração do prédio sem atrapalhar o dia a dia. Os recursos abaixo ainda estão em fase de projeto.",
    deviceSpecs: ["Medição em três eixos", "Registro local de eventos no dispositivo", "Criptografia dos dados do dispositivo"],
    meterTopLabel: "Detecção",
    meterTopValue: "Validação pendente",
    meterBottomLabel: "Dados",
    meterBottomValue: "Criptografia prevista",
    imageAlt: "Dispositivo SismoSmart de monitoramento sísmico com LED de status",
  },
  trust: {
    eyebrow: "Onde estamos",
    title: "Há coisas que este dispositivo não faz.",
    description:
      "SismoSmart ainda está em fase piloto. O que ele faz é registrar o que acontece dentro do seu prédio e transformar isso num dado que você possa revisar depois. Não competimos com os sistemas oficiais de alerta nem com a inspeção estrutural que vem depois do terremoto. Os dois continuam no lugar deles. Nós cobrimos o vão que sobra entre eles.",
    items: [
      { label: "Fase", value: "Piloto" },
      { label: "Tarefa principal", value: "Registrar movimento" },
      { label: "Decisão estrutural", value: "Fica com o engenheiro" },
    ],
  },
  howItWorks: {
    eyebrow: "Como funciona",
    title: "A instalação leva alguns minutos e o resto corre em segundo plano.",
    description:
      "A calibração piloto busca aprender o perfil de vibração normal do prédio e testar se movimentos incomuns podem ser separados do ruído cotidiano. Falsos positivos e eventos perdidos continuam possíveis.",
    steps: [
      { title: "Instale na parede", description: "Escolha uma parede interna estável. A fita adesiva já vem colada e há furos para parafuso se você preferir fixar melhor." },
      { title: "Pareie pelo app", description: "O app encontra o dispositivo por Bluetooth. Você digita a senha do Wi-Fi uma vez e acabou." },
      { title: "Ele aprende o prédio", description: "A calibração piloto busca montar uma linha de base a partir das vibrações do dia a dia, como tráfego e vento. O método ainda precisa de evidência de campo antes de ser descrito como confiável." },
      { title: "Notifica quando o tremor começa", description: "O projeto pode emitir uma notificação após a detecção local. O tempo da notificação e a lógica de confirmação entre dispositivos ainda dependem de validação piloto." },
      { title: "Registra o evento", description: "O projeto inclui armazenamento local do evento e envio para a nuvem quando há conectividade. O fluxo completo precisa ser validado em piloto antes de ser tratado como capacidade implantada." },
      { title: "Mais dispositivos, melhor resultado", description: "Vários dispositivos podem fornecer evidência útil sobre o movimento relativo entre andares e a correlação de eventos. A precisão e o efeito sobre falsos alarmes ainda precisam de validação piloto." },
    ],
  },
  features: {
    eyebrow: "O que faz",
    title: "Na verdade ele faz várias tarefas diferentes ao mesmo tempo.",
    description:
      "O produto está sendo projetado em torno do registro de eventos e de evidências de movimento do prédio ao longo do tempo. Notificações e interpretação estrutural são metas de validação, não resultados garantidos.",
    items: [
      { accent: "01", title: "Meta de detecção", description: "O projeto atual mira um sensor MEMS classe ADXL355 e amostragem de três eixos a 250 Hz. Alegações de detecção e desempenho exigem evidência de bancada e piloto." },
      { accent: "02", title: "Meta de notificação", description: "O comportamento de notificação ainda é uma meta de validação piloto. A SismoSmart não é serviço de emergência nem sistema oficial de alerta; siga os alertas oficiais." },
      { accent: "03", title: "Evidência estrutural", description: "Uma mudança nas características de vibração medidas pode dar evidência adicional a um engenheiro. Não é diagnóstico e não determina se um prédio é seguro." },
      { accent: "04", title: "Gera relatório após o terremoto", description: "O relatório pós-evento planejado busca resumir o movimento medido para revisão qualificada. Os campos do relatório e sua interpretação continuam sujeitos à validação piloto." },
      { accent: "05", title: "Lê temperatura e umidade", description: "A medição ambiental é uma meta de projeto para ajudar a separar efeitos sazonais de outras mudanças. Por si só, ela não identifica danos." },
      { accent: "06", title: "Correlação entre dispositivos", description: "A correlação entre vários dispositivos é uma meta de projeto. O efeito sobre tempo de confirmação e falsos alarmes ainda não foi demonstrado em piloto." },
    ],
  },
  demo: {
    eyebrow: "Fluxo de dados",
    title: "A medição começa no dispositivo e termina no seu celular.",
    description:
      "O projeto atual mede localmente e pretende transferir dados do dispositivo com segurança quando houver conectividade. Segurança do dispositivo, relatórios e tendências ainda aguardam validação piloto.",
    previewLabel: "Registro do prédio",
    networkLabel: "Rede do bairro",
    sensorLabel: "Dispositivo",
    sensorValue: "Ativo",
    eventLabel: "Último evento",
    eventValue: "Registrado, revisável",
    bullets: [
      "O projeto atual mira um sensor classe ADXL355, amostragem de três eixos a 250 Hz e uma meta de ruído documentada; o desempenho final exige BOM congelada e testes de bancada.",
      "Você consegue ver os dados de vibração do seu prédio sem entregar informação pessoal.",
      "O dispositivo não decide no lugar do engenheiro. Ele dá ao engenheiro dados melhores.",
    ],
    cta: "Ver a tecnologia",
    ctaHref: "/technology",
  },
  proof: {
    eyebrow: "Caminho piloto",
    title: "Queremos testar primeiro em alguns prédios de verdade.",
    description:
      "Antes de escalar o produto, queremos vê-lo em campo. O retorno dos primeiros pilotos vai definir como fica o dispositivo final. Por enquanto conversamos com três grupos.",
    cards: [
      { title: "Apartamentos", description: "Quantidade de dispositivos, duração, propriedade e condições comerciais são acordadas caso a caso. Esta página não promete hardware gratuito nem prazo fixo.", highlight: "Condições acordadas" },
      { title: "Campi e fábricas", description: "Locais com mais de um prédio. Um dispositivo por prédio, todos visíveis num único painel.", highlight: "Corporativo" },
      { title: "Universidades", description: "Acesso de pesquisa exigiria termos explícitos, controles de privacidade e acordo separado de compartilhamento de dados. Não é o fluxo padrão.", highlight: "Colaboração acadêmica" },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Perguntas frequentes",
    description: "Se sua pergunta está aqui, a resposta também. Se não estiver, escreva para info@sismosmart.com que respondemos. A lista completa fica na página de FAQ.",
    items: [
      { title: "O dispositivo avisa antes de um terremoto?", description: "Não. A SismoSmart não é um serviço de alerta precoce e não promete aviso antecipado. O piloto pode avaliar notificações de baixa latência após a detecção local; para emergências, siga alertas oficiais." },
      { title: "Qual a diferença para os alertas do Google?", description: "O Google usa o acelerômetro dos celulares. É grátis, já está em todo mundo e funciona bem. Mas o que ele mede é a origem do terremoto, não o seu prédio. Nós fazemos o contrário: como seu prédio vibra, como isso muda com a estação e em que estado ele fica depois do terremoto. Um celular não responde a essas perguntas." },
      { title: "Um dispositivo diz se meu prédio é seguro?", description: "Não diz. Quem declara um prédio seguro ou inseguro é um engenheiro, não um aparelho. O que o dispositivo faz é deixar para esse engenheiro algo concreto com que trabalhar." },
      { title: "A instalação é difícil?", description: "Você liga o cabo USB-C na tomada, cola o dispositivo na parede com o adesivo de trás e pareia pelo app. Sem furadeira e sem técnico. Cinco minutos." },
      { title: "E se faltar energia ou internet?", description: "O projeto atual mira armazenamento local durante queda de rede e uma ponte curta de supercapacitor durante falta de energia. A duração exata e o envio ponta a ponta ainda dependem de validação." },
      { title: "Quando entra à venda?", description: "Ainda não há uma data pública firme de venda. A SismoSmart segue em pré-lançamento; evidência piloto, prontidão do hardware, certificação e fabricação definirão o calendário." },
    ],
  },
  newsletter: {
    eyebrow: "Fale conosco",
    title: "Vamos conversar antes do lançamento.",
    description:
      "Se você é um síndico que quer um piloto, um investidor ou alguém de uma organização parceira, conte rapidamente o que procura. A gente direciona para a pessoa certa.",
    inputLabel: "Email",
    placeholder: "voce@empresa.com",
    button: "Enviar",
    consent: "Aceito receber emails sobre lançamento, pilotos e notícias para investidores da SismoSmart.",
    note: "Usamos seu email só para isso.",
    loading: "Enviando...",
    success: "Sua mensagem chegou. Retornamos em breve.",
    error: "Algo deu errado. Tente novamente.",
    missingEndpoint: "O formulário ainda não está conectado. Você pode escrever para info@sismosmart.com.",
    rateLimited:
      "Tentativas demais. Tente de novo daqui a alguns minutos.",
  },
  footer: {
    legal: "SismoSmart. Todos os direitos reservados.",
  },
};
