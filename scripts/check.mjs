import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BlogBlock, Button, Input, BrandLogo, ThemeProvider, ContentCard, PropertyCard, MediaGallery, PropertyMedia, SchedulePicker, VisitSchedulePicker, DecisionActions, DecisionDeck, Select, fontSets, CodeBlock, EventTimeline, ActivityTimeline, KanbanBoard, Carousel } from '@refy-design/web';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
assert.equal(pkg.license, 'MIT');
assert.match(readFileSync('LICENSE', 'utf8'), /Copyright \(c\) 2026 Vinícius Coimbra/);
for (const target of ['dist/index.js', 'dist/index.d.ts', 'dist/style.css', 'src/tokens/tokens.css', 'src/styles/global.css']) assert(existsSync(target), `Arquivo de distribuição ausente: ${target}`);
const loading = renderToStaticMarkup(React.createElement(Button, { loading: true }, 'Salvar'));
assert.match(loading, /disabled/);
assert.match(loading, /aria-busy="true"/);
const input = renderToStaticMarkup(React.createElement(Input, { label: 'Nome', required: true }));
assert.match(input, /Nome/);
assert.match(input, /required/);
const wordmark = renderToStaticMarkup(React.createElement(BrandLogo));
const mark = renderToStaticMarkup(React.createElement(BrandLogo, { markOnly: true, animated: false }));
assert.match(wordmark, /role="img" aria-label="refy"/);
assert.match(wordmark, />refy</);
assert.match(mark, />r</);
assert.doesNotMatch(mark, />refy</);
const css = readFileSync('src/tokens/tokens.css', 'utf8');
for (const theme of ['light', 'dark', 'editorial']) assert(css.includes(`[data-theme="${theme}"]`));
assert.deepEqual([...new Set([...css.matchAll(/\[data-theme="([^"]+)"\]/g)].map((m) => m[1]))].filter((t) => !['light', 'dark', 'editorial'].includes(t)), [], 'tokens.css só define os temas públicos');
assert(!existsSync('src/prototypes'), 'Protótipos internos não pertencem ao repositório público');
console.log('OK: distribuição, MIT, temas e renderização de Button, Input e BrandLogo.');
const carousel = renderToStaticMarkup(React.createElement(Carousel, {items:[{id:'one',label:'Um',content:'Primeiro'},{id:'two',label:'Dois',content:'Segundo'}]}));
assert.match(carousel, /aria-hidden="true" inert=""/);
assert.equal((carousel.match(/ inert=/g) || []).length, 1);


assert.throws(() => renderToStaticMarkup(React.createElement(ThemeProvider, { theme: { name: 'bad', tokens: { color: 'red' } } }, 'x')), /Invalid theme token/);
const scoped = renderToStaticMarkup(React.createElement(ThemeProvider, { theme: { name: 'synthetic', tokens: { '--radius-default': '12px' } } }, 'x'));
assert.match(scoped, /data-refy-brand="synthetic"/);
assert.match(scoped, /data-theme="light"/);
assert.match(scoped, /--radius-default:12px/);

// Canonical names keep the existing implementation and translate only the domain event.
assert.equal(ActivityTimeline, EventTimeline);
assert.equal(ContentCard, PropertyCard);
assert.equal(MediaGallery, PropertyMedia);
assert.equal(SchedulePicker, VisitSchedulePicker);
let decision;
const actions = DecisionActions({ activeAction: 'select', onAction: value => { decision = value; } });
assert.equal(actions.props.activeAction, 'visit');
actions.props.onAction('visit');
assert.equal(decision, 'select');
const deck = DecisionDeck({ items: [], onAction: (action, item) => { decision = [action, item.id]; } });
deck.props.onAction('visit', { id: 'example' });
assert.deepEqual(decision, ['select', 'example']);
for (const file of ['inter', 'space-grotesk', 'jetbrains-mono']) {
  assert(existsSync(`src/assets/fonts/${file}-latin.woff2`));
  assert(existsSync(`src/assets/fonts/${file}-OFL.txt`));
}
console.log('OK: nomes canônicos, compatibilidade de eventos e fontes locais licenciadas.');

const selects = renderToStaticMarkup(React.createElement('div', {}, React.createElement(Select, { label: 'Modo' }, React.createElement('option', {}, 'Claro')), React.createElement(Select, { label: 'Modo' }, React.createElement('option', {}, 'Escuro'))));
const selectIds = [...selects.matchAll(/<select[^>]*id="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(selectIds).size, 2, 'Rótulos repetidos precisam de IDs distintos');
for (const set of Object.values(fontSets)) {
  for (const token of ['--font-brand', '--font-heading', '--font-headline', '--font-body', '--font-mono']) assert(set.tokens[token]);
}
for (const match of readFileSync('src/styles/fonts.css', 'utf8').matchAll(/url\(\.\.\/assets\/fonts\/([^)]*)\)/g)) assert(existsSync(`src/assets/fonts/${match[1]}`));
for (const family of ['manrope', 'sourcesans3', 'sourcecodepro', 'ibmplexsans', 'ibmplexmono', 'dmsans', 'geistmono', 'ibmplexserif']) assert.match(readFileSync(`src/assets/fonts/${family}-OFL.txt`, 'utf8'), /SIL OPEN FONT LICENSE/);
console.log('OK: presets públicos, arquivos/licenças de fontes e rótulos únicos de Select.');

for (const [language, code, role] of [
  ['tsx', 'const Demo = () => <Button title="Texto" />;', 'keyword'],
  ['json', '{"name": "Tema", "size": 16}', 'property'],
  ['css', '.button { color: #087f5b; }', 'property'],
  ['bash', 'if true; then echo "ok"; fi', 'keyword'],
]) {
  const markup = renderToStaticMarkup(React.createElement(CodeBlock, { code, language }));
  assert(markup.includes(`data-syntax="${role}"`), `Realce ausente: ${language}/${role}`);
}
const plainCode = renderToStaticMarkup(React.createElement(CodeBlock, { language: 'unknown', code: '<script>alert(1)</script>' }));
assert.doesNotMatch(plainCode, /data-syntax=|<script>/);
assert.match(plainCode, /&lt;script&gt;/);
const maskedCode = renderToStaticMarkup(React.createElement(CodeBlock, { language: 'tsx', code: 'secret_value_demo', secret: true }));
assert.doesNotMatch(maskedCode, /secret_value_demo|data-syntax=/);
const customCode = renderToStaticMarkup(React.createElement(CodeBlock, { code: 'raw_should_not_render', language: 'tsx' }, React.createElement('span', { 'data-custom': 'true' }, 'curated')));
assert.match(customCode, /data-custom="true"/);
assert.doesNotMatch(customCode, /raw_should_not_render/);
console.log('OK: CodeBlock TSX/JSON/CSS/Bash, fallback escapado, segredo e conteúdo customizado.');

assert.throws(() => renderToStaticMarkup(React.createElement(KanbanBoard, { columns: [{ id: 'todo', title: 'A fazer', items: [] }], wipLimit: -1 })), /WIP/);
assert.throws(() => renderToStaticMarkup(React.createElement(KanbanBoard, { columns: [{ id: 'todo', title: 'A fazer', items: [{id: 'a', title: 'Um'}, {id: 'a', title: 'Dois'}] }] })), /unique, non-empty IDs/);

assert(!existsSync("dist/review"), "Capturas de QA não pertencem ao pacote da biblioteca");
const article = renderToStaticMarkup(React.createElement(BlogBlock));
assert.match(article, /How to change your product(&#x27;|')s theme/);
assert.doesNotMatch(article, /ROI do não|Growth Partners/);
