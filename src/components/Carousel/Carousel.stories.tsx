import type { Meta } from '@storybook/react';
import { Carousel } from './Carousel';
import { CarouselExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-molecules-carousel',
  title: 'Components/Molecules/Carousel',
  component: Carousel,
  tags: ['autodocs'],
} satisfies Meta<typeof Carousel>;
export const Interativo = { name: "Interactive", render: () => <CarouselExample /> };
