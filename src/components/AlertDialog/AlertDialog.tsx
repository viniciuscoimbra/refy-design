import { useId } from 'react';
import type { ReactNode } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { useMessages } from "../../lib/locale";
export interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  pending?: boolean;
}
export function AlertDialog({
  open,
  onOpenChange,
  title,
  children,
  onConfirm,
  confirmLabel: confirmLabelProp,
  cancelLabel: cancelLabelProp,
  destructive = false,
  pending = false,
}: AlertDialogProps) {
  const m = useMessages("alertDialog");
  const confirmLabel = confirmLabelProp ?? m.confirm;
  const cancelLabel = cancelLabelProp ?? m.cancel;
  const description = useId();
  return (
    <Modal
      open={open}
      onClose={() => {
        if (!pending) onOpenChange(false);
      }}
      title={title}
      role="alertdialog"
      hideCloseButton
      closeOnBackdrop={false}
      ariaDescribedBy={description}
      footer={
        <>
          <Button disabled={pending} onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            loading={pending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div id={description}>{children}</div>
    </Modal>
  );
}
