import { useEffect, useRef, useState } from 'react';
import { Badge, Button, Drawer, Item, PageHeader } from '../index';
import styles from './ConversationExample.module.css';
import { ConversationBlock } from '../blocks/ConversationBlock';
import type { ConversationMessage } from '../blocks/ConversationBlock';

type Outcome = 'success' | 'error' | 'late';
const history: ConversationMessage[] = [
  { id: 'seed-1', author: 'You', side: 'end', time: '09:12', content: 'Which materials still need review for the Aurora project delivery?' },
  { id: 'seed-2', author: 'Assistant', time: '09:12', content: 'Two are left: the Content guide and the Review checklist. The Visual references are already approved.' },
  { id: 'seed-3', author: 'You', side: 'end', time: '09:14', content: 'Who has the checklist?' },
  { id: 'seed-4', author: 'Assistant', time: '09:14', content: 'Clara Dias. The review is set for Thursday.' },
];
type Attempt = { id: number; text: string; controller: AbortController };
const replies = [
  'Noted. I left the request on the Content guide and told Clara.',
  'The Review checklist has 12 items; 4 are left, all about accessibility.',
  'Delivery is still on November 12. The deadline has not changed.',
];
const materials = [
  { title: 'Content guide', description: 'In review · Bruno', tone: 'warn' as const, status: 'Missing' },
  { title: 'Review checklist', description: 'In review · Clara', tone: 'warn' as const, status: 'Missing' },
  { title: 'Visual references', description: 'Approved yesterday · Ana', tone: 'success' as const, status: 'Done' },
];
const deadlines = [
  { title: 'Content guide review', owner: 'Bruno', date: 'Nov 7' },
  { title: 'Accessibility checklist', owner: 'Clara', date: 'Nov 10' },
  { title: 'Client delivery', owner: 'Ana', date: 'Nov 12' },
];
/** Synthetic adapter: no API, microphone, credentials or external persistence. `outcome` simula o próximo envio. */
export function ConversationExample({ presentation = 'inline', outcome = 'success' }: { presentation?: 'inline' | 'drawer'; outcome?: Outcome }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>(history);
  const [draft, setDraft] = useState('');
  const draftRef = useRef(draft);
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [notice, setNotice] = useState('');
  const sequence = useRef(0);
  const current = useRef<Attempt | null>(null);
  const failed = useRef<string | null>(null);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  useEffect(() => () => { current.current?.controller.abort(); current.current = null; timers.current.forEach(clearTimeout); }, []);
  function changeDraft(text: string) { draftRef.current = text; setDraft(text); }
  function cancel() {
    current.current?.controller.abort(); current.current = null;
    setStatus('idle'); setNotice('Sending cancelled. Draft kept.');
  }
  function send(text: string, retry = false) {
    if (current.current || !text.trim()) return;
    const attempt: Attempt = { id: ++sequence.current, text, controller: new AbortController() };
    current.current = attempt; setStatus('sending'); setNotice('');
    // Simulates even a provider that delivers a response after abort; identity + signal guard both paths.
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      if (current.current?.id !== attempt.id || attempt.controller.signal.aborted) return;
      current.current = null;
      if (outcome === 'error' && !retry) { failed.current = attempt.text; setStatus('error'); return; }
      failed.current = null;
      setMessages(items => [...items, { id: `sent-${attempt.id}`, author: 'You', side: 'end', content: attempt.text }, { id: `reply-${attempt.id}`, author: 'Assistant', content: replies[attempt.id % replies.length] }]);
      if (draftRef.current === attempt.text) changeDraft('');
      setStatus('idle'); setNotice('Message sent.');
    }, outcome === 'late' ? 1400 : 450);
    timers.current.add(timer);
  }
  const block = <ConversationBlock messages={messages} draft={draft} onDraftChange={changeDraft} status={status} onSend={text => send(text)} onRetry={() => { if (failed.current !== null) send(failed.current, true); }} onCancel={cancel} historyHeight={presentation === 'drawer' ? 360 : 460} />;
  const project = <section className={styles.project} aria-label="Aurora project">
    <h2>Delivery materials</h2>
    <ul>{materials.map(item => <li key={item.title}><Item variant="plain" title={item.title} description={item.description} actions={<Badge tone={item.tone}>{item.status}</Badge>} /></li>)}</ul>
  </section>;
  if (presentation === 'drawer') return <div className={styles.page}>
    <PageHeader title="Aurora project" lead="Delivery on November 12. Two materials still in review." actions={<Button variant="primary" onClick={() => setOpen(true)}>Open conversation</Button>} />
    <div className={styles.columns}>
      {project}
      <section className={styles.project} aria-label="Deadlines">
        <h2>Upcoming deadlines</h2>
        <ul>{deadlines.map(item => <li key={item.title}><Item variant="plain" title={item.title} description={item.owner} actions={<span className={styles.date}>{item.date}</span>} /></li>)}</ul>
      </section>
    </div>
    <Drawer open={open} onOpenChange={next => { if (!next && current.current) cancel(); setOpen(next); }} title="Ask about the project">{block}<p role="status" className={styles.notice}>{notice}</p></Drawer>
  </div>;
  return <div className={styles.page}>
    <PageHeader title="Ask about the Aurora project" lead="The assistant reads the project's materials, deadlines and owners." />
    <div className={styles.layout}>
      <div className={styles.chat}>{block}<p role="status" className={styles.notice}>{notice}</p></div>
      <aside>{project}</aside>
    </div>
  </div>;
}
