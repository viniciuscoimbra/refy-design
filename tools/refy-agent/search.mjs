// Busca por intenção no catálogo. O catálogo descreve as famílias em inglês e as coleções em
// português; quem pergunta escreve em qualquer das três línguas do site. Por isso a consulta passa
// por um glossário fechado (pt/es → termos do catálogo) antes do BM25. Sem modelo, sem rede:
// a mesma consulta devolve sempre a mesma ordem.

const STOP = new Set(
  (
    "a o as os um uma uns umas de do da dos das no na nos nas em para pra pro por com sem que " +
    "e ou se ao aos à às meu minha seu sua isso esse essa este esta quero preciso precisa " +
    "tela componente componentes algo coisa onde como qual quais mostrar usar " +
    "el la los las un una unos unas del al en y o con sin para por que mi su esto ese esa " +
    "quiero necesito pantalla componente " +
    "the an of to in on for with without and or is are be that this my your i we need want " +
    "show use using component components screen page something some which how where"
  ).split(/\s+/),
);

// Termo de consulta (sem acento, minúsculo) → termos que o catálogo usa. Lista fechada e revisada à
// mão: termo que falta aqui cai no casamento literal, nunca em adivinhação.
const GLOSSARY = {
  botao: ["button", "action"], boton: ["button", "action"], acao: ["action"], acoes: ["action"], accion: ["action"],
  clicar: ["click", "button"], clique: ["click"], enviar: ["send", "submit", "button"], salvar: ["save", "button"],
  guardar: ["save"], confirmar: ["confirm", "confirmation"], confirmacao: ["confirm", "confirmation"], confirmacion: ["confirm", "confirmation"],
  cancelar: ["cancel"], excluir: ["delete", "danger"], apagar: ["delete", "danger"], exclusao: ["delete", "danger"], exclusion: ["delete", "danger"], eliminar: ["delete", "danger"],
  borrar: ["delete", "danger"], perigo: ["danger", "sensitive"], peligro: ["danger"], irreversivel: ["undone", "danger"],
  icone: ["icon"], icono: ["icon"], flutuante: ["floating"], flotante: ["floating"],
  entrar: ["sign", "login"], login: ["sign", "login"], logar: ["sign"], acesso: ["sign", "access"],
  sesion: ["sign", "login"], inicio_de_sesion: ["sign", "login"],
  google: ["google"], social: ["oauth", "sign"],
  campo: ["input", "field"], campos: ["input", "field"], texto: ["text"], digitar: ["input", "text", "typing"],
  digitacao: ["input", "text", "typing"],
  escrever: ["text", "input"], formulario: ["form", "input", "field"], form: ["form", "input", "field"],
  senha: ["password", "input"], contrasena: ["password", "input"], email: ["email", "input"], nome: ["name", "input"],
  multilinha: ["multi", "line"], comentario: ["textarea", "multi", "line"], descricao: ["textarea", "description"],
  selecionar: ["select", "selection", "choice"], selecao: ["selection", "select"], seleccionar: ["select", "selection"],
  escolher: ["choice", "select"], escolha: ["choice"], elegir: ["choice", "select"], opcao: ["option"], opcoes: ["option"],
  opcion: ["option"], opciones: ["option"], suspensa: ["select", "dropdown"], dropdown: ["select", "menu"],
  desplegable: ["select", "dropdown"], autocompletar: ["combobox", "search"], autocomplete: ["combobox", "search"],
  varios: ["multiple"], varias: ["multiple"], multipla: ["multiple"], multiplos: ["multiple"], multiplas: ["multiple"],
  marcar: ["checkbox", "choice"], caixa: ["checkbox"], casilla: ["checkbox"], alternar: ["toggle", "switch"],
  ligar: ["switch", "on"], desligar: ["switch", "off"], interruptor: ["switch", "toggle"], preferencia: ["preference", "setting"],
  exclusiva: ["exclusive", "radio"], exclusivo: ["exclusive", "radio"], unica: ["single"], unico: ["single"],
  deslizar: ["slider", "drag"], faixa: ["range"], intervalo: ["range"], rango: ["range"], numero: ["numeric", "number"],
  codigo: ["code"], verificacao: ["verification", "code"], verificacion: ["verification"],
  telefone: ["phone"], celular: ["phone", "mobile"], telefono: ["phone"], cep: ["postal", "code"], endereco: ["postal", "address"],
  direccion: ["address", "postal"], data: ["date", "calendar"], datas: ["date", "calendar"], fecha: ["date", "calendar"],
  calendario: ["calendar", "date"], agenda: ["schedule", "calendar"], agendar: ["schedule", "visit"], horario: ["time", "schedule"],
  visita: ["visit", "schedule"], arquivo: ["file", "upload"], arquivos: ["file", "upload"], archivo: ["file", "upload"],
  anexo: ["file", "upload"], anexar: ["file", "upload"], subir: ["upload"], enviar_arquivo: ["upload"],
  mapa: ["map", "geographic", "area"], regiao: ["region", "area"], bairro: ["neighborhood", "region", "area"],
  raio: ["radius", "area"], localizacao: ["location", "map"], ubicacion: ["location", "map"],
  navegacao: ["navigation"], navegar: ["navigation"], navegacion: ["navigation"], caminho: ["path", "breadcrumb"],
  trilha: ["breadcrumb", "path"], migalha: ["breadcrumb"], abas: ["tabs"], aba: ["tabs"], pestanas: ["tabs"],
  paginacao: ["pagination", "pages"], paginacion: ["pagination"], proxima: ["next"], anterior: ["previous"],
  indice: ["table", "contents", "anchor"], sumario: ["table", "contents"], passos: ["steps", "stepper"], etapas: ["steps", "stepper"],
  pasos: ["steps"], assistente: ["wizard", "steps", "assistant"], wizard: ["wizard", "steps"],
  menu: ["menu"], lateral: ["side", "sidebar"], barra: ["bar"], topo: ["top", "topbar"], cabecalho: ["header"],
  encabezado: ["header"], rodape: ["footer"], pie: ["footer"], conta: ["account", "user"], usuario: ["user", "account"],
  perfil: ["account", "user", "avatar"], ajuda: ["help"], ayuda: ["help"], atalho: ["shortcut", "command"], atajo: ["shortcut"],
  comando: ["command"], comandos: ["command"], paleta: ["palette", "command"],
  etiqueta: ["badge", "label", "tag"], tag: ["chip", "badge", "tag"], filtro: ["filter", "chip"], filtros: ["filter", "chip"],
  status: ["state", "status"], estado: ["state", "status"], situacao: ["state"], aviso: ["callout", "alert", "warning", "notice"],
  alerta: ["callout", "alert", "warning"], erro: ["error", "critical"], error: ["error", "critical"], sucesso: ["success", "result"],
  exito: ["success"], mensagem: ["message"], mensaje: ["message"], vazio: ["empty"], vacio: ["empty"], nada: ["empty"],
  carregando: ["loading", "loads", "progress"], cargando: ["loading", "progress"], carregamento: ["loading"],
  esqueleto: ["skeleton", "loading"], progresso: ["progress"], progreso: ["progress"], uso: ["usage", "limit"], cota: ["quota", "usage"],
  notificacao: ["notification", "toast"], notificacoes: ["notification"], notificacion: ["notification"], sino: ["bell", "notification"],
  dica: ["tooltip", "hint"], explicacao: ["explanation", "tooltip", "help"], balao: ["popover", "tooltip", "bubble"],
  janela: ["modal", "dialog"], dialogo: ["dialog", "modal"], ventana: ["modal", "dialog"], popup: ["modal", "popover"],
  painel: ["panel", "drawer"], panel: ["panel", "drawer"], gaveta: ["drawer", "panel"], tour: ["tour", "guidance"],
  tabela: ["table", "data"], tabla: ["table", "data"], planilha: ["table"], linhas: ["rows", "table"], colunas: ["columns", "table"],
  ordenar: ["sorting", "table"], grafico: ["chart", "d3"], graficos: ["chart", "d3"], grafica: ["chart", "d3"],
  grafico_de_barras: ["chart", "d3"], grafica_de_barras: ["chart", "d3"], bar_chart: ["chart", "d3"], dashboard: ["chart", "stat", "indicator"],
  indicador: ["stat", "value", "indicator"], metrica: ["stat", "value"], kpi: ["stat", "value"], numero_grande: ["stat"],
  pontuacao: ["score", "gauge"], nota: ["score"], quadrante: ["quadrants", "matrix"], linha_do_tempo: ["timeline"],
  historico: ["history", "activity", "timeline"], historia: ["history"], atividade: ["activity"], actividad: ["activity"],
  tempo: ["time", "timeline"], kanban: ["kanban", "board"], quadro: ["board", "kanban"], tablero: ["board", "kanban"],
  tarefa: ["work", "card", "kanban"], tarefas: ["work", "kanban"], aprovacao: ["approval", "review", "decision"],
  aprovar: ["approval", "decision"], revisao: ["review"], decisao: ["decision"],
  foto: ["image", "avatar", "media"], fotos: ["image", "media", "gallery"], imagem: ["image", "media"], imagen: ["image", "media"],
  galeria: ["gallery", "media", "carousel"], video: ["video", "media"], audio: ["audio", "media"], musica: ["music", "media"],
  capa: ["cover", "coverflow"], capas: ["cover", "coverflow"], album: ["album", "coverflow"], albuns: ["album", "coverflow"],
  carrossel: ["carousel", "sequence"], carrusel: ["carousel"], pessoa: ["person", "avatar"], pessoas: ["person", "avatar"],
  persona: ["person", "avatar"], logo: ["logo", "brand"], marca: ["brand", "logo"], cartao: ["card"], tarjeta: ["card"],
  card: ["card"], acordeao: ["accordion", "expandable"], acordeon: ["accordion"], expandir: ["expandable", "expand", "collapsible"],
  recolher: ["collapsible"], sanfona: ["accordion"], tecla: ["key", "kbd", "keyboard"], teclado: ["keyboard", "key"],
  divisor: ["divider", "separation"], separador: ["divider", "separation"], fixo: ["sticky"], fija: ["sticky"],
  configuracao: ["settings", "setting"], configuracoes: ["settings"], ajustes: ["settings"], configuracion: ["settings"],
  plano: ["plan", "price"], planos: ["plan", "price"], preco: ["price", "plan"], precio: ["price"], assinatura: ["plan", "billing"],
  cobranca: ["billing", "payment"], pagamento: ["payment", "billing"], pago: ["payment"], fatura: ["billing"],
  integracao: ["integration", "connector"], integracion: ["integration"], conectar: ["connect", "connector"],
  chat: ["chat", "conversation", "message"], conversa: ["conversation", "message", "chat"], conversacion: ["conversation"],
  ia: ["ai", "conversation", "assistant"], assistente_ia: ["assistant"], voz: ["voice", "recording"], gravar: ["recording", "voice"],
  pedido: ["request", "intent"], prompt: ["request", "intent", "composer"], sugestoes: ["suggestions"],
  pergunta: ["question", "questionnaire"], perguntas: ["question", "questionnaire"], questionario: ["questionnaire"],
  encuesta: ["questionnaire"], pesquisa: ["search", "questionnaire"], busca: ["search"], buscar: ["search"], procurar: ["search"],
  rolagem: ["scrolling", "scroll"], rolar: ["scrolling"], scroll: ["scrolling", "scroll"], redimensionar: ["resizable", "panels"],
  proporcao: ["aspect", "ratio"], destacar: ["marker", "highlight"], marcador: ["marker"], spinner: ["spinner", "progress"],
  etapa: ["step", "trace"], operacao: ["operation"], artigo: ["prose", "editorial", "typography"], blog: ["prose", "editorial"],
  tipografia: ["typography", "prose"], documento: ["document", "prose"], hero: ["hero", "fold"], secao: ["section"],
  seccion: ["section"], site: ["site", "page"], aplicativo: ["app", "application"], app: ["app", "application"],
  estrutura: ["structure", "shell"], layout: ["structure", "shell", "layout"], dispositivo: ["device", "frame"],
  imovel: ["property", "card"], imoveis: ["property"], produto: ["product", "card"], loja: ["store", "card", "price"],
  deslizar_cartas: ["swipe"], swipe: ["swipe", "deck", "gestures"], arrastar: ["drag", "slider", "kanban"],
  direcao: ["direction"], pagina: ["page"], paginas: ["page"], ir: ["going", "go"], outra: ["another"], outro: ["another"], otra: ["another"],
  dados: ["data", "table"], datos: ["data", "table"], dado: ["data"], registros: ["records", "table"],
  tabela_de_dados: ["table", "data"], tabla_de_datos: ["table", "data"], data_table: ["table", "data"], data_grid: ["table", "data"],
  tela_de_login: ["sign", "login", "oauth"], pantalla_de_login: ["sign", "login"], sign_in: ["sign", "login"],
  lista: ["list"], listas: ["list"], upload: ["upload", "file"], some: ["temporary", "dismissal"],
  sozinho: ["duration", "temporary"], temporario: ["temporary"], breve: ["brief", "temporary"], submit: ["submit", "button"], send: ["send", "button"], rtl: ["direction", "reversed"], contexto: ["context", "contextual"], direito: ["right", "context"],
};

