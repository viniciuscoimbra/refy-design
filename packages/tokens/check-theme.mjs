// Valida um tema de produto ({ name, tokens, modes }) contra os tokens do Refy e
// mostra o que ele vira no React Native. Uso: node packages/tokens/check-theme.mjs <tema.json> [modo]
import { readFileSync } from 'node:fs';
import { createNativeTheme } from './dist/index.js';

const [file, mode = 'light'] = process.argv.slice(2);
if (!file) { console.error('Uso: node packages/tokens/check-theme.mjs <tema.json> [light|dark|editorial]'); process.exit(2); }
const theme = JSON.parse(readFileSync(file, 'utf8'));
const native = createNativeTheme(theme, mode);
const own = Object.keys({ ...theme.tokens, ...theme.modes?.[mode] });
const diverge = own.filter(name => ['unsupported', 'em', 'shadow'].includes(native.kinds[name]));
console.log(`${native.name} / ${mode}: ${own.length} variáveis do tema, ${Object.keys(native.values).length} valores resolvidos.`);
console.log(`Sem leitor no Refy (${native.unknown.length}): ${native.unknown.join(', ') || 'nenhuma'}`);
console.log(`Exigem decisão no nativo (${diverge.length}): ${diverge.map(n => `${n} [${native.kinds[n]}] = ${JSON.stringify(native.values[n])}`).join('; ') || 'nenhuma'}`);
