import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import type { ViewProps } from "react-native";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";
import type { CodeBlockCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { IconButton } from "./IconButton";

/** Trecho realçado: `type` usa os mesmos nomes de token do Prism que a web pinta. */
export interface CodeToken { text: string; type?: string }

export interface CodeBlockProps extends CodeBlockCoreProps, Omit<ViewProps, "children"> {
  /**
   * Só no nativo: grava na área de transferência (ex.: `Clipboard.setStringAsync` do
   * expo-clipboard). O pacote não traz essa dependência; sem ela, o botão copiar não aparece.
   */
  copyToClipboard?: (code: string) => void | Promise<void>;
  /** Só no nativo: realce de sintaxe injetado (ex.: tokens do Prism achatados). Sem ele, texto simples. */
  highlight?: (code: string, language?: string) => CodeToken[];
}

export function maskSecret(code: string, visibleChars: number): string {
  const bullets = "•".repeat(16);
  if (visibleChars <= 0 || code.length <= visibleChars) return bullets;
  return bullets + code.slice(-visibleChars);
}

const SYNTAX: Record<string, string> = {
  comment: "--code-syntax-comment", prolog: "--code-syntax-comment", doctype: "--code-syntax-comment",
  keyword: "--code-syntax-keyword", boolean: "--code-syntax-keyword", atrule: "--code-syntax-keyword",
  string: "--code-syntax-string", "attr-value": "--code-syntax-string", "template-string": "--code-syntax-string", char: "--code-syntax-string",
  number: "--code-syntax-number", constant: "--code-syntax-number",
  tag: "--code-syntax-tag", "class-name": "--code-syntax-tag", builtin: "--code-syntax-tag",
  function: "--code-syntax-function", "function-variable": "--code-syntax-function",
  "attr-name": "--code-syntax-property", property: "--code-syntax-property", variable: "--code-syntax-property",
  operator: "--code-syntax-punctuation", punctuation: "--code-syntax-punctuation",
};

/**
 * Bloco de código monoespaçado com rolagem lateral própria. `secret` mascara chaves com o
 * botão de revelar; copiar sempre leva o valor real e mostra "Copiado".
 */
export function CodeBlock({ code, children, label, language, secret = false, visibleChars = 4, copyLabel = "Copiar código", copiedLabel = "Copiado", revealLabel = "Revelar valor", hideLabel = "Ocultar valor", onCopy, wrap = false, copyToClipboard, highlight, style, ...rest }: CodeBlockProps) {
  const t = useRefy();
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const text = t.pick<string>("--code-text", "--ink-1");
  const accent = t.pick<string>("--code-accent", "--primary-ink");
  const action = t.pick<string>("--code-action-text", "--ink-3");
  const masked = secret && !revealed;
  const size = t.pick<number>("--code-font-size", "--text-sm", 13);
  const mono = t.font("--font-mono", "--weight-regular");
  const syntax: ReactNode = !masked && children == null && highlight
    ? highlight(code, language).map((tok, i) => <Text key={i} style={{ color: t.pick<string>(...(tok.type && SYNTAX[tok.type] ? [SYNTAX[tok.type]] : []), "--code-syntax-text", "--code-text", "--ink-1") }}>{tok.text}</Text>)
    : code;
  const display = masked ? maskSecret(code, visibleChars) : children ?? syntax;
  const hasHead = label != null || language != null || secret;

  const copy = async () => {
    if (!copyToClipboard) return;
    await copyToClipboard(code);
    onCopy?.(code);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };
  const icon = (paths: ReactNode, color = action, sw = 1.7) => <Svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{paths}</Svg>;
  const actions = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-1", 4) }}>
      <Text accessibilityLiveRegion="polite" role="status" style={{ color: accent, fontSize: t.pick<number>("--text-2xs", 11), ...mono }}>{copied ? copiedLabel : ""}</Text>
      {secret && (
        <IconButton size="sm" accessibilityLabel={revealed ? hideLabel : revealLabel} accessibilityState={{ selected: revealed }} onPress={() => setRevealed((r) => !r)}
          icon={revealed
            ? icon(<><Path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><Path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><Path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><Line x1={2} y1={2} x2={22} y2={22} /></>)
            : icon(<><Path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><Circle cx={12} cy={12} r={3} /></>)} />
      )}
      {copyToClipboard && (
        <IconButton size="sm" accessibilityLabel={copyLabel} onPress={() => void copy()}
          icon={copied ? icon(<Path d="m5 12 5 5L20 7" />, accent, 2.2) : icon(<><Rect x={9} y={9} width={13} height={13} rx={2} /><Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>)} />
      )}
    </View>
  );
  const body = (
    <Text selectable accessibilityLabel={masked ? (typeof label === "string" ? `${label}, oculto` : "Valor oculto") : undefined} style={{ color: text, fontSize: size, lineHeight: Math.round(size * t.pick<number>("--code-line-height", 1.75)), ...mono }}>{display}</Text>
  );
  const pad = { paddingVertical: t.pick<number>("--space-4", 16), paddingHorizontal: t.pick<number>("--space-5", 20) };
  return (
    <View {...rest} style={[{ backgroundColor: t.pick<string>("--code-surface", "--surface-2"), borderWidth: t.pick<number>("--code-border-width", 0), borderColor: t.pick<string>("--code-border", "transparent"), borderRadius: t.pick<number>("--code-radius", "--radius-lg-token", 8), overflow: "hidden" }, style]}>
      {hasHead && (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: t.pick<number>("--space-3", 12), paddingVertical: t.pick<number>("--space-2", 8), paddingRight: t.pick<number>("--space-2", 8), paddingLeft: t.pick<number>("--space-5", 20), backgroundColor: t.pick<string>("--code-header-background", "transparent"), borderBottomWidth: 1, borderBottomColor: t.pick<string>("--code-border", "--line") }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: t.pick<number>("--space-2", 8), minWidth: 0, flexShrink: 1 }}>
            {label != null && <Text numberOfLines={1} style={{ color: text, fontSize: t.pick<number>("--text-xs", 12), ...t.font("--font-body", "--weight-semi") }}>{label}</Text>}
            {language != null && <Text style={{ color: accent, fontSize: t.pick<number>("--text-eyebrow", 11), letterSpacing: 0.12 * t.pick<number>("--text-eyebrow", 11), textTransform: "uppercase", ...t.font("--font-mono", "--weight-medium") }}>{language}</Text>}
          </View>
          {actions}
        </View>
      )}
      <View>
        {wrap ? <View style={pad}>{body}</View> : <ScrollView horizontal style={{ flexGrow: 0 }} showsHorizontalScrollIndicator={false} contentContainerStyle={pad}>{body}</ScrollView>}
        {!hasHead && <View style={{ position: "absolute", top: t.pick<number>("--space-2", 8), right: t.pick<number>("--space-2", 8) }}>{actions}</View>}
      </View>
    </View>
  );
}