export function normalize(value) {
  return String(value).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("en");
}

function words(value) {
  return normalize(
    String(value)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2"),
  )
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

// Raiz curta para casar "loading"/"loads", "selection"/"select", "cards"/"card".
export function stem(word) {
  if (word.length <= 3) return word;
  for (const suffix of ["ations", "ation", "ions", "ion", "ings", "ing", "ies", "ed", "es", "s"])
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
      if (suffix === "ies") return word.slice(0, -3) + "y";
      word = word.slice(0, -suffix.length);
      break;
    }
  return word.length > 4 && word.endsWith("e") ? word.slice(0, -1) : word;
}

// Frase que nega ("no submenus", "instead of hiding the table", "not only in the color") cita o
// termo para dizer que a família NÃO serve para ele. As palavras depois da negação, até a próxima
// pontuação, ficam fora do índice: senão a família sobe justamente para o que ela recusa.
const NEGATION = /\b(?:no|not|never|without|instead of|rather than|avoid)\b[^.,;:!?()]*/gi;
function affirmed(value) {
  return String(value).replace(NEGATION, " ");
}
// A tabela de escolha de controles é em português: "Escolher data sem digitação livre" não pode subir
// o DatePicker para "digitação livre". "no" fica de fora, porque em português é "em + o".
const PORTUGUESE_NEGATION = /(?<![\p{L}])(?:não|sem|nunca|em vez de)(?![\p{L}])[^.,;:!?()]*/giu;
function affirmedPortuguese(value) {
  return String(value).replace(PORTUGUESE_NEGATION, " ");
}
const PROSE = new Set(["description", "howTo"]);

