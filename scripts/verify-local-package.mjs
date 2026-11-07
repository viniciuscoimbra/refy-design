import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  cpSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  lstatSync,
} from "node:fs";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

// Creates only disposable consumers at the explicit output path; never publishes.
const root = fileURLToPath(new URL("..", import.meta.url));
const [archiveArg, outputArg] = process.argv.slice(2);
assert(
  archiveArg && outputArg,
  "Usage: node scripts/verify-local-package.mjs <tarball> <new-output-directory>",
);
const archive = resolve(archiveArg),
  output = resolve(outputArg);
const themePath = process.env.REFY_THEME_EXPORT_PATH;
const blockPath = process.env.REFY_BLOCK_EXPORT_DIR;
const siteThemePath = process.env.REFY_SITE_THEME_EXPORT_PATH;
const conversationPath = process.env.REFY_PILOT_BLOCK_EXPORT_DIR;
let exportedTheme, exportedSiteTheme;
if (themePath || siteThemePath) {
  const originalNodeEnv = process.env.NODE_ENV;
  const { createServer } = await import("vite");
  const server = await createServer({
    root,
    configFile: false,
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, watch: null, hmr: false },
    appType: "custom",
  });
  try {
    const { parseTheme } = await server.ssrLoadModule(
      "/src/pages/PlaygroundPage/themeConfig.ts",
    );
    if (themePath) exportedTheme = parseTheme(readFileSync(themePath, "utf8"));
    if (siteThemePath)
      exportedSiteTheme = parseTheme(readFileSync(siteThemePath, "utf8"));
  } finally {
    await server.close();
    // Vite sets NODE_ENV during dev-server creation; keep later builds in their original environment.
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  }
}
const blockFiles = blockPath ? readdirSync(blockPath) : [];
if (blockPath) {
  assert.deepEqual(
    blockFiles.sort(),
    // The dashboard template ships the whole app it navigates in, plus sample photos.
    ["page.tsx", "NavigationBlock.tsx", "DashboardBlock.tsx", "ChartExplorer.tsx", "LibraryBlock.tsx", "SettingsBlock.tsx", "blocks.module.css", "photos.ts"].sort(),
    "Unexpected exported block files",
  );
  for (const file of blockFiles)
    assert(
      lstatSync(join(blockPath, file)).isFile(),
      "Block files must be regular files, not links",
    );
}
const conversationFiles = ["page.tsx", "ConversationExample.tsx", "ConversationBlock.tsx", "ConversationBlock.module.css"];
if (conversationPath)
  for (const variant of ["conversation01", "conversation02"]) {
    const directory = join(conversationPath, variant);
    assert.deepEqual(readdirSync(directory).sort(), [...conversationFiles].sort(), "Unexpected conversation block files");
    for (const file of conversationFiles) {
      assert(lstatSync(join(directory, file)).isFile(), "Conversation files must be regular files");
      assert(!/from\s+['"]\.\.\/(?:index|blocks\/)/.test(readFileSync(join(directory, file), "utf8")), "Copied conversation source retains checkout-only imports");
    }
  }
mkdirSync(output); // Refuse to overwrite a previous verification.
const archiveBytes = readFileSync(archive);
const report = {
  node: process.version,
  archive,
  sha256: createHash("sha256").update(archiveBytes).digest("hex"),
  archiveBytes: archiveBytes.length,
  theme: exportedTheme?.name,
  siteTheme: exportedSiteTheme?.name,
  blockFiles,
  conversationVariants: conversationPath ? ["conversation01", "conversation02"] : [],
  consumers: [],
};
function run(cwd, command, args, name) {
  const start = performance.now();
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  writeFileSync(
    join(cwd, `${name}.log`),
    (result.stdout || "") + (result.stderr || ""),
  );
  assert.equal(result.status, 0, `${name} failed; inspect ${cwd}/${name}.log`);
  return Math.round(performance.now() - start);
}
const variants = {
  react: `import {createRoot} from 'react-dom/client'; createRoot(document.getElementById('root')!).render(<button>Salvar</button>);`,
  controls: `import {createRoot} from 'react-dom/client'; import {Button, Input} from '@refy-design/web'; import '@refy-design/web/tokens.css'; createRoot(document.getElementById('root')!).render(<><Input label="Nome"/><Button>Salvar</Button></>);`,
  legacy: `import {createRoot} from 'react-dom/client'; import {Button, Input} from '@refy-design/web'; import '@refy-design/web/tokens.css'; import '@refy-design/web/styles.css'; createRoot(document.getElementById('root')!).render(<><Input label="Nome"/><Button>Salvar</Button></>);`,
  coverflow: `import {createRoot} from 'react-dom/client'; import {Coverflow} from '@refy-design/web'; import '@refy-design/web/tokens.css'; createRoot(document.getElementById('root')!).render(<Coverflow items={[{id:'one',label:'Conteúdo'}]} renderItem={item=><span>{item.label}</span>}/>);`,
  conversation: `import {createRoot} from 'react-dom/client'; import {ConversationBlock} from '@refy-design/web'; import '@refy-design/web/tokens.css'; createRoot(document.getElementById('root')!).render(<ConversationBlock messages={[]} draft="" status="idle" onDraftChange={()=>{}} onSend={()=>{}} onRetry={()=>{}} onCancel={()=>{}}/>);`,
  chart: `import {createRoot} from 'react-dom/client'; import {D3Chart} from '@refy-design/web'; import '@refy-design/web/tokens.css'; createRoot(document.getElementById('root')!).render(<D3Chart type="line" title="Exemplo" label="Exemplo" series={[{id:"demo",label:"Exemplo",data:[{x:1,y:2},{x:2,y:4}]}]}/>);`,
  code: `import {createRoot} from 'react-dom/client'; import {CodeBlock} from '@refy-design/web'; import '@refy-design/web/tokens.css'; createRoot(document.getElementById('root')!).render(<CodeBlock language="tsx" code="const value = 1;"/>);`,
};
const config = `import {writeFileSync} from 'node:fs'; export default {plugins:[{name:'measure-rendered-modules',generateBundle(_,bundle){const modules=Object.values(bundle).filter(b=>b.type==='chunk').flatMap(b=>Object.entries(b.modules).filter(([,m])=>m.renderedLength>0).map(([id,m])=>({id:id.replace(process.cwd()+'/', ''),bytes:m.renderedLength})));writeFileSync('rendered-modules.json',JSON.stringify(modules,null,2));}}]};`;
for (const [major, react, types, domTypes] of [
  ["18", "18.3.1", "18.3.31", "18.3.7"],
  ["19", "19.2.4", "19.3.0", "19.3.0"],
]) {
  const cwd = join(output, major);
  cpSync(join(root, "examples/react-starter"), cwd, { recursive: true });
  if (exportedTheme)
    writeFileSync(
      join(cwd, "theme.json"),
      JSON.stringify(exportedTheme, null, 2),
    );
  if (blockPath)
    cpSync(blockPath, join(cwd, "adoption-block"), { recursive: true });
  if (conversationPath)
    for (const variant of ["conversation01", "conversation02"])
      cpSync(join(conversationPath, variant), join(cwd, variant), { recursive: true });
  const pkg = JSON.parse(readFileSync(join(cwd, "package.json")));
  pkg.dependencies = {
    ...pkg.dependencies,
    react,
    "react-dom": react,
    "@refy-design/web": `file:${archive}`,
  };
  pkg.devDependencies["@types/react"] = types;
  pkg.devDependencies["@types/react-dom"] = domTypes;
  writeFileSync(join(cwd, "package.json"), JSON.stringify(pkg, null, 2));
  const installMs = run(
    cwd,
    "npm",
    ["install", "--no-audit", "--no-fund"],
    "install",
  );
  assert(
    !lstatSync(join(cwd, "node_modules/@refy-design/web")).isSymbolicLink(),
    "Must install archive, not symlink",
  );
  run(cwd, "npm", ["ls", "react", "react-dom"], "dependencies");
  run(
    cwd,
    "node",
    [
      "--input-type=module",
      "-e",
      `import assert from 'node:assert/strict';import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {ThemeProvider,Button,Input} from '@refy-design/web';const html=renderToStaticMarkup(React.createElement(ThemeProvider,{mode:'dark'},React.createElement(Button,null,'Salvar'),React.createElement(Input,{label:'Nome'})));assert.match(html,/data-theme="dark"/);assert.match(html,/class="_btn_/);assert.match(html,/Nome/);console.log('Native Node SSR passed without CSS loader.');`,
    ],
    "node-ssr",
  );
  run(cwd, "node", ["--input-type=module", "-e", `import assert from 'node:assert/strict';import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {Coverflow,ConversationBlock,ThemeProvider} from '@refy-design/web';const html=renderToStaticMarkup(React.createElement(ThemeProvider,{mode:'dark'},React.createElement(Coverflow,{items:[{id:'one',label:'Conteúdo SSR'}],renderItem:item=>React.createElement('span',null,item.label)}),React.createElement(ConversationBlock,{messages:[],draft:'Rascunho',status:'idle',onDraftChange:()=>{},onSend:()=>{},onRetry:()=>{},onCancel:()=>{}})));assert.match(html,/Conteúdo SSR/);assert.match(html,/Rascunho/);assert.match(html,/role="log"/);console.log('Pilot exports render with native Node SSR.');`], "node-pilot-ssr");

  cpSync(
    join(root, "tests/fixtures/ConsumerSiteTheme.tsx"),
    join(cwd, "site.tsx"),
  );
  run(
    cwd,
    "node",
    [
      "--input-type=module",
      "-e",
      `import {writeFileSync} from 'node:fs';import {refySiteTheme} from '@refy-design/web';writeFileSync('site-theme.json',JSON.stringify(refySiteTheme,null,2));`,
    ],
    "site-public-export",
  );
  if (exportedSiteTheme)
    writeFileSync(
      join(cwd, "site-theme.json"),
      JSON.stringify(exportedSiteTheme, null, 2),
    );
  writeFileSync(
    join(cwd, "site.html"),
    '<!doctype html><html><head><meta charset="UTF-8"><link rel="icon" href="data:,"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="./site.tsx"></script></body></html>',
  );
  cpSync(
    join(root, "tests/agent-kit/pilot/After.tsx"),
    join(cwd, "AgentPilot.tsx"),
  );
  cpSync(
    join(root, "tests/agent-kit/pilot/Before.tsx"),
    join(cwd, "AgentPilotBefore.tsx"),
  );
  mkdirSync(join(cwd, "agent-fixtures"));
  cpSync(
    join(root, "tests/agent-kit/pilot/Before.tsx"),
    join(cwd, "agent-fixtures/Before.tsx"),
  );
  writeFileSync(
    join(cwd, "agent-pilot.html"),
    '<!doctype html><html><head><meta charset="UTF-8"><link rel="icon" href="data:,"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="./agent-pilot.tsx"></script></body></html>',
  );
  writeFileSync(
    join(cwd, "agent-pilot.tsx"),
    `import {useState} from 'react';import {createRoot} from 'react-dom/client';import {ThemeProvider,Segmented} from '@refy-design/web';import type {ThemeMode} from '@refy-design/web';import {After} from './AgentPilot';import {Before} from './AgentPilotBefore';import '@refy-design/web/tokens.css';import '@refy-design/web/fonts.css';const Page=new URLSearchParams(location.search).get('variant')==='before'?Before:After;function Pilot(){const [mode,setMode]=useState<ThemeMode>('light');return <ThemeProvider mode={mode} data-testid="agent-pilot-consumer"><Segmented label="Modo do piloto" value={mode} onChange={value=>setMode(value as ThemeMode)} options={[{value:'light',label:'Claro'},{value:'dark',label:'Escuro'},{value:'system',label:'Sistema'}]}/><Page/></ThemeProvider>}createRoot(document.getElementById('root')!).render(<Pilot/>);`,
  );
  const starter = readFileSync(join(cwd, "main.tsx"), "utf8");
  cpSync(
    join(root, "tests/fixtures/ConsumerOverlays.tsx"),
    join(cwd, "ConsumerOverlays.tsx"),
  );
  cpSync(
    join(root, "tests/fixtures/ConsumerPackageFeatures.tsx"),
    join(cwd, "ConsumerPackageFeatures.tsx"),
  );
  if (blockPath)
    cpSync(
      join(root, "tests/fixtures/ConsumerAdoption.tsx"),
      join(cwd, "ConsumerAdoption.tsx"),
    );
  const adoptionStarter = blockPath
    ? starter
        .replace(
          "import { useState }",
          "import { ConsumerAdoption } from './ConsumerAdoption';\nimport { useState }",
        )
        .replace("</ThemeProvider>", "<ConsumerAdoption /></ThemeProvider>")
    : starter;
  const fixture = adoptionStarter
    .replace(
      "import { useState }",
      "import { ConsumerOverlays } from './ConsumerOverlays';\nimport { ConsumerPackageFeatures } from './ConsumerPackageFeatures';\nimport { useState }",
    )
    .replace(
      "</ThemeProvider>",
      "<ConsumerOverlays /><ConsumerPackageFeatures /></ThemeProvider>",
    );
  writeFileSync(join(cwd, "main.tsx"), fixture);
  run(cwd, "npx", ["tsc", "--noEmit", "--skipLibCheck", "false"], "types");
  run(cwd, "npm", ["run", "build"], "starter-build");
  const measurements = [];
  if (major === "19") {
    writeFileSync(join(cwd, "vite.config.mjs"), config);
    for (const [name, source] of Object.entries({
      ...variants,
      starter: fixture,
    })) {
      writeFileSync(join(cwd, "main.tsx"), source);
      const buildMs = run(cwd, "npm", ["run", "build"], `measure-${name}`);
      const assets = readdirSync(join(cwd, "dist/assets")).map((file) => {
        const bytes = readFileSync(join(cwd, "dist/assets", file));
        return { file, bytes: bytes.length, gzip: gzipSync(bytes).length };
      });
      if (name === "controls") {
        const css = assets
          .filter((a) => a.file.endsWith(".css"))
          .map((a) => readFileSync(join(cwd, "dist/assets", a.file), "utf8"))
          .join("\n");
        assert.match(
          css,
          /\._btn_/,
          "Button CSS must be present, not only tokens",
        );
        assert.match(css, /\._input_/, "Input CSS must be present");
        // tokens.css resets every component hook at each theme scope (--coverflow-*: initial);
        // Coverflow's own CSS is what reads them, so the check looks for a read.
        assert.doesNotMatch(css, /var\(\s*--coverflow-/, "Basic controls must not retain Coverflow CSS");
        assert.doesNotMatch(
          css,
          /data-syntax|\._kanban|\._legend/,
          "Unused component CSS must be absent",
        );
      }
      const modules = JSON.parse(
        readFileSync(join(cwd, "rendered-modules.json")),
      );
      assert(
        !modules.some((m) =>
          /node_modules\/(?:react|react-dom)\/.*development/.test(m.id),
        ),
        "Production measurement retained React development runtime",
      );
      assert(
        !modules.some((m) =>
          /node_modules\/typescript\/|\/tools\/refy-agent\/|\/ai\/(?:catalog\.json|components\/)/.test(m.id),
        ),
        "UI bundles must not include the optional agent CLI or TypeScript parser",
      );
      if (name === "controls")
        assert(!modules.some(module => /\/Coverflow\/|\/ConversationBlock[.\/]/.test(module.id)), "Basic controls retain an unused pilot runtime");
      const advanced = modules.filter((m) =>
        /node_modules\/(?:d3-|prismjs)/.test(m.id),
      );
      measurements.push({ name, buildMs, assets, advanced });
      writeFileSync(
        join(cwd, `modules-${name}.json`),
        JSON.stringify(modules, null, 2),
      );
    }
    writeFileSync(join(cwd, "main.tsx"), fixture);
  }
  writeFileSync(
    join(cwd, "lazy.html"),
    '<!doctype html><html><head><meta charset="UTF-8"><link rel="icon" href="data:,"></head><body><div id="root"></div><script type="module" src="./lazy.tsx"></script></body></html>',
  );
  writeFileSync(
    join(cwd, "LazyCode.tsx"),
    'export {CodeBlock as default} from "@refy-design/web";',
  );
  writeFileSync(
    join(cwd, "lazy.tsx"),
    `import {lazy,Suspense,useState} from 'react';import {createRoot} from 'react-dom/client';import {Button} from '@refy-design/web';import '@refy-design/web/tokens.css';const Code=lazy(()=>import('./LazyCode'));function App(){const[open,setOpen]=useState(false);const[dark,setDark]=useState(false);return <div data-testid="lazy-consumer" data-theme={dark?'dark':'light'}><Button onClick={()=>setDark(!dark)}>Alternar modo</Button><Button onClick={()=>setOpen(true)}>Carregar código</Button>{open&&<Suspense fallback={<p>Carregando</p>}><Code language="tsx" code="const tardio = 42;"/></Suspense>}</div>}createRoot(document.getElementById('root')!).render(<App/>);`,
  );
  writeFileSync(
    join(cwd, "vite.config.mjs"),
    `import {resolve} from 'node:path'; export default {build:{rollupOptions:{input:{main:resolve('index.html'),lazy:resolve('lazy.html'),site:resolve('site.html'),agentPilot:resolve('agent-pilot.html')}}}};`,
  );
  run(
    cwd,
    "npx",
    ["tsc", "--noEmit", "--skipLibCheck", "false"],
    "final-types",
  );
  run(cwd, "npm", ["run", "build"], "final-build");
  const installedPackage = JSON.parse(
    readFileSync(join(cwd, "node_modules/@refy-design/web/package.json")),
  );
  let agentKit = "not-present-in-candidate";
  if (installedPackage.bin?.["refy-agent"]) {
    const cli = join(
      cwd,
      "node_modules/@refy-design/web",
      installedPackage.bin["refy-agent"],
    );
    run(cwd, "node", [cli, "catalog", "Combobox"], "agent-catalog");
    run(cwd, "node", [cli, "component", "Input"], "agent-component");
    run(cwd, "node", [cli, "component", "Coverflow"], "agent-pilot-component");
    assert.deepEqual(JSON.parse(readFileSync(join(cwd, "agent-pilot-component.log"))).collections, ["media"]);

    run(cwd, "node", [cli, "collections", "geolocation"], "agent-collections");
    const geography = JSON.parse(readFileSync(join(cwd, "agent-collections.log"))).collections[0];
    assert.equal(geography.id, "geolocation");
    assert.deepEqual(geography.members.map((entry) => entry.id), ["GeoAreaPicker"]);
    assert.equal(geography.count, geography.members.length);
    run(cwd, "node", [cli, "catalog", "música"], "agent-collection-keywords");
    const music = JSON.parse(readFileSync(join(cwd, "agent-collection-keywords.log"))).components;
    assert(music.length && music.every((entry) => entry.collections.includes("media")));
    assert(music.some((entry) => entry.id === "Coverflow"), "Implemented Coverflow must be discoverable in its real collection");
    run(cwd, "node", [cli, "component", "Button"], "agent-collection-core");
    assert.deepEqual(JSON.parse(readFileSync(join(cwd, "agent-collection-core.log"))).collections, ["core"]);

    run(cwd, "node", [cli, "inspect", "AgentPilot.tsx"], "agent-inspect");
    run(cwd, "node", [cli, "check", "AgentPilot.tsx"], "agent-check-valid");
    const invalid = spawnSync(
      "node",
      [cli, "check", "agent-fixtures/Before.tsx"],
      { cwd, encoding: "utf8" },
    );
    writeFileSync(
      join(cwd, "agent-check-invalid.log"),
      (invalid.stdout || "") + (invalid.stderr || ""),
    );
    assert.equal(
      invalid.status,
      1,
      "Raw-control pilot must produce a policy rejection, not a CLI failure",
    );
    assert(!invalid.error, "Installed CLI must run for invalid input");
    for (const [member, family] of [["D3Chart", "Charts"], ["CardHeader", "Card"]]) {
      const searchLog = `agent-search-${member}`;
      run(cwd, "node", [cli, "catalog", member], searchLog);
      assert.deepEqual(JSON.parse(readFileSync(join(cwd, `${searchLog}.log`))).components.map((entry) => entry.id), [family]);
      const documentLog = `agent-component-${member}`;
      run(cwd, "node", [cli, "component", member], documentLog);
      const document = JSON.parse(readFileSync(join(cwd, `${documentLog}.log`)));
      assert.equal(document.id, family);
      assert.equal(document.resolution.apiMember, member);
      assert.equal(document.resolution.runtimeExportVerified, false);
    }
    const staticFixture = "agent-fixtures/StaticLiteral.tsx";
    writeFileSync(join(cwd, staticFixture), 'export const View = () => <div role={"button"} style={{color:`#123456`}}>Continuar</div>;');
    const staticCheck = spawnSync("node", [cli, "check", staticFixture], { cwd, encoding: "utf8" });
    writeFileSync(join(cwd, "agent-check-static-literal.log"), (staticCheck.stdout || "") + (staticCheck.stderr || ""));
    assert.equal(staticCheck.status, 1, "Equivalent static JSX must produce a policy rejection");
    const rules = JSON.parse(staticCheck.stdout).findings.map((finding) => finding.rule);
    assert(rules.includes("raw-control") && rules.includes("appearance-literal"));
    const tokenFixture = "agent-fixtures/TokenLiteral.tsx";
    writeFileSync(join(cwd, tokenFixture), 'export const View = () => <div style={{color:`var(--primary)`}}>Conteúdo</div>;');
    run(cwd, "node", [cli, "check", tokenFixture], "agent-check-static-token");
    agentKit = "passed";
  }
  report.consumers.push({
    react,
    types,
    domTypes,
    installMs,
    cwd,
    measurements,
    agentKit,
  });
  writeFileSync(join(output, "report.json"), JSON.stringify(report, null, 2));
}
assert(
  !report.consumers
    .find((c) => c.react.startsWith("19"))
    .measurements.find((m) => m.name === "controls").advanced.length,
  "Controls retain D3/Prism runtime; packaging needs correction",
);
console.log(
  `Installed, typechecked and built clean React 18/19 consumers. Report: ${output}/report.json`,
);
