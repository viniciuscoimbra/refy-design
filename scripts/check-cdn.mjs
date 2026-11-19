// CDN-01: o refy publicado no npm roda numa página HTML sem build, pelo /+esm do jsDelivr.
// Abre a página no Chromium, espera o React montar Button, Input e Card e confere quatro
// coisas: nenhum erro no console, uma instância só de React (Input usa useId; com duas
// cópias o React lança "Invalid hook call"), o botão primário com a cor do tema e as fontes
// do tema carregadas pelo fonts.css.
//   node scripts/check-cdn.mjs 1.6.2          versão publicada no npm
//   node scripts/check-cdn.mjs 1.6.2 --html   só imprime a página testada
// Precisa de internet. Não roda no CI de cada PR: roda depois do release, no público.
import { createServer } from 'node:http';
import { cdnPage } from '../src/pages/RefySitePage/cdnPage.mjs';

// A página mora em src/ porque a página "Sem bundler" do site mostra o mesmo texto.
export { cdnPage };

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
    // fonts.css do mesmo CDN: sem ele o texto cai na fonte do sistema.
    const fonts = await page.evaluate(async () => {
      await document.fonts.ready;
      return [...new Set([...document.fonts].filter((face) => face.status === 'loaded').map((face) => face.family.replace(/["']/g, '')))];
    });
    if (!fonts.length) errors.push('nenhuma fonte do tema carregou pelo fonts.css');
    return { errors, colors, fonts };
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
  console.log(`OK: refy ${version} pelo jsDelivr, sem bundler. Botão primário ${result.colors.button}. Fontes: ${result.fonts.join(', ')}.`);
}
