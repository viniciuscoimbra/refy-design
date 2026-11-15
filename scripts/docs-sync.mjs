// Sincronia entre o código do refy e o que cada superfície diz sobre ele.
//
// Uma superfície é qualquer texto que fala do refy: README, docs, README dos pacotes e plugins,
// kit de IA, server.json, site em pt/en/es. O registro fica em docs/sync/surfaces/<id>.md.
//
//   node scripts/docs-sync.mjs facts            fatos calculados do código, em JSON
//   node scripts/docs-sync.mjs --check          varre as superfícies e confere o registro de impacto
//   node scripts/docs-sync.mjs record           cria ou completa docs/sync/changes/<branch>.json
//   node scripts/docs-sync.mjs plan [--out d]   um pedido de atualização por superfície impactada
//
// O valor esperado vem sempre do código (catálogo, servidor MCP, tipos dos charts, pacotes),
// nunca de uma lista escrita à mão. Registro histórico (CHANGELOG, changelog do site, evidências,
// mudanças do openspec) não entra na conferência de números: ele conta o que era verdade na época.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SYNC_DIR = 'docs/sync';
export const SURFACES_DIR = `${SYNC_DIR}/surfaces`;
export const IMPACT_MAP = `${SYNC_DIR}/impact-map.json`;
export const CHANGES_DIR = `${SYNC_DIR}/changes`;
export const EXCEPTIONS = `${SYNC_DIR}/exceptions.json`;
export const STATUSES = ['atualizada', 'revisada sem mudança'];
const WORK_BRANCH = 'trabalho/2026-11-05';

const readText = (root, path) => readFileSync(join(root, path), 'utf8');
const readJson = (root, path) => JSON.parse(readText(root, path));

// ---------------------------------------------------------------------------------------------
// Fatos do código

/** Tipos do D3Chart: as uniões de tipo e os literais `type: "x"` do contrato em types.ts. */
export function chartTypes(source) {
  const types = new Set();
  for (const [, body] of source.matchAll(/export type \w+Type\s*=\s*([^;]+);/g))
    for (const [, literal] of body.matchAll(/"([a-z-]+)"/g)) types.add(literal);
  for (const [, literal] of source.matchAll(/\btype:\s*"([a-z-]+)"/g)) types.add(literal);
  return [...types].sort();
}

/** Ids do blockRegistry (cada template aparece em /templates/<id>). */
export function templateIds(source) {
  const body = source.slice(source.indexOf('export const blockRegistry'));
  return [...body.matchAll(/^ {4}id: "([^"]+)"/gm)].map(m => m[1]);
}

async function mcpTools(root) {
  const server = join(root, 'tools/refy-agent/mcp-server.mjs');
  const { answer } = await import(pathToFileURL(server).href);
  const list = async mode => (await answer({ jsonrpc: '2.0', id: 1, method: 'tools/list' }, mode)).result.tools.map(t => t.name);
  const ask = async method => (await answer({ jsonrpc: '2.0', id: 1, method }, { remote: false })).result;
  const resources = [...(await ask('resources/list')).resources.map(r => r.uri), ...(await ask('resources/templates/list')).resourceTemplates.map(r => r.uriTemplate)];
  return { local: await list({ remote: false }), remote: await list({ remote: true }), resources };
}

export async function computeFacts(root = process.cwd()) {
  const web = readJson(root, 'package.json');
  const mobile = readJson(root, 'packages/native/package.json');
  const catalog = readJson(root, 'ai/catalog.json');
  const level = name => catalog.components.filter(c => c.level === name).length;
  const docsDir = join(root, 'src/pages/PlaygroundPage/documentation');
  const snippets = readdirSync(docsDir).filter(f => f.endsWith('.json'))
    .reduce((sum, f) => sum + (JSON.parse(readFileSync(join(docsDir, f), 'utf8')).examples?.length ?? 0), 0);
  const versions = readJson(root, 'src/catalog/versions.json');
  const previous = versions.releases.map(r => r.version).find(v => v !== web.version) ?? null;
  const locales = readText(root, 'src/pages/RefySitePage/i18n.tsx').match(/export const locales[^=]*=\s*\[([^\]]+)\]/)[1]
    .match(/"([a-z]{2})"/g).map(s => s.slice(1, -1));
  const plugins = {};
  for (const name of readdirSync(join(root, 'plugins')))
    for (const kind of ['.claude-plugin', '.codex-plugin']) {
      const file = `plugins/${name}/${kind}/plugin.json`;
      if (existsSync(join(root, file))) plugins[file] = readJson(root, file).version;
    }
  const tools = await mcpTools(root);
  return {
    web: { name: web.name, version: web.version, previous },
    mobile: { name: mobile.name, version: mobile.version, components: readJson(root, 'src/pages/RefySitePage/nativeComponents.json').length },
    families: { total: catalog.components.length, atoms: level('Átomos'), molecules: level('Moléculas'), organisms: level('Organismos') },
    catalogVersion: catalog.packageVersion,
    mcp: tools,
    chartTypes: chartTypes(readText(root, 'src/components/Charts/d3/types.ts')),
    snippets,
    templates: templateIds(readText(root, 'src/pages/PlaygroundPage/blockRegistry.tsx')),
    themes: readdirSync(join(root, 'src/themes')).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, '')).sort(),
    locales,
    server: readJson(root, 'server.json').version,
    plugins,
  };
}

