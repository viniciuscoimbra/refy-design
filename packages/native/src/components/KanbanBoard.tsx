import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import type { KanbanBoardCoreProps, KanbanCardItem, KanbanColumnItem, MenuEntry } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import type { RefyContext } from "../theme";
import { useIconStyle } from "../icon";
import { renderText } from "../primitives";
import { Badge } from "./Badge";
import { IconButton } from "./IconButton";
import { KanbanCard } from "./KanbanCard";
import { Menu } from "./Menu";
import { Modal } from "./Modal";

export type { KanbanColumnItem };
export interface KanbanBoardProps extends KanbanBoardCoreProps {
  style?: StyleProp<ViewStyle>;
}

const name = (value: React.ReactNode, fallback: string) => (typeof value === "string" ? value : fallback);

/** Motivo de bloqueio da mudança de etapa (transição proibida ou WIP cheio), igual à web. */
export function kanbanBlocked(columns: KanbanColumnItem[], from: string, to: string, wipLimit?: number, allowed?: Record<string, readonly string[]>) {
  if (from === to) return undefined;
  const destination = columns.find((c) => c.id === to);
  if (!destination) return "Etapa indisponível.";
  if (allowed?.[from] && !allowed[from].includes(to)) return "Transição não permitida a partir desta etapa.";
  const limit = destination.wipLimit ?? wipLimit;
  if (limit !== undefined && destination.items.length >= limit) return `Limite WIP de ${limit} atingido.`;
  return undefined;
}

/** Move o card antes de `beforeId` (ou para o fim) e devolve as colunas novas. */
export function kanbanMove(columns: KanbanColumnItem[], id: string, from: string, to: string, beforeId?: string) {
  const item = columns.find((c) => c.id === from)?.items.find((card) => card.id === id);
  if (!item || beforeId === id) return columns;
  const next = columns.map((c) => ({ ...c, items: c.items.filter((card) => card.id !== id) }));
  const target = next.find((c) => c.id === to);
  if (!target) return columns;
  const index = beforeId ? target.items.findIndex((card) => card.id === beforeId) : -1;
  target.items.splice(index < 0 ? target.items.length : index, 0, item);
  return next;
}

/** Cor da etapa: token (`--info`, `var(--info)`) ou cor pronta. */
function laneColor(t: RefyContext, color?: string) {
  if (!color) return t.pick<string>("--outline", "--line");
  const token = color.match(/^var\((--[\w-]+)\)$/)?.[1] ?? (color.startsWith("--") ? color : undefined);
  return token ? t.pick<string>(token, "--outline", "--line") : color;
}

function Dots() {
  const { size, color } = useIconStyle();
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}><Circle cx={5} cy={12} r={1.5} /><Circle cx={12} cy={12} r={1.5} /><Circle cx={19} cy={12} r={1.5} /></Svg>;
}
function Plus() {
  const { size, color } = useIconStyle();
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}><Path d="M12 5v14M5 12h14" /></Svg>;
}

/**
 * Quadro de etapas com as mesmas regras da web (WIP, transições permitidas). No toque o card
 * muda de etapa pelo menu ⋯ e pelas ações do leitor de tela; não há arrastar.
 */
