import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./DeviceFrame.module.css";

import { useMessages } from "../../lib/locale";
export type DeviceFrameVariant = "browser" | "phone";

/** Props for the DeviceFrame. */
export interface DeviceFrameProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** `browser`: window with an address bar; `phone`: device with a rounded screen. */
  variant?: DeviceFrameVariant;
  /** Live page: rendered by an iframe at the real width and scaled to fit. */
  src?: string;
  /** Accessible iframe title (required with `src`). */
  frameTitle?: string;
  /** Real screen width and height, in px (default 1280×800 in the browser, 390×844 on the phone). */
  viewport?: { width: number; height: number };
  /** Address bar text (`browser`). */
  address?: string;
  /** Caption under the frame. */
  caption?: ReactNode;
  /** Static content in place of the iframe (e.g. a real capture of a native app). */
  children?: ReactNode;
}

const defaults = { browser: { width: 1280, height: 800 }, phone: { width: 390, height: 844 } };

/**
 * DeviceFrame — moldura de navegador ou de celular. Com `src`, mostra a página viva na largura
 * real do aparelho, escalada para o espaço disponível; nada vaza nem quebra na moldura.
 */
export const DeviceFrame = forwardRef<HTMLElement, DeviceFrameProps>(function DeviceFrame(
  { variant = "browser", src, frameTitle, viewport, address, caption, children, className, ...rest },
  ref,
) {
  const m = useMessages("deviceFrame");
  const size = viewport ?? defaults[variant];
  const screen = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const element = screen.current;
    if (!element) return;
    const measure = () => setScale(element.clientWidth / size.width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [size.width]);
  return (
    <figure ref={ref} className={cn(styles.frame, styles[variant], className)} {...rest}>
      {/* Content drawn in place (no src) is not scaled: the frame stops at the real width, so
          what shows inside is what that screen fits. */}
      <div className={styles.body} style={src ? undefined : { maxWidth: `calc(${size.width}px + 2 * var(--device-frame-bezel, 8px))` }}>
        {variant === "browser" && (
          <div className={styles.bar} aria-hidden="true">
            <span /><span /><span />
            {address && <code className={styles.address}>{address}</code>}
          </div>
        )}
        <div
          ref={screen}
          className={cn(styles.screen, !src && styles.content)}
          style={{ aspectRatio: `${size.width} / ${size.height}` }}
          data-viewport={`${size.width}x${size.height}`}
        >
          {src ? (
            <iframe
              className={styles.iframe}
              src={src}
              title={frameTitle ?? address ?? m.page}
              loading="lazy"
              tabIndex={-1}
              width={size.width}
              height={size.height}
              style={{ transform: `scale(${scale})`, visibility: scale ? "visible" : "hidden" }}
              data-refy-device-frame=""
            />
          ) : (
            children
          )}
        </div>
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
});
