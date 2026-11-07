import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, Line, Path, Polyline } from "react-native-svg";
import type { Workspace, WorkspaceSwitcherCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { hitSlopFor } from "../primitives";
import { AnchoredLayer, panelSurface } from "../overlay";
import { Avatar } from "./Avatar";

export type { Workspace };
export interface WorkspaceSwitcherProps extends WorkspaceSwitcherCoreProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * Seletor de ambiente. Gatilho com avatar quadrado, nome, papel e seta dupla; o painel lista os
 * ambientes com check no atual e ganha busca a partir de 5, como na web.
 */
export function WorkspaceSwitcher({ workspaces, value, defaultValue, onChange, compact, style }: WorkspaceSwitcherProps) {
  const t = useRefy();
  const anchor = useRef<View>(null);
  const [internal, setInternal] = useState(defaultValue ?? workspaces[0]?.id);
  const currentId = value !== undefined ? value : internal;
  const current = workspaces.find((w) => w.id === currentId) ?? workspaces[0];
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchable = workspaces.length >= 5;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? workspaces.filter((w) => w.name.toLowerCase().includes(q)) : workspaces;
  }, [workspaces, query]);
  useEffect(() => { if (open) setQuery(""); }, [open]);
  if (!current) return null;

  const choose = (workspace: Workspace) => {
    if (value === undefined) setInternal(workspace.id);
    onChange?.(workspace);
    setOpen(false);
  };
  const ink1 = t.pick<string>("--ink-1", "--on-surface");
  const ink3 = t.pick<string>("--ink-3", "--on-surface-variant");
  const surface2 = t.pick<string>("--surface-2", "--surface-container-low");
  const lineSoft = t.pick<string>("--line-soft", "--surface-container-high");
  const sm = t.pick<number>("--text-sm", 13);
  const eyebrow = t.pick<number>("--text-eyebrow", 11);
  const roleStyle = { color: ink3, fontSize: eyebrow, letterSpacing: eyebrow * 0.06, textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase", ...t.font(["--interface-detail-font", "--font-mono"], "--weight-regular") };
  const space2 = t.size("--space-2", 8);
  const triggerH = compact ? 40 : 32 + 2 * space2;
  const avatar = (w: Workspace, size: "sm" | "md") => (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Avatar size={size} initials={w.initials} shape="square" accessible={false} />
    </View>
  );

  return (
    <View style={[{ alignSelf: compact ? "flex-start" : "stretch" }, style]}>
      <View ref={anchor} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ambiente atual: ${current.name}. Trocar ambiente`}
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen((v) => !v)}
          hitSlop={hitSlopFor(triggerH, compact ? triggerH : undefined)}
          style={({ pressed }) => compact
            ? { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: t.pick<number>("--control-radius", "--radius-md", 8), backgroundColor: pressed ? surface2 : "transparent" }
            : {
                minHeight: triggerH, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: space2, paddingHorizontal: 10,
                backgroundColor: pressed ? lineSoft : surface2,
                borderWidth: t.pick<number>("--control-border-width", 1), borderColor: lineSoft, borderRadius: t.pick<number>("--radius-md", 8),
              }}
        >
          {avatar(current, "md")}
          {!compact && (
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ color: ink1, fontSize: sm, ...t.font("--font-body", "--weight-semi") }}>{current.name}</Text>
              {current.role ? <Text numberOfLines={1} style={roleStyle}>{current.role}</Text> : null}
            </View>
          )}
          {!compact && <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={ink3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="m7 15 5 5 5-5M7 9l5-5 5 5" /></Svg>}
        </Pressable>
      </View>
      <AnchoredLayer
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchor}
        side={compact ? "right" : "bottom"}
        label="Ambientes"
        panelStyle={[panelSurface(t), { width: 280, borderWidth: t.pick<number>("--control-border-width", 1), overflow: "hidden", boxShadow: t.pick<string>("--elev-4", "") || undefined }]}
      >
        {searchable && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: space2, paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: lineSoft }}>
            <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={ink3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Circle cx={11} cy={11} r={7} /><Line x1={21} y1={21} x2={16.65} y2={16.65} /></Svg>
            <TextInput
              autoFocus
              accessibilityLabel="Buscar ambiente"
              autoComplete="off"
              autoCorrect={false}
              placeholder="Buscar ambiente…"
              placeholderTextColor={t.pick<string>("--ink-4", "--on-surface-variant")}
              value={query}
              onChangeText={setQuery}
              style={{ flex: 1, minWidth: 0, minHeight: 24, padding: 0, color: ink1, fontSize: sm, ...t.font("--font-body", "--weight-regular") }}
            />
          </View>
        )}
        <ScrollView style={{ maxHeight: 260 }} contentContainerStyle={{ padding: 4 }} keyboardShouldPersistTaps="handled" bounces={false}>
          {filtered.length === 0 ? (
            <Text style={{ padding: 16, textAlign: "center", color: ink3, fontSize: t.pick<number>("--text-xs", 12), ...t.font("--font-body", "--weight-regular") }}>Nenhum ambiente</Text>
          ) : filtered.map((workspace) => {
            const isCurrent = workspace.id === currentId;
            return (
              <Pressable
                key={workspace.id}
                role="option"
                accessibilityLabel={[workspace.name, workspace.role].filter(Boolean).join(", ")}
                accessibilityState={{ selected: isCurrent }}
                onPress={() => choose(workspace)}
                style={({ pressed }) => ({ minHeight: 44, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: space2, paddingHorizontal: 10, borderRadius: t.pick<number>("--radius-md", 8), backgroundColor: pressed ? surface2 : "transparent" })}
              >
                {avatar(workspace, "sm")}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ color: ink1, fontSize: sm, ...t.font("--font-body", "--weight-medium") }}>{workspace.name}</Text>
                  {workspace.role ? <Text numberOfLines={1} style={roleStyle}>{workspace.role}</Text> : null}
                </View>
                {isCurrent && <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={t.pick<string>("--primary-ink", "--primary")} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><Polyline points="20 6 9 17 4 12" /></Svg>}
              </Pressable>
            );
          })}
        </ScrollView>
      </AnchoredLayer>
    </View>
  );
}
