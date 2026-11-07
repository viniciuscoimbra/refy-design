import { useId, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import type { IntentComposerCoreProps, IntentComposerState, IntentFilterGroup, IntentFilterOption } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useIconStyle } from "../icon";
import { renderText } from "../primitives";
import { Button } from "./Button";
import { Callout } from "./Callout";
import { Chip } from "./Chip";
import { IconButton } from "./IconButton";
import { Multiselect } from "./Multiselect";
import { ProgressBar } from "./ProgressBar";
import { Segmented } from "./Segmented";
import { Textarea } from "./Textarea";
import { VoiceRecorder } from "./VoiceRecorder";
import type { VoiceRecorderProps } from "./VoiceRecorder";

export type { IntentComposerState, IntentFilterGroup, IntentFilterOption };
export interface IntentComposerProps extends IntentComposerCoreProps {
  voiceRecorderProps?: VoiceRecorderProps;
  style?: StyleProp<ViewStyle>;
}

/** Próximo valor dos filtros ao tocar numa opção: troca no `single`, liga ou desliga no `multiple`. */
export function nextIntentFilters(values: Record<string, string[]>, group: IntentFilterGroup, option: string) {
  const current = values[group.id] ?? [];
  return { ...values, [group.id]: group.mode === "single" ? [option] : current.includes(option) ? current.filter((item) => item !== option) : [...current, option] };
}

function Mic() {
  const { size, color } = useIconStyle();
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Rect x={9} y={2} width={6} height={12} rx={3} /><Path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" /></Svg>;
}

