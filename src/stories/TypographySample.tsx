import { fontSets, type FontSet } from '../lib/fontSets';
import { Select } from '../components/Select';
import styles from './VisualSystem.module.css';

export function TypographySample({ value, onChange }: { value: FontSet; onChange?: (value: FontSet) => void }) {
  const set = fontSets[value];
  return <section className={styles.section} aria-label="Type roles">
    <h2>See the font in use</h2>
    {onChange && <div style={{ maxWidth: 320, margin: '20px 0' }}><Select label="Type set" value={value} onChange={e => onChange(e.target.value as FontSet)}>{Object.entries(fontSets).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</Select></div>}
    <p>{set.description}</p>
    <div className={styles.grid}>
      <div className={styles.specimen}>
        <span className={styles.caption}>Headings and signature · {set.heading}</span>
        <strong data-testid="font-heading" style={{ fontFamily: 'var(--font-headline)' }}>Ideas in action</strong>
        <code>--font-headline<br/>--font-heading · --font-brand</code>
      </div>
      <div className={styles.specimen}>
        <span className={styles.caption}>Reading and controls · {set.body}</span>
        <p data-testid="font-body" style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-1)', fontSize: '1rem' }}>Organize projects, share decisions and track progress.</p>
        <code>--font-body</code>
      </div>
      <div className={styles.specimen}>
        <span className={styles.caption}>Code and values · {set.mono}</span>
        <p data-testid="font-mono" style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-1)' }}>{'const tema = "Refy";'}<br/>{'Il1 O0 {} => 0123456789'}</p>
        <code>--font-mono</code>
      </div>
    </div>
  </section>;
}
