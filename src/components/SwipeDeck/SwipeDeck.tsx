"use client";
import { useEffect, useLayoutEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent, ReactNode } from "react";
import { Button } from "../Button";
import { EmptyState } from "../EmptyState";
import { PropertyActionGroup } from "../PropertyActionGroup";
import type { PropertyAction } from "../PropertyActionGroup";
import type { DecisionAction } from "../PropertyActionGroup/PropertyActionGroup";
import { PropertyCard } from "../PropertyCard";
import type { PropertyCardProps } from "../PropertyCard";
import { cn } from "../../lib/cn";
import { motionTiming } from "../../lib/motionTiming";
import { useDecisionLabels } from "../PropertyActionGroup/PropertyActionGroup";
import styles from "./SwipeDeck.module.css";

import { useMessages } from "../../lib/locale";
export interface SwipeDeckItem extends PropertyCardProps {
  id: string;
}

export interface SwipeDeckProps {
  items: SwipeDeckItem[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  onAction?: (action: PropertyAction, item: SwipeDeckItem) => void;
  onReset?: () => void;
  gestureEnabled?: boolean;
  motion?: "auto" | "reduced";
  className?: string;
  title?: ReactNode;
  /** "hidden" removes the gesture and keyboard instructions from the screen and keeps them for screen readers. */
  instructions?: "visible" | "hidden";
}

/** Fila Tinder-like: botões são o caminho principal; gesto e teclado são atalhos equivalentes. */
export function SwipeDeck({
  items,
  index,
  defaultIndex = 0,
  onIndexChange,
  onAction,
  onReset,
  gestureEnabled = true,
  motion = "auto",
  className,
  title: titleProp,
  instructions = "visible",
}: SwipeDeckProps) {
  const m = useMessages("swipeDeck");
  const title = titleProp ?? m.title;
  const decisionLabels = useDecisionLabels();
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const [activeAction, setActiveAction] = useState<PropertyAction>();
  const [processing, setProcessing] = useState(false);
  const [offset, setOffset] = useState(0);
  const drag = useRef<{
    x: number;
    y: number;
    dx: number;
    active: boolean;
  } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef(false);
  const hintId = useId();
  const [dragging, setDragging] = useState(false);
  const [lastDecision, setLastDecision] = useState("");
  const currentIndex = index ?? internalIndex;
  const current = items[currentIndex];
  const remaining = Math.max(0, items.length - currentIndex - 1);

  useEffect(() => {
    setOffset(0);
    setActiveAction(undefined);
    setProcessing(false);
    drag.current = null;
    setDragging(false);
    if (restoreFocus.current) {
      cardRef.current?.focus({ preventScroll: true });
      restoreFocus.current = false;
    }
  }, [currentIndex, current?.id]);

  function commit(action: PropertyAction) {
    if (!current || processing) return;
    restoreFocus.current = Boolean(
      cardRef.current?.contains(document.activeElement),
    );
    setActiveAction(action);
    setProcessing(true);
  }

  useLayoutEffect(() => {
    if (!processing || !activeAction || !current) return;
    let cancelled = false;
    const card = cardRef.current;
    let saving: Animation | undefined;
    if (card && activeAction === "save" && motion !== "reduced") {
      const timing = motionTiming(card, "orientation", true);
      const target = card.closest("section")?.querySelector('[data-decision-action="save"]');
      if (target && timing.duration > 0) {
        const from = card.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        saving = card.animate([
          { transform: getComputedStyle(card).transform, opacity: 1 },
          { transform: `translate(${to.x + to.width / 2 - from.x - from.width / 2}px, ${to.y + to.height / 2 - from.y - from.height / 2}px) scale(.08)`, opacity: 0 },
        ], { ...timing, fill: "forwards" });
      }
    }
    const animations =
      cardRef.current
        ?.getAnimations()
        .filter((animation) =>
          Number.isFinite(animation.effect?.getComputedTiming().endTime),
        ) ?? [];
    void Promise.allSettled(
      animations.map((animation) => animation.finished),
    ).then(() => {
      if (cancelled) return;
      setProcessing(false);
      setLastDecision(
        m.decision(activeAction === "reject" ? m.rejected : activeAction === "save" ? m.saved : m.selected, currentIndex + 1, items.length),
      );
      onAction?.(activeAction, current);
      const next = currentIndex + 1;
      if (index === undefined) setInternalIndex(next);
      onIndexChange?.(next);
    });
    return () => {
      cancelled = true;
      saving?.cancel();
    };
  }, [
    processing,
    motion,
    activeAction,
    current,
    currentIndex,
    items.length,
    index,
    onAction,
    onIndexChange,
  ]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (
      !gestureEnabled ||
      processing ||
      event.button !== 0 ||
      !event.isPrimary ||
      (event.target as HTMLElement).closest(
        'button, a, input, textarea, select, [role="button"]',
      )
    )
      return;
    drag.current = { x: event.clientX, y: event.clientY, dx: 0, active: false };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const gesture = drag.current;
    if (!gesture || !gestureEnabled || processing) return;
    gesture.dx = event.clientX - gesture.x;
    if (
      !gesture.active &&
      Math.abs(gesture.dx) > 6 &&
      Math.abs(gesture.dx) > Math.abs(event.clientY - gesture.y)
    ) {
      gesture.active = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    if (gesture.active) setOffset(Math.max(-140, Math.min(140, gesture.dx)));
  }

  function cancelGesture(event: PointerEvent<HTMLDivElement>) {
    drag.current = null;
    setDragging(false);
    setOffset(0);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    const gesture = drag.current;
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (gesture?.active && gesture.dx <= -72) commit("reject");
    else if (gesture?.active && gesture.dx >= 72) commit("visit");
    else setOffset(0);
  }

  function reset() {
    if (index === undefined) setInternalIndex(0);
    setProcessing(false);
    setActiveAction(undefined);
    setLastDecision("");
    onIndexChange?.(0);
    onReset?.();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (
      event.defaultPrevented ||
      (event.target as HTMLElement).closest(
        "button, a, input, textarea, select",
      )
    )
      return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      commit("reject");
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      commit("visit");
    } else if (event.key.toLowerCase() === "v") {
      event.preventDefault();
      commit("visit");
    }
  }

  if (!current) {
    return (
      <div className={cn(styles.end, className)}>
        <EmptyState
          bordered
          title={m.doneTitle}
          message={m.doneMessage}
          action={
            <Button variant="primary" onClick={reset}>
              {m.restart}
            </Button>
          }
        />
      </div>
    );
  }

  const { id: _id, ...cardProps } = current;
  const rotation = offset / 28;
  const previewAction = processing ? activeAction : offset <= -32 ? "reject" : offset >= 32 ? "visit" : undefined;

  return (
    <section
      className={cn(
        styles.root,
        motion === "reduced" && styles.reduced,
        className,
      )}
      aria-label={m.queue}
    >
      <div className={styles.queueMeta}>
        <strong>{title}</strong>
        <span>{m.remaining(remaining)}</span>
      </div>
      <p id={hintId} className={cn(styles.hint, instructions === "hidden" && styles.srOnly)}>
        {m.photosHint}{" "}
        {gestureEnabled
          ? m.gestureHint
          : m.buttonsHint}
      </p>
      <div className={styles.stage}>
        {remaining > 0 && (
          <div
            className={cn(styles.backCard, styles.backTwo)}
            aria-hidden="true"
          />
        )}
        {remaining > 0 && (
          <div
            className={cn(styles.backCard, styles.backOne)}
            aria-hidden="true"
          />
        )}
        <div
          key={`${currentIndex}-${current.id}`}
          ref={cardRef}
          className={cn(
            styles.current,
            dragging && styles.dragging,
            processing && activeAction && styles[`leaving-${activeAction}`],
          )}
          style={{
            transform: `translateX(${offset}px) rotate(${rotation}deg)`,
          }}
          role="region"
          aria-label={m.item(currentIndex + 1, items.length)}
          aria-describedby={hintId}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={cancelGesture}
        >
          <PropertyCard {...cardProps} layout="deck" actions={false} />
          {previewAction && (
            <span className={cn(styles.gestureLabel, styles[`${previewAction}Label`])}>
              {decisionLabels[previewAction]}
            </span>
          )}
        </div>
      </div>
      <PropertyActionGroup
        className={styles.actions}
        state={processing ? "processing" : "idle"}
        activeAction={previewAction}
        onAction={commit}
        statusMessage={
          processing
            ? m.recording
            : lastDecision ||
              (instructions === "hidden" ? "" : m.keyboardHint)
        }
      />
    </section>
  );
}

export type DecisionDeckItem = SwipeDeckItem;
export interface DecisionDeckProps extends Omit<SwipeDeckProps, "onAction"> {
  onAction?: (action: DecisionAction, item: DecisionDeckItem) => void;
}
export function DecisionDeck({ onAction, ...rest }: DecisionDeckProps) {
  return (
    <SwipeDeck
      {...rest}
      onAction={(action, item) =>
        onAction?.(action === "visit" ? "select" : action, item)
      }
    />
  );
}
