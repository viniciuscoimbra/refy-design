"use client";
import { useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Button } from "../Button";
import { Callout } from "../Callout";
import { Chip } from "../Chip";
import { IconButton } from "../IconButton";
import type { IconButtonProps } from "../IconButton";
import { Multiselect } from "../Multiselect";
import { ProgressBar } from "../ProgressBar";
import { Segmented } from "../Segmented";
import { Textarea } from "../Textarea";
import { VoiceRecorder } from "../VoiceRecorder";
import type { VoiceRecorderProps } from "../VoiceRecorder";
import styles from "./IntentComposer.module.css";

import { useMessages } from "../../lib/locale";
export type IntentComposerState =
  "idle" | "listening" | "processing" | "understood" | "error";

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

export interface IntentComposerProps {
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
  voiceRecorderProps?: VoiceRecorderProps;
  leadingActions?: ReactNode;
  submitIcon?: ReactNode;
  voiceButtonVariant?: IconButtonProps["variant"];
  actionSize?: IconButtonProps["size"];
  showVoiceControl?: boolean;
  processingContent?: ReactNode;
  className?: string;
}

const micIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" />
  </svg>
);

/**
 * Uma superfície para contextualizar, escrever e enviar um pedido. Filtros, texto, estados e ações compõem o mesmo fluxo. Exemplos pertencem ao
 * rodapé interno; voz usa VoiceRecorder; não inclui anexos no v1.
 */
export function IntentComposer({
  state = "idle",
  filters = [],
  filterValues,
  defaultFilterValues = {},
  onFilterValuesChange,
  value,
  defaultValue = "",
  onChange,
  label: labelProp,
  placeholder: placeholderProp,
  examples = [],
  submitLabel: submitLabelProp,
  understoodSummary,
  errorMessage: errorMessageProp,
  onSubmit,
  onVoiceStart,
  onEditRequest,
  onEditDetails,
  voiceRecorderProps,
  leadingActions,
  submitIcon,
  voiceButtonVariant = "ghost",
  actionSize = "md",
  showVoiceControl = true,
  processingContent,
  className,
}: IntentComposerProps) {
  const m = useMessages("intentComposer");
  const label = labelProp ?? m.label;
  const placeholder = placeholderProp ?? m.placeholder;
  const submitLabel = submitLabelProp ?? m.submit;
  const errorMessage = errorMessageProp ?? m.error;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalFilters, setInternalFilters] = useState(defaultFilterValues);
  const text = value ?? internalValue;
  const selections = filterValues ?? internalFilters;
  const readOnly = state === "processing" || state === "understood";

  function changeText(next: string) {
    if (value === undefined) setInternalValue(next);
    onChange?.(next);
  }

  function changeFilters(next: Record<string, string[]>) {
    if (filterValues === undefined) setInternalFilters(next);
    onFilterValuesChange?.(next);
  }

  function selectFilter(group: IntentFilterGroup, next: string) {
    const current = selections[group.id] ?? [];
    changeFilters({
      ...selections,
      [group.id]:
        group.mode === "single"
          ? [next]
          : current.includes(next)
            ? current.filter((item) => item !== next)
            : [...current, next],
    });
  }

  return (
    <section
      className={cn(
        styles.root,
        state === "error" && styles.hasError,
        className,
      )}
      data-state={state}
      aria-label={m.composer}
    >
      {filters.length > 0 && <div className={styles.filters} aria-label={m.initialFilters}>
        {filters.map((group) => {
          const selected = selections[group.id] ?? [];
          return (
            <div key={group.id} className={cn(styles.filterGroup, group.mode === "single" && styles.singleFilter)}>
              <span className={styles.filterLabel}>{group.label}</span>
              {group.mode === "single" ? (
                <Segmented
                  sliding
                  className={styles.singleSelection}
                  label={group.label}
                  options={group.options}
                  value={selected[0] ?? group.options[0]?.value}
                  disabled={readOnly}
                  onChange={(next) => selectFilter(group, next)}
                />
              ) : (
                <Multiselect
                  className={styles.multiselect}
                  aria-label={group.label}
                  options={group.options}
                  value={selected}
                  listPlacement="overlay"
                  placeholder={m.selectGroup(group.label.toLowerCase())}
                  disabled={readOnly}
                  onChange={(next) =>
                    changeFilters({ ...selections, [group.id]: next })
                  }
                />
              )}
            </div>
          );
        })}
      </div>}

      <div className={styles.shell}>
        <Textarea
          className={styles.textarea}
          label={label}
          aria-label={label}
          value={text}
          placeholder={placeholder}
          rows={5}
          readOnly={readOnly}
          aria-busy={state === "processing" || undefined}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            changeText(event.target.value)
          }
        />

        {state === "listening" && (
          <div className={styles.voice}>
            <VoiceRecorder
              state={voiceRecorderProps?.state ?? "listening"}
              transcript={text || undefined}
              {...voiceRecorderProps}
            />
          </div>
        )}

        {state === "understood" && understoodSummary && (
          <Callout
            className={styles.feedback}
            tone="info"
            title={m.understood}
            action={
              <Button size="sm" variant="secondary" onClick={onEditDetails}>
                {m.reviewDetails}
              </Button>
            }
          >
            {understoodSummary}
          </Callout>
        )}

        {state === "error" && (
          <Callout
            className={styles.feedback}
            tone="danger"
            role="alert"
            title={m.needContext}
          >
            {errorMessage}
          </Callout>
        )}

        <div className={styles.footer}>
          {leadingActions && (
            <div className={styles.leadingActions}>{leadingActions}</div>
          )}
          <div className={styles.examples} aria-label={m.examples}>
            {examples.length > 0 && <span>{m.tryThis}</span>}
            {examples.map((example) => (
              <Chip
                key={example}
                disabled={readOnly}
                onClick={() => changeText(example)}
              >
                {example}
              </Chip>
            ))}
          </div>
          <div className={styles.actions}>
            {showVoiceControl && state !== "listening" && (
              <IconButton
                aria-label={m.voice}
                variant={voiceButtonVariant}
                size={actionSize}
                icon={micIcon}
                disabled={readOnly}
                onClick={onVoiceStart}
              />
            )}
            {submitIcon ? (
              <IconButton
                aria-label={submitLabel}
                icon={submitIcon}
                size={actionSize}
                variant="outline"
                aria-busy={state === "processing" || undefined}
                disabled={!text.trim() || readOnly}
                onClick={onSubmit}
              />
            ) : (
              <Button
                size="sm"
                variant="primary"
                status={state === "processing" ? "loading" : "idle"}
                loadingLabel={m.understanding}
                disabled={!text.trim() || state === "understood"}
                onClick={onSubmit}
              >
                {submitLabel}
              </Button>
            )}
          </div>
        </div>

        {state === "processing" && (
          <div className={styles.processing} role="status">
            {processingContent ?? (
              <>
                <div>
                  <strong>{m.organizing}</strong>
                  <span>
                    {m.organizingHint}
                  </span>
                </div>
                <Button size="sm" variant="ghost" onClick={onEditRequest}>
                  {m.editRequest}
                </Button>
                <ProgressBar
                  indeterminate
                  size="sm"
                  aria-label={m.processing}
                />
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
