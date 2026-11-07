import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

function url(mode = 'light', surface = 'modal', before = true, portalled = true) {
  return `/iframe.html?id=verificacao-contratos-essenciais--camadas&viewMode=story&args=mode:${mode};surface:${surface};before:${before};portalled:${portalled}`;
}
test('Button respeita bloqueios e dispara uma ação por ativação', async ({ page }) => {
  await page.goto(url());
  await expect(page.getByRole('button', { name: 'Desabilitado', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Carregando', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Carregando', exact: true })).toHaveAttribute('aria-busy', 'true');
  const button = page.getByRole('button', { name: 'Contar ação' });
  await button.press('Enter'); await expect(page.getByText('Cliques: 1', { exact: true })).toBeVisible();
  await button.press('Space'); await expect(page.getByText('Cliques: 2', { exact: true })).toBeVisible();
});

test('Input repete rótulo sem repetir ID e mantém descrições e erro', async ({ page }) => {
  await page.goto(url()); await page.getByRole('button', { name: 'Abrir fluxo' }).click();
  const inputs = page.getByRole('textbox', { name: 'Nome repetido' });
  const firstId = await inputs.nth(0).getAttribute('id'), secondId = await inputs.nth(1).getAttribute('id');
  expect(firstId).not.toBe(secondId); await expect(inputs.nth(0)).toHaveAttribute('aria-invalid', 'true');
  expect(await inputs.nth(0).getAttribute('aria-describedby')).toContain('external-description');
  const ids = (await inputs.nth(0).getAttribute('aria-describedby'))!.split(' ');
  expect(ids).toHaveLength(2);
  for (const id of ids) expect(await page.locator(`[id="${id}"]`).count()).toBe(1);
});

test('Menu pula item bloqueado, navega, busca, seleciona e restaura foco', async ({ page }) => {
  await page.goto(url()); await page.getByRole('button', { name: 'Abrir fluxo' }).click();
  const trigger = page.getByRole('button', { name: 'Ações do fluxo' });
  await trigger.press('ArrowDown'); const menu = page.getByRole('menu'); await expect(menu).toBeFocused();
  const active = () => menu.getAttribute('aria-activedescendant');
  expect(await active()).toContain('confirm'); await menu.press('ArrowUp'); expect(await active()).toContain('archive');
  await menu.press('Home'); expect(await active()).toContain('confirm'); await menu.press('End'); expect(await active()).toContain('archive');
  await menu.press('c'); expect(await active()).toContain('confirm'); await menu.press('Enter');
  await expect(page.getByText('Seleções: 1')).toBeVisible(); await expect(trigger).toBeFocused();
  await trigger.press('ArrowUp'); await expect(page.getByRole('menu')).toBeFocused(); expect(await active()).toContain('archive');
});

