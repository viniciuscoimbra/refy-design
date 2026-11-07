import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { componentAreas, componentCatalog } from '../src/pages/PlaygroundPage/catalog';
const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const url = '/iframe.html?id=verification-component-matrix--matriz&viewMode=story';

test('inventário cobre exatamente as famílias e links reais do catálogo', async ({ request }) => {
  const directories = readdirSync('src/components').filter(name => readdirSync(`src/components/${name}`).some(file => file.endsWith('.stories.tsx')));
  expect(componentCatalog.map(entry => entry.id).sort()).toEqual(directories.sort());
  const index = await (await request.get('/index.json')).json();
  for (const entry of componentCatalog) expect(index.entries[entry.storyId], entry.storyId).toBeTruthy();
});


test('galeria mostra o conjunto por nível e busca sem perder o tema', async ({ page }) => {
  await page.goto(`${url}&globals=theme:dark;fonts:studio`);
  const scope = page.getByTestId('playground');
  await expect(scope.getByTestId('component-demo')).toHaveCount(componentCatalog.filter(item => item.level === 'Moléculas').length);
  await scope.getByRole('radio', { name: `All (${componentCatalog.length})`, exact: true }).click();
  await expect(scope.getByTestId('component-demo')).toHaveCount(componentCatalog.length);
  await scope.getByLabel('Search component').fill('ActivityTimeline');
  await expect(scope.getByTestId('component-demo')).toHaveCount(1);
  await expect(scope.getByTestId('component-demo')).toHaveAttribute('data-component', 'EventTimeline');
  await expect(scope.getByTestId('component-demo')).toHaveCSS('font-family', /DM Sans/);
});

for (const [level, levelLabel] of [['Átomos', 'Atoms'], ['Moléculas', 'Molecules'], ['Organismos', 'Organisms']]) for (const mode of ['light', 'dark']) test(`${level} / ${mode}: famílias, temas, fontes e contraste`, async ({ page }) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${url}&globals=theme:${mode}`);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const scope = page.getByTestId('playground');
  const entries = componentCatalog.filter(entry => entry.level === level);
  await scope.getByRole('radio', { name: `${levelLabel} (${entries.length})`, exact: true }).click();
  await expect(scope.locator('[data-demo-ready]')).toHaveCount(entries.length);
  await expect(scope).not.toContainText('Não foi possível abrir');
  await page.addScriptTag({ content: axe });
  for (const skin of ['refy-site', 'cobalto', 'gradient', 'terracota']) {
    await page.goto(`${url}&globals=theme:${skin};mode:${mode}`);
    await scope.getByRole('radio', { name: `${levelLabel} (${entries.length})`, exact: true }).click();
    await expect(scope.locator('[data-demo-ready]')).toHaveCount(entries.length);
    await page.addScriptTag({ content: axe });
    for (const entry of entries) {
      const stage = scope.locator(`[data-component="${entry.id}"]`);
      await stage.scrollIntoViewIfNeeded();
      const failures = await stage.evaluate(async el => (await (window as any).axe.run(el, { runOnly: ['color-contrast'] })).violations.map((v: any) => ({ id: v.id, nodes: v.nodes.map((n: any) => ({ target: n.target, summary: n.failureSummary })) })));
      expect.soft(failures, `${entry.id} / ${skin}`).toEqual([]);
    }
  }
  for (const [font, family] of [['humanist', 'Source Sans 3'], ['plex', 'IBM Plex Sans'], ['studio', 'DM Sans']]) {
    await page.goto(`${url}&globals=theme:${mode};skin:gradient;fonts:${font}`);
    await scope.getByRole('radio', { name: `${levelLabel} (${entries.length})`, exact: true }).click();
    await expect(scope.locator('[data-demo-ready]')).toHaveCount(entries.length);
    for (const width of [375, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), { message: `${level}/${font}/${width} overflow` }).toBe(true);
    }
    for (const entry of entries) await expect(scope.locator(`[data-component="${entry.id}"]`)).toHaveCSS('font-family', new RegExp(family));
  }
  expect(errors).toEqual([]);
});

test('geometria alcança avatar, campos, paginação, calendário, cards e timeline nos dois modos', async ({ page }) => {
  await page.goto(url);
  const scope = page.getByTestId('playground');
  await scope.getByRole('radio', { name: `All (${componentCatalog.length})`, exact: true }).click();
  await expect(scope.locator('[data-demo-ready]')).toHaveCount(componentCatalog.length);
  const selectors = ['[data-component="Avatar"] [class*="avatar"]', '[data-component="Input"] input', '[data-component="Pagination"] button', '[data-component="Calendar"] [role="gridcell"] span', '[data-component="EventTimeline"] [class*="marker"]', '[data-component="WorkspaceSwitcher"] button', '[data-component="Card"] [class*="card"]'];
  for (const mode of ['light', 'dark']) {
    await page.goto(`${url}&globals=theme:refy-site;mode:${mode}`);
    await scope.getByRole('radio', { name: `All (${componentCatalog.length})`, exact: true }).click();
    await expect(scope.locator('[data-demo-ready]')).toHaveCount(componentCatalog.length);
    // Nenhum tema de fábrica zera o raio: o teste zera os tokens e confere que cada peça obedece.
    await page.addStyleTag({ content: '[data-refy-scope] { --radius-xs: 0px; --radius-sm: 0px; --radius-md: 0px; --radius-lg: 0px; --radius-xl: 0px; --radius-default: 0px; --radius-pill: 0px; --radius-full-token: 0px; --radius-lg-token: 0px; --radius-xl-token: 0px; }' });
    for (const selector of selectors) await expect(scope.locator(selector).first()).toHaveCSS('border-top-left-radius', '0px');
  }
});

for (const mode of ['light']) test(`${mode}: opções abertas têm contraste e selecionam pelo teclado`, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${url}&globals=theme:${mode};fonts:studio`);
  await page.addScriptTag({ content: axe });
  const scope = page.getByTestId('playground');
  for (const id of ['Combobox', 'Multiselect']) {
    const stage = scope.locator(`[data-component="${id}"]`);
    const input = stage.getByRole('combobox');
    await input.click();
    const list = scope.getByRole('listbox').filter({ visible: true });
    await expect(list).toBeVisible();
    await expect(list).toHaveCSS('font-family', /DM Sans/);
    const failures = await list.evaluate(async el => (await (window as any).axe.run(el, { runOnly: ['color-contrast'] })).violations.map((v: any) => ({ id: v.id, nodes: v.nodes.map((n: any) => n.failureSummary) })));
    expect(failures).toEqual([]);
    await input.press('ArrowDown'); await input.press('Enter'); await input.press('Escape');
    await expect(list).not.toBeVisible();
  }
});

