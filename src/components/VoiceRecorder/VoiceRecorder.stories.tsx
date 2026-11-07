import { Textarea } from "../Textarea";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { VoiceRecorder } from "./VoiceRecorder";
import type { VoiceRecorderState } from "./VoiceRecorder";

const meta = {
  id: "components-molecules-voicerecorder",
  title: "Components/Molecules/VoiceRecorder",
  component: VoiceRecorder,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Compact, controlled visual capture: the app wires Web Speech/MediaRecorder and supplies state, duration and level. Activity uses the brand color; red appears only on error. Composes `IconButton`, `Button`, `ProgressBar` and `Callout`.",
      },
    },
  },
  argTypes: {
    state: { control: "select", options: ["idle", "listening", "paused", "error", "fallback"] },
    duration: { control: "number" }, level: { control: { type: "range", min: 0, max: 100 } },
    transcript: { control: "text" }, errorMessage: { control: "text" },
    onStart: { action: "start" }, onPause: { action: "pause" }, onResume: { action: "resume" },
    onCancel: { action: "cancel" }, onFinish: { action: "finish" }, onRetry: { action: "retry" },
    onUseFallback: { action: "fallback" },
  },
} satisfies Meta<typeof VoiceRecorder>;
export default meta;

type Story = StoryObj<typeof VoiceRecorder>;

function RecorderDemo({ initialState }: { initialState: VoiceRecorderState }) {
  const [state, setState] = useState<VoiceRecorderState>(initialState);
  const [duration, setDuration] = useState(initialState === "paused" ? 18 : 0);
  const [transcript,setTranscript] = useState('');
  const [level, setLevel] = useState(36);
  const [message, setMessage] = useState(`Current state: ${initialState}.`);

  useEffect(() => {
    if (state !== "listening") return;
    const timer = window.setInterval(() => {
      setDuration((value) => value + 1);
      setLevel((value) => (value + 17) % 96 + 4);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [state]);

  const transition = (next: VoiceRecorderState, copy: string) => {
    setState(next);
    setMessage(copy);
  };

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 620 }}>
      <VoiceRecorder
        state={state}
        duration={duration}
        level={level}
        onStart={() => {setTranscript('');transition("listening", "Simulation started, no audio captured.");}}
        onPause={() => transition("paused", "Recording paused.")}
        onResume={() => transition("listening", "Recording resumed.")}
        onCancel={() => { setDuration(0); transition("idle", "Recording discarded."); }}
        onFinish={() => {setTranscript("Let's review the project materials before sharing them with the team.");transition("idle", "Simulation done. Review the sample text.");}}
        onRetry={() => transition("idle", "Simulation restarted.")}
        onUseFallback={() => transition(state === "error" ? "fallback" : "idle", state === "error" ? "Dictation fallback shown." : "Continue with the phone keyboard.")}
      />
      {transcript && <Textarea label="Sample text for review" value={transcript} onChange={event => setTranscript(event.target.value)} />}
      <p role="status" style={{ margin: 0, color: "var(--ink-3)", fontSize: "var(--text-xs)" }}>{message}</p>
    </div>
  );
}

/** Tap the microphone to start; no permission request happens before that. */
export const Idle: Story = { render: () => <RecorderDemo initialState="idle" /> };

/** Meter, duration, pause, cancel and finish really work. */
export const Escutando: Story = { name: "Listening", render: () => <RecorderDemo initialState="listening" /> };

/** Pause freezes the meter and offers resume. */
export const Pausado: Story = { name: "Paused", render: () => <RecorderDemo initialState="paused" /> };

/** The error uses semantic red and offers retry or a fallback. */
export const ErroDePermissao: Story = { name: "Permission error", render: () => <RecorderDemo initialState="error" /> };

/** Explicit alternative when Web Speech is not available. */
export const FallbackDitado: Story = { name: "Dictation fallback", render: () => <RecorderDemo initialState="fallback" /> };
