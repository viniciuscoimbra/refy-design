import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button';
import { ContentCard } from './PropertyCard';
import { sampleContent } from '../../_demo/content';
const meta = {
  id: 'components-organisms-propertycard', title: 'Components/Organisms/ContentCard', component: ContentCard, tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Content card with media, title, metadata and actions. Use it in collection, list or review compositions. PropertyCard remains as a compatible name; prefer subtitle, value and valueSuffix.' } } },
  args: { ...sampleContent, detailsAction: <Button size="sm">View details</Button> },
} satisfies Meta<typeof ContentCard>;
export default meta;
type Story = StoryObj<typeof ContentCard>;
export const Grid: Story = { render: args => <div style={{maxWidth:440}}><ContentCard {...args}/></div>, args:{layout:'grid',actions:false} };
export const Lista: Story = { name: "List", args: { layout: 'list', actions: false } };
export const Deck: Story = { render: args => <div style={{maxWidth:600}}><ContentCard {...args}/></div>, args: { layout: 'deck', actions: {} } };
export const ConteudoExtremo: Story = { name: "Extreme content", args: { layout: 'list', title: 'A complete collaboration guide with detailed references for teams that need to organize decisions, files and responsibilities', subtitle: 'Shared collection / Work guidelines / Documents reviewed by the operations team', value:'1,240 files',valueSuffix:'in 18 collections', facts:[...sampleContent.facts!,{label:'Update',value:'3 minutes ago'}],summary:'This long content checks reading, media alignment and access to actions in a real layout, including long values and several attributes.' } };