test('todas as famílias juntas mantêm rótulos e referências acessíveis sem IDs duplicados', async ({ page }) => {
  await page.goto(url);
  const scope = page.getByTestId('playground');
  await scope.getByRole('radio', { name: `All (${componentCatalog.length})`, exact: true }).click();
  await expect(scope.locator('[data-demo-ready]')).toHaveCount(componentCatalog.length);
  await page.addScriptTag({ content: axe });
  const failures = await scope.evaluate(async el => (await (window as any).axe.run(el, { runOnly: ['label', 'duplicate-id-aria'] })).violations.map((v: any) => ({ id: v.id, nodes: v.nodes.map((n: any) => ({ target: n.target, html: n.html, failure: n.failureSummary })) })));
  expect(failures).toEqual([]);
});

test('atalhos de um exemplo não abrem os diálogos dos outros exemplos da galeria', async ({ page }) => {
  await page.goto(url);
  const scope = page.getByTestId('playground');
  await scope.getByRole('radio', { name: `Organisms (${componentCatalog.filter(item => item.level === 'Organismos').length})`, exact: true }).click();
  await expect(scope.locator('[data-demo-ready]')).toHaveCount(componentCatalog.filter(item => item.level === 'Organismos').length);
  for (const id of ['Command', 'Topbar', 'AppShell']) {
    await scope.locator(`[data-component="${id}"]`).getByRole('button', { name: id === 'Command' ? 'Open palette' : /Search/ }).first().press('Control+k');
    await expect(scope.getByRole('dialog')).toHaveCount(1);
    await expect(scope.getByRole('dialog').getByRole('combobox')).toBeFocused();
    await expect(scope.getByRole('tooltip')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(scope.getByRole('dialog')).toHaveCount(0);
  }
});
