import type { Meta } from '@storybook/react';
import { Bubble } from './Bubble';
import { BubbleExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-atoms-bubble',
  title: 'Components/Atoms/Bubble',
  component: Bubble,
  tags: ['autodocs'],
} satisfies Meta<typeof Bubble>;
export const Interativo = { name: "Interactive", render: () => <BubbleExample /> };
