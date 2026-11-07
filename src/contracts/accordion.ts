// Contrato de props do Accordion e do Collapsible: o que a web e o nativo implementam igual.
import type { ReactNode } from "react";

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

/** Props for the Accordion component. */
export interface AccordionCoreProps {
  items: AccordionItem[];
  /** single = só um aberto por vez; multiple = vários. */
  type?: "single" | "multiple";
  /** IDs abertos (controlado). */
  value?: string[];
  defaultValue?: string[];
  onChange?: (open: string[]) => void;
  /** plain remove a caixa externa, preservando os divisores entre itens. */
  variant?: "default" | "plain" | "joined";
  /** Escala compacta para composições densas. */
  size?: "default" | "sm";
  /** Seta também à esquerda do título. */
  leadingIndicator?: boolean;
  /** Com `leadingIndicator`, recua o conteúdo até o texto do título. */
  indentContent?: boolean;
}

/** Props for the Collapsible component. */
export interface CollapsibleCoreProps {
  title: string;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}
