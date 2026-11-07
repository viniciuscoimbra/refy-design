// Contrato de props do Otp: o que a web e o nativo implementam igual.

/** Props for the OTP input group. */
export interface OtpCoreProps {
  /** Quantidade de dígitos. Padrão 6. */
  length?: number;
  /** Separador "—" a cada N dígitos. */
  groupSize?: number;
  /** Código controlado. */
  value?: string;
  /** Código inicial (não-controlado). */
  defaultValue?: string;
  /** Disparado a cada digitação com o código atual. */
  onChange?: (code: string) => void;
  /** Disparado quando todos os dígitos são preenchidos. */
  onComplete?: (code: string) => void;
  /** Aceita letras além de números. */
  alphanumeric?: boolean;
  /** Rótulo acessível do grupo. */
  label?: string;
  error?: string;
  disabled?: boolean;
  /** Foca o primeiro campo ao montar. */
  autoFocus?: boolean;
}
