import { currentLocale } from "../RefySitePage/i18n";
import { useEffect, useRef, useState } from "react";
import type { RefyTheme, ThemeMode } from "../../lib/ThemeProvider";
import styles from "./BlocksPreview.module.css";

/** A real document keeps responsive media queries and overlay focus in the same viewport. */
export function BlockViewport({
  id,
  theme,
  mode,
  width,
  expanded,
  revision,
}: {
  id: string;
  theme: RefyTheme;
  mode: ThemeMode;
  width: string;
  expanded: boolean;
  revision: number;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [actualWidth, setActualWidth] = useState(0);
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const measure = () =>
      setActualWidth(Math.round(element.getBoundingClientRect().width));
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, [revision]);
  useEffect(() => {
    const send = () =>
      frame.current?.contentWindow?.postMessage(
        { type: "refy:block-theme", theme, mode },
        window.location.origin,
      );
    const ready = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === frame.current?.contentWindow &&
        event.data?.type === "refy:block-ready"
      )
        send();
    };
    const element = frame.current;
    window.addEventListener("message", ready);
    element?.addEventListener("load", send);
    send();
    return () => {
      window.removeEventListener("message", ready);
      element?.removeEventListener("load", send);
    };
  }, [theme, mode, revision]);
  return (
    <div className={styles.previewStage}>
      <iframe
        key={revision}
        ref={frame}
        title={`Prévia ${id}`}
        className={styles.frame}
        style={{ width, height: expanded ? 920 : 580 }}
        src={`/block-preview.html?refy-block=${id}&lang=${currentLocale()}`}
        loading="eager"
      />
      <div className={styles.viewportLabel} aria-live="polite">
        {actualWidth} px · viewport real · prévia interativa
      </div>
    </div>
  );
}
