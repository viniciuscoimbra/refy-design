import type { Meta } from '@storybook/react';
import { ScrollArea } from './ScrollArea';
import { ScrollAreaExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-atoms-scrollarea',
  title: 'Components/Atoms/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
} satisfies Meta<typeof ScrollArea>;
export const Interativo = { name: "Interactive", render: () => <ScrollAreaExample /> };
