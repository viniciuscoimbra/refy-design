"use client";
import { useState } from "react";
import type { CSSProperties, HTMLAttributes, KeyboardEvent } from "react";
import type { GalleryImage, ImageGalleryCoreProps, ImageGalleryLayout } from "../../contracts/media-links";
import { cn } from "../../lib/cn";
import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
import { IconButton } from "../IconButton";
import { Modal } from "../Modal";
import styles from "./ImageGallery.module.css";

export type { GalleryImage, ImageGalleryLayout };

/** Props for the ImageGallery component. */
export interface ImageGalleryProps extends ImageGalleryCoreProps, Omit<HTMLAttributes<HTMLDivElement>, "children"> {}

const Arrow = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

/**
 * ImageGallery: grade de fotos com legenda. Cada miniatura abre a foto grande num diálogo com
 * anterior e próxima (setas do teclado também), contador e legenda. Para uma foto por vez em
 * destaque, use Carousel.
 */
export function ImageGallery({ images, label, columns = 3, aspectRatio = 4 / 3, viewer = true, layout = "grid", className, style, ...rest }: ImageGalleryProps) {
  const m = useComponentMessages("imageGallery", enMessages.imageGallery);
  const [open, setOpen] = useState<number | null>(null);
  const total = images.length;
  const go = (step: number) => setOpen((current) => (current === null ? null : (current + step + total) % total));
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
  };
  const current = open === null ? undefined : images[open];
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(styles.gallery, layout === "featured" && styles.featured, className)}
      style={{ ...style, "--gallery-columns": columns, "--gallery-ratio": aspectRatio } as CSSProperties}
      {...rest}
    >
      {images.map((image, index) => {
        const thumb = <img className={styles.thumb} src={image.src} alt={viewer ? "" : image.alt} loading="lazy" />;
        return (
          <figure className={styles.item} key={`${image.src}${index}`}>
            {viewer ? (
              <button type="button" className={styles.open} aria-label={m.open(image.alt, index + 1, total)} onClick={() => setOpen(index)}>
                {thumb}
              </button>
            ) : (
              <div className={styles.frame}>{thumb}</div>
            )}
            {image.caption != null && <figcaption className={styles.caption}>{image.caption}</figcaption>}
          </figure>
        );
      })}
      {viewer && current && open !== null && (
        <Modal open onClose={() => setOpen(null)} ariaLabel={m.viewer(label)} width={960}>
          <div className={styles.viewer} onKeyDown={onKeyDown}>
            <figure className={styles.stage}>
              <img className={styles.full} src={current.src} alt={current.alt} />
              <figcaption className={styles.viewerCaption}>
                <span className={styles.counter} aria-live="polite">{m.counter(open + 1, total)}</span>
                {current.caption != null && <span>{current.caption}</span>}
              </figcaption>
            </figure>
            {total > 1 && (
              <div className={styles.nav}>
                <IconButton variant="outline" aria-label={m.previous} onClick={() => go(-1)} icon={<Arrow d="M15 18l-6-6 6-6" />} />
                <IconButton variant="outline" aria-label={m.next} onClick={() => go(1)} icon={<Arrow d="M9 18l6-6-6-6" />} />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
