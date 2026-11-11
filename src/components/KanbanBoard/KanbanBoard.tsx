"use client";
import { inertAttribute } from "../../lib/inertAttribute";
import { motionTiming } from "../../lib/motionTiming";
import { useId, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent, ReactNode } from "react";
import { IconButton } from "../IconButton";
import { Menu, type MenuEntry } from "../Menu";
import { Modal } from "../Modal";
import { Badge } from "../Badge";
import { StatusDot } from "../StatusDot";
import { KanbanCard, type KanbanCardItem } from "../KanbanCard";
import { cn } from "../../lib/cn";
import styles from "./KanbanBoard.module.css";
import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
export type { KanbanCardItem } from "../KanbanCard";

export interface KanbanColumnItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  items: KanbanCardItem[];
  /** Inteiro >= 0; prevalece sobre o WIP do quadro. Ausente = usa limite global. */
  wipLimit?: number;
  /** Cor CSS de acento, preferencialmente um token: var(--info). */
  color?: string;
}
export interface KanbanBoardProps {
  columns: KanbanColumnItem[];
  onColumnsChange?: (columns: KanbanColumnItem[]) => void;
  onCardClick?: (card: KanbanCardItem, column: KanbanColumnItem) => void;
  /** Default limit per column; undefined means unlimited. */
  wipLimit?: number;
  /** Source → allowed targets. A missing key allows all; [] blocks leaving. */
  allowedTransitions?: Record<string, readonly string[]>;
  toolbar?: ReactNode;
  /** Filters the display; WIP and moves keep using all cards. */
  filter?: (card: KanbanCardItem, column: KanbanColumnItem) => boolean;
  onAddCard?: (column: KanbanColumnItem) => void;
  columnActions?: (column: KanbanColumnItem) => MenuEntry[];
  ariaLabel?: string;
  className?: string;
  /** "hidden" removes the drag instruction from the screen and keeps it for screen readers. */
  instructions?: "visible" | "hidden";
}
const grip = <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>;
const more = <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>;
const plus = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>;
const interactiveTarget = 'button,a,input,textarea,select,[role="button"],[role="link"],[contenteditable="true"],[data-ds-floating],[role="menuitem"],[role="option"]';
const label = (value: ReactNode, fallback: string) => typeof value === "string" ? value : fallback;

