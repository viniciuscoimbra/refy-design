import type { Meta } from '@storybook/react';
import { Menubar } from './Menubar';
import { MenubarExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-molecules-menubar',
  title: 'Components/Molecules/Menubar',
  component: Menubar,
  tags: ['autodocs'],
} satisfies Meta<typeof Menubar>;
export const Interativo = { name: "Interactive", render: () => <MenubarExample /> };
