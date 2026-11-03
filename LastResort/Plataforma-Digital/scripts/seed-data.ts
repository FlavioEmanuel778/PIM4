// Conteúdo dos cursos. As questões de Proteção de Dados vêm do Design PIM.
type Q = { category: string; topic: string; prompt: string; options: [string, string, string, string]; correct: "A" | "B" | "C" | "D"; explanation: string };
type Ex = { title: string; description: string; category: string; prompt: string; scenario: string; options: [string, string, string, string]; correct: "A" | "B" | "C" | "D"; feedbackCorrect: string; feedbackWrong: string };
type Material = { kind: "arquivo"; name: string } | { kind: "link"; url: string };
type Ct = { title: string; description: string; lessons: number; minutes: number; body: string; material: Material };
export type CourseSeed = { name: string; summary: string; tagline: string; icon: string; level: string; teacherEmail: string; contents: Ct[]; exercises: Ex[]; quiz: Q[] };

export const COURSES: CourseSeed[] = [
  {
    name: "Proteção de Dados",
    summary: "Cuide das suas informações, crie senhas seguras e aprenda a reconhecer golpes na internet.",
    tagline: "Aprenda a cuidar dos seus dados e a navegar com mais segurança.",
    icon: "shield", level: "Nível iniciante", teacherEmail: "ana.ribeiro@edudigital.com.br",
    contents: [
      { title: "LGPD", description: "Entenda o que são dados pessoais e os direitos garantidos pela lei.", lessons: 3, minutes: 120,
        body: `## O que é a LGPD
A Lei Geral de Proteção de Dados (Lei nº 13.709/2018) define como empresas, órgãos públicos e outras organizações podem coletar, usar e guardar informações sobre você.

## O que são dados pessoais
Dado pessoal é qualquer informação que identifica uma pessoa ou pode identificá-la: nome, CPF, endereço, telefone, e-mail. Os dados pessoais sensíveis, como informações sobre saúde, religião ou origem racial, têm proteção ainda maior.

## Seus direitos
- Saber se uma organização guarda dados sobre você.
- Corrigir dados incompletos, inexatos ou desatualizados.
- Pedir a exclusão de dados tratados com o seu consentimento.
- Retirar o consentimento quando quiser.

Guarde esta ideia: os seus dados são seus, e você pode perguntar o que é feito com eles.`, material: { kind: "arquivo", name: "lgpd-guia-introdutorio.pdf" } },
      { title: "Privacidade", description: "Saiba escolher o que compartilhar e controlar suas informações.", lessons: 2, minutes: 90,
        body: `## Compartilhe com consciência
Antes de publicar uma foto, um endereço ou a sua rotina, pergunte-se: quem poderá ver isso e por quanto tempo? Tudo o que vai para a internet pode ser copiado.

## Permissões de aplicativos
Aplicativos pedem acesso à câmera, ao microfone, à localização e aos contatos. Conceda apenas o que o aplicativo precisa para funcionar. Um aplicativo de lanterna, por exemplo, não precisa dos seus contatos.

## Passo a passo para revisar
- Abra as configurações do celular e procure por "Privacidade" ou "Aplicativos".
- Veja quais aplicativos acessam a localização e os contatos.
- Desative o que não faz sentido e revise de tempos em tempos.

Nas redes sociais, confira também quem pode ver as suas publicações: todo mundo, só amigos ou só você.`, material: { kind: "link", url: "https://www.gov.br/anpd/pt-br" } },
      { title: "Normas de segurança na internet", description: "Crie senhas fortes, reconheça golpes e proteja seus dispositivos.", lessons: 3, minutes: 150,
        body: `## Senhas fortes
Use senhas longas e diferentes para cada conta. Uma boa saída é juntar várias palavras que só você associa, com números e símbolos. Nunca use a data de nascimento.

## Verificação em dois fatores
Além da senha, a conta pede uma segunda confirmação, como um código enviado ao celular. Mesmo que alguém descubra a senha, não consegue entrar sem esse segundo passo.

## Como reconhecer um golpe
- A mensagem tem urgência: "sua conta será bloqueada hoje".
- Pede senha, código ou dados do cartão.
- Chega de alguém que você não esperava, com um link desconhecido.

Diante da dúvida, não clique. Abra o aplicativo ou digite o endereço oficial por conta própria e confira a situação.

## Cadeado no site
O cadeado e o HTTPS indicam que a conexão é protegida, mas não garantem que o site seja honesto. Confira sempre o endereço.`, material: { kind: "arquivo", name: "seguranca-na-internet.pdf" } }
    ],
    exercises: [
      { title: "Reconhecendo dados pessoais", description: "Identifique informações que podem revelar quem você é.", category: "Dados pessoais",
        prompt: "Qual destas informações pode revelar quem você é?",
        scenario: "Leia as alternativas e escolha apenas uma resposta.",
        options: ["A temperatura média da sua cidade.", "O número do seu CPF.", "O nome de um aplicativo de clima.", "A cor favorita de um grupo de pessoas."], correct: "B",
        feedbackCorrect: "O CPF identifica uma pessoa e, por isso, é um dado pessoal. Informações que não se ligam a ninguém, como o clima, não são.",
        feedbackWrong: "Dado pessoal é a informação que identifica uma pessoa, como o CPF. As outras opções não se ligam a ninguém." },
      { title: "Privacidade no dia a dia", description: "Escolha como compartilhar seus dados com segurança.", category: "Privacidade no dia a dia",
        prompt: "Qual atitude ajuda a proteger seus dados pessoais ao fazer um cadastro na internet?",
        scenario: "Leia as alternativas e escolha apenas uma resposta.",
        options: ["Publicar uma foto do documento para todos verem.", "Compartilhar apenas os dados necessários em um canal confiável.", "Enviar sua senha junto com o cadastro para facilitar o acesso.", "Aceitar qualquer pedido de dados sem conferir quem está pedindo."], correct: "B",
        feedbackCorrect: "Compartilhar só o necessário em um canal confiável reduz a exposição dos seus dados. Confira também quem solicita as informações e para qual finalidade.",
        feedbackWrong: "Publicar um documento expõe informações como nome e CPF. Compartilhe apenas o necessário, por um canal confiável, e confira a finalidade do cadastro." }
    ],
    quiz: [
      { category: "LGPD", topic: "Dados pessoais", prompt: "O que é um dado pessoal?", options: ["Uma informação que identifica ou pode identificar uma pessoa.", "Qualquer informação sobre o clima.", "Somente o número do cartão de crédito.", "Apenas informações publicadas em redes sociais."], correct: "A", explanation: "Dado pessoal é qualquer informação que identifica ou pode identificar uma pessoa, como nome, CPF ou endereço." },
      { category: "LGPD", topic: "Objetivo da LGPD", prompt: "Qual é o principal objetivo da LGPD?", options: ["Impedir qualquer uso da internet.", "Proteger os dados pessoais e os direitos de seus titulares.", "Obrigar as pessoas a publicar seus documentos.", "Eliminar todas as senhas dos serviços digitais."], correct: "B", explanation: "A LGPD existe para proteger os dados pessoais e os direitos das pessoas a quem esses dados se referem." },
      { category: "LGPD", topic: "Dados sensíveis", prompt: "Qual destas informações é um dado pessoal sensível?", options: ["O horário de funcionamento de uma loja.", "O preço de um produto.", "Uma informação sobre a saúde de uma pessoa.", "O endereço de um site de notícias."], correct: "C", explanation: "Informações sobre saúde são dados sensíveis e têm proteção reforçada, assim como origem racial, religião e outros." },
      { category: "Privacidade", topic: "Consentimento", prompt: "Quando o consentimento é usado, como ele deve ser?", options: ["Presumido sempre que a pessoa visita um site.", "Genérico, sem explicar a finalidade.", "Obrigatório para qualquer compra, sem escolha.", "Livre, informado e relacionado a uma finalidade específica."], correct: "D", explanation: "O consentimento precisa ser uma escolha livre e informada, ligada a uma finalidade específica." },
      { category: "Segurança na internet", topic: "Senhas seguras", prompt: "Qual prática torna suas contas mais seguras?", options: ["Usar a mesma senha curta em todas as contas.", "Usar senhas longas e únicas e ativar a autenticação em duas etapas.", "Compartilhar sua senha com amigos.", "Anotar a senha em uma publicação aberta."], correct: "B", explanation: "Senhas longas e únicas, somadas à autenticação em duas etapas, dificultam o acesso de outras pessoas à sua conta." },
      { category: "Segurança na internet", topic: "Golpes e links suspeitos", prompt: "Você recebe um link pedindo sua senha com urgência. O que fazer?", options: ["Abrir o link e informar os dados imediatamente.", "Encaminhar o link para todos os contatos.", "Não informar a senha e confirmar o pedido pelo canal oficial.", "Responder à mensagem com seu código de acesso."], correct: "C", explanation: "Urgência e pedido de senha são sinais de golpe. Confirme pelo aplicativo ou site oficial, sem usar o link." },
      { category: "Privacidade", topic: "Permissões de aplicativos", prompt: "Um aplicativo pede acesso aos seus contatos sem precisar deles. Qual atitude é mais segura?", options: ["Negar a permissão e revisar quais acessos são necessários.", "Permitir todos os acessos automaticamente.", "Publicar sua lista de contatos.", "Desativar a senha do celular."], correct: "A", explanation: "Um aplicativo deve pedir só as permissões de que precisa. Negue o que não faz sentido e revise os acessos." },
      { category: "Segurança na internet", topic: "Computadores compartilhados", prompt: "Ao usar um computador compartilhado, o que você deve fazer ao terminar?", options: ["Fechar a aba, sem sair da conta.", "Sair da conta e evitar salvar senhas no navegador.", "Deixar a conta aberta para o próximo usuário.", "Salvar a senha para facilitar o próximo acesso."], correct: "B", explanation: "Fechar a aba não encerra necessariamente a sessão. Sempre use a opção Sair ao terminar." },
      { category: "LGPD", topic: "Direitos do titular", prompt: "Se seus dados estiverem incorretos em um cadastro, qual direito você pode exercer?", options: ["Alterar os dados de outras pessoas.", "Exigir acesso à senha de todos os usuários.", "Publicar os dados do responsável pelo site.", "Solicitar a correção dos seus dados pessoais."], correct: "D", explanation: "A LGPD garante o direito de pedir a correção de dados incompletos, inexatos ou desatualizados." },
      { category: "Segurança na internet", topic: "Cadeado e HTTPS", prompt: "O cadeado e o HTTPS garantem que um site é confiável?", options: ["Sim, qualquer site com cadeado é totalmente seguro.", "Não. Eles protegem a conexão, mas é preciso conferir o endereço e a origem.", "Sim, por isso não é necessário verificar o endereço.", "Não, porque HTTPS significa que a conexão não tem proteção."], correct: "B", explanation: "O HTTPS protege a conexão, mas um site falso também pode ter cadeado. Verifique o domínio." }
    ]
  },
  {
    name: "Inclusão Digital",
    summary: "Dê os primeiros passos com o computador, use o e-mail e descubra os serviços digitais.",
    tagline: "Ganhe confiança para usar dispositivos, navegar e se comunicar.",
    icon: "laptop", level: "Nível iniciante", teacherEmail: "carlos.santos@edudigital.com.br",
    contents: [
      { title: "Internet e navegação", description: "Conheça o navegador, faça buscas e identifique endereços de sites.", lessons: 3, minutes: 150,
        body: `## O que é um navegador
O navegador é o programa que abre os sites. Chrome, Firefox, Edge e Safari são exemplos. Para visitar um site, digite o endereço na barra que fica no topo da janela.

## Como pesquisar
Escreva na barra do navegador o que você procura, com poucas palavras. Compare mais de um resultado antes de acreditar na resposta.

## Como saber se a informação é confiável
- Veja quem publicou: um órgão público, um jornal conhecido ou alguém sem identificação?
- Confira a data: informação antiga pode estar errada hoje.
- Desconfie de promessas fáceis e de textos que pedem para você compartilhar sem ler.

Endereços terminados em .gov.br pertencem a órgãos do governo e costumam ser boas fontes para serviços públicos.`, material: { kind: "arquivo", name: "guia-navegacao-segura.pdf" } },
      { title: "Fundamentos do computador e do celular", description: "Explore funções básicas, aplicativos e configurações dos dispositivos.", lessons: 4, minutes: 180,
        body: `## Conhecendo o aparelho
No computador, o teclado serve para digitar e o mouse (ou touchpad) para apontar e clicar. No celular, você toca, arrasta e aproxima os dedos na tela para aumentar.

## Aplicativos
Aplicativo é um programa que faz uma tarefa: enviar mensagens, ver o mapa, abrir um documento. Para instalar, use sempre a loja oficial do aparelho.

## Organizando arquivos
Arquivos são fotos, documentos e músicas. Pastas servem para guardar arquivos em grupos, como uma gaveta com etiqueta. Dê nomes claros, por exemplo "Fotos da família 2026".

## Ajustes que ajudam
- Aumente o tamanho da letra nas configurações para ler com mais conforto.
- Aumente o brilho da tela em ambientes claros.
- Mantenha o aparelho atualizado para receber correções de segurança.`, material: { kind: "arquivo", name: "primeiros-passos-computador-celular.pdf" } },
      { title: "Comunicação digital", description: "Use e-mail e mensagens para conversar de forma clara e respeitosa.", lessons: 3, minutes: 150,
        body: `## Enviando um e-mail
Para escrever um e-mail você precisa de três coisas: o endereço do destinatário, um assunto e a mensagem. O assunto resume o tema em poucas palavras, como "Segunda via do boletim".

## Boas práticas
- Confira o endereço do destinatário antes de enviar.
- Escreva de forma educada e objetiva.
- Só anexe documentos quando tiver certeza de quem vai receber.

## Cuidado com anexos
Não abra anexos de remetentes desconhecidos. Se algo parecer estranho, apague ou confirme com a pessoa por outro canal, como uma ligação.

## Chamadas de vídeo
Antes de entrar, teste a câmera e o microfone e escolha um lugar com boa luz e pouco barulho. Use o botão de microfone para silenciar quando não estiver falando.`, material: { kind: "link", url: "https://www.gov.br/pt-br" } }
    ],
    exercises: [
      { title: "Conhecendo o navegador", description: "Reconheça as partes do navegador e como visitar um site.", category: "Conhecendo o navegador",
        prompt: "Qual parte do navegador você usa para digitar o endereço de um site?",
        scenario: "Leia as alternativas e escolha apenas uma resposta.",
        options: ["A barra de endereço, no topo da janela.", "A lixeira do computador.", "O painel de volume.", "A tela de bloqueio do celular."], correct: "A",
        feedbackCorrect: "A barra de endereço fica no topo da janela do navegador. É ali que você digita o endereço de um site ou escreve o que deseja pesquisar.",
        feedbackWrong: "O endereço do site é digitado na barra de endereço, no topo da janela do navegador. As outras opções não servem para isso." },
      { title: "Enviando uma mensagem", description: "Escreva uma mensagem clara antes de enviar.", category: "Enviando uma mensagem",
        prompt: "O que fazer antes de enviar uma mensagem importante?",
        scenario: "Leia as alternativas e escolha apenas uma resposta.",
        options: ["Enviar para todos os contatos para ganhar tempo.", "Conferir o destinatário e reler o texto antes de enviar.", "Escrever tudo em letras maiúsculas.", "Anexar documentos pessoais sem saber quem vai receber."], correct: "B",
        feedbackCorrect: "Conferir o destinatário e reler o texto evita enviar a pessoa errada e deixa a mensagem clara e educada.",
        feedbackWrong: "Antes de enviar, confira o destinatário e releia o texto. Evite enviar documentos pessoais sem ter certeza de quem vai receber." }
    ],
    quiz: [
      { category: "Internet e navegação", topic: "Navegadores", prompt: "Para que serve um navegador?", options: ["Para ligar e desligar o computador.", "Para acessar e visualizar sites na internet.", "Para guardar fotos no celular.", "Para aumentar o volume do aparelho."], correct: "B", explanation: "O navegador é o programa que abre os sites. Chrome, Firefox, Edge e Safari são exemplos." },
      { category: "Internet e navegação", topic: "Endereço de sites", prompt: "Onde você digita o endereço de um site?", options: ["Na tela de bloqueio do celular.", "Na lixeira do computador.", "No painel de volume.", "Na barra de endereço do navegador."], correct: "D", explanation: "A barra de endereço fica no topo da janela do navegador. É ali que você digita o endereço do site." },
      { category: "Internet e navegação", topic: "Fontes confiáveis", prompt: "Qual cuidado ajuda a encontrar informações confiáveis?", options: ["Acreditar sempre no primeiro resultado.", "Compartilhar antes de ler.", "Conferir quem publicou a informação e a data.", "Confiar em mensagens sem autor."], correct: "C", explanation: "Saber quem publicou e quando ajuda a perceber se a informação é confiável e atual." },
      { category: "Fundamentos do computador e do celular", topic: "Aplicativos", prompt: "O que é um aplicativo?", options: ["Uma peça física do teclado.", "Um cabo para carregar a bateria.", "Um programa que realiza uma tarefa no computador ou no celular.", "Um tipo de película de proteção."], correct: "C", explanation: "Aplicativo é um programa que faz uma tarefa, como enviar mensagens ou mostrar um mapa." },
      { category: "Fundamentos do computador e do celular", topic: "Organização de arquivos", prompt: "Para que servem as pastas em um computador?", options: ["Para esquentar o aparelho.", "Para organizar arquivos em grupos.", "Para apagar a internet.", "Para conectar o Wi-Fi."], correct: "B", explanation: "Pastas guardam arquivos em grupos, como uma gaveta com etiqueta, e facilitam encontrar o que você precisa." },
      { category: "Fundamentos do computador e do celular", topic: "Ajustes do aparelho", prompt: "O que fazer para ler com mais conforto na tela do celular?", options: ["Desligar o aparelho.", "Retirar a bateria.", "Apagar os aplicativos.", "Aumentar o tamanho da letra nas configurações."], correct: "D", explanation: "Nas configurações você pode aumentar o tamanho da letra e o brilho da tela para ler melhor." },
      { category: "Comunicação digital", topic: "Enviando e-mails", prompt: "Qual informação é indispensável para enviar um e-mail?", options: ["O endereço de e-mail do destinatário.", "A senha do destinatário.", "O CPF do destinatário.", "O número do cartão do destinatário."], correct: "A", explanation: "Para enviar um e-mail você só precisa do endereço do destinatário. Nunca peça nem informe senhas." },
      { category: "Comunicação digital", topic: "Assunto do e-mail", prompt: "Para que serve o campo \"Assunto\" do e-mail?", options: ["Para digitar a senha.", "Para resumir do que trata a mensagem.", "Para escolher a cor do texto.", "Para apagar mensagens antigas."], correct: "B", explanation: "O assunto resume o tema da mensagem e ajuda quem recebe a entender do que se trata." },
      { category: "Comunicação digital", topic: "Chamadas de vídeo", prompt: "Antes de entrar em uma chamada de vídeo, o que vale verificar?", options: ["Se o teclado é novo.", "Se a bateria do vizinho está carregada.", "Se a câmera e o microfone estão funcionando.", "Se o papel de parede está bonito."], correct: "C", explanation: "Testar câmera e microfone antes evita atrasos e problemas durante a conversa." },
      { category: "Comunicação digital", topic: "Anexos suspeitos", prompt: "Você recebeu um e-mail com anexo de um remetente desconhecido. O que fazer?", options: ["Abrir o anexo imediatamente.", "Encaminhar a todos os contatos.", "Responder enviando seus dados pessoais.", "Não abrir e apagar, ou confirmar com o remetente por outro canal."], correct: "D", explanation: "Anexos de desconhecidos podem esconder golpes. Apague ou confirme com a pessoa por outro canal." }
    ]
  }
];