/** Uma superfície para contextualizar, escrever e enviar um pedido: filtros, texto, voz, estados e ações. */
export function IntentComposer({
  state = "idle", filters = [], filterValues, defaultFilterValues = {}, onFilterValuesChange, value, defaultValue = "", onChange,
  label = "Conte o que você procura", placeholder = "Ex.: organize uma coleção de referências e documentos para compartilhar com minha equipe…",
  examples = [], submitLabel = "Continuar", understoodSummary,
  errorMessage = "Não conseguimos interpretar uma parte do pedido. Ajuste o texto e tente novamente.",
  onSubmit, onVoiceStart, onEditRequest, onEditDetails, voiceRecorderProps, leadingActions, submitIcon,
  voiceButtonVariant = "ghost", actionSize = "md", showVoiceControl = true, processingContent, style,
}: IntentComposerProps) {
  const fadeId = `intent-fade-${useId().replace(/:/g, "")}`;
  const t = useRefy();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalFilters, setInternalFilters] = useState(defaultFilterValues);
  const [focused, setFocused] = useState(false);
  const text = value ?? internalValue;
  const selections = filterValues ?? internalFilters;
  const readOnly = state === "processing" || state === "understood";
  const changeText = (next: string) => { if (value === undefined) setInternalValue(next); onChange?.(next); };
  const changeFilters = (next: Record<string, string[]>) => { if (filterValues === undefined) setInternalFilters(next); onFilterValuesChange?.(next); };

  const s = (name: string, fallback: number) => t.size(name, fallback);
  const lineSoft = t.pick<string>("--line-soft");
  const ink1 = t.pick<string>("--ink-1"), ink3 = t.pick<string>("--ink-3");
  const xs = t.pick<number>("--text-xs", 12), sm = t.pick<number>("--text-sm", 14);
  const primary = t.pick<string>("--primary");
  const borderColor = state === "error" ? t.pick<string>("--critical", "--danger") : focused ? primary : t.pick<string>("--line");
  const shadow = t.pick<string>("--composer-shadow", "--elev-1", "");
  const focusShadow = t.pick<string>("--composer-focus-shadow", `0 0 0 3px ${t.mix(primary, 12, "transparent")}`);

  return (
    <View
      accessibilityLabel="Compositor do pedido"
      style={[{
        overflow: "hidden",
        borderWidth: t.pick<number>("--composer-border-width", 1),
        borderColor,
        borderRadius: t.pick<number>("--radius-xl-token", "--radius-lg", 12),
        backgroundColor: t.pick<string>("--surface"),
        boxShadow: [focused ? focusShadow : "", shadow].filter(Boolean).join(", ") || undefined,
      }, style]}
    >
      {filters.length > 0 && (
        <View accessibilityLabel="Filtros iniciais" style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: s("--space-3", 12), padding: s("--space-4", 16), borderBottomWidth: 1, borderBottomColor: lineSoft, backgroundColor: t.pick<string>("--surface-2") }}>
          {filters.map((group) => {
            const selected = selections[group.id] ?? [];
            return (
              <View key={group.id} style={{ flexGrow: group.mode === "single" ? 0 : 1, flexBasis: group.mode === "single" ? "auto" : 180, maxWidth: "100%", minWidth: 0, gap: s("--space-2", 8) }}>
                <Text style={{ color: ink3, fontSize: t.pick<number>("--text-eyebrow", "--text-xs", 11), letterSpacing: 1, textTransform: "uppercase", ...t.font(["--interface-detail-font", "--font-mono"], "--weight-medium") }}>{group.label}</Text>
                {group.mode === "single" ? (
                  <Segmented sliding label={group.label} options={group.options} value={selected[0] ?? group.options[0]?.value} disabled={readOnly} onChange={(next) => changeFilters(nextIntentFilters(selections, group, next))} />
                ) : (
                  <Multiselect accessibilityLabel={group.label} options={group.options} value={selected} listPlacement="overlay" placeholder={`Selecionar ${group.label.toLowerCase()}…`} disabled={readOnly} onChange={(next) => changeFilters({ ...selections, [group.id]: next })} />
                )}
              </View>
            );
          })}
        </View>
      )}
      <View style={{ paddingHorizontal: s("--space-4", 16), paddingTop: s("--space-4", 16) }}>
        <Textarea
          label={label}
          value={text}
          placeholder={placeholder}
          rows={5}
          editable={!readOnly}
          aria-busy={state === "processing" || undefined}
          onChangeText={changeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ minHeight: t.pick<number>("--composer-input-min-height", 126), paddingVertical: 0, paddingHorizontal: 0, borderWidth: 0, borderRadius: 0, backgroundColor: "transparent", boxShadow: undefined }}
        />
      </View>
      {state === "listening" && (
        <View style={{ paddingHorizontal: s("--space-4", 16), paddingBottom: s("--space-4", 16) }}>
          <VoiceRecorder state={voiceRecorderProps?.state ?? "listening"} transcript={text || undefined} {...voiceRecorderProps} />
        </View>
      )}
      {state === "understood" && understoodSummary ? (
        <View style={{ marginHorizontal: s("--space-4", 16), marginVertical: s("--space-3", 12) }}>
          <Callout tone="info" title="Entendi assim" action={<Button size="sm" variant="secondary" onPress={onEditDetails}>Revisar detalhes</Button>}>{understoodSummary}</Callout>
        </View>
      ) : null}
      {state === "error" && (
        <View style={{ marginHorizontal: s("--space-4", 16), marginVertical: s("--space-3", 12) }}>
          <Callout tone="danger" title="Precisamos de um pouco mais de contexto">{errorMessage}</Callout>
        </View>
      )}
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: s("--space-3", 12), minHeight: t.pick<number>("--composer-toolbar-height", 56), paddingVertical: s("--space-2", 8), paddingHorizontal: s("--space-3", 12), borderTopWidth: t.pick<number>("--composer-divider-width", 1), borderTopColor: lineSoft, backgroundColor: t.pick<string>("--surface") }}>
        {leadingActions != null && <View style={{ flexDirection: "row", alignItems: "center", gap: s("--space-2", 8) }}>{leadingActions}</View>}
        <View style={{ flex: 1, minWidth: 0 }}>
          <ScrollView horizontal accessibilityLabel="Exemplos de pedido" showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ alignItems: "center", gap: s("--space-2", 8), paddingVertical: 4, paddingRight: 24 }}>
            {examples.map((example) => <Chip key={example} disabled={readOnly} onPress={() => changeText(example)}>{example}</Chip>)}
          </ScrollView>
          {/* Esmaece a borda direita: o chip cortado pela rolagem lê como "tem mais", não como defeito. */}
          <Svg pointerEvents="none" width={28} height="100%" style={{ position: "absolute", right: 0, top: 0, bottom: 0 }}>
            <Defs><LinearGradient id={fadeId} x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor={t.pick<string>("--surface")} stopOpacity={0} /><Stop offset="1" stopColor={t.pick<string>("--surface")} stopOpacity={1} /></LinearGradient></Defs>
            <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${fadeId})`} />
          </Svg>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: s("--space-2", 8) }}>
          {showVoiceControl && state !== "listening" && <IconButton accessibilityLabel="Descrever por voz" variant={voiceButtonVariant} size={actionSize} icon={<Mic />} disabled={readOnly} onPress={onVoiceStart} />}
          {submitIcon ? (
            <IconButton accessibilityLabel={submitLabel} icon={submitIcon} size={actionSize} variant="outline" disabled={!text.trim() || readOnly} onPress={onSubmit} />
          ) : (
            <Button size="sm" variant="primary" status={state === "processing" ? "loading" : "idle"} loadingLabel="Entendendo…" disabled={!text.trim() || state === "understood"} onPress={onSubmit}>{submitLabel}</Button>
          )}
        </View>
      </View>
      {state === "processing" && (
        <View accessibilityLiveRegion="polite" style={{ gap: s("--space-3", 12), paddingTop: s("--space-3", 12), paddingHorizontal: s("--space-4", 16), paddingBottom: s("--space-4", 16), borderTopWidth: 1, borderTopColor: lineSoft, backgroundColor: t.pick<string>("--surface-2") }}>
          {processingContent != null ? renderText(processingContent, { color: ink1, fontSize: sm }) : (
            <>
              <View style={{ gap: 2 }}>
                <Text style={{ color: ink1, fontSize: sm, ...t.font("--font-body", "--weight-semi") }}>Organizando o que você contou</Text>
                <Text style={{ color: ink3, fontSize: xs, ...t.font("--font-body", "--weight-regular") }}>Estamos transformando o texto em critérios que você poderá revisar.</Text>
              </View>
              <Button size="sm" variant="ghost" onPress={onEditRequest} style={{ alignSelf: "flex-end" }}>Quero editar</Button>
              <ProgressBar indeterminate size="sm" accessibilityLabel="Processando o pedido" />
            </>
          )}
        </View>
      )}
    </View>
  );
}
