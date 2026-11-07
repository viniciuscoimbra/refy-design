import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, Line, Path, Polyline } from "react-native-svg";
import type { TableColumnCore, TableCoreProps, TablePagination } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { hitSlopFor, renderText } from "../primitives";
import { AnchoredLayer, panelSurface } from "../overlay";
import { Pagination } from "./Pagination";
import { Select } from "./Select";
import { Skeleton } from "./Skeleton";

export type { TablePagination };
export interface Column<Row> extends TableColumnCore<Row> {
  /** Largura fixa em pt. Sem ela, a coluna divide o espaço com as outras. */
  width?: number;
}
export interface TableProps<Row> extends TableCoreProps<Row> {
  columns: Column<Row>[];
  /** Largura mínima em pt; acima da tela, a tabela rola de lado. */
  minTableWidth?: number;
  style?: StyleProp<ViewStyle>;
}
export type SortDir = "asc" | "desc";

const defaultSearchMatch = <Row,>(row: Row, query: string) => Object.values(row as Record<string, unknown>).join(" ").toLowerCase().includes(query.toLowerCase());
const asList = (v: string | string[]) => (Array.isArray(v) ? v : [v]);
const filterValueOf = <Row,>(c: Column<Row>) => c.filterValue ?? ((row: Row) => String((row as Record<string, unknown>)[c.key] ?? ""));

/** Busca, filtros e ordem, com as mesmas regras da web (pt-BR, números naturais, nulos no fim). */
export function tableRows<Row>(rows: Row[], columns: Column<Row>[], o: { query?: string; searchMatch?: (row: Row, q: string) => boolean; filters?: Record<string, string[]>; sortKey?: string | null; sortDir?: SortDir; except?: string }) {
  let out = rows;
  const q = o.query?.trim();
  if (q) out = out.filter((row) => (o.searchMatch ?? defaultSearchMatch)(row, q));
  for (const c of columns.filter((c) => c.filterable && c.key !== o.except)) {
    const sel = o.filters?.[c.key];
    if (sel?.length) { const gv = filterValueOf(c); out = out.filter((row) => asList(gv(row)).some((v) => sel.includes(v))); }
  }
  if (o.sortKey) {
    const column = columns.find((c) => c.key === o.sortKey);
    const gv = column?.sortValue ?? ((row: Row) => (row as Record<string, unknown>)[o.sortKey!] as string | number | null);
    const f = o.sortDir === "desc" ? -1 : 1;
    out = [...out].sort((a, b) => {
      const va = gv(a), vb = gv(b);
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * f;
      return String(va).localeCompare(String(vb), "pt-BR", { numeric: true }) * f;
    });
  }
  return out;
}

/**
 * Tabela de dados com busca, filtros por coluna, ordem pelo cabeçalho (cresce, decresce,
 * original) e paginação. Com `minTableWidth` maior que a tela, a grade rola de lado.
 */
