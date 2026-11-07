import { test, expect, type Page } from "@playwright/test";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import { repaintCapture, settleFamily } from "./refy-family-measurements";
import { sourceDigest } from "../scripts/refy-site-harness.mjs";

// CLOSE-06: covers the CLOSE-05 blind spot. No neutral repaint after the
// traversal, so a ring left painted after blur stays visible to this check.
test.use({ screenshot: "off", trace: "off", reducedMotion: "reduce" });
const source = process.env.REFY_FAMILY_STORYBOOK_URL ?? "http://127.0.0.1:6006";
const consumer = process.env.REFY_FAMILY_CONSUMER_URL;
const output = process.env.REFY_RESIDUAL_FOCUS_OUTPUT;
// Negative control only: keeps a ring on every control after it was focused.
const injectDefect = process.env.REFY_RESIDUAL_FOCUS_DEFECT === "1";
const families = (
  process.env.REFY_RESIDUAL_FOCUS_FAMILIES ?? "Coverflow:Controlado,Otp,Segmented"
)
  .split(",")
  .map((item) => {
    const [id, example] = item.split(":");
    return { id, example };
  });
const contexts = process.env.REFY_FAMILY_CONTEXTS?.split(",") ?? [
  "consumer",
  "story",
];

type Visit = {
  index: number;
  label: string;
  rect: [number, number, number, number];
  extent: number;
  inset: number;
  pristine: Record<string, string>;
  focused: Record<string, string>;
  focusedPng: Buffer;
};

const ringProperties = [
  "outline-style",
  "outline-width",
  "outline-color",
  "outline-offset",
  "box-shadow",
];

function decode(png: Buffer) {
  const require = createRequire(import.meta.url);
  const { PNG } = require(
    join(
      dirname(require.resolve("playwright-core/package.json")),
      "lib/utilsBundle.js",
    ),
  );
  return PNG.sync.read(png) as { width: number; height: number; data: Buffer };
}

/**
 * Ring band: from the border box (or `inset` px inside it for rings drawn inside,
 * like outline:auto) to the ring extent, excluding every other visited box.
 */
function bandDifference(
  first: Buffer,
  second: Buffer,
  visit: Visit,
  boxes: [number, number, number, number][],
) {
  const a = decode(first),
    b = decode(second);
  const [x, y, width, height] = visit.rect;
  const reach = Math.ceil(visit.extent) + 1;
  const inside = ([bx, by, bw, bh]: number[], px: number, py: number) =>
    px >= Math.floor(bx) &&
    px < Math.ceil(bx + bw) &&
    py >= Math.floor(by) &&
    py < Math.ceil(by + bh);
  let band = 0,
    different = 0;
  for (
    let py = Math.max(0, Math.floor(y) - reach);
    py < Math.min(a.height, Math.ceil(y + height) + reach);
    py++
  )
    for (
      let px = Math.max(0, Math.floor(x) - reach);
      px < Math.min(a.width, Math.ceil(x + width) + reach);
      px++
    ) {
      const own = [
        x + visit.inset,
        y + visit.inset,
        width - 2 * visit.inset,
        height - 2 * visit.inset,
      ];
      if (inside(own, px, py)) continue;
      if (boxes.some((box) => box !== visit.rect && inside(box, px, py))) continue;
      band++;
      const offset = (py * a.width + px) * 4;
      if (!a.data.subarray(offset, offset + 4).equals(b.data.subarray(offset, offset + 4)))
        different++;
    }
  return { band, different };
}

async function ringOf(page: Page) {
  return page.evaluate((properties) => {
    const element = document.activeElement as HTMLElement;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const outline =
      style.outlineStyle === "none"
        ? 0
        : parseFloat(style.outlineWidth) + Math.max(0, parseFloat(style.outlineOffset));
    // Spread plus blur of every box-shadow layer; lengths after the color.
    const shadow = style.boxShadow === "none"
      ? 0
      : Math.max(
          0,
          ...style.boxShadow
            .split(/,(?![^(]*\))/)
            .map((layer) => {
              const lengths = [...layer.matchAll(/(-?[\d.]+)px/g)].map((m) => Math.abs(parseFloat(m[1])));
              return (lengths[2] ?? 0) + (lengths[3] ?? 0) + Math.max(lengths[0] ?? 0, lengths[1] ?? 0);
            }),
        );
    // outline:auto and offset<=0 paint over the border box: check its inner edge too.
    const drawnInside =
      style.boxShadow === "none" &&
      (style.outlineStyle === "auto" || parseFloat(style.outlineOffset) <= 0);
    return {
      rect: [rect.x, rect.y, rect.width, rect.height] as [number, number, number, number],
      extent: Math.max(outline, shadow),
      inset: drawnInside ? 4 : 0,
      label: (element.getAttribute("aria-label") ?? element.textContent ?? element.tagName).trim().slice(0, 40),
      ring: Object.fromEntries(properties.map((name) => [name, style.getPropertyValue(name)])),
    };
  }, ringProperties);
}

