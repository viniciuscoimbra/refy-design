import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, mkdirSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import {
  check, chartTypes, resolveContext, computeFacts, globToRegExp, impactOf, parseSurface, recordProblems, scanSurfaces, scanText, sentenceAt,
} from '../scripts/docs-sync.mjs';

// Pedido de 13/11/2026: nenhuma superfície diz número, versão ou promessa que o código desmente.
const facts = {
  web: { name: '@refy-design/web', version: '1.8.0', previous: '1.7.0' },
  mobile: { name: '@refy-design/mobile', version: '1.1.0', components: 120 },
  families: { total: 122, atoms: 33, molecules: 63, organisms: 26 },
  catalogVersion: '1.8.0',
  mcp: { local: ['refy_search', 'refy_compare'], remote: ['refy_search'] },
  chartTypes: Array.from({ length: 24 }, (_, i) => `t${i}`),
  snippets: 524,
  templates: Array.from({ length: 20 }, (_, i) => `b${i}`),
  themes: ['refy'],
  locales: ['pt', 'en', 'es'],
  server: '1.8.0',
  plugins: {},
};
const surface = parseSurface('---\nid: readme\nfiles: README.md\n---\ntexto\n');
const scan = (text, file = 'README.md', s = surface) => scanText(file, text, facts, s);

test('reprova "117 famílias" e aceita o número do catálogo', () => {
  assert.equal(scan('Guia das 117 famílias.').length, 1);
  assert.deepEqual(scan('Guia das 122 famílias (33 átomos, 63 moléculas e 26 organismos).'), []);
  assert.equal(scan('122 famílias (30 átomos, 63 moléculas e 26 organismos)').length, 1);
});

test('reprova "em breve" e as variantes nas três línguas, sem pegar texto vizinho', () => {
  for (const line of ['React Native: em breve.', 'Mobile coming soon.', 'Móvil próximamente.', 'Web hoje, mobile em breve.', 'O mobile estará pronto na 2.0.'])
    assert.ok(scan(line).length >= 1, line);
  for (const line of ['Use it for a setting that takes effect as soon as it changes.', 'Tudo pronto!', 'Componentes prontos para combinar.', 'Para começar de um projeto pronto, copie o exemplo.'])
    assert.deepEqual(scan(line), [], line);
});

test('ferramentas do MCP: local na frase comum, remoto quando a frase fala do remoto', () => {
  assert.deepEqual(scan('São duas ferramentas: `refy_search` e `refy_compare`. O servidor remoto tem a primeira.'), []);
  assert.equal(scan('São três ferramentas.').length, 1);
  assert.deepEqual(scan('O servidor remoto tem uma ferramenta.'), []);
  assert.equal(scan('O servidor remoto tem duas ferramentas.').length, 1);
  assert.equal(sentenceAt('Um. Dois três. Quatro', 5), 'Dois três');
});

test('número fora de contexto ou de outra coisa não vira divergência', () => {
  assert.deepEqual(scan('Os 23 componentes testados renderizam num Server Component.'), []);
  assert.deepEqual(scan('DM Sans + Geist Mono tem duas famílias: títulos e corpo.'), []);
  assert.deepEqual(scan('Gráficos D3 com 24 tipos.'), []);
  assert.equal(scan('Gráficos D3 com 30 tipos.').length, 1);
  assert.deepEqual(scan('O mesmo nos três idiomas.'), []);
  assert.equal(scan('O mesmo nos quatro idiomas.').length, 1);
  assert.deepEqual(scan('Os 524 trechos compilam.'), []);
  assert.equal(scan('Os 523 trechos compilam.').length, 1);
});

test('versão: pin do pacote, exemplo do MCP remoto e histórico fora da conta', () => {
  assert.equal(scan('npx -y -p @refy-design/web@1.2.0 refy-mcp').length, 1);
  assert.deepEqual(scan('npx -y -p @refy-design/web@1.8.0 refy-mcp'), []);
  assert.equal(scan('baixa na versão exata do plugin (1.7.0) do npm').length, 1);
  assert.equal(scan('"--package=@refy-design/web@1.7.0",', 'plugins/refy-local/.mcp.json').length, 1);
  assert.equal(scan('passe `version` (ex.: `"1.2.0"`) para ler a API').length, 1);
  assert.deepEqual(scan('passe `version` (ex.: `"1.7.0"`) para ler a API'), []);
  const history = parseSurface('---\nid: changelog\nfiles: CHANGELOG.md\nhistorical: sim\n---\n');
  assert.deepEqual(scan('O README dizia 118 famílias e React Native "em breve".', 'CHANGELOG.md', history), []);
});

