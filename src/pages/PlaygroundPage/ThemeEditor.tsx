import { tr } from "../RefySitePage/i18n";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import {
  Button,
  Slider,
  Input,
  Select,
  Textarea,
  CodeBlock,
  Callout,
  Tabs,
  ThemeProvider,
  Popover,
  Modal,
  Accordion,
} from "../../index";
import type { RefyTheme, ThemeTokens } from "../../index";
import {
  customTheme,
  parseTheme,
  importTheme,
  resolveTheme,
  textScale,
  tokenNames,
  presetFonts,
  tokenCanVaryByMode,
} from "./themeConfig";
import type { PlaygroundConfig } from "./themeConfig";
import styles from "./Workbench.module.css";
import { VisualTokenEditor } from "./VisualTokenEditor";
import { fontSets } from "../../lib/fontSets";
import type { FontSet } from "../../lib/fontSets";
import foundation from "../../tokens/foundations.tokens.json";

const palette = [
  ["--primary", "Ação principal"],
  ["--on-primary", "Texto da ação"],
  ["--bg", "Fundo da página"],
  ["--surface", "Superfície"],
  ["--surface-2", "Superfície secundária"],
  ["--ink-1", "Texto principal"],
  ["--ink-2", "Texto secundário"],
  ["--ink-3", "Texto de apoio"],
  ["--outline", "Borda de campos"],
  ["--line", "Borda de superfícies"],
  ["--chart-primary", "Dados · série 1"],
  ["--chart-secondary", "Dados · série 2"],
  ["--chart-tertiary", "Dados · série 3"],
  ["--chart-quaternary", "Dados · série 4"],
  ["--chart-quinary", "Dados · série 5"],
  ["--chart-senary", "Dados · série 6"],
  ["--chart-septenary", "Dados · série 7"],
  ["--chart-octonary", "Dados · série 8"],
] as const;
const numeric = (value: string | undefined, fallback: number) => {
  const parsed = parseFloat(value ?? "");
  return Number.isFinite(parsed)
    ? value?.includes("rem")
      ? parsed * 16
      : parsed
    : fallback;
};
const hex = (value: string) => {
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  const context = document.createElement("canvas").getContext("2d");
  if (!context) return "#ffffff";
  context.fillStyle = value || "#ffffff";
  context.fillRect(0, 0, 1, 1);
  return `#${[...context.getImageData(0, 0, 1, 1).data]
    .slice(0, 3)
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")}`;
};
function luminance(value: string) {
  const match = /^#([\da-f]{6})$/i.exec(value);
  if (!match) return null;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(match[1].slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}

function emphasis(color: string, background: string) {
  const channels = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  const bg = luminance(hex(background))!;
  const dark = bg < 0.179;
  for (let amount = 0; amount <= 1; amount += 0.1) {
    const candidate = `#${channels
      .map((n) =>
        Math.round(n * (1 - amount) + (dark ? 255 : 0) * amount)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")}`;
    const fg = luminance(candidate)!;
    if ((Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05) >= 4.5)
      return candidate;
  }
  return dark ? "#ffffff" : "#000000";
}

function usePrefersDark() {
  const [dark, setDark] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setDark(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return dark;
}

export function ThemeEditor({
  config,
  onChange,
  preview,
  initialTab = "colors",
  variant = "workbench",
}: {
  config: PlaygroundConfig;
  onChange: (patch: Partial<PlaygroundConfig>) => void;
  preview: RefObject<HTMLDivElement | null>;
  initialTab?: string;
  /** "site": painel "Personalizar" do site, com cores em amostras e abas sem exportação. */
  variant?: "workbench" | "site";
}) {
  // The editor lives in the page chrome (always Refy, light): the mode it edits is the preview's mode.
  const prefersDark = usePrefersDark();
  const mode = config.theme === "dark" || (config.theme === "system" && prefersDark) ? "dark" : "light";
  const [values, setValues] = useState<Record<string, string>>({});
  const [json, setJson] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [motionExample, setMotionExample] = useState(false);
  const [motionDialog, setMotionDialog] = useState(false);
  // The preview may be an ancestor: its ref is attached after child layout effects.
  useEffect(() => {
    if (!preview.current) return;
    const css = getComputedStyle(preview.current);
    setValues(
      Object.fromEntries(
        tokenNames.map((name) => [name, css.getPropertyValue(name).trim()]),
      ),
    );
  }, [config, mode, preview]);
  const pending = useRef(customTheme(config));
  useLayoutEffect(() => {
    pending.current = customTheme(config);
  }, [config.customTheme]);
  const overrides = pending.current;
  const apply = (tokens: ThemeTokens, scope: "shared" | "mode" = "shared") => {
    const current = pending.current;
    const next: RefyTheme =
      scope === "shared"
        ? { ...current, tokens: { ...current.tokens, ...tokens } }
        : {
            ...current,
            modes: {
              ...current.modes,
              [mode]: { ...current.modes?.[mode], ...tokens },
            },
          };
    pending.current = next;
    onChange({ customTheme: JSON.stringify(next) });
  };
  const color = (name: string, value: string) => {
    const tokens: ThemeTokens = { [name]: value };
    if (name === "--primary")
      Object.assign(tokens, {
        "--button-primary-background": value,
        "--button-primary-background-hover": `color-mix(in srgb, ${value} 88%, black)`,
        "--button-primary-background-active": `color-mix(in srgb, ${value} 78%, black)`,
        "--primary-hover": `color-mix(in srgb, ${value} 88%, black)`,
        "--primary-container": value,
        "--primary-ink": emphasis(value, values["--bg"]),
        "--primary-soft": `color-mix(in srgb, ${value} 15%, var(--bg))`,
        "--avatar-background": value,
        "--avatar-text": "var(--on-primary)",
      });
    if (name === "--on-primary")
      Object.assign(tokens, {
        "--button-primary-foreground": value,
        "--button-primary-foreground-hover": value,
        "--button-primary-foreground-active": value,
        "--on-primary-container": value,
      });
    if (name === "--primary") {
      for (const key of [
        "--button-primary-background",
        "--button-primary-background-hover",
        "--button-primary-background-active",
      ] as const) {
        const original =
          effective.modes?.[mode]?.[key] ?? effective.tokens?.[key];
        if (typeof original === "string" && original.includes("var(--primary"))
          tokens[key] = original;
      }
    }
    apply(tokens, "mode");
  };
  const radius = (value: number) =>
    apply(
      Object.fromEntries(
        [
          "radius-xs",
          "radius-sm",
          "radius-md",
          "radius-lg",
          "radius-xl",
          "radius-default",
          "radius-pill",
          "control-radius",
          "field-radius",
          "button-radius",
          "card-radius",
          "dialog-radius",
          "drawer-radius",
          "chip-radius",
          "control-group-radius",
          "avatar-radius",
          "avatar-square-radius",
          "checkbox-radius",
          "navigation-link-radius",
        ].map((name) => [`--${name}`, `${value}px`]),
      ),
    );
  const border = (value: number) =>
    apply(
      Object.fromEntries(
        ["control", "surface", "card", "dialog", "button", "field"].map(
          (role) => [`--${role}-border-width`, `${value}px`],
        ),
      ),
    );
  const typeSize = (value: number) =>
    apply(
      Object.fromEntries(
        Object.entries(textScale).map(([name, size]) => [
          name,
          `${Math.round(((size * value) / textScale["--text-base"]) * 10) / 10}px`,
        ]),
      ),
    );
  const spacing = (unit: number) =>
    apply(
      Object.fromEntries(
        Object.entries(foundation.base)
          .filter(([name]) => /^space-/.test(name))
          .map(([name, token]) => [
            `--${name}`,
            `${(((token as { $value: { value: number } }).$value.value * unit) / 4).toFixed(2)}px`,
          ]),
      ),
    );
  const fontFamily = (role: "body" | "heading" | "mono", family: string) => {
    const value = `"${family}", ${role === "mono" ? "ui-monospace, monospace" : "system-ui, sans-serif"}`;
    const tokens: ThemeTokens =
      role === "heading"
        ? {
            "--font-heading": value,
            "--font-headline": value,
            "--font-brand": value,
          }
        : { [`--font-${role}`]: value };
    tokens[`--prose-font-${role}`] = value;
    const next = {
      ...pending.current,
      tokens: { ...pending.current.tokens, ...tokens },
      modes: { ...pending.current.modes },
    };
    for (const modeName of ["light", "dark"] as const) {
      next.modes[modeName] = { ...next.modes[modeName] };
      for (const key of Object.keys(tokens))
        delete next.modes[modeName]?.[key as `--${string}`];
    }
    pending.current = next;
    onChange({ customTheme: JSON.stringify(next) });
  };
  const chooseFonts = (id: FontSet) => {
    const next = {
      ...pending.current,
      tokens: { ...pending.current.tokens, ...fontSets[id].tokens },
      modes: { ...pending.current.modes },
    };
    for (const modeName of ["light", "dark"] as const) {
      next.modes[modeName] = { ...next.modes[modeName] };
      for (const role of Object.keys(fontSets[id].tokens))
        delete next.modes[modeName]?.[role as `--${string}`];
    }
    pending.current = next;
    onChange({ fonts: id, customTheme: JSON.stringify(next) });
  };
  const [fontQuery, setFontQuery] = useState("");
  const currentSet =
    Object.entries(fontSets)
      .filter(([id]) => id !== "legacy")
      .find(([, set]) =>
        ["heading", "body", "mono"].every(
          (role) =>
            (values[`--font-${role}`] ?? "")
              .split(",")[0]
              .trim()
              .replace(/^(["'])(.*)\1$/, "$2")
              .replace(/\s+/g, " ") ===
            set[role as "heading" | "body" | "mono"],
        ),
      )?.[0] ?? "custom";
  const availableFonts = [
    ...new Set(
      Object.entries(fontSets)
        .filter(([key]) => key !== "legacy")
        .flatMap(([, set]) => [set.body, set.heading, set.mono]),
    ),
  ];
  const effective = resolveTheme(config);
  const exportJSON = JSON.stringify(effective, null, 2);
  const snippet = `import { ThemeProvider } from '@refy-design/web';\nimport '@refy-design/web/tokens.css';\nimport '@refy-design/web/fonts.css';\nimport theme from './refy-theme.json';\n\n<ThemeProvider theme={theme} mode="${config.theme}">\n  <MinhaAplicacao />\n</ThemeProvider>`;
  const pairs = [
    ["Texto principal", "--ink-1", "--bg"],
    ["Texto de apoio", "--ink-3", "--surface"],
    ["Ação principal", "--on-primary", "--primary"],
  ].flatMap(([label, fg, bg]) => {
    const a = luminance(values[fg]),
      b = luminance(values[bg]);
    return a === null || b === null
      ? []
      : [{ label, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) }];
  });
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([exportJSON], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "refy-theme.json";
    link.click();
    URL.revokeObjectURL(url);
  };
  const sections = [
          {
            id: "colors",
            label: tr("Cores"),
            content: (
              <div className={styles.editorSection}>
                <Select
                  label={tr("Editar cores do modo")}
                  value={mode}
                  onChange={(e) =>
                    onChange({ theme: e.target.value as "light" | "dark" })
                  }
                >
                  <option value="light">{tr("Claro")}</option>
                  <option value="dark">{tr("Escuro")}</option>
                </Select>
                {palette.map(([name, label]) => (
                  <label className={styles.colorRow} key={name}>
                    <span>{label}</span>
                    <input
                      type="color"
                      aria-label={label}
                      value={hex(values[name] ?? "")}
                      onChange={(e) => color(name, e.target.value)}
                    />
                    <Input
                      key={values[name]}
                      aria-label={`${label} ${tr("em hexadecimal")}`}
                      defaultValue={hex(values[name] ?? "")}
                      onBlur={(e) => {
                        if (/^#[0-9a-f]{6}$/i.test(e.target.value))
                          color(name, e.target.value);
                        else e.target.value = hex(values[name] ?? "");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                      }}
                    />
                  </label>
                ))}
                <div
                  className={styles.contrast}
                  aria-label={tr("Contraste das cores")}
                >
                  {pairs.map((pair) => (
                    <span key={pair.label} data-pass={pair.ratio >= 4.5}>
                      {pair.label}: {pair.ratio.toFixed(1)}:1{" "}
                      {pair.ratio >= 4.5 ? "✓" : tr("· ajustar cores")}
                    </span>
                  ))}
                  <small>
                    {tr("Pares sólidos de texto. Gradientes e demais estados precisam de conferência na prévia.")}</small>
                </div>
              </div>
            ),
          },
          {
            id: "shape",
            label: tr("Forma"),
            content: (
              <div className={styles.editorSection}>
                <Input
                  label="Arredondamento geral (px)"
                  type="number"
                  min={0}
                  max={32}
                  value={numeric(values["--control-radius"], 7)}
                  onChange={(e) =>
                    radius(Math.max(0, Math.min(32, Number(e.target.value))))
                  }
                  block
                />
                <Input
                  label="Espessura das bordas (px)"
                  type="number"
                  min={0}
                  max={3}
                  step={0.5}
                  value={numeric(values["--control-border-width"], 1)}
                  onChange={(e) =>
                    border(Math.max(0, Math.min(3, Number(e.target.value))))
                  }
                  block
                />
                <Select
                  label={tr("Sombras")}
                  value={
                    overrides.tokens?.["--elev-2"] === "none" ? "none" : "base"
                  }
                  onChange={(e) => {
                    const next = {
                      ...overrides,
                      tokens: { ...overrides.tokens },
                    };
                    for (const key of [
                      "--elev-1",
                      "--elev-2",
                      "--elev-3",
                      "--elev-4",
                      "--elev-5",
                      "--shadow-1",
                      "--shadow-2",
                      "--button-primary-shadow",
                      "--field-shadow",
                      "--dialog-shadow",
                    ]) {
                      if (e.target.value === "none")
                        next.tokens[key as `--${string}`] = "none";
                      else delete next.tokens[key as `--${string}`];
                    }
                    onChange({ customTheme: JSON.stringify(next) });
                  }}
                >
                  <option value="base">{tr("Do tema escolhido")}</option>
                  <option value="none">{tr("Sem sombras")}</option>
                </Select>
              </div>
            ),
          },
          {
            id: "type",
            label: tr("Tipografia"),
            content: (
              <div className={styles.editorSection}>
                <p className={styles.caption}>
                  {tr("As famílias abaixo acompanham componentes e páginas. Os ajustes de leitura controlam a amostra editorial e Prose.")}</p>
                <Input
                  label={tr("Buscar famílias tipográficas")}
                  placeholder={tr("Nome da família…")}
                  value={fontQuery}
                  onChange={(event) => setFontQuery(event.target.value)}
                />
                <Select
                  label={tr("Conjunto de fontes")}
                  value={currentSet}
                  onChange={(event) =>
                    chooseFonts(event.target.value as FontSet)
                  }
                >
                  <option value="custom" disabled>
                    {tr("Personalizado por família")}</option>
                  {Object.entries(fontSets)
                    .filter(
                      ([id, set]) =>
                        id !== "legacy" &&
                        (id === currentSet ||
                          set.label
                            .toLocaleLowerCase()
                            .includes(fontQuery.toLocaleLowerCase())),
                    )
                    .map(([id, set]) => (
                      <option key={id} value={id}>
                        {set.label}
                      </option>
                    ))}
                </Select>
                {(["heading", "body", "mono"] as const).map((role) => {
                  const family = (values[`--font-${role}`] ?? "")
                    .split(",")[0]
                    .replace(/["']/g, "")
                    .trim();
                  return (
                    <Select
                      key={role}
                      label={
                        {
                          heading: tr("Fonte dos títulos"),
                          body: tr("Fonte do texto e controles"),
                          mono: tr("Fonte do código"),
                        }[role]
                      }
                      value={family}
                      onChange={(event) => fontFamily(role, event.target.value)}
                    >
                      {!availableFonts.includes(family) && (
                        <option value={family}>
                          {family || "Herdada"} {tr("· personalizada")}</option>
                      )}
                      {availableFonts.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </Select>
                  );
                })}
                <Slider
                  label={tr("Medida do texto")}
                  min={45}
                  max={80}
                  step={1}
                  value={numeric(values["--prose-measure"], 68)}
                  formatValue={(value) => `${value}ch`}
                  onChange={(value) =>
                    apply({ "--prose-measure": `${value}ch` })
                  }
                />
                <Slider
                  label={tr("Texto de leitura")}
                  min={14}
                  max={24}
                  step={1}
                  value={numeric(values["--prose-size"], 18)}
                  formatValue={(value) => `${value}px`}
                  onChange={(value) => apply({ "--prose-size": `${value}px` })}
                />
                <Slider
                  label={tr("Entrelinha de leitura")}
                  min={1.4}
                  max={2}
                  step={0.05}
                  value={numeric(values["--prose-leading"], 1.8)}
                  onChange={(value) =>
                    apply({ "--prose-leading": String(value) })
                  }
                />
                <Slider
                  label={tr("Espaço entre parágrafos")}
                  min={0.8}
                  max={2}
                  step={0.05}
                  value={numeric(values["--prose-flow"], 1.4)}
                  formatValue={(value) => `${value}em`}
                  onChange={(value) => apply({ "--prose-flow": `${value}em` })}
                />
                <div
                  className={styles.fontPreview}
                  style={
                    {
                      "--font-body": values["--font-body"],
                      "--font-heading": values["--font-heading"],
                      "--font-mono": values["--font-mono"],
                      fontFamily: "var(--font-body)",
                    } as CSSProperties
                  }
                >
                  <strong style={{ fontFamily: values["--font-heading"] }}>
                    {tr("Seu tema, sua tipografia")}</strong>
                  <span>
                    {tr("O texto e os controles acompanham a família escolhida.")}</span>
                  <code style={{ fontFamily: values["--font-mono"] }}>
                    const tema = "meu produto";
                  </code>
                </div>
                <Input
                  label="Texto base (px)"
                  type="number"
                  min={12}
                  max={20}
                  value={numeric(values["--text-base"], 14)}
                  onChange={(e) =>
                    typeSize(Math.max(12, Math.min(20, Number(e.target.value))))
                  }
                  block
                />
                <Input
                  label={tr("Altura de linha")}
                  type="number"
                  min={1.2}
                  max={2}
                  step={0.05}
                  value={numeric(values["--leading-normal"], 1.55)}
                  onChange={(e) =>
                    apply({
                      "--leading-normal": String(
                        Math.max(1.2, Math.min(2, Number(e.target.value))),
                      ),
                    })
                  }
                  block
                />
                <Input
                  label={tr("Peso do texto")}
                  type="number"
                  min={300}
                  max={700}
                  step={100}
                  value={numeric(values["--weight-regular"], 400)}
                  onChange={(e) =>
                    apply({
                      "--weight-regular": String(
                        Math.max(300, Math.min(700, Number(e.target.value))),
                      ),
                    })
                  }
                  block
                />
              </div>
            ),
          },
          {
            id: "spacing",
            label: tr("Espaçamento"),
            content: (
              <div className={styles.editorSection}>
                <Input
                  label="Unidade de espaçamento (px)"
                  type="number"
                  min={2}
                  max={8}
                  step={0.5}
                  value={numeric(values["--space-1"], 4)}
                  onChange={(event) =>
                    spacing(
                      Math.max(2, Math.min(8, Number(event.target.value))),
                    )
                  }
                />
                <Input
                  label="Espaço interno dos cards (px)"
                  type="number"
                  min={8}
                  max={48}
                  value={numeric(values["--card-padding"], 20)}
                  onChange={(event) =>
                    apply({
                      "--card-padding": `${Math.max(8, Math.min(48, Number(event.target.value)))}px`,
                    })
                  }
                />
                <Input
                  label="Altura dos campos (px)"
                  type="number"
                  min={32}
                  max={64}
                  value={numeric(values["--field-height"], 38)}
                  onChange={(event) =>
                    apply({
                      "--field-height": `${Math.max(32, Math.min(64, Number(event.target.value)))}px`,
                    })
                  }
                />
                <Select
                  label={tr("Densidade")}
                  value={
                    overrides.tokens?.["--field-height"] === "46px"
                      ? "comfortable"
                      : "compact"
                  }
                  onChange={(e) =>
                    apply(
                      e.target.value === "comfortable"
                        ? {
                            "--field-height": "46px",
                            "--button-height-md": "42px",
                            "--button-height-sm": "34px",
                            "--space-3": "16px",
                            "--space-4": "20px",
                            "--card-padding": "24px",
                          }
                        : {
                            "--field-height": "38px",
                            "--button-height-md": "34px",
                            "--button-height-sm": "28px",
                            "--space-3": "12px",
                            "--space-4": "16px",
                            "--card-padding": "20px",
                          },
                    )
                  }
                >
                  <option value="compact">{tr("Compacta")}</option>
                  <option value="comfortable">{tr("Confortável")}</option>
                </Select>
                <Select
                  label={tr("Alinhamento das escolhas")}
                  value={values["--choice-align"] || "flex-start"}
                  onChange={(event) =>
                    apply({ "--choice-align": event.target.value })
                  }
                >
                  <option value="flex-start">{tr("No início do rótulo")}</option>
                  <option value="center">{tr("Centralizado")}</option>
                </Select>
                <Select
                  label={tr("Posição vertical dos modais")}
                  value={values["--dialog-align"] || "center"}
                  onChange={(event) =>
                    apply({ "--dialog-align": event.target.value })
                  }
                >
                  <option value="flex-start">{tr("No topo")}</option>
                  <option value="center">{tr("No centro")}</option>
                  <option value="flex-end">{tr("Na base")}</option>
                </Select>
                <p className={styles.caption}>
                  {tr("A escala de espaçamento é compartilhada. Alinhamentos acima controlam escolhas e modais; os demais papéis ficam na aba Tokens.")}</p>
              </div>
            ),
          },
          {
            id: "motion",
            label: tr("Movimento"),
            content: (
              <div className={styles.editorSection}>
                <Select
                  label={tr("Estilo de feedback")}
                  value={
                    numeric(values["--motion-feedback-duration"], 120) === 0
                      ? "instant"
                      : numeric(values["--motion-feedback-duration"], 120) <=
                          120
                        ? "firm"
                        : "smooth"
                  }
                  onChange={(event) => {
                    const durations =
                      event.target.value === "instant"
                        ? [0, 0, 0, 0, 0, 0]
                        : event.target.value === "firm"
                          ? [120, 180, 140, 260, 200, 300]
                          : [150, 200, 150, 300, 220, 300];
                    apply(
                      Object.fromEntries(
                        [
                          "feedback",
                          "context",
                          "context-exit",
                          "orientation",
                          "orientation-exit",
                          "page",
                        ].map((role, index) => [
                          `--motion-${role}-duration`,
                          `${durations[index]}ms`,
                        ]),
                      ),
                    );
                  }}
                >
                  <option value="smooth">{tr("Suave")}</option>
                  <option value="firm">{tr("Firme")}</option>
                  <option value="instant">{tr("Instantâneo")}</option>
                </Select>
                <Select
                  label={tr("Direção de menus e dicas")}
                  value={
                    numeric(values["--motion-context-x"], 0) > 0
                      ? "side"
                      : numeric(values["--motion-context-y"], 6) === 0
                        ? "center"
                        : "origin"
                  }
                  onChange={(event) =>
                    apply({
                      "--motion-context-x":
                        event.target.value === "side" ? "8px" : "0px",
                      "--motion-context-y":
                        event.target.value === "origin" ? "6px" : "0px",
                    })
                  }
                >
                  <option value="origin">{tr("Origem no controle")}</option>
                  <option value="side">{tr("Deslizar lateral")}</option>
                  <option value="center">{tr("Surgimento central")}</option>
                </Select>
                <Select
                  label={tr("Reduzir movimento")}
                  value={String(overrides.tokens?.["--motion-reduced"] ?? 0)}
                  onChange={(event) =>
                    apply({ "--motion-reduced": Number(event.target.value) })
                  }
                >
                  <option value="0">{tr("Seguir o sistema")}</option>
                  <option value="1">{tr("Sempre reduzir")}</option>
                </Select>
                <p className={styles.caption}>
                  {tr("Feedback confirma ações. Menus revelam contexto. Diálogos orientam o foco. A preferência de movimento reduzido do sistema é sempre respeitada.")}</p>
                <ThemeProvider isolate theme={resolveTheme(config)} mode={mode}>
                  <div className={styles.motionSample}>
                    <Popover
                      open={motionExample}
                      onOpenChange={setMotionExample}
                      label={tr("Contexto do movimento")}
                      content={
                        <p>
                          {tr("O contexto surge do controle. Pressione Escape ou clique fora para fechar.")}</p>
                      }
                    >
                      <Button
                        variant="primary"
                        onClick={() => setMotionExample((value) => !value)}
                      >
                        {tr("Testar contexto")}</Button>
                    </Popover>
                    <Button onClick={() => setMotionDialog(true)}>
                      {tr("Testar diálogo")}</Button>
                    <Modal
                      open={motionDialog}
                      onClose={() => setMotionDialog(false)}
                      title={tr("Movimento de orientação")}
                    >
                      <p>
                        {tr("A superfície mantém sua posição e devolve o foco ao fechar.")}</p>
                      <Button onClick={() => setMotionDialog(false)}>
                        {tr("Concluir teste")}</Button>
                    </Modal>
                  </div>
                </ThemeProvider>
              </div>
            ),
          },
          {
            id: "tokens",
            label: tr("Tokens"),
            content: (
              <VisualTokenEditor
                values={values}
                mode={mode}
                onApply={(name, value, scope) => {
                  const canVary = tokenCanVaryByMode(name);
                  if (!canVary) scope = "shared";
                  const next =
                    scope === "shared"
                      ? {
                          ...pending.current,
                          tokens: { ...pending.current.tokens, [name]: value },
                        }
                      : {
                          ...pending.current,
                          modes: {
                            ...pending.current.modes,
                            [mode]: {
                              ...pending.current.modes?.[mode],
                              [name]: value,
                            },
                          },
                        };
                  if (!canVary) {
                    next.modes = { ...next.modes };
                    for (const modeName of ["light", "dark"] as const) {
                      next.modes[modeName] = { ...next.modes[modeName] };
                      delete next.modes[modeName]?.[name as `--${string}`];
                    }
                  }
                  parseTheme(JSON.stringify(next));
                  if (
                    (name === "--primary" || name === "--on-primary") &&
                    scope === "mode"
                  )
                    color(name, value);
                  else {
                    pending.current = next;
                    onChange({ customTheme: JSON.stringify(next) });
                  }
                }}
                onRestore={(name, scope) => {
                  const next = customTheme(config);
                  const canVary = tokenCanVaryByMode(name);
                  if (!canVary || scope === "shared")
                    delete next.tokens?.[name as `--${string}`];
                  if (canVary && scope === "mode")
                    delete next.modes?.[mode]?.[name as `--${string}`];
                  if (!canVary)
                    for (const modeName of ["light", "dark"] as const)
                      delete next.modes?.[modeName]?.[name as `--${string}`];
                  pending.current = next;
                  onChange({ customTheme: JSON.stringify(next) });
                }}
              />
            ),
          },
          {
            id: "export",
            label: tr("Exportar"),
            content: (
              <div className={styles.editorSection}>
                <Button variant="primary" onClick={download}>
                  {tr("Baixar tema JSON")}</Button>
                <CodeBlock
                  label={tr("Tema aplicado")}
                  language="json"
                  code={exportJSON}
                />
                <CodeBlock
                  label={tr("Aplicação React")}
                  language="tsx"
                  code={snippet}
                />
                <Textarea
                  label={tr("Importar tema JSON")}
                  placeholder={tr("Cole o conteúdo de um tema exportado")}
                  value={json}
                  onChange={(e) => setJson(e.target.value)}
                  block
                />
                <Button
                  onClick={() => {
                    try {
                      const { theme, ignored } = importTheme(json);
                      onChange({
                        skin: "refy-site",
                        customTheme: JSON.stringify(theme),
                      });
                      const defined = { ...theme.tokens, ...theme.modes?.light, ...theme.modes?.dark };
                      const brandMissing = !Object.keys(defined).some((name) => name.startsWith("--brand-"));
                      setImportStatus(
                        brandMissing
                          ? "Tema importado. Ele não define a paleta de marca (--brand-*): avatares e logotipo continuam com as cores da marca Refy até você definir esses tokens."
                          : "Tema importado. Confira a prévia nos dois modos.",
                      );
                      if (ignored.length)
                        setImportStatus((status) => `${status} ${ignored.length} token(s) que o Refy não conhece ficaram de fora: ${ignored.slice(0, 12).join(", ")}${ignored.length > 12 ? "…" : ""}.`);
                    } catch (error) {
                      setImportStatus(
                        error instanceof SyntaxError
                          ? "JSON inválido. Confira as aspas, vírgulas e chaves; a prévia foi preservada."
                          : error instanceof Error
                            ? error.message
                            : "Não foi possível importar.",
                      );
                    }
                  }}
                >
                  {tr("Importar tema")}</Button>
                {importStatus && <Callout title={importStatus} />}
              </div>
            ),
          },
  ];
  const section = (id: string) =>
    sections.find((item) => item.id === id)?.content;
  const swatch = (name: string, label: string) => (
    <label className={styles.siteSwatch} key={name}>
      <span>{label}</span>
      <span className={styles.siteSwatchRow}>
        <input
          type="color"
          aria-label={label}
          value={hex(values[name] ?? "")}
          onChange={(e) => color(name, e.target.value)}
        />
        <Input
          key={values[name]}
          aria-label={`${label} ${tr("em hexadecimal")}`}
          defaultValue={hex(values[name] ?? "").toUpperCase()}
          onBlur={(e) => {
            if (/^#[0-9a-f]{6}$/i.test(e.target.value))
              color(name, e.target.value);
            else e.target.value = hex(values[name] ?? "").toUpperCase();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          block
        />
      </span>
    </label>
  );
  if (variant === "site") {
    const radiusValue = numeric(values["--control-radius"], 8);
    return (
      <div className={styles.siteEditor}>
        <header className={styles.siteEditorHeader}>
          <h2>{tr("Personalizar")}</h2>
          <p>{tr("Ajuste as cores, tipografia e outros tokens do tema.")}</p>
        </header>
        <Tabs
          defaultValue={initialTab}
          items={[
            {
              id: "colors",
              label: tr("Cores"),
              content: (
                <div className={styles.editorSection}>
                  <div className={styles.siteSwatches}>
                    {swatch("--primary", "Cor principal")}
                    {swatch("--brand-primary-container", "Acento")}
                    {swatch("--surface", "Superfície")}
                    {swatch("--ink-1", "Texto")}
                  </div>
                  <div className={styles.sitePalette}>
                    <span>{tr("Paleta do tema")}</span>
                    <div>
                      {(
                        [
                          "--chart-primary",
                          "--chart-secondary",
                          "--chart-tertiary",
                          "--chart-quaternary",
                          "--chart-quinary",
                          "--chart-senary",
                        ] as const
                      ).map((name, index) => (
                        <label key={name}>
                          <input
                            type="color"
                            aria-label={`${tr("Paleta do tema, cor")} ${index + 1}`}
                            value={hex(values[name] ?? "")}
                            onChange={(e) => color(name, e.target.value)}
                          />
                          <small>{hex(values[name] ?? "").toUpperCase()}</small>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Accordion
                    variant="plain"
                    type="multiple"
                    defaultValue={["shape"]}
                    className={styles.siteSections}
                    items={[
                      {
                        id: "shape",
                        title: tr("Forma"),
                        content: (
                    <div className={styles.siteRadius}>
                      <Slider
                        label={tr("Raio dos componentes")}
                        showValue={false}
                        min={0}
                        max={24}
                        value={radiusValue}
                        onChange={(value) => radius(value)}
                      />
                      <Input
                        aria-label={tr("Raio dos componentes em pixels")}
                        type="number"
                        min={0}
                        max={24}
                        value={radiusValue}
                        onChange={(e) =>
                          radius(Math.max(0, Math.min(24, Number(e.target.value))))
                        }
                      />
                      <span>px</span>
                      <span
                        className={styles.siteRadiusSample}
                        aria-hidden="true"
                      />
                    </div>
                        ),
                      },
                      {
                        id: "type",
                        title: (
                          <span className={styles.siteSectionTitle}>
                            {tr("Tipografia")}<small>
                              {tr("Títulos em")} {(values["--font-heading"] ?? "").split(",")[0].replace(/["']/g, "")} {tr("e texto em")} {(values["--font-body"] ?? "").split(",")[0].replace(/["']/g, "")}.
                            </small>
                          </span>
                        ),
                        content: section("type"),
                      },
                    ]}
                  />
                </div>
              ),
            },
            { id: "type", label: tr("Tipografia"), content: section("type") },
            { id: "shape", label: tr("Forma"), content: section("shape") },
            { id: "spacing", label: tr("Espaçamento"), content: section("spacing") },
            { id: "motion", label: tr("Movimento"), content: section("motion") },
            { id: "tokens", label: tr("Tokens"), content: section("tokens") },
          ]}
        />
        <footer className={styles.siteEditorFooter}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange({ customTheme: "", fonts: presetFonts[config.skin] })
            }
          >
            {tr("↻ Restaurar padrão")}</Button>
          <small>{tr("As mudanças ficam neste navegador.")}</small>
        </footer>
      </div>
    );
  }
  return (
    <div className={styles.editorBody}>
      <div className={styles.editorIntro}>
        <span>
          {tr("Um tema reúne cores, fontes, forma, espaçamentos e todos os tokens. O modo altera apenas as cores de claro/escuro.")}</span>
      </div>
      <Input
        label={tr("Nome do tema")}
        value={overrides.name}
        onChange={(event) => {
          const next = { ...pending.current, name: event.target.value };
          pending.current = next;
          onChange({ customTheme: JSON.stringify(next) });
        }}
      />
      <Tabs
        defaultValue={initialTab}
        wrap
        variant="pill"
        items={sections}
      />
      <Button
        variant="secondary"
        onClick={() =>
          onChange({ customTheme: "", fonts: presetFonts[config.skin] })
        }
        disabled={!config.customTheme}
      >
        {tr("Restaurar tema escolhido")}</Button>
    </div>
  );
}
