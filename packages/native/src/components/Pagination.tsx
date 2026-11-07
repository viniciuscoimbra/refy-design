import { Pressable, Text, View } from "react-native";
import type { ViewProps } from "react-native";
import type { PaginationCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { hitSlopFor } from "../primitives";

export interface PaginationProps extends PaginationCoreProps, Omit<ViewProps, "children"> {}

/** Mesma sequência da web: 1 … vizinhos da atual … última. */
export function paginationPages(page: number, pageCount: number, siblingCount: number): Array<number | "…"> {
  const window = 2 * siblingCount + 5;
  if (pageCount <= window) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const start = Math.max(2, page - siblingCount);
  const end = Math.min(pageCount - 1, page + siblingCount);
  const out: Array<number | "…"> = [1];
  if (start > 2) out.push("…");
  for (let p = start; p <= end; p++) out.push(p);
  if (end < pageCount - 1) out.push("…");
  out.push(pageCount);
  return out;
}

/** Paginação numérica em mono; a página atual fica preenchida na cor da tinta. */
export function Pagination({ page, pageCount, onPageChange, siblingCount = 1, style, ...rest }: PaginationProps) {
  const t = useRefy();
  const size = t.pick<number>("--pagination-size", 32);
  const go = (p: number) => onPageChange(Math.max(1, Math.min(pageCount, p)));
  const mono = { fontSize: t.pick<number>("--text-xs", 12), ...t.font(["--interface-detail-font", "--font-mono"], "--weight-medium") };
  const button = (key: string, label: string, name: string, target: number, opts: { active?: boolean; disabled?: boolean } = {}) => (
    <Pressable
      key={key}
      accessibilityRole="button"
      accessibilityLabel={name}
      accessibilityState={{ disabled: Boolean(opts.disabled), selected: Boolean(opts.active) }}
      disabled={opts.disabled}
      hitSlop={hitSlopFor(size, size)}
      onPress={() => go(target)}
      style={({ pressed }) => ({
        minWidth: size, height: size, paddingHorizontal: t.pick<number>("--space-2", 8), alignItems: "center", justifyContent: "center",
        borderRadius: t.pick<number>("--radius-md", 8), borderWidth: t.pick<number>("--control-border-width", 1), borderColor: "transparent",
        backgroundColor: opts.active ? t.pick<string>("--ink-1", "--on-surface") : pressed ? t.mix(t.pick<string>("--ink-1"), 9, "transparent") : "transparent",
        opacity: opts.disabled ? 0.4 : 1,
      })}
    >
      <Text style={{ ...mono, color: opts.active ? t.pick<string>("--surface", "--bg") : t.pick<string>("--ink-2", "--on-surface-variant") }}>{label}</Text>
    </Pressable>
  );
  return (
    <View accessibilityRole="none" role="navigation" accessibilityLabel="Paginação" {...rest} style={[{ flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-1", 4) }, style]}>
      {button("prev", "‹", "Página anterior", page - 1, { disabled: page <= 1 })}
      {paginationPages(page, pageCount, siblingCount).map((p, i) =>
        p === "…"
          ? <Text key={`e-${i}`} accessibilityElementsHidden importantForAccessibility="no" style={{ ...mono, minWidth: size, textAlign: "center", color: t.pick<string>("--ink-3") }}>…</Text>
          : button(String(p), String(p), `Página ${p}`, p, { active: p === page }),
      )}
      {button("next", "›", "Próxima página", page + 1, { disabled: page >= pageCount })}
    </View>
  );
}
