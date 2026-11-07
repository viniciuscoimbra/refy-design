import assert from "node:assert/strict";
import {
  cpSync,
  mkdirSync,
  lstatSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
const root = fileURLToPath(new URL("..", import.meta.url));
const [archiveArg, outputArg] = process.argv.slice(2);
assert(
  archiveArg && outputArg,
  "Usage: node scripts/prepare-css-catalog.mjs <tarball> <new-directory>",
);
const output = resolve(outputArg);
mkdirSync(output);
cpSync(join(root, "examples/react-starter"), output, { recursive: true });
const pkg = JSON.parse(readFileSync(join(output, "package.json")));
pkg.dependencies["@refy-design/web"] = `file:${resolve(archiveArg)}`;
writeFileSync(join(output, "package.json"), JSON.stringify(pkg, null, 2));
mkdirSync(join(output, "catalog"));
const catalog = [];
for (const file of readdirSync(
  join(root, "src/pages/PlaygroundPage/documentation"),
)
  .filter((f) => f.endsWith(".json"))
  .sort()) {
  const doc = JSON.parse(
    readFileSync(join(root, "src/pages/PlaygroundPage/documentation", file)),
  );
  const example =
    doc.examples.find((e) => e.id === doc.selected) || doc.examples[0];
  for (const sample of doc.examples) {
    assert(/^[\p{L}\p{N}_$-]+$/u.test(sample.id), "Unsafe example id");
    assert(
      sample.code.includes("export function Example"),
      doc.id + "/" + sample.id,
    );
    writeFileSync(
      join(output, "catalog", doc.id + "." + sample.id + ".tsx"),
      sample.code,
    );
  }
  catalog.push({
    id: doc.id,
    example: example.id,
    examples: doc.examples.map((item) => item.id),
  });
}
assert(catalog.length > 0, "Catalogue must not be empty");
assert.equal(
  new Set(catalog.map((item) => item.id)).size,
  catalog.length,
  "Duplicate family id",
);
writeFileSync(join(output, "coverage.json"), JSON.stringify(catalog, null, 2));
writeFileSync(
  join(output, "main.tsx"),
  `import {lazy,Suspense} from 'react';import {createRoot} from 'react-dom/client';import {ThemeProvider,refySiteTheme} from '@refy-design/web';import '@refy-design/web/tokens.css';import '@refy-design/web/fonts.css';import '@refy-design/web/global.css';const entries={${catalog.flatMap((c) => c.examples.map((example) => `${JSON.stringify(c.id + ":" + example)}:()=>import('./catalog/${c.id}.${example}')`)).join(",")}};const query=new URLSearchParams(location.search);const family=query.get('family')||'Button';const mode=query.get('mode')==='dark'?'dark':'light';const configured=query.get('theme')==='refy-site';const width=Number(query.get('width'));if(query.has('width') && ![390,800].includes(width))throw Error('Unsupported specimen width');const theme=configured?{...JSON.parse(JSON.stringify(refySiteTheme)),name:'Tema do consumidor isolado'}:undefined;if(theme && query.get('motion')==='reduce')theme.tokens={...theme.tokens,'--motion-reduced':'1'};const selected=${JSON.stringify(Object.fromEntries(catalog.map((c) => [c.id, c.example])))};const example=query.get('example')||selected[family as keyof typeof selected];const load=entries[(family+':'+example) as keyof typeof entries];if(!load)throw Error('Unknown family or example');const Example=lazy(()=>load().then(module=>({default:module.Example})));createRoot(document.getElementById('root')!).render(<ThemeProvider theme={theme} mode={mode}><main data-testid="catalog-case" data-family={family}><Suspense fallback={<p>Carregando exemplo</p>}><div data-testid="catalog-example" data-refy-specimen={family} data-refy-example={example} style={query.has('width')?{width,position:'fixed',left:0,top:0,minHeight:'100vh',background:'var(--bg)'}:{padding:24,maxWidth:1100}}><div style={{padding:'24px 4px',minWidth:0,maxWidth:'100%'}}><div data-demo-ready="" style={query.has('width')?{maxWidth:'100%'}:undefined}><Example/></div></div></div></Suspense></main></ThemeProvider>);`,
);
writeFileSync(
  join(output, "tsconfig.json"),
  JSON.stringify({
    compilerOptions: {
      target: "ES2020",
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "react-jsx",
      strict: true,
      skipLibCheck: false,
      resolveJsonModule: true,
      esModuleInterop: true,
      noEmit: true,
    },
    include: ["*.tsx", "catalog/*.tsx"],
  }),
);
function run(args, name) {
  const r = spawnSync("npm", args, {
    cwd: output,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  writeFileSync(
    join(output, `${name}.log`),
    (r.stdout || "") + (r.stderr || ""),
  );
  assert.equal(r.status, 0, `${name}: ${output}/${name}.log`);
}
run(["install", "--no-audit", "--no-fund"], "install");
assert(
  !lstatSync(join(output, "node_modules/@refy-design/web")).isSymbolicLink(),
  "Install archive, not symlink",
);
mkdirSync(join(output, "public"));
cpSync(
  join(output, "node_modules/@refy-design/web/dist/style.css"),
  join(output, "public/reference.css"),
);
run(["run", "build"], "build");
console.log(`Compiled ${catalog.length} isolated public examples: ${output}`);
