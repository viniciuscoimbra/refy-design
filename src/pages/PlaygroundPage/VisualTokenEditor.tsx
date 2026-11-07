import { tr } from "../RefySitePage/i18n";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Button, Input, Select } from "../../index";
import { fontSets } from "../../lib/fontSets";
import {
  tokenDefinitions,
  tokenNames,
  tokenProperty,
  tokenCanVaryByMode,
  validToken,
} from "./themeConfig";
import styles from "./Workbench.module.css";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
function kindOf(name: string, value = "") {
  const property = tokenProperty(name);
  if (/gradient\(/.test(value)) return "gradient";
  if (property === "font-family") return "font";
  if (["color", "background"].includes(property)) return "color";
  if (property === "box-shadow") return "shadow";
  if (/radius/.test(name)) return "radius";
  if (
    tokenDefinitions[name]?.type === "number" ||
    ["font-weight", "line-height", "z-index", "opacity"].includes(property)
  )
    return "number";
  if (
    tokenDefinitions[name]?.type === "dimension" ||
    [
      "padding",
      "rotate",
      "perspective",
      "gap",
      "border-width",
      "letter-spacing",
      "animation-duration",
    ].includes(property)
  )
    return "dimension";
  return "css";
}
const descriptions: Record<string, string> = {
  color: "Cor color palette paleta",
  font: "Fonte font tipografia família",
  gradient: "Degradê gradient fundo",
  shadow: "Sombra elevação shadow",
  radius: "Raio radius arredondamento cantos",
  dimension: "Medida dimension tamanho espaço espaçamento",
  number: "Número peso altura linha opacidade",
  css: "CSS efeito estilo",
};
const kindLabels: Record<string, string> = {
  color: "Cor",
  font: "Fonte",
  gradient: "Degradê",
  shadow: "Sombra",
  radius: "Arredondamento",
  dimension: "Medida",
  number: "Número",
  css: "Valor CSS",
};
const fonts = [
  ...new Set(
    Object.values(fontSets).flatMap((set) => [set.heading, set.body, set.mono]),
  ),
];
function toHex(value: string) {
  const canvas = document.createElement("canvas"),
    context = canvas.getContext("2d");
  if (!context) return "#087f5b";
  context.fillStyle = value || "#087f5b";
  context.fillRect(0, 0, 1, 1);
  return `#${Array.from(context.getImageData(0, 0, 1, 1).data)
    .slice(0, 3)
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")}`;
}

function gradientParts(value: string) {
  const body = value.slice(value.indexOf("(") + 1, -1),
    parts: string[] = [];
  let depth = 0,
    start = 0;
  for (let i = 0; i < body.length; i++) {
    if (body[i] === "(") depth++;
    if (body[i] === ")") depth--;
    if (body[i] === "," && depth === 0) {
      parts.push(body.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(body.slice(start).trim());
  const angle = /^[-\d.]+deg$/.test(parts[0])
    ? parseFloat(parts.shift()!)
    : 135;
  return {
    angle,
    colors: parts
      .map((part) => part.replace(/\s+[-\d.]+%$/, ""))
      .filter((part) => CSS.supports("color", part)),
  };
}

/** Workbench UI only; values still pass through the central token validator. */
export function VisualTokenEditor({
  values,
  mode,
  onApply,
  onRestore,
}: {
  values: Record<string, string>;
  mode: "light" | "dark";
  onApply: (name: string, value: string, scope: "mode" | "shared") => void;
  onRestore: (name: string, scope: "mode" | "shared") => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(""),
    [selected, setSelected] = useState("--primary");
  const [draft, setDraft] = useState(""),
    [error, setError] = useState(""),
    [status, setStatus] = useState("");
  const [scope, setScope] = useState<"mode" | "shared">("mode");
  const matches = useMemo(
    () =>
      tokenNames.filter((name) =>
        normalize(query)
          .split(/\s+/)
          .filter(Boolean)
          .every((term) =>
            normalize(
              `${name} ${descriptions[kindOf(name, values[name])]} ${name.includes("button") ? "botao ação" : ""}`,
            ).includes(term),
          ),
      ),
    [query, values],
  );
  const current = matches.includes(selected) ? selected : matches[0];
  useEffect(() => {
    setDraft(current ? (values[current] ?? "") : "");
    setError("");
  }, [current, values]);
  const kind = current ? kindOf(current, values[current]) : "css";
  const canVary = current ? tokenCanVaryByMode(current) : false;
  const effectiveScope = canVary ? scope : "shared";
  const commit = (value: string) => {
    setDraft(value);
    if (!current || !validToken(current, value)) {
      setError("Valor inválido. A prévia foi preservada.");
      return;
    }
    try {
      onApply(current, value, effectiveScope);
      setError("");
      setStatus(`${current} aplicado.`);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Não foi possível aplicar.",
      );
    }
  };
  const measurement =
    /^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-z%]*)$/i.exec(
      draft.trim(),
    );
  const number = measurement ? Number(measurement[1]) : NaN;
  const angle = current ? tokenProperty(current) === "rotate" : false;
  const unit =
    measurement?.[2] ?? (kind === "number" ? "" : angle ? "deg" : "px");
  const simpleMeasurement = !!measurement || draft.trim() === "";
  const units = [
    ...new Set([
      unit,
      ...(angle
        ? ["deg", "rad", "grad", "turn"]
        : ["px", "rem", "em", "ch", "%", "ms", "s"]),
    ]),
  ];
  const gradient =
    kind === "gradient" ? gradientParts(draft) : { angle: 135, colors: [] };
  const editGradient = (
    color: string,
    index: number,
    angle = gradient.angle,
  ) => {
    const colors = [
      gradient.colors[0] ?? values["--primary"],
      gradient.colors[1] ?? values["--primary-container"],
    ];
    colors[index] = color;
    commit(`linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`);
  };
  const firstFont = draft.split(",")[0].replace(/["']/g, "").trim();
  const preview: CSSProperties =
    kind === "font"
      ? { fontFamily: draft }
      : kind === "color" || kind === "gradient"
        ? { background: draft }
        : kind === "shadow"
          ? { boxShadow: draft }
          : kind === "radius"
            ? { borderRadius: draft }
            : {};
  return (
    <div className={styles.tokenBrowser}>
      <Input
        label={tr("Buscar token")}
        placeholder={tr("Cor, fonte, radius, button…")}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <p className={styles.caption} role="status">
        {matches.length} {matches.length === 1 ? "resultado" : "resultados"} de{" "}
        {tokenNames.length} tokens
      </p>
      <div
        ref={listRef}
        className={styles.tokenResults}
        role="listbox"
        aria-label={tr("Resultados de tokens")}
        onKeyDown={(event) => {
          if (
            !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) ||
            !matches.length
          )
            return;
          event.preventDefault();
          const index = matches.indexOf(current),
            next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? matches.length - 1
                  : (index +
                      (event.key === "ArrowDown" ? 1 : -1) +
                      matches.length) %
                    matches.length;
          setSelected(matches[next]);
          listRef.current
            ?.querySelectorAll<HTMLButtonElement>('[role="option"]')
            [next]?.focus();
        }}
      >
        {matches.map((name) => (
          <button
            type="button"
            key={name}
            role="option"
            tabIndex={current === name ? 0 : -1}
            aria-selected={current === name}
            onClick={() => {
              setSelected(name);
              setStatus("");
            }}
            className={styles.tokenResult}
          >
            <span
              aria-hidden="true"
              className={styles.tokenSwatch}
              style={
                kindOf(name, values[name]) === "color" ||
                kindOf(name, values[name]) === "gradient"
                  ? { background: values[name] }
                  : kindOf(name, values[name]) === "font"
                    ? { fontFamily: values[name] }
                    : {}
              }
            >
              {kindOf(name, values[name]) === "font" ? tr("Aa") : ""}
            </span>
            <span>
              <code>{name}</code>
              <small>
                {kindLabels[kindOf(name, values[name])]}
                {!values[name] ? tr(" · padrão do componente") : ""}
              </small>
            </span>
          </button>
        ))}
        {!matches.length && (
          <p>
            {tr("Nenhum token encontrado. Tente “cor”, “fonte” ou o nome de um componente.")}</p>
        )}
      </div>
      {current && (
        <section
          className={styles.tokenDetail}
          aria-label={tr("Editar token selecionado")}
        >
          <strong>{current}</strong>
          <div
            className={styles.tokenPreview}
            data-kind={kind}
            style={preview}
            aria-label={tr("Amostra do token")}
          >
            {kind === "font"
              ? tr("Aa Bb Cc · Design que se adapta")
              : kind === "color" || kind === "gradient"
                ? ""
                : "Prévia"}
          </div>
          <Select
            label={tr("Aplicar em")}
            value={effectiveScope}
            onChange={(event) => setScope(event.target.value as typeof scope)}
          >
            <option value="shared">{tr("Todos os modos")}</option>
            <option value="mode" disabled={!canVary}>
              {mode === "dark" ? tr("Apenas escuro") : tr("Apenas claro")}
            </option>
          </Select>
          {kind === "color" && (
            <label className={styles.colorRow}>
              <span>{tr("Cor do token")}</span>
              <input
                type="color"
                aria-label={tr("Cor do token")}
                value={toHex(draft)}
                onChange={(event) => commit(event.target.value)}
              />
              <code>{draft || "Sem valor global"}</code>
            </label>
          )}
          {kind === "font" && (
            <>
              <Select
                label={tr("Família da fonte")}
                value={fonts.includes(firstFont) ? firstFont : "custom"}
                onChange={(event) => {
                  if (event.target.value !== "custom")
                    commit(
                      `"${event.target.value}", ${/Mono|Code/.test(event.target.value) ? "ui-monospace, monospace" : "system-ui, sans-serif"}`,
                    );
                }}
              >
                <option value="custom">{tr("Família personalizada")}</option>
                {fonts.map((font) => (
                  <option key={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </Select>
              <p className={styles.caption}>
                {tr("As famílias incluídas são locais. Para outra fonte, carregue seu arquivo na aplicação.")}</p>
            </>
          )}
          {(kind === "dimension" || kind === "radius" || kind === "number") && (
            <div className={styles.tokenMeasure}>
              <Input
                label={tr("Medida do token")}
                type="number"
                disabled={!simpleMeasurement}
                step={
                  kind === "number" || unit === "rem" || unit === "em" ? 0.1 : 1
                }
                value={Number.isFinite(number) ? number : ""}
                onChange={(event) => {
                  if (event.target.value !== "")
                    commit(`${event.target.value}${unit}`);
                }}
              />
              {kind !== "number" && (
                <Select
                  label={tr("Unidade")}
                  disabled={!simpleMeasurement}
                  value={unit}
                  onChange={(event) =>
                    commit(
                      `${Number.isFinite(number) ? number : 0}${event.target.value}`,
                    )
                  }
                >
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u || "Sem unidade"}
                    </option>
                  ))}
                </Select>
              )}
              {!simpleMeasurement && (
                <p className={styles.caption}>
                  {tr("Esta expressão pode ser alterada em “Editar valor CSS ou referência”.")}</p>
              )}
            </div>
          )}
          {kind === "gradient" && (
            <>
              <p className={styles.caption}>
                {tr("Degradê linear com duas cores. Expressões mais complexas continuam disponíveis na edição CSS.")}</p>
              {[0, 1].map((index) => (
                <label className={styles.colorRow} key={index}>
                  <span>{index === 0 ? tr("Cor inicial") : tr("Cor final")}</span>
                  <input
                    type="color"
                    aria-label={
                      index === 0
                        ? tr("Cor inicial do degradê")
                        : tr("Cor final do degradê")
                    }
                    value={toHex(gradient.colors[index] ?? values["--primary"])}
                    onChange={(event) =>
                      editGradient(event.target.value, index)
                    }
                  />
                </label>
              ))}
              <Input
                label={tr("Ângulo do degradê")}
                type="number"
                min={0}
                max={360}
                value={gradient.angle}
                onChange={(event) => {
                  if (event.target.value !== "")
                    editGradient(
                      gradient.colors[0] ?? values["--primary"],
                      0,
                      Number(event.target.value),
                    );
                }}
              />
            </>
          )}
          <details>
            <summary>{tr("Editar valor CSS ou referência")}</summary>
            <Input
              label={tr("Valor do token")}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <Button onClick={() => commit(draft)}>{tr("Aplicar valor")}</Button>
          </details>
          {!values[current] && (
            <p className={styles.caption}>
              {tr("Este ajuste é opcional e usa o padrão de cada componente até você definir um valor.")}</p>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              onRestore(current, effectiveScope);
              setStatus("Padrão do token restaurado.");
            }}
          >
            {tr("Restaurar este token")}</Button>
          {error && <p role="alert">{error}</p>}
          {status && <p role="status">{status}</p>}
        </section>
      )}
    </div>
  );
}
