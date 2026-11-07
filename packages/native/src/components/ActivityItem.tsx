import { Text, View } from "react-native";
import type { ViewProps } from "react-native";
import type { ActivityActorCore, ActivityItemCoreProps, BadgeTone } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { lineHeight, renderText } from "../primitives";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { Card } from "./Card";

export type ActivityActor = ActivityActorCore;
export interface ActivityItemProps extends ActivityItemCoreProps, Omit<ViewProps, "children"> {}

const accents: Partial<Record<BadgeTone, string>> = { info: "--info", success: "--good", warn: "--weak", danger: "--critical" };

/** Entrada de feed: quem fez, o que fez, quando, e o selo de estado. `compact` tira o cartão. */
export function ActivityItem({ title, actor, timestamp, description, badge, status, metadata, action, density = "default", style, ...rest }: ActivityItemProps) {
  const t = useRefy();
  const compact = density === "compact";
  const sm = t.pick<number>("--text-sm", 13);
  const xs = t.pick<number>("--text-xs", 12);
  const titleSize = compact ? t.pick<number>("--text-base", 14) : sm;
  const relaxed = t.pick<number>("--leading-relaxed", 1.65);
  const ink1 = t.pick<string>("--ink-1");
  const timeText = { fontSize: xs, lineHeight: lineHeight(xs, t.pick<number>("--leading-normal", 1.55)), color: t.pick<string>("--ink-3"), ...t.font("--font-body", "--weight-regular") };
  const heading = (
    <Text accessibilityRole="header" style={{ fontSize: titleSize, lineHeight: lineHeight(titleSize, relaxed), color: ink1, ...t.font("--font-body", "--weight-medium") }}>
      {actor && <Text style={t.font("--font-body", "--weight-bold")}>{actor.name} </Text>}
      {title}
    </Text>
  );
  const body = (
    <>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: t.pick<number>("--space-3", 12) }}>
        {actor && <Avatar size="sm" initials={actor.initials ?? actor.name.split(" ").map((p) => p[0]).slice(0, 2).join("")} src={actor.src} seed={actor.seed} alt={actor.name} />}
        <View style={compact ? { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "baseline", gap: t.pick<number>("--space-3", 12) } : { flex: 1, minWidth: 0 }}>
          <View style={compact ? { flex: 1, minWidth: 0 } : undefined}>{heading}</View>
          {timestamp != null && <View style={compact ? undefined : { marginTop: t.pick<number>("--space-1", 4) }}>{renderText(timestamp, { ...timeText, textAlign: compact ? "right" : "left" })}</View>}
        </View>
        {action != null && <View>{action}</View>}
      </View>
      {description != null && (
        <View style={{ marginTop: compact ? t.pick<number>("--space-1", 4) : t.pick<number>("--space-3", 12) }}>
          {renderText(description, { fontSize: sm, lineHeight: lineHeight(sm, relaxed), color: t.pick<string>("--ink-2"), ...t.font("--font-body", "--weight-regular") })}
        </View>
      )}
      {(badge || status != null || metadata != null) && (
        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", rowGap: t.pick<number>("--space-2", 8), columnGap: t.pick<number>("--space-3", 12), marginTop: compact ? t.pick<number>("--space-2", 8) : t.pick<number>("--space-3", 12) }}>
          {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
          {status != null && renderText(status, timeText)}
          {metadata != null && renderText(metadata, timeText)}
        </View>
      )}
    </>
  );
  if (compact) return <View {...rest} style={[{ paddingVertical: t.pick<number>("--space-1", 4) }, style]}>{body}</View>;
  const accent = t.pick<string>((badge?.tone && accents[badge.tone]) || "--outline", "--line");
  return (
    <Card padding="none" {...rest} style={[{ padding: t.pick<number>("--space-4", 16), backgroundColor: t.mix(accent, 5, t.pick<string>("--surface")) }, style]}>
      {body}
    </Card>
  );
}
