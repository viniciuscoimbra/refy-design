import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

test("identidades lado a lado, escopo aninhado e troca preservam valor e menu", async ({ page }) => {
  await page.goto('/iframe.html?id=fundacao-temas-por-aplicacao--instancias&viewMode=story');
  const compact = page.getByTestId('compact'), rounded = page.getByTestId('rounded');
  await expect(compact).toBeVisible();
  await compact.getByLabel('Nome').fill('Ana');
  await compact.getByRole('button', { name: 'Ações', exact: true }).click();
  await expect(compact.getByRole('menu')).toBeVisible();
  const compactFont = await compact.evaluate(el => getComputedStyle(el).fontFamily);
  expect(await rounded.evaluate(el => getComputedStyle(el).fontFamily)).not.toBe(compactFont);
  expect(await page.getByTestId('nested').evaluate(el => getComputedStyle(el).fontFamily)).toBe(await rounded.evaluate(el => getComputedStyle(el).fontFamily));
  await page.getByRole('button', { name: 'Trocar modo' }).evaluate(el => (el as HTMLButtonElement).click());
  await expect(compact.getByRole('menu')).toBeVisible();
  await expect(compact.getByLabel('Nome')).toHaveValue('Ana');
  await expect(compact).toHaveAttribute('data-theme', 'dark');
  await expect(rounded).toHaveAttribute('data-theme', 'dark');
  // Clicking outside correctly dismisses a menu; changing the prop itself must preserve it.
});

for (const mode of ['claro', 'escuro', 'editorial']) {
  for (const width of [320, 1280]) {
    test(`${mode} ${width}: tokens, contraste automatizado, reflow e fontes bloqueadas`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/iframe.html?id=fundacao-temas-por-aplicacao--${mode}&viewMode=story`);
      const scope = page.getByTestId('default');
      await expect(scope).toBeVisible();
      expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
      expect(await scope.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      await scope.getByLabel('Nome').fill('Nome completo com conteúdo');
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      const violations = await page.evaluate(async () => {
        const axe = (window as unknown as { axe: { run: (context: string, options: unknown) => Promise<{ violations: { id: string; nodes: { target: string[] }[] }[] }> } }).axe;
        return (await axe.run('[data-testid="default"]', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }));
      });
      expect(violations).toEqual([]);
      await scope.evaluate(root => {
        const elements = [root, ...root.querySelectorAll('*')];
        const sizes = elements.map(el => [el as HTMLElement, parseFloat(getComputedStyle(el).fontSize)] as const);
        for (const [el, size] of sizes) el.style.fontSize = `${size * 2}px`;
      });
      expect(await scope.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      await expect(scope.getByRole('button', { name: 'Abrir modal', exact: true })).toBeVisible();
      await page.screenshot({ path: `test-results/themes-${mode}-${width}-${test.info().project.name}.png`, fullPage: true });
      await page.emulateMedia({ forcedColors: 'active' });
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
      await scope.getByRole('button', { name: 'Ações', exact: true }).focus();
      await expect(scope.getByRole('button', { name: 'Ações', exact: true })).toBeFocused();
    });
  }
}

test('tooltip em portal mantém a identidade do escopo aninhado', async ({ page }) => {
  await page.goto('/iframe.html?id=fundacao-temas-por-aplicacao--instancias&viewMode=story');
  const nested = page.getByTestId('nested');
  await nested.getByRole('button', { name: 'Ajuda', exact: true }).focus();
  await expect(nested.getByRole('tooltip')).toBeVisible();
  expect(await nested.getByRole('tooltip').evaluate(el => getComputedStyle(el).fontFamily)).toContain('Source Code Pro');
  expect(await nested.getByRole('tooltip').evaluate(el => getComputedStyle(el).getPropertyValue('--primary'))).toBe('#7550a0');
});

for (const mode of ['claro', 'escuro', 'editorial']) for (const surface of ['modal', 'drawer']) {
  test(`${mode}: identidade de menu, tooltip e aviso dentro de ${surface}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=fundacao-temas-por-aplicacao--${mode}&viewMode=story`);
    const scope = page.getByTestId('default');
    await scope.getByRole('button', { name: `Abrir ${surface}`, exact: true }).click();
    const dialog = scope.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Nome').fill('Dentro do painel');
    await dialog.getByRole('button', { name: 'Ações', exact: true }).click();
    await expect(dialog.getByRole('menu')).toBeVisible();
    await dialog.getByRole('menuitem', { name: 'Confirm' }).click();
    await expect(dialog.getByText('Confirmações: 1')).toBeVisible();
    await dialog.getByRole('button', { name: 'Ajuda', exact: true }).hover();
    const tooltip = scope.getByRole('tooltip');
    await expect(tooltip).toBeVisible();
    expect(await tooltip.evaluate(el => getComputedStyle(el).getPropertyValue('--primary'))).toBe(await scope.evaluate(el => getComputedStyle(el).getPropertyValue('--primary')));
    await dialog.getByRole('button', { name: 'Avisar', exact: true }).click();
    await expect(dialog.getByRole('status')).toBeVisible();
    await dialog.getByRole('button', { name: 'Close', exact: true }).last().click();
    await expect(dialog.getByRole('status')).toHaveCount(0);
    await expect(dialog.getByLabel('Nome')).toHaveValue('Dentro do painel');
  });
}
