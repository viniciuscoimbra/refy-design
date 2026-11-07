"use client";
import { useState } from 'react';
import {
  Badge,
  Button,
  Drawer,
  Input,
  Item,
  Modal,
  Prose,
  Select,
  Textarea,
} from '../index';
import styles from './blocks.module.css';
// Item reserves an icon-sized slot for media: an Avatar there overflows onto the title.
const icon = (path: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={path} />
  </svg>
);
const documentIcon = icon('M14 3H6v18h12V7zM14 3v4h4M9 13h6M9 17h6');
const collectionIcon = icon('M3 7h18v13H3zM6 4h12M9 11h6');
const initialMaterials = [
  {
    id: 'guide',
    title: 'Content guide',
    type: 'Document',
    description: 'Criteria for clarity, tone of voice and material review.',
    body: 'Start with the goal of the material. Identify who will read it, what decision they need to make and what information they need for it.',
  },
  {
    id: 'visual',
    title: 'Visual references',
    type: 'Collection',
    description: 'A selection of references for the next project.',
    body: 'Compare hierarchy, legibility and consistency. Use the references to discuss interface decisions with the team.',
  },
  {
    id: 'checklist',
    title: 'Review checklist',
    type: 'Document',
    description: 'What to check before sharing a delivery.',
    body: 'Check title, context, access and version. Review with the owner before publishing.',
  },
  {
    id: 'interviews',
    title: 'Customer interviews',
    type: 'Collection',
    description: 'Twelve conversations recorded in October, with a summary of each.',
    body: 'Each interview has the summary, the marked quotes and what changed in the product after it.',
  },
  {
    id: 'brand',
    title: 'Brand manual',
    type: 'Document',
    description: 'Logo, colors, typography and examples of right and wrong use.',
    body: 'Use the horizontal logo when there is room and the symbol version in app icons.',
  },
  {
    id: 'release',
    title: 'Release notes',
    type: 'Document',
    description: 'What went into each version, written for the people who use the product.',
    body: 'Write what the person gains from the change, not the technical name of the task.',
  },
];
export function LibraryBlock() {
  const [materials, setMaterials] = useState(initialMaterials),
    [query, setQuery] = useState(''),
    [type, setType] = useState('all'),
    [selected, setSelected] = useState(''),
    [saved, setSaved] = useState<string[]>([]),
    [creating, setCreating] = useState(false),
    [title, setTitle] = useState(''),
    [body, setBody] = useState('');
  const material = materials.find((item) => item.id === selected),
    rows = materials.filter(
      (item) =>
        (type === 'all' || item.type === type) &&
        item.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
    );
  return (
    <section className={styles.stack} aria-label="Materials library">
      <div className={styles.libraryControls}>
        <Input
          label="Search materials"
          placeholder="Material title…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Select
          label="Material type"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option value="all">All types</option>
          <option>Document</option>
          <option>Collection</option>
        </Select>
        <Button variant="primary" onClick={() => setCreating(true)}>
          New material
        </Button>
      </div>
      <p className={styles.meta} role="status">
        {rows.length} materials · {saved.length} saved
      </p>
      <div className={styles.libraryList}>
        {rows.map((item) => (
          <Item
            key={item.id}
            title={item.title}
            description={item.description}
            media={<span className={styles.iconTile}>{item.type === 'Collection' ? collectionIcon : documentIcon}</span>}
            onClick={() => setSelected(item.id)}
            actions={
              <span className={styles.itemActions}>
              <Badge>{item.type}</Badge>
              <Button
                size="sm"
                aria-label={`${saved.includes(item.id) ? 'Remove from saved' : 'Save'} ${item.title}`}
                aria-pressed={saved.includes(item.id)}
                onClick={() =>
                  setSaved((ids) =>
                    ids.includes(item.id)
                      ? ids.filter((id) => id !== item.id)
                      : [...ids, item.id],
                  )
                }
              >
                {saved.includes(item.id) ? 'Saved' : 'Save'}
              </Button>
              </span>
            }
          />
        ))}
      </div>
      {!rows.length && (
        <div>
          <p>No material matches the search.</p>
          <Button
            onClick={() => {
              setQuery('');
              setType('all');
            }}
          >
            Clear search
          </Button>
        </div>
      )}
      <Drawer
        open={Boolean(material)}
        onOpenChange={(open) => {
          if (!open) setSelected('');
        }}
        title={material?.title ?? 'Material'}
      >
        <Prose>
          <p>{material?.body}</p>
          <h3>To review</h3>
          <ul>
            <li>Clear goal and context</li>
            <li>Up-to-date information</li>
            <li>Access for the right team</li>
          </ul>
        </Prose>
      </Drawer>
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Add material"
      >
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim()) return;
            setMaterials((items) => [
              ...items,
              {
                id: `material-${items.length}`,
                title: title.trim(),
                type: 'Document',
                description: body.slice(0, 100),
                body,
              },
            ]);
            setTitle('');
            setBody('');
            setCreating(false);
          }}
        >
          <Input
            label="Material title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Textarea
            label="Material content"
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
          <Button type="submit" variant="primary">
            Add material
          </Button>
        </form>
      </Modal>
    </section>
  );
}