// ---------------------------------------------------------------------------------------------
// Superfícies

/** Lê o cabeçalho `chave: valor` entre `---` de docs/sync/surfaces/<id>.md. */
export function parseSurface(text, file = '') {
  const head = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!head) throw new Error(`${file}: falta o cabeçalho entre ---`);
  const meta = {};
  for (const line of head[1].split('\n')) {
    const m = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (m) meta[m[1]] = m[2].trim();
  }
  const list = value => (value ? value.split(',').map(s => s.trim()).filter(Boolean) : []);
  return {
    id: meta.id,
    title: meta.title ?? meta.id,
    files: list(meta.files),
    historical: meta.historical === 'sim',
    mcpTools: meta.mcpTools ?? 'local',
    requires: list(meta.requires),
    body: text.slice(head[0].length),
  };
}

export function loadSurfaces(root) {
  const dir = join(root, SURFACES_DIR);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.md')).sort().map(f => {
    const surface = parseSurface(readFileSync(join(dir, f), 'utf8'), `${SURFACES_DIR}/${f}`);
    if (surface.id !== f.replace(/\.md$/, '')) throw new Error(`${SURFACES_DIR}/${f}: id "${surface.id}" difere do nome do arquivo`);
    return surface;
  });
}

/** Glob simples: `**` atravessa pastas, `*` fica numa pasta só. */
export function globToRegExp(glob) {
  let out = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') { out += glob[i + 2] === '/' ? '(?:.*/)?' : '.*'; i += glob[i + 2] === '/' ? 2 : 1; }
    else if (c === '*') out += '[^/]*';
    else out += c.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${out}$`);
}
const matcher = globs => { const res = globs.map(globToRegExp); return file => res.some(re => re.test(file)); };

function trackedFiles(root) {
  try {
    return execFileSync('git', ['ls-files', '-c', '-z'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      .split('\0').filter(f => f && existsSync(join(root, f)) && statSync(join(root, f)).isFile());
  } catch {
    // Sem git (árvore exportada pela promoção): lista os arquivos da pasta, fora o que nunca é versionado.
    const skip = new Set(['node_modules', '.git', 'dist', 'dist-site', 'storybook-static', 'test-results', 'playwright-report']);
    const files = [];
    const walk = dir => {
      for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
        // Saída de teste ganha sufixo por navegador (test-results-firefox) e nunca é versionada.
        if (skip.has(entry.name) || /^(dist-site|test-results|playwright-report)/.test(entry.name)) continue;
        const path = dir ? `${dir}/${entry.name}` : entry.name;
        if (entry.isDirectory()) walk(path); else files.push(path);
      }
    };
    walk('');
    return files;
  }
}

export function surfaceFiles(root, surface, files = trackedFiles(root)) {
  const match = matcher(surface.files);
  return files.filter(match);
}

// Texto público que fala do refy e precisa estar em alguma superfície registrada.
export const MUST_BE_SURFACE = [
  'README.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'GOVERNANCE.md', 'SECURITY.md', 'PRIVACY.md', 'DESIGN.md',
  'docs/*.md', 'packages/*/README.md', 'plugins/**', 'ai/instructions.md', 'ai/control-choices.md', 'ai/catalog.json',
  'server.json', 'src/pages/RefySitePage/*.tsx', 'src/pages/RefySitePage/locales/*.json', 'scripts/site-seo.mjs',
  'examples/*/README.md', '.agents/skills/*/SKILL.md',
];

// ---------------------------------------------------------------------------------------------
// Varredura

const WORDS = {
  um: 1, uma: 1, dois: 2, duas: 2, três: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  uno: 1, dos: 2, tres: 3, cuatro: 4, cinco_es: 5, siete: 7, ocho: 8, nueve: 9, diez: 10,
};
const WORD_ALT = Object.keys(WORDS).filter(w => !w.includes('_')).join('|');
const NUM = `(\\d{1,4}|${WORD_ALT})`;
const value = token => (/^\d+$/.test(token) ? Number(token) : WORDS[token.toLowerCase()]);
const near = (noun, guard) => ({ re: new RegExp(`(?<![\\w.,/-])${NUM} ${noun}\\b`, 'giu'), guard });

/**
 * Regras de número: cada uma diz que substantivo, em que contexto, corresponde a que fato.
 * Componentes não entram: "23 componentes testados" e "12 componentes em uso" são outra coisa.
 */
export function numberRules(facts, surface) {
  // Família tipográfica não é família do catálogo.
  const fonts = /tipogr|typograph|typeface|font famil|DM Sans|IBM Plex|Manrope|Source Sans|Geist/i;
  // Na frase do número, "remoto" decide: o servidor remoto não tem as ferramentas que leem a máquina.
  const toolsFor = sentence => (/remot/i.test(sentence) ? facts.mcp.remote.length : /\blocal\b/i.test(sentence) ? facts.mcp.local.length
    : surface.mcpTools === 'remote' ? facts.mcp.remote.length : facts.mcp.local.length);
  return [
    { fact: 'famílias do catálogo', expect: () => facts.families.total, ...near('(?:famílias|families|familias)'), skip: line => fonts.test(line) },
    { fact: 'átomos', expect: () => facts.families.atoms, ...near('(?:átomos|atoms)') },
    { fact: 'moléculas', expect: () => facts.families.molecules, ...near('(?:moléculas|molecules)') },
    { fact: 'organismos', expect: () => facts.families.organisms, ...near('(?:organismos|organisms)') },
    { fact: 'ferramentas do MCP', expect: toolsFor, ...near('(?:ferramentas|tools|herramientas)') },
    { fact: 'ferramentas do MCP remoto', expect: () => facts.mcp.remote.length, re: new RegExp(`\\b(?:as|the|las) ${NUM} (?:primeiras|first|primeras)\\b`, 'giu'), only: line => /remot/i.test(line) },
    { fact: 'tipos de gráfico D3', expect: () => facts.chartTypes.length, ...near('(?:tipos|types)'), only: line => /\bD3\b|gráfic|chart/i.test(line) },
    { fact: 'trechos compilados', expect: () => facts.snippets, ...near('(?:trechos|snippets|fragmentos)') },
    { fact: 'idiomas', expect: () => facts.locales.length, ...near('(?:idiomas|línguas|languages|lenguas)') },
    { fact: 'templates', expect: () => facts.templates.length, ...near('(?:templates|plantillas|telas inteiras|full screens|pantallas completas)') },
  ];
}

// Promessa de futuro para o que já existe. "pronto" sozinho é texto legítimo ("Tudo pronto!").
export const FORBIDDEN_PHRASES = [
  [/\bem breve\b/i, '"em breve"'],
  [/\bcoming soon\b/i, '"coming soon"'],
  [/\bpr[oó]ximamente\b/i, '"próximamente"'],
  [/\bweb hoje,? mobile\b/i, '"web hoje, mobile em breve"'],
  [/\b(?:estará|ficará|vai ficar|quando estiver|will be|estará listo)\s+pront[oa]s?\b/i, '"pronto" no futuro'],
];

const VERSION_RULES = [
  { re: /@refy-design\/web@(\d+\.\d+\.\d+)/g, fact: 'versão web', expect: f => f.web.version },
  { re: /@refy-design\/mobile@(\d+\.\d+\.\d+)/g, fact: 'versão mobile', expect: f => f.mobile.version },
  { re: /\bplugin \((\d+\.\d+\.\d+)\)/g, fact: 'versão do plugin', expect: f => f.web.version },
  { re: /(?:versão atual|current version|versión actual)\D{0,20}(\d+\.\d+\.\d+)/gi, fact: 'versão atual', expect: f => f.web.version },
  // docs/MCP.md: o remoto carrega a versão atual e a anterior; o exemplo de `version` é a anterior.
  { re: /`version`[^\n]*?\((?:ex\.|e\.g\.|p\. ?ej\.):? `"(\d+\.\d+\.\d+)"`\)/g, fact: 'versão anterior servida pelo MCP remoto', expect: f => f.web.previous },
];

const SPANISH = /\b(?:el|los|las|tiene|tienen|hay|ofrece|sitio|también|del)\b(?!.*\b(?:não|são|tem|também|com|em|e)\b)/i;

/** A frase em que o índice cai: do último ". " antes dele ao próximo depois. */
export function sentenceAt(line, index) {
  const start = line.lastIndexOf('. ', index);
  const end = line.indexOf('. ', index);
  return line.slice(start < 0 ? 0 : start + 2, end < 0 ? line.length : end);
}

/** Tira comentário de código: linha inteira com // ou *, e blocos /* *\/. Mantém a numeração. */
export function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .split('\n').map(line => (/^\s*\/\//.test(line) ? '' : line.replace(/(^|[\s;,)])\/\/\s.*$/, '$1'))).join('\n');
}

export function loadExceptions(root) {
  return existsSync(join(root, EXCEPTIONS)) ? readJson(root, EXCEPTIONS).exceptions : [];
}

/** Confere uma superfície. Devolve achados `arquivo:linha: problema`. */
export function scanText(file, text, facts, surface, exceptions = []) {
  const hits = [];
  const own = exceptions.filter(e => e.file === file);
  const code = /\.(?:[cm]?[jt]sx?)$/.test(file);
  const lines = (code ? stripComments(text) : text).split('\n');
  lines.forEach((line, index) => {
    // A exceção dispensa só o achado dentro do trecho exato; a linha inteira continua como contexto.
    const ranges = own.filter(e => e.text).flatMap(e => {
      const out = [];
      for (let at = line.indexOf(e.text); at > -1; at = line.indexOf(e.text, at + 1)) out.push([at, at + e.text.length]);
      return out;
    });
    const excepted = at => ranges.some(([a, b]) => at >= a && at < b);
    const where = `${file}:${index + 1}`;
    if (!surface.historical) {
      for (const [re, label] of FORBIDDEN_PHRASES)
        for (const m of line.matchAll(new RegExp(re.source, `${re.flags}g`))) if (!excepted(m.index)) hits.push(`${where}: frase proibida ${label} para o que já existe`);
      for (const rule of numberRules(facts, surface)) {
        for (const m of line.matchAll(rule.re)) {
          if (excepted(m.index)) continue;
          const sentence = sentenceAt(line, m.index);
          if (rule.skip?.(sentence) || (rule.only && !rule.only(sentence))) continue;
          // "dos" é número só em espanhol; em português é "de + os" ("dos tipos"). Conta quando o
          // substantivo só existe em espanhol ou a frase é espanhola.
          if (m[1].toLowerCase() === 'dos' && !/\b(?:herramientas|familias|plantillas|lenguas)\b/i.test(m[0]) && !SPANISH.test(sentence)) continue;
          const found = value(m[1]);
          const expected = rule.expect(sentence);
          if (found !== undefined && found !== expected) hits.push(`${where}: ${rule.fact} diz ${m[1]}, o código tem ${expected} ("${m[0].trim()}")`);
        }
      }
      for (const rule of VERSION_RULES)
        for (const m of line.matchAll(rule.re)) {
          if (excepted(m.index)) continue;
          const expected = rule.expect(facts);
          if (expected && m[1] !== expected) hits.push(`${where}: ${rule.fact} diz ${m[1]}, o código tem ${expected}`);
        }
    }
  });
  return hits;
}

/** Conferências estruturadas que não são frase: versões em JSON e o que cada superfície exige. */
export function structuredChecks(root, facts, surfaces) {
  const hits = [];
  if (facts.server !== facts.web.version) hits.push(`server.json: version ${facts.server}, o pacote web é ${facts.web.version}`);
  for (const [file, version] of Object.entries(facts.plugins))
    if (version !== facts.web.version) hits.push(`${file}: version ${version}, o pacote web é ${facts.web.version}`);
  if (facts.catalogVersion !== facts.web.version) hits.push(`ai/catalog.json: packageVersion ${facts.catalogVersion}, o pacote web é ${facts.web.version} (rode npm run agent:build)`);
  const changelog = existsSync(join(root, 'CHANGELOG.md')) ? readText(root, 'CHANGELOG.md') : '';
  if (!changelog.split('\n').some(l => /^#{1,3} /.test(l) && l.includes(facts.web.version))) hits.push(`CHANGELOG.md: sem seção ${facts.web.version}`);
  for (const surface of surfaces)
    for (const need of surface.requires) {
      const files = surfaceFiles(root, surface);
      const text = files.map(f => readText(root, f)).join('\n');
      if (need === 'mcp-tool-names') for (const tool of facts.mcp.local) if (!text.includes(`\`${tool}\``)) hits.push(`${surface.id}: não cita a ferramenta \`${tool}\` do MCP`);
      // Página com o mesmo conteúdo em pt, en e es: cada nome aparece uma vez por idioma.
      const perLocale = (names, label) => {
        for (const name of names) {
          const count = text.split(name.replace(/\{.*\}/, '')).length - 1;
          if (count < facts.locales.length) hits.push(`${surface.id}: ${label} ${name} aparece ${count} vez(es), uma por idioma seriam ${facts.locales.length}`);
        }
      };
      if (need === 'mcp-tools-per-locale') perLocale(facts.mcp.local.map(t => `"${t}"`), 'a ferramenta');
      if (need === 'mcp-resources-per-locale') perLocale(facts.mcp.resources, 'o recurso');
      if (need === 'mcp-resources') for (const uri of facts.mcp.resources) if (!text.includes(uri.replace(/\{.*\}/, ''))) hits.push(`${surface.id}: não cita o recurso ${uri} do MCP`);
      if (need === 'mobile-install' && !text.includes(`expo install ${facts.mobile.name}`)) hits.push(`${surface.id}: não ensina \`expo install ${facts.mobile.name}\``);
      if (need === 'tool-count') {
        const word = Object.entries(WORDS).find(([w, n]) => n === facts.mcp.local.length && /^[a-zêç]+$/.test(w))?.[0];
        if (!new RegExp(`\\b(?:${facts.mcp.local.length}|${word}) ferramentas\\b`, 'i').test(text)) hits.push(`${surface.id}: não diz quantas ferramentas o MCP local tem (${facts.mcp.local.length})`);
      }
      if (need === 'family-levels') {
        const f = facts.families;
        if (!text.includes(`${f.total} famílias (${f.atoms} átomos, ${f.molecules} moléculas e ${f.organisms} organismos)`)) hits.push(`${surface.id}: falta "${f.total} famílias (${f.atoms} átomos, ${f.molecules} moléculas e ${f.organisms} organismos)"`);
      }
    }
  return hits;
}

