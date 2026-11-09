// Gera e confere tema a partir dos tokens. O contrato é o mesmo de scripts/check-themes.mjs
// (tokens reconhecidos, label, referências resolvíveis, contraste AA de texto, estado e marca);
// este módulo lê só o que vai no pacote (foundations.tokens.json e catalog.themeTokens), então
// funciona dentro de node_modules sem os scripts do repositório.

// ---- cor: sRGB ↔ OKLCH --------------------------------------------------------------------
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function parseHex(hex) {
  const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(String(hex).trim());
  if (!match) throw Error(`Cor inválida: ${hex}. Use hexadecimal, como #2163ad.`);
  const full = match[1].length === 3 ? [...match[1]].map((c) => c + c).join("") : match[1];
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
}
const toHex = (rgb) => "#" + rgb.map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, "0")).join("");

export function hexToOklch(hex) {
  const [r, g, b] = parseHex(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, c: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}
function oklchToRgb({ l, c, h }) {
  const a = c * Math.cos((h * Math.PI) / 180), b = c * Math.sin((h * Math.PI) / 180);
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];
}
// Fora do gamut sRGB, reduz o croma até caber: a cor muda de intensidade, nunca de matiz.
export function oklchToHex({ l, c, h }) {
  l = Math.min(1, Math.max(0, l));
  let low = 0, high = c, rgb = oklchToRgb({ l, c, h });
  const inside = (v) => v.every((x) => x >= -1e-4 && x <= 1 + 1e-4);
  if (!inside(rgb)) {
    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2;
      if (inside(oklchToRgb({ l, c: mid, h }))) low = mid; else high = mid;
    }
    rgb = oklchToRgb({ l, c: low, h });
  }
  return toHex(rgb.map(toGamma));
}
function luminance(hex) {
  const [r, g, b] = parseHex(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
// Anda na luminosidade até o contraste mínimo, mantendo matiz e croma.
function fit(color, against, min, direction) {
  let current = { ...color };
  for (let i = 0; i < 100 && contrast(oklchToHex(current), against) < min; i++)
    current = { ...current, l: Math.min(1, Math.max(0, current.l + direction * 0.01)) };
  return oklchToHex(current);
}

// ---- fundação e contrato ------------------------------------------------------------------
function cssValue(token) {
  const v = token.$value;
  switch (token.$type) {
    case "color": return "#" + v.components.map((n) => Math.round(n * 255).toString(16).padStart(2, "0")).join("");
    case "dimension": case "duration": return `${v.value}${v.unit}`;
    case "number": return String(v);
    case "fontFamily": return v.map((x) => (/\s/.test(x) ? JSON.stringify(x) : x)).join(", ");
    case "cubicBezier": return `cubic-bezier(${v.join(", ")})`;
    default: return String(v);
  }
}
function declarations(group = {}) {
  const values = {};
  for (const [name, token] of Object.entries(group)) if (!name.startsWith("$")) values[`--${name}`] = cssValue(token);
  for (const [name, entry] of Object.entries(group.$extensions?.["org.refy.css"] ?? {})) values[name] = entry.value;
  return values;
}
export const foundationValues = (foundations, mode) => ({ ...declarations(foundations.base), ...declarations(foundations[mode]) });

export const CONTRAST_PAIRS = [
  ["--ink-1", "--bg", 4.5], ["--ink-2", "--surface", 4.5], ["--ink-3", "--surface", 4.5],
  ["--on-primary", "--primary", 4.5], ["--primary-ink", "--surface", 4.5],
  ["--good-ink", "--good-soft", 4.5], ["--on-good", "--good", 4.5], ["--good", "--surface", 3],
  ["--critical-ink", "--critical-soft", 4.5], ["--on-critical", "--critical", 4.5],
  ["--info-ink", "--info-soft", 4.5], ["--on-info", "--info", 4.5],
  ["--brand-mark", "--bg", 3],
  ["--code-syntax-string", "--code-surface", 4.5], ["--brand-on-primary-container", "--brand-primary-container", 3],
  // Fora de check-themes: Button pinta --on-primary sobre --primary-hover.
  ["--on-primary", "--primary-hover", 4.5],
];

function resolveToken(name, values, path = []) {
  if (path.includes(name)) throw Error("Ciclo de tokens: " + [...path, name].join(" → "));
  if (!(name in values)) throw Error("Referência ausente: " + name);
  return String(values[name]).replace(/var\((--[\w-]+)\)/g, (_, next) => resolveToken(next, values, [...path, name]));
}

export function validateTheme(theme, { catalog, foundations }) {
  const errors = [], pairs = [];
  const known = new Set(catalog.themeTokens);
  if (!theme || typeof theme !== "object") return { passed: false, errors: ["O tema precisa ser um objeto JSON."], pairs };
  if (typeof theme.name !== "string" || !theme.name.trim()) errors.push("name: texto obrigatório.");
  if (typeof theme.label !== "string" || !theme.label.trim()) errors.push("label: nome de exibição obrigatório.");
  for (const mode of Object.keys(theme.modes ?? {}))
    if (!["light", "dark", "editorial"].includes(mode)) errors.push(`modes.${mode}: modo desconhecido; use light ou dark.`);
  for (const group of [theme.tokens ?? {}, ...Object.values(theme.modes ?? {})])
    for (const [key, value] of Object.entries(group)) {
      if (!known.has(key)) errors.push(`Token não reconhecido: ${key}.`);
      if (typeof value !== "string") errors.push(`${key}: o valor precisa ser texto.`);
    }
  const modes = ["light", "dark", ...(theme.modes?.editorial ? ["editorial"] : [])];
  for (const mode of modes) {
    const values = { ...foundationValues(foundations, mode), ...theme.tokens, ...theme.modes?.[mode] };
    for (const [fg, bg, min] of CONTRAST_PAIRS) {
      if (!(fg in values) || !(bg in values)) continue;
      let a, b;
      try { [a, b] = [resolveToken(fg, values), resolveToken(bg, values)]; }
      catch (error) { errors.push(`${mode}: ${error.message}`); continue; }
      [a, b] = [a, b].map((v) => v.trim().replace(/^#([\da-f])([\da-f])([\da-f])$/i, "#$1$1$2$2$3$3"));
      if ([a, b].some((v) => /color-mix\(|gradient\(/i.test(v))) {
        pairs.push({ mode, foreground: fg, background: bg, min, ratio: null, passed: null, note: "valor composto (color-mix, gradiente): conferir no navegador" });
        continue;
      }
      const unmeasurable = [a, b].filter((v) => !/^#[\da-f]{6}$/i.test(v));
      if (unmeasurable.length) {
        pairs.push({ mode, foreground: fg, background: bg, min, ratio: null, passed: false });
        errors.push(`${mode}: ${fg}/${bg} usa ${unmeasurable.join(" e ")}, que não dá para medir; use hexadecimal #rrggbb.`);
        continue;
      }
      const ratio = Math.round(contrast(a, b) * 100) / 100;
      pairs.push({ mode, foreground: fg, background: bg, values: [a, b], min, ratio, passed: ratio >= min });
      if (ratio < min) errors.push(`${mode}: contraste ${fg}/${bg} = ${ratio} < ${min}.`);
    }
  }
  return { passed: errors.length === 0, errors, pairs };
}

// ---- geração ------------------------------------------------------------------------------
const RADIUS = {
  sharp: { "--radius-xs": "1px", "--radius-sm": "2px", "--radius-md": "3px", "--radius-lg": "4px", "--radius-xl": "6px", "--radius-default": "3px", "--card-radius": "4px", "--control-radius": "3px", "--control-group-radius": "4px", "--chip-radius": "3px" },
  round: { "--radius-xs": "4px", "--radius-sm": "8px", "--radius-md": "12px", "--radius-lg": "16px", "--radius-xl": "24px", "--radius-default": "12px", "--card-radius": "16px", "--control-radius": "12px", "--control-group-radius": "16px", "--chip-radius": "999px" },
};
const DENSITY = {
  compact: { "--button-height-md": "32px", "--button-height-sm": "26px", "--field-height": "32px", "--card-padding": "14px" },
  comfortable: { "--button-height-md": "42px", "--button-height-sm": "34px", "--field-height": "42px", "--card-padding": "24px" },
};
const font = (family, fallback) => `${/[\s]/.test(family) && !/^["']/.test(family) ? JSON.stringify(family) : family}, ${fallback}`;

export function generateTheme(input, context) {
  const { name, label = name, description, primary } = input;
  if (typeof name !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(name)) throw Error("name: use letras minúsculas, números e hífen, como minha-marca.");
  const seed = hexToOklch(primary);
  const hue = seed.h, chroma = seed.c;
  const notes = [];
  const tint = (l, c) => oklchToHex({ l, c: Math.min(c, chroma), h: hue });
  const white = "#ffffff";

  // Claro
  let lightPrimary = oklchToHex(seed), onPrimary = white;
  if (contrast(white, lightPrimary) < 4.5) {
    const dark = tint(0.2, 0.03);
    if (contrast(dark, lightPrimary) >= 4.5) onPrimary = dark;
    else { lightPrimary = fit(seed, white, 4.5, -1); notes.push(`Primária clara escurecida para ${lightPrimary}: ${primary} não atinge 4,5:1 com texto branco nem escuro.`); }
  }
  const lp = hexToOklch(lightPrimary);
  const lightSurface = white;
  const lightBg = tint(0.985, 0.006);
  const light = {
    "--bg": lightBg, "--surface": lightSurface, "--surface-2": tint(0.965, 0.008),
    "--surface-container": tint(0.965, 0.008), "--surface-container-low": tint(0.978, 0.006), "--surface-container-high": tint(0.94, 0.01),
    "--ink-1": fit({ l: 0.22, c: Math.min(chroma, 0.02), h: hue }, lightBg, 7, -1),
    "--ink-2": fit({ l: 0.42, c: Math.min(chroma, 0.025), h: hue }, lightSurface, 4.5, -1),
    "--ink-3": fit({ l: 0.5, c: Math.min(chroma, 0.02), h: hue }, lightSurface, 4.5, -1),
    "--ink-4": tint(0.6, 0.02), "--line": tint(0.91, 0.012), "--line-soft": tint(0.945, 0.008), "--outline": tint(0.62, 0.02),
    "--primary": lightPrimary, "--on-primary": onPrimary,
    "--primary-hover": fit({ ...lp, l: lp.l - 0.06 }, onPrimary, 4.5, onPrimary === white ? -1 : 1),
    "--primary-container": oklchToHex({ ...lp, l: lp.l - 0.12 }),
    "--primary-ink": fit(lp, lightSurface, 4.5, -1),
    "--primary-soft": tint(0.955, 0.035),
    "--chart-primary": lightPrimary, "--chart-secondary": oklchToHex({ ...lp, l: Math.min(0.85, lp.l + 0.15) }),
    "--chart-tertiary": oklchToHex({ ...lp, l: lp.l - 0.12 }), "--chart-quaternary": oklchToHex({ ...lp, l: 0.88, c: Math.min(lp.c, 0.08) }),
    "--chart-senary": tint(0.95, 0.04),
  };
  const onContainer = contrast(white, light["--primary-container"]) >= 4.5 ? white : tint(0.15, 0.03);
  Object.assign(light, {
    "--on-primary-container": onContainer,
    "--brand-mark": contrast(lightPrimary, lightBg) >= 3 ? "var(--primary)" : "var(--primary-ink)",
    "--brand-primary": lightPrimary, "--brand-primary-container": light["--primary-container"],
    "--brand-on-primary": onPrimary, "--brand-on-primary-container": onContainer,
    "--brand-glow": `0 0 8px ${lightPrimary}80`,
  });

  // Escuro
  const darkBg = tint(0.18, 0.012), darkSurface = tint(0.22, 0.014);
  const darkPrimarySeed = { l: Math.max(0.74, Math.min(0.82, seed.l + 0.2)), c: Math.min(chroma, 0.15), h: hue };
  const darkPrimary = oklchToHex(darkPrimarySeed);
  const darkOn = fit({ l: 0.2, c: Math.min(chroma, 0.04), h: hue }, darkPrimary, 4.5, -1);
  const dp = hexToOklch(darkPrimary);
  const dark = {
    "--bg": darkBg, "--surface": darkSurface, "--surface-2": tint(0.26, 0.016),
    "--surface-container": tint(0.26, 0.016), "--surface-container-low": tint(0.24, 0.014), "--surface-container-high": tint(0.3, 0.018),
    "--ink-1": fit({ l: 0.95, c: Math.min(chroma, 0.015), h: hue }, darkBg, 7, 1),
    "--ink-2": fit({ l: 0.84, c: Math.min(chroma, 0.02), h: hue }, darkSurface, 4.5, 1),
    "--ink-3": fit({ l: 0.74, c: Math.min(chroma, 0.02), h: hue }, darkSurface, 4.5, 1),
    "--ink-4": tint(0.64, 0.02), "--line": tint(0.33, 0.016), "--line-soft": tint(0.28, 0.014), "--outline": tint(0.62, 0.02),
    "--primary": darkPrimary, "--on-primary": darkOn,
    "--primary-hover": fit({ ...dp, l: Math.min(0.92, dp.l + 0.06) }, darkOn, 4.5, 1),
    "--primary-container": lightPrimary,
    "--primary-ink": fit({ ...dp, l: Math.max(dp.l, 0.82) }, darkSurface, 4.5, 1),
    "--primary-soft": tint(0.3, 0.05),
    "--chart-primary": darkPrimary, "--chart-secondary": oklchToHex({ ...dp, l: Math.min(0.9, dp.l + 0.08) }),
    "--chart-tertiary": oklchToHex({ ...dp, l: dp.l - 0.12 }), "--chart-quaternary": oklchToHex({ ...dp, l: 0.9, c: Math.min(dp.c, 0.08) }),
    "--chart-senary": tint(0.35, 0.05),
    "--surface-tint": darkPrimary,
  };
  const darkTextOnLight = tint(0.15, 0.03);
  const onDarkContainer = contrast(white, lightPrimary) >= contrast(darkTextOnLight, lightPrimary) ? white : darkTextOnLight;
  Object.assign(dark, {
    "--on-primary-container": onDarkContainer,
    "--brand-mark": contrast(darkPrimary, darkBg) >= 3 ? "var(--primary)" : "var(--primary-ink)",
    "--brand-primary": darkPrimary, "--brand-primary-container": lightPrimary,
    "--brand-on-primary": darkOn, "--brand-on-primary-container": onDarkContainer,
    "--brand-glow": `0 0 8px ${darkPrimary}80`,
  });

  const tokens = {};
  if (input.radius && input.radius !== "default") {
    if (!RADIUS[input.radius]) throw Error("radius: use sharp, default ou round.");
    Object.assign(tokens, RADIUS[input.radius]);
  }
  if (input.density && input.density !== "default") {
    if (!DENSITY[input.density]) throw Error("density: use compact, default ou comfortable.");
    Object.assign(tokens, DENSITY[input.density]);
  }
  for (const key of ["fontBody", "fontHeading", "fontMono", "label", "description"])
    if (input[key] !== undefined && (typeof input[key] !== "string" || !input[key].trim())) throw Error(`${key}: use texto.`);
  if (input.fontBody) tokens["--font-body"] = font(input.fontBody, "system-ui, sans-serif");
  if (input.fontHeading)
    for (const key of ["--font-heading", "--font-headline", "--font-brand"]) tokens[key] = font(input.fontHeading, "system-ui, sans-serif");
  if (input.fontMono) tokens["--font-mono"] = font(input.fontMono, "ui-monospace, monospace");

  const theme = {
    name, label,
    ...(description ? { description } : {}),
    tokens,
    modes: { light, dark },
  };
  // Estado (good/critical/info) fica com a fundação; se a superfície nova derrubar algum par, o
  // relatório diz qual, em vez de trocar a cor de estado por conta própria.
  const report = validateTheme(theme, context);
  return { theme, notes, validation: report };
}
