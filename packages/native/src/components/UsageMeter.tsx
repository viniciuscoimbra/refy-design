import { Children } from "react";
import { Text, View } from "react-native";
import type { ViewProps } from "react-native";
import type { ProgressTone, UsageMeterCoreProps, UsageMeterGroupCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { renderText } from "../primitives";
import { ProgressBar } from "./ProgressBar";

export interface UsageMeterProps extends UsageMeterCoreProps, Omit<ViewProps, "children"> {}
export interface UsageMeterGroupProps extends UsageMeterGroupCoreProps, Omit<ViewProps, "children"> {}

const ptBR = new Intl.NumberFormat("pt-BR");
const defaultFormat = (value: number) => ptBR.format(value);

/** Mesma regra da web: crítico a partir de `criticalAt`, aviso a partir de `warnAt`. */
export function usageTone(percent: number, warnAt = 80, criticalAt = 100): ProgressTone {
  if (percent >= criticalAt) return "critical";
  if (percent >= warnAt) return "warn";
  return "primary";
}

/** Uso de uma cota: rótulo, "usado / limite" e a barra, que muda de cor perto do limite. */
export function UsageMeter({ label, used, limit, unit, meta, formatValue = defaultFormat, warnAt = 80, criticalAt = 100, size = "md", style, ...rest }: UsageMeterProps) {
  const t = useRefy();
  const percent = limit > 0 ? (used / limit) * 100 : 0;
  const tone = usageTone(percent, warnAt, criticalAt);
  const usedText = formatValue(used);
  const limitText = formatValue(limit);
  const sm = t.pick<number>("--text-sm", 13);
  const mono = (weight: string) => ({ fontSize: sm, ...t.font(["--interface-detail-font", "--font-mono"], weight), fontVariant: ["tabular-nums" as const] });
  return (
    <View {...rest} style={[{ gap: t.pick<number>("--space-2", 8), minWidth: 0 }, style]}>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: t.pick<number>("--space-3", 12) }}>
        <View style={{ flexShrink: 1, minWidth: 0 }}>{renderText(label, { fontSize: sm, color: t.pick<string>("--ink-1"), ...t.font("--font-body", "--weight-medium") })}</View>
        <Text numberOfLines={1} style={{ flexShrink: 0 }}>
          <Text style={{ ...mono("--weight-semi"), color: tone === "warn" ? t.pick<string>("--weak") : tone === "critical" ? t.pick<string>("--critical") : t.pick<string>("--ink-1") }}>{usedText}</Text>
          <Text style={{ ...mono("--weight-regular"), color: t.pick<string>("--ink-3") }}>{` / ${limitText}`}</Text>
          {unit != null && <Text style={{ ...mono("--weight-regular"), color: t.pick<string>("--ink-3") }}> {unit}</Text>}
        </Text>
      </View>
      <ProgressBar
        value={percent}
        tone={tone}
        size={size}
        accessibilityLabel={typeof label === "string" ? label : undefined}
        accessibilityValue={{ min: 0, max: 100, now: Math.min(100, Math.round(percent)), text: `${usedText} de ${limitText}${typeof unit === "string" ? ` ${unit}` : ""}` }}
      />
      {meta != null && renderText(meta, { fontSize: t.pick<number>("--text-2xs", 11), color: t.pick<string>("--ink-3"), ...t.font(["--interface-detail-font", "--font-mono"], "--weight-regular") })}
    </View>
  );
}

/** Lista de medidores com divisória entre eles. */
export function UsageMeterGroup({ children, style, ...rest }: UsageMeterGroupProps) {
  const t = useRefy();
  const items = Children.toArray(children);
  return (
    <View accessibilityRole="list" {...rest} style={style}>
      {items.map((child, i) => (
        <View key={i} style={{ paddingTop: i === 0 ? 0 : t.pick<number>("--space-4", 16), paddingBottom: i === items.length - 1 ? 0 : t.pick<number>("--space-4", 16), borderBottomWidth: i === items.length - 1 ? 0 : 1, borderBottomColor: t.pick<string>("--border-soft") }}>{child}</View>
      ))}
    </View>
  );
}
