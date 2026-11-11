"use client";
import { motionTiming } from "../../lib/motionTiming";
import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "../Button";
import styles from "./MessageScroller.module.css";
import { ScrollArea } from "../ScrollArea";

import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
export function MessageScroller({
  children,
  label: labelProp,
  maxHeight = 280,
}: {
  children: ReactNode;
  label?: string;
  maxHeight?: number;
}) {
  const m = useComponentMessages("messageScroller", enMessages.messageScroller);
  const label = labelProp ?? m.label;
  const ref = useRef<HTMLDivElement>(null),
    [follow, setFollow] = useState(true);
  const seen = useRef(new WeakSet<Element>());
  const initialized = useRef(false);
  useLayoutEffect(() => {
    const scroller = ref.current;
    if (!scroller) return;
    scroller
      .querySelectorAll<HTMLElement>("[data-refy-message]")
      .forEach((message) => {
        if (initialized.current && !seen.current.has(message)) {
          const timing = motionTiming(message, "context");
          if (timing.duration)
            message.animate(
              [
                { transform: "translateY(6px)" },
                { transform: "translateY(0)" },
              ],
              timing,
            );
        }
        seen.current.add(message);
      });
    initialized.current = true;
  }, [children]);
  useLayoutEffect(() => {
    if (follow && ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [children, follow]);
  return (
    <div className={styles.root}>
      <ScrollArea
        ref={ref}
        className={styles.viewport}
        aria-relevant="additions text"
        aria-atomic="false"
        maxHeight={maxHeight}
        role="log"
        aria-label={label}
        aria-live="polite"
        onScroll={(e) =>
          setFollow(
            e.currentTarget.scrollHeight -
              e.currentTarget.scrollTop -
              e.currentTarget.clientHeight <
              24,
          )
        }
      >
        {children}
      </ScrollArea>
      {!follow && (
        <Button
          onClick={() => {
            const scroller = ref.current;
            if (scroller) {
              scroller.scrollTop = scroller.scrollHeight;
              scroller.focus({ preventScroll: true });
            }
            setFollow(true);
          }}
        >
          {m.latest}
        </Button>
      )}
    </div>
  );
}
