import { test, expect } from "@playwright/test";

for (const story of ['splitbutton--secondary', 'usermenu--playground', 'usermenu--para-cima', 'helpmenu--playground', 'fabmenu--fechado', 'breadcrumb--sete-niveis']) {
  test(`Menu preserva a composição existente ${story}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/iframe.html?id=components-molecules-${story}&viewMode=story`);
    const trigger = page.locator('[aria-haspopup="menu"]');
    await expect(trigger).toHaveCount(1);
    expect(await trigger.evaluate(el => el.tagName)).toBe('BUTTON');
    const anchor = (await trigger.boundingBox())!;
    await trigger.click(); const menu = page.getByRole('menu'); await expect(menu).toBeVisible();
    await menu.evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(animation => animation.finished)));
    expect(await trigger.getAttribute('aria-controls')).toBe(await menu.getAttribute('id'));
    const bounds = (await menu.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.x + bounds.width).toBeLessThanOrEqual(375);
    if (story.startsWith('usermenu')) expect(Math.abs(bounds.width - anchor.width)).toBeLessThan(2);
    if (story === 'usermenu--para-cima') expect(bounds.y + bounds.height).toBeLessThanOrEqual(anchor.y);
    await page.keyboard.press('Escape'); await expect(menu).toHaveCount(0); await expect(trigger).toBeFocused();
  });
}

test('Aviso global acompanha só o diálogo de sua própria identidade', async ({ page }) => {
  await page.goto('/iframe.html?id=fundacao-temas-por-aplicacao--instancias&viewMode=story');
  const compact = page.getByTestId('compact'), rounded = page.getByTestId('rounded');
  await compact.getByRole('button', { name: 'Avisar', exact: true }).click();
  await rounded.getByRole('button', { name: 'Avisar', exact: true }).click();
  const compactNotice = compact.locator('[role="status"]'), roundedNotice = rounded.locator('[role="status"]');
  await expect(compactNotice).toBeVisible(); await expect(roundedNotice).toBeVisible();
  await compact.getByRole('button', { name: 'Abrir modal', exact: true }).click();
  expect(await compactNotice.evaluate(el => !!el.closest('[aria-modal="true"]'))).toBe(true);
  expect(await roundedNotice.evaluate(el => !!el.closest('[aria-modal="true"]'))).toBe(false);
  expect(await roundedNotice.evaluate(el => !!el.closest('[inert]'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(compact.getByRole('dialog')).toHaveCount(0);
  expect(await compactNotice.evaluate(el => !!el.closest('[aria-modal="true"]'))).toBe(false);
  expect(await roundedNotice.evaluate(el => !!el.closest('[inert]'))).toBe(false);
});