const FIELDS = { name: 6, collection: 1.5, description: 2, area: 1, howTo: 1, api: 0.5 };

function familyFields(component, document, collections) {
  const own = (component.collections ?? []).map((id) => collections.find((c) => c.id === id)).filter(Boolean);
  return {
    name: [component.id, component.publicName, component.label],
    collection: own.filter((c) => c.kind !== "core").flatMap((c) => [c.label, c.description, ...(c.keywords ?? [])]),
    description: [component.description],
    area: [component.area, component.level],
    howTo: component.howToUse ?? [],
    api: (document?.api ?? []).flatMap((member) => [member.name, ...(member.props ?? []).map((p) => p.name)]),
  };
}

// Cada linha de alternatives é "situação: Família ...". Quando a consulta descreve a situação,
// a família citada sobe, com a frase como razão.
function parseAlternatives(component, ids) {
  return (component.alternatives ?? []).map((line) => {
    const cut = line.indexOf(":");
    const situation = cut > 0 ? line.slice(0, cut) : line;
    const advice = cut > 0 ? line.slice(cut + 1) : line;
    const targets = [...new Set((advice.match(/\b[A-Z][A-Za-z0-9]+\b/g) ?? []).filter((name) => ids.has(name)))];
    return { from: component.id, line, situation, terms: new Set(words(affirmed(situation)).filter((w) => !STOP.has(w)).map(stem)), targets };
  });
}

