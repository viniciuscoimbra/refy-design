"use client";
import { useId, useRef, useState } from 'react';
import { Button } from '../Button';
import { Label } from '../Label';
import { Popover } from '../Popover';
import { Calendar } from '../Calendar';
import { useComponentMessages, useLocale } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
export interface DatePickerProps {
  label: string;
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  min?: Date;
  max?: Date;
  disabled?: boolean;
}
export function DatePicker({
  label,
  value,
  defaultValue = null,
  onChange,
  min,
  max,
  disabled,
}: DatePickerProps) {
  const m = useComponentMessages("datePicker", enMessages.datePicker);
  const locale = useLocale();
  const [internal, setInternal] = useState(defaultValue),
    [open, setOpen] = useState(false),
    ref = useRef<HTMLButtonElement>(null),
    id = useId(),
    date = value === undefined ? internal : value;
  const select = (next: Date | null) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
    setOpen(false);
    ref.current?.focus();
  };
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <Label htmlFor={id}>{label}</Label>
      <Popover
        open={open}
        onOpenChange={setOpen}
        label={m.calendar(String(label))}
        content={
          <>
            <Calendar
              mode="single"
              value={date}
              defaultMonth={date ?? undefined}
              min={min}
              max={max}
              onChange={(next) => {
                if (next instanceof Date) select(next);
              }}
            />
            <Button variant="ghost" onClick={() => select(null)}>
              {m.clear}
            </Button>
          </>
        }
      >
        <Button
          ref={ref}
          id={id}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {date ? date.toLocaleDateString(locale) : m.choose}
        </Button>
      </Popover>
    </div>
  );
}
