// CDN-01: o refy publicado no npm roda numa página HTML sem build, pelo /+esm do jsDelivr.
// Abre a página no Chromium, espera o React montar Button, Input e Card e confere três
// coisas: nenhum erro no console, uma instância só de React (Input usa useId; com duas
// cópias o React lança "Invalid hook call") e o botão primário com a cor do tema.
//   node scripts/check-cdn.mjs 1.6.2          versão publicada no npm
//   node scripts/check-cdn.mjs 1.6.2 --html   só imprime a página testada
// Precisa de internet. Não roda no CI de cada PR: roda depois do release, no público.
import { createServer } from 'node:http';

export function cdnPage(version) {
  const npm = 'https://cdn.jsdelivr.net/npm';
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="${npm}/@refy-design/web@${version}/src/tokens/tokens.css">
<link rel="stylesheet" href="${npm}/@refy-design/web@${version}/dist/style.css">
</head>
<body>
<div id="root"></div>
<script type="module">
// O /+esm do jsDelivr reescreve "react" para uma URL com versão fechada. A página importa
// o React dessa mesma URL; com outra, o refy e a página teriam duas cópias do React.
const refy = "${npm}/@refy-design/web@${version}/+esm";
const source = await (await fetch(refy)).text();
const at = source.indexOf("/npm/react@");
if (at < 0) throw new Error("o /+esm do refy não importa o React do jsDelivr");
const react = source.slice(at + "/npm/react@".length, source.indexOf("/", at + "/npm/react@".length));
const [{ createElement: h }, { createRoot }, { Button, Card, Input }] = await Promise.all([
  import("${npm}/react@" + react + "/+esm"),
  import("${npm}/react-dom@" + react + "/client/+esm"),
  import(refy),
]);
createRoot(document.getElementById("root")).render(
  h(Card, { "data-cdn": "card" },
    h(Input, { label: "Nome" }),
    h(Button, { variant: "primary", "data-cdn": "button" }, "Enviar")));
</script>
</body>
</html>`;
}

export async function checkCdn(version, { chromium, timeout = 30000 } = {}) {
  const html = cdnPage(version);
  const server = createServer((_, res) => { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(html); });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  const browser = await chromium.launch();
  const errors = [];
  try {
    const page = await browser.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    const button = page.locator('[data-cdn="button"]');
    await button.waitFor({ timeout }).catch(() => errors.push('Button não apareceu'));
    const input = await page.getByLabel('Nome').count();
    if (!input) errors.push('Input sem rótulo associado');
    const colors = await page.evaluate(() => {
      const probe = document.createElement('span');
      probe.style.background = 'var(--button-primary-background, var(--primary))';
      document.body.append(probe);
      const theme = getComputedStyle(probe).backgroundColor;
      const button = document.querySelector('[data-cdn="button"]');
      return { theme, button: button ? getComputedStyle(button).backgroundColor : null };
    });
    if (colors.button !== colors.theme) errors.push(`botão primário ${colors.button}, tema ${colors.theme}`);
    return { errors, colors };
  } finally {
    await browser.close();
    server.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const version = process.argv[2];
  if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) { console.error('uso: node scripts/check-cdn.mjs X.Y.Z'); process.exit(2); }
  if (process.argv.includes('--html')) { console.log(cdnPage(version)); process.exit(0); }
  const { chromium } = await import('playwright');
  // O jsDelivr pode levar alguns minutos para servir a versão recém-publicada.
  let result;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    result = await checkCdn(version, { chromium });
    if (!result.errors.length) break;
    if (attempt < 5) await new Promise((done) => setTimeout(done, 60000));
  }
  if (result.errors.length) { console.error(`refy ${version} pelo CDN falhou:\n${result.errors.join('\n')}`); process.exit(1); }
  console.log(`OK: refy ${version} pelo jsDelivr, sem bundler. Botão primário ${result.colors.button}.`);
}
