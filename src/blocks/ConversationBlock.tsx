import type { ReactNode } from 'react';
import { Button, Callout, IntentComposer, Message, MessageScroller } from '../index';
import styles from './ConversationBlock.module.css';

export interface ConversationMessage {
  id: string;
  author: string;
  initials?: string;
  time?: string;
  side?: 'start' | 'end';
  content: ReactNode;
}
export interface ConversationBlockProps {
  messages: ConversationMessage[];
  draft: string;
  onDraftChange: (text: string) => void;
  status: 'idle' | 'sending' | 'error';
  errorMessage?: string;
  onSend: (text: string) => void;
  onRetry: () => void;
  onCancel: () => void;
  /** Altura máxima do histórico antes de rolar. */
  historyHeight?: number;
}
/** Controlled composition: transport, persistence and message ownership stay with the application. */
export function ConversationBlock({ messages, draft, onDraftChange, status, errorMessage, onSend, onRetry, onCancel, historyHeight = 320 }: ConversationBlockProps) {
  return <section className={styles.root} aria-label="Chat">
    <MessageScroller maxHeight={historyHeight}>
      {messages.map(message => <Message key={message.id} author={message.author} initials={message.initials} time={message.time} side={message.side}>{message.content}</Message>)}
      {messages.length === 0 && <p>No messages. Write to start the conversation.</p>}
    </MessageScroller>
    {status === 'error' && <Callout tone="danger" role="alert" title="Could not send" action={<Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button>}>{errorMessage ?? 'The draft was kept. You can resend or edit the text.'}</Callout>}
    <IntentComposer value={draft} onChange={onDraftChange} state={status === 'sending' ? 'processing' : 'idle'} label="Message" placeholder="Write a message…" submitLabel="Send message" showVoiceControl={false} onSubmit={() => { if (status !== 'sending' && draft.trim()) onSend(draft); }} processingContent={<div className={styles.pending} role="status"><span>Sending message…</span><Button variant="secondary" size="sm" onClick={onCancel}>Cancel sending</Button></div>} />
  </section>;
}
