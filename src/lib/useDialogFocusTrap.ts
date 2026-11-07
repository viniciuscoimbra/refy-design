"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import { activeDialog, registerDialog } from "./dialogs";

const selector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
function focusable(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(el =>
    el.tabIndex >= 0 && el.getClientRects().length && !el.closest('[inert], [hidden], [aria-hidden="true"]') && getComputedStyle(el).visibility !== "hidden");
}
export function focusFirst(container: HTMLElement) {
  (focusable(container)[0] ?? container).focus({ preventScroll: true });
}

/** Only the active dialog traps focus; nested layers consume Escape first. */
export function useDialogFocusTrap(open: boolean, containerRef: RefObject<HTMLElement | null>, onClose: () => void, modal = true) {
  const close = useRef(onClose);
  const lastTrigger = useRef<HTMLElement | null>(null);
  close.current = onClose;
  useEffect(() => {
    if (open) return;
    function remember(event: Event) {
      const target = (event.target as Element).closest<HTMLElement>(selector);
      if (target && !containerRef.current?.contains(target)) lastTrigger.current = target;
    }
    document.addEventListener("pointerdown", remember, true);
    document.addEventListener("focusin", remember, true);
    return () => { document.removeEventListener("pointerdown", remember, true); document.removeEventListener("focusin", remember, true); };
  }, [open, containerRef]);
  useLayoutEffect(() => {
    if (!open || !containerRef.current) return;
    const container: HTMLElement = containerRef.current;
    const doc = container.ownerDocument;
    const previous = lastTrigger.current ?? doc.activeElement as HTMLElement | null;
    if (!modal) {
      let inside = true;
      const trackFocus = (event: FocusEvent) => { inside = container.contains(event.target as Node); };
      doc.addEventListener('focusin', trackFocus);
      container.focus({ preventScroll: true });
      return () => {
        doc.removeEventListener('focusin', trackFocus);
        if ((container.contains(doc.activeElement) || (inside && doc.activeElement === doc.body)) && previous?.isConnected) previous.focus({ preventScroll: true });
      };
    }
    const unregister = registerDialog(container);
    if (!container.contains(doc.activeElement)) focusFirst(container);
    function onKey(event: KeyboardEvent) {
      if (event.defaultPrevented || activeDialog(doc) !== container) return;
      if (event.key === "Escape") { event.preventDefault(); close.current(); return; }
      if (event.key !== "Tab") return;
      const items = focusable(container), first = items[0], last = items[items.length - 1];
      if (!container.contains(doc.activeElement)) { event.preventDefault(); (event.shiftKey ? last ?? container : first ?? container).focus(); return; }
      if (!items.length) { event.preventDefault(); container.focus(); }
      else if (event.shiftKey && (doc.activeElement === first || doc.activeElement === container)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && doc.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    function onFocus(event: FocusEvent) {
      if (activeDialog(doc) === container && !container.contains(event.target as Node)) (focusable(container)[0] ?? container).focus();
    }
    doc.addEventListener("keydown", onKey);
    doc.addEventListener("focusin", onFocus);
    return () => {
      doc.removeEventListener("keydown", onKey);
      doc.removeEventListener("focusin", onFocus);
      unregister();
      queueMicrotask(() => {
        const remaining = activeDialog(doc);
        if (previous?.isConnected && (!remaining || remaining.contains(previous))) previous.focus({ preventScroll: true });
        else if (remaining) (focusable(remaining)[0] ?? remaining).focus({ preventScroll: true });
      });
    };
  }, [open, containerRef, modal]);
}
