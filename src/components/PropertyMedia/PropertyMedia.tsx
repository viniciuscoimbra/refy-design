"use client";
import { motionTiming } from "../../lib/motionTiming";
import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import { Button } from "../Button";
import { Callout } from "../Callout";
import { IconButton } from "../IconButton";
import { Skeleton } from "../Skeleton";
import { cn } from "../../lib/cn";
import styles from "./PropertyMedia.module.css";

import { useMessages } from "../../lib/locale";
export interface PropertyMediaItem {
  src: string;
  alt: string;
}

export interface PropertyMediaProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  items: PropertyMediaItem[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  aspectRatio?: CSSProperties["aspectRatio"];
  fit?: "cover" | "contain";
  loading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

const previousIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const nextIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

/** Galeria de mídia responsiva. Navegação e feedback não dependem da proporção da foto. */
export function PropertyMedia({
  items,
  index,
  defaultIndex = 0,
  onIndexChange,
  aspectRatio = "4 / 3",
  fit = "cover",
  loading = false,
  errorMessage,
  onRetry,
  className,
  onKeyDown,
  ...rest
}: PropertyMediaProps) {
  const m = useMessages("propertyMedia");
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const [imageResult, setImageResult] = useState<{
    src?: string;
    status: "ready" | "error";
  }>();
  const imageRef = useRef<HTMLImageElement>(null);
  const previousIndex = useRef(index ?? defaultIndex);
  const request = useRef<{ index: number; direction: number } | undefined>(
    undefined,
  );
  const maxIndex = Math.max(0, items.length - 1);
  const currentIndex = Math.min(Math.max(index ?? internalIndex, 0), maxIndex);
  const current = items[currentIndex];

  // Tie completion to its source; an effect can erase onLoad for cached images.
  const imageState =
    imageResult?.src === current?.src
      ? (imageResult?.status ?? "loading")
      : "loading";

  useLayoutEffect(() => {
    const previous = previousIndex.current;
    const image = imageRef.current;
    if (!image || imageState !== "ready" || previous === currentIndex) return;
    previousIndex.current = currentIndex;
    const timing = motionTiming(image, "context");
    if (!timing.duration) return;
    const animation = image.animate(
      [
        {
          transform: `translateX(${(request.current?.index === currentIndex ? request.current.direction : currentIndex > previous ? 1 : -1) * 100}%)`,
        },
        { transform: "translateX(0)" },
      ],
      timing,
    );
    return () => animation.cancel();
  }, [currentIndex, imageState]);

  function select(next: number) {
    if (items.length === 0) return;
    const normalized = (next + items.length) % items.length;
    request.current = {
      index: normalized,
      direction: next < currentIndex ? -1 : 1,
    };
    if (index === undefined) setInternalIndex(normalized);
    onIndexChange?.(normalized);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || items.length < 2) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      select(currentIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      select(currentIndex + 1);
    }
  }

  const failed =
    Boolean(errorMessage) || imageState === "error" || items.length === 0;
  const busy = loading || (!failed && imageState === "loading");

  return (
    <div
      className={cn(styles.root, styles[fit], className)}
      style={{ aspectRatio }}
      role="region"
      aria-label={m.label}
      aria-roledescription={m.carousel}
      aria-busy={busy || undefined}
      tabIndex={items.length > 1 && !failed ? 0 : undefined}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {current && !failed && (
        <img
          ref={imageRef}
          key={current.src}
          className={styles.image}
          src={current.src}
          alt={current.alt}
          draggable={false}
          onLoad={() => setImageResult({ src: current.src, status: "ready" })}
          onError={() => setImageResult({ src: current.src, status: "error" })}
        />
      )}

      {busy && (
        <div className={styles.loading} aria-label={m.loading}>
          <Skeleton width="100%" height="100%" />
        </div>
      )}

      {failed && (
        <div className={styles.error}>
          <Callout
            tone="danger"
            role="alert"
            title={m.unavailable}
            action={
              onRetry ? (
                <Button size="sm" variant="danger" onClick={onRetry}>
                  {m.retry}
                </Button>
              ) : undefined
            }
          >
            {errorMessage ?? m.error}
          </Callout>
        </div>
      )}

      {items.length > 1 && !failed && (
        <>
          <IconButton
            className={cn(styles.arrow, styles.previous)}
            variant="outline"
            size="lg"
            aria-label={m.prev}
            icon={previousIcon}
            onClick={() => select(currentIndex - 1)}
          />
          <IconButton
            className={cn(styles.arrow, styles.next)}
            variant="outline"
            size="lg"
            aria-label={m.next}
            icon={nextIcon}
            onClick={() => select(currentIndex + 1)}
          />
          <div className={styles.dots} role="group" aria-label={m.choose}>
            {items.map((item, itemIndex) => (
              <button
                key={`${item.src}-${itemIndex}`}
                type="button"
                className={cn(
                  styles.dot,
                  itemIndex === currentIndex && styles.activeDot,
                )}
                aria-label={m.show(itemIndex + 1, items.length)}
                aria-current={itemIndex === currentIndex ? "true" : undefined}
                onClick={() => select(itemIndex)}
              />
            ))}
          </div>
        </>
      )}

      {!failed && items.length > 1 && (
        <span className={styles.counter} aria-live="polite">
          {m.position(currentIndex + 1, items.length)}
        </span>
      )}
    </div>
  );
}

export const MediaGallery = PropertyMedia;
export type MediaGalleryProps = PropertyMediaProps;
