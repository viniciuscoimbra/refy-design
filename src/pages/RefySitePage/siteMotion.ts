// The first fold of the home moves without GSAP: GSAP and ScrollTrigger (about 77 KB gzip) only load
// after the first paint, for the scroll scenes below the fold (homeScenes.ts). This file reproduces
// exactly what GSAP 3 wrote for the approved entrance and reel: the same clock (ticker with lag
// smoothing), the same rounding (4 decimals) and the same transform strings, so each frame is the
// same as before. tests/site-hero-motion.spec.ts compares the inline styles frame by frame.

type Listener = (time: number, delta: number, frame: number) => void;

// Ticker: GSAP's, with Date.now, 500/33 ms lag smoothing and a 240 fps gap. Like GSAP, it wakes as
// soon as the module loads in a browser, renders the running groups from a root listener (GSAP's
// Timeline.updateRoot) and falls asleep on frame 30, then every 120 frames, when nothing runs.
const clock = Date.now;
const gap = 1000 / 240;
let startTime = clock();
let lastUpdate = startTime;
let nextTime = gap;
let tickerTime = 0;
let frame = 0;
let request = 0;
let awake = false;
const listeners: Listener[] = [];
let index = 0;
let nextSleepCheck = 30;
const groups: Listener[] = [];

function tick(manual?: boolean) {
  const elapsed = clock() - lastUpdate;
  if (elapsed > 500 || elapsed < 0) startTime += elapsed - 33;
  lastUpdate += elapsed;
  const time = lastUpdate - startTime;
  const overlap = time - nextTime;
  let dispatch = false;
  let delta = 0;
  if (overlap > 0 || manual) {
    frame += 1;
    delta = time - tickerTime * 1000;
    tickerTime = time / 1000;
    nextTime += overlap + (overlap >= gap ? 0 : gap - overlap);
    dispatch = true;
  }
  if (!manual) request = requestAnimationFrame(() => tick());
  if (dispatch) {
    for (index = 0; index < listeners.length; index += 1) listeners[index](tickerTime, delta, frame);
  }
}

function wake() {
  if (awake || typeof requestAnimationFrame === "undefined") return;
  if (request) cancelAnimationFrame(request);
  awake = true;
  tick();
}

function sleep() {
  cancelAnimationFrame(request);
  request = 0;
  awake = false;
}

/** GSAP's Timeline.updateRoot: renders the running groups, then the sleep check. */
const root: Listener = (time, delta, current) => {
  for (const group of [...groups]) group(time, delta, current);
  if (current >= nextSleepCheck) {
    nextSleepCheck += 120;
    if (!groups.length && listeners.length < 2) sleep();
  }
};
listeners.push(root);

export const ticker = {
  /** Seconds since the ticker started, as of the last frame. */
  time: () => tickerTime,
  add(listener: Listener) {
    ticker.remove(listener);
    listeners.push(listener);
    wake();
  },
  remove(listener: Listener) {
    const at = listeners.indexOf(listener);
    if (at < 0) return;
    listeners.splice(at, 1);
    if (index >= at) index -= 1;
  },
};

if (typeof window !== "undefined") wake();

const round = (value: number) => Math.round(value * 10000) / 10000;
const roundPrecise = (value: number) => Math.round(value * 10000000) / 10000000 || 0;

// GSAP's first look at an element turns off the independent transform properties.
function claim(element: HTMLElement) {
  element.style.translate = "none";
  element.style.rotate = "none";
  element.style.scale = "none";
}
/** Same as GSAP's clearProps of transform (and the independent properties it had set). */
function clearTransform(element: HTMLElement, opacity = false) {
  element.style.removeProperty("transform");
  element.style.removeProperty("translate");
  element.style.removeProperty("rotate");
  element.style.removeProperty("scale");
  if (opacity) element.style.removeProperty("opacity");
  if (!element.getAttribute("style")) element.removeAttribute("style");
}

