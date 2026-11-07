import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { View } from "react-native";

/**
 * Na web o componente dimensiona e pinta o <svg> filho por CSS (`.md svg { width: 16px }`,
 * `color` herdado). O RN não herda nem seleciona filhos: o componente publica tamanho e cor
 * aqui e o ícone do app lê com `useIconStyle()`.
 */
export interface IconStyle { size: number; color: string }
const IconContext = createContext<IconStyle | null>(null);

export function useIconStyle(fallback: IconStyle = { size: 24, color: "#000" }): IconStyle {
  return useContext(IconContext) ?? fallback;
}

export function IconSlot({ size, color, children }: IconStyle & { children: ReactNode }) {
  return (
    <IconContext.Provider value={{ size, color }}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        {children}
      </View>
    </IconContext.Provider>
  );
}
