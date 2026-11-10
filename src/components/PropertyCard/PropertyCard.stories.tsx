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
/** Short and long value suffix in each layout: the suffix stays on the value line when it fits and moves below it as a whole when it does not. */
export const SufixoDoValor: Story = {
  name: "Value suffix",
  render: (args) => (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'start' }}>
        <div style={{ width: 280 }}><ContentCard {...args} layout="grid" actions={false} value="$ 3,200" valueSuffix="/month" /></div>
        <div style={{ width: 280 }}><ContentCard {...args} layout="grid" actions={false} value="$ 720,000" valueSuffix="+ $ 620 condo fee" /></div>
        <div style={{ width: 240 }}><ContentCard {...args} layout="grid" actions={false} value="$ 12,500,000" valueSuffix="+ $ 4,800 condo fee and taxes" /></div>
      </div>
      <div style={{ maxWidth: 600 }}><ContentCard {...args} layout="list" actions={false} value="$ 720,000" valueSuffix="+ $ 620 condo fee" /></div>
      <div style={{ maxWidth: 440 }}><ContentCard {...args} layout="deck" actions={false} value="$ 720,000" valueSuffix="+ $ 620 condo fee" /></div>
    </div>
  ),
};
