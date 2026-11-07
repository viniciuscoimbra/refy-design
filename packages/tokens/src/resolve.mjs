// Resolve os valores CSS do Refy para o que o React Native aceita.
// O RN não tem cascata nem var(): todo alias é expandido aqui, depois de o tema
// sobrescrever as variáveis, que é a mesma ordem em que o ThemeProvider web aplica.

const REM = 16;

export function resolveVars(name, values, stack = []) {
  if (stack.includes(name)) throw new Error(`Ciclo: ${[...stack, name].join(' → ')}`);
  if (!Object.hasOwn(values, name)) throw new Error(`Token ausente: ${name}`);
  return String(values[name]).replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/g, (_, dep, fallback) =>
    Object.hasOwn(values, dep) ? resolveVars(dep, values, [...stack, name]) : (fallback ?? (() => { throw new Error(`Token ausente: ${dep} (em ${name})`); })()).trim());
}

function parseColor(text) {
  const t = text.trim().toLowerCase();
  if (t === 'transparent') return [0, 0, 0, 0];
  // Os temas usam black e white em color-mix() para escurecer e clarear; o resto das cores nomeadas não aparece em token.
  if (t === 'black') return [0, 0, 0, 1];
  if (t === 'white') return [255, 255, 255, 1];
  let m = t.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map(c => c + c).join('');
    const n = h.match(/../g).map(x => parseInt(x, 16));
    return [n[0], n[1], n[2], n.length === 4 ? n[3] / 255 : 1];
  }
  m = t.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/);
  if (m) {
    const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return [+m[1], +m[2], +m[3], a];
  }
  m = t.match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?(?:\s*\/\s*([\d.]+%?))?\s*\)$/);
  if (m) {
    const L = m[1].endsWith('%') ? parseFloat(m[1]) / 100 : +m[1];
    const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : +m[4];
    return [...oklchToSrgb(L, +m[2], +m[3]), a];
  }
  throw new Error(`Cor que o resolvedor não conhece: ${text}`);
}

// O RN não lê oklch(). Conversão OKLCH → OKLab → sRGB linear → sRGB (Björn Ottosson).
// Fora do gamut sRGB o canal é cortado; o navegador reduz o croma, então ali a cor pode diferir.
export function oklchToSrgb(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const [l, m, s] = [l_ ** 3, m_ ** 3, s_ ** 3];
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return lin.map(x => {
    const v = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    return Math.min(255, Math.max(0, v * 255));
  });
}

function formatColor([r, g, b, a]) {
  const c = v => Math.round(v);
  if (a >= 1) return '#' + [r, g, b].map(v => c(v).toString(16).padStart(2, '0')).join('');
  return `rgba(${c(r)}, ${c(g)}, ${c(b)}, ${+a.toFixed(4)})`;
}

// color-mix(in srgb, A p%, B [q%]) com pré-multiplicação de alfa, como a especificação CSS Color 5.
export function colorMix(expression) {
  const m = expression.match(/^color-mix\(\s*in\s+srgb\s*,\s*(.+?)(?:\s+([\d.]+)%)?\s*,\s*(.+?)(?:\s+([\d.]+)%)?\s*\)$/);
  if (!m) throw new Error(`color-mix fora do formato suportado: ${expression}`);
  let p1 = m[2] === undefined ? undefined : +m[2] / 100;
  let p2 = m[4] === undefined ? undefined : +m[4] / 100;
  if (p1 === undefined && p2 === undefined) p1 = p2 = 0.5;
  else if (p1 === undefined) p1 = 1 - p2;
  else if (p2 === undefined) p2 = 1 - p1;
  const sum = p1 + p2;
  const scale = Math.min(sum, 1);
  p1 /= sum; p2 /= sum;
  const [a, b] = [parseColor(m[1]), parseColor(m[3])];
  const alpha = a[3] * p1 + b[3] * p2;
  const mix = i => alpha === 0 ? 0 : (a[i] * a[3] * p1 + b[i] * b[3] * p2) / alpha;
  return formatColor([mix(0), mix(1), mix(2), alpha * scale]);
}

function expandColorMix(text) {
  let out = text;
  for (let guard = 0; out.includes('color-mix(') && guard < 20; guard++) {
    const start = out.indexOf('color-mix(');
    let depth = 0, end = start;
    for (; end < out.length; end++) {
      if (out[end] === '(') depth++;
      else if (out[end] === ')' && --depth === 0) break;
    }
    out = out.slice(0, start) + colorMix(out.slice(start, end + 1)) + out.slice(end + 1);
  }
  return out;
}

// Classifica e converte um valor já sem var(). `kind` diz ao componente nativo como usar.
export function toNative(raw) {
  const text = expandColorMix(String(raw).trim());
  let m;
  if ((m = text.match(/^(-?[\d.]+)px$/))) return { kind: 'size', value: +m[1] };
  if ((m = text.match(/^(-?[\d.]+)rem$/))) return { kind: 'size', value: +m[1] * REM, note: `${text} convertido com 1rem = ${REM}` };
  if ((m = text.match(/^(-?[\d.]+)em$/))) return { kind: 'em', value: +m[1], note: 'relativo ao tamanho da fonte; multiplique por fontSize' };
  if ((m = text.match(/^(-?[\d.]+)ms$/))) return { kind: 'duration', value: +m[1] };
  if ((m = text.match(/^(-?[\d.]+)s$/))) return { kind: 'duration', value: +m[1] * 1000 };
  if (/^-?[\d.]+$/.test(text)) return { kind: 'number', value: +text };
  if (/^(#[0-9a-f]{3,8}|rgba?\([^()]*\)|oklch\([^()]*\)|transparent)$/i.test(text)) return { kind: 'color', value: formatColor(parseColor(text)) };
  if ((m = text.match(/^cubic-bezier\(([^()]*)\)$/))) return { kind: 'easing', value: m[1].split(',').map(Number) };
  if (/(?:#[0-9a-f]{3,8}|rgba?\()/i.test(text) && /-?[\d.]+px/.test(text))
    return { kind: 'shadow', value: text, note: 'boxShadow em sintaxe CSS; exige React Native 0.76+ com a nova arquitetura' };
  if (/^none$/.test(text)) return { kind: 'keyword', value: 'none' };
  if (/^[\w"'][\w\s"',-]*$/.test(text) && text.includes(',')) {
    const families = text.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
    return { kind: 'fontFamily', value: families[0], note: `pilha web: ${families.join(', ')}` };
  }
  if (/^[a-z-]+$/i.test(text)) return { kind: 'keyword', value: text };
  return { kind: 'unsupported', value: text, note: 'sem equivalente direto no React Native; o componente nativo decide e registra a divergência' };
}

export function resolveAll(values) {
  const out = {};
  for (const name of Object.keys(values).sort((a, b) => a.localeCompare(b, 'en'))) out[name] = toNative(resolveVars(name, values));
  return out;
}

// Aplica um tema no formato do ThemeProvider web ({ name, tokens, modes }) sobre os valores do modo.
export function themeOverlay(base, theme, mode) {
  const values = { ...base };
  for (const [key, value] of Object.entries({ ...theme?.tokens, ...theme?.modes?.[mode] })) {
    if (value === undefined) continue;
    if (!/^--[\w-]+$/.test(key) || !['string', 'number'].includes(typeof value)) throw new Error(`Token de tema inválido: ${key}`);
    values[key] = String(value);
  }
  return values;
}
