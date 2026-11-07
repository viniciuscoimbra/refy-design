import type { Meta } from '@storybook/react';
import { Message } from './Message';
import { MessageExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-molecules-message',
  title: 'Components/Molecules/Message',
  component: Message,
  tags: ['autodocs'],
} satisfies Meta<typeof Message>;
export const Interativo = { name: "Interactive", render: () => <MessageExample /> };
