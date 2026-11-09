import { test, expect } from '@playwright/test';
const story = (name: string, mode = 'light', theme = 'refy', fonts = 'humanist') => `/iframe.html?id=${name}&viewMode=story&globals=theme:${theme};mode:${mode};fonts:${fonts}`;
for (const mode of ['light']) {
  test(`${mode}: Kanban WIP e transições bloqueiam menu e teclado sem perder cards`, async ({ page }) => {
    await page.goto(story('components-organisms-kanbanboard--com-regras', mode));
    const todo = page.locator('[data-kanban-column="todo"]'), card = todo.locator('[data-kanban-card="a"]');
    await card.getByRole('button', { name: 'Actions for Review proposal', exact: true }).click();
    const menu = page.getByRole('menu', { name: 'Card actions' });
    await expect(menu.getByRole('menuitem', { name: /Move to In progress/ })).toHaveAttribute('aria-disabled', 'true');
    await expect(menu).toContainText('WIP limit of 1 reached.');
    await menu.press('Escape');
    const handle = card.getByRole('button', { name: 'Drag Review proposal', exact: true });
    await handle.press('Enter');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await handle.press('ArrowRight');
    await expect(page.getByRole('status')).toContainText('WIP limit');
    await handle.press('Enter');
    await expect(todo.locator('[data-kanban-card]')).toHaveCount(2);
    await handle.press('Enter'); await handle.press('ArrowRight'); await handle.press('ArrowRight'); await handle.press('Enter');
    const review = page.locator('[data-kanban-column="review"]');
    await expect(review.locator('[data-kanban-card="a"]')).toBeVisible();
    await review.getByRole('button', { name: 'Actions for Review proposal', exact: true }).click();
    await expect(page.getByRole('menu')).toContainText('Move not allowed');
    await expect(page.getByRole('menuitem', { name: /Move to To do/ })).toHaveAttribute('aria-disabled', 'true');
    await page.getByRole('menu').press('Escape');
    const zero = page.locator('[data-kanban-column="closed"]');
    await expect(zero).toContainText('0 / 0');
  });

  test(`${mode}: alça arrasta com cursor, card focado e preview sem abrir menu`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(story('components-organisms-kanbanboard--padrao', mode));
    const card = page.locator('[data-kanban-card="agency-1"]');
    const handle = card.getByRole('button', { name: 'Drag Review documentation', exact: true });
    const box = (await handle.boundingBox())!, target = (await page.locator('[data-kanban-column="waiting"]').boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
    await page.mouse.move(target.x + target.width / 2, target.y + 250, { steps: 15 });
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(page.locator('[popover="manual"][aria-hidden="true"]')).toBeVisible();
    expect(await handle.evaluate(el => getComputedStyle(el).cursor)).toBe('grabbing');
    const heightDifference = await card.evaluate(el => Math.abs((document.querySelector('[popover="manual"][aria-hidden="true"]')!.firstElementChild as HTMLElement).offsetHeight - (el as HTMLElement).offsetHeight));
    expect(heightDifference).toBeLessThanOrEqual(1);
    expect(await card.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
    if (mode === 'light' && testInfo.project.name === 'chromium') await page.screenshot({ path: 'docs/evidence/board-mobile/kanban-drag-light.jpg', type: 'jpeg', quality: 70 });
    await page.mouse.up();
    await expect(page.locator('[data-kanban-column="waiting"] [data-kanban-card="agency-1"]')).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('[popover="manual"][aria-hidden="true"]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.style.cursor)).not.toBe('grabbing');
    await expect(page.locator('[data-kanban-card="agency-1"] h3 button')).toBeFocused();
  });


  test(`${mode}: arraste bloqueado/cancelado e menu liberam captura e cursor`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(story('components-organisms-kanbanboard--com-regras', mode));
    const card = page.locator('[data-kanban-card="a"]'), lane = page.locator('[data-kanban-column="doing"]');
    const origin = (await card.boundingBox())!, target = (await lane.boundingBox())!;
    await page.mouse.move(origin.x + origin.width / 2, origin.y + origin.height - 10); await page.mouse.down();
    await page.mouse.move(target.x + target.width / 2, target.y + 250, { steps: 12 });
    await expect(lane).toHaveAttribute('data-drop-allowed', 'false');
    await page.mouse.up();
    await expect(page.locator('[data-kanban-column="todo"] [data-kanban-card="a"]')).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const handle = card.getByRole('button', { name: 'Drag Review proposal', exact: true });
    await handle.press('Enter');
    await card.getByRole('button', { name: 'Actions for Review proposal', exact: true }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.style.cursor)).not.toBe('grabbing');
    await page.getByRole('menu').press('Escape');
    const grip = (await handle.boundingBox())!;
    await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2); await page.mouse.down();
    await page.mouse.move(grip.x + grip.width / 2 + 40, grip.y + grip.height / 2 + 20, { steps: 6 });
    await page.keyboard.press('Escape'); await page.mouse.up();
    await expect(page.locator('[popover="manual"][aria-hidden="true"]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.style.cursor)).not.toBe('grabbing');
    await expect(page.locator('[data-kanban-column="todo"] [data-kanban-card="a"]')).toBeVisible();
  });
  test(`${mode}: busca e filtros preservam WIP e dados; novo card e ordenação funcionam`, async ({ page }) => {
    await page.goto(story('components-organisms-kanbanboard--padrao', mode));
    await expect(page.locator('[data-kanban-card]')).toHaveCount(4);
    await page.getByRole('textbox', { name: 'Search cards' }).fill('Review documentation');
    await expect(page.locator('[data-kanban-card]')).toHaveCount(1);
    await expect(page.locator('[data-kanban-column="backlog"]')).toContainText('2 / 4');
    await page.getByRole('textbox', { name: 'Search cards' }).fill('');
    await page.getByRole('button', { name: 'Filter', exact: true }).click();
    await page.getByRole('menuitem', { name: 'My cards', exact: true }).click();
    await expect(page.locator('[data-kanban-card]')).toHaveCount(2);
    await page.getByRole('button', { name: 'My cards', exact: true }).click();
    await page.getByRole('menuitem', { name: 'All cards', exact: true }).click();
    await expect(page.locator('[data-kanban-card]')).toHaveCount(4);
    await page.getByRole('button', { name: 'New card', exact: true }).click();
    await page.getByLabel('Card title').fill('Aprender com os testes');
    await page.getByRole('button', { name: 'Create card', exact: true }).click();
    await expect(page.locator('[data-kanban-card]')).toHaveCount(5);
    await page.getByRole('button', { name: 'Sort', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Title A–Z', exact: true }).click();
    await expect(page.locator('[data-kanban-column="backlog"] h3 button').first()).toHaveText('Aprender com os testes');
  });

  test(`${mode}: swipe pressiona visualmente a ação e cancelamento retorna ao repouso`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(story('components-organisms-swipedeck--gesto', mode));
    const card = page.getByRole('region', { name: 'Item 1 of 3', exact: true });
    await card.evaluate(el => Promise.allSettled(el.getAnimations().map(a => a.finished)));
    const select = page.getByRole('button', { name: 'Select', exact: true });
    const before = await select.evaluate(el => getComputedStyle(el).backgroundColor);
    const image = (await card.locator('img').boundingBox())!;
    await page.mouse.move(image.x + image.width / 2, image.y + image.height / 2); await page.mouse.down();
    await page.mouse.move(image.x + image.width / 2 + 50, image.y + image.height / 2, { steps: 6 });
    await expect(select).toHaveAttribute('data-refy-interaction', 'pressed');
    await expect.poll(() => select.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(before);
    await expect.poll(() => select.evaluate(el => parseFloat(getComputedStyle(el).scale))).toBeLessThan(1);
    await page.mouse.up();
    await expect(select).not.toHaveAttribute('data-refy-interaction', 'pressed');
    await expect(card).toBeVisible();
    await expect(page.getByRole('status').last()).toContainText('No decision');
  });
}

for (const mode of ['light']) for (const font of ['humanist', 'plex', 'studio']) {
  test(`${mode}/${font}: SchedulePicker em telefone com toque e múltiplos dias`, async ({ browser }, testInfo) => {
    const context = await browser.newContext({ viewport: { width: 320, height: 760 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.goto(story('components-organisms-visitschedulepicker--multi-dia', mode, 'refy', font));
    const scheduler = page.getByRole('region', { name: 'Choose availability for a visit' });
    await expect(scheduler).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    if (mode === 'light' && font === 'humanist' && testInfo.project.name === 'chromium') await page.screenshot({ path: 'docs/evidence/board-mobile/schedule-320-light.jpg', type: 'jpeg', quality: 70 });
    for (const width of [320, 375, 390]) {
      await page.setViewportSize({ width, height: 760 });
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => innerWidth)).toBe(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const overflow = await scheduler.evaluate(el => { const box = el.getBoundingClientRect(); return [...el.querySelectorAll<HTMLElement>('button,fieldset,aside')].filter(node => { const r = node.getBoundingClientRect(); return r.width > 0 && (r.left < box.left - 1 || r.right > box.right + 1 || node.scrollWidth > node.clientWidth + 2); }).map(el => el.textContent); });
      expect(overflow).toEqual([]);
    }
    const slot = scheduler.getByRole('button', { name: '08:00', exact: true });
    await slot.tap(); await expect(slot).toHaveAttribute('aria-pressed', 'true');
    await expect(scheduler.locator('aside')).toContainText('08h');
    await scheduler.getByRole('radio', { name: /24/ }).tap();
    await scheduler.getByRole('button', { name: '11:00', exact: true }).tap();
    await expect(scheduler.locator('aside')).toContainText('11h');
    await scheduler.getByRole('radio', { name: /23/ }).tap();
    await expect(slot).toHaveAttribute('aria-pressed', 'true');
    await scheduler.getByRole('gridcell', { name: '25', exact: true }).tap();
    await expect(scheduler.getByRole('radio', { name: /25/ })).toBeChecked();
    await scheduler.getByRole('button', { name: '12:00', exact: true }).tap();
    await expect(scheduler.locator('aside')).toContainText('12h');
    await context.close();
  });
}

for (const mode of ['light']) test(`${mode}: atualização externa durante arraste cancela sem reemitir dados`, async ({ page }) => {
  await page.goto(story('verification-board-contracts--atualizacao-externa', mode));
  const handle = page.getByRole('button', { name: 'Drag Review proposal', exact: true });
  const grip = (await handle.boundingBox())!;
  await page.mouse.move(grip.x + 10, grip.y + 10); await page.mouse.down();
  await page.mouse.move(grip.x + 60, grip.y + 30, { steps: 6 });
  await expect(page.locator('[popover="manual"][aria-hidden="true"]')).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('refy:test-board-update')));
  await expect(page.locator('[popover="manual"][aria-hidden="true"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.style.cursor)).not.toBe('grabbing');
  await page.mouse.up();
  await expect(page.locator('[data-kanban-column="doing"] [data-kanban-card="a"]')).toBeVisible();
  await expect(page.getByText('Changes: 0', { exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Move cancelled');
});

for (const mode of ['light']) test(`${mode}: Kanban com toque e alternativa de menu móvel`, async ({ browser, browserName }) => {
  const context = await browser.newContext({ viewport: { width: browserName === 'chromium' ? 900 : 390, height: 760 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto(story('components-organisms-kanbanboard--padrao', mode));
  const card = page.locator('[data-kanban-card="brief"]');
  if (browserName === 'chromium') {
    const handle = (await card.getByRole('button', { name: 'Drag Prepare new project', exact: true }).boundingBox())!;
    const target = (await page.locator('[data-kanban-column="review"]').boundingBox())!;
    const session = await context.newCDPSession(page);
    const startX = handle.x + handle.width / 2, startY = handle.y + handle.height / 2;
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: startX, y: startY, id: 0 }] });
    for (let step = 1; step <= 8; step++) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: startX + (target.x + target.width / 2 - startX) * step / 8, y: startY + 60 * step / 8, id: 0 }] });
    await expect(page.locator('[popover="manual"][aria-hidden="true"]')).toBeVisible();
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await session.detach();
  } else {
    await card.getByRole('button', { name: 'Actions for Prepare new project', exact: true }).tap();
    await page.getByRole('menuitem', { name: 'Move to To do', exact: true }).tap();
  }
  await expect(page.locator('[data-kanban-column="review"] [data-kanban-card="brief"]')).toBeVisible();
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.style.cursor)).not.toBe('grabbing');
  await context.close();
});
