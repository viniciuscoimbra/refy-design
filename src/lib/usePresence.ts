"use client";
import { useLayoutEffect, useState } from "react";
import type { RefObject } from "react";

/** Mantém o nó durante a saída CSS real; reabrir cancela a remoção pendente. */
export function usePresence(open: boolean, ref: RefObject<HTMLElement | null>) {
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);
  const present = open || mounted;
  useLayoutEffect(() => {
    if (open || !present) return;
    let current = true;
    const animations =
      ref.current
        ?.getAnimations?.()
        .filter((animation) =>
          Number.isFinite(animation.effect?.getComputedTiming().endTime),
        ) ?? [];
    if (!animations.length) setMounted(false);
    else
      void Promise.allSettled(
        animations.map((animation) => animation.finished),
      ).then(() => {
        if (current) setMounted(false);
      });
    return () => {
      current = false;
    };
  }, [open, present, ref]);
  return present;
}
