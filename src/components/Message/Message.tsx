import type { ReactNode } from "react";
import { Avatar } from "../Avatar";
import { Bubble } from "../Bubble";
import { cn } from "../../lib/cn";
import styles from "./Message.module.css";
import { useMessages } from "../../lib/locale";
export interface MessageProps {
  author: string;
  initials?: string;
  time?: string;
  side?: "start" | "end";
  children: ReactNode;
}
/** Avatar, autoria e corpo formam uma única linha de conversa. */
export function Message({
  author,
  initials,
  time,
  side = "start",
  children,
}: MessageProps) {
  const m = useMessages("message");
  return (
    <article
      data-refy-message=""
      aria-label={m.from(author)}
      className={cn(styles.message, side === "end" && styles.end)}
    >
      <Avatar
        className={styles.avatar}
        size="sm"
        initials={initials ?? author.slice(0, 2)}
        alt={author}
      />
      <div className={styles.content}>
        <header className={styles.header}>
          <strong>{author}</strong>
          {time && <time>{time}</time>}
        </header>
        <Bubble side={side}>{children}</Bubble>
      </div>
    </article>
  );
}
