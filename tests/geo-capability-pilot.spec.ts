import { test, expect, type Page } from "@playwright/test";

test.use({ screenshot: "off", trace: "off", reducedMotion: "reduce" });
async function open(page: Page, story: string, mode: string) {
  await page.goto(
    `/iframe.html?id=components-organisms-geoareapicker--${story}&viewMode=story&globals=theme:refy-site;mode:${mode}`,
  );
  await expect(
    page.getByRole("region", { name: "Search area selection", exact: true }),
  ).toBeVisible();
}
async function color(page: Page, id: string) {
  return page
    .locator(`[data-mark="${id}"]`)
    .evaluate((element) => getComputedStyle(element).color);
}
for (const mode of ["light"])
  for (const width of [1280, 390]) {
    test(`local geographic adapter synchronizes map, lists and range — ${mode}/${width}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      const external: string[] = [];
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.route("**/*", async (route) => {
        const url = new URL(route.request().url());
        if (
          url.protocol.startsWith("http") &&
          !["127.0.0.1", "localhost"].includes(url.hostname)
        ) {
          external.push(url.href);
          await route.abort();
        } else await route.continue();
      });
      await page.addInitScript(() => {
        Object.defineProperty(window, "__geoCalls", {
          value: [],
          writable: true,
        });
        const record = () => {
          (window as unknown as { __geoCalls: string[] }).__geoCalls.push(
            "geolocation",
          );
          throw Error("Unexpected geolocation");
        };
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition = record;
          navigator.geolocation.watchPosition = record;
        }
      });
      await open(page, "mapa-local", mode);
      await expect(
        page.getByText(/Simulated map — sample regions and distances/),
      ).toBeVisible();
      const map = page.getByRole("img", {
        name: "Simulated region map; use the arrows to explore and Enter or Space to select",
        exact: true,
      });
      const summary = page.getByText(/^Searching in /);
      const radius = page.getByRole("slider", {
        name: "Around Planalto — value",
        exact: true,
      });
      expect(
        await map.evaluate((element) =>
          element.closest("[data-theme]")?.getAttribute("data-theme"),
        ),
      ).toBe(mode);
      await expect(radius).toHaveAttribute("aria-valuenow", "2");
      await expect(summary).toContainText("Planalto, Itapoã");
      const initialItapoa = await color(page, "itapoa");
      const initialAvailable = await color(page, "vila-cloris");
      expect(initialItapoa).not.toBe(initialAvailable);
      // Actual SVG pointer event uses the existing D3 nearest-mark interaction.
      await page.locator('[data-mark="vila-cloris"] path').click();
      await expect(summary).toContainText("Vila Clóris");
      await expect(
        page.getByRole("button", {
          name: "Remove Vila Clóris from the search",
          exact: true,
        }),
      ).toBeVisible();
      expect(await color(page, "vila-cloris")).toBe(initialItapoa);
      // Textual control updates the same drawn state.
      await page
        .getByRole("button", {
          name: "Remove Vila Clóris from the search",
          exact: true,
        })
        .click();
      await expect(summary).not.toContainText("Vila Clóris");
      expect(await color(page, "vila-cloris")).toBe(initialAvailable);
      await page
        .getByRole("combobox", {
          name: "Nearby neighborhoods included",
          exact: true,
        })
        .click();
      await page
        .getByRole("option", { name: "Vila Clóris", exact: true })
        .click();
      await page.keyboard.press("Escape");
      await expect(summary).toContainText("Vila Clóris");
      expect(await color(page, "vila-cloris")).toBe(initialItapoa);
      // Built-in chart keyboard: Home=base; End=outside radius; neither toggles.
      await map.focus();
      await expect(map).toBeFocused();
      await map.press("Home");
      await map.press("Enter");
      await expect(
        page.getByText("Planalto is the main region and stays included.", {
          exact: true,
        }),
      ).toBeVisible();
      await map.press("End");
      await map.press("Enter");
      await expect(
        page.getByText(
          "Pampulha is outside the radius. Widen the surroundings to select it.",
          { exact: true },
        ),
      ).toBeVisible();
      await expect(summary).not.toContainText("Pampulha");
      // Radius makes regions available, never selected automatically.
      await radius.focus();
      await radius.press("End");
      await expect(radius).toHaveAttribute("aria-valuenow", "5");
      await expect(
        page.getByRole("button", {
          name: "Add Pampulha to the search",
          exact: true,
        }),
      ).toBeVisible();
      await expect(summary).not.toContainText("Pampulha");
      await map.focus();
      await map.press("End");
      await map.press("Space");
      await expect(summary).toContainText("Pampulha");
      await expect(
        page.getByRole("button", {
          name: "Remove Pampulha from the search",
          exact: true,
        }),
      ).toBeVisible();
      await radius.focus();
      await radius.press("Home");
      await expect(radius).toHaveAttribute("aria-valuenow", "0.5");
      await expect(summary).not.toContainText("Itapoã");
      await expect(summary).not.toContainText("Pampulha");
      await radius.press("End");
      await expect(summary).toContainText("Itapoã");
      await expect(summary).toContainText("Vila Clóris");
      await expect(summary).toContainText("Pampulha");
      await expect(
        page.getByRole("button", {
          name: "Planalto is the main neighborhood",
          exact: true,
        }),
      ).toBeDisabled();
      await expect(page.locator("body")).toHaveJSProperty(
        "scrollWidth",
        await page.evaluate(() => innerWidth),
      );
      expect(errors).toEqual([]);
      expect(external).toEqual([]);
      expect(
        await page.evaluate(
          () => (window as unknown as { __geoCalls: string[] }).__geoCalls,
        ),
      ).toEqual([]);

      await open(page, "erro", mode);
      await page.locator('[data-mark="vila-cloris"] path').click();
      await expect(
        page.getByText(
          "Selection kept: fix the error before changing regions.",
          { exact: true },
        ),
      ).toBeVisible();
      await expect(page.getByText(/^Searching in /)).not.toContainText(
        "Vila Clóris",
      );
      await expect(
        page.getByRole("combobox", {
          name: "Nearby neighborhoods included",
          exact: true,
        }),
      ).toBeDisabled();
      await open(page, "sem-mapa", mode);
      await expect(
        page.getByText("Map unavailable", { exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", {
          name: "Add Vila Clóris to the search",
          exact: true,
        })
        .click();
      await expect(page.getByText(/^Searching in /)).toContainText("Vila Clóris");
      expect(external).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
