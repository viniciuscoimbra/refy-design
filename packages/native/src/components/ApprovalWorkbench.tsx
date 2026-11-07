import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import type { ApprovalWorkbenchCoreProps, ApprovalWorkbenchItem, ApprovalWorkbenchItemState } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { Badge } from "./Badge";
import { ProgressBar } from "./ProgressBar";

export type { ApprovalWorkbenchItem, ApprovalWorkbenchItemState };
export interface ApprovalWorkbenchProps extends ApprovalWorkbenchCoreProps {
  style?: StyleProp<ViewStyle>;
}

const stateLabel: Record<ApprovalWorkbenchItemState, string> = {
  "not-started": "Não iniciado",
  "in-progress": "Em análise",
  complete: "Concluído",
};

/**
 * Análise manual em dois planos: a fila de itens e o editor do item ativo. Até 840 pt de
 * tela a fila vira uma faixa com rolagem lateral acima do editor, como na web.
 */
export function ApprovalWorkbench({ label = "Itens da análise", items, activeId, onActiveChange, children, style }: ApprovalWorkbenchProps) {
  const t = useRefy();
  const { width } = useWindowDimensions();
  const narrow = width <= 840;
  const completed = items.filter((item) => item.state === "complete").length;
  const progress = items.length === 0 ? 0 : (completed / items.length) * 100;
  const sm = t.pick<number>("--text-sm", 14);
  const xs = t.pick<number>("--text-xs", 12);
  const ink1 = t.pick<string>("--ink-1");
  const ink3 = t.pick<string>("--ink-3");
  const radius = t.pick<number>("--radius-default", 6);
  const border = t.pick<number>("--surface-border-width", 1);
  const s = (name: string, fallback: number) => t.size(name, fallback);

  const list = items.map((item, index) => {
    const active = item.id === activeId;
    const complete = item.state === "complete";
    const badge = <Badge tone={complete ? "success" : item.state === "in-progress" ? "info" : "neutral"}>{stateLabel[item.state]}</Badge>;
    return (
      <Pressable
        key={item.id}
        accessibilityRole="button"
        accessibilityLabel={`${item.label}${item.meta ? `, ${item.meta}` : ""}, ${stateLabel[item.state]}`}
        accessibilityState={{ selected: active }}
        onPress={() => onActiveChange(item.id)}
        style={({ pressed }) => ({
          width: narrow ? 260 : undefined,
          minHeight: 44,
          flexDirection: "row",
          alignItems: "center",
          gap: s("--space-3", 12),
          padding: s("--space-3", 12),
          borderWidth: border,
          borderRadius: radius,
          borderColor: active || pressed ? t.pick<string>("--line") : "transparent",
          backgroundColor: active || pressed ? t.pick<string>("--surface-2") : "transparent",
        })}
      >
        <View style={{ width: 34, height: 34, borderRadius: 999, alignItems: "center", justifyContent: "center", borderWidth: border, borderColor: complete ? t.pick<string>("--good", "--ok") : t.pick<string>("--line"), backgroundColor: complete ? t.pick<string>("--good", "--ok") : t.pick<string>("--surface") }}>
          <Text style={{ color: complete ? t.pick<string>("--on-good", "--on-primary", "#fff") : ink3, fontSize: sm, ...t.font("--font-body", "--weight-semi") }}>{complete ? "✓" : index + 1}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text numberOfLines={1} style={{ color: ink1, fontSize: sm, ...t.font("--font-body", "--weight-semi") }}>{item.label}</Text>
          {item.meta != null && <Text numberOfLines={1} style={{ color: ink3, fontSize: xs, ...t.font("--font-body", "--weight-regular") }}>{item.meta}</Text>}
          {narrow && <View style={{ alignSelf: "flex-start", marginTop: 4 }}>{badge}</View>}
        </View>
        {!narrow && badge}
      </Pressable>
    );
  });

  const queue = (
    <View style={{ gap: s("--space-4", 16), width: narrow ? undefined : 300 }}>
      <View style={{ gap: s("--space-3", 12), paddingHorizontal: s("--space-2", 8) }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: s("--space-3", 12) }}>
          <Text style={{ flexShrink: 1, color: ink1, fontSize: sm, ...t.font("--font-body", "--weight-semi") }}>{label}</Text>
          <Text style={{ color: ink3, fontSize: xs, ...t.font("--font-body", "--weight-regular") }}>{`${completed} de ${items.length} concluídos`}</Text>
        </View>
        <ProgressBar value={progress} size="sm" tone={completed === items.length && items.length > 0 ? "neutral" : "primary"} accessibilityLabel={`Andamento da análise: ${completed} de ${items.length} itens concluídos`} />
      </View>
      {narrow ? (
        <ScrollView horizontal style={{ flexGrow: 0 }} accessibilityLabel={label} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: s("--space-2", 8), paddingBottom: s("--space-2", 8) }}>{list}</ScrollView>
      ) : (
        <View accessibilityLabel={label} style={{ gap: s("--space-2", 8) }}>{list}</View>
      )}
    </View>
  );
  return (
    <View style={[{ flexDirection: narrow ? "column" : "row", alignItems: narrow ? "stretch" : "flex-start", gap: narrow ? s("--space-5", 20) : s("--space-8", 32) }, style]}>
      {queue}
      <View style={{ flex: narrow ? undefined : 1, minWidth: 0 }}>{children}</View>
    </View>
  );
}
