import type { Meta } from '@storybook/react';
import { Spinner } from './Spinner';
import { SpinnerExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-atoms-spinner',
  title: 'Components/Atoms/Spinner',
  component: Spinner,
  tags: ['autodocs'],
} satisfies Meta<typeof Spinner>;
export const Interativo = { name: "Interactive", render: () => <SpinnerExample /> };
