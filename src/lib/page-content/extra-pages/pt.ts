import { makeExtraPages } from "@/lib/page-content/extra-pages/shared";

export const ptExtraPages = makeExtraPages({
  technology: {
    eyebrow: "Tecnologia",
    metaTitle: "Tecnologia: como o SismoSmart mede",
    metaDescription:
      "Resumo técnico de pré-lançamento sobre metas de projeto para sensores, registro de eventos e análise; detecção e desempenho seguem sujeitos à validação piloto.",
    title: "O que tem dentro do dispositivo e como o dado chega até você",
    description:
      "O SismoSmart é um sistema de medição em pré-lançamento. Esta página descreve as metas de projeto atuais para detecção, registro de eventos e relatórios, e as separa de capacidades que ainda precisam de evidência piloto.",
    sections: [
      ["Acelerômetro MEMS", "O projeto atual mira um sensor MEMS classe ADXL355, amostragem de três eixos a 250 Hz e uma meta de ruído documentada. Seleção final e alegações de desempenho exigem lista de materiais (BOM) congelada e evidência de bancada."],
      ["Detecção STA/LTA", "O dispositivo compara a média do último meio segundo com a média dos últimos trinta segundos. Quando essa razão dispara de repente, um possível evento é sinalizado. O método se chama STA/LTA e é padrão em sismologia. A calibração piloto busca separar o ruído comum do prédio de uma vibração, mas falsos positivos ou eventos não detectados continuam possíveis até a validação de campo."],
      ["Buffer local de eventos", "Buffer local durante perda de conectividade é uma meta de projeto. Duração e recuperação do envio ainda dependem de validação piloto ponta a ponta."],
      ["Confirmação na nuvem", "Correlação entre vários dispositivos é uma meta de projeto. Janela de disparo, regra de confirmação e efeito sobre falsos alarmes precisam ser demonstrados com dados piloto rotulados."],
      ["Acompanhamento de saúde estrutural", "Mudanças em características de vibração medidas podem dar evidência adicional a engenheiros. O método está em validação e não diagnostica dano nem determina se um prédio é seguro."],
      ["Relatório para o engenheiro", "O relatório planejado pode resumir movimento medido com grandezas padrão de engenharia. Campos, incerteza e interpretação continuam sujeitos a validação piloto e revisão profissional."],
      ["Conectividade", "A arquitetura atual mira Wi-Fi para o dispositivo inicial. Conexão celular ou LoRa fica no roteiro e não é apresentada como capacidade já implantada."],
      ["Energia", "O projeto de hardware mira alimentação USB-C e uma ponte curta de supercapacitor. Duração e comportamento de envio durante queda exigem evidência de bancada e piloto."],
      ["Certificação", "A certificação é planejada, não concluída. CE/RED, BTK, RoHS, WEEE, FCC ou outras aprovações só serão afirmadas quando houver documentação para o modelo e mercado relevantes."],
    ],
  },
  pilotProgram: {
    eyebrow: "Programa piloto",
    metaTitle: "Inscrição no programa piloto",
    metaDescription:
      "Inscrições para piloto em apartamentos, campi, fábricas e prédios de pesquisa. Escopo, quantidade de dispositivos, duração e condições comerciais são definidos caso a caso.",
    title: "Queremos ver o dispositivo primeiro no seu prédio.",
    description:
      "O produto ainda não está em venda ampla. O que buscamos nesta fase são poucos locais sérios e gente disposta a dizer o que não funciona. Se você se encaixa em um dos quatro grupos abaixo, o formulário no fim é a porta de entrada.",
    sections: [
      ["Apartamentos", "Começamos com um dispositivo em uma unidade. Se a administração entrar junto, acrescentamos dispositivos em outros andares. Ajudamos na instalação e na coordenação com o síndico."],
      ["Campi e fábricas", "Vários prédios, um único painel central. Cada prédio guarda o próprio registro. Antes de instalar, revisamos a topologia de rede e os requisitos de segurança com o seu time de TI."],
      ["Pilotos municipais", "Implantações em escala de bairro que mostram em qual região o mesmo terremoto foi sentido com mais força. Dados pessoais ficam totalmente fora desse fluxo. Só o agregado por prédio ou por local é compartilhado."],
      ["Parceiros de pesquisa", "Departamentos universitários de engenharia sísmica. Os dados brutos poderiam ser abertos à análise acadêmica em troca de comentários e da chance de uma publicação conjunta, mas só com acordo de confidencialidade e de compartilhamento de dados. Esse fluxo ainda não existe."],
      ["O que oferecemos", "O escopo do piloto é definido caso a caso. Quantidade, duração, propriedade, suporte e condições comerciais ficam no acordo do piloto e não são prometidos nesta página."],
      ["O que pedimos em troca", "Que você coordene a instalação com a administração ou a equipe do prédio. Fazemos uma chamada de feedback de uns quinze minutos por mês. Se acontecer um evento, pedimos uma nota curta. No fim gostaríamos de publicar um pequeno estudo de caso, e de bom grado deixamos seu nome de fora."],
      ["Da inscrição à instalação", "As inscrições são avaliadas com as condições do prédio, acesso, rede, privacidade e segurança. Prazos, contrato, envio e instalação dependem do piloto selecionado e são confirmados diretamente."],
    ],
  },
  investors: {
    eyebrow: "Investidores",
    metaTitle: "Investidores: resumo da rodada inicial",
    metaDescription:
      "Resumo qualitativo para investidores em pré-lançamento. Financiamento, preços, roteiro e premissas comerciais atuais são compartilhados diretamente porque podem mudar.",
    title: "Existe uma janela depois do terremoto que ninguém mede.",
    description:
      "Depois de um grande terremoto na Turquia, a inspeção estrutural leva semanas. Nessas semanas as famílias adivinham, os negócios param e os seguros travam. A SismoSmart é uma startup de hardware tentando fechar essa janela com os dados do próprio prédio.",
    sections: [
      ["Problema", "Grandes terremotos podem criar filas de inspeção. A SismoSmart investiga se dados fixos de movimento do prédio podem dar evidência adicional para priorização; não substitui inspeção nem decide segurança."],
      ["Por que agora", "Sensores MEMS modernos e hardware conectado tornam monitoramento fixo de menor custo mais prático. Economia de componentes e desempenho final seguem como premissas até o projeto ser congelado."],
      ["Mercado", "O foco comercial inicial é a Turquia. Expansão posterior depende de demanda validada, certificação, fabricação e parceiros locais; esta página não publica tamanho de mercado não auditado como fato atual."],
      ["Produto", "Variantes de hardware, preços, assinatura e unit economics ainda são premissas de planejamento. Termos atuais e modelo financeiro são compartilhados diretamente com investidores qualificados."],
      ["Equipe", "O projeto combina produto/software com contribuição de engenharia civil e sísmica. Composição da equipe e relações de assessoria podem mudar; material atual de diligência é compartilhado diretamente."],
      ["Concorrência", "O cenário inclui alertas oficiais, alertas móveis, instrumentação profissional e outros produtos de monitoramento. A hipótese da SismoSmart é medição fixa do prédio e evidência pós-evento; a diferenciação ainda exige validação."],
      ["Roteiro", "A sequência ativa é validação piloto, refinamento de hardware/software, revisão de evidência, preparação para certificação e fabricação, e lançamento só quando esses gates forem atendidos. Não há trimestre prometido."],
      ["A rodada", "Valor de captação, fôlego de caixa, alocação e premissas de subsídios ou créditos são inputs de planejamento com data. Termos atuais são compartilhados diretamente e não devem ser inferidos de uma cifra pública antiga."],
      ["O que buscamos", "Investidores anjo e fundos de estágio inicial que já tenham visto uma startup de hardware. Parceiros com acesso à regulação, à manufatura e às redes de seguro na Turquia valem mais para nós do que dinheiro rápido. A documentação técnica detalhada e o modelo financeiro compartilhamos sob acordo de confidencialidade."],
    ],
  },
  faq: {
    eyebrow: "FAQ",
    metaTitle: "Perguntas frequentes",
    metaDescription:
      "Respostas diretas sobre alerta de terremoto, segurança do prédio, dados, privacidade, instalação e prazos de lançamento.",
    title: "Perguntas frequentes",
    description:
      "Produtos de terremoto prometem demais com facilidade. Nós tentamos manter os limites do dispositivo à vista. Se a sua pergunta não estiver respondida aqui, escreva para info@sismosmart.com.",
    sections: [
      ["Esse dispositivo vai me avisar antes do terremoto?", "Não. A SismoSmart não é serviço de alerta precoce e não promete aviso antecipado. O piloto pode avaliar notificações de baixa latência após detecção local; para emergências, siga alertas oficiais."],
      ["Um dispositivo pode dizer se meu prédio é seguro?", "Não pode. Quem declara um prédio seguro ou inseguro é um engenheiro, não um aparelho. O que o dispositivo faz é deixar para esse engenheiro algo concreto com que trabalhar."],
      ["Quais dados vocês coletam?", "Leituras de vibração, temperatura, umidade, pressão e o estado de funcionamento do próprio dispositivo. Não associamos informação pessoal ao dispositivo e não vendemos seus dados para ninguém. Os detalhes estão na página de Privacidade."],
      ["Minha localização exata fica exposta?", "Sabemos a localização do seu dispositivo em nível de bairro, porque precisamos dela para cruzar um evento com os dispositivos próximos. Qualquer coisa mais precisa só é compartilhada com um acordo piloto explícito."],
      ["Pesquisadores podem acessar meus dados?", "Só depois de anonimizados e só com um acordo separado com você. Esse fluxo ainda não existe; está no roteiro."],
      ["Qual a diferença para os alertas do Google?", "O Google usa o acelerômetro dos celulares. É grátis, já está em todo mundo e funciona bem. Mas o que ele mede é a origem do terremoto, não o seu prédio. Nós fazemos o contrário: como seu prédio vibra, como isso muda com a estação e em que estado ele fica depois do terremoto. Um celular não responde a essas perguntas."],
      ["O que acontece quando cai a internet?", "Buffer local durante perda de rede é uma meta de projeto. A retenção e o envio posterior do evento dependem do hardware, firmware e caminho de conectividade validados."],
      ["E se cair a luz?", "Uma ponte curta de supercapacitor é uma meta de hardware. Duração exata e conclusão ou envio de um evento durante a queda exigem evidência de bancada e piloto."],
      ["Instalar é difícil?", "Você liga o cabo USB-C na tomada, cola o dispositivo na parede com o adesivo de trás e pareia pelo app. Sem furadeira e sem técnico. Cinco minutos."],
      ["Quantos um prédio deveria ter?", "Não existe quantidade universal validada. A colocação depende do prédio, objetivo de medição e revisão de engenharia; arranjos com vários dispositivos são avaliados caso a caso."],
      ["O que significam PGA, PGV e MMI?", "PGA, PGV e intensidade Modified Mercalli são conceitos padrão. Um futuro relatório da SismoSmart só usará grandezas medidas ou derivadas após validação do método e da incerteza."],
      ["O que a frequência natural diz?", "Um prédio tem características de vibração mensuráveis, incluindo frequências naturais. Mudanças podem fornecer evidência adicional a um engenheiro, mas não diagnosticam dano nem segurança por si só."],
      ["Para qual lado o dispositivo deve apontar?", "Há uma seta para cima nas costas; aponte para o teto. Tente alinhar os eixos X e Y do dispositivo com as direções horizontais do prédio. Montado 90 graus torto, os dados ainda servem, embora carreguem um pouco menos de informação."],
      ["O dispositivo grava som?", "Não. Não tem microfone, só um acelerômetro que mede a vibração do solo. Gravar conversa ou som ambiente exigiria um sensor completamente diferente."],
      ["Meus dados saem da Turquia?", "A residência dos dados do piloto ainda não é definitiva. Antes da coleta, cada acordo indicará locais de tratamento, transferências, retenção e a base jurídica aplicável."],
      ["Quando entra à venda?", "Ainda não há data pública firme de venda. A SismoSmart segue em pré-lançamento; evidência piloto, prontidão do hardware, certificação e fabricação definirão o calendário."],
    ],
  },
  security: {
    eyebrow: "Segurança",
    metaTitle: "Segurança",
    metaDescription:
      "Como lidamos com a segurança do site, o consentimento, os dados do dispositivo, o transporte criptografado e a privacidade durante a fase piloto.",
    title: "O dado que você nunca coleta é o dado que não vaza.",
    description:
      "Essa é a nossa regra básica. No momento a única coisa no ar é o site, mas o lado do dispositivo estamos construindo com a mesma regra.",
    sections: [
      ["Pouco dado por padrão", "O site ao vivo atualmente coleta apenas os dados descritos em Privacidade. A telemetria futura do dispositivo ainda é uma área de projeto de produto e política que será documentada antes do piloto."],
      ["Consentimento antes da analítica", "A analítica web só carrega depois que você consente. Você pode desfazer essa escolha quando quiser pelo link no rodapé."],
      ["Transporte criptografado", "O site atualmente usa HTTPS e cabeçalhos de segurança. Criptografia do dispositivo e ciclo de vida de chaves são metas de projeto até o protocolo implementado ser revisado e validado."],
      ["Nenhum segredo chega ao navegador", "Chaves privadas e tokens de serviço nunca aparecem no código que vai para o navegador. Eles ficam em uma configuração protegida no lado do servidor."],
      ["Relato de vulnerabilidades", "Se encontrar um problema de segurança no site ou em materiais pré-lançamento, escreva para info@sismosmart.com. Somos gratos a quem divulga de forma responsável."],
      ["Plano de segurança do dispositivo", "Firmware assinado, armazenamento criptografado, chaves por dispositivo e atualização com rollback são metas de segurança, não capacidades implantadas. Só serão publicados como atuais após evidência de implementação e revisão."],
    ],
  },
});
