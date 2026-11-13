// COVG-01/02: qual teste prova a interação principal de cada família do catálogo.
// A ligação vem de uma marca escrita no spec, logo acima do test():
//   // interação: Combobox, Select
// Busca pelo nome da família não serve: citar Button num teste que clica em outra
// coisa não prova o Button. Título do teste também não: ele nomeia o snapshot.
//
//   node scripts/interaction-coverage.mjs          grava o relatório e encolhe a catraca
//   node scripts/interaction-coverage.mjs --check  falha se o relatório estiver velho,
//       se uma marca citar família que não existe ou se aparecer família sem teste
//       fora da lista registrada em docs/interaction-coverage.json (a catraca).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const REPORT = 'docs/INTERACTION_COVERAGE.md';
const BASELINE = 'docs/interaction-coverage.json';
const MARK = /^\s*\/\/\s*interação:\s*(.+?)\s*$/;
const TEST = /^\s*test\(\s*(?:`([^`]*)`|'([^']*)'|"([^"]*)")/;

/** Marcas de um spec: cada uma vale para o primeiro test() logo abaixo. */
export function marksOf(file, source) {
  const lines = source.split('\n');
  const marks = [];
  lines.forEach((line, index) => {
    const mark = line.match(MARK);
    if (!mark) return;
    const next = lines[index + 1]?.match(TEST);
    const families = mark[1].split(',').map((name) => name.trim()).filter(Boolean);
    marks.push({ file, line: index + 2, title: next ? (next[1] ?? next[2] ?? next[3]) : null, families });
  });
  return marks;
}

export function coverage(familyIds, marks) {
  const known = new Set(familyIds);
  const problems = [];
  const covered = new Map();
  for (const mark of marks) {
    if (!mark.title) problems.push(`${mark.file}:${mark.line - 1}: marca de interação sem test() logo abaixo`);
    for (const family of mark.families) {
      if (!known.has(family)) { problems.push(`${mark.file}:${mark.line - 1}: família desconhecida "${family}"`); continue; }
      if (!covered.has(family)) covered.set(family, []);
      covered.get(family).push(mark);
    }
  }
  const missing = familyIds.filter((id) => !covered.has(id));
  return { covered, missing, problems };
}

/** Catraca: família sem teste fora da lista registrada reprova; sair da lista só pede atualização. */
export function ratchet(missing, baseline) {
  const allowed = new Set(baseline);
  return {
    regressions: missing.filter((id) => !allowed.has(id)),
    improved: baseline.filter((id) => !missing.includes(id)),
  };
}

export function render(familyIds, { covered, missing }) {
  const rows = familyIds.filter((id) => covered.has(id)).map((id) =>
    `| ${id} | ${covered.get(id).map((m) => `\`${m.file}:${m.line}\` ${m.title.replace(/\|/g, '\\|')}`).join('<br>')} |`);
  return [
    '# Cobertura de interação por família',
    '',
    'Gerado por `node scripts/interaction-coverage.mjs` a partir das marcas `// interação: <Família>` nos specs de `tests/`. Render, tema, contraste e fonte de todas as famílias são cobertos por `tests/catalog.spec.ts`; esta tabela trata só de interação (clique, teclado, toque, foco).',
    '',
    `${covered.size} de ${familyIds.length} famílias têm teste de interação marcado; ${missing.length} não têm.`,
    '',
    '| Família | Teste |',
    '|---|---|',
    ...rows,
    '',
    '## Sem teste de interação',
    '',
    missing.join(', '),
    '',
  ].join('\n');
}

function load(root = '.') {
  const familyIds = JSON.parse(readFileSync(join(root, 'ai/catalog.json'), 'utf8')).components.map((c) => c.id);
  const specs = readdirSync(join(root, 'tests')).filter((f) => f.endsWith('.spec.ts')).sort();
  const marks = specs.flatMap((f) => marksOf(`tests/${f}`, readFileSync(join(root, 'tests', f), 'utf8')));
  return { familyIds, result: coverage(familyIds, marks) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { familyIds, result } = load();
  const report = render(familyIds, result);
  if (process.argv.includes('--check')) {
    const errors = [...result.problems];
    let current = '';
    try { current = readFileSync(REPORT, 'utf8'); } catch { /* ausente conta como velho */ }
    if (current !== report) errors.push(`${REPORT} desatualizado: rode node scripts/interaction-coverage.mjs`);
    const { regressions, improved } = ratchet(result.missing, JSON.parse(readFileSync(BASELINE, 'utf8')).withoutInteractionTest);
    for (const id of regressions) errors.push(`${id}: família sem teste de interação fora de ${BASELINE}. Marque o teste com // interação: ${id}`);
    if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
    if (improved.length) console.log(`Tire de ${BASELINE}: ${improved.join(', ')} já têm teste.`);
    console.log(`OK: ${result.covered.size} de ${familyIds.length} famílias com teste de interação.`);
  } else {
    writeFileSync(REPORT, report);
    // A catraca só encolhe: regenerar não aceita família nova sem teste.
    let baseline = result.missing;
    try { baseline = JSON.parse(readFileSync(BASELINE, 'utf8')).withoutInteractionTest.filter((id) => result.missing.includes(id)); } catch { /* primeira vez */ }
    writeFileSync(BASELINE, `${JSON.stringify({ about: 'Catraca de COVG-02: famílias sem teste de interação. Só diminui.', withoutInteractionTest: baseline }, null, 2)}\n`);
    console.log(`${REPORT}: ${result.covered.size} de ${familyIds.length} famílias com teste de interação.`);
  }
}
