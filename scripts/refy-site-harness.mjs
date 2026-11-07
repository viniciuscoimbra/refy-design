import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import ts from 'typescript';

const require = createRequire(import.meta.url);
// Reuse the PNG codec shipped with the pinned Playwright version. No browser launch.
const { PNG } = require(path.join(path.dirname(require.resolve('playwright-core/package.json')), 'lib/utilsBundle.js'));
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const absolute = (file) => path.join(root, file);
const read = (file) => fs.readFileSync(absolute(file));
const json = (file) => JSON.parse(read(file));
const sha = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const contractFile = 'tests/refy-site/contract.json';
const out = 'docs/evidence/refy-site/current';
const siteTasks = 'openspec/changes/implement-refy-site-theme/tasks.md';

function walk(directory) {
  return fs.readdirSync(absolute(directory), { withFileTypes: true }).flatMap(entry => {
    const file = `${directory}/${entry.name}`;
    return entry.isDirectory() ? walk(file) : [file];
  });
}

export function sourceDigest() {
  const files = [...walk('src'), ...walk('.storybook'), ...walk('scripts'),
    ...['tools', 'ai'].filter(directory => fs.existsSync(absolute(directory))).flatMap(walk),
    ...walk('tests').filter(file => /\.(?:ts|tsx|mjs)$/.test(file)),
    ...['tests/refy-site/state-policy.json'].filter(file => fs.existsSync(absolute(file))),
    'playwright.config.ts', 'package.json', 'package-lock.json', contractFile];
  const hash = crypto.createHash('sha256');
  for (const file of files.sort()) hash.update(file).update('\0').update(read(file)).update('\0');
  return hash.digest('hex');
}

