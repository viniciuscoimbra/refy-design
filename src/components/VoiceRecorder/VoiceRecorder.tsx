import type { CSSProperties } from "react";
import { cn } from "../../lib/cn";
import { Button } from "../Button";
import { Callout } from "../Callout";
import { IconButton } from "../IconButton";
import { ProgressBar } from "../ProgressBar";
import styles from "./VoiceRecorder.module.css";

import { useMessages } from "../../lib/locale";
export type VoiceRecorderState = "idle" | "listening" | "paused" | "error" | "fallback";

export interface VoiceRecorderProps {
  state?: VoiceRecorderState;
  /** Current duration in seconds. */
  duration?: number;
  /** Input level from 0 to 100. */
  level?: number;
  /** Preview the consumer can edit after finishing. */
  transcript?: string;
  errorMessage?: string;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onFinish?: () => void;
  onRetry?: () => void;
  onUseFallback?: () => void;
  className?: string;
}

const micIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" />
  </svg>
);

function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60).toString().padStart(2, "0")}:${(safe % 60).toString().padStart(2, "0")}`;
}

/**
 * Captura de voz visual e controlada. A integração com Web Speech/MediaRecorder
 * pertence ao app; esta molécula resolve estados, controles e fallback.
 */
export function VoiceRecorder({
  state = "idle",
  duration = 0,
  level = 0,
  errorMessage: errorMessageProp,
  onStart,
  onPause,
  onResume,
  onCancel,
  onFinish,
  onRetry,
  onUseFallback,
  className,
}: VoiceRecorderProps) {
  const m = useMessages("voiceRecorder");
  const errorMessage = errorMessageProp ?? m.error;
  const normalizedLevel = Math.max(0, Math.min(100, level));

  if (state === "error") {
    return (
      <Callout
        className={className}
        tone="danger"
        role="alert"
        icon={micIcon}
        title={m.errorTitle}
        action={
          <div className={styles.errorActions}>
            <Button size="sm" variant="primary" onClick={onRetry}>{m.retry}</Button>
            <Button size="sm" variant="secondary" onClick={onUseFallback}>{m.useDictation}</Button>
          </div>
        }
      >
        {errorMessage}
      </Callout>
    );
  }

  if (state === "fallback") {
    return (
      <Callout
        className={className}
        tone="note"
        icon={micIcon}
        title={m.fallbackTitle}
        action={<Button size="sm" variant="secondary" onClick={onUseFallback}>{m.gotIt}</Button>}
      >
        {m.fallbackHint}
      </Callout>
    );
  }

  if (state === "idle") {
    return (
      <div className={cn(styles.idle, className)}>
        <IconButton aria-label={m.start} variant="solid" size="lg" icon={micIcon} onClick={onStart} />
        <div className={styles.idleCopy}>
          <strong>{m.prefer}</strong>
          <span>{m.preferHint}</span>
        </div>
      </div>
    );
  }

  const listening = state === "listening";
  return (
    <section className={cn(styles.panel, !listening && styles.isPaused, className)} aria-label={m.panel}>
      <div className={styles.header}>
        <span className={styles.mic} aria-hidden="true">{micIcon}</span>
        <div className={styles.statusCopy}>
          <strong>{listening ? m.listening : m.paused}</strong>
          <span>{listening ? m.listeningHint : m.pausedHint}</span>
        </div>
        <time className={styles.time} dateTime={`PT${Math.floor(duration)}S`}>{formatDuration(duration)}</time>
      </div>

      <div className={styles.meter} style={{ "--voice-level": normalizedLevel } as CSSProperties}>
        <div className={styles.wave} aria-hidden="true">
          {[0.55, 0.85, 1, 0.72, 0.42, 0.7, 0.92, 0.6].map((factor, index) => (
            <i key={index} style={{ "--bar-factor": factor } as CSSProperties} />
          ))}
        </div>
        <ProgressBar
          value={listening ? normalizedLevel : 0}
          size="sm"
          aria-label={listening ? m.level(Math.round(normalizedLevel)) : m.micPaused}
        />
      </div>

      <div className={styles.footer}>
        <Button size="sm" variant="ghost" onClick={onCancel}>{m.cancel}</Button>
        <IconButton
          aria-label={listening ? m.pause : m.resume}
          variant="outline"
          icon={listening ? (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m8 5 11 7-11 7z" /></svg>
          )}
          onClick={listening ? onPause : onResume}
        />
        <Button size="sm" variant="primary" onClick={onFinish}>{m.finish}</Button>
      </div>
    </section>
  );
}
