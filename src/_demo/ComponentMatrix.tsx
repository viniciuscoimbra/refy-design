import { useState } from 'react';
import { Input, Segmented } from '../index';
import { ComponentExample } from '../pages/PlaygroundPage/ComponentArea';
import { componentAreas, componentCatalog } from '../pages/PlaygroundPage/catalog';
import styles from '../pages/PlaygroundPage/Workbench.module.css';

// Regression fixture: simultaneous rendering checks shared IDs, geometry and inherited tokens.
// Public documentation intentionally renders one family at a time instead.
// The catalog keeps its level ids in Portuguese (the site translates them); the labels here stay in English.
const levelOptions: [string, string][] = [['all', 'All'], ['Átomos', 'Atoms'], ['Moléculas', 'Molecules'], ['Organismos', 'Organisms']];

export function ComponentMatrix() {
  const [level,setLevel] = useState('Moléculas'), [query,setQuery] = useState('');
  const items = componentCatalog.filter(item => (level === 'all' || item.level === level) && `${item.label} ${componentAreas[item.area]}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  return <main className={styles.gallery} aria-label="Component regression matrix">
    <Input label="Search component" value={query} onChange={event => setQuery(event.target.value)} />
    <Segmented label="Atomic Design level" value={level} onChange={setLevel} options={levelOptions.map(([value,name])=>({value,label:`${name} (${value === 'all' ? componentCatalog.length : componentCatalog.filter(entry=>entry.level === value).length})`}))}/>
    {Object.entries(componentAreas).map(([area,label])=>{const group=items.filter(item=>item.area === area);return group.length>0 && <section key={area} className={styles.gallerySection} aria-label={label}><h2>{label}</h2><div className={styles.examples}>{group.map(entry=><article className={styles.example} data-level={entry.level} key={entry.id} aria-label={entry.label}><header><h3>{entry.label}</h3></header><ComponentExample id={entry.id}/></article>)}</div></section>;})}
  </main>;
}
