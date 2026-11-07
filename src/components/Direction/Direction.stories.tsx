import type { Meta } from '@storybook/react';
import { Direction } from './Direction';
import { DirectionExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-atoms-direction',
  title: 'Components/Atoms/Direction',
  component: Direction,
  tags: ['autodocs'],
} satisfies Meta<typeof Direction>;
export const Interativo = { name: "Interactive", render: () => <DirectionExample /> };
