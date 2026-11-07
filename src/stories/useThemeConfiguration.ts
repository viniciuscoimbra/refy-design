import { useGlobals } from "@storybook/preview-api";
import {
  changeConfig,
  configGlobals,
  rememberCustomTheme,
  usePlaygroundConfig,
} from "../pages/PlaygroundPage/themeConfig";
import type { PlaygroundConfig } from "../pages/PlaygroundPage/themeConfig";

export function useThemeConfiguration() {
  const [globals, updateGlobals] = useGlobals();
  const config = usePlaygroundConfig(globals);
  const update = (patch: Partial<PlaygroundConfig>) => {
    const next = changeConfig(config, patch);
    if (next.customTheme || next.fonts !== config.fonts)
      rememberCustomTheme(next);
    updateGlobals(configGlobals(next));
  };
  return [config, update] as const;
}