const TEXT_FILE = /\.(?:md|json|[cm]?[jt]sx?|ya?ml|txt|html)$/;

export function scanSurfaces(root, facts, surfaces = loadSurfaces(root), exceptions = loadExceptions(root), { publicTree = false } = {}) {
  const hits = [];
  const files = trackedFiles(root);
  const covered = new Set();
  for (const surface of surfaces) {
    const own = surfaceFiles(root, surface, files);
    // Na árvore pública as superfícies internas (registros da oficina) não existem.
    if (!own.length && !publicTree) hits.push(`${SURFACES_DIR}/${surface.id}.md: nenhum arquivo casa com ${surface.files.join(', ')}`);
    for (const file of own) {
      if (covered.has(file)) continue;
      covered.add(file);
      if (!TEXT_FILE.test(file)) continue;
      hits.push(...scanText(file, readText(root, file), facts, surface, exceptions));
    }
  }
  const must = matcher(MUST_BE_SURFACE);
  for (const file of files) if (must(file) && !covered.has(file)) hits.push(`${file}: fala do refy e não está em nenhuma superfície de ${SURFACES_DIR}`);
  for (const e of exceptions) {
    if (!e.reason) hits.push(`${EXCEPTIONS}: exceção sem motivo em ${e.file}`);
    if (!e.text?.trim()) { hits.push(`${EXCEPTIONS}: exceção sem texto em ${e.file}`); continue; }
    if (!existsSync(join(root, e.file)) || !readText(root, e.file).includes(e.text)) hits.push(`${EXCEPTIONS}: a linha "${e.text}" não existe mais em ${e.file}; apague a exceção`);
  }
  hits.push(...structuredChecks(root, facts, surfaces));
  return hits;
}

