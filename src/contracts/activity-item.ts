// Contrato de props do ActivityItem: o que a web e o nativo implementam igual.
// `href` e `target` do autor são de link HTML e ficam só na web.
import type { ReactNode } from "react";
import type { BadgeTone } from "./badge";

export interface ActivityActorCore {
  name: string;
  initials?: string;
  seed?: string;
  src?: string;
}

/** Props for the ActivityItem feed entry. */
export interface ActivityItemCoreProps {
  title: ReactNode;
  actor?: ActivityActorCore;
  timestamp?: ReactNode;
  description?: ReactNode;
  badge?: { label: ReactNode; tone?: BadgeTone };
  status?: ReactNode;
  metadata?: ReactNode;
  action?: ReactNode;
  density?: "default" | "compact";
}
