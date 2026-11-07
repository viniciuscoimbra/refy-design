import type { Meta } from '@storybook/react';
import { ContextMenu } from './ContextMenu';
import { ContextMenuExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-molecules-contextmenu',
  title: 'Components/Molecules/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
} satisfies Meta<typeof ContextMenu>;
export const Interativo = { name: "Interactive", render: () => <ContextMenuExample /> };
