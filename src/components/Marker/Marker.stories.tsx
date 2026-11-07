import type { Meta } from '@storybook/react';
import { Marker } from './Marker';
import { MarkerExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-atoms-marker',
  title: 'Components/Atoms/Marker',
  component: Marker,
  tags: ['autodocs'],
} satisfies Meta<typeof Marker>;
export const Interativo = { name: "Interactive", render: () => <MarkerExample /> };
