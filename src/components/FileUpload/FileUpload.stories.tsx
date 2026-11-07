import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FileUpload } from "./FileUpload";

function documentFile() { return new File(["comprovante"], "sample-document.pdf", { type: "application/pdf", lastModified: 1 }); }
function imageFile() { return new File([`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="320" height="200" fill="#bedcf0"/><path d="M40 150 160 40l120 110" fill="#fff8f2" stroke="#bd4b30" stroke-width="12"/></svg>`], "composicao.svg", { type: "image/svg+xml", lastModified: 2 }); }
function typeFiles() {
  return [
    new File(["pdf"], "articles-of-incorporation.pdf", { type: "application/pdf", lastModified: 3 }),
    new File(["docx"], "power-of-attorney.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", lastModified: 4 }),
    imageFile(),
  ];
}

const meta = {
  id: "components-molecules-fileupload",
  title: "Components/Molecules/FileUpload",
  component: FileUpload,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { accept: "image/*,.pdf", maxSize: 10 * 1024 * 1024 },
} satisfies Meta<typeof FileUpload>;
export default meta;
type Story = StoryObj<typeof FileUpload>;

function Preset({ kind = "document", ...props }: { kind?: "document" | "image" } & React.ComponentProps<typeof FileUpload>) {
  const [files, setFiles] = useState(() => [kind === "image" ? imageFile() : documentFile()]);
  return <FileUpload {...props} files={files} onFilesChange={setFiles} />;
}

export const Selecao: Story = { name: "Selection", render: (args) => <Preset {...args} /> };
export const Preview: Story = { render: (args) => <Preset {...args} kind="image" /> };
export const TiposDeArquivo: Story = {
  name: "File types",
  render: (args) => <FileUpload {...args} files={typeFiles()} multiple />,
  args: { accept: ".pdf,.doc,.docx,.png,.jpg,.jpeg,.svg" },
};
export const Progresso: Story = { name: "Progress", render: (args) => <Preset {...args} state="uploading" progress={64} /> };
export const Erro: Story = { name: "Error", args: { state: "error", errorMessage: "The file is over the 10 MB limit." } };
export const Remocao: Story = { name: "Removal", render: (args) => <Preset {...args} /> };
export const Teclado: Story = { name: "Keyboard", args: { label: "Attach documentation", hint: "Use Tab and Enter to open the native picker." } };

/** Explicit public state; it does not call external services. */
export const Desabilitado: Story = { name: "Disabled", args: { disabled: true, label: "Upload unavailable", hint: "You need permission to add files." } };
