import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import type { VisitAvailability, VisitSchedulePickerCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { Badge } from "./Badge";
import { Calendar } from "./Calendar";
import { ChoiceCard, ChoiceCardGroup } from "./ChoiceCard";
import { ToggleGroup } from "./ToggleGroup";

export type { VisitAvailability };
export interface VisitSchedulePickerProps extends VisitSchedulePickerCoreProps {
  style?: StyleProp<ViewStyle>;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function fromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}
const toMinutes = (value: string) => { const [h, m] = value.split(":").map(Number); return h * 60 + m; };
const formatMinutes = (minutes: number) => {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0"), m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
};

/** Junta horários de 30 em 30 minutos em faixas ("09h–10h30"), igual à web. */
export function groupVisitTimes(times: string[]) {
  const values = Array.from(new Set(times.map(toMinutes))).sort((a, b) => a - b);
  if (!values.length) return [];
  const groups: { start: number; end: number }[] = [];
  let start = values[0], previous = values[0];
  for (const value of values.slice(1)) {
    if (value === previous + 30) previous = value;
    else { groups.push({ start, end: previous + 30 }); start = previous = value; }
  }
  groups.push({ start, end: previous + 30 });
  return groups.map((g) => `${formatMinutes(g.start)}–${formatMinutes(g.end)}`);
}

const allTimes = Array.from({ length: 23 }, (_, i) => {
  const minutes = 8 * 60 + i * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});
const fmt = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("pt-BR", options);

/** Escolha de dias e horários para visita, com resumo em faixas e fuso explícito. */
export function VisitSchedulePicker({ value, defaultValue = {}, onChange, defaultActiveDate = new Date(), minDate = new Date(), maxDate, timezone = "America/Sao_Paulo", unavailable = {}, disabled = false, style }: VisitSchedulePickerProps) {
  const t = useRefy();
  const initialKey = dateKey(defaultActiveDate);
  const [internal, setInternal] = useState<VisitAvailability>(() => ({ [initialKey]: [], ...defaultValue }));
  const [activeKey, setActiveKey] = useState(() => Object.keys(defaultValue)[0] ?? initialKey);
  const current = value ?? internal;
  const selectedDays = useMemo(() => Object.keys(current).sort(), [current]);
  const commit = (next: VisitAvailability) => { if (value === undefined) setInternal(next); onChange?.(next); };
  const chosenCount = selectedDays.filter((key) => current[key]?.length).length;

  const s = (name: string, fallback: number) => t.size(name, fallback);
  const ink1 = t.pick<string>("--ink-1"), ink3 = t.pick<string>("--ink-3");
  const sm = t.pick<number>("--text-sm", 14);
  const h5 = t.pick<number>("--text-h5", 18);
  const panel: ViewStyle = { padding: s("--space-5", 20), borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: t.pick<string>("--line-soft"), borderRadius: t.pick<number>("--radius-lg", 12), backgroundColor: t.pick<string>("--surface") };
  const heading = (title: string, text: string, badge?: React.ReactNode) => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: s("--space-3", 12), marginBottom: s("--space-4", 16) }}>
      <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 200, gap: s("--space-1", 4) }}>
        <Text accessibilityRole="header" style={{ color: ink1, fontSize: h5, ...t.font(["--font-headline", "--font-display", "--font-body"], "--weight-semi") }}>{title}</Text>
        <Text style={{ color: ink3, fontSize: sm, lineHeight: Math.round(sm * 1.5), ...t.font("--font-body", "--weight-regular") }}>{text}</Text>
      </View>
      {badge}
    </View>
  );

  return (
    <View accessibilityLabel="Escolher disponibilidade para visita" style={[{ gap: s("--space-6", 24) }, style]}>
      <View style={[panel, disabled && { opacity: 0.55 }]} pointerEvents={disabled ? "none" : "auto"}>
        {heading("Escolha os dias", "Toque em mais de uma data para montar suas alternativas.")}
        <Calendar
          mode="single"
          value={fromKey(activeKey)}
          min={minDate}
          max={maxDate}
          onChange={(next) => {
            const key = dateKey(next as Date);
            setActiveKey(key);
            if (!(key in current)) commit({ ...current, [key]: [] });
          }}
        />
      </View>
      <View style={panel}>
        {heading("Dias selecionados", "Alterne o dia para definir horários diferentes.", <Badge tone="neutral">{`${selectedDays.length} dia${selectedDays.length === 1 ? "" : "s"}`}</Badge>)}
        <ChoiceCardGroup mode="single" value={activeKey} onChange={(next) => setActiveKey(next as string)} label="Dia que está sendo editado" columns={Math.min(2, Math.max(1, selectedDays.length))}>
          {selectedDays.map((key) => (
            <ChoiceCard key={key} disabled={disabled} value={key} title={fmt({ weekday: "short", day: "2-digit", month: "short" }).format(fromKey(key))} description={`${current[key]?.length ?? 0} horário${current[key]?.length === 1 ? "" : "s"}`} />
          ))}
        </ChoiceCardGroup>
        <View style={{ height: s("--space-5", 20) }} />
        {heading("Horários disponíveis", "Das 08h às 19h, em intervalos de 30 minutos.", <Badge tone="info">{`fuso ${timezone}`}</Badge>)}
        <ToggleGroup
          label={`Horários de ${fmt({ dateStyle: "long" }).format(fromKey(activeKey))}`}
          options={allTimes.map((time) => ({ value: time, label: time, disabled: unavailable[activeKey]?.includes(time) }))}
          value={current[activeKey] ?? []}
          onChange={(times) => commit({ ...current, [activeKey]: times })}
          disabled={disabled}
        />
      </View>
      <View style={panel}>
        {heading("Sua disponibilidade", "Selecione os intervalos disponíveis para o agendamento.", <Badge tone={chosenCount ? "success" : "neutral"}>{`${chosenCount} com horário`}</Badge>)}
        <View accessibilityLiveRegion="polite" style={{ gap: s("--space-3", 12) }}>
          {selectedDays.map((key) => {
            const ranges = groupVisitTimes(current[key] ?? []);
            return (
              <View key={key} style={{ gap: 2 }}>
                <Text style={{ color: ink1, fontSize: sm, ...t.font("--font-body", "--weight-semi") }}>{fmt({ weekday: "long", day: "2-digit", month: "short" }).format(fromKey(key))}</Text>
                <Text style={{ color: ink3, fontSize: sm, ...t.font("--font-body", "--weight-regular") }}>{ranges.length ? ranges.join(" · ") : "Escolha os horários"}</Text>
              </View>
            );
          })}
        </View>
        <Text style={{ marginTop: s("--space-4", 16), color: ink3, fontSize: t.pick<number>("--text-xs", 12), ...t.font("--font-body", "--weight-regular") }}>{`Horários exibidos em ${timezone}.`}</Text>
      </View>
    </View>
  );
}

export const SchedulePicker = VisitSchedulePicker;
export type SchedulePickerProps = VisitSchedulePickerProps;
