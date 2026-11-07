// Contrato de props do OAuthButton: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.
import type { ButtonCoreProps } from "./button";

/** Provedores com rótulo e símbolo prontos. A aplicação fornece o fluxo OAuth. */
export type OAuthProvider = "google" | "facebook" | "linkedin" | "spotify" | "github" | "x" | "apple" | "microsoft";

/** Composição de Button. Não abre janelas nem armazena credenciais. */
export interface OAuthButtonCoreProps extends Omit<ButtonCoreProps, "variant" | "leadingIcon"> {
  /** Provedor identificado pelo rótulo e símbolo. A aplicação fornece o fluxo OAuth. */
  provider: OAuthProvider;
}
