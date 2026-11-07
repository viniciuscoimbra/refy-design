import type { Meta } from '@storybook/react';
import { Prose } from './Prose';
import { ProseExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-atoms-prose',
  title: 'Components/Atoms/Prose',
  component: Prose,
  tags: ['autodocs'],
} satisfies Meta<typeof Prose>;
export const Interativo = { name: "Interactive", render: () => <ProseExample /> };
