// Contrato de props do WizardStepper: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.

export interface WizardStep {
  id: string;
  label: string;
  /** Impede retorno/navegação direta para esta etapa. */
  disabled?: boolean;
}

export interface WizardStepperCoreProps {
  steps: WizardStep[];
  /** ID da etapa atual. */
  current: string;
  /** Título da jornada, anunciado junto do progresso. */
  label?: string;
  /** `auto` fica compacto por container query; as outras opções forçam o layout. */
  variant?: "auto" | "horizontal" | "compact";
  /** Por padrão só etapas concluídas e a atual podem ser abertas. */
  allowFutureNavigation?: boolean;
  onStepChange?: (id: string) => void;
  /** Ação de retorno; usa o IconButton canônico. */
  onBack?: () => void;
  backLabel?: string;
}
