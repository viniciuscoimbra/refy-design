"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { motionTiming } from "../../lib/motionTiming";
import { cn } from "../../lib/cn";
import styles from "./Coverflow.module.css";

import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
export interface CoverflowItem {
  /** Identidade estável e única, preservada quando a lista muda de ordem. */
  id: string;
  /** Nome acessível do item. */
  label: string;
}
export interface CoverflowProps<T extends CoverflowItem = CoverflowItem> {
  items: readonly T[];
  /** Non-interactive visual content: do not include links, buttons or fields. */
  renderItem: (
    item: T,
    state: { selected: boolean; index: number },
  ) => ReactNode;
  selectedId?: string;
  defaultSelectedId?: string;
  onSelectionChange?: (id: string) => void;
  /** Activating a selected item is different from just selecting it. */
  onActivate?: (item: T) => void;
  label?: string;
  disabled?: boolean;
  emptyContent?: ReactNode;
  className?: string;
  /**
   * Circular navigation: next on the last item goes to the first, previous on the first goes to the
   * last. Applies to buttons, arrow keys and drag. Home and End still go to the ends.
   * @default false
   */
  loop?: boolean;
  /**
   * Advances on its own every `interval` ms (default 5000, minimum 2000). Pauses on hover, while pressed, on focus
   * inside, with the tab hidden and when `disabled`; never runs with reduced motion. Without `loop`
   * it stops on the last item. A visible button pauses and resumes it.
   * @default false
   */
  autoplay?: boolean | { interval?: number };
}

const AUTOPLAY_INTERVAL = 5000;
const AUTOPLAY_MIN = 2000;
const AUTOPLAY_MAX = 2_147_483_647;

/**
 * Navegação por conteúdo visual, finita por padrão. `loop` e `autoplay` são opcionais; sem eles o
 * comportamento é o de antes. Sem serviço ou assets embutidos.
 */
