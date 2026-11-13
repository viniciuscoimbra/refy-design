import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const story = (id: string, mode: string, theme = 'refy', font = 'humanist') => `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};mode:${mode};fonts:${font}`;

for (const mode of ['light']) {
  test(`${mode}: atividades agrupadas, autoria coesa e detalhes operacionais`, async ({ page }) => {
    await page.goto(story('components-organisms-eventtimeline--agrupamento', mode));
    await expect(page.locator('[data-activity-id]')).toHaveCount(4);
    expect(await page.locator('[data-activity-id]').evaluateAll(items => items.map(item => item.getAttribute('data-activity-id')))).toEqual(['1', '2', '3', '4']);
    await expect(page.locator('section[aria-labelledby]')).toHaveCount(2);
    const first = page.locator('[data-activity-id="1"]');
    await expect(first.locator('header')).toContainText('Ana Silva');
    await expect(first.locator('header [data-refy-avatar]')).toHaveCount(1);
    await expect(first.locator('time')).toHaveAttribute('datetime', '2026-10-23T17:30:00.000Z');
    await expect(first).toContainText('Aurora project');
    await page.goto(story('components-organisms-eventtimeline--cronologia', mode));
    const trigger = page.getByRole('button', { name: 'View activity', exact: true }).first();
    await trigger.click();
    await expect(page.getByRole('dialog', { name: 'Activity details' })).toContainText('Ana Silva');
    await page.getByRole('dialog').press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  // interação: EventTimeline
  test(`${mode}: widget reutiliza conteúdo compacto e abre histórico; popover fecha por teclado`, async ({ page }) => {
    await page.goto(story('components-organisms-eventtimeline--widget', mode));
    await expect(page.locator('[data-activity-id]')).toHaveCount(4);
    await expect(page.locator('section[aria-labelledby]')).toHaveCount(0);
    await page.getByRole('button', { name: 'See full history' }).click();
    await expect(page.getByRole('dialog', { name: 'Activity history' })).toBeVisible();
    await page.getByRole('dialog').press('Escape');
    await expect(page.getByRole('button', { name: 'See full history' })).toBeFocused();
    await page.goto(story('components-organisms-eventtimeline--notificacoes', mode));
    const trigger = page.getByRole('button', { name: 'Open recent activity' });
    await trigger.click();
    await expect(page.getByRole('dialog', { name: 'Recent activity', exact: true })).toContainText('Ana Silva');
    await page.getByRole('dialog').press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  // interação: Timeline
  test(`${mode}: marcos alternam, preservam ordem e abrem detalhes`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(story('components-organisms-timeline--vertical', mode));
    const items = page.locator('[data-milestone-id]');
    await expect(items).toHaveCount(4);
    expect(await items.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-milestone-id')))).toEqual(['discovery', 'prototype', 'delivery', 'launch']);
    await expect(page.locator('[aria-current="step"]')).toContainText('Preparing the launch');
    const first = await items.nth(0).locator('[class*="card"]').boundingBox(), second = await items.nth(1).locator('[class*="card"]').boundingBox();
    expect(first!.x + first!.width).toBeLessThan(second!.x);
    await expect(items.first().locator('img')).toHaveCount(2);
    const trigger = page.getByRole('button', { name: 'View milestone', exact: true }).first();
    await trigger.click();
    await expect(page.getByRole('dialog', { name: 'The start of the journey' })).toBeVisible();
    await page.getByRole('dialog').press('Escape');
    await expect(trigger).toBeFocused();
  });

  // interação: Timeline
  test(`${mode}: horizontal rola por teclado sem aumentar a página`, async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 800 });
    await page.goto(story('components-organisms-timeline--horizontal', mode));
    const region = page.getByRole('region', { name: 'Milestones, scroll to see the sequence' });
    await region.focus(); await region.press('ArrowRight');
    await expect.poll(() => region.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
    await region.press('End');
    expect(await region.evaluate(el => Math.abs(el.scrollWidth - el.clientWidth - el.scrollLeft))).toBeLessThan(2);
    await region.press('Home');
    await expect.poll(() => region.evaluate(el => el.scrollLeft)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.goto(story('components-organisms-timeline--vertical', mode) + '&args=orientation:horizontal');
    const button = page.getByRole('button', { name: 'View milestone', exact: true }).first();
    await button.press('ArrowRight');
    expect(await page.getByRole('region', { name: 'Milestones, scroll to see the sequence' }).evaluate(el => el.scrollLeft)).toBeLessThan(100);
    await expect(button).toBeFocused();
    await button.press('Enter');
    await expect(page.getByRole('dialog', { name: 'The start of the journey' })).toBeVisible();
  });

  test(`${mode}: vazio, retry e ação da molécula são reais`, async ({ page }) => {
    await page.goto(story('components-organisms-eventtimeline--erro', mode));
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.locator('[data-activity-id]')).toHaveCount(4);
    await page.goto(story('components-organisms-timeline--vazio', mode));
    await expect(page.getByText('No milestones yet', { exact: true })).toBeVisible();
    await page.goto(story('components-organisms-eventtimeline--vazio', mode));
    await expect(page.getByText('No activity yet', { exact: true })).toBeVisible();
    await page.goto(story('components-molecules-activityitem--com-autoria', mode));
    await page.getByRole('button', { name: 'Mark as read' }).click();
    await expect(page.getByRole('button', { name: 'Read', exact: true })).toBeDisabled();
  });

  for (const font of ['humanist']) {
    test(`${mode}/${font}: três temas, caixa de 320px e contraste de atividades/marcos`, async ({ page }) => {
      test.setTimeout(90000);
      await page.setViewportSize({ width: 352, height: 900 });
      for (const theme of ['refy', 'outline', 'gradient']) {
        for (const id of ['components-organisms-timeline--texto-longo', 'components-organisms-eventtimeline--conteudo-longo', 'components-organisms-eventtimeline--widget']) {
          await page.goto(story(id, mode, theme, font));
          await expect(page.locator('[data-milestone-id], [data-activity-id]').first()).toBeVisible();
          await page.evaluate(() => document.fonts.ready);
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          const overflow = await page.locator('[data-milestone-id], [data-activity-id]').evaluateAll(nodes => nodes.filter(node => node.scrollWidth > node.clientWidth + 1).map(node => node.getAttribute('data-milestone-id') ?? node.getAttribute('data-activity-id')));
          expect(overflow).toEqual([]);
          if (id.includes('timeline--texto')) {
            const cards = page.locator('[data-milestone-id] [class*="card"]');
            const first = (await cards.nth(0).boundingBox())!, second = (await cards.nth(1).boundingBox())!;
            expect(Math.abs(first.x - second.x)).toBeLessThan(1);
          }
          await page.addScriptTag({ content: axe });
          const violations = await page.evaluate(async () => (await (window as any).axe.run(document.getElementById('storybook-root'), { runOnly: ['color-contrast'] })).violations.map((v: any) => ({ id: v.id, nodes: v.nodes.map((n: any) => n.failureSummary) })));
          expect(violations, `${id}/${theme}`).toEqual([]);
        }
      }
    });
  }
}

test('Playground distingue os dois organismos e documenta a molécula com código real', async ({ page }) => {
  await page.goto('/iframe.html?id=fundamentos-playground--aplicacao&viewMode=story&globals=theme:refy-site;mode:light');
  const frame = page.frameLocator('[data-testid="playground-frame"]');
  await frame.getByRole('button', { name: 'Ver Timeline', exact: true }).click();
  const title = frame.getByRole('heading', { level: 1 });
  await expect(title).toHaveText('Timeline');
  const nav = frame.getByRole('navigation', { name: 'Catálogo de componentes' });
  await nav.getByRole('link', { name: 'ActivityTimeline', exact: true }).click();
  await expect(title).toHaveText('ActivityTimeline');
  await expect(frame.getByText('EventTimeline é um alias de compatibilidade.', { exact: false }).first()).toBeVisible();
  await nav.getByRole('link', { name: 'ActivityItem', exact: true }).click();
  await expect(title).toHaveText('ActivityItem');
  await expect(frame.getByRole('heading', { name: 'Instalação', exact: true })).toBeVisible();
  await expect(frame.locator('pre code').first()).toContainText("from '@refy-design/web'");
});
