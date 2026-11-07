import { test, expect } from "@playwright/test";
import { componentCatalog } from "../src/pages/PlaygroundPage/catalog";
import { componentUrl, storyRoot } from "./support/component";
test.use({ screenshot: "off", trace: "off" });
const url = (component: string, mode: string) => componentUrl(component, mode);

for (const mode of ["light"]) {
  test(`${mode}: carrossel move o trilho nas duas direções sem fade`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(url("Carousel", mode));
    const demo = page.locator(storyRoot);
    const carousel = demo.getByRole("region", {
      name: "Featured content",
    });
    const next = carousel.getByRole("button", { name: "Next item" });
    const trajectory = await next.evaluate(async (button) => {
      const track = document.getElementById(
        button.getAttribute("aria-controls")!,
      )!;
      const initial = track.getAnimations().length;
      (button as HTMLButtonElement).click();
      await new Promise(requestAnimationFrame);
      const animation = track.getAnimations()[0];
      animation.pause();
      animation.currentTime =
        Number(animation.effect!.getTiming().duration) * 0.5;
      const x = new DOMMatrix(getComputedStyle(track).transform).m41;
      const width = track.getBoundingClientRect().width;
      const opacity = getComputedStyle(track).opacity;
      animation.finish();
      return { initial, x, width, opacity };
    });
    expect(trajectory.initial).toBe(0);
    expect(trajectory.x).toBeLessThan(0);
    expect(trajectory.x).toBeGreaterThan(-trajectory.width);
    expect(trajectory.opacity).toBe("1");
    await expect(carousel.getByRole("group", { name: /2 of 3/ })).toBeVisible();
    await expect(carousel.getByRole("group", { name: /1 of 3/ })).toHaveCount(
      0,
    );
    const track = carousel.locator('[class*="track"]');
    await carousel.getByRole("button", { name: "Previous item" }).click();
    await track.evaluate((el) =>
      Promise.allSettled(el.getAnimations().map((a) => a.finished)),
    );
    expect(
      await track.evaluate(
        (el) => new DOMMatrix(getComputedStyle(el).transform).m41,
      ),
    ).toBe(0);
    await expect(carousel.getByRole("group", { name: /1 of 3/ })).toBeVisible();
  });

  test(`${mode}: galeria respeita direção da foto sem fade`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(url("PropertyMedia", mode));
    const gallery = page
      .locator(storyRoot)
      .getByRole("region", { name: "Media gallery" });
    for (const [label, sign] of [
      ["Next photo", 1],
      ["Previous photo", -1],
    ] as const) {
      const result = await gallery
        .getByRole("button", { name: label })
        .evaluate(async (button) => {
          const root = button.closest('[aria-roledescription="carousel"]')!;
          (button as HTMLButtonElement).click();
          await new Promise(requestAnimationFrame);
          const image = root.querySelector("img")!;
          if (!image.complete)
            await new Promise((resolve) =>
              image.addEventListener("load", resolve, { once: true }),
            );
          // A animação começa quando a foto nova termina de carregar, alguns quadros depois.
          for (let i = 0; i < 60 && !image.getAnimations().length; i++)
            await new Promise(requestAnimationFrame);
          const animation = image.getAnimations()[0];
          animation.pause();
          animation.currentTime = 0;
          const x = new DOMMatrix(getComputedStyle(image).transform).m41;
          const opacity = getComputedStyle(image).opacity;
          animation.finish();
          return { x, opacity };
        });
      expect(Math.sign(result.x)).toBe(sign);
      expect(result.opacity).toBe("1");
    }
  });

  test(`${mode}: sidebar reorganiza largura sem apagar os filhos`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(url("Sidebar", mode));
    const demo = page.locator(storyRoot);
    const result = await demo
      .getByRole("button", { name: "Collapse menu" })
      .evaluate(async (button) => {
        const sidebar = button.closest("aside")!;
        const from = sidebar.getBoundingClientRect().width;
        (button as HTMLButtonElement).click();
        await new Promise(requestAnimationFrame);
        const animation = sidebar
          .getAnimations()
          .find((a) => (a as CSSTransition).transitionProperty === "width")!;
        animation.pause();
        animation.currentTime =
          Number(animation.effect!.getTiming().duration) * 0.5;
        const middle = sidebar.getBoundingClientRect().width;
        const fades = [...sidebar.children].map(
          (child) => getComputedStyle(child).animationName,
        );
        animation.finish();
        await new Promise(requestAnimationFrame);
        return {
          from,
          middle,
          to: sidebar.getBoundingClientRect().width,
          fades,
        };
      });
    expect(result.middle).toBeLessThan(result.from);
    expect(result.middle).toBeGreaterThan(result.to);
    expect(result.fades.every((name) => name === "none")).toBe(true);
    await demo.getByRole("button", { name: "Expand menu" }).click();
    await expect(
      demo.getByRole("button", { name: "Collapse menu" }),
    ).toBeVisible();
  });

  test(`${mode}: Command compõe Modal com foco, saída e reabertura`, async ({
    page,
  }) => {
    await page.goto(url("Command", mode));
    const trigger = page
      .locator(storyRoot)
      .getByRole("button", { name: "Open palette" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Command palette" });
    const input = dialog.getByRole("combobox");
    await expect(input).toBeFocused();
    await input.fill("aurora");
    await expect(dialog.getByRole("option")).toHaveCount(1);
    await input.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(input).toBeFocused();
    await expect(input).toHaveValue("");
    await input.press("Tab");
    await expect(input).toBeFocused();
    await input.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test(`${mode}: histórico estável anima apenas a nova mensagem`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(url("MessageScroller", mode));
    const demo = page.locator(storyRoot);
    const log = demo.getByRole("log");
    await expect(log.locator("article")).toHaveCount(8);
    expect(
      await log
        .locator("article")
        .evaluateAll(
          (nodes) => nodes.flatMap((node) => node.getAnimations()).length,
        ),
    ).toBe(0);
    const result = await demo
      .getByRole("button", { name: "New message" })
      .evaluate(async (button) => {
        (button as HTMLButtonElement).click();
        await new Promise(requestAnimationFrame);
        const log = button.parentElement!.querySelector('[role="log"]')!;
        return [...log.querySelectorAll("article")].map((node) => ({
          count: node.getAnimations().length,
          opacity: getComputedStyle(node).opacity,
        }));
      });
    expect(result).toHaveLength(9);
    expect(result.slice(0, -1).every((row) => row.count === 0)).toBe(true);
    expect(result.at(-1)?.count).toBe(1);
    expect(result.every((row) => row.opacity === "1")).toBe(true);
  });

  test(`${mode}: gráficos têm dados imediatos e não acumulam delays`, async ({
    page,
  }) => {
    await page.goto(url("Charts", mode));
    const demo = page.locator(storyRoot);
    await expect(demo.locator("svg[role=img]")).toBeVisible();
    const result = await demo.locator("svg[role=img]").evaluate((el) => ({
      hiddenText: [...el.querySelectorAll("text")]
        .filter((node) => getComputedStyle(node).opacity !== "1")
        .map((node) => node.textContent),
      delays: [...el.querySelectorAll("*")].map((node) =>
        parseFloat(getComputedStyle(node).animationDelay),
      ),
    }));
    expect(result.hiddenText).toEqual([]);
    expect(result.delays.every((delay) => delay === 0)).toBe(true);
  });

  test(`${mode}: toast dispensa com saída curta e devolve foco`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(
      `/iframe.html?id=components-molecules-toast--playground&viewMode=story&globals=theme:refy;mode:${mode}`,
    );
    const trigger = page.getByRole("button", { name: "Success", exact: true });
    await trigger.focus();
    await trigger.press("Enter");
    const toast = page.getByRole("status");
    await expect(toast).toBeVisible();
    await toast.evaluate((el) =>
      Promise.allSettled(el.getAnimations().map((a) => a.finished)),
    );
    const result = await toast
      .getByRole("button", { name: "Close", exact: true })
      .evaluate(async (button) => {
        const toast = button.closest('[role="status"]')!;
        (button as HTMLButtonElement).focus();
        (button as HTMLButtonElement).click();
        await new Promise(requestAnimationFrame);
        const animation = toast.getAnimations()[0];
        animation.pause();
        const result = {
          name: (animation as CSSAnimation).animationName,
          duration: animation.effect!.getTiming().duration,
          inert: (toast as HTMLElement).inert,
        };
        animation.finish();
        return result;
      });
    expect(result.name).toContain("toast-out");
    expect(result.duration).toBeLessThanOrEqual(200);
    expect(result.inert).toBe(true);
    await expect(toast).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  for (const preference of ["system", "theme", "instant"]) {
    test(`${mode}/${preference}: Deck confirma sem espera artificial`, async ({
      page,
    }) => {
      await page.emulateMedia({
        reducedMotion: preference === "system" ? "reduce" : "no-preference",
      });
      await page.goto(
        `/iframe.html?id=components-organisms-swipedeck--gesto&viewMode=story&globals=theme:refy;mode:${mode}`,
      );
      const first = page.getByRole("region", {
        name: "Item 1 of 3",
        exact: true,
      });
      await first.evaluate((node, preference) => {
        const scope = node.closest<HTMLElement>("[data-refy-scope]")!;
        if (preference === "theme")
          scope.setAttribute("data-refy-motion", "reduce");
        if (preference === "instant") {
          scope.style.setProperty("--motion-orientation-duration", "0ms");
          scope.style.setProperty("--motion-orientation-exit-duration", "0ms");
        }
      }, preference);
      await page.getByRole("button", { name: "Save", exact: true }).click();
      await expect(
        page.getByRole("region", { name: "Item 2 of 3", exact: true }),
      ).toBeVisible();
      await expect(page.getByRole("status").last()).toContainText(
        "Event: save",
      );
      await page
        .getByRole("button", { name: "Discard", exact: true })
        .click();
      await expect(
        page.getByRole("region", { name: "Item 3 of 3", exact: true }),
      ).toBeVisible();
    });
  }

  for (const preference of ["normal", "reduce"])
    test(`${mode}/${preference}: todas as famílias renderizam e obedecem redução`, async ({
      page,
    }) => {
      test.setTimeout(90000);
      await page.emulateMedia({
        reducedMotion: preference === "reduce" ? "reduce" : "no-preference",
      });
      await page.goto(
        `/iframe.html?id=verification-component-matrix--matriz&viewMode=story&globals=theme:refy;mode:${mode}`,
      );
      const root = page.getByTestId("playground");
      await root
        .getByRole("radio", {
          name: `All (${componentCatalog.length})`,
          exact: true,
        })
        .click();
      await expect(root.locator("[data-demo-ready]")).toHaveCount(
        componentCatalog.length,
      );
      await expect(root).not.toContainText("Não foi possível abrir");
      const leaks = await root.evaluate((el) =>
        [...el.querySelectorAll("*")]
          .flatMap((node) => node.getAnimations())
          .filter((animation) => {
            const timing = animation.effect!.getComputedTiming();
            return (
              Number.isFinite(timing.endTime) &&
              Number(timing.activeDuration) > 2
            );
          })
          .map((animation) => (animation as CSSAnimation).animationName),
      );
      if (preference === "reduce") expect(leaks).toEqual([]);
    });
}

for (const mode of ["light"]) {
  test(`${mode}: Deck conclui a saída real e segue a direção escolhida`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(
      `/iframe.html?id=components-organisms-swipedeck--gesto&viewMode=story&globals=theme:refy;mode:${mode}`,
    );
    for (const [action, sign, index] of [
      ["Discard", -1, 1],
      ["Select", 1, 2],
    ] as const) {
      const card = page.getByRole("region", {
        name: `Item ${index} of 3`,
        exact: true,
      });
      await card.evaluate((el) =>
        Promise.allSettled(el.getAnimations().map((a) => a.finished)),
      );
      await card.evaluate((el) =>
        el
          .closest<HTMLElement>("[data-refy-scope]")!
          .style.setProperty("--motion-orientation-exit-duration", "87ms"),
      );
      const result = await page
        .getByRole("button", { name: action, exact: true })
        .evaluate(async (button, index) => {
          const card = document.querySelector(
            `[aria-label="Item ${index} of 3"]`,
          )!;
          (button as HTMLButtonElement).click();
          await new Promise(requestAnimationFrame);
          const animation = card.getAnimations()[0];
          animation.pause();
          const duration = Number(animation.effect!.getTiming().duration);
          animation.currentTime = duration * 0.5;
          const x = new DOMMatrix(getComputedStyle(card).transform).m41;
          const opacity = getComputedStyle(card).opacity;
          animation.finish();
          return { duration, x, opacity };
        }, index);
      expect(result.duration).toBe(87);
      expect(Math.sign(result.x)).toBe(sign);
      expect(result.opacity).toBe("1");
      await expect(
        page.getByRole("region", {
          name: `Item ${index + 1} of 3`,
          exact: true,
        }),
      ).toBeVisible();
    }
  });

  test(`${mode}: loading mantém alvo e rótulo nas 18 opções compatíveis`, async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=components-atoms-button--efeitos-de-progresso&viewMode=story&globals=theme:refy;mode:${mode}`,
    );
    const buttons = page.getByRole("button", { name: "Run", exact: true });
    await expect(buttons).toHaveCount(18);
    const before = await buttons.evaluateAll((nodes) =>
      nodes.map((node) => ({
        width: node.getBoundingClientRect().width,
        height: node.getBoundingClientRect().height,
      })),
    );
    await page.getByRole("button", { name: "Run all" }).click();
    const loading = page.getByRole("button", {
      name: "Processing…",
      exact: true,
    });
    await expect(loading).toHaveCount(18);
    const result = await loading.evaluateAll((nodes) =>
      nodes.map((node) => {
        const label = node.querySelector('[class*="label"]')!;
        return {
          width: node.getBoundingClientRect().width,
          height: node.getBoundingClientRect().height,
          transform: getComputedStyle(node).transform,
          opacity: getComputedStyle(label).opacity,
          labelTransform: getComputedStyle(label).transform,
        };
      }),
    );
    result.forEach((row, index) => {
      expect(row.width).toBe(before[index].width);
      expect(row.height).toBe(before[index].height);
      expect(row.transform).toBe("none");
      expect(row.opacity).toBe("1");
      expect(row.labelTransform).toBe("none");
    });
  });

  test(`${mode}: Callout espera a transição real e Instantâneo remove sem timer`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const story = `/iframe.html?id=components-molecules-callout--dispensavel&viewMode=story&globals=theme:refy;mode:${mode}`;
    await page.goto(story);
    const notice = page.getByRole("note");
    const result = await notice
      .getByRole("button", { name: "Dismiss notice" })
      .evaluate(async (button) => {
        const notice = button.closest('[role="note"]')!;
        (button as HTMLButtonElement).click();
        await new Promise(requestAnimationFrame);
        const animations = notice.getAnimations();
        animations.forEach((animation) => animation.pause());
        const duration = Number(animations[0].effect!.getTiming().duration);
        animations.forEach((animation) => animation.finish());
        return { duration, count: animations.length };
      });
    expect(result.count).toBeGreaterThan(0);
    expect(result.duration).toBeLessThanOrEqual(150);
    await expect(notice).toBeHidden();
    await page.goto(story);
    await notice.evaluate((node) =>
      node
        .closest<HTMLElement>("[data-refy-scope]")!
        .style.setProperty("--motion-feedback-duration", "0ms"),
    );
    await notice.getByRole("button", { name: "Dismiss notice" }).click();
    await expect(notice).toBeHidden();
  });

  test(`${mode}: Switch confirma no thumb e Tabs preservam o conteúdo sem fade`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(url("Switch", mode));
    const control = page.locator(storyRoot).getByRole("switch");
    const result = await control.evaluate(async (input) => {
      const thumb = input.parentElement!.querySelector('[class*="thumb"]')!;
      const from = new DOMMatrix(getComputedStyle(thumb).transform).m41;
      (input as HTMLInputElement).click();
      await new Promise(requestAnimationFrame);
      const animation = thumb.getAnimations()[0];
      animation.pause();
      const duration = Number(animation.effect!.getTiming().duration);
      animation.currentTime = duration * 0.5;
      const middle = new DOMMatrix(getComputedStyle(thumb).transform).m41;
      animation.finish();
      await new Promise(requestAnimationFrame);
      return {
        from,
        middle,
        to: new DOMMatrix(getComputedStyle(thumb).transform).m41,
        duration,
      };
    });
    expect(result.middle).toBeGreaterThan(Math.min(result.from, result.to));
    expect(result.middle).toBeLessThan(Math.max(result.from, result.to));
    expect(result.duration).toBeLessThanOrEqual(150);
    await page.goto(url("Tabs", mode));
    const demo = page.locator(storyRoot);
    await demo.getByRole("tab").nth(1).click();
    await expect(demo.getByRole("tab").nth(1)).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      await demo
        .getByRole("tabpanel")
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("none");
  });
}

for (const mode of ["light"])
  for (const preference of ["normal", "reduce"])
    test(`${mode}/${preference}: ação da ajuda abre Modal e devolve foco ao campo de origem`, async ({
      page,
    }) => {
      await page.emulateMedia({
        reducedMotion: preference === "reduce" ? "reduce" : "no-preference",
      });
      await page.goto(url("HelpField", mode));
      const demo = page.locator(storyRoot);
      const trigger = demo.getByRole("button", { name: /Help:/ });
      await trigger.focus();
      await demo
        .getByRole("button", { name: "Learn more", exact: true })
        .click();
      const dialog = page.getByRole("dialog", {
        name: "Capacity allocation",
        exact: true,
      });
      await expect(dialog).toBeVisible();
      await dialog.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
    });
