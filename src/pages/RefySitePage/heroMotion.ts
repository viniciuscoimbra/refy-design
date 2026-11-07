// Hero choreography for the refy.design site only (site motion). GSAP
// orchestrates the entrance; the View Transition animates theme switches.
import { gsap } from "gsap";

interface HeroMotion {
  duration: number;
  ease: (t: number) => number;
  easeCss: string;
  distance: number;
  stagger: number;
  switchDuration: number;
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ms = (value: string, fallback: number) => {
  const number = parseFloat(value);
  if (Number.isNaN(number)) return fallback;
  return value.trim().endsWith("ms") ? number / 1000 : number;
};

// CSS cubic-bezier() as a GSAP ease, so themes keep one curve for CSS and for the timeline.
function cubicBezier(css: string) {
  const match = css.match(/cubic-bezier\(([^)]+)\)/);
  if (!match) return (t: number) => t;
  const [x1, y1, x2, y2] = match[1].split(",").map(Number);
  const at = (a: number, b: number, t: number) => 3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t ** 2 + t ** 3;
  return (x: number) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i += 1) {
      const mid = (lo + hi) / 2;
      if (at(x1, x2, mid) < x) lo = mid;
      else hi = mid;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
}

// The site's choreography is fixed (rise, 24 px, 70 ms apart); duration and curve come from the
// library's own motion tokens, which each theme already defines.
export function readHeroMotion(element: Element): HeroMotion {
  const style = getComputedStyle(element);
  const token = (name: string) => style.getPropertyValue(name).trim();
  const easeCss = token("--motion-ease-enter") || "cubic-bezier(0.22, 1, 0.36, 1)";
  const duration = ms(token("--motion-page-duration"), 0.6);
  return { duration, ease: cubicBezier(easeCss), easeCss, distance: 24, stagger: 0.07, switchDuration: duration * 1000 };
}

const from = (motion: HeroMotion): gsap.TweenVars => ({ y: motion.distance, opacity: 0 });

/** Plays the first-fold entrance; returns a cleanup that leaves no inline styles behind. */
export function playHeroEntrance(root: HTMLElement, targets: Element[]) {
  if (prefersReducedMotion() || targets.length === 0) return () => undefined;
  const motion = readHeroMotion(root);
  const tween = gsap.from(targets, {
    ...from(motion),
    duration: motion.duration,
    ease: motion.ease,
    stagger: motion.stagger,
    clearProps: "transform,opacity,filter",
  });
  return () => {
    tween.progress(1).kill();
  };
}

/** Loads the faces a theme uses, so a switch never paints the fallback font first. */
export function loadThemeFonts(families: string[], weights = ["400", "500", "600", "700", "800"], timeout = 500) {
  if (typeof document === "undefined" || !document.fonts) return Promise.resolve();
  const loads = families.filter(Boolean).flatMap((family) => weights.map((weight) => document.fonts.load(`${weight} 32px ${family}`).catch(() => [])));
  return Promise.race([Promise.all(loads), new Promise((resolve) => setTimeout(resolve, timeout))]).then(() => undefined);
}

const switchDuration = 520; // ms: readable, one curve; with the ~0.1 s start the switch ends before 0.7 s.
const switchEase = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Switches theme inside a View Transition. Named parts (title, lead, actions, each demo column)
 * slide to their new place while the page colour changes with them; their content does not
 * cross-fade, so two layouts are never visible at once. Reduced motion: instant.
 */
export async function switchWithTransition(apply: () => Promise<void> | void, fonts: string[] = []) {
  await loadThemeFonts(fonts);
  const start = (document as Document & { startViewTransition?: (update: () => Promise<void> | void) => { ready: Promise<void>; finished: Promise<void> } }).startViewTransition;
  if (prefersReducedMotion() || !start) {
    await apply();
    return;
  }
  const transition = start.call(document, apply);
  await transition.ready.catch(() => undefined);
  for (const animation of document.getAnimations()) {
    const effect = animation.effect as KeyframeEffect | null;
    const pseudo = effect?.pseudoElement ?? "";
    if (!pseudo.startsWith("::view-transition")) continue;
    // The actions are the same buttons in both states: they cross-fade while sliding, so a button
    // is never fully invisible, not even while its old image is hidden.
    const named = !pseudo.endsWith("(root)") && !pseudo.endsWith("(hero-actions)");
    if (named && pseudo.startsWith("::view-transition-old")) effect!.setKeyframes([{ opacity: 0 }, { opacity: 0 }]);
    if (named && pseudo.startsWith("::view-transition-new")) effect!.setKeyframes([{ opacity: 1 }, { opacity: 1 }]);
    effect!.updateTiming({ duration: switchDuration, easing: switchEase });
  }
  await transition.finished.catch(() => undefined);
}
