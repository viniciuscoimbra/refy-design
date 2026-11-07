import { expect, type Locator, type Page } from "@playwright/test";

export interface FamilyStateRecipe {
  applicable: boolean | null;
  reason: string;
  gap?: string;
  example?: string;
  target?: string;
  action?: "click" | "hover" | "focus" | "fill" | "contextmenu" | "press";
  controlValue?: string;
  steps?: {
    target: string;
    action?: "click" | "hover" | "focus" | "fill" | "contextmenu" | "press";
    text?: string;
    ifVisible?: boolean;
  }[];
  text?: string;
  selector?: string;
  assertText?: string;
  attribute?: string;
  value?: string;
}

const defaultTarget =
  'button:not([disabled]):not([tabindex="-1"]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex="0"]';

async function semanticTarget(scope: Locator, selector: string) {
  const candidates = scope.locator(selector);
  const visible = candidates.filter({ visible: true });
  return (await visible.count()) ? visible.first() : candidates.first();
}

/** Visually hidden native radio/checkbox inputs are presented by their associated label. */
async function assertPresented(control: Locator, message?: string) {
  await expect(control, message).toBeAttached();
  if (await control.isVisible()) return;
  await expect
    .poll(
      () =>
        control.evaluate((el) => {
          if (
            !(el instanceof HTMLInputElement) ||
            !["radio", "checkbox"].includes(el.type)
          )
            return false;
          return [...(el.labels ?? [])].some((label) => {
            const css = getComputedStyle(label),
              rect = label.getBoundingClientRect();
            return (
              rect.width > 0 &&
              rect.height > 0 &&
              css.display !== "none" &&
              css.visibility !== "hidden" &&
              !label.closest('[inert],[aria-hidden="true"]')
            );
          });
        }),
      {
        message:
          message ?? "Control has no visible presentation or associated label",
      },
    )
    .toBe(true);
}

/** Exercises real public examples and native interactions, never sets component DOM state. */
export async function exerciseFamilyState(
  page: Page,
  sample: Locator,
  state: string,
  recipe: FamilyStateRecipe,
) {
  if (state === "default") return "Rendered the documented public example.";
  const provider = sample.locator("xpath=ancestor::*[@data-refy-scope][1]");
  const target = await semanticTarget(
    recipe.target ? provider : sample,
    recipe.target ?? defaultTarget,
  );
  if (state === "focus") {
    await assertPresented(target);
    // Native Tab navigation preserves focus-visible and exposes keyboard traps.
    let reached = false;
    for (let at = 0; at < 128; at++) {
      await page.keyboard.press("Tab");
      reached = await target.evaluate((el) => document.activeElement === el);
      if (reached) break;
    }
    expect(reached, "Keyboard Tab could not reach the declared target").toBe(
      true,
    );
    await expect(target).toBeFocused();
    return "Native Tab navigation reached the declared public control; focus remains visible during capture.";
  }
  if (state === "active") {
    await expect(target).toBeEnabled();
    await target.scrollIntoViewIfNeeded();
    const box = await target.boundingBox();
    if (!box) throw Error("Active control has no visible box");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    expect(
      await target.evaluate((el) => el.matches(":active")),
      "Native pointer press did not activate declared target",
    ).toBe(true);
    return "Native pointer held down on the declared public control during capture; released afterwards.";
  }
  const activate = async (
    control: Locator,
    action: FamilyStateRecipe["action"],
    text?: string,
  ) => {
    await assertPresented(control);
    if (action === "press") await control.press(text ?? "Enter");
    else if (action === "hover") await control.hover();
    else if (action === "focus") await control.focus();
    else if (action === "fill") await control.fill(text ?? "");
    else if (!(await control.isVisible())) {
      const handle = await control.evaluateHandle(
        (el) => (el as HTMLInputElement).labels?.[0],
      );
      const label = handle.asElement();
      if (!label) throw Error("Hidden native control has no associated label");
      await label.click();
      await handle.dispose();
    } else
      await control.click({
        button: action === "contextmenu" ? "right" : "left",
      });
  };
  for (const step of recipe.steps ?? []) {
    const candidate = provider.locator(step.target);
    if (step.ifVisible && !(await candidate.filter({ visible: true }).count()))
      continue;
    await activate(
      await semanticTarget(provider, step.target),
      step.action,
      step.text,
    );
  }
  if (recipe.target) await activate(target, recipe.action, recipe.text);
  await assertFamilyState(page, sample, state, recipe);
  return `${recipe.target || recipe.steps?.length ? "Activated declared public target, then observed" : "Documented public example visibly renders"} ${state}. ${recipe.reason}`;
}

