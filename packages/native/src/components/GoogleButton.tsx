import { forwardRef } from "react";
import type { View as ViewType } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Button } from "./Button";
import type { ButtonProps } from "./Button";
import { useRefy } from "../theme";

export type GoogleButtonProps = Omit<ButtonProps, "variant" | "leadingIcon">;

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" accessibilityElementsHidden importantForAccessibility="no">
      <Path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z" />
      <Path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18Z" />
      <Path fill="#FBBC05" d="M3.97 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.33Z" />
      <Path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </Svg>
  );
}

/** Botão "Continuar com Google" nas cores que a marca do Google exige, lidas dos tokens --auth-control-*. */
export const GoogleButton = forwardRef<ViewType, GoogleButtonProps>(function GoogleButton(
  { children = "Continuar com Google", style, labelStyle, status = "idle", loading, ...rest },
  ref,
) {
  const t = useRefy();
  const branded = status === "idle" || loading;
  return (
    <Button
      ref={ref}
      variant="secondary"
      status={status}
      loading={loading}
      leadingIcon={<GoogleIcon />}
      {...rest}
      style={(state) => [
        branded ? {
          height: t.pick<number>("--button-height-md", 40), paddingHorizontal: 12, gap: 10,
          borderColor: t.pick<string>("--auth-control-border"),
          backgroundColor: state.pressed ? t.pick<string>("--auth-control-active") : t.pick<string>("--auth-control-bg"),
        } : null,
        typeof style === "function" ? style(state) : style,
      ]}
      labelStyle={[
        branded ? { color: t.pick<string>("--auth-control-text"), fontSize: t.pick<number>("--control-font-size", 14), lineHeight: 20, ...t.font(["--auth-control-font", "Google Sans"], 500) } : null,
        labelStyle,
      ]}
    >
      {children}
    </Button>
  );
});