export function Coverflow<T extends CoverflowItem>({
  items,
  renderItem,
  selectedId,
  defaultSelectedId,
  onSelectionChange,
  onActivate,
  label: labelProp,
  disabled = false,
  emptyContent: emptyContentProp,
  className,
  loop = false,
  autoplay = false,
}: CoverflowProps<T>) {
  const m = useComponentMessages("coverflow", enMessages.coverflow);
  const carousel = useComponentMessages("carousel", enMessages.carousel);
  const label = labelProp ?? m.label;
  const emptyContent = emptyContentProp ?? m.empty;
  const [internalId, setInternalId] = useState(defaultSelectedId);
  const requestedId = selectedId ?? internalId;
  const currentIndex = Math.max(
    0,
    items.findIndex((item) => item.id === requestedId),
  );
  const current = items[currentIndex];
  const root = useRef<HTMLElement>(null),
    track = useRef<HTMLDivElement>(null);
  const controls = useRef(new Map<string, HTMLButtonElement>());
  const gesture = useRef<
    | {
        pointer: number;
        x: number;
        y: number;
        offset: number;
        horizontal: boolean;
        cancelled: boolean;
      }
    | undefined
  >(undefined);
  const suppressClick = useRef(false);
  const [stride, setStride] = useState(0),
    [offset, setOffset] = useState(0),
    [dragging, setDragging] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusedInside, setFocusedInside] = useState(false);
  const [hidden, setHidden] = useState(false);
  // Toque ou clique em curso: o autoplay espera soltar, para o item não mudar sob o dedo.
  const [pressing, setPressing] = useState(false);
  const requested = typeof autoplay === "object" ? autoplay.interval : undefined;
  // O timer do navegador aceita até 2^31 - 1 ms; acima disso ele dispara na hora.
  const interval = Math.min(
    AUTOPLAY_MAX,
    Math.max(
      AUTOPLAY_MIN,
      typeof requested === "number" && Number.isFinite(requested) ? requested : AUTOPLAY_INTERVAL,
    ),
  );
  const autoplayOn = Boolean(autoplay) && !reduced && items.length > 1;
  const atEnd = !loop && currentIndex >= items.length - 1;
  const running =
    autoplayOn &&
    !userPaused &&
    !hovered &&
    !focusedInside &&
    !hidden &&
    !disabled &&
    !atEnd &&
    !dragging &&
    !pressing;
  const trackId = useId();
  const identity = items.map((item) => item.id).join("\u0000");
  // Posição do item em relação ao selecionado. No loop, a volta do círculo mais perto do centro
  // da tela, contando o arrasto: os itens se reciclam enquanto o dedo anda, sem buraco no meio.
  // No empate (número par de itens, sem arrasto) o item fica do lado de onde a navegação veio:
  // à direita no começo e depois de voltar, à esquerda depois de avançar.
  const direction = useRef(0);
  const position = (index: number) => {
    const linear = index - currentIndex;
    if (!loop || items.length < 2) return linear;
    const n = items.length;
    const dragged = stride ? offset / stride : 0;
    const turns = (-dragged - linear) / n;
    const tie = dragged === 0 && Math.abs(turns - Math.floor(turns) - 0.5) < 1e-9;
    return linear + n * (tie && direction.current > 0 ? Math.floor(turns) : Math.round(turns)) || 0;
  };
  // Posição na tela, em passos: ao soltar um arrasto longo, trilha e itens mudam juntos e o
  // item fica onde estava; só quem pula de verdade de um lado ao outro salta.
  const screen = (index: number) => position(index) + (stride ? offset / stride : 0);
  // Item que troca de lado no círculo salta sem animação, para não cruzar a trilha. Quando o
  // passo muda (primeira medição, redimensionamento), todos saltam.
  // Num passo de navegação, os itens andam contra a direção; quem anda a favor (dois itens em
  // loop) também salta, para os cards não se cruzarem.
  const lastPlace = useRef(new Map<string, number>());
  const lastStride = useRef(stride);
  const lastOffset = useRef(offset);
  const wrapping = new Set<string>();
  if (loop)
    items.forEach((item, index) => {
      const before = lastPlace.current.get(item.id);
      const moved = before === undefined ? 0 : screen(index) - before;
      const against = offset === 0 && lastOffset.current === 0 && direction.current !== 0 && Math.sign(moved) === direction.current;
      if (lastStride.current !== stride || Math.abs(moved) > 1 || against) wrapping.add(item.id);
    });
  useLayoutEffect(() => {
    lastStride.current = stride;
    lastOffset.current = offset;
    if (!loop) return;
    lastPlace.current = new Map(items.map((item, index) => [item.id, screen(index)]));
  });
  useLayoutEffect(() => {
    const node = track.current;
    if (!node) return;
    const measure = () => {
      const first = node.children[0] as HTMLElement | undefined;
      const second = node.children[1] as HTMLElement | undefined;
      setStride(
        first
          ? second
            ? second.offsetLeft - first.offsetLeft
            : first.offsetWidth
          : 0,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, [identity]);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const view = node.ownerDocument.defaultView!;
    const media = view.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      setReduced(motionTiming(node, "context").duration === 0);
    update();
    media.addEventListener("change", update);
    const observer = new MutationObserver(update);
    for (
      let ancestor: HTMLElement | null = node;
      ancestor;
      ancestor = ancestor.parentElement
    )
      observer.observe(ancestor, {
        attributes: true,
        attributeFilter: ["style", "class", "data-refy-motion", "data-theme"],
      });
    return () => {
      media.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    gesture.current = undefined;
    setOffset(0);
    setDragging(false);
  }, [identity, disabled]);
  useEffect(() => {
    if (!autoplay) return;
    const doc = root.current?.ownerDocument;
    if (!doc) return;
    const update = () => setHidden(doc.visibilityState === "hidden");
    update();
    doc.addEventListener("visibilitychange", update);
    return () => doc.removeEventListener("visibilitychange", update);
  }, [Boolean(autoplay)]);
  // Um timer por item: navegar à mão recomeça a contagem. Render do pai não reinicia o timer;
  // o avanço usa o select mais novo pela ref.
  const advance = useRef(() => {});
  advance.current = () => select(currentIndex + 1);
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => advance.current(), interval);
    return () => window.clearTimeout(timer);
  }, [running, currentIndex, interval, identity]);
  // O blur não chega quando o elemento focado some (item removido, botão de pausa escondido pelo
  // movimento reduzido): confere o foco de verdade depois de cada render.
  useEffect(() => {
    const node = root.current;
    if (focusedInside && node && !node.contains(node.ownerDocument.activeElement))
      setFocusedInside(false);
  });

  function wrap(index: number) {
    const total = items.length;
    return loop
      ? ((index % total) + total) % total
      : Math.max(0, Math.min(total - 1, index));
  }
  // `toward`: direção na tela. Um card vizinho tocado no loop pode ter índice maior e estar à
  // esquerda (o último ao lado do primeiro); quem chama passa o lado em que ele aparece.
  function select(index: number, focus = false, toward?: number) {
    if (disabled || !items.length) return;
    if (index !== currentIndex) direction.current = toward ?? Math.sign(index - currentIndex);
    const item = items[wrap(index)];
    if (focus) controls.current.get(item.id)?.focus({ preventScroll: true });
    if (item.id !== current?.id) {
      if (selectedId === undefined) setInternalId(item.id);
      onSelectionChange?.(item.id);
    }
  }
  function finish(cancelled: boolean, node: HTMLElement) {
    const active = gesture.current;
    if (!active) return;
    gesture.current = undefined;
    if (node.hasPointerCapture(active.pointer))
      node.releasePointerCapture(active.pointer);
    setDragging(false);
    setOffset(0);
    if (active.horizontal || active.cancelled || cancelled)
      suppressClick.current = true;
    if (active.horizontal) {
      if (!cancelled && !active.cancelled && stride)
        select(currentIndex - Math.round(active.offset / stride));
    }
  }
  const arrow = (left: boolean) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d={left ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
  return (
    <section
      ref={root}
      className={cn(styles.root, className)}
      role="region"
      aria-roledescription="carrossel"
      aria-label={label}
      data-reduced-motion={reduced || undefined}
      data-loop={loop || undefined}
      data-autoplay={autoplayOn ? (running ? "running" : "paused") : undefined}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "touch") setHovered(false);
      }}
      onPointerDownCapture={(event) => {
        // Qualquer toque no carrossel, inclusive nos botões, segura o autoplay até soltar:
        // assim um toque longo em Próximo não corre contra o timer e pula dois itens.
        if (!autoplayOn || !event.isPrimary) return;
        // Solta em qualquer lugar da página, mesmo fora do carrossel.
        const doc = event.currentTarget.ownerDocument;
        const pointer = event.pointerId;
        // Só o dedo que começou solta: um segundo toque não retoma o autoplay.
        const release = (up: PointerEvent) => {
          if (up.pointerId !== pointer) return;
          setPressing(false);
          doc.removeEventListener("pointerup", release, true);
          doc.removeEventListener("pointercancel", release, true);
        };
        setPressing(true);
        doc.addEventListener("pointerup", release, true);
        doc.addEventListener("pointercancel", release, true);
      }}
      onFocus={() => setFocusedInside(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setFocusedInside(false);
      }}
    >
      {current ? (
        <>
          <div
            className={styles.viewport}
            data-dragging={dragging || undefined}
            onPointerDown={(event) => {
              suppressClick.current = false;
              if (
                disabled ||
                !event.isPrimary ||
                event.button !== 0 ||
                gesture.current
              )
                return;
              gesture.current = {
                pointer: event.pointerId,
                x: event.clientX,
                y: event.clientY,
                offset: 0,
                horizontal: false,
                cancelled: false,
              };
            }}
            onPointerMove={(event) => {
              const active = gesture.current;
              if (
                !active ||
                active.pointer !== event.pointerId ||
                active.cancelled
              )
                return;
              // Mouse ou caneta sem botão apertado: soltou fora da janela e o pointerup não chegou
              // (o Firefox manda só o movimento, com clientX 0). O gesto acaba onde foi visto por último.
              if (event.pointerType !== "touch" && event.buttons === 0) {
                finish(false, event.currentTarget);
                return;
              }
              const x = event.clientX - active.x,
                y = event.clientY - active.y;
              if (!active.horizontal) {
                if (Math.max(Math.abs(x), Math.abs(y)) < 8) return;
                if (Math.abs(y) >= Math.abs(x)) {
                  active.cancelled = true;
                  return;
                }
                active.horizontal = true;
                event.currentTarget.setPointerCapture(event.pointerId);
                setDragging(true);
              }
              // Circular: o arrasto passa do limite e cai do outro lado ao soltar.
              // A seleção ao soltar usa o mesmo deslocamento que aparece na tela.
              const shown = loop
                ? Math.max(-stride * (items.length - 1), Math.min(stride * (items.length - 1), x))
                : Math.max(
                    -(items.length - 1 - currentIndex) * stride,
                    Math.min(currentIndex * stride, x),
                  );
              active.offset = shown;
              setOffset(shown);
            }}
            onPointerUp={(event) => {
              if (gesture.current?.pointer === event.pointerId)
                finish(false, event.currentTarget);
            }}
            onPointerCancel={(event) => {
              if (gesture.current?.pointer === event.pointerId)
                finish(true, event.currentTarget);
            }}
            onLostPointerCapture={(event) => {
              // Touch starts with implicit capture on the child Button. Its loss
              // during transfer is not cancellation of the viewport gesture.
              if (
                event.target === event.currentTarget &&
                gesture.current?.pointer === event.pointerId
              )
                finish(true, event.currentTarget);
            }}
            onClickCapture={(event) => {
              if (suppressClick.current && event.detail > 0) {
                event.preventDefault();
                event.stopPropagation();
                suppressClick.current = false;
              }
            }}
          >
            <div
              id={trackId}
              ref={track}
              className={styles.track}
              style={{
                // Circular: a trilha só segue o arrasto; cada item vai para a posição circular dele.
                transform: `translateX(${(loop ? 0 : -currentIndex * stride) + offset}px)`,
              }}
            >
              {items.map((item, index) => {
                const place = position(index);
                return (
                <div
                  key={item.id}
                  className={styles.item}
                  data-wrapping={wrapping.has(item.id) || undefined}
                  style={
                    {
                      "--coverflow-distance": Math.min(2, Math.abs(place)),
                      "--coverflow-side": Math.sign(place),
                      ...(loop ? { "--coverflow-shift": `${(place - index) * stride}px` } : {}),
                    } as CSSProperties
                  }
                >
                  <Button
                    ref={(node) => {
                      if (node) controls.current.set(item.id, node);
                      else controls.current.delete(item.id);
                    }}
                    type="button"
                    variant="secondary"
                    className={styles.surface}
                    disabled={disabled}
                    aria-label={item.label}
                    aria-pressed={index === currentIndex}
                    tabIndex={index === currentIndex ? 0 : -1}
                    onDragStart={(event) => event.preventDefault()}
                    onKeyDown={(event) => {
                      const next =
                        event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? items.length - 1
                            : event.key === "ArrowLeft"
                              ? currentIndex - 1
                              : event.key === "ArrowRight"
                                ? currentIndex + 1
                                : undefined;
                      if (next !== undefined) {
                        event.preventDefault();
                        select(next, true);
                      }
                      if (event.key === "Escape" && gesture.current) {
                        event.preventDefault();
                        finish(true, track.current!.parentElement!);
                      }
                    }}
                    onClick={() => {
                      if (index !== currentIndex) select(index, false, Math.sign(position(index)));
                      else onActivate?.(item);
                    }}
                  >
                    {renderItem(item, {
                      selected: index === currentIndex,
                      index,
                    })}
                  </Button>
                </div>
                );
              })}
            </div>
          </div>
          <div className={styles.controls}>
            <IconButton
              type="button"
              aria-controls={trackId}
              aria-label={carousel.previous}
              icon={arrow(true)}
              disabled={disabled || items.length < 2 || (!loop && currentIndex === 0)}
              onClick={() => select(currentIndex - 1)}
            />
            <span role="status" aria-live={running ? "off" : "polite"} aria-atomic="true">
              {carousel.position(currentIndex + 1, items.length)} · {current.label}
            </span>
            <IconButton
              type="button"
              aria-controls={trackId}
              aria-label={carousel.next}
              icon={arrow(false)}
              disabled={disabled || items.length < 2 || (!loop && currentIndex === items.length - 1)}
              onClick={() => select(currentIndex + 1)}
            />
            {autoplayOn && (
              <IconButton
                type="button"
                aria-label={m.pause}
                aria-pressed={userPaused}
                icon={
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    {userPaused ? (
                      <path d="M8 5.5v13l10.5-6.5z" />
                    ) : (
                      <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
                    )}
                  </svg>
                }
                disabled={disabled}
                onClick={() => setUserPaused((paused) => !paused)}
              />
            )}
          </div>
        </>
      ) : (
        <div className={styles.empty} role="status">
          {emptyContent}
        </div>
      )}
    </section>
  );
}
