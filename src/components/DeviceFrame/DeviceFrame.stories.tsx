import type { Meta, StoryObj } from "@storybook/react";
import { DeviceFrame } from "./DeviceFrame";

/** `DeviceFrame` — moldura de navegador ou celular com a página viva dentro. */
const meta = {
  id: "components-molecules-deviceframe",
  title: "Components/Molecules/DeviceFrame",
  component: DeviceFrame,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "With `src`, renders the page in an iframe at the real width (`viewport`, default 1280×800 in the browser and 390×844 on the phone) and scales it to the available space. Without `src`, shows `children` (for example, a real capture of a native app).",
          "",
          "**Where to use:** showing the same screen on different devices. **Where NOT to use:** as decoration for any image; the frame promises the device's real width.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["browser", "phone"] },
    src: { control: "text" },
    address: { control: "text" },
    caption: { control: "text" },
  },
} satisfies Meta<typeof DeviceFrame>;
export default meta;
type Story = StoryObj<typeof meta>;

const page = "iframe.html?id=components-molecules-sectionheader--playground&viewMode=story";
export const Playground: Story = {
  args: { variant: "browser", src: page, frameTitle: "Browser example", address: "refy.design", caption: "Browser, 1280 px" },
  render: (args) => <div style={{ maxWidth: 640 }}><DeviceFrame {...args} /></div>,
};
export const Celular: Story = { name: "Phone",
  args: { variant: "phone", src: page, frameTitle: "Phone example", caption: "Phone, 390 px" },
  render: (args) => <div style={{ maxWidth: 220 }}><DeviceFrame {...args} /></div>,
};
