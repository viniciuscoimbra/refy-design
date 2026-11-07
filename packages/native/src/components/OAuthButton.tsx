import { forwardRef } from "react";
import type { View as ViewType } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { OAuthButtonCoreProps, OAuthProvider } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { Button } from "./Button";
import type { ButtonProps } from "./Button";
import { providerIcons } from "./providerIcons";

export type { OAuthProvider };
export interface OAuthButtonProps extends OAuthButtonCoreProps, Omit<ButtonProps, "variant" | "leadingIcon" | "provider"> {}

const names: Record<OAuthProvider, string> = { google: "Google", facebook: "Facebook", linkedin: "LinkedIn", spotify: "Spotify", github: "GitHub", x: "X", apple: "Apple", microsoft: "Microsoft" };

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z" />
      <Path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18Z" />
      <Path fill="#FBBC05" d="M3.97 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.33Z" />
      <Path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </Svg>
  );
}

/** Composição de Button para entrar com um provedor. Não abre janelas nem guarda credenciais. */
export const OAuthButton = forwardRef<ViewType, OAuthButtonProps>(function OAuthButton({ provider, children, ...props }, ref) {
  const t = useRefy();
  const label = children ?? `Continuar com ${names[provider]}`;
  if (provider === "google") {
    const pick = (name: string, fallback: string) => t.pick<string>(name, fallback);
    return (
      <Button
        {...props}
        ref={ref}
        variant="secondary"
        leadingIcon={<GoogleIcon />}
        labelStyle={{ color: pick("--auth-control-text", "#1f1f1f"), fontSize: t.pick<number>("--control-font-size", 14), fontWeight: "500", lineHeight: 20, ...(t.pick("--auth-control-font", "") ? { fontFamily: String(t.pick("--auth-control-font")) } : null) }}
        style={({ pressed }) => ({
          height: t.pick<number>("--button-height-md", 40),
          paddingHorizontal: 12,
          gap: 10,
          borderColor: pick("--auth-control-border", "#747775"),
          backgroundColor: pressed ? pick("--auth-control-active", "#f0f4f9") : pick("--auth-control-bg", "#fff"),
        })}
      >
        {label}
      </Button>
    );
  }
  return (
    <Button
      {...props}
      ref={ref}
      variant="secondary"
      leadingIcon={
        <Svg width={18} height={18} viewBox="0 0 24 24" fill={t.pick<string>("--button-secondary-foreground", "--ink-1")}>
          <Path d={providerIcons[provider]} />
        </Svg>
      }
    >
      {label}
    </Button>
  );
});