export function KanbanBoard({ columns, onColumnsChange, onCardClick, wipLimit, allowedTransitions, toolbar, filter, onAddCard, columnActions, ariaLabel = "Quadro Kanban", instructions = "visible", style }: KanbanBoardProps) {
  const t = useRefy();
  const [local, setLocal] = useState({ source: columns, value: columns });
  if (local.source !== columns) setLocal({ source: columns, value: columns });
  const current = onColumnsChange ? columns : local.value;
  const [menu, setMenu] = useState<string | null>(null);
  const [opened, setOpened] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const blocked = (from: string, to: string) => kanbanBlocked(current, from, to, wipLimit, allowedTransitions);

  const move = (id: string, from: string, to: string, beforeId?: string) => {
    const item = current.find((c) => c.id === from)?.items.find((card) => card.id === id);
    const destination = current.find((c) => c.id === to);
    if (!item || !destination) return;
    const reason = blocked(from, to);
    if (reason) { setAnnouncement(reason); return; }
    const next = kanbanMove(current, id, from, to, beforeId);
    if (onColumnsChange) onColumnsChange(next); else setLocal({ source: columns, value: next });
    setMenu(null);
    setAnnouncement(`${name(item.title, "Card")} movido para ${name(destination.title, "a etapa escolhida")}.`);
  };
  const openCard = (item: KanbanCardItem, column: KanbanColumnItem) => { if (onCardClick) onCardClick(item, column); else setOpened(item.id); };

  const ink3 = t.pick<string>("--ink-3");
  const xs = t.size("--text-xs", 12);
  const sm = t.size("--text-sm", 13);
  const s = (n: string, f: number) => t.size(n, f);
  const detailColumn = current.find((c) => c.items.some((i) => i.id === opened));
  const detail = detailColumn?.items.find((i) => i.id === opened);

  return (
    <View style={style}>
      {toolbar != null && <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: s("--space-3", 12), marginBottom: s("--space-4", 16) }}>{toolbar}</View>}
      {instructions === "visible" && <Text style={{ marginBottom: s("--space-3", 12), color: ink3, fontSize: xs, lineHeight: Math.round(xs * 1.5), ...t.font("--font-body", "--weight-regular") }}>Toque em ⋯ no card para mudar de etapa ou de posição.</Text>}
      <ScrollView horizontal style={{ flexGrow: 0 }} accessibilityLabel={ariaLabel} showsHorizontalScrollIndicator contentContainerStyle={{ gap: s("--space-4", 16), padding: s("--space-1", 4), paddingBottom: s("--space-3", 12) }}>
        {current.map((column) => {
          const limit = column.wipLimit ?? wipLimit;
          const full = limit !== undefined && column.items.length >= limit;
          const color = laneColor(t, column.color);
          const entries = columnActions?.(column) ?? [];
          const visible = column.items.filter((item) => filter?.(item, column) ?? true);
          const title = name(column.title, column.id);
          return (
            <View key={column.id} style={{ width: 264, minHeight: 384, padding: s("--space-3", 12), borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: t.pick<string>("--line-soft"), borderRadius: t.pick<number>("--radius-lg", 12), backgroundColor: t.mix(color, 5, t.pick<string>("--surface-2")) }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: s("--space-2", 8), paddingBottom: s("--space-4", 16) }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, marginTop: 8, backgroundColor: color }} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View accessibilityRole="header">{renderText(column.title, { color: t.pick<string>("--ink-1"), fontSize: sm, lineHeight: Math.round(sm * 1.5), ...t.font("--font-body", "--weight-semi") })}</View>
                  {column.description != null && <View style={{ marginTop: s("--space-1", 4) }}>{renderText(column.description, { color: ink3, fontSize: xs, lineHeight: Math.round(xs * 1.5), ...t.font("--font-body", "--weight-regular") })}</View>}
                </View>
                <View accessible accessibilityLabel={`${column.items.length} cards${limit === undefined ? "" : `, limite WIP ${limit}`}`}>
                  <Badge tone={full ? "warn" : "neutral"}>{`${column.items.length}${limit === undefined ? "" : ` / ${limit}`}`}</Badge>
                </View>
                {entries.length > 0 && (
                  <Menu open={menu === `lane:${column.id}`} onOpenChange={(o) => setMenu(o ? `lane:${column.id}` : null)} ariaLabel="Ações da etapa" align="end" entries={entries}>
                    <IconButton size="sm" accessibilityLabel={`Ações da etapa ${title}`} icon={<Dots />} onPress={() => setMenu(`lane:${column.id}`)} />
                  </Menu>
                )}
                {onAddCard && <IconButton size="sm" accessibilityLabel={`Adicionar card em ${title}`} accessibilityHint={full ? `Limite WIP de ${limit} atingido.` : undefined} disabled={full} icon={<Plus />} onPress={() => onAddCard(column)} />}
              </View>
              <View style={{ gap: s("--space-3", 12) }}>
                {visible.map((item) => {
                  const targets = current.filter((c) => c.id !== column.id);
                  const entries: MenuEntry[] = [
                    { id: "open", label: "Abrir detalhes", onSelect: () => openCard(item, column) },
                    { type: "separator" },
                    ...targets.map((target) => ({ id: `column:${target.id}`, label: `Mover para ${name(target.title, target.id)}`, meta: blocked(column.id, target.id) ? "bloqueado" : undefined, disabled: !!blocked(column.id, target.id), onSelect: () => move(item.id, column.id, target.id) })),
                    { type: "separator" },
                    { id: "reorder:first", label: "Mover para o início desta etapa", disabled: column.items[0]?.id === item.id, onSelect: () => move(item.id, column.id, column.id, column.items[0]?.id) },
                    { id: "reorder:last", label: "Mover para o fim desta etapa", disabled: column.items[column.items.length - 1]?.id === item.id, onSelect: () => move(item.id, column.id, column.id) },
                  ];
                  const allowedTargets = targets.filter((target) => !blocked(column.id, target.id));
                  return (
                    <KanbanCard
                      key={item.id}
                      item={item}
                      onOpen={() => openCard(item, column)}
                      accessibilityActions={allowedTargets.map((target) => ({ name: `move:${target.id}`, label: `Mover para ${name(target.title, target.id)}` }))}
                      onAccessibilityAction={(e) => { const id = e.nativeEvent.actionName.replace(/^move:/, ""); move(item.id, column.id, id); }}
                      actions={
                        <Menu open={menu === item.id} onOpenChange={(o) => setMenu(o ? item.id : null)} ariaLabel="Ações do card" align="end" entries={entries}>
                          <IconButton size="sm" accessibilityLabel={`Ações de ${name(item.title, item.id)}`} icon={<Dots />} onPress={() => setMenu(item.id)} />
                        </Menu>
                      }
                    />
                  );
                })}
                {!visible.length && <Text style={{ padding: s("--space-3", 12), color: ink3, fontSize: xs, lineHeight: Math.round(xs * 1.5), ...t.font("--font-body", "--weight-regular") }}>{column.items.length ? "Nenhum card para este filtro." : "Nenhum card nesta etapa."}</Text>}
              </View>
            </View>
          );
        })}
      </ScrollView>
      <Text accessibilityLiveRegion="polite" role="status" style={{ minHeight: Math.round(xs * 1.5), marginTop: s("--space-2", 8), color: t.pick<string>("--ink-2"), fontSize: xs, ...t.font("--font-body", "--weight-regular") }}>{announcement}</Text>
      <Modal open={!!detail} onClose={() => setOpened(null)} title={detail?.title}>
        {detail ? (
          <View style={{ alignItems: "flex-start", gap: s("--space-4", 16) }}>
            <Badge tone="neutral">{detailColumn?.title}</Badge>
            {renderText(detail.description || "Sem descrição.", { color: t.pick<string>("--ink-1"), fontSize: sm, ...t.font("--font-body", "--weight-regular") })}
            {detail.meta != null && <View>{renderText(detail.meta, { color: t.pick<string>("--ink-1"), fontSize: sm, ...t.font("--font-body", "--weight-regular") })}</View>}
            {detail.footer != null && <View>{detail.footer}</View>}
          </View>
        ) : null}
      </Modal>
    </View>
  );
}
