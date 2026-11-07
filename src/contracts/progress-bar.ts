// Contrato de props do ProgressBar: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.

export type ProgressTone = "primary" | "neutral" | "warn" | "critical";

/** Props for the ProgressBar component. */
export interface ProgressBarCoreProps {
  /** 0–100. Ignorado (e opcional) quando `indeterminate`. */
  value?: number;
  /**
   * Cor do preenchimento. `neutral` (tinta/ink) é o tom das barras de cota
   * das telas de settings — informativo, sem julgamento de estado.
   */
  tone?: ProgressTone;
  /** Altura da trilha. */
  size?: "sm" | "md";
  /**
   * Carregando sem progresso conhecido: o preenchimento desliza em loop.
   * Expõe `aria-busy` e omite `aria-valuenow`. Com `prefers-reduced-motion`
   * a animação para (trilha preenchida a meia opacidade).
   */
  indeterminate?: boolean;
}
