import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { createRequire } from "node:module";
import type { Locator, Page } from "@playwright/test";

/** Static parity holds pixel origin and reduced-motion preference constant. */
export async function settleFamily(page: Page, sample: Locator) {
  await sample.waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts.ready);
  await sample.evaluate(async (root) => {
    const tree = root.closest("[data-refy-scope]") ?? root;
    await Promise.all(
      [...tree.querySelectorAll("img")].map((image) =>
        image.decode().catch(() => {}),
      ),
    );
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    // Wait for real finite effects, retaining their final computed presentation.
    const finite = tree
      .getAnimations({ subtree: true })
      .filter((animation) =>
        Number.isFinite(animation.effect?.getComputedTiming().endTime),
      );
    await Promise.all(
      finite.map((animation) => animation.finished.catch(() => {})),
    );
    // Completion callbacks and inherited styles must reach a rendered frame.
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
}

// Chromium can keep partial raster from earlier focus/hover transitions (CLOSE-05).
// Toggling the background of the sample's container and of every body child (portals)
// repaints the captured surface; DOM, focus and state stay untouched. Not a mask:
// real style differences still fail the exact comparison.
export async function repaintCapture(sample: Locator) {
  await sample.evaluate(
    (root) =>
      new Promise<void>((resolve) => {
        const targets = new Set<HTMLElement>(
          [root.parentElement, ...document.body.children].filter(
            (element): element is HTMLElement => element instanceof HTMLElement,
          ),
        );
        const saved = [...targets].map((element) => ({
          element,
          value: element.style.getPropertyValue("background-color"),
          priority: element.style.getPropertyPriority("background-color"),
        }));
        const frames = (next: () => void) =>
          requestAnimationFrame(() => requestAnimationFrame(next));
        for (const { element } of saved)
          element.style.setProperty("background-color", "rgb(1, 2, 3)", "important");
        frames(() => {
          for (const { element, value, priority } of saved)
            if (value) element.style.setProperty("background-color", value, priority);
            else element.style.removeProperty("background-color");
          frames(resolve);
        });
      }),
  );
}

export async function measureFamily(sample: Locator, includePortals = false) {
  return sample.evaluate((root, includePortals) => {
    const properties = [
      "font-family",
      "font-size",
      "font-weight",
      "line-height",
      "letter-spacing",
      "color",
      "background-color",
      "background-image",
      "width",
      "height",
      "padding",
      "gap",
      "border-width",
      "border-radius",
      "border-color",
      "box-shadow",
      "outline",
      "outline-offset",
      "transform",
      "rotate",
      "scale",
    ];
    const surfaces: { scope: string; root: Element }[] = [
      { scope: "component", root },
    ];
    if (includePortals) {
      const provider = root.closest("[data-refy-scope]");
      for (const portal of provider?.querySelectorAll("[data-refy-portal]") ??
        []) {
        for (const child of portal.children) {
          const css = getComputedStyle(child),
            box = child.getBoundingClientRect();
          if (
            box.width &&
            box.height &&
            css.display !== "none" &&
            css.visibility !== "hidden" &&
            !child.closest('[aria-hidden="true"],[inert]')
          )
            surfaces.push({ scope: `portal-${surfaces.length}`, root: child });
        }
      }
    }
    return surfaces.flatMap((surface) =>
      [surface.root, ...surface.root.querySelectorAll("*")].map((element) => {
        // SVG local geometry avoids subtraction noise from viewport coordinates.
        // Actual painted transforms remain recorded in CSS and exact screenshot pixels.
        const css = getComputedStyle(element);
        const rect =
          element instanceof SVGGraphicsElement
            ? element.getBBox()
            : element.getBoundingClientRect();
        return {
          scope: surface.scope,
          tag: element.tagName,
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          style: Object.fromEntries(
            properties.map((property) => [
              property,
              css.getPropertyValue(property),
            ]),
          ),
        };
      }),
    );
  }, includePortals);
}

export function storeFamilyEvidence(
  output: string,
  png: Buffer,
  value: unknown,
) {
  mkdirSync(output, { recursive: true });
  const imageHash = createHash("sha256").update(png).digest("hex");
  const image = join(output, `${imageHash}.png`);
  if (!existsSync(image)) writeFileSync(image, png);
  const measurements = JSON.stringify({ nodes: value }, null, 2) + "\n";
  const measurementHash = createHash("sha256")
    .update(measurements)
    .digest("hex");
  const path = join(output, `${measurementHash}.json`);
  if (!existsSync(path)) writeFileSync(path, measurements);
  return { screenshot: image, measurements: path, imageSha256: imageHash };
}

/** Compare decoded RGBA pixels, ignoring PNG encoding while retaining zero tolerance. */
export function exactFamilyPixelsEqual(first: Buffer, second: Buffer) {
  const require = createRequire(import.meta.url);
  const { PNG } = require(
    join(
      dirname(require.resolve("playwright-core/package.json")),
      "lib/utilsBundle.js",
    ),
  );
  const a = PNG.sync.read(first),
    b = PNG.sync.read(second);
  return a.width === b.width && a.height === b.height && a.data.equals(b.data);
}
