import type { Meta, StoryObj } from "@storybook/react";
import { Citation } from "./Citation";

const meta = {
  id: "components-atoms-citation",
  title: "Components/Atoms/Citation",
  component: Citation,
  tags: ["autodocs"],
  args: {
    index: 1,
    source: {
      title: "Understanding Success Criterion 1.4.3: Contrast (Minimum)",
      href: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
      snippet: "Text and images of text have a contrast ratio of at least 4.5:1.",
    },
  },
} satisfies Meta<typeof Citation>;
export default meta;
type Story = StoryObj<typeof Citation>;

export const Padrao: Story = { name: "Default" };
export const NoTexto: Story = {
  name: "Inside a paragraph",
  render: () => (
    <p style={{ maxWidth: 520 }}>
      Body text needs a contrast ratio of at least 4.5 to 1
      <Citation index={1} source={{ title: "Understanding Success Criterion 1.4.3", href: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html", snippet: "Text and images of text have a contrast ratio of at least 4.5:1." }} />
      , and large text can go down to 3 to 1
      <Citation index={2} source={{ title: "Large text definition", href: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html#dfn-large-scale", snippet: "At least 18 point, or 14 point bold." }} />.
    </p>
  ),
};
