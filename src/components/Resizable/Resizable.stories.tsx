import type { Meta } from '@storybook/react';
import { Resizable } from './Resizable';
import { ResizableExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-molecules-resizable',
  title: 'Components/Molecules/Resizable',
  component: Resizable,
  tags: ['autodocs'],
} satisfies Meta<typeof Resizable>;
export const Interativo = { name: "Interactive", render: () => <ResizableExample /> };