// ---------------------------------------------------------------------------------------------
// Registro de impacto

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}
function tryGit(root, args) { try { return git(root, args); } catch { return null; } }

/** De onde comparar. Num PR a base é obrigatória; fora de branch de trabalho não há registro. */
export function resolveContext(root, env = process.env) {
  if (tryGit(root, ['rev-parse', '--is-inside-work-tree']) !== 'true') return { mode: 'sem-git' };
  const branch = env.GITHUB_HEAD_REF || tryGit(root, ['branch', '--show-current']) || '';
  const pr = env.GITHUB_EVENT_NAME === 'pull_request';
  const wanted = env.DOCS_SYNC_BASE || (env.GITHUB_BASE_REF ? `origin/${env.GITHUB_BASE_REF}` : `origin/${WORK_BRANCH}`);
  const base = tryGit(root, ['rev-parse', '--verify', `${wanted}^{commit}`]);
  if (!base) return pr ? { mode: 'erro', error: `base ${wanted} não encontrada no PR (checkout com fetch-depth: 0)` } : { mode: 'sem-base', branch };
  if (!pr && (!branch || branch === 'main' || branch === WORK_BRANCH)) return { mode: 'integrada', branch };
  // Checkout raso (job que não busca o histórico) não tem ancestral comum com a base.
  const mergeBase = tryGit(root, ['merge-base', base, 'HEAD']);
  if (!mergeBase) return pr ? { mode: 'erro', error: `sem ancestral comum com ${wanted} (checkout com fetch-depth: 0)` } : { mode: 'sem-base', branch };
  return { mode: 'branch', branch, base: wanted, mergeBase };
}

