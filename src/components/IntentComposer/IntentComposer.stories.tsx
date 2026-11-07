import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useRef, useState } from "react";
import { IntentComposer } from "./IntentComposer";
import type { IntentComposerState, IntentFilterGroup } from "./IntentComposer";
import type { VoiceRecorderState } from "../VoiceRecorder";

const filters: IntentFilterGroup[] = [
  {
    id: "operation",
    label: "Operation",
    mode: "single",
    options: [{ value: "create", label: "Create" }, { value: "organize", label: "Organize" }],
  },
  {
    id: "types",
    label: "Format",
    mode: "multiple",
    options: [
      { value: "document", label: "Document" },
      { value: "image", label: "Image" },
      { value: "video", label: "Video" },
    ],
  },
  {
    id: "teams",
    label: "Teams",
    mode: "multiple",
    options: [
      { value: "design", label: "Design" },
      { value: "product", label: "Product" },
      { value: "operations", label: "Operations" },
    ],
  },
];

const initialText = "I want to organize reference documents and images for a shared project, with versions and owners.";

const meta = {
  id: "components-organisms-intentcomposer",
  title: "Components/Organisms/IntentComposer",
  component: IntentComposer,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "One surface to set context, write and send a request. Segmented and Multiselect set the context; Textarea keeps focus on the request; suggestions, voice and actions share the footer. Voice, processing, error and understanding feedback stays inside the organism.",
      },
    },
  },
  argTypes: {
    filters: { control: false }, filterValues: { control: false }, defaultFilterValues: { control: false },
    onFilterValuesChange: { action: "filters" }, value: { control: false }, defaultValue: { control: "text" },
    onChange: { action: "change" }, state: { control: "select", options: ["idle", "listening", "processing", "understood", "error"] },
    examples: { control: false }, voiceRecorderProps: { control: false }, onSubmit: { action: "submit" },
    onVoiceStart: { action: "voice" }, onEditRequest: { action: "edit-request" }, onEditDetails: { action: "edit-details" },
  },
} satisfies Meta<typeof IntentComposer>;
export default meta;

type Story = StoryObj<typeof IntentComposer>;

function ComposerDemo({ initialState }: { initialState: IntentComposerState }) {
  const [state, setState] = useState<IntentComposerState>(initialState);
  const [voiceState, setVoiceState] = useState<VoiceRecorderState>("listening");
  const [text, setText] = useState(initialText);
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>({
    operation: ["create"], types: ["document", "image"], teams: ["design"],
  });
  const [message, setMessage] = useState(`Current state: ${initialState}.`);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function process() {
    setState("processing");
    setMessage("Request in progress.");
    timer.current = window.setTimeout(() => {
      setState("understood");
      setMessage("Request understood and ready for detailed review.");
    }, 1800);
  }

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 980 }}>
      <IntentComposer
        state={state}
        filters={filters}
        filterValues={filterValues}
        onFilterValuesChange={setFilterValues}
        value={text}
        onChange={setText}
        examples={[
          "Organize references for a new project",
          "Prepare a collection to share",
        ]}
        understoodSummary="You want a shared collection with documents, images, versions and set owners."
        onSubmit={process}
        onVoiceStart={() => { setVoiceState("listening"); setState("listening"); setMessage("Voice capture open."); }}
        onEditRequest={() => { window.clearTimeout(timer.current); setState("idle"); setMessage("Request open for editing."); }}
        onEditDetails={() => setMessage("Detailed editing requested for the next wizard step.")}
        voiceRecorderProps={{
          state: voiceState,
          duration: 24,
          level: 68,
          onPause: () => setVoiceState("paused"),
          onResume: () => setVoiceState("listening"),
          onCancel: () => { setState("idle"); setMessage("Voice cancelled; text kept."); },
          onFinish: () => { setState("idle"); setMessage("Voice done; text ready to correct."); },
        }}
      />
      <p role="status" style={{ margin: 0, color: "var(--ink-3)", fontSize: "var(--text-xs)" }}>{message}</p>
    </div>
  );
}

/** Filters above; examples and actions in the inner footer; no attachment icon. */
export const Idle: Story = { render: () => <ComposerDemo initialState="idle" /> };

/** VoiceRecorder built into the field, keeping the text visible and editable when done. */
export const Escutando: Story = { name: "Listening", render: () => <ComposerDemo initialState="listening" /> };

/** Explicit load with an “I want to edit” action on the right. */
export const Processando: Story = { name: "Processing", render: () => <ComposerDemo initialState="processing" /> };

/** Natural-language summary before detailed editing by route. */
export const Entendido: Story = { name: "Understood", render: () => <ComposerDemo initialState="understood" /> };

/** A persistent error uses critical and keeps the request available for correction. */
export const Erro: Story = { name: "Error", render: () => <ComposerDemo initialState="error" /> };
