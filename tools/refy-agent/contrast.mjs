// Contraste WCAG entre duas cores hexadecimais e os pares de token que o tema precisa respeitar.
// Sem dependência de Node: o validador de tema (theme.mjs) e o editor de tema do site importam
// daqui, para a régua ser uma só.

const BLACK = "#000000";
const WHITE = "#ffffff";

export function parseHex(hex) {
  const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(String(hex).trim());
  if (!match) throw Error(`Cor inválida: ${hex}. Use hexadecimal, como #2163ad.`);
  const full = match[1].length === 3 ? [...match[1]].map((c) => c + c).join("") : match[1];
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
}
export const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function luminance(hex) {
  const [r, g, b] = parseHex(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** Preto ou branco, o que tiver mais contraste com o fundo. Um dos dois sempre passa de 4,5:1. */
export function readableText(background) {
  return contrast(BLACK, background) >= contrast(WHITE, background) ? BLACK : WHITE;
}

// [texto, fundo, mínimo]
export const CONTRAST_PAIRS = [
  ["--ink-1", "--bg", 4.5], ["--ink-2", "--surface", 4.5], ["--ink-3", "--surface", 4.5],
  ["--on-primary", "--primary", 4.5], ["--primary-ink", "--surface", 4.5],
  ["--good-ink", "--good-soft", 4.5], ["--on-good", "--good", 4.5], ["--good", "--surface", 3],
  ["--critical-ink", "--critical-soft", 4.5], ["--on-critical", "--critical", 4.5],
  ["--info-ink", "--info-soft", 4.5], ["--on-info", "--info", 4.5],
  ["--brand-mark", "--bg", 3],
  ["--code-syntax-string", "--code-surface", 4.5], ["--brand-on-primary-container", "--brand-primary-container", 3],
  // Button pinta --on-primary sobre --primary-hover.
  ["--on-primary", "--primary-hover", 4.5],
];

/**
 * Mede cada par cujos dois tokens estão em `colors` (cores já resolvidas em #rrggbb). Aprova pela
 * razão crua, como o WCAG 1.4.3: 4,499:1 não atinge 4,5:1. A razão devolvida é truncada a duas
 * casas, para um par reprovado nunca aparecer como "4,5:1".
 */
export function measurePairs(colors, pairs = CONTRAST_PAIRS) {
  return pairs.flatMap(([foreground, background, min]) => {
    const [text, surface] = [colors[foreground], colors[background]];
    if (!text || !surface) return [];
    const measured = contrast(text, surface);
    return [{ foreground, background, min, ratio: Math.floor(measured * 100) / 100, passed: measured >= min }];
  });
}

/** Pares abaixo do mínimo, com a razão medida e a cor de texto que passa. */
export function contrastIssues(colors, pairs = CONTRAST_PAIRS) {
  return measurePairs(colors, pairs)
    .filter((pair) => !pair.passed)
    .map(({ foreground, background, min, ratio }) => ({ foreground, background, min, ratio, suggestion: readableText(colors[background]) }));
}
