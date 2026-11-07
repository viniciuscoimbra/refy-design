// Contrato de props do Slider e do Range: o que a web e o nativo implementam igual.

/** Props for the Slider control. */
export interface SliderCoreProps {
  min?: number;
  max?: number;
  /** Incremento por passo. Padrão 1. */
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Nome do controle, exibido acima da trilha. */
  label?: string;
  /** Mantém `label` como nome acessível sem exibi-lo. */
  hideLabel?: boolean;
  /** Formata o valor no mostrador e no texto lido pelo leitor de tela. */
  formatValue?: (value: number) => string;
  /** Pílula mono com o valor atual. */
  showValue?: boolean;
  /** Legendas nas extremidades da trilha. */
  ticks?: [string, string];
  /** Slider discreto: um rótulo por passo. */
  marks?: string[];
  disabled?: boolean;
}

/** Intervalo selecionado: [mínimo, máximo]. */
export type RangeValue = [number, number];

/** Props for the dual-value range slider. */
export interface RangeCoreProps {
  min?: number;
  max?: number;
  step?: number;
  value?: RangeValue;
  defaultValue?: RangeValue;
  onChange?: (value: RangeValue) => void;
  label?: string;
  formatValue?: (value: number) => string;
  /** Pílula mono "lo — hi". Padrão `true`. */
  showValue?: boolean;
  /** Fixa o mínimo e expõe só o controle do máximo. */
  fixedMinimum?: boolean;
  /** Legendas distribuídas sob a trilha. */
  ticks?: string[];
  /** Mini-distribuição acima da trilha; barras dentro do intervalo acendem. */
  histogram?: number[];
  disabled?: boolean;
}
