import { Children, cloneElement, isValidElement, useState } from "react";
import type { ReactElement } from "react";
import { View } from "react-native";
import type { ViewProps } from "react-native";
import type { ButtonGroupCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import type { ButtonProps } from "./Button";

export interface ButtonGroupProps extends ButtonGroupCoreProps, ViewProps {}

/** Grupo de escolha única com bordas coladas; a opção ativa vira o botão primário. */
export function ButtonGroup({ orientation = "horizontal", label, defaultActiveIndex = 0, activeIndex, onActiveIndexChange, children, style, ...rest }: ButtonGroupProps) {
  const t = useRefy();
  const [internal, setInternal] = useState(defaultActiveIndex);
  const selected = activeIndex ?? internal;
  const vertical = orientation === "vertical";
  const radius = t.pick<number>("--button-radius", "--control-radius", 7);
  const overlap = -t.pick<number>("--button-border-width", 1);
  const list = Children.toArray(children).filter(isValidElement) as ReactElement<ButtonProps>[];
  const items = list.map((button, index) => {
    const first = index === 0;
    const last = index === list.length - 1;
    const r = (on: boolean) => (on ? radius : 0);
    const corners = vertical
      ? { borderTopLeftRadius: r(first), borderTopRightRadius: r(first), borderBottomLeftRadius: r(last), borderBottomRightRadius: r(last) }
      : { borderTopLeftRadius: r(first), borderBottomLeftRadius: r(first), borderTopRightRadius: r(last), borderBottomRightRadius: r(last) };
    const isSelected = index === selected;
    const own = button.props.style;
    return cloneElement(button, {
      key: button.key ?? index,
      variant: isSelected ? "primary" : "secondary",
      accessibilityState: { ...button.props.accessibilityState, selected: isSelected, disabled: Boolean(button.props.disabled) },
      onPress: (event) => {
        if (!button.props.disabled) {
          if (activeIndex === undefined) setInternal(index);
          onActiveIndexChange?.(index);
        }
        button.props.onPress?.(event);
      },
      style: (state) => [
        { ...corners, ...(first ? {} : vertical ? { marginTop: overlap } : { marginLeft: overlap }), alignSelf: "stretch" as const, zIndex: isSelected ? 1 : 0 },
        typeof own === "function" ? own(state) : own,
      ],
    });
  });
  return (
    <View accessibilityRole="none" role="group" accessibilityLabel={label} aria-orientation={orientation} {...rest} style={[{ flexDirection: vertical ? "column" : "row", alignSelf: "flex-start", alignItems: "stretch" }, style]}>
      {items}
    </View>
  );
}