export const recordPath = branch => `${CHANGES_DIR}/${branch.replace(/[^\w.-]+/g, '--')}.json`;

export function changedFiles(root, mergeBase) {
  // Índice contra a base: o que a branch entrega (commits e o que já está staged). Arquivo que um
  // script regenera no meio do check (relatório de evidência) e arquivo revertido não contam.
  return [...new Set(git(root, ['diff', '--name-only', '--cached', mergeBase]).split('\n'))].filter(f => f && !f.startsWith(`${CHANGES_DIR}/`)).sort();
}

export function loadImpactMap(root) {
  return existsSync(join(root, IMPACT_MAP)) ? readJson(root, IMPACT_MAP) : null;
}

/** Superfícies que um arquivo toca: as do mapa e a própria, se o arquivo é texto de superfície. */
export function impactOf(file, map, surfaces) {
  const rules = map.rules.filter(rule => matcher(rule.paths)(file));
  const own = surfaces.filter(s => matcher(s.files)(file)).map(s => s.id);
  return { mapped: rules.length > 0 || own.length > 0, surfaces: [...new Set([...rules.flatMap(r => r.surfaces), ...own])], own };
}

/** Todo arquivo versionado tem entrada no mapa (ou é texto de superfície) e o mapa só cita superfícies que existem. */
export function mapProblems(root, map, surfaces, files = trackedFiles(root)) {
  const problems = [];
  const ids = new Set(surfaces.map(s => s.id));
  for (const rule of map.rules) {
    if (!rule.why) problems.push(`${IMPACT_MAP}: regra ${rule.paths.join(', ')} sem "why"`);
    for (const id of rule.surfaces) if (!ids.has(id)) problems.push(`${IMPACT_MAP}: superfície "${id}" não existe em ${SURFACES_DIR}`);
  }
  for (const file of files) if (!file.startsWith(`${CHANGES_DIR}/`) && !impactOf(file, map, surfaces).mapped) problems.push(`${file}: sem entrada em ${IMPACT_MAP}`);
  return problems;
}

