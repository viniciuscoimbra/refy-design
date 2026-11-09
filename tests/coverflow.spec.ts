import { test, expect } from "@playwright/test";
test.use({ screenshot: "off", trace: "off" });
for (const mode of ["light"])
  for (const width of [390, 800]) {
    test(`Coverflow finite keyboard, controlled identity and explicit activation ${mode}/${width}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(
        `/iframe.html?id=components-organisms-coverflow--controlado&viewMode=story&globals=theme:refy;mode:${mode}`,
      );
      const region = page.getByRole("region", { name: "Browse content" });
      const first = region.getByRole("button", {
        name: "First reference",
        exact: true,
      });
      const third = region.getByRole("button", {
        name: "Third reference",
        exact: true,
      });
      await expect(first).toHaveAttribute("aria-pressed", "true");
      await expect(
        region.getByRole("button", { name: "Previous item" }),
      ).toBeDisabled();
      await first.focus();
      await page.keyboard.press("ArrowRight");
      const second = region.getByRole("button", {
        name: "Second reference",
        exact: true,
      });
      await expect(second).toBeFocused();
      await expect(second).toHaveAttribute("aria-pressed", "true");
      await page.keyboard.press("End");
      await expect(
        region.getByRole("button", { name: "Fourth reference", exact: true }),
      ).toBeFocused();
      await expect(
        region.getByRole("button", { name: "Next item" }),
      ).toBeDisabled();
      await page.keyboard.press("Home");
      await expect(first).toBeFocused();
      await expect(
        page.getByText("Activation: No item activated", { exact: true }),
      ).toBeVisible();
      await page.keyboard.press("Enter");
      await expect(
        page.getByText("Activation: First reference", { exact: true }),
      ).toBeVisible();
      const external = page.getByRole("button", {
        name: "Select the third one externally",
      });
      await external.focus();
      await external.press("Enter");
      await expect(external).toBeFocused();
      await expect(third).toHaveAttribute("aria-pressed", "true");
      await page.getByRole("button", { name: "Reverse order" }).click();
      await expect(third).toHaveAttribute("aria-pressed", "true");
      await expect(region.getByRole("status")).toContainText("2 of 4");
      await page
        .getByRole("button", { name: "Toggle short list" })
        .click();
      await expect(first).toHaveAttribute("aria-pressed", "true");
      await page
        .getByRole("button", { name: "Toggle short list" })
        .click();
      await expect(third).toHaveAttribute("aria-pressed", "true");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      expect(overflow).toBe(false);
    });
    test(`Coverflow drag, cancel and nonactivation ${mode}/${width}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(
        `/iframe.html?id=components-organisms-coverflow--controlado&viewMode=story&globals=theme:refy;mode:${mode}`,
      );
      const region = page.getByRole("region", { name: "Browse content" });
      const first = region.getByRole("button", {
        name: "First reference",
        exact: true,
      });
      const second = region.getByRole("button", {
        name: "Second reference",
        exact: true,
      });
      await expect(first).toBeVisible();
      const box = (await first.boundingBox())!;
      const x = box.x + box.width * 0.6,
        y = box.y + box.height * 0.5;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(Math.max(1, x - box.width * 0.8), y, { steps: 8 });
      await page.mouse.up();
      await expect(second).toHaveAttribute("aria-pressed", "true");
      await expect(
        page.getByText("Activation: No item activated", { exact: true }),
      ).toBeVisible();
      await region.evaluate(async (el) => {
        await Promise.all(
          el
            .getAnimations({ subtree: true })
            .filter((animation) =>
              Number.isFinite(animation.effect?.getComputedTiming().endTime),
            )
            .map((animation) => animation.finished.catch(() => {})),
        );
      });
      const target = (await second.boundingBox())!;
      await page.mouse.move(target.x + target.width / 2, y);
      await page.mouse.down();
      await page.mouse.move(
        target.x + target.width / 2 + target.width * 0.55,
        y,
        { steps: 8 },
      );
      await expect(region.locator("[data-dragging=true]")).toBeVisible();
      await second.dispatchEvent("pointercancel", {
        pointerId: 1,
        bubbles: true,
      });
      await page.mouse.up();
      await expect(second).toHaveAttribute("aria-pressed", "true");
      await expect(
        page.getByText("Activation: No item activated", { exact: true }),
      ).toBeVisible();
    });
  }
