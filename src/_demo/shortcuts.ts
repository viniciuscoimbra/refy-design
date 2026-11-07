import { createContext, useContext, useEffect } from "react";
import type { RefObject } from "react";

export const ExampleScope =
  createContext<RefObject<HTMLDivElement | null> | null>(null);

/** In a gallery, only the focused example owns the shortcut. */
export function useCommandShortcut(onOpen: () => void, enabled = true) {
  const scope = useContext(ExampleScope);
  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        (scope && !scope.current?.contains(event.target as Node))
      )
        return;
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scope, onOpen, enabled]);
}