/** Transform string as GSAP's CSSPlugin builds it, for the properties the site uses. */
function transformString(parts: { xPercent?: number; yPercent?: number; x?: string; y?: string; z?: string; rotationY?: string; scale?: number }, use3D: boolean) {
  const { xPercent = 0, yPercent = 0, x = "0px", y = "0px", z = "0px", rotationY = "0deg", scale = 1 } = parts;
  let transforms = "";
  if (xPercent || yPercent) transforms += `translate(${xPercent}%, ${yPercent}%) `;
  if (use3D || x !== "0px" || y !== "0px" || z !== "0px") transforms += z !== "0px" || use3D ? `translate3d(${x}, ${y}, ${z}) ` : `translate(${x}, ${y}) `;
  if (rotationY !== "0deg") transforms += `rotateY(${rotationY}) `;
  if (scale !== 1) transforms += `scale(${scale}, ${scale}) `;
  return transforms || "translate(0, 0)";
}

export interface FromTween {
  target: HTMLElement;
  /** Seconds from the start of the group. */
  start: number;
  duration: number;
  ease: (progress: number) => number;
  /** Starting offset; it ends at 0. */
  from: { y?: number; yPercent?: number; opacity?: number };
  /** Clears opacity too at the end. */
  clearOpacity?: boolean;
}

/**
 * Plays a group of "from" tweens (like gsap.from inside a timeline), each rendering ratio 0 right
 * away and clearing its inline styles when it ends. Returns the cleanup, which jumps to the end.
 */
export function playFrom(tweens: FromTween[]) {
  if (!tweens.length) return () => undefined;
  // Like GSAP, the group starts at the ticker's time once it is awake.
  wake();
  const begin = ticker.time();
  const live = tweens.map((tween) => ({
    ...tween,
    // Opacity ends at the element's own value, as GSAP reads it.
    opacityEnd: tween.from.opacity === undefined ? 1 : parseFloat(getComputedStyle(tween.target).opacity),
    done: false,
  }));
  const render = (item: (typeof live)[number], ratio: number) => {
    const { target, from } = item;
    if (ratio === 1) {
      item.done = true;
      clearTransform(target, item.clearOpacity);
      return;
    }
    const use3D = ratio !== 0;
    if (from.yPercent !== undefined) {
      const yPercent = round(from.yPercent + -from.yPercent * ratio);
      target.style.transform = transformString({ yPercent }, use3D);
    } else if (from.y !== undefined) {
      const y = round(from.y + -from.y * ratio);
      target.style.transform = transformString({ y: `${y}px` }, use3D);
    }
    if (from.opacity !== undefined) target.style.opacity = String(round(from.opacity + (item.opacityEnd - from.opacity) * ratio));
  };
  for (const item of live) {
    claim(item.target);
    render(item, 0);
  }
  const update: Listener = (time) => {
    const elapsed = roundPrecise(time - begin);
    let pending = 0;
    for (const item of live) {
      if (item.done) continue;
      const local = roundPrecise(elapsed - item.start);
      if (local <= 0) { pending += 1; continue; }
      const progress = local >= item.duration ? 1 : local / item.duration;
      render(item, progress === 1 ? 1 : item.ease(progress));
      if (!item.done) pending += 1;
    }
    if (!pending) groups.splice(groups.indexOf(update), 1);
  };
  groups.push(update);
  return () => {
    const at = groups.indexOf(update);
    if (at >= 0) groups.splice(at, 1);
    for (const item of live) if (!item.done) render(item, 1);
  };
}

/** GSAP's power4.out. */
export const power4Out = (progress: number) => 1 - Math.pow(1 - progress, 5);

/** gsap.set(element, { x, rotateY, scale, z }) for the reel. */
export function setCard(element: HTMLElement, value: { x: number; rotateY: number; scale: number; z: number }) {
  if (element.style.translate !== "none") claim(element);
  element.style.transform = transformString({
    x: `${round(value.x)}px`,
    z: `${round(value.z)}px`,
    rotationY: `${value.rotateY}deg`,
    scale: round(value.scale),
  }, false);
}

export function clearCards(elements: HTMLElement[]) {
  elements.forEach((element) => clearTransform(element));
}
