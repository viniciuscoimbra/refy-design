// Contratos de ApprovalWorkbench, Trace, VisitSchedulePicker, GeoAreaPicker e IntentComposer.
// `className` e os atributos HTML ficam só na web; `voiceRecorderProps` usa o VoiceRecorder de cada lado.
import type { ReactNode } from "react";
import type { IconButtonSize, IconButtonVariant } from "./icon-button";

export type ApprovalWorkbenchItemState = "not-started" | "in-progress" | "complete";
export interface ApprovalWorkbenchItem {
  id: string;
  label: string;
  meta?: string;
  state: ApprovalWorkbenchItemState;
}
/** Props for the ApprovalWorkbench component. */
export interface ApprovalWorkbenchCoreProps {
  label?: string;
  items: ApprovalWorkbenchItem[];
  activeId: string;
  onActiveChange: (id: string) => void;
  children: ReactNode;
}

export interface TraceStep {
  id: string;
  title: string;
  status: "pending" | "running" | "complete" | "error";
  duration?: string;
  detail: string;
}
/** Props for the Trace component. */
export interface TraceCoreProps {
  steps: TraceStep[];
  label?: string;
}

export type VisitAvailability = Record<string, string[]>;
/** Props for the VisitSchedulePicker component. */
export interface VisitSchedulePickerCoreProps {
  value?: VisitAvailability;
  defaultValue?: VisitAvailability;
  onChange?: (value: VisitAvailability) => void;
  defaultActiveDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  timezone?: string;
  unavailable?: VisitAvailability;
  disabled?: boolean;
}

export interface GeoNeighborhood {
  id: string;
  label: string;
  distance: number;
}
/** Props for the GeoAreaPicker component. */
export interface GeoAreaPickerCoreProps {
  neighborhoods: GeoNeighborhood[];
  baseId: string;
  radius?: number;
  defaultRadius?: number;
  minRadius?: number;
  maxRadius?: number;
  radiusStep?: number;
  onRadiusChange?: (radius: number) => void;
  includedIds?: string[];
  defaultIncludedIds?: string[];
  onIncludedIdsChange?: (ids: string[]) => void;
  map?: ReactNode;
  mapLabel?: string;
  error?: string;
}

export type IntentComposerState = "idle" | "listening" | "processing" | "understood" | "error";
export interface IntentFilterOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface IntentFilterGroup {
  id: string;
  label: string;
  mode: "single" | "multiple";
  options: IntentFilterOption[];
}
/** Props for the IntentComposer component. */
export interface IntentComposerCoreProps {
  state?: IntentComposerState;
  filters?: IntentFilterGroup[];
  filterValues?: Record<string, string[]>;
  defaultFilterValues?: Record<string, string[]>;
  onFilterValuesChange?: (values: Record<string, string[]>) => void;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  examples?: string[];
  submitLabel?: string;
  understoodSummary?: string;
  errorMessage?: string;
  onSubmit?: () => void;
  onVoiceStart?: () => void;
  onEditRequest?: () => void;
  onEditDetails?: () => void;
  leadingActions?: ReactNode;
  submitIcon?: ReactNode;
  voiceButtonVariant?: IconButtonVariant;
  actionSize?: IconButtonSize;
  showVoiceControl?: boolean;
  processingContent?: ReactNode;
}
