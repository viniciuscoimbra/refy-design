import { Pressable, Text, View } from "react-native";
import type { ViewProps } from "react-native";
import type { AvatarGroupCoreProps, AvatarGroupItem, AvatarSize } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { hitSlopFor } from "../primitives";
import { Avatar } from "./Avatar";

export type { AvatarGroupItem };
export interface AvatarGroupProps extends AvatarGroupCoreProps, Omit<ViewProps, "children"> {}

const boxes: Record<AvatarSize, [number, number]> = { xs: [20, 9], sm: [24, 10], md: [32, 12], lg: [44, 15], xl: [72, 24] };
const overlaps: Record<AvatarSize, [string, number]> = { xs: ["--avatar-group-overlap-sm", 3], sm: ["--avatar-group-overlap-sm", 3], md: ["--avatar-group-overlap-md", 4], lg: ["--avatar-group-overlap-lg", 6], xl: ["--avatar-group-overlap-lg", 6] };

/** Iniciais: primeira letra do primeiro e do último nome, como na web. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "")).toUpperCase();
}

/** Avatares empilhados, o primeiro por cima; o excedente vira "+N" com os nomes no nome acessível. */
export function AvatarGroup({ items, max = 4, size = "md", onItemClick, onOverflowClick, style, accessibilityLabel, ...rest }: AvatarGroupProps) {
  const t = useRefy();
  const visible = items.slice(0, Math.max(0, max));
  const hidden = items.slice(Math.max(0, max));
  const [box, fontSize] = boxes[size];
  const overlap = t.pick<number>(...overlaps[size]);
  const ring = t.pick<string>("--avatar-group-ring", "--surface");
  const radius = t.pick<number>("--avatar-radius", box / 2);
  const layer = (index: number, z: number, child: React.ReactNode, press?: () => void, name?: string) => {
    const frame = { width: box + 4, height: box + 4, margin: -2, marginLeft: index === 0 ? -2 : -overlap - 2, borderRadius: radius + 2, borderWidth: 2, borderColor: ring, zIndex: z, overflow: "hidden" as const };
    return press ? (
      <Pressable key={index} accessibilityRole="button" accessibilityLabel={name} hitSlop={hitSlopFor(box + 4, box + 4)} onPress={press} style={({ pressed }) => ({ ...frame, transform: [{ translateY: pressed ? -2 : 0 }] })}>{child}</Pressable>
    ) : <View key={index} accessible accessibilityRole="image" accessibilityLabel={name} style={frame}>{child}</View>;
  };
  const more = hidden.length;
  const moreName = `Mais ${more} ${more === 1 ? "pessoa" : "pessoas"}: ${hidden.map((i) => i.name).join(", ")}`;
  return (
    <View
      accessibilityRole="none"
      role="group"
      accessibilityLabel={accessibilityLabel ?? (items.length === 1 ? items[0].name : `${items.length} pessoas`)}
      {...rest}
      style={[{ flexDirection: "row", alignItems: "center", alignSelf: "flex-start", padding: 2 }, style]}
    >
      {visible.map((item, index) =>
        layer(index, visible.length + 1 - index, <Avatar size={size} src={item.src} alt="" initials={item.initials ?? initialsOf(item.name)} color={item.color} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />, onItemClick && (() => onItemClick(item, index)), item.name),
      )}
      {more > 0 && layer(visible.length, 0, (
        <View style={{ width: box, height: box, borderRadius: radius, alignItems: "center", justifyContent: "center", backgroundColor: t.pick<string>("--surface-2", "--surface-container-high") }}>
          <Text style={{ fontSize, letterSpacing: -0.02 * fontSize, color: t.pick<string>("--ink-2", "--on-surface"), ...t.font("--font-body", "--weight-semi") }}>{`+${more}`}</Text>
        </View>
      ), onOverflowClick, moreName)}
    </View>
  );
}
