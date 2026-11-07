import type { Meta } from '@storybook/react';
import { Item } from './Item';
import { ItemExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-molecules-item',
  title: 'Components/Molecules/Item',
  component: Item,
  tags: ['autodocs'],
} satisfies Meta<typeof Item>;
export const Interativo = { name: "Interactive", render: () => <ItemExample /> };

export const Metadados = { name: "Metadata", render: () => <Item variant="plain" title="12 components" description="In development" media={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>} /> };
