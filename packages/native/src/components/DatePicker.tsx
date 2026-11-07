import { useId, useState } from "react";
import { View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import type { DatePickerCoreProps } from "@refy-design/web/contracts";
import { Button } from "./Button";
import { Calendar } from "./Calendar";
import { FieldLabel } from "./Field";
import { Popover } from "./Popover";

export interface DatePickerProps extends DatePickerCoreProps {
  style?: StyleProp<ViewStyle>;
}

/** Campo de data: botão com a data escolhida que abre o Calendar num Popover, como na web. */
export function DatePicker({ label, value, defaultValue = null, onChange, min, max, disabled, style }: DatePickerProps) {
  const [internal, setInternal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const labelId = useId();
  const date = value === undefined ? internal : value;
  const select = (next: Date | null) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
    setOpen(false);
  };
  return (
    <View style={[{ gap: 6, alignSelf: "flex-start" }, style]}>
      <FieldLabel nativeID={labelId}>{label}</FieldLabel>
      <Popover
        open={open}
        onOpenChange={setOpen}
        label={`Calendário: ${label}`}
        content={
          <View style={{ gap: 8 }}>
            <Calendar mode="single" value={date} defaultMonth={date ?? undefined} min={min} max={max} onChange={(next) => { if (next instanceof Date) select(next); }} style={{ borderWidth: 0, padding: 0 }} />
            <Button variant="ghost" onPress={() => select(null)}>Limpar data</Button>
          </View>
        }
      >
        <Button
          disabled={disabled}
          accessibilityLabel={`${label}: ${date ? date.toLocaleDateString("pt-BR") : "nenhuma data"}`}
          accessibilityLabelledBy={labelId}
          onPress={() => setOpen(!open)}
        >
          {date ? date.toLocaleDateString("pt-BR") : "Escolher data"}
        </Button>
      </Popover>
    </View>
  );
}