/** Quadro com regras compartilhadas por arraste, toque, teclado e menu. */
export function KanbanBoard({ columns, onColumnsChange, onCardClick, wipLimit, allowedTransitions, toolbar, filter, onAddCard, columnActions, ariaLabel: ariaLabelProp, className, instructions = "visible" }: KanbanBoardProps) {
  const m = useComponentMessages("kanbanBoard", enMessages.kanbanBoard);
  const ariaLabel = ariaLabelProp ?? m.label;
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const ghost = useRef<HTMLDivElement>(null);
  const [local, setLocal] = useState({ source: columns, value: columns });
  if (local.source !== columns) setLocal({ source: columns, value: columns });
  const current = onColumnsChange ? columns : local.value;
  const [opened, setOpened] = useState<string | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [preview, setPreview] = useState<{ item: KanbanCardItem; x: number; y: number; width: number } | null>(null);
  const [keyboard, setKeyboard] = useState<{ id: string; from: string; to: string } | null>(null);
  const drag = useRef<{ id: string; column: string } | null>(null);
  const pointer = useRef<{ id: string; from: string; item: KanbanCardItem; x: number; y: number; lastX: number; lastY: number; dx: number; dy: number; width: number; active: boolean; handle: HTMLElement; pointerId: number; to?: string; before?: string } | null>(null);
  const suppressClick = useRef(false);
  const previous = useRef(new Map<string, DOMRect>());
  const restore = useRef<string | null>(null);
  const limitFor = (column: KanbanColumnItem) => column.wipLimit ?? wipLimit;
  const ids = new Set<string>(), columnIds = new Set<string>();
  for (const column of current) {
    if (!column.id || columnIds.has(column.id)) throw new Error("Stages need unique, non-empty IDs.");
    columnIds.add(column.id);
    for (const item of column.items) { if (!item.id || ids.has(item.id)) throw new Error("Cards need unique, non-empty IDs across the board."); ids.add(item.id); }
    const limit = limitFor(column);
    if (limit !== undefined && (!Number.isInteger(limit) || limit < 0)) throw new RangeError("WIP must be a non-negative integer.");
  }
  function blocked(from: string, to: string) {
    if (from === to) return undefined;
    const destination = current.find(column => column.id === to);
    if (!destination) return m.unavailable;
    if (allowedTransitions?.[from] && !allowedTransitions[from].includes(to)) return m.notAllowed;
    const limit = limitFor(destination);
    if (limit !== undefined && destination.items.length >= limit) return m.wipReached(limit);
    return undefined;
  }
  useLayoutEffect(() => {
    const board = root.current;
    if (!board) return;
    const source = pointer.current ? { id: pointer.current.id, from: pointer.current.from } : keyboard;
    if (source && !current.find(column => column.id === source.from)?.items.some(item => item.id === source.id)) {
      stopDrag(); setAnnouncement(m.staleCancel);
    }
    const timing = motionTiming(board, "orientation");
    const animations: Animation[] = [];
    board.querySelectorAll<HTMLElement>("[data-kanban-card]").forEach(card => {
      const before = previous.current.get(card.dataset.kanbanCard!);
      card.getAnimations().forEach(animation => animation.cancel());
      const after = card.getBoundingClientRect();
      if (before && timing.duration > 0 && (Math.abs(before.x - after.x) > 1 || Math.abs(before.y - after.y) > 1)) animations.push(card.animate([{ transform: `translate(${before.x - after.x}px, ${before.y - after.y}px)` }, { transform: "translate(0, 0)" }], timing));
      if (restore.current === card.dataset.kanbanCard) {
        card.querySelector<HTMLButtonElement>("h3 button")?.focus({ preventScroll: true });
        card.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    });
    previous.current.clear(); restore.current = null;
    return () => animations.forEach(animation => animation.cancel());
  }, [current]);
  useLayoutEffect(() => {
    if (!preview || !ghost.current) return;
    const node = ghost.current;
    node.showPopover?.();
    return () => { if (node.matches(":popover-open")) node.hidePopover(); };
  }, [preview]);
  useEffect(() => {
    if (!dragging) return;
    const element = root.current!.ownerDocument.documentElement;
    const cursor = element.style.cursor;
    element.style.cursor = "grabbing";
    return () => { element.style.cursor = cursor; };
  }, [dragging]);
  useEffect(() => () => {
    const pending = pointer.current;
    if (pending?.handle.hasPointerCapture(pending.pointerId)) pending.handle.releasePointerCapture(pending.pointerId);
  }, []);
  function move(id: string, from: string, to: string, beforeId?: string) {
    const source = current.find(column => column.id === from), destination = current.find(column => column.id === to);
    const item = source?.items.find(card => card.id === id);
    if (!item || !destination || beforeId === id) return;
    const reason = blocked(from, to);
    if (reason) { setAnnouncement(reason); return; }
    previous.current = new Map(Array.from(root.current?.querySelectorAll<HTMLElement>("[data-kanban-card]") ?? []).map(card => [card.dataset.kanbanCard!, card.getBoundingClientRect()]));
    const next = current.map(column => ({ ...column, items: column.items.filter(card => card.id !== id) }));
    const target = next.find(column => column.id === to)!;
    const index = beforeId ? target.items.findIndex(card => card.id === beforeId) : -1;
    target.items.splice(index < 0 ? target.items.length : index, 0, item);
    restore.current = id;
    if (onColumnsChange) onColumnsChange(next); else setLocal({ source: columns, value: next });
    setMenu(null);
    setAnnouncement(m.moved(label(item.title, m.card), label(destination.title, m.chosenStage)));
  }
  function openCard(item: KanbanCardItem, column: KanbanColumnItem) {
    stopDrag();
    if (onCardClick) onCardClick(item, column); else setOpened(item.id);
  }
  function stopDrag() { const pending = pointer.current; pointer.current = null; if (pending?.handle.hasPointerCapture(pending.pointerId)) pending.handle.releasePointerCapture(pending.pointerId); drag.current = null; setDragging(null); setOver(null); setPreview(null); setKeyboard(null); }
  function drop(to: string, beforeId?: string) {
    if (drag.current) move(drag.current.id, drag.current.column, to, beforeId);
    stopDrag();
  }
  function pointerDown(event: PointerEvent<HTMLElement>, item: KanbanCardItem, column: KanbanColumnItem) {
    if (event.button !== 0 || !event.isPrimary) return;
    suppressClick.current = false;
    (event.currentTarget.matches("button") ? event.currentTarget : event.currentTarget.querySelector<HTMLElement>("h3 button"))?.focus({ preventScroll: true });
    const box = event.currentTarget.closest<HTMLElement>("[data-kanban-card]")!.getBoundingClientRect();
    pointer.current = { id: item.id, from: column.id, item, x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, dx: event.clientX - box.x, dy: event.clientY - box.y, width: box.width, active: false, handle: event.currentTarget, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function pointerMove(event: PointerEvent<HTMLElement>) {
    const p = pointer.current;
    if (!p) return;
    if (!p.active && Math.hypot(event.clientX - p.x, event.clientY - p.y) < 6) return;
    if (!p.active) {
      p.active = true; suppressClick.current = true; setMenu(null); setKeyboard(null);
      drag.current = { id: p.id, column: p.from }; setDragging(p.id);
      setPreview({ item: p.item, x: event.clientX - p.dx, y: event.clientY - p.dy, width: p.width });
    }
    ghost.current?.style.setProperty("--kanban-drag-x", `${event.clientX - p.dx}px`);
    ghost.current?.style.setProperty("--kanban-drag-y", `${event.clientY - p.dy}px`);
    p.lastX = event.clientX; p.lastY = event.clientY;
    locateTarget(p);
  }
  function locateTarget(p: NonNullable<typeof pointer.current>) {
    const target = root.current!.ownerDocument.elementFromPoint(p.lastX, p.lastY);
    const lane = target?.closest<HTMLElement>("[data-kanban-column]");
    p.to = lane && root.current?.contains(lane) ? lane.dataset.kanbanColumn : undefined;
    const before = target?.closest<HTMLElement>("[data-kanban-card]");
    p.before = before?.dataset.kanbanCard === p.id ? undefined : before?.dataset.kanbanCard;
    setOver(p.to ?? null);
    if (p.to) setAnnouncement(blocked(p.from, p.to) ?? m.dropTo(label(current.find(c => c.id === p.to)?.title, m.thisStage)));
  }
  useEffect(() => {
    if (!dragging || !pointer.current?.active) return;
    const board = root.current!, view = board.ownerDocument.defaultView!;
    let frame: number;
    let last = view.performance.now();
    const pan = (now: number) => {
      const elapsed = Math.min(32, now - last); last = now;
      const p = pointer.current;
      if (!p?.active) return;
      const box = board.getBoundingClientRect();
      const direction = p.lastX > box.right - 32 ? 1 : p.lastX < box.left + 32 ? -1 : 0;
      const before = board.scrollLeft;
      if (p.lastX >= box.left && p.lastX <= box.right) board.scrollLeft += direction * elapsed * .5;
      if (before !== board.scrollLeft) locateTarget(p);
      frame = view.requestAnimationFrame(pan);
    };
    frame = view.requestAnimationFrame(pan);
    return () => view.cancelAnimationFrame(frame);
  }, [dragging, current, allowedTransitions, wipLimit]);

  function pointerEnd(event: PointerEvent<HTMLElement>, cancelled = false) {
    const p = pointer.current;
    pointer.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!p?.active) return;
    if (!cancelled && p.to) move(p.id, p.from, p.to, p.before);
    else setAnnouncement(m.cancelled);
    stopDrag();
  }
  function pickup(item: KanbanCardItem, column: KanbanColumnItem, detail: number) {
    if (suppressClick.current && detail > 0) { suppressClick.current = false; return; }
    suppressClick.current = false;
    if (keyboard?.id === item.id) { move(keyboard.id, keyboard.from, keyboard.to); stopDrag(); return; }
    setKeyboard({ id: item.id, from: column.id, to: column.id }); setDragging(item.id); setOver(column.id); setMenu(null);
    setAnnouncement(m.picked);
  }
  function keyboardMove(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape" && pointer.current?.active) {
      event.preventDefault();
      const pending = pointer.current; pointer.current = null;
      if (pending.handle.hasPointerCapture(pending.pointerId)) pending.handle.releasePointerCapture(pending.pointerId);
      stopDrag(); setAnnouncement(m.cancelled); return;
    }
    if (!keyboard) return;
    if (event.key === "Escape") { event.preventDefault(); stopDrag(); setAnnouncement(m.cancelled); }
    else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const index = current.findIndex(column => column.id === keyboard.to);
      const target = current[index + (event.key === "ArrowRight" ? 1 : -1)];
      if (target) { setKeyboard({ ...keyboard, to: target.id }); setOver(target.id); setAnnouncement(blocked(keyboard.from, target.id) ?? m.target(label(target.title, m.stage))); }
    }
  }
  const detailColumn = current.find(column => column.items.some(item => item.id === opened));
  const detail = detailColumn?.items.find(item => item.id === opened);
  return <>
    {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
    <p id={`${uid}-instructions`} className={cn(styles.instructions, instructions === "hidden" && styles.srOnly)}>{m.instructions}</p>
    <div ref={root} className={cn(styles.board, dragging && styles.dragActive, className)} aria-label={ariaLabel}>
      {current.map((column, columnIndex) => {
        const limit = limitFor(column), full = limit !== undefined && column.items.length >= limit;
        const reason = dragging && over === column.id && drag.current ? blocked(drag.current.column, column.id) : keyboard && over === column.id ? blocked(keyboard.from, column.id) : undefined;
        const entries = columnActions?.(column) ?? [];
        const visible = column.items.filter(item => filter?.(item, column) ?? true);
        return <section key={column.id} data-kanban-column={column.id} data-drop-allowed={over === column.id ? !reason : undefined} className={cn(styles.column, over === column.id && (reason ? styles.blockedTarget : styles.dropTarget))} aria-labelledby={`${uid}-column-${columnIndex}`} style={{ "--kanban-lane-color": column.color ?? "var(--outline)" } as CSSProperties}
          onDragOver={event => { if (drag.current) { event.preventDefault(); const reason = blocked(drag.current.column, column.id); event.dataTransfer.dropEffect = reason ? "none" : "move"; setOver(column.id); if (reason) setAnnouncement(reason); } }}
          onDrop={event => { event.preventDefault(); drop(column.id); }}>
          <header className={styles.columnHeader}>
            <StatusDot tone="neutral" aria-hidden="true" style={{ "--status-dot-color": "var(--kanban-lane-color)" } as CSSProperties} />
            <div className={styles.columnTitle}><h2 id={`${uid}-column-${columnIndex}`}>{column.title}</h2>{column.description && <p>{column.description}</p>}</div>
            <Badge tone={full ? "warn" : "neutral"} aria-label={m.count(column.items.length, limit)}>{column.items.length}{limit === undefined ? "" : ` / ${limit}`}</Badge>
            {!!entries.length && <Menu open={menu === `lane:${column.id}`} onOpenChange={open => setMenu(open ? `lane:${column.id}` : null)} ariaLabel={m.stageActions} align="end" entries={entries}><IconButton size="sm" aria-label={m.stageActionsOf(label(column.title, column.id))} icon={more} onClick={() => { stopDrag(); setMenu(menu === `lane:${column.id}` ? null : `lane:${column.id}`); }} /></Menu>}
            {onAddCard && <IconButton size="sm" aria-label={m.addCardTo(label(column.title, column.id))} disabled={full} title={full ? m.wipReached(limit ?? 0) : m.addCard} icon={plus} onClick={() => onAddCard(column)} />}
          </header>
          <div className={styles.items}>
            {visible.map(item => <KanbanCard key={item.id} item={item} data-kanban-card={item.id} className={cn(styles.card, dragging === item.id && styles.dragging)} draggable onOpen={() => openCard(item, column)}
              onClick={event => { if (suppressClick.current) { suppressClick.current = false; return; } if (!event.defaultPrevented && !(event.target as Element).closest(interactiveTarget)) { event.currentTarget.querySelector<HTMLButtonElement>("h3 button")?.focus(); openCard(item, column); } }}
              onPointerDown={event => { if (!(event.target as Element).closest(interactiveTarget)) pointerDown(event, item, column); }}
              onPointerMove={event => { if (pointer.current?.handle === event.currentTarget) pointerMove(event); }}
              onPointerUp={event => { if (pointer.current?.handle === event.currentTarget) pointerEnd(event); }}
              onPointerCancel={event => { if (pointer.current?.handle === event.currentTarget) pointerEnd(event, true); }}
              onLostPointerCapture={event => { if (pointer.current?.handle === event.currentTarget && pointer.current.active) pointerEnd(event, true); }}
              onKeyDown={event => { if (event.key === "Escape" && pointer.current?.active) keyboardMove(event); }}
              onDragStart={event => { if (pointer.current) { event.preventDefault(); return; } drag.current = { id: item.id, column: column.id }; event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", item.id); setDragging(item.id); }}
              onDragEnd={stopDrag}
              onDrop={event => { event.preventDefault(); event.stopPropagation(); drop(column.id, item.id); }}
              dragHandle={<IconButton size="sm" className={styles.handle} aria-label={m.drag(label(item.title, item.id))} aria-describedby={`${uid}-instructions`} aria-pressed={keyboard?.id === item.id || undefined} title={m.dragTitle} icon={grip} onDragStart={event => event.preventDefault()} onPointerDown={event => pointerDown(event, item, column)} onPointerMove={pointerMove} onPointerUp={event => pointerEnd(event)} onPointerCancel={event => pointerEnd(event, true)} onLostPointerCapture={event => { if (pointer.current?.active) pointerEnd(event, true); }} onClick={event => pickup(item, column, event.detail)} onKeyDown={keyboardMove} />}
              actions={<Menu open={menu === item.id} onOpenChange={open => setMenu(open ? item.id : null)} ariaLabel={m.cardActions} align="end" entries={[
                { id: "open", label: m.openDetails, onSelect: () => openCard(item, column) },
                { type: "separator" },
                ...current.filter(target => target.id !== column.id).map(target => ({ id: `column:${target.id}`, label: <span className={styles.destination}><span>{m.moveTo} {target.title}</span>{blocked(column.id, target.id) && <small>{blocked(column.id, target.id)}</small>}</span>, disabled: !!blocked(column.id, target.id), onSelect: () => move(item.id, column.id, target.id) })),
                { type: "separator" },
                { id: "reorder:first", label: m.moveFirst, disabled: column.items[0]?.id === item.id, onSelect: () => move(item.id, column.id, column.id, column.items[0]?.id) },
                { id: "reorder:last", label: m.moveLast, disabled: column.items[column.items.length - 1]?.id === item.id, onSelect: () => move(item.id, column.id, column.id) },
              ]}><IconButton size="sm" aria-label={m.actionsOf(label(item.title, item.id))} icon={more} onClick={() => { stopDrag(); setMenu(menu === item.id ? null : item.id); }} /></Menu>} />)}
            {!visible.length && <p className={styles.empty}>{column.items.length ? m.emptyFilter : m.emptyStage}</p>}
          </div>
        </section>;
      })}
      {preview && <div ref={ghost} popover="manual" aria-hidden="true" inert={inertAttribute(true)} className={styles.dragPreview} style={{ width: preview.width, "--kanban-drag-x": `${preview.x}px`, "--kanban-drag-y": `${preview.y}px` } as CSSProperties}><KanbanCard item={preview.item} elevation={3} dragHandle={<IconButton size="sm" aria-label={m.card} icon={grip} />} actions={<IconButton size="sm" aria-label={m.cardActions} icon={more} />} /></div>}
    </div>
    <p role="status" className={styles.announcement}>{announcement}</p>
    <Modal open={!!detail} onClose={() => setOpened(null)} title={detail?.title}>{detail && <div className={styles.detail}><Badge tone="neutral">{detailColumn?.title}</Badge><div>{detail.description || m.noDescription}</div>{detail.meta && <div>{detail.meta}</div>}{detail.footer && <footer>{detail.footer}</footer>}</div>}</Modal>
  </>;
}
