import type { Meta } from '@storybook/react';
import { NavigationMenu } from './NavigationMenu';
import { NavigationMenuExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-molecules-navigationmenu',
  title: 'Components/Molecules/NavigationMenu',
  component: NavigationMenu,
  tags: ['autodocs'],
} satisfies Meta<typeof NavigationMenu>;
export const Interativo = { name: "Interactive", render: () => <NavigationMenuExample /> };
