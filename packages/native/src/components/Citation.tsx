import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import type { CitationCoreProps, CitationSource } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { baseText, hitSlopFor, renderText } from "../primitives";
import { Popover } from "./Popover";
import { SiteMark } from "./LinkCard";
import { domainOf } from "./domain";

export type { CitationSource };
export interface CitationProps extends CitationCoreProps {}

/** Marcador de fonte [1]; o toque abre título, trecho e link num painel ancorado. */
export function Citation({ index, source }: CitationProps) {
  const t = useRefy();
  const [open, setOpen] = useState(false);
  const site = source.siteName ?? (source.href ? domainOf(source.href) : "");
  const xs = t.pick<number>("--text-xs", 12);
  const content = (
    <View style={{ gap: 4, maxWidth: 280 }}>
      {site ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <SiteMark favicon={source.favicon} site={site} />
          <Text style={baseText(t, { size: xs, color: "--ink-3" })}>{site}</Text>
        </View>
      ) : null}
      <Text style={baseText(t, { size: t.pick<number>("--text-sm", 13), color: "--ink-1", weight: "--weight-semi", leading: "--leading-snug" })}>{source.title}</Text>
      {source.snippet != null && renderText(source.snippet, baseText(t, { size: xs, color: "--ink-2" }))}
      {source.href && (
        <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(source.href!)} hitSlop={8}>
          <Text style={{ color: t.pick<string>("--primary-ink"), fontSize: xs, ...t.font("--font-body", "--weight-semi") }}>Abrir fonte</Text>
        </Pressable>
      )}
    </View>
  );
  return (
    <Popover open={open} onOpenChange={setOpen} content={content} side="top" label={`Fonte ${index}: ${source.title}`}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Fonte ${index}: ${source.title}`}
        onPress={() => setOpen(!open)}
        hitSlop={hitSlopFor(18, 18)}
        style={{ minWidth: 18, height: 18, paddingHorizontal: 5, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: t.pick<string>(open ? "--primary" : "--surface-container-high", "--surface-2") }}
      >
        <Text style={{ color: t.pick<string>(open ? "--on-primary" : "--ink-2"), fontSize: t.pick<number>("--text-2xs", 10), ...t.font(["--interface-detail-font", "--font-mono"], "--weight-semi"), fontVariant: ["tabular-nums"] }}>{index}</Text>
      </Pressable>
    </Popover>
  );
}
