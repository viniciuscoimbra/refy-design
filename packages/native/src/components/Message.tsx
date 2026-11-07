import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Animated, Text, View } from "react-native";
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleProp, ViewProps, ViewStyle } from "react-native";
import type { MessageCoreProps, MessageScrollerCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useReducedMotion } from "../hooks";
import { Avatar } from "./Avatar";
import { Bubble } from "./Bubble";
import { Button } from "./Button";
import { ScrollArea } from "./ScrollArea";

export interface MessageProps extends MessageCoreProps, Omit<ViewProps, "children"> {}

/** Avatar, autoria e balão numa linha de conversa. `end` espelha para quem enviou. */
export function Message({ author, initials, time, side = "start", children, style, ...rest }: MessageProps) {
  const t = useRefy();
  const end = side === "end";
  return (
    <View accessible accessibilityLabel={`Mensagem de ${author}${time ? `, ${time}` : ""}`} {...rest} style={[{ flexDirection: end ? "row-reverse" : "row", alignItems: "flex-start", gap: t.pick<number>("--space-2", 8), maxWidth: "100%", alignSelf: end ? "flex-end" : "flex-start" }, style]}>
      <Avatar size="sm" initials={initials ?? author.slice(0, 2)} alt={author} style={{ marginTop: 2 }} />
      <View style={{ gap: t.pick<number>("--space-1", 4), minWidth: 0, flexShrink: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", gap: t.pick<number>("--space-2", 8), justifyContent: end ? "flex-end" : "flex-start" }}>
          <Text style={{ color: t.pick<string>("--ink-1"), fontSize: t.pick<number>("--text-sm", 13), ...t.font("--font-body", "--weight-semi") }}>{author}</Text>
          {time ? <Text style={{ color: t.pick<string>("--ink-3"), fontSize: t.pick<number>("--text-xs", 12), ...t.font("--font-body", "--weight-regular") }}>{time}</Text> : null}
        </View>
        <Bubble side={side}>{children}</Bubble>
      </View>
    </View>
  );
}

function Entering({ children, animate }: { children: ReactNode; animate: boolean }) {
  const t = useRefy();
  const y = useRef(new Animated.Value(animate ? 6 : 0)).current;
  useEffect(() => {
    if (!animate) return;
    const run = Animated.timing(y, { toValue: 0, duration: t.pick<number>("--motion-context-duration", 240), useNativeDriver: true });
    run.start();
    return () => run.stop();
  }, [animate, y, t]);
  return <Animated.View style={{ transform: [{ translateY: y }] }}>{children}</Animated.View>;
}

export interface MessageScrollerProps extends MessageScrollerCoreProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * Histórico de conversa que acompanha a última mensagem. Quem rola para cima para de ser
 * levado para baixo e ganha o botão "Ir para mensagens recentes", como na web.
 */
export function MessageScroller({ children, label = "Histórico de mensagens", maxHeight = 280, style }: MessageScrollerProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const ref = useRef<ScrollView>(null);
  const [follow, setFollow] = useState(true);
  const seen = useRef(new Set<string>());
  const first = useRef(true);
  const list = (Array.isArray(children) ? children.flat() : [children]).filter((c) => c != null && c !== false);
  const keyOf = (child: unknown, i: number) => String((child as { key?: string | null })?.key ?? i);
  const isNew = (k: string) => !first.current && !seen.current.has(k);
  useEffect(() => {
    list.forEach((c, i) => seen.current.add(keyOf(c, i)));
    first.current = false;
  });
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentSize, contentOffset, layoutMeasurement } = e.nativeEvent;
    setFollow(contentSize.height - contentOffset.y - layoutMeasurement.height < 24);
  };
  return (
    <View style={[{ gap: t.pick<number>("--space-3", 12), minWidth: 0 }, style]}>
      <ScrollArea
        ref={ref}
        maxHeight={maxHeight}
        role="log"
        accessibilityLabel={label}
        accessibilityLiveRegion="polite"
        onScroll={onScroll}
        scrollEventThrottle={32}
        onContentSizeChange={() => { if (follow) ref.current?.scrollToEnd({ animated: false }); }}
        contentContainerStyle={{ gap: t.pick<number>("--space-4", 16), padding: t.pick<number>("--space-2", 8) }}
      >
        {list.map((child, i) => <Entering key={keyOf(child, i)} animate={!reduced && isNew(keyOf(child, i))}>{child}</Entering>)}
      </ScrollArea>
      {!follow && (
        <Button style={{ alignSelf: "center" }} onPress={() => { ref.current?.scrollToEnd({ animated: !reduced }); setFollow(true); }}>Ir para mensagens recentes</Button>
      )}
    </View>
  );
}
