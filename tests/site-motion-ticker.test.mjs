// O relógio de src/pages/RefySitePage/siteMotion.ts contra o do GSAP 3, carregados no mesmo relógio
// falso: os dois acordam ao carregar, e a home monta depois (a entrada e o carrossel pegam o tempo
// do ticker nessa hora). Para cada atraso entre carregar e montar, o tempo de início e cada quadro
// entregue aos ouvintes (tempo, delta, número do quadro) têm de ser iguais, inclusive quando o
// GSAP já dormiu (quadro 30 sem nada rodando) e acorda com a correção de atraso.
import { test } from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

/** Relógio e requestAnimationFrame falsos, compartilhados pelos dois tickers. */
function fakeClock(start) {
  let now = start;
  let queue = [];
  let next = 0;
  const realNow = Date.now;
  globalThis.window = globalThis;
  Date.now = () => now;
  globalThis.requestAnimationFrame = (callback) => { next += 1; queue.push([next, callback]); return next; };
  globalThis.cancelAnimationFrame = (handle) => { queue = queue.filter(([id]) => id !== handle); };
  return {
    /** Avança `ms`, com um quadro a cada `step` ms. */
    advance(ms, step = 16) {
      const end = now + ms;
      while (now + step <= end) {
        now += step;
        const run = queue;
        queue = [];
        for (const [, callback] of run) callback(now);
      }
      now = end;
    },
    restore() {
      Date.now = realNow;
      delete globalThis.window;
      delete globalThis.requestAnimationFrame;
      delete globalThis.cancelAnimationFrame;
    },
  };
}

async function run(mountAfter, step) {
  const clock = fakeClock(Date.UTC(2026, 10, 18, 12));
  try {
    // Módulos novos a cada caso: os dois tickers nascem agora, no relógio falso.
    const tag = `?caso=${mountAfter}-${step}`;
    const { gsap } = await import(pathToFileURL(resolve(root, "node_modules/gsap/gsap-core.js")).href + tag);
    const { playFrom, power4Out, ticker } = await import(pathToFileURL(resolve(root, "src/pages/RefySitePage/siteMotion.ts")).href + tag);
    clock.advance(mountAfter, step);
    const seen = { gsap: [], refy: [] };
    // Montagem: o GSAP cria a timeline da entrada; o motor novo lê o tempo para começar.
    const timeline = gsap.timeline();
    timeline.to({ value: 0 }, { value: 1, duration: 1 });
    const element = { style: {}, getAttribute: () => null, removeAttribute: () => undefined };
    element.style.removeProperty = (name) => delete element.style[name];
    playFrom([{ target: element, start: 0, duration: 1, ease: power4Out, from: { y: 24 } }]);
    const begin = { gsap: timeline.startTime(), refy: ticker.time() };
    gsap.ticker.add((time, delta, frame) => seen.gsap.push([time, delta, frame]));
    ticker.add((time, delta, frame) => seen.refy.push([time, delta, frame]));
    clock.advance(3000, step);
    return { begin, seen };
  } finally {
    clock.restore();
  }
}

for (const mountAfter of [0, 30, 300, 700, 2500]) {
  for (const step of [16, 7]) {
    test(`montando ${mountAfter} ms depois de carregar, quadros de ${step} ms: mesmo relógio do GSAP`, async () => {
      const { begin, seen } = await run(mountAfter, step);
      assert.equal(begin.refy, begin.gsap, "tempo de início da entrada");
      assert.ok(seen.gsap.length > 100, "o GSAP entregou quadros");
      assert.deepEqual(seen.refy, seen.gsap);
    });
  }
}
