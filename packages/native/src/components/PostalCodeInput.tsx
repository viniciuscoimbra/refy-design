import { useRef, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import type { StyleProp, TextInputProps, ViewStyle } from "react-native";
import type { PostalCodeAddress, PostalCodeInputCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { baseText } from "../primitives";
import { Button } from "./Button";
import { Input } from "./Input";

export type { PostalCodeAddress };
export interface PostalCodeInputProps extends PostalCodeInputCoreProps {
  /** Recebe o CEP já com máscara 00000-000. */
  onChangeText: (value: string) => void;
  onBlur?: TextInputProps["onBlur"];
  style?: StyleProp<ViewStyle>;
}

export const maskPostalCode = (value: string) => value.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");

/** Consulta um CEP (a busca vem do app, em `lookup`) e devolve o endereço ao formulário. */
export function PostalCodeInput({ value, onChangeText, lookup, onAddressFound, error, disabled, onBlur, style }: PostalCodeInputProps) {
  const t = useRefy();
  const { width } = useWindowDimensions();
  const stacked = width <= 480;
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const searching = useRef<string | null>(null);
  const lastFound = useRef<string | null>(null);

  async function search(raw = value) {
    const postalCode = raw.replace(/\D/g, "");
    if (postalCode.length !== 8) { setStatus("error"); setMessage("Informe um CEP com 8 números."); return; }
    if (searching.current === postalCode || lastFound.current === postalCode) return;
    searching.current = postalCode;
    setStatus("loading");
    setMessage("Buscando endereço.");
    try {
      const address = await lookup(postalCode);
      if (!address) { setStatus("error"); setMessage("CEP não encontrado. Confira os números e tente novamente."); return; }
      onAddressFound(address);
      lastFound.current = postalCode;
      setStatus("success");
      setMessage(`Endereço encontrado em ${address.city}, ${address.state}.`);
    } catch {
      setStatus("error");
      setMessage("Não foi possível buscar o CEP. Tente novamente.");
    } finally {
      searching.current = null;
    }
  }

  return (
    <View style={[{ gap: t.pick<number>("--space-2", 8), alignSelf: "stretch" }, style]}>
      <View style={{ flexDirection: stacked ? "column" : "row", alignItems: stacked ? "stretch" : "flex-start", gap: t.pick<number>("--space-2", 8) }}>
        <View style={{ flex: stacked ? undefined : 1, minWidth: 0 }}>
          <Input
            label="CEP"
            value={value}
            onChangeText={(text) => { lastFound.current = null; setStatus("idle"); setMessage(""); onChangeText(maskPostalCode(text)); }}
            onBlur={(event) => { onBlur?.(event); if (value.replace(/\D/g, "").length === 8) void search(value); }}
            placeholder="00000-000"
            keyboardType="number-pad"
            textContentType="postalCode"
            autoComplete="postal-code"
            maxLength={9}
            error={error}
            disabled={disabled || status === "loading"}
          />
        </View>
        <Button
          size="sm"
          block={stacked}
          loading={status === "loading"}
          loadingLabel="Buscando"
          disabled={disabled}
          onPress={() => void search()}
          style={{ minHeight: 38, height: 38, marginTop: stacked ? 0 : t.pick<number>("--space-5", 20) }}
        >
          Buscar CEP
        </Button>
      </View>
      {message && !error ? (
        <Text accessibilityLiveRegion="polite" role="status" style={baseText(t, { size: t.pick<number>("--text-xs", 12), color: status === "error" ? "--critical" : "--ink-3", leading: "--leading-snug" })}>{message}</Text>
      ) : null}
    </View>
  );
}