export function expectedRecord(changed, map, surfaces) {
  const impacted = new Map();
  for (const file of changed) {
    const { surfaces: ids } = impactOf(file, map, surfaces);
    for (const id of ids) impacted.set(id, [...(impacted.get(id) ?? []), file]);
  }
  return impacted;
}

export function recordProblems(record, changed, map, surfaces, path) {
  if (!record) return [`${path}: falta o registro de impacto desta branch (node scripts/docs-sync.mjs record)`];
  const problems = [];
  const listed = new Set(record.changed ?? []);
  for (const file of changed) if (!listed.has(file)) problems.push(`${path}: "${file}" mudou e não está em changed (rode record de novo)`);
  for (const file of listed) if (!changed.includes(file)) problems.push(`${path}: "${file}" está em changed e não mudou`);
  const impacted = expectedRecord(changed, map, surfaces);
  for (const [id, files] of impacted) {
    const entry = record.surfaces?.[id];
    if (!entry) { problems.push(`${path}: superfície ${id} impactada por ${files.join(', ')} sem decisão`); continue; }
    const missing = files.filter(file => !(entry.por ?? []).includes(file));
    if (missing.length) problems.push(`${path}: decisão de ${id} é anterior a ${missing.join(', ')}; rode record e decida de novo`);
    if (!STATUSES.includes(entry.status)) problems.push(`${path}: ${id} está "${entry.status}"; feche com ${STATUSES.map(s => `"${s}"`).join(' ou ')}`);
    if (!entry.motivo || entry.motivo.trim().length < 10) problems.push(`${path}: ${id} sem motivo`);
    const surface = surfaces.find(s => s.id === id);
    const touched = changed.filter(matcher(surface.files));
    if (entry.status === 'atualizada' && !touched.length) problems.push(`${path}: ${id} diz "atualizada", mas nenhum arquivo dela mudou`);
    if (entry.status === 'revisada sem mudança' && touched.length) problems.push(`${path}: ${id} diz "revisada sem mudança", mas ${touched.join(', ')} mudou`);
  }
  return problems;
}

