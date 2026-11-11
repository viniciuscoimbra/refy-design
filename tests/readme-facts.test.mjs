import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Artigo da LBP (11/11/2026): README e site davam números diferentes de famílias, de ferramentas
// do MCP e do pacote mobile. O README passa a ser conferido contra o catálogo e o servidor.
const readme = readFileSync('README.md', 'utf8');
const catalog = JSON.parse(readFileSync('ai/catalog.json', 'utf8'));
const server = readFileSync('tools/refy-agent/mcp-server.mjs', 'utf8');
const words = { 6: 'seis', 7: 'sete', 8: 'oito', 9: 'nove', 10: 'dez' };

test('README counts families and levels from the catalog', () => {
  const total = catalog.components.length;
  const level = name => catalog.components.filter(c => c.level === name).length;
  assert.match(readme, new RegExp(`Guia das ${total} famílias`));
  assert.match(readme, new RegExp(`${total} famílias \\(${level('Átomos')} átomos, ${level('Moléculas')} moléculas e ${level('Organismos')} organismos\\)`));
  for (const [, n] of readme.matchAll(/\b(\d{2,3}) famílias/g)) assert.equal(Number(n), total);
});

test('README names every MCP tool the server registers', () => {
  const tools = [...server.matchAll(/name: "(refy_[a-z_]+)"/g)].map(m => m[1]);
  assert.match(readme, new RegExp(`São ${words[tools.length]} ferramentas`));
  for (const tool of tools) assert(readme.includes(`\`${tool}\``), tool);
});

test('README installs the published mobile package instead of promising it', () => {
  const mobile = JSON.parse(readFileSync('packages/native/package.json', 'utf8'));
  assert(readme.includes(`expo install ${mobile.name}`));
  assert.doesNotMatch(readme, /React Native: em breve/);
});