test('comentário de código não conta como texto do site', () => {
  assert.deepEqual(scan('// a ficha Charts já tem os 30 tipos de gráfico\nconst x = 1;', 'Site.tsx'), []);
  assert.equal(scan('const label = "Explorar catálogo D3 · 30 tipos";', 'Site.tsx').length, 1);
});

test('revisão de Codex: local e remoto pela frase, "dos" espanhol e exceção que não cobre o resto da linha', () => {
  const remote = parseSurface('---\nid: plugins\nfiles: README.md\nmcpTools: remote\n---\n');
  assert.deepEqual(scan('O servidor local oferece duas ferramentas.', 'README.md', remote), []);
  assert.equal(scan('O plugin tem duas ferramentas.', 'README.md', remote).length, 1);
  assert.equal(scan('El servidor local ofrece tres herramientas.').length, 1);
  assert.deepEqual(scan('El servidor local ofrece dos herramientas.'), []);
  assert.deepEqual(scan('A lista dos tipos de gráfico D3.'), []);
  assert.deepEqual(scan('A lista dos fragmentos compilados.'), []);
  assert.equal(scan('El sitio tiene dos idiomas.').length, 1);
  assert.deepEqual(scan('Cada um dos idiomas possui tradução própria.'), []);
  assert.deepEqual(scanText('README.md', 'Hoje 122 famílias.', facts, surface, [{ file: 'README.md', text: '' }]), []);
  const d3 = [{ file: 'README.md', text: 'em 22/10 havia 30 tipos' }];
  assert.equal(scanText('README.md', 'Gráficos D3 (em 22/10 havia 30 tipos) agora têm 99 tipos.', facts, surface, d3).length, 1);
  assert.deepEqual(scanText('README.md', 'Gráficos D3 (em 22/10 havia 30 tipos) agora têm 24 tipos.', facts, surface, d3), []);
  const exceptions = [{ file: 'README.md', text: 'Rodada de 22/10: 113 famílias.' }];
  assert.deepEqual(scanText('README.md', 'Rodada de 22/10: 113 famílias.', facts, surface, exceptions), []);
  assert.equal(scanText('README.md', 'Rodada de 22/10: 113 famílias. Hoje 999 famílias, mobile em breve.', facts, surface, exceptions).length, 2);
});

