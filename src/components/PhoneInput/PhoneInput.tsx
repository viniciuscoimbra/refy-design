import field from "../Input/Field.module.css";
import { InputControl } from "../Input/InputControl";
import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import styles from "./PhoneInput.module.css";

import { useLocale, useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
export interface PhoneCountry {
  code: string;
  name: string;
  callingCode: string;
  flag: string;
}

export const phoneCountries: PhoneCountry[] = [
  { code: "AR", name: "Argentina", callingCode: "+54", flag: "🇦🇷" },
  { code: "BR", name: "Brasil", callingCode: "+55", flag: "🇧🇷" },
  { code: "CL", name: "Chile", callingCode: "+56", flag: "🇨🇱" },
  { code: "US", name: "Estados Unidos", callingCode: "+1", flag: "🇺🇸" },
  { code: "PY", name: "Paraguai", callingCode: "+595", flag: "🇵🇾" },
  { code: "PT", name: "Portugal", callingCode: "+351", flag: "🇵🇹" },
  { code: "UY", name: "Uruguai", callingCode: "+598", flag: "🇺🇾" },
];

export interface PhoneInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: string;
  hint?: string;
  error?: string;
  country?: string;
  countries?: PhoneCountry[];
  onCountryChange?: (country: PhoneCountry) => void;
  onChange?: InputHTMLAttributes<HTMLInputElement>["onChange"];
}

export function formatBrazilianPhone(value: string) {
  const number = value.replace(/\D/g, "").slice(0, 11);
  if (number.length <= 2) return number.replace(/^(\d+)/, "($1");
  if (number.length <= 6) return number.replace(/^(\d{2})(\d+)/, "($1) $2");
  if (number.length <= 10) return number.replace(/^(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
  return number.replace(/^(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
}

/** Telefone com país e código internacional explícitos no mesmo campo. */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  {
    label,
    hint,
    error,
    country = "BR",
    countries = phoneCountries,
    onCountryChange,
    className,
    id,
    disabled,
    onChange,
    value,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const fieldId = id ?? `${generatedId}-phone`;
  const helpId = error || hint ? `${fieldId}-help` : undefined;
  const m = useComponentMessages("phoneInput", enMessages.phoneInput);
  const locale = useLocale();
  const regionName = (item: PhoneCountry) => {
    try {
      return new Intl.DisplayNames([locale], { type: "region" }).of(item.code) ?? item.name;
    } catch {
      return item.name;
    }
  };
  const selectedCountry = countries.find((item) => item.code === country) ?? countries[0];

  return (
    <div className={cn(styles.field, className)}>
      {label && <label className={field.label} htmlFor={fieldId}>{label}</label>}
      <div data-refy-field="" className={cn(field.surface, styles.shell, error && field.error, disabled && field.disabled)}>
        <div className={styles.countryPicker}>
          <span aria-hidden="true">{selectedCountry.flag}</span>
          <span className={styles.countryCaret} aria-hidden="true">⌄</span>
          <select
            className={styles.country}
            value={country}
            disabled={disabled}
            aria-label={m.country}
            onChange={(event) => {
              const next = countries.find((item) => item.code === event.target.value);
              if (next) onCountryChange?.(next);
            }}
          >
            {countries.map((item) => (
              <option key={item.code} value={item.code}>
                {regionName(item)} · {item.callingCode}
              </option>
            ))}
          </select>
        </div>
        <InputControl
          {...rest}
          ref={ref}
          id={fieldId}
          type="tel"
          inputMode="tel"
          value={country === "BR" && typeof value === "string" ? formatBrazilianPhone(value) : value}
          maxLength={country === "BR" ? 15 : rest.maxLength}
          onChange={(event) => {
            if (country === "BR") event.currentTarget.value = formatBrazilianPhone(event.currentTarget.value);
            onChange?.(event);
          }}
          className={styles.input}
          disabled={disabled}
          aria-describedby={helpId}
          aria-invalid={error ? true : undefined}
        />
      </div>
      {(error || hint) && <p id={helpId} className={cn(styles.help, error && styles.helpError)}>{error || hint}</p>}
    </div>
  );
});
