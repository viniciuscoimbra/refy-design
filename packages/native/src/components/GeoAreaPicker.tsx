import { useMemo, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { GeoAreaPickerCoreProps, GeoNeighborhood } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { renderText } from "../primitives";
import { Callout } from "./Callout";
import { Chip } from "./Chip";
import { Multiselect } from "./Multiselect";
import { Range } from "./Range";
import { SettingRow, SettingRowGroup } from "./SettingRow";

export type { GeoNeighborhood };
export interface GeoAreaPickerProps extends GeoAreaPickerCoreProps {
  style?: StyleProp<ViewStyle>;
}

const km = (value: number) => `${value.toLocaleString("pt-BR")} km`;

/** Bairros no raio, incluídos e de fora, pelas mesmas regras da web (o principal sempre entra). */
export function geoAreaLists(neighborhoods: GeoNeighborhood[], baseId: string, radius: number, includedIds: string[]) {
  const reached = neighborhoods.filter((item) => item.id === baseId || item.distance <= radius);
  const extras = reached.filter((item) => item.id !== baseId);
  return {
    extras,
    included: reached.filter((item) => item.id === baseId || includedIds.includes(item.id)),
    excluded: extras.filter((item) => !includedIds.includes(item.id)),
  };
}

/**
 * Seleção geográfica que se resolve inteira por texto. O mapa é um espaço do app (`map`);
 * raio, bairros alcançados e inclusão explícita ficam aqui.
 */
export function GeoAreaPicker({ neighborhoods, baseId, radius, defaultRadius = 2, minRadius = 0.5, maxRadius = 5, radiusStep = 0.5, onRadiusChange, includedIds, defaultIncludedIds = [], onIncludedIdsChange, map, mapLabel = "Mapa da área de busca", error, style }: GeoAreaPickerProps) {
  const t = useRefy();
  const { width } = useWindowDimensions();
  const [internalRadius, setInternalRadius] = useState(defaultRadius);
  const [internalIncluded, setInternalIncluded] = useState(defaultIncludedIds);
  const currentRadius = radius ?? internalRadius;
  const currentIncluded = includedIds ?? internalIncluded;
  const base = neighborhoods.find((item) => item.id === baseId);
  const { extras, included, excluded } = useMemo(() => geoAreaLists(neighborhoods, baseId, currentRadius, currentIncluded), [neighborhoods, baseId, currentRadius, currentIncluded]);
  const setRadius = (next: number) => { if (radius === undefined) setInternalRadius(next); onRadiusChange?.(next); };
  const setIncluded = (next: string[]) => {
    const unique = Array.from(new Set(next.filter((id) => id !== baseId)));
    if (includedIds === undefined) setInternalIncluded(unique);
    onIncludedIdsChange?.(unique);
  };
  const toggle = (id: string) => setIncluded(currentIncluded.includes(id) ? currentIncluded.filter((item) => item !== id) : [...currentIncluded, id]);

  const s = (name: string, fallback: number) => t.size(name, fallback);
  const ink1 = t.pick<string>("--ink-1"), ink2 = t.pick<string>("--ink-2"), ink3 = t.pick<string>("--ink-3");
  const xs = t.pick<number>("--text-xs", 12), sm = t.pick<number>("--text-sm", 14), md = t.pick<number>("--text-md", 16);
  const radiusXl = t.pick<number>("--radius-xl-token", "--radius-lg", 12);
  const border = t.pick<number>("--surface-border-width", 1);
  const line = t.pick<string>("--line");
  const card: ViewStyle = { padding: s("--space-4", 16), borderWidth: border, borderColor: line, borderRadius: radiusXl, backgroundColor: t.pick<string>("--surface") };
  const wide = width > 760;
  const disabled = Boolean(error);

  const listHeader = (title: string, text: string, count: number) => (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: s("--space-3", 12), paddingBottom: s("--space-2", 8), borderBottomWidth: 1, borderBottomColor: t.pick<string>("--line-soft") }}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text accessibilityRole="header" style={{ color: ink1, fontSize: md, ...t.font(["--font-display", "--font-body"], "--weight-semi") }}>{title}</Text>
        <Text style={{ marginTop: 3, color: ink3, fontSize: xs, lineHeight: Math.round(xs * 1.5), ...t.font("--font-body", "--weight-regular") }}>{text}</Text>
      </View>
      <View style={{ minWidth: 26, height: 26, paddingHorizontal: 6, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: t.pick<string>("--surface-2") }}>
        <Text style={{ color: ink2, fontSize: xs, ...t.font(["--interface-detail-font", "--font-mono"], "--weight-regular") }}>{count}</Text>
      </View>
    </View>
  );

  return (
    <View accessibilityLabel="Seleção da área de busca" style={[{ gap: s("--space-4", 16) }, style]}>
      {error ? <Callout tone="danger" title="Não foi possível atualizar o mapa">{error}</Callout> : null}
      <View style={{ flexDirection: wide ? "row" : "column", gap: s("--space-4", 16) }}>
        <View accessibilityLabel={mapLabel} style={{ flex: wide ? 1.3 : undefined, minHeight: wide ? 300 : 240, overflow: "hidden", borderWidth: border, borderColor: line, borderRadius: radiusXl, backgroundColor: t.pick<string>("--surface-2") }}>
          {map ?? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: s("--space-2", 8), padding: s("--space-6", 24) }}>
              <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={ink3} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><Path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" /><Path d="M9 3v15M15 6v15" /></Svg>
              <Text style={{ color: ink1, fontSize: sm, ...t.font("--font-body", "--weight-semi") }}>Mapa indisponível</Text>
              <Text style={{ maxWidth: 260, textAlign: "center", color: ink3, fontSize: xs, lineHeight: Math.round(xs * 1.5), ...t.font("--font-body", "--weight-regular") }}>{`Você pode concluir toda a seleção pelas listas ${wide ? "ao lado" : "abaixo"}.`}</Text>
            </View>
          )}
        </View>
        <View style={[card, { flex: wide ? 0.7 : undefined, gap: s("--space-4", 16) }]}>
          <Range label={`Entorno de ${base?.label ?? "área principal"}`} min={0} max={maxRadius} step={radiusStep} value={[0, currentRadius]} fixedMinimum disabled={disabled} formatValue={km} ticks={["0", `${maxRadius / 2} km`, `${maxRadius} km`]} onChange={([, next]) => setRadius(Math.max(minRadius, next))} />
          <Multiselect label="Bairros próximos incluídos" placeholder="Adicionar bairro alcançado…" options={extras.map((item) => ({ value: item.id, label: item.label }))} value={currentIncluded.filter((id) => extras.some((item) => item.id === id))} maxVisibleChips={2} disabled={disabled} onChange={setIncluded} hint={`${extras.length} bairro${extras.length === 1 ? "" : "s"} no raio atual`} />
          <View style={{ padding: s("--space-3", 12), borderLeftWidth: 2, borderLeftColor: t.pick<string>("--primary"), backgroundColor: t.pick<string>("--surface-2") }}>
            {renderText("O raio só sugere vizinhos. Apenas os bairros em “Na sua busca” entram no ranking.", { color: ink2, fontSize: xs, lineHeight: Math.round(xs * 1.5), ...t.font("--font-body", "--weight-regular") })}
          </View>
        </View>
      </View>
      <View style={{ flexDirection: wide ? "row" : "column", gap: s("--space-4", 16) }}>
        <View style={[card, { flex: wide ? 1 : undefined }]}>
          {listHeader("Na sua busca", "A busca considera somente as regiões selecionadas.", included.length)}
          <SettingRowGroup aria-label="Bairros incluídos">
            {included.map((item) => (
              <SettingRow key={item.id} title={item.label} showChevron={false}
                description={item.id === baseId ? "Bairro principal" : `${km(item.distance)} do bairro principal`}
                actions={<Chip accessibilityLabel={item.id === baseId ? `${item.label} é o bairro principal` : `Remover ${item.label} da busca`} selected showCheck disabled={disabled || item.id === baseId} onPress={() => toggle(item.id)}>{item.id === baseId ? "Principal" : "Incluído"}</Chip>} />
            ))}
          </SettingRowGroup>
        </View>
        <View style={[card, { flex: wide ? 1 : undefined }]}>
          {listHeader("Fora da busca", "Estão no raio, mas não serão usados no ranking.", excluded.length)}
          {excluded.length ? (
            <SettingRowGroup aria-label="Bairros excluídos">
              {excluded.map((item) => (
                <SettingRow key={item.id} title={item.label} showChevron={false} description={`${km(item.distance)} do bairro principal`}
                  actions={<Chip accessibilityLabel={`Incluir ${item.label} na busca`} disabled={disabled} onPress={() => toggle(item.id)}>Incluir</Chip>} />
              ))}
            </SettingRowGroup>
          ) : (
            <Text style={{ paddingVertical: s("--space-5", 20), textAlign: "center", color: ink3, fontSize: sm, ...t.font("--font-body", "--weight-regular") }}>Todos os bairros alcançados estão na busca.</Text>
          )}
        </View>
      </View>
      <Text accessibilityLiveRegion="polite" style={{ color: ink3, fontSize: xs, ...t.font("--font-body", "--weight-regular") }}>
        {`Busca em ${included.map((item) => item.label).join(", ") || "nenhum bairro"}; ${excluded.length} deixado${excluded.length === 1 ? "" : "s"} de fora.`}
      </Text>
    </View>
  );
}