/** Reassert after animation settlement so ephemeral states cannot be captured as another state. */
export async function assertFamilyState(
  page: Page,
  sample: Locator,
  state: string,
  recipe: FamilyStateRecipe,
) {
  if (state === "default") return;
  const provider = sample.locator("xpath=ancestor::*[@data-refy-scope][1]");
  if (state === "focus" || state === "active") {
    const target = await semanticTarget(
      recipe.target ? provider : sample,
      recipe.target ?? defaultTarget,
    );
    if (state === "focus") await expect(target).toBeFocused();
    else
      expect(await target.evaluate((el) => el.matches(":active"))).toBe(true);
    return;
  }
  const fallback: Record<string, string> = {
    disabled: '[disabled],[aria-disabled="true"]',
    open: '[aria-expanded="true"],[role="dialog"],[role="listbox"],[role="menu"]',
    selected:
      '[aria-selected="true"],[aria-checked="true"],[aria-pressed="true"],input:checked',
    error: '[aria-invalid="true"],[data-status="error"],[role="alert"]',
    loading: '[aria-busy="true"],[role="progressbar"],[data-loading="true"]',
  };
  const selector = recipe.selector ?? fallback[state];
  if (!selector) throw Error(`No observable state selector for ${state}`);
  const candidates =
    recipe.controlValue !== undefined
      ? provider.locator(
          recipe.selector ?? recipe.target ?? "select,input,textarea",
        )
      : !recipe.selector && recipe.assertText
        ? provider.getByText(recipe.assertText, { exact: false })
        : provider.locator(selector);
  const visible = candidates.filter({ visible: true });
  const observed = (await visible.count())
    ? visible.first()
    : candidates.first();
  if (recipe.controlValue !== undefined)
    await expect(observed).toHaveValue(recipe.controlValue);
  await assertPresented(
    observed,
    `${state} was not observed in the documented example`,
  );
  if (state === "disabled" && !recipe.selector)
    expect(
      await observed.evaluate(
        (el) =>
          (el as HTMLButtonElement).disabled ||
          el.getAttribute("aria-disabled") === "true",
      ),
    ).toBe(true);
  if (recipe.assertText)
    await expect(observed).toContainText(recipe.assertText);
  if (recipe.attribute)
    await expect(observed).toHaveAttribute(
      recipe.attribute,
      recipe.value ?? "true",
    );
  if (state === "open") {
    const inherited = await observed.evaluate((el) => {
      const scope = el.closest("[data-refy-scope]");
      if (!scope) return null;
      const actual = getComputedStyle(el);
      const expected = getComputedStyle(scope);
      return ["--bg", "--ink-1", "--font-body"].map((token) => ({
        token,
        actual: actual.getPropertyValue(token),
        expected: expected.getPropertyValue(token),
      }));
    });
    expect(
      inherited,
      "Open surface must belong to the public ThemeProvider scope",
    ).not.toBeNull();
    for (const token of inherited ?? [])
      expect(token.actual, token.token).toBe(token.expected);
    const dialogs = provider
      .locator('[role="dialog"][aria-modal="true"]')
      .filter({ visible: true });
    if (await dialogs.count()) {
      await expect
        .poll(
          () =>
            dialogs
              .last()
              .evaluate((el) => el.contains(document.activeElement)),
          {
            message:
              "An opened modal/dialog must place initial focus inside its surface",
          },
        )
        .toBe(true);
    }
    const role = await observed.getAttribute("role");
    // Informative tooltips/status overlays intentionally pass pointer events through.
    if (role === "tooltip" || role === "status") return;
    await expect
      .poll(() =>
        observed.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return el.contains(
            document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
          );
        }),
      )
      .toBe(true);
  }
}