test("Coverflow empty, single, disabled, long labels and token/reduced motion", async ({
  page,
}) => {
  for (const story of ["vazio", "um-item", "desabilitado", "itens-longos"]) {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(
      `/iframe.html?id=components-organisms-coverflow--${story}&viewMode=story`,
    );
    const region = page.getByRole("region", { name: "Browse content" });
    await expect(region).toBeVisible();
    if (story === "vazio")
      await expect(region.getByRole("status")).toHaveText(
        "No content available.",
      );
    if (story === "um-item") {
      await expect(
        region.getByRole("button", { name: "Previous item" }),
      ).toBeDisabled();
      await expect(
        region.getByRole("button", { name: "Next item" }),
      ).toBeDisabled();
    }
    if (story === "desabilitado")
      for (const button of await region.getByRole("button").all())
        await expect(button).toBeDisabled();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(
    "/iframe.html?id=components-organisms-coverflow--padrao&viewMode=story",
  );
  const normal = page.getByRole("button", {
    name: "First reference",
    exact: true,
  });
  await expect(normal).toBeVisible();
  expect(
    await normal.evaluate((el) =>
      parseFloat(
        getComputedStyle(el.parentElement!.parentElement!).transitionDuration,
      ),
    ),
  ).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(
    "/iframe.html?id=components-organisms-coverflow--padrao&viewMode=story",
  );
  await expect(page.getByRole("region")).toHaveAttribute(
    "data-reduced-motion",
    "true",
  );
  const reducedStyles = await page
    .getByRole("button", { name: "First reference", exact: true })
    .evaluate((el) => ({
      item: getComputedStyle(el.parentElement!).transitionDuration,
      track: getComputedStyle(el.parentElement!.parentElement!)
        .transitionDuration,
      transform: getComputedStyle(el.parentElement!).transform,
    }));
  expect(reducedStyles.transform).toBe("none");
  // The shared reduced-motion reset retains a near-zero lifecycle duration.
  expect(parseFloat(reducedStyles.item)).toBeLessThanOrEqual(0.00001);
  expect(parseFloat(reducedStyles.track)).toBeLessThanOrEqual(0.00001);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(
    "/iframe.html?id=components-organisms-coverflow--movimento-reduzido&viewMode=story",
  );
  await expect(page.getByRole("region")).toHaveAttribute(
    "data-reduced-motion",
    "true",
  );
  expect(
    await page
      .getByRole("button", { name: "First reference", exact: true })
      .evaluate((el) =>
        parseFloat(
          getComputedStyle(el.parentElement!.parentElement!).transitionDuration,
        ),
      ),
  ).toBeLessThanOrEqual(0.00001);
});

test("Coverflow modes preserve geometry and public theme controls font and item width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const metrics = [];
  for (const mode of ["light", "dark"]) {
    await page.goto(
      `/iframe.html?id=components-organisms-coverflow--padrao&viewMode=story&globals=theme:refy;mode:${mode}`,
    );
    const item = page.getByRole("button", {
      name: "First reference",
      exact: true,
    });
    await expect(item).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    metrics.push(
      await item.evaluate((el) => ({
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height,
        font: getComputedStyle(el).fontFamily,
      })),
    );
  }
  expect(metrics[1]).toEqual(metrics[0]);
  await page.goto(
    "/iframe.html?id=components-organisms-coverflow--tema-configurado&viewMode=story",
  );
  const custom = page.getByRole("button", {
    name: "First reference",
    exact: true,
  });
  await expect(custom).toBeVisible();
  expect(
    await custom.evaluate((el) => getComputedStyle(el).fontFamily),
  ).toContain("monospace");
  expect((await custom.boundingBox())!.width).toBeLessThan(metrics[0].width);
});

test("Coverflow real touch horizontal gesture selects without activating or scrolling the page", async ({
  browser,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Trusted touch sequence uses Chromium CDP; WebKit pointer and cancellation are covered separately.",
  );
  const context = await browser.newContext({
    viewport: { width: 390, height: 900 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  try {
    await page.goto(
      `${process.env.REFY_STORYBOOK_URL || `http://127.0.0.1:${process.env.REFY_STORYBOOK_PORT || 6006}`}/iframe.html?id=components-organisms-coverflow--controlado&viewMode=story`,
    );
    const region = page.getByRole("region", { name: "Browse content" });
    const first = region.getByRole("button", {
      name: "First reference",
      exact: true,
    });
    await expect(first).toBeVisible();
    const box = (await first.boundingBox())!,
      x = box.x + box.width * 0.7,
      y = box.y + box.height / 2;
    const cdp = await context.newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    for (let i = 1; i <= 8; i++)
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: x - (box.width * 0.85 * i) / 8, y }],
      });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect(
      region.getByRole("button", { name: "Second reference", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByText("Activation: No item activated", { exact: true }),
    ).toBeVisible();
    expect(await page.evaluate(() => scrollY)).toBe(0);
    expect(
      await first.evaluate(
        (el) =>
          getComputedStyle(el.closest('[class*="viewport"]')!).touchAction,
      ),
    ).toBe("pan-y");
  } finally {
    await context.close();
  }
});

test("Coverflow cancels vertical pointer intent without activation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await page.goto(
    "/iframe.html?id=components-organisms-coverflow--controlado&viewMode=story",
  );
  const region = page.getByRole("region", { name: "Browse content" });
  const item = region.getByRole("button", {
    name: "First reference",
    exact: true,
  });
  await expect(item).toBeVisible();
  const box = (await item.boundingBox())!,
    x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + 20, { steps: 4 });
  await page.mouse.up();
  await expect(
    page.getByText("Activation: No item activated", { exact: true }),
  ).toBeVisible();
  await expect(item).toHaveAttribute("aria-pressed", "true");
  await item.click();
  await expect(
    page.getByText("Activation: First reference", { exact: true }),
  ).toBeVisible();
});

test("Coverflow keyboard activation is not swallowed after cancelled horizontal pointer stream", async ({
  page,
}) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await page.goto(
    "/iframe.html?id=components-organisms-coverflow--controlado&viewMode=story",
  );
  const region = page.getByRole("region", { name: "Browse content" });
  const item = region.getByRole("button", {
    name: "First reference",
    exact: true,
  });
  await expect(item).toBeVisible();
  const box = (await item.boundingBox())!,
    x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 40, y, { steps: 4 });
  await expect(region.locator("[data-dragging=true]")).toBeVisible();
  await item.dispatchEvent("pointercancel", { pointerId: 1, bubbles: true });
  await item.focus();
  await item.press("Enter");
  await expect(
    page.getByText("Activation: First reference", { exact: true }),
  ).toBeVisible();
  await page.mouse.up();
});