export function Table<Row>({ columns, rows, rowKey, onRowClick, rowLabel, caption, empty, searchable, searchPlaceholder = "Buscar…", searchMatch = defaultSearchMatch, loading = false, error, pagination, minTableWidth, style }: TableProps<Row>) {
  const t = useRefy();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [openFacet, setOpenFacet] = useState<string | null>(null);
  const [internalPage, setInternalPage] = useState(pagination?.defaultPage ?? 1);
  const [internalPageSize, setInternalPageSize] = useState(pagination?.pageSize ?? 1);
  const anchors = useRef<Record<string, View | null>>({});
  const facetRef = useRef<View | null>(null);
  const filterCols = columns.filter((c) => c.filterable);
  const visible = useMemo(() => tableRows(rows, columns, { query: searchable ? query : "", searchMatch, filters, sortKey, sortDir }), [rows, columns, searchable, query, searchMatch, filters, sortKey, sortDir]);
  const pageSize = pagination ? internalPageSize : Math.max(visible.length, 1);
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(Math.max(pagination?.page ?? internalPage, 1), pageCount);
  const displayed = pagination ? visible.slice((currentPage - 1) * pageSize, currentPage * pageSize) : visible;
  const changePage = (n: number) => { if (pagination?.page == null) setInternalPage(n); pagination?.onPageChange?.(n); };
  const resetPage = () => changePage(1);
  const toggleSort = (c: Column<Row>) => {
    if (!c.sortable) return;
    if (sortKey !== c.key) { setSortKey(c.key); setSortDir("asc"); } else if (sortDir === "asc") setSortDir("desc"); else setSortKey(null);
  };
  const toggleFilter = (key: string, value: string | null) => {
    setFilters((prev) => { const cur = prev[key] ?? []; return { ...prev, [key]: value === null ? [] : cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] }; });
    resetPage();
  };

  const line = t.pick<string>("--line");
  const lineSoft = t.pick<string>("--line-soft");
  const ink1 = t.pick<string>("--ink-1");
  const ink2 = t.pick<string>("--ink-2");
  const ink3 = t.pick<string>("--ink-3");
  const primary = t.pick<string>("--primary");
  const sm = t.size("--text-sm", 13);
  const eyebrow = t.size("--text-eyebrow", 11);
  const xs2 = t.size("--text-2xs", 11);
  const mono = (w: string | number) => t.font(["--interface-detail-font", "--font-mono"], w);
  const label = { fontSize: eyebrow, letterSpacing: eyebrow * 0.12, textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase", ...mono("--weight-medium") };
  const cellBox = (c: Column<Row>): ViewStyle => (c.width != null ? { width: c.width } : { flex: 1, minWidth: 0 });
  const right = (c: Column<Row>) => c.align === "right" || c.align === "num";
  const radius = t.pick<number>("--radius-lg", 12);
  const facetOpen = openFacet ? filterCols.find((c) => c.key === openFacet) : undefined;

  const facetCounts = (c: Column<Row>) => {
    const base = tableRows(rows, columns, { query: searchable ? query : "", searchMatch, filters, except: c.key });
    const gv = filterValueOf(c);
    const counts = new Map<string, number>();
    for (const row of rows) for (const v of asList(gv(row))) counts.set(v, 0);
    for (const row of base) for (const v of asList(gv(row))) counts.set(v, (counts.get(v) ?? 0) + 1);
    return counts;
  };

  const grid = (
    <View accessibilityLabel={caption} accessibilityState={{ busy: loading }} style={{ minWidth: minTableWidth ?? "100%", flexGrow: 1 }}>
      <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: line, backgroundColor: t.pick<string>("--surface-2") }}>
        {columns.map((c) => {
          const sorted = sortKey === c.key;
          const head = renderText(c.header, { ...label, color: sorted ? ink1 : ink3 });
          return (
            <View key={c.key} style={[cellBox(c), { paddingVertical: 10, paddingHorizontal: 14, alignItems: right(c) ? "flex-end" : "flex-start", justifyContent: "center" }]}>
              {c.sortable ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${typeof c.header === "string" ? c.header : c.key}${sorted ? (sortDir === "asc" ? ", ordem crescente" : ", ordem decrescente") : ""}`}
                  onPress={() => toggleSort(c)}
                  hitSlop={hitSlopFor(24)}
                  style={{ minHeight: 24, flexDirection: "row", alignItems: "center", gap: t.size("--space-1", 4) }}
                >
                  {head}
                  <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={sorted ? ink1 : ink3} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={sorted && sortDir === "desc" ? { transform: [{ rotate: "180deg" }] } : undefined}>
                    <Path d={sorted ? "m18 15-6-6-6 6" : "M8 9l4-4 4 4M8 15l4 4 4-4"} />
                  </Svg>
                </Pressable>
              ) : head}
            </View>
          );
        })}
      </View>
      {loading ? Array.from({ length: Math.min(pagination?.pageSize ?? 5, 5) }, (_, r) => (
        <View key={r} style={{ flexDirection: "row", borderBottomWidth: r === 4 ? 0 : 1, borderBottomColor: lineSoft }}>
          {columns.map((c, ci) => <View key={c.key} style={[cellBox(c), { padding: 14 }]}><Skeleton width={ci === 0 ? "72%" : ci % 2 ? "54%" : "64%"} /></View>)}
        </View>
      )) : error != null ? (
        <View accessibilityRole="alert" style={{ paddingVertical: 32, paddingHorizontal: 14, backgroundColor: t.mix(t.pick<string>("--critical"), 5, t.pick<string>("--surface")) }}>
          {renderText(error, { textAlign: "center", color: t.pick<string>("--critical"), fontSize: sm, ...t.font("--font-body", "--weight-medium") })}
        </View>
      ) : visible.length === 0 ? (
        <View style={{ paddingVertical: 40, paddingHorizontal: 14 }}>
          {renderText(query || Object.values(filters).some((v) => v.length) ? "Nada encontrado com os filtros atuais." : empty ?? "Nada por aqui ainda.", { textAlign: "center", color: ink3, fontSize: sm, ...t.font("--font-body", "--weight-regular") })}
        </View>
      ) : displayed.map((row, i) => {
        const cells = columns.map((c) => (
          <View key={c.key} style={[cellBox(c), { padding: 14, alignItems: right(c) ? "flex-end" : "flex-start", justifyContent: "center" }]}>
            {renderText(c.cell(row), c.align === "num" ? { color: ink1, fontSize: sm, fontVariant: ["tabular-nums"], ...mono("--weight-regular") } : { color: ink2, fontSize: sm, ...t.font("--font-body", "--weight-regular") })}
          </View>
        ));
        const rowStyle: ViewStyle = { flexDirection: "row", minHeight: 44, borderBottomWidth: i === displayed.length - 1 ? 0 : 1, borderBottomColor: lineSoft };
        return onRowClick ? (
          <Pressable key={rowKey(row, i)} accessibilityRole="button" accessibilityLabel={rowLabel?.(row)} onPress={() => onRowClick(row)} style={({ pressed }) => [rowStyle, pressed ? { backgroundColor: t.pick<string>("--surface-2") } : null]}>{cells}</Pressable>
        ) : <View key={rowKey(row, i)} style={rowStyle}>{cells}</View>;
      })}
    </View>
  );

  return (
    <View style={[{ minWidth: 0, maxWidth: "100%", borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: line, borderRadius: radius, backgroundColor: t.pick<string>("--surface"), overflow: "hidden" }, style]}>
      {searchable && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: t.size("--space-2", 8), paddingVertical: t.size("--space-2", 8), paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: line }}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={ink3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Circle cx={11} cy={11} r={7} /><Line x1={21} y1={21} x2={16.65} y2={16.65} /></Svg>
          <TextInput accessibilityLabel={searchPlaceholder} placeholder={searchPlaceholder} placeholderTextColor={t.pick<string>("--ink-4")} value={query} onChangeText={(v) => { setQuery(v); resetPage(); }} autoCorrect={false} style={{ flex: 1, minWidth: 0, height: 32, padding: 0, color: ink1, fontSize: sm, ...t.font("--font-body", "--weight-regular") }} />
          {query ? <Text style={{ color: ink3, fontSize: xs2, ...mono("--weight-regular") }}>{visible.length} de {rows.length}</Text> : null}
        </View>
      )}
      {filterCols.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: t.size("--space-2", 8), paddingVertical: t.size("--space-2", 8), paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: line }}>
          <Text style={{ ...label, color: ink3, marginRight: t.size("--space-1", 4) }}>Filtros</Text>
          {filterCols.map((c) => {
            const sel = filters[c.key] ?? [];
            const name = typeof c.header === "string" ? c.header : c.key;
            const active = sel.length > 0 || openFacet === c.key;
            return (
              <View key={c.key} ref={(node) => { anchors.current[c.key] = node; }} collapsable={false}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Filtrar por ${name}${sel.length ? `, ${sel.length} selecionados` : ""}`}
                  accessibilityState={{ expanded: openFacet === c.key }}
                  onPress={() => { facetRef.current = anchors.current[c.key]; setOpenFacet(openFacet === c.key ? null : c.key); }}
                  hitSlop={hitSlopFor(30)}
                  style={{ minHeight: 30, flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingLeft: 12, paddingRight: 10, borderRadius: 999, borderWidth: t.pick<number>("--surface-border-width", 1), borderStyle: active ? "solid" : "dashed", borderColor: active ? primary : t.pick<string>("--ink-4"), backgroundColor: active ? t.mix(primary, 8, "transparent") : "transparent" }}
                >
                  <Text style={{ color: active ? ink1 : ink2, fontSize: t.size("--text-xs", 12), ...t.font("--font-body", "--weight-medium") }}>{name}</Text>
                  {sel.length > 0 && <View style={{ minWidth: 16, height: 16, paddingHorizontal: 4, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: primary }}><Text style={{ color: t.pick<string>("--on-primary", "--surface"), fontSize: eyebrow, ...mono("--weight-regular") }}>{sel.length}</Text></View>}
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={ink2} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" opacity={0.6}><Polyline points="6 9 12 15 18 9" /></Svg>
                </Pressable>
              </View>
            );
          })}
          {Object.values(filters).some((v) => v.length > 0) && (
            <Pressable accessibilityRole="button" accessibilityLabel="Limpar filtros" hitSlop={hitSlopFor(24)} onPress={() => { setFilters({}); resetPage(); }} style={{ minHeight: 24, justifyContent: "center" }}>
              <Text style={{ color: t.pick<string>("--primary-ink", "--primary"), fontSize: t.size("--text-xs", 12), ...t.font("--font-body", "--weight-semi") }}>Limpar filtros</Text>
            </Pressable>
          )}
        </View>
      )}
      {minTableWidth ? <ScrollView horizontal style={{ flexGrow: 0 }} contentContainerStyle={{ flexGrow: 1 }} showsHorizontalScrollIndicator>{grid}</ScrollView> : grid}
      {pagination && !loading && error == null && visible.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: t.size("--space-3", 12), paddingVertical: t.size("--space-3", 12), paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: line }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: t.size("--space-4", 16) }}>
            <Text accessibilityLiveRegion="polite" style={{ color: ink3, fontSize: xs2, fontVariant: ["tabular-nums"], ...mono("--weight-regular") }}>{Math.min((currentPage - 1) * pageSize + 1, visible.length)}–{Math.min(currentPage * pageSize, visible.length)} de {visible.length}</Text>
            {pagination.pageSizeOptions?.length ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: t.size("--space-2", 8) }}>
                <Text style={{ color: ink3, fontSize: t.size("--text-xs", 12), ...t.font("--font-body", "--weight-regular") }}>Por página</Text>
                <Select block={false} accessibilityLabel="Registros por página" value={String(pageSize)} onValueChange={(v) => { setInternalPageSize(Number(v)); resetPage(); }} options={Array.from(new Set([pagination.pageSize, ...pagination.pageSizeOptions])).map((n) => ({ value: String(n), label: String(n) }))} />
              </View>
            ) : null}
          </View>
          <Pagination page={currentPage} pageCount={pageCount} onPageChange={changePage} />
        </View>
      )}
      <AnchoredLayer open={!!facetOpen} onClose={() => setOpenFacet(null)} anchorRef={facetRef} label={facetOpen ? `Filtrar por ${typeof facetOpen.header === "string" ? facetOpen.header : facetOpen.key}` : undefined} panelStyle={[panelSurface(t), { minWidth: 200, maxHeight: 260, padding: 4, borderRadius: t.pick<number>("--radius-xl-token", "--radius-default", 8), boxShadow: t.pick<string>("--elev-4", "") || undefined }]}>
        {facetOpen && (
          <ScrollView bounces={false}>
            {Array.from(facetCounts(facetOpen)).map(([value, count]) => {
              const on = (filters[facetOpen.key] ?? []).includes(value);
              return (
                <Pressable key={value} accessibilityRole="checkbox" accessibilityLabel={`${value}, ${count}`} accessibilityState={{ checked: on }} onPress={() => toggleFilter(facetOpen.key, value)} style={({ pressed }) => ({ minHeight: 44, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingHorizontal: 10, borderRadius: t.pick<number>("--radius-md", 8), backgroundColor: pressed ? t.pick<string>("--surface-2") : "transparent" })}>
                  <View style={{ width: 16, height: 16, borderRadius: t.pick<number>("--radius-sm", 4), borderWidth: 1.5, borderColor: on ? primary : t.pick<string>("--border"), backgroundColor: on ? primary : "transparent", alignItems: "center", justifyContent: "center" }}>
                    {on && <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={t.pick<string>("--on-primary", "--surface")} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><Polyline points="20 6 9 17 4 12" /></Svg>}
                  </View>
                  <Text style={{ flex: 1, color: ink1, fontSize: sm, ...t.font("--font-body", "--weight-regular") }}>{value}</Text>
                  <Text style={{ color: ink3, fontSize: xs2, ...mono("--weight-regular") }}>{count}</Text>
                </Pressable>
              );
            })}
            {(filters[facetOpen.key] ?? []).length > 0 && (
              <Pressable accessibilityRole="button" accessibilityLabel="Limpar" onPress={() => toggleFilter(facetOpen.key, null)} style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: 10 }}>
                <Text style={{ color: t.pick<string>("--primary-ink", "--primary"), fontSize: sm, ...t.font("--font-body", "--weight-semi") }}>Limpar</Text>
              </Pressable>
            )}
          </ScrollView>
        )}
      </AnchoredLayer>
    </View>
  );
}
