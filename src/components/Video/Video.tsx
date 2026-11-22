"use client";
import { useMemo, useState } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import type { VideoCoreProps } from "../../contracts/media-links";
import { cn } from "../../lib/cn";
import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
import { parseVideoSource } from "./source";
import styles from "./Video.module.css";

/** Props for the Video component. */
export interface VideoProps extends VideoCoreProps, Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Captions for the video file (WebVTT). Not used for YouTube and Vimeo, which bring their own. */
  captions?: { src: string; srcLang: string; label: string; default?: boolean }[];
}

/**
 * Video: arquivo de vídeo ou link do YouTube ou do Vimeo atrás de uma capa com botão de tocar.
 * O player da plataforma só carrega no clique, sem cookie, e o arquivo só baixa ao tocar.
 */
export function Video({ src, title, poster, aspectRatio = 16 / 9, description, captions, className, style, ...rest }: VideoProps) {
  const m = useComponentMessages("video", enMessages.video);
  const source = useMemo(() => parseVideoSource(src), [src]);
  const [playing, setPlaying] = useState(false);
  const cover = poster ?? (source.kind === "youtube" ? source.poster : undefined);
  const frameStyle = { "--video-ratio": aspectRatio } as CSSProperties;
  let player = null;
  if (playing) {
    player =
      source.kind === "file" ? (
        <video className={styles.media} src={source.url} poster={poster} controls autoPlay playsInline>
          {captions?.map((track) => (
            <track key={track.src} kind="captions" src={track.src} srcLang={track.srcLang} label={track.label} default={track.default} />
          ))}
        </video>
      ) : (
        <iframe
          className={styles.media}
          src={source.embed}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      );
  }
  return (
    <figure className={cn(styles.video, className)} style={style} {...rest}>
      <div className={styles.frame} style={frameStyle}>
        {player ?? (
          <button type="button" className={styles.cover} onClick={() => setPlaying(true)} aria-label={m.play(title)}>
            {cover ? <img className={styles.media} src={cover} alt="" loading="lazy" /> : <span className={styles.blank} />}
            <span className={styles.play} aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" /></svg>
            </span>
            <span className={styles.title} aria-hidden="true">{title}</span>
          </button>
        )}
      </div>
      {description != null && <figcaption className={styles.description}>{description}</figcaption>}
    </figure>
  );
}
