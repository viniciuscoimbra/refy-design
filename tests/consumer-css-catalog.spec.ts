import { test, expect, type Page } from "@playwright/test";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
test.use({ screenshot: "off", trace: "off" });
const docs = resolve("src/pages/PlaygroundPage/documentation");
const selectedFamilies = process.env.REFY_CSS_FAMILIES?.split(",");
const families = readdirSync(docs)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(resolve(docs, f), "utf8")))
  .filter((f) => !selectedFamilies || selectedFamilies.includes(f.id));
if (selectedFamilies?.some((id) => !families.some((f) => f.id === id)))
  throw new Error("Unknown family in REFY_CSS_FAMILIES");
async function compare(page: Page, reference: string) {
  return page.evaluate(async (css) => {
    await document.fonts.ready;
    const frame = () =>
      new Promise<void>((r) => requestAnimationFrame(() => r()));
    await frame();
    await frame();
    function classes() {
      const found = new Set<string>();
      function visit(rules: CSSRuleList) {
        for (const rule of Array.from(rules)) {
          if ("selectorText" in rule)
            for (const match of String(
              (rule as CSSStyleRule).selectorText,
            ).matchAll(/\.(_[\w-]+)/g))
              found.add(match[1]);
          if ("cssRules" in rule) visit((rule as CSSGroupingRule).cssRules);
        }
      }
      for (const sheet of Array.from(document.styleSheets))
        visit(sheet.cssRules);
      return found;
    }
    const loaded = classes();
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[class], [data-testid="catalog-example"] [style]',
      ),
    ).filter(
      (el) =>
        el.hasAttribute("style") ||
        Array.from(el.classList).some((c) => c.startsWith("_")),
    );
    const props = [
      "display",
      "aspect-ratio",
      "max-height",
      "position",
      "color",
      "background-color",
      "background-image",
      "border-top-width",
      "border-top-style",
      "border-top-color",
      "border-radius",
      "padding-top",
      "padding-right",
      "padding-bottom",
      "padding-left",
      "margin-top",
      "gap",
      "font-family",
      "font-size",
      "font-weight",
      "line-height",
      "flex-direction",
      "align-items",
      "justify-content",
      "overflow",
      "z-index",
      "box-shadow",
      "outline-width",
    ];
    const state = (el: Element) =>
      [
        el.matches(":hover"),
        el.matches(":focus-visible"),
        el.matches(":focus-within"),
      ].join(":");
    const states = new Map(elements.map((el) => [el, state(el)]));
    const before = new Map(
      elements.slice(0, 600).map((el) => {
        const style = getComputedStyle(el);
        return [el, props.map((p) => style.getPropertyValue(p))] as const;
      }),
    );
    const referenceStyle = document.createElement("style");
    referenceStyle.textContent = css;
    document.head.append(referenceStyle);
    await document.fonts.ready;
    await frame();
    await frame();
    const complete = classes();
    const missing = [
      ...new Set(
        elements.flatMap((el) =>
          Array.from(el.classList).filter(
            (c) => c.startsWith("_") && complete.has(c) && !loaded.has(c),
          ),
        ),
      ),
    ];
    const differences: {
      element: string;
      property: string;
      selective: string;
      complete: string;
    }[] = [];
    let stateChanges = 0;
    for (const [el, values] of before) {
      if (!el.isConnected) continue;
      if (states.get(el) !== state(el)) {
        stateChanges++;
        continue;
      }
      const style = getComputedStyle(el);
      props.forEach((p, i) => {
        const value = style.getPropertyValue(p);
        if (values[i] !== value)
          differences.push({
            element: `${el.tagName}.${el.className}`,
            property: p,
            selective: values[i],
            complete: value,
          });
      });
    }
    referenceStyle.remove();
    await frame();
    await frame();
    return {
      missing,
      differences: differences.slice(0, 30),
      compared: before.size,
      stateChanges,
    };
  }, reference);
}
async function openLayer(page: Page, id: string) {
  const root = page.getByTestId("catalog-example");
  if (id === "ContextMenu") {
    await root
      .getByText("Right-click or use Shift + F10.", {
        exact: true,
      })
      .click({ button: "right", timeout: 2000 });
    await page.getByRole("menu").waitFor({ state: "visible" });
    return true;
  }
  if (["Tooltip", "HoverCard"].includes(id)) {
    const target = root.getByRole("button").first();
    if (await target.count()) {
      await target.hover();
      await (
        id === "Tooltip"
          ? page.getByRole("tooltip")
          : page.locator('[data-ds-floating][data-motion-state="open"]').first()
      ).waitFor({ state: "visible", timeout: 2500 });
      return true;
    }
    return false;
  }
  if (
    [
      "Modal",
      "Drawer",
      "AlertDialog",
      "Menu",
      "Menubar",
      "NavigationMenu",
      "Popover",
      "Select",
      "Combobox",
      "Multiselect",
      "NotificationBell",
      "UserMenu",
      "WorkspaceSwitcher",
      "DatePicker",
      "FabMenu",
      "HelpMenu",
      "SplitButton",
    ].includes(id)
  ) {
    const combo = root.getByRole("combobox").first();
    if (await combo.count()) {
      await combo.click({ timeout: 2000 });
      if (id !== "Select")
        await page
          .getByRole("listbox")
          .waitFor({ state: "visible", timeout: 2500 });
      return true;
    }
    const popup = root.locator("[aria-haspopup]").first();
    if (await popup.count()) {
      await popup.click({ timeout: 2000 });
      return true;
    }
    const button = root.getByRole("button").first();
    if (await button.count()) {
      await button.click({ timeout: 2000 });
      return true;
    }
  }
  return false;
}
for (const mode of ["light", "dark"])
  test(`catálogo instalado com CSS seletivo — ${mode}`, async ({
    page,
    request,
  }, info) => {
    test.skip(
      !process.env.REFY_CSS_CATALOG_URL,
      "Prepare consumidor com scripts/prepare-css-catalog.mjs.",
    );
    test.setTimeout(240000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const response = await request.get(
      `${process.env.REFY_CSS_CATALOG_URL}/reference.css`,
    );
    expect(response.ok()).toBe(true);
    const reference = await response.text();
    expect(reference).toMatch(/\._btn_/);
    const rows: any[] = [];
    for (const family of families) {
      await test.step(family.id, async () => {
        const errors: string[] = [];
        const listen = (error: Error) => errors.push(error.message);
        page.on("pageerror", listen);
        const row: any = { family: family.id, example: family.selected, mode };
        try {
          await page.goto(
            `${process.env.REFY_CSS_CATALOG_URL}/?family=${family.id}&mode=${mode}`,
            { timeout: 12000 },
          );
          await page
            .getByTestId("catalog-example")
            .waitFor({ state: "attached", timeout: 10000 });
          await page.addStyleTag({
            content:
              "*,*::before,*::after{animation:none!important;transition:none!important}",
          });
          row.initial = await compare(page, reference);
          if (await openLayer(page, family.id)) {
            if (!["Tooltip", "HoverCard"].includes(family.id))
              await page.mouse.move(0, 0);
            row.open = await compare(page, reference);
            row.layers = await page
              .locator(
                '[role="dialog"],[role="alertdialog"],[role="menu"],[role="listbox"],[role="tooltip"]',
              )
              .evaluateAll((els) =>
                els
                  .filter((el) => el.getClientRects().length)
                  .map((el) => el.getAttribute("role")),
              );
            if (["Modal", "Drawer", "AlertDialog"].includes(family.id))
              expect(row.layers).toEqual(
                expect.arrayContaining([
                  family.id === "AlertDialog" ? "alertdialog" : "dialog",
                ]),
              );
          }
          row.errors = errors;
        } catch (error) {
          row.error = String(error);
        } finally {
          page.off("pageerror", listen);
          rows.push(row);
          if (rows.length % 20 === 0)
            writeFileSync(
              info.outputPath("css-catalog.json"),
              JSON.stringify(rows, null, 2),
            );
        }
      });
    }
    writeFileSync(
      info.outputPath("css-catalog.json"),
      JSON.stringify(rows, null, 2),
    );
    const failures = rows.filter(
      (r) =>
        r.error ||
        r.errors?.length ||
        [r.initial, r.open].some(
          (s) => s && (s.missing.length || s.differences.length),
        ),
    );
    expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
    expect(rows).toHaveLength(families.length);
  });
