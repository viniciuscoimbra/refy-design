import { Children, isValidElement } from "react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import type { StyleProp, TextStyle } from "react-native";

/** Texto solto (string ou número) vira <Text>; elemento passa direto. O RN quebra com texto fora de <Text>. */
export function renderText(children: ReactNode, style: StyleProp<TextStyle>, props: { numberOfLines?: number } = {}) {
  const items = Children.toArray(children);
  if (!items.length) return null;
  if (items.every((child) => typeof child === "string" || typeof child === "number")) {
    return <Text style={style} {...props}>{items.join("")}</Text>;
  }
  return items.map((child, index) =>
    typeof child === "string" || typeof child === "number" ? <Text key={index} style={style} {...props}>{child}</Text> : isValidElement(child) ? child : null,
  );
}

/** A área de toque mínima de 44 pt que a Apple e o Material pedem. */
export const MIN_TOUCH = 44;

/** Completa a área de toque até 44 pt sem mudar o tamanho desenhado. */
export function hitSlopFor(height: number, width?: number) {
  const v = Math.max(0, Math.ceil((MIN_TOUCH - height) / 2));
  const h = width === undefined ? 0 : Math.max(0, Math.ceil((MIN_TOUCH - width) / 2));
  return v || h ? { top: v, bottom: v, left: h, right: h } : undefined;
}

export function lineHeight(fontSize: number, leading: number | string | undefined) {
  return typeof leading === "number" ? Math.round(fontSize * leading) : undefined;
}

import type { RefyContext } from "./theme";
/** O que :where([data-refy-scope]) dá a todo texto na web: corpo, 14 px, 1.55, --ink-2. */
export function baseText(t: RefyContext, overrides: { size?: number; leading?: string; color?: string; family?: string | string[]; weight?: string | number } = {}): TextStyle {
  const fontSize = overrides.size ?? t.pick<number>("--text-base", 14);
  return {
    fontSize,
    lineHeight: lineHeight(fontSize, t.pick<number>(overrides.leading ?? "--leading-normal", 1.55)),
    color: t.pick<string>(overrides.color ?? "--ink-2"),
    ...t.font(overrides.family ?? "--font-body", overrides.weight ?? "--weight-regular"),
  };
}

/** Padding com a sintaxe curta do CSS ("7px 14px") vindo de um token; px e número puro. */
export function paddingFrom(t: RefyContext, name: string, fallback: [number, number, number?, number?]) {
  const raw = t.pick<string | number>(name, "");
  const parts = typeof raw === "number" ? [raw] : String(raw).trim().split(/\s+/).map((p) => /^-?[\d.]+(px)?$/.test(p) ? parseFloat(p) : NaN);
  const values = parts.length && parts.every((n) => Number.isFinite(n)) ? parts : fallback.filter((n): n is number => n !== undefined);
  const [top, right = top, bottom = top, left = right] = values;
  return { paddingTop: top, paddingRight: right, paddingBottom: bottom, paddingLeft: left };
}

/**
 * Fundo vindo de token: cor vira `backgroundColor`; `linear-gradient(...)` vira
 * `experimental_backgroundImage`, que o RN 0.76+ desenha com a mesma sintaxe do CSS.
 * Sem isso o degradê do tema chega como cor inválida e o botão fica transparente.
 */
export function fill(value: string | undefined): { backgroundColor?: string; experimental_backgroundImage?: string } {
  if (value && /^(repeating-)?linear-gradient\(/.test(value.trim())) return { experimental_backgroundImage: value };
  return { backgroundColor: value };
}
