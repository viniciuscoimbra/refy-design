import type { RefyTheme } from "../lib/ThemeProvider";
import type { FontSet } from "../lib/fontSets";

/** A theme configuration file: everything that changes between themes lives in the JSON. */
export type ThemeFile = RefyTheme & {
  label: string;
  description: string;
  /** Font set the theme was designed with (`fontSets` key). */
  fonts: FontSet;
  /** Position in the site's hero switcher; absent means not listed there. */
  featured?: number;
};

// Every file in src/themes is a theme. Adding a theme is dropping a JSON file in that folder.
const files = import.meta.glob<ThemeFile>("../themes/*.json", { eager: true, import: "default" });
const byId = Object.fromEntries(
  Object.entries(files).map(([path, theme]) => [path.replace(/^.*\/(.+)\.json$/, "$1"), theme]),
);
// refy.json só guarda os tokens de fundação (objeto vazio) e não é um tema escolhível: existe um único
// Refy, o de refy-site.json, que vem primeiro e é o padrão. Os outros seguem a ordem da pasta.
const ids = ["refy-site", ...Object.keys(byId).filter((id) => id !== "refy" && id !== "refy-site").sort()];

export const skins: Record<string, { label: string; description: string; theme?: RefyTheme; fonts: FontSet; featured?: number }> =
  Object.fromEntries(
    ids.filter((id) => byId[id]).map((id) => {
      const file = byId[id];
      return [id, { label: file.label, description: file.description, theme: file, fonts: file.fonts, featured: file.featured }];
    }),
  );
