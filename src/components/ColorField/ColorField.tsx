"use client";
import { useEffect, useId, useState, useRef } from "react";
import type { CSSProperties } from "react";
import { Input } from "../Input";
import { Popover } from "../Popover";
import { Slider } from "../Slider";
import { cn } from "../../lib/cn";
import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
import { DEFAULT_HEX, hexToHsl, hslToHex, normalizeHex } from "./color";
import type { Hsl } from "./color";
import styles from "./ColorField.module.css";

export interface ColorFieldProps {
  /** Field name, shown above it and used as the accessible name of the swatch and the sliders. */
  label: string;
  /** Controlled color in hexadecimal (`#rrggbb`). */
  value?: string;
  /** Initial color (uncontrolled). Default black, #000000. */
  defaultValue?: string;
  /** Called with `#rrggbb` in lowercase whenever the color changes. */
  onChange?: (hex: string) => void;
  /** Colors offered as one-click swatches in the picker (e.g. the theme palette). */
  presets?: readonly string[];
  /** Help text below the field. */
  hint?: string;
  disabled?: boolean;
  /** Form field name. The form receives the accepted color as `#rrggbb`, never an invalid draft. */
  name?: string;
  /**
   * `field` (default): label, swatch and hexadecimal input. `swatch`: only a swatch that fills the
   * width, with the value below; `label` stays as the accessible name. For palettes in a row.
   */
  appearance?: "field" | "swatch";
  className?: string;
}

/**
 * Campo de cor do refy: amostra que abre o seletor, e o valor hexadecimal editável ao lado.
 * O seletor tem matiz, saturação e luminosidade em Sliders (teclado e leitor de tela) e,
 * opcionalmente, as cores do tema como atalhos. Sem `<input type="color">` do navegador.
 */
export function ColorField({
  label,
  value,
  defaultValue = DEFAULT_HEX,
  onChange,
  presets,
  hint,
  disabled = false,
  name,
  className,
  appearance = "field",
}: ColorFieldProps) {
  const m = useComponentMessages("colorField", enMessages.colorField);
  const [internal, setInternal] = useState(() => normalizeHex(defaultValue) ?? DEFAULT_HEX);
  const current = (value !== undefined ? normalizeHex(value) : null) ?? (value !== undefined ? DEFAULT_HEX : internal);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(current);
  // O texto só é aplicado (Enter, saída do campo) se a pessoa o editou. Texto que o próprio campo
  // repôs (valor novo, cor recusada) não é escolha dela: sair do campo não pode reaplicá-lo.
  const edited = useRef(false);
  const [error, setError] = useState<string | undefined>();
  // O HSL fica no estado para a matiz não sumir quando a saturação vai a zero.
  const [hsl, setHsl] = useState<Hsl>(() => hexToHsl(current));
  const inputId = useId();

  useEffect(() => {
    edited.current = false;
    setText(current);
    setError(undefined);
    if (hslToHex(hsl) !== current) setHsl(hexToHsl(current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // Os sliders mostram o HSL guardado enquanto ele corresponde ao valor; se o app recusar a cor
  // (value não muda), mostram o value. O HSL não é descartado: o app pode aplicar a cor só no
  // render seguinte (estado atualizado por efeito), e a matiz precisa sobreviver a esse atraso.
  const shown = hslToHex(hsl) === current ? hsl : hexToHsl(current);

  // Controlado: se o app não aceitar a cor (value não muda), o texto volta ao value.
  const pending = useRef<string | null>(null);
  useEffect(() => {
    if (pending.current === null) return;
    const attempted = pending.current;
    pending.current = null;
    if (value !== undefined && attempted !== current) {
      edited.current = false;
      setText(current);
    }
  });

  function commit(hex: string) {
    if (hex === current) return;
    if (value === undefined) setInternal(hex);
    else pending.current = hex;
    onChange?.(hex);
  }
  function fromHsl(next: Hsl) {
    setHsl(next);
    commit(hslToHex(next));
  }
  function fromText(raw: string) {
    const hex = normalizeHex(raw);
    if (!hex) {
      setError(m.invalid);
      return;
    }
    setError(undefined);
    edited.current = false;
    setText(hex);
    setHsl(hexToHsl(hex));
    commit(hex);
  }

  const picker = (
    <div className={styles.picker}>
      <div className={styles.preview} style={{ "--color-field-value": current } as CSSProperties} aria-hidden="true" />
      <Slider label={m.hue} min={0} max={360} value={shown.h} formatValue={(v) => `${v}°`} onChange={(h) => fromHsl({ ...shown, h })} disabled={disabled} />
      <Slider label={m.saturation} min={0} max={100} value={shown.s} formatValue={(v) => `${v}%`} onChange={(s) => fromHsl({ ...shown, s })} disabled={disabled} />
      <Slider label={m.lightness} min={0} max={100} value={shown.l} formatValue={(v) => `${v}%`} onChange={(l) => fromHsl({ ...shown, l })} disabled={disabled} />
      {presets && presets.length > 0 && (
        <div className={styles.presets} role="group" aria-label={m.presets}>
          {presets.map((preset) => {
            const hex = normalizeHex(preset);
            if (!hex) return null;
            return (
              <button
                key={hex}
                type="button"
                className={styles.preset}
                style={{ "--color-field-value": hex } as CSSProperties}
                aria-label={hex.toUpperCase()}
                aria-pressed={hex === current}
                disabled={disabled}
                onClick={() => fromText(hex)}
              />
            );
          })}
        </div>
      )}
    </div>
  );

  const trigger = (large: boolean) => (
    <Popover open={open && !disabled} onOpenChange={setOpen} content={picker} label={m.picker(label)}>
      <button
        type="button"
        className={large ? styles.swatchLarge : styles.swatch}
        style={{ "--color-field-value": current } as CSSProperties}
        aria-label={m.open(label, current.toUpperCase())}
        aria-haspopup="dialog"
        aria-expanded={open && !disabled}
        disabled={disabled}
        onClick={() => setOpen(!open)}
      />
    </Popover>
  );

  // O formulário recebe só a cor aceita, nunca o rascunho digitado.
  const hidden = name ? <input type="hidden" name={name} value={current} disabled={disabled} /> : null;

  if (appearance === "swatch")
    return (
      <div className={cn(styles.root, styles.swatchRoot, className)}>
        {trigger(true)}
        <small className={styles.caption}>{current.toUpperCase()}</small>
        {hidden}
      </div>
    );

  return (
    <div className={cn(styles.root, className)}>
      <Input
        id={inputId}
        label={label}
        hint={hint}
        error={error}
        disabled={disabled}
        spellCheck={false}
        autoComplete="off"
        className={styles.hex}
        value={text}
        aria-label={`${label} ${m.hex}`}
        onChange={(event) => {
          edited.current = true;
          setText(event.target.value);
        }}
        onBlur={(event) => {
          if (edited.current) fromText(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (edited.current) fromText(event.currentTarget.value);
          }
        }}
        prefix={trigger(false)}
      />
      {hidden}
    </div>
  );
}
