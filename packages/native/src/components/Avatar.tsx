import { Image, Text, View } from "react-native";
import type { ImageSourcePropType, ViewProps } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import type { AvatarCoreProps, AvatarShape, AvatarSize } from "@refy-design/web/contracts";
import { useRefy } from "../theme";

export type { AvatarShape, AvatarSize };
export interface AvatarProps extends AvatarCoreProps, Omit<ViewProps, "children"> {
  /** Só no nativo: imagem empacotada (`require("./foto.jpg")`). `src` continua aceitando URL. */
  source?: ImageSourcePropType;
}

const sizes: Record<AvatarSize, [number, number]> = { xs: [20, 9], sm: [24, 10], md: [32, 12], lg: [44, 15], xl: [72, 24] };

// Mesmo hash da web: a mesma semente dá o mesmo gradiente nas duas plataformas.
function gradientIndex(seed: string) {
  let acc = 0;
  for (let i = 0; i < seed.length; i++) acc = (acc + seed.charCodeAt(i) * (i + 1)) % 997;
  return acc % 5;
}

/** Avatar de pessoa (círculo) ou de entidade (`shape="square"`): foto, iniciais ou gradiente por semente. */
export function Avatar({ initials, src, source, alt = "", size = "md", shape = "circle", color, seed, style, ...rest }: AvatarProps) {
  const t = useRefy();
  const [box, fontSize] = sizes[size];
  const image = source ?? (src ? { uri: src } : undefined);
  const useSeed = !image && !color && seed != null && seed.length > 0;
  const radius = shape === "square"
    ? t.pick<number>("--avatar-square-radius", ...(size === "xs" || size === "sm" ? ["--radius-sm"] : size === "lg" || size === "xl" ? ["--radius-lg"] : ["--radius-md"]))
    : box / 2;
  const black = t.pick<string>("--legacy-black", "#000000");
  const stops: [string, string] | undefined = useSeed
    ? (() => {
        const i = gradientIndex(seed);
        if (i === 0) return [t.pick<string>("--brand-primary-container", "--primary"), t.pick<string>("--brand-inverse-primary", "--primary")];
        const base = t.pick<string>(["", "--info", "--critical", "--weak", "--ink-2"][i]);
        return [base, t.mix(base, i === 4 ? 55 : 45, black)];
      })()
    : !image && !color ? [t.pick<string>("--brand-primary-container", "--primary"), t.pick<string>("--brand-inverse-primary", "--primary")] : undefined;
  const label = alt || initials;
  return (
    <View
      accessible={Boolean(label)}
      accessibilityRole={image ? "image" : undefined}
      accessibilityLabel={label || undefined}
      importantForAccessibility={label ? "yes" : "no-hide-descendants"}
      {...rest}
      style={[{ width: box, height: box, borderRadius: radius, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: !image && color ? color : undefined }, style]}
    >
      {stops && (
        <Svg pointerEvents="none" style={{ position: "absolute", top: 0, left: 0 }} width={box} height={box}>
          <Defs>
            <LinearGradient id="refy-avatar" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={stops[0]} />
              <Stop offset="1" stopColor={stops[1]} />
            </LinearGradient>
          </Defs>
          <Rect width={box} height={box} fill="url(#refy-avatar)" />
        </Svg>
      )}
      {image ? (
        <Image source={image} style={{ width: box, height: box }} resizeMode="cover" />
      ) : initials ? (
        <Text style={{ color: t.pick<string>(color ? "--avatar-custom-text" : "--avatar-text", "--legacy-white"), fontSize, lineHeight: fontSize, ...t.font("--font-body", "--weight-semi") }}>{initials}</Text>
      ) : null}
    </View>
  );
}
