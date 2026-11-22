"use client";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import type { AudioPlayerCoreProps } from "../../contracts/media-links";
import { cn } from "../../lib/cn";
import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
import styles from "./AudioPlayer.module.css";

/** Props for the AudioPlayer component. */
export interface AudioPlayerProps extends AudioPlayerCoreProps, Omit<HTMLAttributes<HTMLElement>, "title"> {}

/** 75 → "1:15"; 3725 → "1:02:05". */
export function formatClock(seconds: number) {
  const total = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

/**
 * AudioPlayer: tocar e pausar, linha do tempo que se arrasta ou anda pelas setas, tempo
 * corrido e total, e voltar ou avançar 15 segundos. O arquivo só baixa ao tocar.
 */
export function AudioPlayer({ src, title, description, artwork, duration: durationProp, className, ...rest }: AudioPlayerProps) {
  const m = useComponentMessages("audioPlayer", enMessages.audioPlayer);
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(durationProp ?? 0);
  useEffect(() => { if (durationProp) setDuration(durationProp); }, [durationProp]);
  const toggle = () => {
    const node = audio.current;
    if (!node) return;
    if (node.paused) void node.play().catch(() => setPlaying(false));
    else node.pause();
  };
  const seek = (value: number) => {
    const node = audio.current;
    if (!node) return;
    const next = Math.min(Math.max(0, value), duration || node.duration || 0);
    node.currentTime = next;
    setTime(next);
  };
  const progress = duration ? Math.min(100, (time / duration) * 100) : 0;
  return (
    <figure className={cn(styles.player, className)} {...rest}>
      {artwork && <img className={styles.artwork} src={artwork} alt="" />}
      <div className={styles.main}>
        <figcaption className={styles.head}>
          <span className={styles.title}>{title}</span>
          {description != null && <span className={styles.description}>{description}</span>}
        </figcaption>
        <div className={styles.controls}>
          <button type="button" className={styles.play} onClick={toggle} aria-label={playing ? m.pause(title) : m.play(title)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l11-6.5z" />}
            </svg>
          </button>
          <button type="button" className={styles.skip} onClick={() => seek(time - 15)} aria-label={m.back(15)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 7 6 12l5 5M18 7l-5 5 5 5" /></svg>
          </button>
          <span className={styles.clock}>{formatClock(time)}</span>
          <input
            type="range"
            className={styles.track}
            min={0}
            max={duration || 0}
            step={1}
            value={Math.floor(time)}
            disabled={!duration}
            onChange={(event) => seek(Number(event.target.value))}
            aria-label={m.position}
            aria-valuetext={m.positionText(formatClock(time), formatClock(duration))}
            style={{ "--audio-progress": `${progress}%` } as CSSProperties}
          />
          <span className={styles.clock}>{duration ? formatClock(duration) : "--:--"}</span>
          <button type="button" className={styles.skip} onClick={() => seek(time + 15)} aria-label={m.forward(15)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 7l5 5-5 5M6 7l5 5-5 5" /></svg>
          </button>
        </div>
      </div>
      <audio
        ref={audio}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => Number.isFinite(event.currentTarget.duration) && setDuration(event.currentTarget.duration)}
      />
    </figure>
  );
}
