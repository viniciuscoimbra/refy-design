// Contrato de props do Switch: o que a web e o nativo implementam igual.
// A mudança de estado é do ambiente: `onChange` do input na web, `onCheckedChange` no nativo.
import type { ReactNode } from "react";

/** Props for the Switch control. */
export interface SwitchCoreProps {
  label?: ReactNode;
  icon?: ReactNode;
  appearance?: "plain" | "control";
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
}
