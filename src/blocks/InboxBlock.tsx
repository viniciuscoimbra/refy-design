"use client";
import { useEffect, useRef, useState } from "react";
import { Avatar, Badge, Button, EmptyState, IconButton, IntentComposer, Item, Message, MessageScroller, Segmented } from "../index";
import { photos } from "./photos";
import styles from "./InboxBlock.module.css";

type Turn = { id: string; mine: boolean; time: string; text: string };
type Thread = { id: string; name: string; initials: string; photo?: string; topic: string; state: "open" | "resolved"; unread: number; turns: Turn[] };

const start: Thread[] = [
  {
    id: "ana", name: "Ana Souza", initials: "AS", photo: photos.personAna, topic: "Visit on Saturday", state: "open", unread: 0,
    turns: [
      { id: "a1", mine: false, time: "09:02", text: "Hi! Is the apartment in Perdizes still available?" },
      { id: "a2", mine: true, time: "09:05", text: "Yes, it is. Would you like to see it this week?" },
      { id: "a3", mine: false, time: "09:20", text: "Saturday morning works for me." },
      { id: "a4", mine: false, time: "09:21", text: "Can I bring my dog along?" },
    ],
  },
  {
    id: "bruno", name: "Bruno Lima", initials: "BL", photo: photos.personBruno, topic: "Contract signature", state: "open", unread: 2,
    turns: [
      { id: "b1", mine: true, time: "Yesterday", text: "The contract is ready. I sent it to your email." },
      { id: "b2", mine: false, time: "08:40", text: "Got it. Do I sign every page or only the last one?" },
      { id: "b3", mine: false, time: "08:41", text: "And who keeps the original copy?" },
    ],
  },
  {
    id: "clara", name: "Clara Reis", initials: "CR", photo: photos.personClara, topic: "Rent adjustment", state: "open", unread: 0,
    turns: [
      { id: "c1", mine: false, time: "Mon", text: "When does the new rent start?" },
      { id: "c2", mine: true, time: "Mon", text: "From the December payment. The letter explains the index used." },
    ],
  },
  {
    id: "diego", name: "Diego Alves", initials: "DA", topic: "Key pickup", state: "resolved", unread: 0,
    turns: [
      { id: "d1", mine: false, time: "Fri", text: "Where do I pick up the keys?" },
      { id: "d2", mine: true, time: "Fri", text: "At the front desk, any time after 10am." },
      { id: "d3", mine: false, time: "Fri", text: "Done, thank you!" },
    ],
  },
];

const backIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export function InboxBlock() {
  const [threads, setThreads] = useState(start);
  const [filter, setFilter] = useState("open");
  const [openId, setOpenId] = useState<string | null>("ana");
  const [view, setView] = useState<"list" | "thread">("list");
  // One draft per conversation: switching or reopening never loses what was typed.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  // On a phone the list and the conversation are two screens; focus follows the screen that shows up.
  const [focusTarget, setFocusTarget] = useState<"thread" | "list" | null>(null);
  const page = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const shown = threads.filter((thread) => thread.state === filter);
  const current = threads.find((thread) => thread.id === openId);
  const unread = threads.reduce((sum, thread) => sum + thread.unread, 0);
  const draft = (openId && drafts[openId]) || "";
  const setDraft = (text: string) => openId && setDrafts((rows) => ({ ...rows, [openId]: text }));
  const stacked = () => typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;

  useEffect(() => {
    if (focusTarget === "thread") title.current?.focus();
    if (focusTarget === "list") {
      // The conversation may have left the list (resolved or reopened under another filter):
      // fall back to the first conversation shown, then to the active filter.
      const root = page.current;
      const target =
        root?.querySelector<HTMLElement>(`[data-thread="${openId}"] button`) ??
        root?.querySelector<HTMLElement>("[data-thread] button") ??
        root?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]');
      target?.focus();
    }
    if (focusTarget) setFocusTarget(null);
  }, [focusTarget, openId]);

  const open = (id: string) => {
    setOpenId(id);
    setView("thread");
    if (stacked()) setFocusTarget("thread");
    setThreads((rows) => rows.map((row) => (row.id === id ? { ...row, unread: 0 } : row)));
  };
  const update = (id: string, change: (thread: Thread) => Thread) => setThreads((rows) => rows.map((row) => (row.id === id ? change(row) : row)));
  const backToList = () => {
    setView("list");
    setFocusTarget("list");
  };
  const send = () => {
    const text = draft.trim();
    if (!text || !current) return;
    update(current.id, (thread) => ({ ...thread, state: "open", turns: [...thread.turns, { id: `m${thread.turns.length + 1}`, mine: true, time: "Now", text }] }));
    setDraft("");
  };

  return (
    <div ref={page} className={styles.page} data-view={view}>
      <section className={styles.inbox} aria-label="Conversations">
        <header className={styles.inboxHead}>
          <h1>Inbox</h1>
          {unread > 0 && (
            <Badge tone="info">
              {unread} unread
            </Badge>
          )}
        </header>
        <Segmented
          label="Show"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "open", label: "Open" },
            { value: "resolved", label: "Resolved" },
          ]}
        />
        {shown.length ? (
          <ul className={styles.list}>
            {shown.map((thread) => {
              const last = thread.turns[thread.turns.length - 1];
              // What people type is shown as typed: the seeded texts are already in the page language.
              const { text: lastText } = last;
              return (
                <li key={thread.id} data-thread={thread.id} data-unread={thread.unread > 0 || undefined}>
                  <Item
                    title={thread.name}
                    description={
                      <>
                        <span className={styles.topic}>{thread.topic}</span>
                        <span className={styles.preview}>
                          {last.mine && "You: "}
                          {lastText}
                        </span>
                      </>
                    }
                    media={<Avatar src={thread.photo} initials={thread.initials} seed={thread.name} alt="" size="md" />}
                    actions={
                      <span className={styles.meta}>
                        <span>{last.time}</span>
                        {thread.unread > 0 && (
                          <Badge tone="info">
                            {thread.unread}
                            <span className={styles.srOnly}> unread</span>
                          </Badge>
                        )}
                      </span>
                    }
                    onClick={() => open(thread.id)}
                    selected={thread.id === openId}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            title={filter === "open" ? "No open conversations" : "Nothing resolved yet"}
            message={filter === "open" ? "Every conversation was answered. New messages show up here." : "Resolve a conversation and it moves here."}
          />
        )}
      </section>
      <section className={styles.thread} aria-label="Open conversation">
        {current ? (
          <>
            <header className={styles.threadHead}>
              <span className={styles.back}>
                <IconButton aria-label="Back to conversations" icon={backIcon} variant="ghost" onClick={backToList} />
              </span>
              <Avatar src={current.photo} initials={current.initials} seed={current.name} alt="" size="md" />
              <div className={styles.who}>
                <h2 ref={title} tabIndex={-1}>{current.name}</h2>
                <p>{current.topic}</p>
              </div>
              <Badge tone={current.state === "open" ? "info" : "success"} dot>
                {current.state === "open" ? "In progress" : "Solved"}
              </Badge>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => update(current.id, (thread) => ({ ...thread, state: thread.state === "open" ? "resolved" : "open" }))}
              >
                {current.state === "open" ? "Resolve" : "Reopen"}
              </Button>
            </header>
            <div className={styles.history}>
              <MessageScroller key={current.id} maxHeight={420} label="Messages">
                {current.turns.map(({ id, mine, time, text }) => (
                  <Message key={id} author={mine ? "You" : current.name} initials={mine ? "VC" : current.initials} time={time} side={mine ? "end" : "start"}>
                    {text}
                  </Message>
                ))}
              </MessageScroller>
            </div>
            <IntentComposer
              label="Reply"
              placeholder="Write a reply…"
              value={draft}
              onChange={setDraft}
              examples={["I'll check and get back to you today.", "Can we talk by phone?"]}
              submitLabel="Send reply"
              showVoiceControl={false}
              onSubmit={send}
            />
          </>
        ) : (
          <EmptyState title="Pick a conversation" message="Choose someone on the list to read and reply." />
        )}
      </section>
    </div>
  );
}
