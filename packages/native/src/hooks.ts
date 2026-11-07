import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/** Equivale a prefers-reduced-motion; o token --motion-reduced=1 do tema também desliga movimento. */
export function useReducedMotion(forced = false) {
  const [reduced, setReduced] = useState(forced);
  useEffect(() => {
    if (forced) return setReduced(true);
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => alive && setReduced(value));
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => { alive = false; sub.remove(); };
  }, [forced]);
  return reduced;
}

/** Estado controlado ou não, como o input da web: `value` manda quando vem; senão vale o interno. */
export function useControllable<T>(value: T | undefined, initial: T, onChange?: (next: T) => void) {
  const [inner, setInner] = useState(initial);
  const current = value !== undefined ? value : inner;
  const set = (next: T) => { if (value === undefined) setInner(next); onChange?.(next); };
  return [current, set] as const;
}
