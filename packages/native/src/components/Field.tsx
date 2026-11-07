// Receita comum de Input, Textarea e Select (Field.module.css): rótulo mono,
// superfície com borda, foco na cor da marca e texto de ajuda.
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { useRefy } from "../theme";
import type { RefyContext } from "../theme";
import { baseText } from "../primitives";

export function FieldLabel({ children, nativeID }: { children: ReactNode; nativeID?: string }) {
  const t = useRefy();
  const size = t.pick<number>("--field-label-size", "--text-eyebrow");
  return (
    <Text
      nativeID={nativeID}
      style={{
        ...baseText(t, { size, color: "--ink-3", family: ["--field-label-font", "--font-mono"], weight: t.pick<number>("--field-label-weight", "--weight-medium"), leading: "--leading-snug" }),
        textTransform: t.pick<string>("--field-label-transform", "uppercase") as "uppercase",
        letterSpacing: t.size("--field-label-tracking", 0.14 * size, size),
      }}
    >
      {children}
    </Text>
  );
}

export function FieldHelp({ children, error }: { children: ReactNode; error?: boolean }) {
  const t = useRefy();
  return <Text accessibilityLiveRegion={error ? "polite" : "none"} style={{ ...baseText(t, { size: t.pick<number>("--text-xs"), color: error ? "--critical" : "--ink-3", leading: "--leading-snug" }) }}>{children}</Text>;
}

export function surfaceStyle(t: RefyContext, { focused, error, disabled }: { focused: boolean; error: boolean; disabled: boolean }): StyleProp<ViewStyle> {
  const ring = error ? `0 0 0 3px ${t.mix(t.pick<string>("--critical"), 20, "transparent")}` : t.pick<string>("--shadow-focus-ring", "none");
  return {
    backgroundColor: disabled ? t.pick<string>("--surface-2") : t.pick<string>("--field-background", "--surface"),
    borderWidth: t.pick<number>("--field-border-width", 1),
    borderColor: error ? t.pick<string>("--critical") : focused ? t.pick<string>("--primary") : t.pick<string>("--field-border", "--outline"),
    borderRadius: t.pick<number>("--field-radius", "--radius-default"),
    opacity: disabled ? 0.7 : 1,
    // O outline de 2 px com afastamento da web não existe no RN; o anel de foco fica na sombra.
    boxShadow: focused && ring !== "none" ? ring : t.pick<string>("--field-shadow", "none") === "none" ? undefined : t.pick<string>("--field-shadow"),
  };
}

export function FieldShell({ label, labelId, hint, error, block, children }: { label?: string; labelId?: string; hint?: string; error?: string; block: boolean; children: ReactNode }) {
  return (
    <View style={{ gap: 6, minWidth: 0, maxWidth: "100%", alignSelf: block ? "stretch" : "flex-start" }}>
      {label ? <FieldLabel nativeID={labelId}>{label}</FieldLabel> : null}
      {children}
      {(error || hint) ? <FieldHelp error={Boolean(error)}>{error || hint}</FieldHelp> : null}
    </View>
  );
}