test('Diálogos aninhados restauram foco, inert e bloqueio de scroll', async ({ page }) => {
  await page.goto(url()); const trigger = page.getByRole('button', { name: 'Abrir fluxo' }); await trigger.click();
  const outer = page.getByRole('dialog', { name: 'Fluxo modal', exact: true });
  await expect(trigger).not.toBeFocused(); expect(await trigger.evaluate(el => !!el.closest('[inert]'))).toBe(true);
  const nestedTrigger = outer.getByRole('button', { name: 'Segundo diálogo' }); await nestedTrigger.click();
  const inner = page.getByRole('dialog', { name: 'Diálogo interno', exact: true }); await expect(inner).toBeVisible();
  await page.keyboard.press('Escape'); await expect(inner).toHaveCount(0); await expect(nestedTrigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  await page.keyboard.press('Escape'); await expect(outer).toHaveCount(0); await expect(trigger).toBeFocused();
  expect(await trigger.evaluate(el => !!el.closest('[inert]'))).toBe(false);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});

for (const mode of ['light']) for (const surface of ['modal', 'drawer']) for (const width of [375, 1280]) for (const before of [true, false]) for (const portalled of [true, false]) {
  test(`${mode}/${surface}/${width}/aviso-${before ? 'antes' : 'depois'}/ajuda-${portalled ? 'portal' : 'local'}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
    await page.goto(url(mode, surface, before, portalled));
    const notice = page.getByRole('status');
    const original = before ? await notice.elementHandle() : null;
    if (before) await notice.evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
    await page.getByRole('button', { name: 'Abrir fluxo' }).click();
    const dialog = page.getByRole('dialog'); await expect(dialog).toBeVisible();
    const trigger = page.getByRole('button', { name: 'Ações do fluxo' }); await trigger.click();
    const menu = page.getByRole('menu'); await expect(menu).toBeVisible(); await expect(notice).toBeVisible();
    expect(await notice.evaluate(el => !!el.closest('[aria-modal="true"]'))).toBe(true);
    if (original) expect(await original.evaluate(el => el.isConnected)).toBe(true);
    if (before) expect(await notice.evaluate(el => el.getAnimations().every(animation => animation.playState === 'finished'))).toBe(true);
    await Promise.all([menu, notice].map(target => target.evaluate(el => Promise.allSettled(el.getAnimations().map(animation => animation.finished)))));
    // Menu e aviso ainda se reposicionam depois das animações (âncora e pilha de avisos); mede quando param.
    const measure = () => Promise.all([menu.boundingBox(), notice.boundingBox()]);
    let bounds = await measure();
    await expect.poll(async () => { const previous = JSON.stringify(bounds); await page.waitForTimeout(100); bounds = await measure(); return JSON.stringify(bounds) === previous; }).toBe(true);
    for (const box of bounds) { expect(box).not.toBeNull(); expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x + box!.width).toBeLessThanOrEqual(width); }
    const [m, n] = bounds.map(b => b!);
    const hit = (a: typeof m, b: typeof m) => ({ x: (Math.max(a.x, b.x) + Math.min(a.x + a.width, b.x + b.width)) / 2, y: (Math.max(a.y, b.y) + Math.min(a.y + a.height, b.y + b.height)) / 2 });
    expect(Math.min(m.y + m.height, n.y + n.height) - Math.max(m.y, n.y)).toBeGreaterThan(0);
    const point = hit(m, n);
    expect(await page.evaluate(p => !!document.elementFromPoint(p.x, p.y)?.closest('[role="status"]'), point)).toBe(true);
    await page.getByRole('button', { name: 'Ajuda do fluxo' }).hover(); const help = page.getByRole('tooltip'); await expect(help).toBeVisible();
    await help.evaluate(el => Promise.allSettled(el.getAnimations().map(animation => animation.finished)));
    const h = (await help.boundingBox())!;
    const hp = hit(h, n);
    expect(Math.min(h.y + h.height, n.y + n.height) - Math.max(h.y, n.y)).toBeGreaterThan(0);
    expect(await page.evaluate(p => !!document.elementFromPoint(p.x, p.y)?.closest('[role="tooltip"]'), hp)).toBe(true);
    if (before && portalled) await page.screenshot({ path: `test-results/core-${mode}-${surface}-${width}-${test.info().project.name}.png` });
    await page.keyboard.press('Escape'); await expect(help).toHaveCount(0); await expect(menu).toBeVisible();
    await page.keyboard.press('Escape'); await expect(menu).toHaveCount(0); await expect(dialog).toBeVisible(); await expect(trigger).toBeFocused();
    await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0); await expect(notice).toBeVisible();
    if (original) expect(await original.evaluate(el => el.isConnected)).toBe(true);
  });
}

test('Aviso global permite ação por teclado durante modalidade', async ({ page }) => {
  await page.goto(url()); await page.getByRole('button', { name: 'Abrir fluxo' }).click();
  const action = page.getByRole('button', { name: 'Desfazer' });
  const tab = test.info().project.name === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
  for (let i = 0; i < 15 && !(await action.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press(tab);
  await expect(action).toBeFocused(); await action.press('Enter');
  await expect(page.getByRole('status')).toHaveCount(0); await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.getByRole('dialog').evaluate(el => el.contains(document.activeElement))).toBe(true);
  expect(await page.getByTestId('core-lab').evaluate(el => el.textContent?.includes('Ações do aviso: 1'))).toBe(true);
});

test('Menu não devolve foco a gatilho removido', async ({ page }) => {
  await page.goto(url()); await page.getByRole('button', { name: 'Abrir fluxo' }).click();
  const trigger = page.getByRole('button', { name: 'Ações do fluxo' }); await trigger.press('ArrowDown');
  await expect(page.getByRole('menu')).toBeFocused(); await trigger.evaluate(el => el.remove());
  await page.keyboard.press('Escape'); await expect(page.getByRole('menu')).toHaveCount(0); await expect(page.getByRole('dialog')).toBeFocused();
});
for (const mode of ['light']) for (const surface of ['modal', 'drawer']) {
  test(`${mode}/${surface}: axe com campo inválido, menu e aviso acionável`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(url(mode, surface)); await page.getByRole('button', { name: 'Abrir fluxo' }).click();
    await page.getByRole('button', { name: 'Ações do fluxo' }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    const violations = await page.evaluate(async () => {
      const axe = (window as unknown as { axe: { run: (context: string, options: unknown) => Promise<{ violations: { id: string; nodes: { target: string[] }[] }[] }> } }).axe;
      return (await axe.run('[data-testid="core-lab"]', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }));
    });
    expect(violations).toEqual([]);
  });
}

test('Toast não reinicia o prazo por rerender do consumidor', async ({ page }) => {
  await page.clock.install();
  await page.goto('/iframe.html?id=verificacao-contratos-essenciais--temporizador&viewMode=story');
  const notice = page.getByRole('status'); await expect(notice).toBeVisible();
  await page.clock.runFor(600); await page.getByRole('button', { name: 'Atualizar contador' }).click();
  await page.clock.runFor(450); await expect(notice).toHaveCount(0);
});
test('Toast pausa durante hover e foco, retomando o prazo restante', async ({ page }) => {
  await page.clock.install();
  await page.goto('/iframe.html?id=verificacao-contratos-essenciais--temporizador&viewMode=story');
  const notice = page.getByRole('status'); await expect(notice).toBeVisible();
  await notice.hover(); await page.clock.runFor(1500); await expect(notice).toBeVisible();
  await page.getByRole('button', { name: 'Ação temporizada' }).focus();
  await page.getByRole('button', { name: 'Atualizar contador' }).hover();
  await page.clock.runFor(1500); await expect(notice).toBeVisible();
  await page.getByRole('button', { name: 'Atualizar contador' }).focus();
  await page.clock.runFor(1100); await expect(notice).toHaveCount(0);
});

test('Tooltip controlado e defaultOpen montam no portal da identidade', async ({ page }) => {
  await page.goto('/iframe.html?id=verificacao-contratos-essenciais--ajuda-inicial&viewMode=story');
  await expect(page.getByRole('tooltip')).toHaveCount(2);
  await expect(page.getByRole('tooltip').nth(0)).toBeVisible();
  await expect(page.getByRole('tooltip').nth(1)).toBeVisible();
  expect(await page.getByRole('tooltip').evaluateAll(elements => elements.every(el => el.matches(':popover-open')))).toBe(true);
  await page.keyboard.press('Escape'); await expect(page.getByRole('tooltip')).toHaveCount(1);
  await page.keyboard.press('Escape'); await expect(page.getByRole('tooltip')).toHaveCount(0);
});
