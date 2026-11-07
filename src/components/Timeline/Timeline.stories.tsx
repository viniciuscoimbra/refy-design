import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Timeline, type TimelineMilestone } from "./Timeline";
import { Button } from "../Button";
import { Modal } from "../Modal";
import { sampleArtwork } from "../../_demo/content";
const items: TimelineMilestone[] = [
  { id: "discovery", timestamp: "2026-08-05T12:00:00-03:00", title: "The start of the journey", description: "We got the team together and set the project's first goals.", media: <><img src={sampleArtwork()} alt="First visual proposal" width={80} height={54} /><img src={sampleArtwork('#cbd4e4')} alt="Second visual proposal" width={80} height={54} /></>, status: "completed" },
  { id: "prototype", timestamp: "2026-09-12T12:00:00-03:00", title: "First version validated", description: "The prototype was tested and the key decisions were shared with the team.", status: "completed" },
  { id: "delivery", timestamp: "2026-10-23T12:00:00-03:00", title: "Preparing the launch", description: "We reviewed the details and organized the materials for the next step.", status: "current" },
  { id: "launch", timestamp: "2026-11-10T12:00:00-03:00", title: "Launch", description: "A new stage to track results and learn from the people who use the product.", status: "upcoming" },
];
const meta = { id: "components-organisms-timeline", title: "Components/Organisms/Timeline", component: Timeline, tags: ["autodocs"], parameters: { docs: { source: { type: "code" }, description: { component: "Milestones of a journey with dates, media and optional actions. Vertical alternates sides when there is room; horizontal keeps the content in a scrollable strip. For occurrences and authorship, use ActivityTimeline."} } }, args: { items, title: "From idea to launch", description: "The moments that built this journey." } } satisfies Meta<typeof Timeline>;
export default meta;
type Story = StoryObj<typeof Timeline>;
export const Vertical: Story = { render: (args) => {
  const [selected, setSelected] = useState<TimelineMilestone | null>(null);
  return <>
    <Timeline {...args} items={args.items.map(item => ({ ...item, action: <Button size="sm" variant="ghost" onClick={() => setSelected(item)}>View milestone</Button> }))} />
    <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? "Milestone details"}>{selected?.description}</Modal>
  </>;
} };
export const Horizontal: Story = { args: { orientation: "horizontal" } };
export const CaixaEstreita: Story = { name: "Narrow box", render: (args) => <div style={{ width: 320, maxWidth: "100%" }}><Timeline {...args} /></div> };
export const TextoLongo: Story = { name: "Long text", args: { items: [{ ...items[0], title: "An important stage with a long title that must stay readable at any width", description: "The same milestone can hold context, decisions and extra information without losing its place in the journey. The text grows naturally and is never hidden behind the axis, the date or the actions." }, ...items.slice(1)] } };
export const Vazio: Story = { name: "Empty", args: { items: [] } };