test('exceção vale só para a linha exata e expira quando a linha some', () => {
  const root = mkdtempSync(join(tmpdir(), 'docs-sync-'));
  try {
    mkdirSync(join(root, 'docs/sync/surfaces'), { recursive: true });
    writeFileSync(join(root, 'docs/sync/surfaces/readme.md'), '---\nid: readme\nfiles: README.md, CHANGELOG.md\n---\n');
    writeFileSync(join(root, 'CHANGELOG.md'), '## 1.8.0 (13/11/2026)\n');
    writeFileSync(join(root, 'README.md'), 'Rodada de 22/10: 113 famílias.\nHoje são 117 famílias.\n');
    const exceptions = [{ file: 'README.md', text: 'Rodada de 22/10: 113 famílias.', reason: 'registro datado' }];
    const hits = scanSurfaces(root, facts, undefined, exceptions);
    assert.deepEqual(hits, ['README.md:2: famílias do catálogo diz 117, o código tem 122 ("117 famílias")']);
    writeFileSync(join(root, 'README.md'), 'Hoje são 122 famílias.\n');
    assert.match(scanSurfaces(root, facts, undefined, exceptions).join('\n'), /não existe mais em README.md; apague a exceção/);
    writeFileSync(join(root, 'server.json'), '{}');
    assert.match(scanSurfaces(root, facts, undefined, []).join('\n'), /server.json: fala do refy e não está em nenhuma superfície/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('registro de impacto: superfície tocada precisa de decisão com motivo', () => {
  const surfaces = [parseSurface('---\nid: readme\nfiles: README.md\n---\n'), parseSurface('---\nid: docs-mcp\nfiles: docs/MCP.md\n---\n')];
  const map = { rules: [{ paths: ['tools/**'], surfaces: ['readme', 'docs-mcp'], why: 'MCP' }] };
  const changed = ['README.md', 'tools/refy-agent/mcp-server.mjs'];
  assert.deepEqual(impactOf('tools/x.mjs', map, surfaces).surfaces, ['readme', 'docs-mcp']);
  assert.equal(impactOf('outro/x.mjs', map, surfaces).mapped, false);
  assert.match(recordProblems(null, changed, map, surfaces, 'r.json')[0], /falta o registro/);
  const open = { changed, surfaces: { readme: { status: 'pendente', motivo: '' } } };
  const problems = recordProblems(open, changed, map, surfaces, 'r.json').join('\n');
  assert.match(problems, /readme está "pendente"/);
  assert.match(problems, /docs-mcp impactada .* sem decisão/);
  const lying = { changed, surfaces: { readme: { status: 'revisada sem mudança', motivo: 'nada a mudar aqui' }, 'docs-mcp': { status: 'atualizada', motivo: 'tabela de ferramentas' } } };
  const lies = recordProblems(lying, changed, map, surfaces, 'r.json').join('\n');
  assert.match(lies, /readme diz "revisada sem mudança", mas README.md mudou/);
  assert.match(lies, /docs-mcp diz "atualizada", mas nenhum arquivo dela mudou/);
  const por = { readme: changed, 'docs-mcp': ['tools/refy-agent/mcp-server.mjs'] };
  const closed = { changed, surfaces: { readme: { status: 'atualizada', motivo: 'nova ferramenta na lista', por: por.readme }, 'docs-mcp': { status: 'revisada sem mudança', motivo: 'a tabela já cita a ferramenta', por: por['docs-mcp'] } } };
  assert.deepEqual(recordProblems(closed, changed, map, surfaces, 'r.json'), []);
  // Revisão de Codex: decisão fechada não cobre arquivo que passou a tocar a superfície depois.
  const later = [...changed, 'tools/refy-agent/remote.mjs'];
  assert.match(recordProblems({ ...closed, changed: later }, later, map, surfaces, 'r.json').join('\n'), /decisão de docs-mcp é anterior a tools\/refy-agent\/remote.mjs/);
});

test('checkout raso: sem ancestral comum não roda git diff vazio', () => {
  const root = mkdtempSync(join(tmpdir(), 'docs-sync-raso-'));
  try {
    const g = (...args) => execFileSync('git', args, { cwd: root, stdio: 'ignore' });
    g('init', '-q', '-b', 'feature'); g('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'a');
    g('checkout', '-q', '--orphan', 'base'); g('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'b');
    g('update-ref', 'refs/remotes/origin/base', 'HEAD'); g('checkout', '-q', 'feature');
    assert.equal(resolveContext(root, { DOCS_SYNC_BASE: 'origin/base' }).mode, 'sem-base');
    assert.equal(resolveContext(root, { DOCS_SYNC_BASE: 'origin/base', GITHUB_EVENT_NAME: 'pull_request' }).mode, 'erro');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('árvore exportada pela promoção: saída da rodada não vira arquivo sem mapa', async () => {
  // Falha da promoção da 1.8.1: o Firefox em contêiner deixa test-results-firefox/ na árvore sem git.
  const root = mkdtempSync(join(tmpdir(), 'docs-sync-export-'));
  try {
    // O teste também roda dentro da árvore exportada (prepack da promoção), sem git: copia os
    // arquivos versionados quando há git e, sem git, a pasta fora do que a rodada gera.
    const skip = /^(node_modules|\.git|dist|dist-site.*|storybook-static|test-results.*|playwright-report.*)$/;
    let files;
    try {
      files = execFileSync('git', ['ls-files', '-c', '-z'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 28 }).split('\0').filter(Boolean);
    } catch {
      files = [];
      const walk = dir => {
        for (const entry of readdirSync(dir || '.', { withFileTypes: true })) {
          if (skip.test(entry.name)) continue;
          const path = dir ? join(dir, entry.name) : entry.name;
          if (entry.isDirectory()) walk(path); else if (entry.isFile()) files.push(path);
        }
      };
      walk('');
    }
    for (const file of files) {
      if (!existsSync(file) || !statSync(file).isFile()) continue;
      mkdirSync(dirname(join(root, file)), { recursive: true });
      copyFileSync(file, join(root, file));
    }
    symlinkSync(join(process.cwd(), 'node_modules'), join(root, 'node_modules'));
    mkdirSync(join(root, 'test-results-firefox'));
    writeFileSync(join(root, 'test-results-firefox/.last-run.json'), '{}');
    writeFileSync(join(root, 'rodada.log'), 'saída de uma rodada');
    const result = await check(root, { env: {}, log: () => {} });
    assert.deepEqual(result.problems, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('fatos vêm do código: tipos D3, glob e o repositório inteiro em sincronia', async () => {
  assert.deepEqual(chartTypes('export type AType = "a" | "b";\n| { type: "c"; x: 1 }'), ['a', 'b', 'c']);
  assert(globToRegExp('plugins/**').test('plugins/refy/.mcp.json'));
  assert(globToRegExp('docs/*.md').test('docs/MCP.md') && !globToRegExp('docs/*.md').test('docs/sub/a.md'));
  const real = await computeFacts();
  assert.equal(real.chartTypes.length, 24);
  assert.deepEqual(real.mcp.remote, real.mcp.local.filter(t => t !== 'refy_compare'));
  const result = await check(process.cwd(), { env: { ...process.env, DOCS_SYNC_BASE: '', GITHUB_EVENT_NAME: '' }, log: () => {} });
  assert.deepEqual(result.problems.filter(p => !p.includes('docs/sync/changes')), []);
});
