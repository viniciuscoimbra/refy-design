// Scroll scenes of the home: the themes stack and the closing manifesto. They are the only part of
// the site that uses GSAP; SiteHome loads this module after the first paint, so no page pays for
// GSAP before it draws, and pages without these scenes never load it.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "./heroMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Temas: a slide is on top once it reached its sticky place, and the slide under it shrinks as the
 * next one climbs over it. Returns the cleanup.
 */
export function themeScrollScene(box: HTMLElement, slides: HTMLElement[], inner: HTMLElement[], setActive: (index: number) => void) {
  const count = slides.length;
  const reduced = prefersReducedMotion();
  // Read from the real geometry on every scroll.
  const trigger = ScrollTrigger.create({
    trigger: box,
    start: "top bottom",
    end: "bottom top",
    onUpdate: () => {
      const tops = slides.map((slide) => slide.getBoundingClientRect().top);
      // Each slide's sticky `top` comes from the stylesheet (its stacking position).
      const stuck = (index: number) => parseFloat(getComputedStyle(slides[index]).top) || 0;
      let current = 0;
      tops.forEach((value, index) => { if (value <= stuck(index) + 2) current = index; });
      setActive(current);
      if (reduced) return;
      inner.forEach((element, index) => {
        if (index === count - 1) return;
        const travel = window.innerHeight - stuck(index + 1);
        const amount = Math.min(1, Math.max(0, (window.innerHeight - tops[index + 1]) / travel));
        gsap.set(element, { scale: 1 - 0.05 * amount, transformOrigin: "50% 0%" });
      });
    },
  });
  return () => {
    trigger.kill();
    gsap.set(inner, { clearProps: "transform" });
  };
}

/**
 * Closing manifesto: each line rises word by word and leaves upward, the last line keeps its
 * accent, and the refy signature arrives with the call to action. Returns the cleanup.
 */
export function manifestoScene(root: HTMLElement) {
  let trigger: ScrollTrigger | undefined;
  let timeline: gsap.core.Timeline | undefined;
  const build = () => {
    const progress = trigger?.progress ?? 0;
    trigger?.kill();
    timeline?.kill();
    const style = getComputedStyle(root);
    const from = style.getPropertyValue("--ink-3").trim();
    const to = style.getPropertyValue("--primary").trim();
    const lines = [...root.querySelectorAll<HTMLElement>("[data-manifesto-line]")];
    const last = lines[lines.length - 1];
    const lead = last.querySelector<HTMLElement>("[data-manifesto-lead]")!;
    const accent = last.querySelector<HTMLElement>("strong")!;
    const signature = root.querySelector<HTMLElement>("[data-manifesto-signature]")!;
    timeline = gsap.timeline({ paused: true });
    lines.forEach((line, index) => {
      const words = line.querySelectorAll("[data-word]");
      const at = index * 1.4;
      // Words rise from below a mask line and leave upward, never sideways.
      timeline!.fromTo(words, { yPercent: 110, opacity: 0, filter: "blur(6px)" }, { yPercent: 0, opacity: 1, filter: "blur(0px)", stagger: 0.06, duration: 0.7, ease: "power4.out" }, at);
      if (index < lines.length - 1) {
        timeline!.fromTo(line, { color: from }, { color: to, duration: 1.2, ease: "none" }, at);
        timeline!.to(words, { yPercent: -110, opacity: 0, filter: "blur(6px)", stagger: 0.04, duration: 0.5, ease: "power2.in" }, at + 1);
      }
    });
    const end = (lines.length - 1) * 1.4;
    timeline.to(lead.querySelectorAll("[data-word]"), { yPercent: -110, opacity: 0, filter: "blur(6px)", stagger: 0.04, duration: 0.5, ease: "power2.in" }, end + 1.1);
    // The accent only slides to the centre once "Seu design," is gone, and it is gone before the
    // signature rises: one phrase on screen at a time.
    timeline.to(accent, { scale: 1.12, x: () => (innerWidth > 700 ? -lead.offsetWidth / 2 : 0), duration: 0.7, ease: "power3.inOut" }, end + 1.7);
    timeline.to(accent, { yPercent: -110, opacity: 0, filter: "blur(6px)", duration: 0.5, ease: "power2.in" }, end + 2.7);
    timeline.fromTo(signature, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, end + 3.2);
    timeline.fromTo(signature.querySelector("[data-manifesto-logo]"), { scale: 0.9 }, { scale: () => (innerWidth > 700 ? 1.7 : 1.15), duration: 1, ease: "power3.out" }, end + 3.2);
    trigger = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => timeline!.progress(self.progress),
    });
    timeline.progress(progress);
  };
  build();
  // A theme switch changes the colours the timeline was built with.
  const scope = root.closest("[data-refy-brand]");
  const observer = new MutationObserver(build);
  if (scope) observer.observe(scope, { attributes: true, attributeFilter: ["data-refy-brand", "data-theme"] });
  return () => {
    observer.disconnect();
    trigger?.kill();
    timeline?.revert();
  };
}
