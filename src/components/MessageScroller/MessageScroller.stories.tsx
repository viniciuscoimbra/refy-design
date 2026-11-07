import type { Meta } from '@storybook/react';
import { MessageScroller } from './MessageScroller';
import { MessageScrollerExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-molecules-messagescroller',
  title: 'Components/Molecules/MessageScroller',
  component: MessageScroller,
  tags: ['autodocs'],
} satisfies Meta<typeof MessageScroller>;
export const Interativo = { name: "Interactive", render: () => <MessageScrollerExample /> };