function openRecords(root, skip = null) {
  const dir = join(root, CHANGES_DIR);
  if (!existsSync(dir)) return [];
  const problems = [];
  for (const f of readdirSync(dir).filter(f => f.endsWith('.json') && `${CHANGES_DIR}/${f}` !== skip)) {
    const record = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    for (const [id, entry] of Object.entries(record.surfaces ?? {}))
      if (!STATUSES.includes(entry.status)) problems.push(`${CHANGES_DIR}/${f}: ${id} ainda "${entry.status}"`);
  }
  return problems;
}

export function writeRecord(root, ctx, map, surfaces) {
  const changed = changedFiles(root, ctx.mergeBase);
  const path = recordPath(ctx.branch);
  const old = existsSync(join(root, path)) ? readJson(root, path) : { surfaces: {} };
  const impacted = expectedRecord(changed, map, surfaces);
  const entries = {};
  for (const [id, files] of [...impacted].sort(([a], [b]) => a.localeCompare(b))) {
    const prior = old.surfaces?.[id] ?? {};
    // Arquivo novo tocando a superfície reabre a decisão: o motivo antigo não cobre o que veio depois.
    const same = prior.por && files.every(file => prior.por.includes(file));
    entries[id] = same ? { status: prior.status, motivo: prior.motivo, por: files } : { status: 'pendente', motivo: prior.motivo ? `(antes: ${prior.motivo})` : '', por: files };
  }
  const record = { branch: ctx.branch, base: ctx.base, changed, surfaces: entries };
  mkdirSync(join(root, CHANGES_DIR), { recursive: true });
  writeFileSync(join(root, path), `${JSON.stringify(record, null, 2)}\n`);
  return { path, record };
}

// ---------------------------------------------------------------------------------------------
// Pedido de atualização por superfície

export function writePlan(root, ctx, map, surfaces, facts, out) {
  const changed = changedFiles(root, ctx.mergeBase);
  const impacted = expectedRecord(changed, map, surfaces);
  const path = recordPath(ctx.branch);
  const record = existsSync(join(root, path)) ? readJson(root, path) : { surfaces: {} };
  mkdirSync(out, { recursive: true });
  const written = [];
  for (const [id, files] of impacted) {
    const surface = surfaces.find(s => s.id === id);
    const code = files.filter(f => !matcher(surface.files)(f));
    let diff = '';
    try { diff = execFileSync('git', ['diff', `${ctx.mergeBase}`, '--', ...code], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 26 }); } catch {}
    if (diff.length > 60_000) diff = `${diff.slice(0, 60_000)}\n[... diff cortado em 60 mil caracteres; leia o resto com git diff ${ctx.mergeBase} -- <arquivo>]`;
    const status = record.surfaces?.[id]?.status ?? 'pendente';
    const text = `# Atualizar a superfície ${id}: ${surface.title}

Status no registro: **${status}**. Registro: \`${path}\`.

Você cuida só desta superfície. Leia o que ela afirma e de onde vem cada afirmação (abaixo), compare com o
que mudou no código e atualize o texto nas três línguas quando houver: pt, en e es mudam juntas. Nada de
número ou versão escrito de memória: use os fatos calculados abaixo. Sem travessão, sem "em breve" para o
que já existe.

Ao terminar, grave no registro, em \`surfaces.${id}\`:
- \`"status": "atualizada"\` se você mudou algum arquivo desta superfície, ou
- \`"status": "revisada sem mudança"\` se o texto continua certo,
- e \`"motivo"\` com uma frase dizendo o que mudou ou por que nada precisava mudar.

Depois rode \`node scripts/docs-sync.mjs --check\`.

## Arquivos da superfície

${surfaceFiles(root, surface).map(f => `- ${f}`).join('\n')}

## Contrato da superfície

${surface.body.trim()}

## O que mudou e toca esta superfície

${files.map(f => `- ${f}`).join('\n')}

## Fatos calculados do código

\`\`\`json
${JSON.stringify(facts, null, 2)}
\`\`\`

## Diff do código

\`\`\`diff
${diff.trim() || '(só texto da própria superfície mudou)'}
\`\`\`
`;
    const file = join(out, `${id}.md`);
    writeFileSync(file, text);
    written.push(file);
  }
  return written;
}

