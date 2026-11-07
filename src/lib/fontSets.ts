import type { ThemeTokens } from "./ThemeProvider";

function families(heading: string, body: string, mono: string): ThemeTokens {
  const title = `"${heading}", system-ui, sans-serif`;
  return {
    "--font-brand": title,
    "--font-heading": title,
    "--font-headline": title,
    "--prose-font-heading": "var(--font-heading)",
    "--prose-font-body": "var(--font-body)",
    "--prose-font-mono": "var(--font-mono)",
    "--font-body": `"${body}", system-ui, sans-serif`,
    "--font-mono": `"${mono}", ui-monospace, monospace`,
  };
}

/** Optional local fonts: import '@refy-design/web/fonts.css', then spread tokens into your theme. */
export const fontSets = {
  legible: {
    label: "Manrope + Inter + Source Code Pro",
    heading: "Manrope",
    body: "Inter",
    mono: "Source Code Pro",
    description:
      "Geometric headings and a reading text with a tall x-height and open spacing, legible at small sizes.",
    tokens: families("Manrope", "Inter", "Source Code Pro"),
  },
  humanist: {
    label: "Manrope + Source Sans 3 + Source Code Pro",
    heading: "Manrope",
    body: "Source Sans 3",
    mono: "Source Code Pro",
    description:
      "Geometric headings, humanist reading text and code with clearly distinct characters.",
    tokens: families("Manrope", "Source Sans 3", "Source Code Pro"),
  },
  plex: {
    label: "IBM Plex Sans + IBM Plex Mono",
    heading: "IBM Plex Sans",
    body: "IBM Plex Sans",
    mono: "IBM Plex Mono",
    description:
      "One cohesive family. Weight and size create the hierarchy between headings and controls.",
    tokens: families("IBM Plex Sans", "IBM Plex Sans", "IBM Plex Mono"),
  },
  studio: {
    label: "DM Sans + Geist Mono",
    heading: "DM Sans",
    body: "DM Sans",
    mono: "Geist Mono",
    description:
      "A sober, compact interface with a mono dedicated to reading code.",
    tokens: families("DM Sans", "DM Sans", "Geist Mono"),
  },
  editorial: {
    label: "IBM Plex Serif + IBM Plex Sans + IBM Plex Mono",
    heading: "IBM Plex Serif",
    body: "IBM Plex Sans",
    mono: "IBM Plex Mono",
    description:
      "Serif/sans contrast from the same superfamily for editorial reading.",
    tokens: families("IBM Plex Serif", "IBM Plex Sans", "IBM Plex Mono"),
  },
  reading: {
    label: "Manrope + IBM Plex Serif + Source Code Pro",
    heading: "Manrope",
    body: "IBM Plex Serif",
    mono: "Source Code Pro",
    description: "Geometric headings and a serif body for long articles.",
    tokens: families("Manrope", "IBM Plex Serif", "Source Code Pro"),
  },
  clarity: {
    label: "DM Sans + Source Sans 3 + Geist Mono",
    heading: "DM Sans",
    body: "Source Sans 3",
    mono: "Geist Mono",
    description:
      "Hierarchy through related families, with a distinct mono for code.",
    tokens: families("DM Sans", "Source Sans 3", "Geist Mono"),
  },
  grotesk: {
    label: "Space Grotesk + Source Sans 3 + Source Code Pro",
    heading: "Space Grotesk",
    body: "Source Sans 3",
    mono: "Source Code Pro",
    description: "Grotesque headings with humanist reading text and legible code.",
    tokens: families("Space Grotesk", "Source Sans 3", "Source Code Pro"),
  },
  legacy: {
    label: "Space Grotesk + Inter + JetBrains Mono (legado)",
    heading: "Space Grotesk",
    body: "Inter",
    mono: "JetBrains Mono",
    description:
      "Previous set, kept for comparison and compatibility.",
    tokens: families("Space Grotesk", "Inter", "JetBrains Mono"),
  },
};
export type FontSet = keyof typeof fontSets;
