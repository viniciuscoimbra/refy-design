import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "./Modal";
import { Button } from "../Button";

const meta = {
  id: "components-organisms-modal",
  title: "Components/Organisms/Modal",
  component: Modal,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    open: { control: "boolean" },
    title: { control: "text" },
    ariaLabel: { control: "text" },
    children: { control: "text" },
    footer: { control: false },
    onClose: { control: false },
  },
} satisfies Meta<typeof Modal>;
export default meta;

type Story = StoryObj<typeof Modal>;

export const CancelarPlano: Story = { name: "Cancel plan",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>Cancel plan</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Cancel the Pro plan?"
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Keep subscription</Button>
              <Button variant="danger" onClick={() => setOpen(false)}>Confirm cancellation</Button>
            </>
          }
        >
          You keep access until May 2, 2027. Saved credits stay in the balance and are not refunded.
        </Modal>
      </>
    );
  },
};

export const SemTituloVisivel: Story = { name: "No visible title",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open confirmation</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          ariaLabel="Confirm change"
          footer={<Button onClick={() => setOpen(false)}>Complete</Button>}
        >
          Review the change before finishing.
        </Modal>
      </>
    );
  },
};

export const ConteudoLongo: Story = { name: "Long content",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open terms</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Operation terms"
          footer={<Button onClick={() => setOpen(false)}>Got it</Button>}
        >
          {Array.from({ length: 12 }, (_, index) => (
            <p key={index}>Clause {index + 1}: the information stays available for review before confirmation.</p>
          ))}
        </Modal>
      </>
    );
  },
};
