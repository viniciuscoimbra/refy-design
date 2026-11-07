import type { Meta, StoryObj } from "@storybook/react";
import { CodeBlock } from "./CodeBlock";

const meta = {
  id: "components-molecules-codeblock",
  title: "Components/Molecules/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Copyable code block: monospaced, automatic highlighting by language and theme surface, its own horizontal scroll and a copy button with visible, announced \"Copied\" feedback (aria-live). `secret` masks the content (API keys) with a reveal toggle; **copy always copies the real value**, even when masked.\n\n" +
          "**Where to use:** API & Webhooks page (keys with `secret`, quickstart snippets), integration instructions, any technical value the user needs to copy exactly (endpoint, command, webhook secret).\n\n" +
          "**Where NOT to use:** not for editable fields (that is `Input`/`Textarea`); not for keyboard shortcuts (that is `Kbd`); not for running text or quotes; do not use `secret` as access control: whoever sees the screen can reveal and copy the value.",
      },
    },
  },
  argTypes: {
    secret: { control: "boolean" },
    visibleChars: { control: { type: "number", min: 0, max: 8 } },
    language: { control: "text" },
  },
} satisfies Meta<typeof CodeBlock>;
export default meta;

type Story = StoryObj<typeof CodeBlock>;

const curlSnippet = `curl https://api.example.com/v1/items \\
  -H "Authorization: Bearer $API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "category": "design", "limit": 3 }'`;

export const Snippet: Story = {
  args: {
    code: curlSnippet,
    label: "Search items",
    language: "bash",
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <CodeBlock {...args} />
    </div>
  ),
};

export const SaidaDoLint: Story = {
  name: "Lint output",
  args: { code: "src/search.ts:18:7  error  'category' is assigned but never used  no-unused-vars", label: "npm run lint", language: "text" },
  render: (args) => <div style={{ maxWidth: 720 }}><CodeBlock {...args} /></div>,
};

export const SemCabecalho: Story = {
  name: "No header (floating copy)",
  args: {
    code: "npm install @refy-design/web",
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <CodeBlock {...args} />
    </div>
  ),
};

export const ChaveSecreta: Story = {
  name: "Secret key (secret)",
  args: {
    code: "example_sk_8f2hd92hd8a2b1c9d0e4f7a3cN9k",
    label: "API key · Production",
    secret: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <CodeBlock {...args} />
    </div>
  ),
};

export const OverflowHorizontal: Story = {
  name: "Horizontal overflow",
  args: {
    code: `https://api.example.com/v1/items?category=design&type=document&limit=3&sort=updated`,
    label: "Signed URL",
    language: "http",
  },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <CodeBlock {...args} />
    </div>
  ),
};

export const QuebraDeLinha: Story = {
  name: "Line wrap",
  args: {
    code: `https://api.example.com/v1/items?category=design&type=document&limit=3&sort=updated`,
    label: "Signed URL",
    language: "http",
    wrap: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <CodeBlock {...args} />
    </div>
  ),
};
