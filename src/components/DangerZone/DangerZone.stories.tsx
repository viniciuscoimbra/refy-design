import { DangerZoneExample } from "../../_demo/MoleculeExamples";
import type { Meta, StoryObj } from "@storybook/react";
import { DangerZone, DangerZoneRow } from "./DangerZone";

/** `DangerZone` — seção padrão de ações destrutivas. */
const meta = {
  id: "components-molecules-dangerzone",
  title: "Components/Molecules/DangerZone",
  component: DangerZone,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Dashed card in the critical tone with destructive action rows (`DangerZoneRow`): title + explicit consequence + `danger` button. `onConfirm` is a hook: the app opens the confirmation `Modal` and only then runs the action; the zone never destroys anything on its own.",
          "",
          "**Where to use:** the single pattern for deleting an account, cancelling a subscription, deleting a workspace/project, always at the END of the settings page, one zone per page.",
          "",
          "**Where NOT to use:** reversible actions (archive, deactivate: use `SettingRow` with a secondary button); warnings without an action (use `Callout`); the confirmation itself (that is `Modal`, owned by the app).",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    children: { control: false },
  },
} satisfies Meta<typeof DangerZone>;
export default meta;

type Story = StoryObj<typeof DangerZone>;

export const ExcluirConta: Story = { name: "Delete account",
  render: () => (
    <DangerZone style={{ maxWidth: 640 }}>
      <DangerZoneRow
        title="Delete João Mendes's account"
        description="This cannot be undone. Analyses and backlog stay with the workspace, not with you."
        actionLabel="Delete account"
        onConfirm={() => console.log("open confirmation Modal")}
      />
    </DangerZone>
  ),
};

export const ComTituloEVariasLinhas: Story = {
  name: "With title and several rows",
  render: () => (
    <DangerZone title="Danger zone" style={{ maxWidth: 640 }}>
      <DangerZoneRow
        title="Cancel subscription"
        description="The workspace returns to the free plan at the end of the cycle. Analyses over the quota become read-only."
        actionLabel="Cancel subscription"
        onConfirm={() => console.log("open Modal")}
      />
      <DangerZoneRow
        title="Delete workspace"
        description="Permanently deletes projects, analyses and members. This cannot be undone."
        actionLabel="Delete workspace"
        onConfirm={() => console.log("open Modal")}
      />
    </DangerZone>
  ),
};

export const AcaoBloqueada: Story = {
  name: "Blocked action (prerequisite)",
  render: () => (
    <DangerZone style={{ maxWidth: 640 }}>
      <DangerZoneRow
        title="Delete account"
        description="Transfer the workspaces you admin before deleting the account."
        actionLabel="Delete account"
        disabled
      />
    </DangerZone>
  ),
};

export const Interativo: Story = { name: "Interactive", render: () => <DangerZoneExample /> };