// Tabela "Necessidade | Componente | Razão" de control-choices.md: mesma forma das alternatives.
export function parseChoices(markdown, ids) {
  return String(markdown ?? "")
    .split("\n")
    .map((line) => line.split("|").map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 5 && cells[1] && !/^-+$/.test(cells[1]) && cells[1] !== "Necessidade")
    .map(([, need, family, reason]) => ({
      from: "control-choices",
      line: `${need}: ${family} (${reason})`,
      situation: need,
      terms: new Set(words(affirmedPortuguese(need)).filter((w) => !STOP.has(w)).map(stem)),
      targets: [...new Set((family.match(/\b[A-Z][A-Za-z0-9]+\b/g) ?? []).filter((name) => ids.has(name)))],
    }))
    .filter((entry) => entry.targets.length);
}

export function buildIndex(catalog, documentFor, choicesMarkdown) {
  const ids = new Set(catalog.components.map((c) => c.id));
  const families = catalog.components.map((component) => {
    const fields = familyFields(component, documentFor?.(component), catalog.collections ?? []);
    const terms = {};
    for (const [field, values] of Object.entries(fields)) {
      const bag = new Map();
      for (const word of values.flatMap((value) => words(PROSE.has(field) ? affirmed(value) : value))) {
        if (STOP.has(word)) continue;
        const key = stem(word);
        bag.set(key, (bag.get(key) ?? 0) + 1);
      }
      terms[field] = bag;
    }
    const length = Object.values(terms).reduce((sum, bag) => sum + [...bag.values()].reduce((a, b) => a + b, 0), 0);
    return { component, terms, length };
  });
  const df = new Map();
  for (const family of families) {
    const seen = new Set(Object.values(family.terms).flatMap((bag) => [...bag.keys()]));
    for (const term of seen) df.set(term, (df.get(term) ?? 0) + 1);
  }
  const averageLength = families.reduce((sum, f) => sum + f.length, 0) / families.length;
  const alternatives = [
    ...catalog.components.flatMap((component) => parseAlternatives(component, ids)),
    ...parseChoices(choicesMarkdown, ids),
  ];
  return { families, df, averageLength, alternatives, total: families.length };
}

