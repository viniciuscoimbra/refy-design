// Contratos de Questionnaire, GuidedTour e Coverflow. `className` fica só na web.
import type { ReactNode } from "react";
import type { PopoverAlign, PopoverSide } from "./overlay";

export interface Question {
  id: string;
  title: string;
  description?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

/** Props for the Questionnaire component. */
export interface QuestionnaireCoreProps {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => void;
}

export interface GuidedTourAction {
  label: string;
  onAction: () => void;
  advance?: boolean;
}

export interface GuidedTourStep {
  id: string;
  title: string;
  description: ReactNode;
  side?: PopoverSide;
  align?: PopoverAlign;
  action?: GuidedTourAction;
}

/** Props for the GuidedTour component. */
export interface GuidedTourCoreProps {
  steps: GuidedTourStep[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  currentStep?: string;
  defaultStep?: string;
  onStepChange?: (id: string) => void;
  onComplete?: () => void;
  children: ReactNode;
}

/** Props for the GuidedTourAnchor component. */
export interface GuidedTourAnchorCoreProps {
  stepId: string;
  children: ReactNode;
  block?: boolean;
}

export interface CoverflowItem {
  id: string;
  label: string;
}

/** Props for the Coverflow component. */
export interface CoverflowCoreProps<T extends CoverflowItem = CoverflowItem> {
  items: readonly T[];
  renderItem: (item: T, state: { selected: boolean; index: number }) => ReactNode;
  selectedId?: string;
  defaultSelectedId?: string;
  onSelectionChange?: (id: string) => void;
  onActivate?: (item: T) => void;
  label?: string;
  disabled?: boolean;
  emptyContent?: ReactNode;
}
