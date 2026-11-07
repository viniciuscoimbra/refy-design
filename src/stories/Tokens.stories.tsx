import { useLayoutEffect, useRef, useState } from "react";
import { useThemeConfiguration } from "./useThemeConfiguration";
import type { Meta, StoryObj } from "@storybook/react";
import { Button, Input, CodeBlock } from "../index";
import { TypographySample } from "./TypographySample";
import type { FontSet } from "../lib/fontSets";
import source from "../tokens/foundations.tokens.json";
import styles from "./VisualSystem.module.css";

const groups = [source.base, source.light, source.dark, source.editorial];
const names = [
  ...new Set(
    groups.flatMap((group) => [
      ...Object.keys(group)
        .filter((key) => !key.startsWith("$"))
        .map((key) => "--" + key),
      ...Object.keys(group.$extensions["org.refy.css"]),
    ]),
  ),
].sort();
function TokenBrowser({
  mode,
  fonts,
  onFontsChange,
}: {
  mode: string;
  fonts: FontSet;
  onFontsChange: (value: FontSet) => void;
}) {
  const scope = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [exported, setExported] = useState(false);
  useLayoutEffect(() => {
    if (scope.current) {
      const css = getComputedStyle(scope.current);
      setValues(
        Object.fromEntries(
          names.map((name) => [name, css.getPropertyValue(name).trim()]),
        ),
      );
    }
  }, [mode, fonts]);
  const filtered = names.filter((name) =>
    (name + " " + values[name]).toLowerCase().includes(query.toLowerCase()),
  );
  const visible = filtered.slice(offset, offset + 40);
  return (
    <main ref={scope} className={styles.page}>
      <p className={styles.eyebrow}>Fundamentos / Tokens</p>
      <h1 className={styles.title}>Encontre e personalize cada valor</h1>
      <p className={styles.lead}>
        Valores efetivos do tema{" "}
        {mode === "dark"
          ? "escuro"
          : mode === "editorial"
            ? "editorial"
            : "claro"}
        . Troque o modo na barra do Storybook para comparar.
      </p>
      <TypographySample value={fonts} onChange={onFontsChange} />
      <nav className={styles.links}>
        <a
          href="./?path=/story/fundamentos-playground--aplicacao"
          target="_top"
        >
          Trocar fontes e temas em uma tela completa →
        </a>
      </nav>
      <div className={styles.row} style={{ margin: "28px 0" }}>
        <Input
          label="Buscar token"
          placeholder="button, field, radius, font…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOffset(0);
          }}
        />
        <Button onClick={() => setExported(!exported)}>
          {exported ? "Fechar CSS" : "Ver CSS do tema"}
        </Button>
        <span className={styles.caption}>{filtered.length} tokens</span>
      </div>
      {exported && (
        <CodeBlock
          label="Valores resolvidos deste tema"
          language="css"
          code={`.minha-aplicacao {\n${names.map((name) => `  ${name}: ${values[name]};`).join("\n")}\n}`}
        />
      )}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Token</th>
              <th>Valor no tema</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((name) => (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td>
                  {values[name] && CSS.supports("color", values[name]) && (
                    <span
                      aria-hidden="true"
                      style={{
                        display: "inline-block",
                        width: 16,
                        height: 16,
                        background: values[name],
                        border: "1px solid var(--line)",
                        borderRadius: 3,
                        marginRight: 8,
                        verticalAlign: "middle",
                      }}
                    />
                  )}
                  <code>{values[name]}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.row} style={{ marginTop: 24 }}>
        <Button
          disabled={offset === 0}
          onClick={() => setOffset(Math.max(0, offset - 40))}
        >
          Anterior
        </Button>
        <span className={styles.caption}>
          {filtered.length ? offset + 1 : 0}–
          {Math.min(offset + 40, filtered.length)} de {filtered.length}
        </span>
        <Button
          disabled={offset + 40 >= filtered.length}
          onClick={() => setOffset(offset + 40)}
        >
          Próximos
        </Button>
      </div>
      <section className={styles.section} style={{ marginTop: 32 }}>
        <h2>Personalize pelo papel</h2>
        <p>
          <code>--primary</code> define uma cor.{" "}
          <code>--button-primary-background</code> define a superfície da ação
          principal e aceita degradês. Use <code>--control-radius</code> e{" "}
          <code>--control-border-width</code> para a geometria compartilhada;
          ajuste <code>--card-radius</code> e <code>--dialog-radius</code>{" "}
          quando essas superfícies pedirem outro formato.
        </p>
        <nav className={styles.links}>
          <a href="./?path=/story/fundamentos-refy--personalizar" target="_top">
            Testar personalização com os componentes
          </a>
        </nav>
      </section>
    </main>
  );
}
const meta = {
  title: "Fundamentos/Tokens",
  parameters: { refyFullPage: true },
} satisfies Meta;
export default meta;
export const Explorar: StoryObj = {
  render: function Render() {
    const [config, update] = useThemeConfiguration();
    return (
      <TokenBrowser
        mode={config.theme}
        fonts={config.fonts}
        onFontsChange={(fonts) => update({ fonts })}
      />
    );
  },
};