export function expandQuery(query) {
  const raw = normalize(query);
  const tokens = raw.split(/[^a-z0-9]+/).filter(Boolean);
  const terms = new Map(); // termo → { weight, from }
  const add = (term, weight, from) => {
    const key = stem(term);
    const current = terms.get(key);
    if (!current || current.weight < weight) terms.set(key, { weight, from });
  };
  // Expressões de duas palavras primeiro ("linha do tempo" vira linha_do_tempo no glossário).
  // A palavra que já entrou numa expressão não é expandida sozinha: "data table" é tabela, e o
  // "data" dela não pode virar a data do calendário em português.
  const joined = `_${tokens.join("_")}_`;
  const consumed = new Set();
  for (const phrase of Object.keys(GLOSSARY).filter((k) => k.includes("_")))
    if (joined.includes(`_${phrase}_`)) {
      for (const term of GLOSSARY[phrase]) add(term, 1, phrase.replace(/_/g, " "));
      phrase.split("_").forEach((part) => consumed.add(part));
    }
  for (const token of tokens) {
    if (STOP.has(token)) continue;
    const mapped = Object.hasOwn(GLOSSARY, token) && !consumed.has(token) ? GLOSSARY[token] : undefined;
    if (mapped) mapped.forEach((term, i) => add(term, i === 0 ? 1 : 0.7, token));
    add(token, mapped ? 0.6 : 1, token);
  }
  return terms;
}

