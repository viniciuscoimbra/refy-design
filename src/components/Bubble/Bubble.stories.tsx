import type { Meta } from '@storybook/react';
import { Bubble } from './Bubble';
import { ThemeProvider } from "../../lib/ThemeProvider";
import { BubbleExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-atoms-bubble',
  title: 'Components/Atoms/Bubble',
  component: Bubble,
  tags: ['autodocs'],
} satisfies Meta<typeof Bubble>;
export const Interativo = { name: "Interactive", render: () => <BubbleExample /> };

/** Padding, width, radius, the sender's corner and the outgoing border come from `--bubble-*` hooks. */
export const Medidas = { name: "Measures",
  render: () => (
    <ThemeProvider theme={{ name: "Bubble measures", tokens: { "--bubble-padding": "8px 16px", "--bubble-max-width": "320px", "--bubble-radius": "16px", "--bubble-tail-radius": "2px", "--bubble-end-border-width": "0px" } }}>
      <div style={{ display: "grid", gap: "var(--space-2)", maxWidth: 560 }}>
        <Bubble data-testid="bubble-start">Is the bike still available? I can pick it up this afternoon near the station.</Bubble>
        <Bubble side="end" data-testid="bubble-end">Yes, it is. I am home after 3 pm.</Bubble>
      </div>
    </ThemeProvider>
  ),
};
