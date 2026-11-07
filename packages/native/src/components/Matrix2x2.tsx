import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Pattern, Rect, Stop } from "react-native-svg";
import type { Matrix2x2CoreProps, MatrixPoint } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { hitSlopFor, renderText } from "../primitives";

export type { MatrixPoint };
export interface Matrix2x2Props extends Matrix2x2CoreProps {
  /** Só no nativo: altura da área. Padrão 460, a mesma altura mínima da web. */
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/** Percentual de --critical na cor do ponto `index`: 100 no primeiro, 0 no último, como a web. */
export function priorityMix(index: number, count: number) {
  const t = count <= 1 ? 0 : index / (count - 1);
  return Math.round((1 - t) * 100);
}

/**
 * Matriz impacto × esforço com pontos numerados por prioridade. A cor vai de crítico (1º) a
 * informação (último). Tocar num ponto seleciona; tocar de novo desmarca.
 */
export function Matrix2x2({ points, xLabel = "Esforço →", yLabel = "Impacto →", quadrants, legend = ["Prioridade alta", "Prioridade baixa"], selectedId, defaultSelectedId = null, onPointClick, height = 460, style }: Matrix2x2Props) {
  const t = useRefy();
  const [internal, setInternal] = useState<string | null>(defaultSelectedId);
  const [yLabelW, setYLabelW] = useState(0);
  const selected = selectedId !== undefined ? selectedId : internal;
  const select = (point: MatrixPoint) => {
    const next = selected === point.id ? null : point.id;
    if (selectedId === undefined) setInternal(next);
    onPointClick?.(next ? point : null);
  };
  const critical = t.pick<string>("--critical");
  const info = t.pick<string>("--info");
  const ink1 = t.pick<string>("--ink-1", "--on-surface");
  const ink3 = t.pick<string>("--ink-3", "--on-surface-variant");
  const surface = t.pick<string>("--surface");
  const size = t.pick<number>("--matrix-point-size", 30);
  const eyebrow = t.size("--text-eyebrow", 11);
  const xs = t.size("--text-xs", 12);
  const mono = (w: string | number) => t.font(["--interface-detail-font", "--font-mono"], w);
  const axisStyle = { color: ink3, fontSize: eyebrow, letterSpacing: eyebrow * 0.12, textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase", ...mono("--weight-bold") };
  const cross = t.mix(ink1, 8, "transparent");
  const qStyle = { color: ink3, fontSize: xs, lineHeight: Math.round(xs * 1.45), ...t.font("--font-body", "--weight-regular") };
  const quad = (node: React.ReactNode, pos: ViewStyle, right: boolean) => node == null ? null : (
    <View style={[{ position: "absolute", zIndex: 1, maxWidth: "44%" }, pos]}>{renderText(node, { ...qStyle, textAlign: right ? "right" : "left" })}</View>
  );

  return (
    <View style={[{ width: "100%" }, style]}>
      <View accessibilityLabel={`Matriz ${yLabel} por ${xLabel}: ${points.length} itens`} style={{ height, overflow: "hidden", borderRadius: t.pick<number>("--card-radius", "--radius-lg-token", 12), borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: t.pick<string>("--line", "--surface-container-high"), backgroundColor: surface }}>
        <Svg style={{ position: "absolute", left: 0, top: 0 }} width="100%" height="100%">
          <Defs>
            <Pattern id="dots" x={0} y={0} width={24} height={24} patternUnits="userSpaceOnUse">
              <Circle cx={18} cy={18} r={1} fill={t.mix(t.pick<string>("--primary"), 11, "transparent")} />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#dots)" />
        </Svg>
        <View style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, backgroundColor: cross }} />
        <View style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, backgroundColor: cross }} />
        <Text accessibilityElementsHidden importantForAccessibility="no" style={[axisStyle, { position: "absolute", zIndex: 2, bottom: 14, left: 0, right: 0, textAlign: "center" }]}>{xLabel}</Text>
        <Text accessibilityElementsHidden importantForAccessibility="no" onLayout={(e) => setYLabelW(e.nativeEvent.layout.width)} style={[axisStyle, { position: "absolute", zIndex: 2, left: 14 - yLabelW / 2 + eyebrow * 0.7, top: height / 2 - eyebrow * 0.7, transform: [{ rotate: "-90deg" }] }]}>{yLabel}</Text>
        {quad(quadrants?.topLeft, { left: 22, top: 18 }, false)}
        {quad(quadrants?.topRight, { right: 22, top: 18 }, true)}
        {quad(quadrants?.bottomLeft, { left: 22, bottom: 40 }, false)}
        {quad(quadrants?.bottomRight, { right: 22, bottom: 40 }, true)}
        {points.map((point, i) => {
          const color = t.mix(critical, priorityMix(i, points.length), info);
          const isSelected = selected === point.id;
          return (
            <Pressable
              key={point.id}
              accessibilityRole="button"
              accessibilityLabel={`${i + 1}: ${point.label}`}
              accessibilityState={{ selected: isSelected }}
              onPress={() => select(point)}
              hitSlop={hitSlopFor(size, size)}
              style={({ pressed }) => ({
                position: "absolute", zIndex: isSelected ? 5 : 4, left: `${point.x}%`, bottom: `${point.y}%`,
                width: size, height: size, marginLeft: -size / 2, marginBottom: -size / 2,
                alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: color,
                transform: [{ scale: isSelected ? 1.22 : pressed ? 1.16 : 1 }],
                boxShadow: isSelected
                  ? `0 16px 30px -18px ${color}, 0 0 0 4px ${surface}, 0 0 0 6px ${color}`
                  : point.prioritized ? `0 12px 24px -16px ${color}, 0 0 0 3px ${t.mix(color, 30, "transparent")}` : `0 12px 24px -16px ${color}`,
              })}
            >
              <Text style={{ color: surface, fontSize: t.size("--text-2xs", 11), ...mono("--weight-bold") }}>{i + 1}</Text>
            </Pressable>
          );
        })}
      </View>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14, marginTop: t.size("--space-3", 12) }}>
        <Text style={[axisStyle, { fontSize: t.size("--text-2xs", 11), ...mono("--weight-regular") }]}>{legend[0]}</Text>
        <Svg style={{ flex: 1 }} height={6}>
          <Defs><LinearGradient id="ramp" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor={critical} /><Stop offset="0.5" stopColor={t.mix(critical, 50, info)} /><Stop offset="1" stopColor={info} /></LinearGradient></Defs>
          <Rect width="100%" height={6} rx={3} fill="url(#ramp)" />
        </Svg>
        <Text style={[axisStyle, { fontSize: t.size("--text-2xs", 11), ...mono("--weight-regular") }]}>{legend[1]}</Text>
      </View>
    </View>
  );
}
