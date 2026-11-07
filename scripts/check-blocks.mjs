import assert from 'node:assert/strict';
import {
  mkdtempSync,
  copyFileSync,
  cpSync,
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
  symlinkSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
const temp = mkdtempSync(join(tmpdir(), 'refy-block-consumer-'));
try {
  const sources = readdirSync('src/blocks');
  for (const name of sources) {
    // Pastas de assets (como photos/) vão inteiras; os blocos importam ./photos/*.webp.
    if (statSync(`src/blocks/${name}`).isDirectory()) { cpSync(`src/blocks/${name}`, join(temp, name), { recursive: true }); continue; }
    if (name.endsWith('.webp')) { copyFileSync(`src/blocks/${name}`,join(temp,name)); continue; }
    const source = readFileSync(`src/blocks/${name}`, 'utf8').replace(
      /from ['"]\.\.\/index['"]/g,
      "from '@refy-design/web'",
    );
    assert(!source.includes('../index'), name);
    writeFileSync(join(temp, name), source);
  }
  symlinkSync(resolve('node_modules'), join(temp, 'node_modules'), 'dir');
  writeFileSync(
    join(temp, 'css.d.ts'),
    "declare module '*.module.css' { const classes: Record<string,string>; export default classes; } declare module '*.webp' { const url: string; export default url; }",
  );
  writeFileSync(
    join(temp, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        jsx: 'react-jsx',
        strict: true,
        skipLibCheck: true,
        noEmit: true,
        resolveJsonModule: true,
        allowSyntheticDefaultImports: true,
        paths: { '@refy-design/web': [resolve('dist/index.d.ts')] },
      },
      include: ['*.tsx', '*.d.ts'],
    }),
  );
  execFileSync(
    process.execPath,
    [
      resolve('node_modules/typescript/bin/tsc'),
      '-p',
      join(temp, 'tsconfig.json'),
    ],
    { stdio: 'inherit' },
  );
  console.log(
    'OK: arquivos copiáveis de todos os blocks compilam como consumidor do contrato público, com CSS e JSON locais.',
  );
} finally {
  rmSync(temp, { recursive: true, force: true });
}
