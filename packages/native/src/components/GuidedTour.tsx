import { createContext, useContext, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { GuidedTourAction, GuidedTourAnchorCoreProps, GuidedTourCoreProps, GuidedTourStep } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useIconStyle } from "../icon";
import { AnchoredLayer, panelSurface } from "../overlay";
import { renderText } from "../primitives";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { ProgressBar } from "./ProgressBar";

export type { GuidedTourAction, GuidedTourStep };
export interface GuidedTourProps extends GuidedTourCoreProps {}
export interface GuidedTourAnchorProps extends GuidedTourAnchorCoreProps {
  style?: StyleProp<ViewStyle>;
}

interface TourContext {
  steps: GuidedTourStep[];
  currentId?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  previous: () => void;
  next: () => void;
}

const Context = createContext<TourContext | null>(null);

/** Estado e navegação do tour; GuidedTourAnchor marca o controle real de cada passo. */
export function GuidedTour({ steps, open, defaultOpen = false, onOpenChange, currentStep, defaultStep, onStepChange, onComplete, children }: GuidedTourProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalStep, setInternalStep] = useState(defaultStep ?? steps[0]?.id);
  const isOpen = open ?? internalOpen;
  const currentId = currentStep ?? internalStep;
  const index = Math.max(0, steps.findIndex((step) => step.id === currentId));
  const value = useMemo<TourContext>(() => {
    const setOpen = (next: boolean) => {
      if (open === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    };
    const go = (id: string) => {
      if (!steps.some((step) => step.id === id)) return;
      if (currentStep === undefined) setInternalStep(id);
      onStepChange?.(id);
    };
    return {
      steps,
      currentId,
      open: isOpen,
      setOpen,
      previous: () => { const target = steps[Math.max(0, index - 1)]; if (target) go(target.id); },
      next: () => {
        const target = steps[index + 1];
        if (target) go(target.id);
        else { setOpen(false); onComplete?.(); }
      },
    };
  }, [steps, currentId, isOpen, index, open, currentStep, onOpenChange, onStepChange, onComplete]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

function Close() {
  const { size, color } = useIconStyle();
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round"><Path d="M18 6 6 18M6 6l12 12" /></Svg>;
}

function TourCard({ step, index, context }: { step: GuidedTourStep; index: number; context: TourContext }) {
  const t = useRefy();
  const total = context.steps.length;
  const last = index === total - 1;
  const gap = t.size("--space-3", 12);
  const sm = t.pick<number>("--text-sm", 14);
  const md = t.pick<number>("--text-md", 16);
  return (
    <View style={{ gap }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <Text style={{ color: t.pick<string>("--ink-3"), fontSize: t.pick<number>("--text-eyebrow", "--text-xs", 11), letterSpacing: 1, textTransform: "uppercase", ...t.font(["--interface-detail-font", "--font-mono"], "--weight-medium") }}>{`${index + 1} de ${total}`}</Text>
        <IconButton size="sm" variant="ghost" accessibilityLabel="Fechar tour" icon={<Close />} onPress={() => context.setOpen(false)} />
      </View>
      <ProgressBar size="sm" value={((index + 1) / total) * 100} accessibilityLabel={`Etapa ${index + 1} de ${total}`} />
      <View style={{ gap: t.size("--space-1", 4) }}>
        <Text accessibilityRole="header" style={{ color: t.pick<string>("--ink-1"), fontSize: md, lineHeight: Math.round(md * 1.3), ...t.font(["--font-display", "--font-body"], "--weight-semibold") }}>{step.title}</Text>
        {renderText(step.description, { color: t.pick<string>("--ink-2"), fontSize: sm, lineHeight: Math.round(sm * 1.5), ...t.font("--font-body", "--weight-regular") })}
      </View>
      {step.action && (
        <Button size="sm" variant="secondary" block onPress={() => { step.action?.onAction(); if (step.action?.advance) context.next(); }}>{step.action.label}</Button>
      )}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <Button size="sm" variant="ghost" disabled={index === 0} onPress={context.previous}>Voltar</Button>
        <Button size="sm" variant="primary" onPress={context.next}>{last ? "Concluir" : "Próximo"}</Button>
      </View>
    </View>
  );
}

/**
 * Prende um passo do tour ao controle real. O fundo escurece em volta do controle e o cartão
 * abre ao lado dele; tocar fora, o voltar do Android ou o escape do VoiceOver fecham o tour.
 */
export function GuidedTourAnchor({ stepId, children, block = false, style }: GuidedTourAnchorProps) {
  const t = useRefy();
  const context = useContext(Context);
  if (!context) throw new Error("GuidedTourAnchor precisa estar dentro de GuidedTour.");
  const index = context.steps.findIndex((item) => item.id === stepId);
  const step = context.steps[index];
  if (!step) throw new Error(`Etapa de tour inexistente: ${stepId}`);
  const active = context.open && context.currentId === stepId;
  const anchor = useRef<View>(null);
  return (
    <>
      <View ref={anchor} collapsable={false} style={[{ alignSelf: block ? "stretch" : "flex-start", borderRadius: t.pick<number>("--radius-default", 6) }, style]}>{children}</View>
      <AnchoredLayer
        open={active}
        onClose={() => context.setOpen(false)}
        anchorRef={anchor}
        side={step.side ?? "bottom"}
        align={step.align ?? "start"}
        gap={12}
        scrim={t.mix(t.pick<string>("--ink-1"), 54, "transparent")}
        spotlight={5}
        label={step.title}
        panelStyle={[panelSurface(t), { width: 300, maxWidth: "88%", paddingVertical: 14, paddingHorizontal: 16 }]}
      >
        <TourCard step={step} index={index} context={context} />
      </AnchoredLayer>
    </>
  );
}
