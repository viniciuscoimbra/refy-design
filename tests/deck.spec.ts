import { test, expect } from '@playwright/test';

for (const mode of ['light']) test(`${mode}: DecisionDeck separa fotos, decisões, gesto e cancelamento`, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/iframe.html?id=components-organisms-swipedeck--gesto&viewMode=story&globals=theme:refy;mode:${mode}`);
  const first = page.getByRole('region', { name: 'Item 1 of 3', exact: true });
  const gallery = first.getByRole('region', { name: 'Media gallery', exact: true });
  const image = gallery.locator('img'); const initial = await image.getAttribute('src');
  await gallery.getByRole('button', { name: 'Next photo', exact: true }).click();
  await expect(gallery).toContainText('Photo 2 of 3'); await expect(image).not.toHaveAttribute('src', initial!); await expect(first).toBeVisible();
  await gallery.getByRole('button', { name: 'Previous photo', exact: true }).click(); await expect(gallery).toContainText('Photo 1 of 3');
  await gallery.focus(); await gallery.press('ArrowRight'); await expect(gallery).toContainText('Photo 2 of 3'); await expect(first).toBeVisible();
  const photo = (await image.boundingBox())!; const start = { x: photo.x + photo.width / 2, y: photo.y + photo.height / 2 };
  await page.mouse.move(start.x, start.y); await page.mouse.down(); await page.mouse.move(start.x + 30, start.y, { steps: 5 }); await page.mouse.up(); await expect(first).toBeVisible();
  await page.mouse.move(start.x, start.y); await page.mouse.down(); await page.mouse.move(start.x + 100, start.y, { steps: 5 });
  await first.dispatchEvent('pointercancel', { pointerId: 1 }); await page.mouse.up(); await expect(first).toBeVisible();
  await page.mouse.move(start.x, start.y); await page.mouse.down(); await page.mouse.move(start.x + 100, start.y, { steps: 5 }); await page.mouse.up();
  const second = page.getByRole('region', { name: 'Item 2 of 3', exact: true }); await expect(second).toBeVisible(); await expect(page.getByRole('status').last()).toContainText('Event: select');
  await second.focus(); await second.press('ArrowLeft');
  await expect(page.getByRole('region', { name: 'Item 3 of 3', exact: true })).toBeFocused(); await expect(page.getByRole('status').last()).toContainText('Event: reject');
  await page.getByRole('button', { name: 'Select', exact: true }).click(); await expect(page.getByRole('status').last()).toContainText('Event: select');
  await page.getByRole('button', { name: 'Restart queue', exact: true }).click(); await expect(first).toBeVisible(); await expect(gallery).toContainText('Photo 1 of 3');
  await page.getByRole('button', { name: 'Save', exact: true }).click(); await expect(second).toBeVisible();
  await page.getByRole('button', { name: 'Discard', exact: true }).click(); await expect(page.getByRole('region', { name: 'Item 3 of 3', exact: true })).toBeVisible();
});

for (const mode of ['light']) test(`${mode}: marca compacta troca por expandir somente em hover/foco`, async ({ page }) => {
  await page.goto(`/iframe.html?id=components-organisms-sidebar--compacta&viewMode=story&globals=theme:refy;mode:${mode}`);
  const trigger = page.getByRole('button', { name: 'Expand menu', exact: true });
  const logo = trigger.locator('[class*="compactBrand"]'), expand = trigger.locator('svg[class*="expandIcon"]');
  await page.mouse.move(500, 500); await expect(logo).toBeVisible(); await expect(expand).toBeHidden();
  await trigger.hover(); await expect(logo).toBeHidden(); await expect(expand).toBeVisible();
  await page.mouse.move(500, 500); await trigger.focus(); await expect(expand).toBeVisible();
  await trigger.click(); await expect(page.getByRole('button', { name: 'Collapse menu', exact: true })).toBeVisible();
});

test('DecisionDeck apresenta transição e registra uma única decisão no modo normal', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/iframe.html?id=components-organisms-swipedeck--gesto&viewMode=story');
  const card = page.getByRole('region', { name: 'Item 1 of 3', exact: true });
  expect(await card.evaluate(el => getComputedStyle(el).animationName)).toContain('card-enter');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('status').first()).toContainText('Recording decision');
  await expect(page.getByRole('region', { name: 'Item 2 of 3', exact: true })).toBeVisible();
  await expect(page.getByRole('status').last()).toContainText('Event: save');
});

// interação: SwipeDeck
test('DecisionDeck controlado avança por posição e reinicia mesmo com IDs repetidos', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/iframe.html?id=verificacao-contratos-essenciais--deck-controlado&viewMode=story');
  await page.getByRole('button', { name: 'Save', exact: true }).click(); await expect(page.getByRole('region', { name: 'Item 2 of 2', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Select', exact: true }).click(); await expect(page.getByText('Eventos: 2', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Restart queue', exact: true }).click(); await expect(page.getByRole('region', { name: 'Item 1 of 2', exact: true })).toBeVisible();
});
