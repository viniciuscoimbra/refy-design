import type { AlertDialogCoreProps } from "@refy-design/web/contracts";
import { renderText } from "../primitives";
import { useRefy } from "../theme";
import { Button } from "./Button";
import { Modal } from "./Modal";

export interface AlertDialogProps extends AlertDialogCoreProps {}

/**
 * Confirmação que não fecha no toque fora nem tem ✕: a pessoa escolhe cancelar ou confirmar.
 * Enquanto `pending`, o voltar do Android não fecha e o botão de confirmar mostra o carregamento.
 */
export function AlertDialog({ open, onOpenChange, title, children, onConfirm, confirmLabel = "Confirmar", cancelLabel = "Cancelar", destructive = false, pending = false }: AlertDialogProps) {
  const t = useRefy();
  const size = t.size("--text-base", 14);
  return (
    <Modal
      open={open}
      onClose={() => { if (!pending) onOpenChange(false); }}
      title={title}
      role="alertdialog"
      hideCloseButton
      closeOnBackdrop={false}
      footer={<>
        <Button disabled={pending} onPress={() => onOpenChange(false)}>{cancelLabel}</Button>
        <Button variant={destructive ? "danger" : "primary"} loading={pending} onPress={onConfirm}>{confirmLabel}</Button>
      </>}
    >
      {renderText(children, { color: t.pick<string>("--ink-2"), fontSize: size, lineHeight: Math.round(size * 1.55), ...t.font("--font-body", "--weight-regular") })}
    </Modal>
  );
}
