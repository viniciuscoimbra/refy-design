import type { Meta, StoryObj } from '@storybook/react';
import { ConversationExample } from '../_demo/ConversationExample';
const meta = { id: 'conversation-pilot', title: 'Componentes/Páginas/Conversa', component: ConversationExample, parameters: { layout: 'padded' } } satisfies Meta<typeof ConversationExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Inline: Story = { args: { presentation: 'inline' } };
export const Drawer: Story = { args: { presentation: 'drawer' } };
