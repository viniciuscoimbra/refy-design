// Issue viniciuscoimbra/refy-design#12: o modelo "Falta no refy" pedia a label `gap`, que não
// existia no repositório público. As labels dos modelos ficam em .github/labels.json, e o
// workflow labels.yml as cria no público.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const TEMPLATES = '.github/ISSUE_TEMPLATE';
const LABELS = '.github/labels.json';
const WORKFLOW = '.github/workflows/labels.yml';

// Os modelos declaram as labels numa linha só, no formato de fluxo: labels: ["a", "b"].
function templateLabels() {
  return readdirSync(TEMPLATES).filter(file => file.endsWith('.yml')).flatMap(file => {
    const list = readFileSync(`${TEMPLATES}/${file}`, 'utf8').match(/^labels:\s*\[(.*)\]\s*$/m)?.[1] ?? '';
    return [...list.matchAll(/["']([^"']+)["']/g)].map(match => match[1]);
  });
}

test('toda label citada num modelo de issue existe em .github/labels.json', () => {
  assert.ok(existsSync(LABELS), `${LABELS} não existe`);
  const declared = JSON.parse(readFileSync(LABELS, 'utf8')).map(label => label.name);
  const used = templateLabels();
  assert.ok(used.length > 0, 'nenhuma label lida dos modelos');
  for (const label of used) assert.ok(declared.includes(label), `label ${label} ausente`);
});

test('o workflow de labels só roda no repositório público e em runner do GitHub', () => {
  assert.ok(existsSync(WORKFLOW), `${WORKFLOW} não existe`);
  const workflow = readFileSync(WORKFLOW, 'utf8');
  const runsOn = [...workflow.matchAll(/^\s+runs-on:\s*(.+?)\s*$/gm)].map(match => match[1]);
  const conditions = [...workflow.matchAll(/^\s+if:\s*(.+?)\s*$/gm)].map(match => match[1]);
  assert.ok(runsOn.length > 0, 'nenhum job com runs-on');
  assert.deepEqual(runsOn.filter(runner => runner !== 'ubuntu-latest'), []);
  assert.equal(conditions.length, runsOn.length, 'todo job precisa do if do repositório público');
  for (const condition of conditions) assert.equal(condition, "github.repository == 'viniciuscoimbra/refy-design'");
});
