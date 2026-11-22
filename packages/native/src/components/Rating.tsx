import { useState } from "react";
import type { ReactElement } from "react";
import { Pressable, Text, View } from "react-native";
import type { ViewProps } from "react-native";
import Svg, { ClipPath, Defs, Path, Rect } from "react-native-svg";
import type { RatingCoreProps, RatingSize } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { baseText, hitSlopFor } from "../primitives";

export type { RatingSize };
export interface RatingProps extends RatingCoreProps, Omit<ViewProps, "children"> {}

const STAR = "M12 2.8l2.84 5.76 6.36.92-4.6 4.49 1.08 6.33L12 17.3l-5.68 3 1.08-6.33-4.6-4.49 6.36-.92z";
const SIZES: Record<RatingSize, number> = { sm: 14, md: 18, lg: 24 };
const clamp = (value: number, max: number) => Math.min(max, Math.max(0, value));
let clipCount = 0;

function Star({ size, fill, empty, full }: { size: number; fill: number; empty: string; full: string }) {
  const [id] = useState(() => `refy-star-${++clipCount}`);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={STAR} fill={empty} />
      {fill > 0 && (
        <>
          <Defs><ClipPath id={id}><Rect x="0" y="0" width={24 * fill} height="24" /></ClipPath></Defs>
          <Path d={STAR} fill={full} clipPath={`url(#${id})`} />
        </>
      )}
    </Svg>
  );
}

const fmt = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",");

/** Nota em estrelas: leitura com fração, ou escolha de 1 a `max` com toque. */
export function Rating({ label, value: valueProp, defaultValue = 0, onChange, max = 5, readOnly = false, count, showValue, size = "md", disabled = false, showLabel = false, style, ...rest }: RatingProps) {
  const t = useRefy();
  const [inner, setInner] = useState(defaultValue);
  const value = clamp(valueProp ?? inner, max);
  const px = SIZES[size];
  const empty = t.pick<string>("--surface-container-high", "--line");
  const full = t.pick<string>("--weak");
  const text = baseText(t, { size: t.pick<number>(size === "sm" ? "--text-xs" : size === "lg" ? "--text-base" : "--text-sm"), color: "--ink-3" });
  const shownValue = showValue ?? readOnly;
  const reviews = count != null ? `(${count} ${count === 1 ? "avaliação" : "avaliações"})` : null;
  const meta = (shownValue || reviews) && (
    <Text style={text}>
      {shownValue && <Text style={{ color: t.pick<string>("--ink-1"), ...t.font("--font-body", "--weight-semi") }}>{fmt(value)} </Text>}
      {reviews}
    </Text>
  );
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  // Rótulo visível em cima das estrelas; o nome acessível continua no grupo.
  const withLabel = (node: ReactElement) =>
    showLabel ? (
      <View style={{ gap: 4 }}>
        <Text importantForAccessibility="no" accessibilityElementsHidden style={baseText(t, { size: t.pick<number>("--text-xs", 12), color: "--ink-2", weight: "--weight-medium" })}>{label}</Text>
        {node}
      </View>
    ) : node;
  if (readOnly) {
    return withLabel(
      <View accessible accessibilityRole="image" accessibilityLabel={`${label}: ${fmt(value)} de ${max}${reviews ? `, ${count} avaliações` : ""}`} {...rest} style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, style]}>
        <View style={{ flexDirection: "row", gap: 2 }}>{stars.map((n) => <Star key={n} size={px} fill={clamp(value - (n - 1), 1)} empty={empty} full={full} />)}</View>
        {meta}
      </View>
    );
  }
  const selected = Math.round(value);
  const choose = (n: number) => {
    if (disabled) return;
    const next = selected === n ? 0 : n;
    if (valueProp === undefined) setInner(next);
    onChange?.(next);
  };
  return withLabel(
    <View accessibilityRole="radiogroup" accessibilityLabel={label} {...rest} style={[{ flexDirection: "row", alignItems: "center", gap: 8, opacity: disabled ? t.pick<number>("--control-disabled-opacity", 0.5) : 1 }, style]}>
      <View style={{ flexDirection: "row", gap: 2 }}>
        {stars.map((n) => (
          <Pressable
            key={n}
            accessibilityRole="radio"
            accessibilityLabel={`${n} de ${max} ${max === 1 ? "estrela" : "estrelas"}`}
            accessibilityState={{ checked: selected === n, disabled }}
            disabled={disabled}
            onPress={() => choose(n)}
            hitSlop={hitSlopFor(px + 4, px + 4)}
            style={{ padding: 2, width: px + 4, height: px + 4 }}
          >
            <Star size={px} fill={n <= selected ? 1 : 0} empty={empty} full={full} />
          </Pressable>
        ))}
      </View>
      {meta}
    </View>
  );
}
