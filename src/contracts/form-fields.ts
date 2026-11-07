// Contratos dos campos compostos (PhoneInput, PostalCodeInput, HelpField). Eventos de
// digitação ficam fora: a web entrega o evento do DOM, o nativo entrega o texto.
import type { ReactNode } from "react";

export interface PhoneCountry {
  code: string;
  name: string;
  callingCode: string;
  flag: string;
}

/** Props for the PhoneInput field. */
export interface PhoneInputCoreProps {
  label?: string;
  hint?: string;
  error?: string;
  country?: string;
  countries?: PhoneCountry[];
  onCountryChange?: (country: PhoneCountry) => void;
}

export interface PostalCodeAddress {
  postalCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

/** Props for the PostalCodeInput field. */
export interface PostalCodeInputCoreProps {
  value: string;
  lookup: (postalCode: string) => Promise<PostalCodeAddress | null>;
  onAddressFound: (address: PostalCodeAddress) => void;
  name?: string;
  error?: string;
  disabled?: boolean;
}

/** Props for the HelpField form-row wrapper. `htmlFor` é do DOM e fica só na web. */
export interface HelpFieldCoreProps {
  label: string;
  helpText: string;
  children: ReactNode;
  onLearnMore?: () => void;
  learnMoreLabel?: string;
  side?: "top" | "bottom" | "left" | "right";
}