// Consulta inteira (sem acento, palavras unidas por _) que nomeia uma família em pt ou es, ou a peça
// que responde sozinha por ela. Vale como o nome exato digitado. Lista fechada e revisada à mão: o
// primeiro termo do glossário não serve, porque "índice" e "sumário" virariam Table.
const FAMILY_NAMES = {
  botao: "Button", boton: "Button", tabela: "Table", tabla: "Table", planilha: "Table",
  formulario: "Input", form: "Input", campo: "Input", campos: "Input", nome: "Input",
  senha: "Input", contrasena: "Input", password: "Input",
  cartao: "Card", tarjeta: "Card", secao: "Section", seccion: "Section", mensaje: "Message",
  login: "OAuthButton", sign_in: "OAuthButton", inicio_de_sesion: "OAuthButton",
  entrar: "OAuthButton", logar: "OAuthButton", sesion: "OAuthButton",
};

function exactNames(query) {
  const key = normalize(query).split(/[^a-z0-9]+/).filter(Boolean).join("_");
  const named = Object.hasOwn(FAMILY_NAMES, key) ? normalize(FAMILY_NAMES[key]) : "";
  return new Set([normalize(query).replace(/\s+/g, ""), named].filter(Boolean));
}

export function searchCatalog(index, query, { limit = 8, collection } = {}) {
  const terms = expandQuery(query);
  if (!terms.size) return { query, terms: [], results: [] };
  const k1 = 1.2, b = 0.4;
  const scores = new Map();
  for (const family of index.families) {
    const { component } = family;
    if (collection && !(component.collections ?? []).includes(collection)) continue;
    let score = 0;
    const matched = new Set();
    for (const [term, { weight, from }] of terms) {
      let tf = 0;
      for (const [field, bag] of Object.entries(family.terms)) tf += (bag.get(term) ?? 0) * FIELDS[field];
      if (!tf) continue;
      const n = index.df.get(term) ?? 0;
      const idf = Math.log(1 + (index.total - n + 0.5) / (n + 0.5));
      score += weight * idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * family.length) / index.averageLength)));
      matched.add(from);
      // O termo principal que bate no nome da família vale mais que mil menções no texto.
      if (weight === 1 && family.terms.name.has(term)) score += 2 * idf;
    }
    if (score > 0) scores.set(component.id, { score, matched, reasons: [] });
  }
  // Situação descrita em alternatives: a família indicada ganha o peso da situação.
  for (const alternative of index.alternatives) {
    const hit = [...terms.keys()].filter((term) => alternative.terms.has(term));
    if (hit.length < 2 && !(hit.length === 1 && terms.size === 1)) continue;
    const strength = hit.length / Math.max(2, alternative.terms.size);
    for (const target of alternative.targets) {
      const component = index.families.find((f) => f.component.id === target)?.component;
      if (!component || (collection && !(component.collections ?? []).includes(collection))) continue;
      const entry = scores.get(target) ?? { score: 0, matched: new Set(), reasons: [] };
      entry.score += 6 * strength;
      entry.reasons.push(`${alternative.from}: ${alternative.line}`);
      scores.set(target, entry);
    }
  }
  const exact = exactNames(query);
  const ranked = [...scores.entries()]
    .map(([id, entry]) => {
      const component = index.families.find((f) => f.component.id === id).component;
      if (exact.has(normalize(component.id)) || exact.has(normalize(component.publicName ?? ""))) entry.score += 100;
      return { component, ...entry };
    })
    .sort((a, b) => b.score - a.score || a.component.id.localeCompare(b.component.id))
    .slice(0, limit);
  return {
    query,
    terms: [...terms.entries()].map(([term, { weight, from }]) => ({ term, weight, from })),
    results: ranked.map(({ component, score, matched, reasons }) => ({
      id: component.id,
      publicName: component.publicName,
      level: component.level,
      area: component.area,
      collections: component.collections,
      maturity: component.maturity,
      description: component.description,
      score: Math.round(score * 100) / 100,
      matched: [...matched],
      reasons,
      howToUse: component.howToUse,
      alternatives: component.alternatives,
      import: `import { ${component.publicName} } from '@refy-design/web';`,
    })),
  };
}
