// Contrato de props do Input: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.
import type { ReactNode } from "react";

/** Props for the text Input field. */
export interface InputCoreProps {
  /** Rótulo mono uppercase acima do campo. */
  label?: string;
  /** Texto de apoio abaixo do campo. */
  hint?: string;
  /** Mensagem de erro (substitui hint e pinta a borda). */
  error?: string;
  /** Conteúdo fixo à esquerda (ícone ou prefixo tipo "example.com/"). */
  prefix?: ReactNode;
  /** Conteúdo fixo à direita (ícone ou sufixo). */
  suffix?: ReactNode;
  block?: boolean;
}