// ---------------------------------------------------------------------------------------------
// Comando

export async function check(root, { env = process.env, log = console.log } = {}) {
  const facts = await computeFacts(root);
  const surfaces = loadSurfaces(root);
  const map = loadImpactMap(root);
  const problems = scanSurfaces(root, facts, surfaces, loadExceptions(root), { publicTree: !map });
  const ctx = resolveContext(root, env);
  let note = '';
  if (!map) note = 'sem mapa de impacto (árvore pública): só os fatos';
  else {
    // Sem git não há como separar o versionado do que a rodada gerou: a cobertura do mapa
    // é conferida na branch, com git; aqui ficam só os fatos.
    if (ctx.mode !== 'sem-git') problems.push(...mapProblems(root, map, surfaces));
    problems.push(...openRecords(root, ctx.mode === 'branch' ? recordPath(ctx.branch) : null));
    if (ctx.mode === 'erro') problems.push(ctx.error);
    else if (ctx.mode === 'branch') {
      const changed = changedFiles(root, ctx.mergeBase);
      const path = recordPath(ctx.branch);
      if (changed.length) {
        const record = existsSync(join(root, path)) ? readJson(root, path) : null;
        problems.push(...recordProblems(record, changed, map, surfaces, path));
      }
      note = `registro ${path} contra ${ctx.base}`;
    } else note = ctx.mode === 'sem-git' ? 'sem git: só os fatos' : `branch ${ctx.branch || '(destacada)'}: sem registro a conferir`;
  }
  if (problems.length) return { ok: false, problems, facts };
  log(`OK: ${surfaces.length} superfícies em sincronia com o código (${facts.families.total} famílias, web ${facts.web.version}, mobile ${facts.mobile.version}, MCP ${facts.mcp.local.length}/${facts.mcp.remote.length}); ${note}.`);
  return { ok: true, problems, facts };
}

async function main(argv) {
  const root = process.cwd();
  const [command] = argv;
  if (command === 'facts') { console.log(JSON.stringify(await computeFacts(root), null, 2)); return 0; }
  if (command === 'record' || command === 'plan') {
    const map = loadImpactMap(root);
    if (!map) { console.error(`${IMPACT_MAP} não existe`); return 1; }
    const ctx = resolveContext(root);
    if (ctx.mode !== 'branch') { console.error(`record e plan rodam numa branch de trabalho com base conhecida (agora: ${ctx.mode}${ctx.error ? `, ${ctx.error}` : ''})`); return 1; }
    const surfaces = loadSurfaces(root);
    if (command === 'record') {
      const { path, record } = writeRecord(root, ctx, map, surfaces);
      const open = Object.entries(record.surfaces).filter(([, e]) => !STATUSES.includes(e.status)).map(([id]) => id);
      console.log(`${path}: ${record.changed.length} arquivos, ${Object.keys(record.surfaces).length} superfícies impactadas${open.length ? `, abertas: ${open.join(', ')}` : ', todas fechadas'}.`);
      return 0;
    }
    const outIndex = argv.indexOf('--out');
    const out = resolve(outIndex > -1 ? argv[outIndex + 1] : join(tmpdir(), `docs-sync-plan-${ctx.branch.replace(/[^\w.-]+/g, '--')}`));
    const written = writePlan(root, ctx, map, surfaces, await computeFacts(root), out);
    console.log(written.length ? `${written.length} pedidos em ${out}:\n${written.map(f => `  ${f}`).join('\n')}` : 'Nenhuma superfície impactada.');
    return 0;
  }
  if (command === '--check' || command === 'check' || !command) {
    const result = await check(root);
    if (!result.ok) {
      console.error(`docs-sync reprovou: ${result.problems.length} divergência(s) entre o código e as superfícies.\n${result.problems.map(p => `  ${p}`).join('\n')}\n\nPara corrigir: node scripts/docs-sync.mjs plan, um agente por superfície, e de novo --check.`);
      return 1;
    }
    return 0;
  }
  console.error('uso: node scripts/docs-sync.mjs [facts | --check | record | plan [--out pasta]]');
  return 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
