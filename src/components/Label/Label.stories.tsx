import type { Meta } from '@storybook/react';
import { Label } from './Label';
import { LabelExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-atoms-label',
  title: 'Components/Atoms/Label',
  component: Label,
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;
export const Interativo = { name: "Interactive", render: () => <LabelExample /> };