for (const family of families)
  for (const mode of ["light"])
    for (const width of [390, 800])
      test(`${family.id}: anel de foco não permanece depois do blur (${mode}/${width})`, async ({
        page,
      }, testInfo) => {
        test.setTimeout(120000);
        const report: unknown[] = [];
        try {
          for (const context of contexts) {
            if (context === "consumer" && !consumer) continue;
            await page.setViewportSize({ width, height: 1100 });
            if (injectDefect)
              await page.addInitScript(() => {
                document.addEventListener("focusin", (event) =>
                  (event.target as HTMLElement).setAttribute?.("data-stale-ring", ""),
                );
                const style = document.createElement("style");
                style.textContent =
                  "[data-stale-ring]{outline:2px solid rgb(6,116,83)!important;outline-offset:3px!important}";
                document.addEventListener("DOMContentLoaded", () => document.head.append(style));
              });
            const url =
              context === "consumer"
                ? `${consumer}/?family=${family.id}&mode=${mode}&theme=refy-site&width=${width}${family.example ? `&example=${encodeURIComponent(family.example)}` : ""}`
                : `${source}/iframe.html?id=verification-refy-theme--family&viewMode=story&globals=theme:refy-site;mode:${mode}&args=family:${family.id};specimenWidth:${width};environment:${context}${family.example ? `;story:${family.example}` : ""}`;
            await page.goto(url);
            const sample = page.locator(`[data-refy-specimen="${family.id}"] [data-demo-ready]`);
            await settleFamily(page, sample);
            // Clean pristine baseline: neutral repaint BEFORE any focus only.
            await repaintCapture(sample);
            const pristine = await page.screenshot();
            const pristineRings = await sample.evaluate(
              (root, properties) =>
                [...root.querySelectorAll<HTMLElement>("*")].map((element) => {
                  const style = getComputedStyle(element);
                  return Object.fromEntries(properties.map((name) => [name, style.getPropertyValue(name)]));
                }),
              ringProperties,
            );
            const visits: Visit[] = [];
            let left = false;
            for (let step = 0; step < 40; step++) {
              await page.keyboard.press("Tab");
              const index = await sample.evaluate((root) =>
                root.contains(document.activeElement)
                  ? [...root.querySelectorAll("*")].indexOf(document.activeElement!)
                  : -1,
              );
              if (index < 0) {
                if (visits.length) {
                  left = true;
                  break;
                }
                continue;
              }
              if (visits.some((visit) => visit.index === index)) break;
              await settleFamily(page, sample);
              const ring = await ringOf(page);
              visits.push({
                index,
                label: ring.label,
                rect: ring.rect,
                extent: ring.extent,
                inset: ring.inset,
                pristine: pristineRings[index],
                focused: ring.ring,
                focusedPng: await page.screenshot(),
              });
            }
            expect(visits.length, `${context}: Tab reached no control`).toBeGreaterThan(0);
            // Leave the last control too (unless Tab already left the example),
            // then capture WITHOUT neutral repaint.
            if (!left) await page.keyboard.press("Tab");
            await settleFamily(page, sample);
            const after = await page.screenshot();
            const current = await sample.evaluate(
              (root, properties) => {
                const active = document.activeElement;
                const rect = active?.getBoundingClientRect();
                return {
                  index: root.contains(active) ? [...root.querySelectorAll("*")].indexOf(active!) : -1,
                  rect: rect ? [rect.x, rect.y, rect.width, rect.height] : null,
                  rings: [...root.querySelectorAll<HTMLElement>("*")].map((element) => {
                    const style = getComputedStyle(element);
                    return Object.fromEntries(properties.map((name) => [name, style.getPropertyValue(name)]));
                  }),
                };
              },
              ringProperties,
            );
            const boxes = visits.map((visit) => visit.rect);
            for (const visit of visits) {
              if (visit.index === current.index) continue;
              const shown = bandDifference(pristine, visit.focusedPng, visit, boxes);
              const residual = bandDifference(pristine, after, visit, boxes);
              report.push({ context, label: visit.label, extent: visit.extent, inset: visit.inset, band: residual.band, focusedDifferent: shown.different, focusedRing: visit.focused, residualDifferent: residual.different });
              if (output && residual.different) {
                mkdirSync(output, { recursive: true });
                const stem = join(output, `${family.id}-${mode}-${width}-${context}-${visit.index}`);
                writeFileSync(`${stem}-pristine.png`, pristine);
                writeFileSync(`${stem}-after.png`, after);
              }
              // Positive control: the focused control carries a ring. It is read from the computed
              // style (outline or box-shadow with width), the same in every browser; the band of
              // pixels stays in the report, because WebKit paints a translucent shadow that the
              // pixel comparison does not always see.
              expect.soft(visit.extent, `${context}/${visit.label}: focused ring has no width`).toBeGreaterThan(0);
              expect.soft(visit.focused, `${context}/${visit.label}: focus did not change the ring`).not.toEqual(visit.pristine);
              expect.soft(current.rings[visit.index], `${context}/${visit.label}: ring styles after blur`).toEqual(visit.pristine);
              expect.soft(residual.different, `${context}/${visit.label}: ring pixels left after blur`).toBe(0);
            }
          }
        } finally {
          if (output) {
            mkdirSync(output, { recursive: true });
            writeFileSync(
              join(output, `${family.id}-${mode}-${width}-${testInfo.project.name}.residual-focus.json`),
              JSON.stringify({ family: family.id, mode, width, sourceSha256: sourceDigest(), negativeControl: injectDefect, report, assertionErrors: testInfo.errors.map((error) => error.message) }, null, 2) + "\n",
            );
          }
        }
      });
