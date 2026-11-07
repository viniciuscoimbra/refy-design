import type { Meta } from '@storybook/react';
import { AspectRatio } from './AspectRatio';
import { AspectRatioExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-atoms-aspectratio',
  title: 'Components/Atoms/AspectRatio',
  component: AspectRatio,
  tags: ['autodocs'],
} satisfies Meta<typeof AspectRatio>;
export const Interativo = { name: "Interactive", render: () => <AspectRatioExample /> };
