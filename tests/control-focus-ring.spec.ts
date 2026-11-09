import { test, expect, type Page } from "@playwright/test";

// FOCUS-01: keyboard focus on IconButton and Switch control shows the same theme
// ring as Button (not the browser default ring) unless the public hooks override it.
const source = process.env.REFY_STORYBOOK_URL ?? `http://127.0.0.1:${process.env.REFY_STORYBOOK_PORT || 6006}`;

// WebKit on macOS moves keyboard focus to buttons only with Alt+Tab.
const tabKey = (page: Page) =>
  page.context().browser()?.browserType().name() === "webkit" ? "Alt+Tab" : "Tab";

async function ringAfterTab(page: Page, url: string, selector: string) {
  await page.goto(url);
  const target = page.locator(`#storybook-root ${selector}`).first();
  await target.waitFor();
  await page.evaluate(() => document.fonts.ready);
  for (let step = 0; step < 12; step++) {
    await page.keyboard.press(tabKey(page));
    if (
      await target.evaluate(
        (element) =>
          element === document.activeElement ||
          element.contains(document.activeElement),
      )
    )
      break;
  }
  return target.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      focused: element.matches(":focus-visible, :has(:focus-visible)"),
      style: style.outlineStyle,
      width: style.outlineWidth,
      color: style.outlineColor,
      offset: style.outlineOffset,
    };
  });
}

const story = (id: string, globals: string, args = "") =>
  `${source}/iframe.html?id=${id}&viewMode=story&globals=${globals}${args ? `&args=${args}` : ""}`;

for (const theme of ["refy-site"])
  for (const mode of ["light"])
    test(`anel de foco do tema em IconButton e Switch control (${theme}/${mode})`, async ({
      page,
    }) => {
      const globals = `${theme === "default" ? "" : `theme:${theme};`}mode:${mode}`;
      const button = await ringAfterTab(
        page,
        story("components-atoms-button--primary", globals),
        "button",
      );
      expect(button.focused).toBe(true);
      expect(button.style).toBe("solid");
      const controls = {
        IconButton: await ringAfterTab(
          page,
          story("components-atoms-iconbutton--outline", globals),
          "button",
        ),
        "Switch control": await ringAfterTab(
          page,
          story("components-atoms-switch--ligado", globals, "appearance:control"),
          "label",
        ),
      };
      for (const [name, ring] of Object.entries(controls)) {
        expect.soft(ring.focused, `${name}: keyboard focus`).toBe(true);
        expect.soft(ring, `${name}: same theme ring as Button`).toEqual(button);
      }
    });

test("hooks públicos prevalecem sobre o anel do tema", async ({ page }) => {
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent =
        ":root, [data-refy-scope] { --control-focus-outline: 3px dashed rgb(1, 2, 3); --control-focus-offset: 5px; }";
      document.head.append(style);
    });
  });
  for (const [id, selector, args] of [
    ["components-atoms-button--primary", "button", ""],
    ["components-atoms-iconbutton--outline", "button", ""],
    ["components-atoms-switch--ligado", "label", "appearance:control"],
  ] as const) {
    const ring = await ringAfterTab(page, story(id, "mode:light", args), selector);
    expect(ring.focused, id).toBe(true);
    expect(
      { style: ring.style, width: ring.width, color: ring.color, offset: ring.offset },
      id,
    ).toEqual({ style: "dashed", width: "3px", color: "rgb(1, 2, 3)", offset: "5px" });
  }
});