export function cssViolations(css, file = 'fixture.css') {
  const errors = [];
  postcss.parse(css, { from: file }).walkRules(rule => {
    const location = `${file}:${rule.source.start.line}`;
    rule.walkDecls(decl => {
      if (decl.prop.startsWith('--')) errors.push(`${location}: token local ${decl.prop}`);
      if (decl.important) errors.push(`${location}: !important não pode redesenhar o componente`);
    });
    // Tag/attribute selectors can reach library internals even without declaring tokens.
    for (const selector of rule.selectors) {
      if (/(?:^|[\s>+~,(])(?:a|button|input|select|textarea|svg|kbd|pre)(?=[\s.#:[>+~),]|$)|\[(?:aria-(?:current|selected|expanded)|data-(?:active|status|state|refy))/i.test(selector)) {
        errors.push(`${location}: seletor atravessa componente: ${selector}`);
      }
      if (/:global|\[class|\[style/.test(selector)) errors.push(`${location}: seletor de implementação: ${selector}`);
    }
  });
  return errors;
}

export function jsxViolations(code, file = 'fixture.tsx') {
  const errors = [];
  const ast = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  function visit(node) {
    if (ts.isJsxAttribute(node) && node.name.getText(ast) === 'style') {
      errors.push(`${file}:${ast.getLineAndCharacterOfPosition(node.pos).line + 1}: style inline na composição`);
    }
    if (ts.isImportDeclaration(node) && /components\/.+\.(?:module\.)?css/.test(node.moduleSpecifier.text)) {
      errors.push(`${file}: import de CSS interno do componente`);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return errors;
}

export function comparePixels(expected, actual, crop) {
  const { x, y, width, height } = crop;
  assert(x >= 0 && y >= 0 && width > 0 && height > 0 && x + width <= expected.width && y + height <= expected.height, 'Crop fora da referência');
  assert.equal(actual.width, width, 'Largura da captura diferente da referência; não redimensionar');
  assert.equal(actual.height, height, 'Altura da captura diferente da referência; não redimensionar');
  const diff = new PNG({ width, height });
  let differentPixels = 0;
  let absoluteError = 0;
  for (let row = 0; row < height; row++) for (let col = 0; col < width; col++) {
    const a = ((row + y) * expected.width + col + x) * 4;
    const b = (row * width + col) * 4;
    let changed = false;
    for (let channel = 0; channel < 4; channel++) {
      const delta = Math.abs(expected.data[a + channel] - actual.data[b + channel]);
      absoluteError += delta;
      if (delta) changed = true;
    }
    if (changed) differentPixels++;
    diff.data[b] = changed ? 230 : 255;
    diff.data[b + 1] = changed ? 25 : 255;
    diff.data[b + 2] = changed ? 90 : 255;
    diff.data[b + 3] = 255;
  }
  return { differentPixels, totalPixels: width * height, ratio: differentPixels / (width * height), meanChannelError: absoluteError / (width * height * 4), diff };
}

function checkContract(contract) {
  const errors = [];
  assert.deepEqual(contract.acceptance, { differentPixels: 0, channelTolerance: 0, resize: false, masks: [], baselineUpdate: false }, 'Critério de fidelidade foi enfraquecido');
  assert.equal(contract.references.length, 12, 'São exatamente 12 referências originais');
  assert.equal(new Set(contract.references.map(r => r.sha256)).size, 12, 'Referências duplicadas');
  const frames = contract.references.flatMap(r => r.frames);
  assert.equal(frames.length, 14, 'A referência mobile contém três quadros');
  assert.equal(new Set(frames.map(f => f.storyId)).size, 14, 'Stories omitidas/duplicadas');
  for (const ref of contract.references) {
    const data = read(ref.file);
    assert.equal(sha(data), ref.sha256, `Referência original alterada: ${ref.file}`);
    const png = PNG.sync.read(data);
    assert.equal(png.width, ref.width);
    assert.equal(png.height, ref.height);
  }
  const sourceIds = [...read('src/pages/PlaygroundPage/catalog.ts').toString().matchAll(/\{\s*id:\s*"([^"]+)",\s*label:/g)].map(match => match[1]).sort();
  assert.deepEqual(contract.families.map(f => f.id).sort(), sourceIds, 'Inventário deve cobrir cada família do catálogo');
  // As tarefas por família ficam no OpenSpec da oficina; a árvore pública não leva openspec/changes.
  if (fs.existsSync(absolute(siteTasks))) {
    const tasks = read(siteTasks).toString();
    for (const family of contract.families) assert(tasks.includes(` ${family.id} (`), `Tarefa individual ausente: ${family.id}`);
  }
  const pageFiles = walk('src/pages/RefySitePage');
  for (const file of pageFiles) {
    if (file.endsWith('.css')) errors.push(...cssViolations(read(file).toString(), file));
    if (file.endsWith('.tsx')) errors.push(...jsxViolations(read(file).toString(), file));
  }
  for (const file of walk('src/components').filter(f => /\.(tsx|css)$/.test(f))) {
    if (/refy-site|Refy Site/.test(read(file).toString())) errors.push(`${file}: componente depende do nome do tema`);
  }
  return errors;
}

function checkCapture(metadata, frame, digest) {
  assert.equal(metadata.sourceSha256, digest, 'Captura obsoleta: fonte alterada depois da execução');
  assert.equal(metadata.storyId, frame.storyId, 'Captura de outra story');
  assert.equal(metadata.mode, frame.mode, 'Modo incorreto');
  assert.equal(metadata.brand, 'Refy Site', 'Preset incorreto');
  assert.equal(metadata.viewport.width, frame.crop.width);
  assert.equal(metadata.viewport.height, frame.crop.height);
  assert.equal(metadata.fontsReady, true, 'Fontes não estavam prontas');
  assert(metadata.url.includes(':6006/'), 'Usar Storybook existente da porta 6006');
  assert(metadata.capturedAt && metadata.browser, 'Captura sem procedência');
  assert.equal(metadata.themeSha256, sha(read('src/themes/refy-site.json')), 'Preset mudou após captura');
}

function compareReferences(contract, digest) {
  const frames = [];
  for (const reference of contract.references) for (const frame of reference.frames) {
    const entry = { id: frame.id, storyId: frame.storyId, reference: reference.file, referenceSha256: reference.sha256, crop: frame.crop, actual: `${out}/${frame.id}.png` };
    try {
      const actualBytes = read(entry.actual);
      const metadata = json(`${out}/${frame.id}.json`);
      checkCapture(metadata, frame, digest);
      assert.equal(metadata.imageSha256, sha(actualBytes), 'PNG não corresponde à captura registrada');
      const { diff, ...metrics } = comparePixels(PNG.sync.read(read(reference.file)), PNG.sync.read(actualBytes), frame.crop);
      entry.diff = `${out}/${frame.id}.diff.png`;
      fs.writeFileSync(absolute(entry.diff), PNG.sync.write(diff));
      Object.assign(entry, metrics, { status: metrics.differentPixels === 0 ? 'passed' : 'different' });
    } catch (error) {
      Object.assign(entry, { status: 'blocked', error: error.message });
    }
    frames.push(entry);
  }
  const report = { sourceSha256: digest, generatedAt: new Date().toISOString(), status: frames.every(f => f.status === 'passed') ? 'passed' : 'failed', frames };
  fs.writeFileSync(absolute(`${out}/visual-report.json`), JSON.stringify(report, null, 2) + '\n');
  return report;
}

function checkFamilies(contract, digest) {
  const report = json('tests/refy-site/families-review.json');
  const errors = [];
  if (report.sourceSha256 !== digest) errors.push('Revisão de famílias ausente ou obsoleta');
  for (const family of contract.families) {
    const review = report.families.find(f => f.id === family.id);
    if (!review || review.status !== 'passed') { errors.push(`${family.id}: revisão individual pendente`); continue; }
    if (!review.states.length) errors.push(`${family.id}: estados não enumerados`);
    if (review.states.find(s => s.id === 'default')?.applicable !== true) errors.push(`${family.id}: estado default é obrigatório`);
    for (const state of contract.coverage.states) {
      const item = review.states.find(s => s.id === state);
      if (!item || (item.applicable === false && !item.reason)) errors.push(`${family.id}/${state}: aplicabilidade sem evidência`);
      if (!item || item.applicable === false) continue;
      for (const mode of contract.coverage.modes) for (const width of contract.coverage.widths) {
        const group = review.evidence.filter(e => e.state === state && e.mode === mode && e.width === width);
        const contexts = group.map(e => e.context).sort();
        if (JSON.stringify(contexts) !== JSON.stringify([...contract.coverage.contexts].sort())) { errors.push(`${family.id}/${state}/${mode}/${width}: contextos incompletos`); continue; }
        let baseline;
        for (const e of group) {
          try {
            assert.equal(e.sourceSha256, digest);
            assert(e.screenshot && e.measurements && e.procedure, 'Sem captura, medidas ou procedimento');
            const png = PNG.sync.read(read(e.screenshot));
            const measurements = json(e.measurements);
            assert(measurements.nodes.length > 0, 'Nenhum componente medido');
            if (baseline) {
              assert.deepEqual(measurements.nodes, baseline.nodes, 'Estilos ou geometria divergentes');
              assert.equal(comparePixels(baseline.png, png, { x: 0, y: 0, width: png.width, height: png.height }).differentPixels, 0, 'Pixels divergentes entre contextos');
            } else baseline = { png, nodes: measurements.nodes };
          } catch (error) { errors.push(`${family.id}/${state}/${mode}/${width}/${e.context}: ${error.message}`); }
        }
      }
    }
  }
  return errors;
}

function selfTest() {
  assert(cssViolations('.page button { padding: 1px }').length);
  assert(cssViolations('.page svg { width: 1px }').length);
  assert(cssViolations('.sideLinks a { padding: 1px }').length);
  assert(cssViolations('.page [aria-current="page"] { color: red }').length);
  assert(cssViolations('.page { --button-radius: 0 }').length);
  assert(cssViolations('.page { color: red !important }').length);
  assert.deepEqual(cssViolations('.page { display: grid; gap: 24px } .heading > h1 { margin: 0 }'), []);
  assert(jsxViolations('<Button style={{ color: "red" }} />').length);
  assert.deepEqual(jsxViolations('<Button variant="primary" />'), []);
  const first = new PNG({ width: 2, height: 2 }); first.data.fill(255);
  const second = PNG.sync.read(PNG.sync.write(first));
  const crop = { x: 0, y: 0, width: 2, height: 2 };
  assert.equal(comparePixels(first, second, crop).differentPixels, 0);
  second.data[0] = 254;
  assert.equal(comparePixels(first, second, crop).differentPixels, 1, 'Um canal/um pixel deve falhar');
  assert.throws(() => comparePixels(first, new PNG({ width: 1, height: 2 }), crop));
  assert.throws(() => checkCapture({ sourceSha256: 'old' }, {}, 'new'), /obsoleta/);
  const contract = json(contractFile);
  assert.throws(() => checkContract({ ...contract, acceptance: { ...contract.acceptance, channelTolerance: 1 } }));
  assert.throws(() => checkContract({ ...contract, families: contract.families.slice(1) }));
  assert.throws(() => checkContract({ ...contract, references: contract.references.slice(1) }));
  console.log('OK: controles negativos recusam 1 pixel, tamanho errado, fonte obsoleta, CSS/inline hacks, tolerância e omissões.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const command = process.argv[2] ?? '--contract';
  fs.mkdirSync(absolute(out), { recursive: true });
  if (command === '--digest') {
    console.log(JSON.stringify({ sourceSha256: sourceDigest(), themeSha256: sha(read('src/themes/refy-site.json')) }));
  } else if (command === '--self-test') selfTest();
  else {
    const contract = json(contractFile), digest = sourceDigest();
    const errors = checkContract(contract);
    if (command === '--contract') selfTest();
    if (command === '--compare' || command === '--acceptance') {
      const visual = compareReferences(contract, digest);
      for (const frame of visual.frames.filter(f => f.status !== 'passed')) errors.push(`${frame.id}: ${frame.error ?? `${frame.differentPixels}/${frame.totalPixels} pixels diferentes`}`);
    }
    if (command === '--acceptance') {
      errors.push(...checkFamilies(contract, digest));
      const tasks = read(siteTasks).toString();
      // Final command and final review can be marked only after this gate passes.
      if (/- \[ \] (?:4\.4|6\.|7\.|8\.|9\.1)/.test(tasks)) errors.push('OpenSpec: tarefas de implementação/validação ainda abertas');
      try {
        const checks = json(`${out}/checks.json`);
        assert.equal(checks.sourceSha256, digest);
        for (const command of ['npm run check', 'npm run check:specs', 'npm run build-storybook', 'graft build']) {
          const check = checks.results.find(c => c.command === command);
          assert.equal(check?.exitCode, 0, command);
          assert.equal(sha(read(check.log)), check.logSha256);
        }
      } catch (error) { errors.push(`Checks finais ausentes/obsoletos: ${error.message}`); }
    }
    const report = { command, sourceSha256: digest, generatedAt: new Date().toISOString(), status: errors.length ? 'failed' : 'passed', errors };
    fs.writeFileSync(absolute(`${out}/${command.slice(2)}-report.json`), JSON.stringify(report, null, 2) + '\n');
    console.log(`${report.status.toUpperCase()}: ${command}, ${contract.references.length} referências / ${contract.families.length} famílias, ${errors.length} pendências.`);
    for (const error of errors) console.error(error);
    if (errors.length) process.exitCode = 1;
  }
}
