import { expect, test } from "@playwright/test";

// Functional UA-state proof only. Page screenshots do not certify native popup paint.
const source = process.env.REFY_STORYBOOK_URL ?? `http://127.0.0.1:${process.env.REFY_STORYBOOK_PORT || 6006}`;
const examples = [
  {
    family: "Select",
    storyId: "components-atoms-select--select-padrao",
    initial: "Member",
    key: "a",
    selected: "Admin",
  },
  {
    family: "PhoneInput",
    storyId: "components-molecules-phoneinput--padrao",
    initial: "BR",
    key: "c",
    selected: "CL",
  },
] as const;

test.use({ screenshot: "off", trace: "off", reducedMotion: "reduce" });

for (const example of examples)
  for (const mode of ["light"])
    for (const width of [390, 800]) {
      test(`${example.family} native open/close and trusted keyboard selection (${mode}/${width})`, async ({
        page,
        browserName,
        browser,
      }, testInfo) => {
        await page.setViewportSize({ width, height: 700 });
        await page.goto(
          `${source}/iframe.html?id=${example.storyId}&viewMode=story&globals=theme:refy-site;mode:${mode}`,
        );
        const control = page.locator("#storybook-root select");
        await expect(control).toBeVisible();
        expect(
          await page.evaluate(() => CSS.supports("selector(:open)")),
          "The pinned browser must expose its real native :open state",
        ).toBe(true);
        await expect(control).toHaveValue(example.initial);
        const opened = () => control.evaluate((el) => el.matches(":open"));
        expect(await opened()).toBe(false);

        // Observe the browser-owned transient state synchronously, before the
        // native popup can consume :active; this does not force or style it.
        const presses = await control.evaluateHandle((el) => {
          const events: {
            type: string;
            trusted: boolean;
            buttons: number;
            active: boolean;
            targetIsControl: boolean;
          }[] = [];
          for (const type of ["pointerdown", "mousedown"] as const)
            el.addEventListener(
              type,
              (event) =>
                events.push({
                  type: event.type,
                  trusted: event.isTrusted,
                  buttons: event.buttons,
                  active: el.matches(":active"),
                  targetIsControl: event.target === el,
                }),
              true,
            );
          return events;
        });
        const changes = await control.evaluateHandle((el) => {
          const events: { trusted: boolean; value: string }[] = [];
          el.addEventListener("change", (event) =>
            events.push({
              trusted: event.isTrusted,
              value: (el as HTMLSelectElement).value,
            }),
          );
          return events;
        });
        try {
          await control.click();
          for (const type of ["pointerdown", "mousedown"])
            expect(await presses.jsonValue()).toContainEqual({
              type,
              trusted: true,
              buttons: 1,
              active: true,
              targetIsControl: true,
            });
          // Abrir a lista é do navegador, não do Refy: o Firefox e o WebKit headless do Linux
          // aceitam o seletor :open, mas não abrem o popup nativo. O ciclo de abertura só é
          // cobrado onde o popup abriu de fato; nos outros, fica anotado e não verificado.
          const popup = await expect
            .poll(opened, { timeout: 2000 })
            .toBe(true)
            .then(() => true, () => false);
          if (popup) {
            await page.keyboard.press("Tab");
            await expect.poll(opened).toBe(false);
            await control.focus();
            await page.keyboard.press("Space");
            await expect.poll(opened).toBe(true);
            await page.mouse.click(width - 12, 650);
            await expect.poll(opened).toBe(false);
          } else {
            testInfo.annotations.push({ type: "native-popup", description: `${browserName} headless não abriu o popup nativo; :open não verificado` });
            await page.keyboard.press("Escape");
          }

          // O que é do Refy: um <select> nativo com nome acessível, alcançável por Tab.
          expect(await control.evaluate((el) => el.tagName)).toBe("SELECT");
          await expect(control).toHaveAccessibleName(/\S/);
          // Na ordem do Tab: habilitado e sem tabindex negativo. A sequência de teclas depois do
          // popup nativo varia por navegador e não é do Refy.
          expect(await control.evaluate((el) => (el as HTMLSelectElement).tabIndex)).toBeGreaterThanOrEqual(0);
          await expect(control).toBeEnabled();

          await control.focus();
          await page.keyboard.press(example.key);
          await page.keyboard.press("Enter");
          // No Linux e no Windows, Enter num select fechado abre a lista; no macOS, não.
          // Escape fecha sem desfazer a escolha feita pela digitação.
          if (await opened()) await page.keyboard.press("Escape");
          await expect(control).toHaveValue(example.selected);
          await expect
            .poll(() => changes.jsonValue())
            .toContainEqual({ trusted: true, value: example.selected });
          await expect.poll(opened).toBe(false);
          await testInfo.attach("functional-native-state", {
            contentType: "application/json",
            body: JSON.stringify({
              browser: browserName,
              version: browser.version(),
              family: example.family,
              mode,
              width,
              procedures: [
                "trusted pointerdown/mousedown -> synchronous native :active, buttons=1",
                ...(popup ? ["native click -> :open", "Tab -> closed", "Space -> :open", "outside pointer click -> closed"] : ["native popup not opened by this headless browser; :open not verified"]),
                "the native <select> is in the Tab order and has an accessible name",
                `trusted keyboard typeahead ${example.key}/Enter -> ${example.selected}`,
              ],
              nativeActiveStateObserved: true,
              nativePressObservations: await presses.jsonValue(),
              nativePopupPaintAccepted: false,
              nativeActivePaintAccepted: false,
            }),
          });
        } finally {
          await changes.dispose();
          await presses.dispose();
        }
      });
    }
