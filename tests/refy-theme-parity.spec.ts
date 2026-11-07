import { test, expect } from "@playwright/test";

// O playground mostra o componente num iframe próprio (PreviewFrame), montado a partir
// da mesma story; a paridade fica entre a página do site e a story.
const entries = [
  "refy-site--accordion",
  "components-molecules-accordion--accordion-single",
];

test("o mesmo preset e exemplo mantêm a aparência no site e na story", async ({
  page,
}) => {
  for (const mode of ["light", "dark"]) {
    let reference: unknown;
    for (const id of entries) {
      await page.goto(
        `/iframe.html?id=${id}&viewMode=story&globals=theme:refy-site;mode:${mode}`,
      );
      const trigger = page
        .getByRole("button", {
          name: "How should I organize my files?",
          exact: true,
        })
        .first();
      await expect(trigger).toBeVisible();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      const appearance = await trigger.evaluate((element) => {
        const heading = element.parentElement!;
        const item = heading.parentElement!;
        const wrapper = item.parentElement!;
        const paragraph = item.querySelector("p")!;
        const pick = (node: Element, names: string[]) => {
          const css = getComputedStyle(node);
          return Object.fromEntries(
            names.map((name) => [name, css.getPropertyValue(name)]),
          );
        };
        return {
          mode: element.closest("[data-theme]")?.getAttribute("data-theme"),
          brand: element
            .closest("[data-refy-brand]")
            ?.getAttribute("data-refy-brand"),
          trigger: pick(element, [
            "font-family",
            "font-size",
            "font-weight",
            "line-height",
            "padding",
            "color",
          ]),
          heading: pick(heading, ["margin", "background-color"]),
          item: pick(item, ["border-width", "border-radius", "border-color"]),
          wrapper: pick(wrapper, ["gap", "border-width", "background-color"]),
          content: pick(paragraph, [
            "font-family",
            "font-size",
            "line-height",
            "color",
            "margin",
          ]),
        };
      });
      expect(appearance.mode).toBe(mode);
      expect(appearance.brand).toBe("Refy Site");
      if (reference) expect(appearance).toEqual(reference);
      else reference = appearance;
    }
  }
});

test("a composição Refy Site aparece na navegação com seu link preservado", async ({
  page,
}) => {
  await page.goto(
    "/?path=/story/refy-site--accordion&globals=theme:refy-site;mode:light",
  );
  await expect(page.locator("#refy-site--accordion")).toBeVisible();
  await expect(page.locator("#componentes-páginas-refy-site")).toBeVisible();
});
