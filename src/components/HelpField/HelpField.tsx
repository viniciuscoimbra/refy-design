import { cloneElement, isValidElement, useId } from "react";
import type { ReactElement, ReactNode } from "react";
import { IconButton } from "../IconButton";
import { HoverCard } from "../HoverCard";
import { cn } from "../../lib/cn";
import styles from "./HelpField.module.css";

import { useMessages } from "../../lib/locale";
/** Props for the HelpField form-row wrapper. */
export interface HelpFieldProps {
  /** Plain field label (never the internal technical name). */
  label: string;
  /** Short explanation shown in the icon's rich help. */
  helpText: string;
  /** The field itself (Input, Select, Combobox…). Gets `aria-describedby` from the help text. */
  children: ReactNode;
  /** "Learn more" link hook; the app opens the help Drawer (the component does not ship it). */
  onLearnMore?: () => void;
  /** Link text. Default "Learn more". */
  learnMoreLabel?: string;
  /** Field `id`, to link the `<label>` (htmlFor). */
  htmlFor?: string;
  /** Tooltip side. Default "top". */
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const HelpIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M9.2 9a2.9 2.9 0 0 1 5.6 1c0 1.8-2.8 2.2-2.8 3.6" />
    <line x1="12" y1="17" x2="12" y2="17.01" />
  </svg>
);

/**
 * HelpField — padrão para campo técnico inevitável.
 *
 * Form-row com rótulo simples + ícone de ajuda (`IconButton` sm). No
 * hover/foco o ícone mostra um `HoverCard` com o `helpText` e, dentro dele,
 * "Saber mais" chama `onLearnMore` — o app decide o que abrir
 * (tipicamente a Drawer de ajuda). O campo (children) recebe
 * `aria-describedby` apontando para o texto de ajuda.
 *
 *   <HelpField label="Participação na comissão" helpText="…" onLearnMore={abrirAjuda}>
 *     <Input id="share" suffix="%" />
 *   </HelpField>
 */
export function HelpField({
  label,
  helpText,
  children,
  onLearnMore,
  learnMoreLabel: learnMoreLabelProp,
  htmlFor,
  side = "top",
  className,
}: HelpFieldProps) {
  const m = useMessages("helpField");
  const learnMoreLabel = learnMoreLabelProp ?? m.learnMore;
  const uid = useId();
  const helpId = `${uid}-help`;

  // liga o campo ao texto de ajuda sem exigir prop extra do consumidor
  const field = isValidElement(children)
    ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, {
        "aria-describedby": cn(
          (children as ReactElement<{ "aria-describedby"?: string }>).props["aria-describedby"],
          helpId
        ),
      })
    : children;

  return (
    <div className={cn(styles.field, className)}>
      <div className={styles.head}>
        <label className={styles.label} htmlFor={htmlFor ?? (isValidElement<{ id?: string }>(children) ? children.props.id : undefined)}>
          {label}
        </label>
        <span className={styles.tip}>
          <HoverCard side={side === "bottom" ? "bottom" : "top"} openDelay={160} content={(
            <div className={styles.helpContent}>
              <span>{helpText}</span>
              {onLearnMore && <button type="button" className={styles.learnMore} onClick={onLearnMore}>{learnMoreLabel}</button>}
            </div>
          )}>
            <IconButton size="sm" aria-label={m.help(String(label))} icon={HelpIcon} />
          </HoverCard>
        </span>
      </div>
      {field}
      <span id={helpId} className={styles.srOnly}>
        {helpText}
      </span>
    </div>
  );
}
