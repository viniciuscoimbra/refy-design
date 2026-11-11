import type { OAuthButtonCoreProps } from "../../contracts/oauth-button";
import { forwardRef } from "react";
import { Button, type ButtonProps } from "../Button";
import { GoogleButton } from "../GoogleButton";
import { providerIcons } from "./providerIcons";

import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
export const oauthProviders = {
  google: "Google",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  spotify: "Spotify",
  github: "GitHub",
  x: "X",
  apple: "Apple",
  microsoft: "Microsoft",
} as const;
export type OAuthProvider = keyof typeof oauthProviders;
export interface OAuthButtonProps extends Omit<
  ButtonProps,
  "variant" | "leadingIcon"
>, OAuthButtonCoreProps {
  /** Provider identified by label and symbol. The application provides the OAuth flow. */
  provider: OAuthProvider;
}
/** Composição de Button. Não abre janelas nem armazena credenciais. */
export const OAuthButton = forwardRef<HTMLButtonElement, OAuthButtonProps>(
  function OAuthButton({ provider, children, ...props }, ref) {
    const continueWith = useComponentMessages("oauthButton", enMessages.oauthButton).continueWith;
    const label = children ?? continueWith(oauthProviders[provider]);
    if (provider === "google")
      return (
        <GoogleButton {...props} ref={ref}>
          {label}
        </GoogleButton>
      );
    return (
      <Button
        {...props}
        ref={ref}
        variant="secondary"
        data-refy-auth-provider={provider}
        leadingIcon={
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path d={providerIcons[provider]} />
          </svg>
        }
      >
        {label}
      </Button>
    );
  },
);
