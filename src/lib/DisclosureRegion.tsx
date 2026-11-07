"use client";
import { inertAttribute } from "./inertAttribute";
import { useLayoutEffect, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { motionTiming } from "./motionTiming";

/** Expansão no fluxo: texto estável, altura natural após concluir. */
export function DisclosureRegion({
  open,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { open: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [present, setPresent] = useState(open);
  const previous = useRef(open);
  const animation = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || previous.current === open) return;
    previous.current = open;
    if (!open && node.contains(node.ownerDocument.activeElement)) {
      node.ownerDocument
        .getElementById(node.getAttribute("aria-labelledby") || "")
        ?.focus();
    }
    const from = node.hidden ? 0 : node.getBoundingClientRect().height;
    animation.current?.cancel();
    node.hidden = false;
    node.style.height = "";
    node.style.overflow = "hidden";
    const to = open ? node.getBoundingClientRect().height : 0;
    const timing = motionTiming(node, "context", !open);
    const finish = () => {
      node.style.height = "";
      node.style.overflow = "";
      node.hidden = !open;
      setPresent(open);
    };
    setPresent(true);
    if (!timing.duration || from === to) {
      animation.current = null;
      finish();
      return;
    }
    // Abrir espaço no fluxo exige altura; não escalar/desvanecer o texto.
    const current = node.animate(
      [{ height: `${from}px` }, { height: `${to}px` }],
      {
        ...timing,
        fill: "both",
      },
    );
    animation.current = current;
    current.onfinish = () => {
      if (animation.current !== current) return;
      animation.current = null;
      current.cancel();
      finish();
    };
  }, [open]);

  useLayoutEffect(() => () => animation.current?.cancel(), []);

  return (
    <div
      {...props}
      ref={ref}
      className={className}
      data-refy-disclosure=""
      hidden={!present}
      inert={inertAttribute(!open)}
      aria-hidden={!open || undefined}
      data-motion-state={open ? "open" : "closing"}
    />
  );
}
