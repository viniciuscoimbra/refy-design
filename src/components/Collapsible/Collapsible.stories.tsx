import type { Meta } from '@storybook/react';
import { Collapsible } from './Collapsible';
import { CollapsibleExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-molecules-collapsible',
  title: 'Components/Molecules/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
} satisfies Meta<typeof Collapsible>;
export const Interativo = { name: "Interactive", render: () => <CollapsibleExample /> };

/** Explicit public state; it does not call external services. */
export const Desabilitado = { name: "Disabled", render: () => <Collapsible title="Details unavailable" disabled>Content protected by permissions.</Collapsible> };
