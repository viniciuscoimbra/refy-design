import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import type { ViewProps } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { WizardStep, WizardStepperCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { MIN_TOUCH } from "../primitives";
import { useReducedMotion } from "../hooks";
import { ProgressBar } from "./ProgressBar";

export type { WizardStep };
export interface WizardStepperProps extends WizardStepperCoreProps, Omit<ViewProps, "children"> {}

/** Largura abaixo da qual `auto` esconde as etapas, igual à container query da web. */
const COMPACT_BELOW = 620;

/** Progresso navegável de wizard: resumo, barra e etapas. Futuras ficam bloqueadas por padrão. */
export function WizardStepper({ steps, current, label = "Progresso", variant = "auto", allowFutureNavigation = false, onStepChange, onBack, backLabel = "Voltar à etapa anterior", style, onLayout, ...rest }: WizardStepperProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const [width, setWidth] = useState(0);
  const currentIndex = Math.max(0, steps.findIndex((step) => step.id === current));
  const currentStep = steps[currentIndex];
  const progress = steps.length ? ((currentIndex + 1) / steps.length) * 100 : 0;
  const ratio = steps.length > 1 ? currentIndex / (steps.length - 1) : 1;
  const fill = useRef(new Animated.Value(ratio)).current;
  useEffect(() => {
    const run = Animated.timing(fill, { toValue: ratio, duration: reduced ? 0 : t.pick<number>("--motion-context-duration", 200), easing: Easing.bezier(...t.easing("--motion-ease-enter")), useNativeDriver: true });
    run.start();
    return () => run.stop();
  }, [ratio, reduced, fill, t]);
  const showSteps = variant === "horizontal" || (variant === "auto" && width >= COMPACT_BELOW);
  const primary = t.pick<string>("--primary");
  const line = t.pick<string>("--line");
  const xs = t.size("--text-xs", 12);
  const mono = t.font(["--interface-detail-font", "--font-mono"], "--weight-semibold");
  const count = Math.max(steps.length, 1);
  const half = width ? width / count / 2 : 0;
  const back = onBack ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={backLabel}
      accessibilityState={{ disabled: currentIndex === 0 }}
      disabled={currentIndex === 0}
      onPress={onBack}
      hitSlop={8}
      style={({ pressed }) => ({ width: t.size("--icon-button-sm", 28), height: t.size("--icon-button-sm", 28), alignItems: "center", justifyContent: "center", borderRadius: t.pick<number>("--control-radius", "--radius-sm", 6), opacity: currentIndex === 0 ? 0.45 : 1, backgroundColor: pressed ? t.mix(t.pick<string>("--ink-1"), 9, "transparent") : "transparent" })}
    >
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={t.pick<string>("--ink-1")} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><Path d="m15 18-6-6 6-6" /></Svg>
    </Pressable>
  ) : null;
  return (
    <View
      accessibilityLabel={label}
      onLayout={(e) => { setWidth(e.nativeEvent.layout.width); onLayout?.(e); }}
      {...rest}
      style={[{ width: "100%", gap: t.size("--space-3", 12) }, style]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: t.size("--space-3", 12), minWidth: 0 }}>
        {back}
        <View style={{ gap: 2, minWidth: 0, flexShrink: 1 }}>
          <Text style={{ color: t.pick<string>("--ink-3"), fontSize: xs, ...t.font("--font-body", "--weight-regular") }}>{label}</Text>
          {variant !== "horizontal" && <Text numberOfLines={1} style={{ color: t.pick<string>("--ink-1"), fontSize: t.size("--text-sm", 13), ...t.font("--font-body", "--weight-bold") }}>{currentStep?.label ?? "Etapa"}</Text>}
        </View>
        <Text style={{ marginLeft: "auto", color: t.pick<string>("--ink-2"), fontSize: xs, fontVariant: ["tabular-nums"], ...t.font(["--interface-detail-font", "--font-mono"], "--weight-bold") }}>{Math.min(currentIndex + 1, steps.length)} de {steps.length}</Text>
      </View>
      <ProgressBar value={progress} size="sm" accessibilityLabel={`${label}: etapa ${currentIndex + 1} de ${steps.length}`} />
      {showSteps && (
        <View style={{ flexDirection: "row" }}>
          <View pointerEvents="none" style={{ position: "absolute", top: 16, left: half, right: half, height: 2, backgroundColor: line }} />
          <Animated.View pointerEvents="none" style={{ position: "absolute", top: 16, left: half, right: half, height: 2, backgroundColor: primary, transformOrigin: "left", transform: [{ scaleX: fill }] }} />
          {steps.map((step, index) => {
            const state = index < currentIndex ? "complete" : index === currentIndex ? "current" : "future";
            const canNavigate = !step.disabled && (allowFutureNavigation || index <= currentIndex);
            const markerStyle = state === "complete"
              ? { borderColor: primary, backgroundColor: primary }
              : state === "current"
                ? { borderColor: primary, backgroundColor: t.pick<string>("--surface"), boxShadow: `0 0 0 4px ${t.mix(primary, 12, "transparent")}` }
                : { borderColor: line, backgroundColor: t.pick<string>("--surface") };
            const markerColor = state === "complete" ? t.pick<string>("--on-primary") : state === "current" ? t.pick<string>("--primary-ink") : t.pick<string>("--ink-3");
            return (
              <Pressable
                key={step.id}
                accessibilityRole="button"
                accessibilityLabel={`${step.label}: ${state === "complete" ? "concluída" : state === "current" ? "etapa atual" : "não iniciada"}`}
                accessibilityState={{ disabled: !canNavigate, selected: state === "current" }}
                disabled={!canNavigate}
                onPress={() => onStepChange?.(step.id)}
                style={{ flex: 1, minWidth: 0, minHeight: MIN_TOUCH, alignItems: "center", gap: 7, paddingHorizontal: t.size("--space-1", 4), opacity: step.disabled ? 0.55 : 1 }}
              >
                <View style={[{ width: 34, height: 34, borderWidth: 2, borderRadius: 17, alignItems: "center", justifyContent: "center" }, markerStyle]}>
                  {state === "complete"
                    ? <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={markerColor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><Path d="m20 6-11 11-5-5" /></Svg>
                    : <Text style={{ color: markerColor, fontSize: xs, ...mono }}>{index + 1}</Text>}
                </View>
                <Text numberOfLines={1} style={{ maxWidth: "100%", color: state === "future" ? t.pick<string>("--ink-3") : t.pick<string>("--ink-1"), fontSize: xs, ...t.font("--font-body", "--weight-medium") }}>{step.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
