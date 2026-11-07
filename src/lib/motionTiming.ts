/** Preferências do mesmo escopo que fornece os tokens, inclusive em portais. */
export function motionTiming(
  node: HTMLElement,
  role: "context" | "orientation",
  exit = false,
) {
  const view = node.ownerDocument.defaultView!;
  const style = view.getComputedStyle(node);
  const raw = style
    .getPropertyValue(`--motion-${role}${exit ? "-exit" : ""}-duration`)
    .trim();
  const reduced =
    view.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !!node.closest('[data-refy-motion="reduce"]') ||
    style.getPropertyValue("--motion-reduced").trim() === "1";
  return {
    duration: reduced
      ? 0
      : (parseFloat(raw) || 0) * (raw.endsWith("ms") ? 1 : 1000),
    easing:
      style
        .getPropertyValue(`--motion-ease-${exit ? "exit" : "enter"}`)
        .trim() || "ease",
  };
}
