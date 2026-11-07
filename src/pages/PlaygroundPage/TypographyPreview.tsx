import { tr } from "../RefySitePage/i18n";
import { useLayoutEffect, useRef, useState } from "react";
import {
  Button,
  Input,
  Select,
  CodeBlock,
  Prose,
  Segmented,
  TableOfContents,
} from "../../index";
import styles from "./Showcases.module.css";
import catalog from "./ComponentDocumentation.module.css";
import { fontSets, type FontSet } from "../../lib/fontSets";

const sample = "A forma das palavras muda a experiência de leitura.";
const scale = [
  ["Título principal", "--text-h1"],
  ["Título de seção", "--text-h2"],
  ["Subtítulo", "--text-h3"],
  ["Título de apoio", "--text-h4"],
  ["Texto de leitura", "--text-base"],
  ["Texto auxiliar", "--text-sm"],
  ["Legenda", "--text-xs"],
  ["Código", "--text-sm"],
];
export function TypographyPreview({
  onCustomize,
  fonts,
  onFonts,
  theme,
}: {
  theme: import("../../lib/ThemeProvider").RefyTheme;
  fonts: FontSet;
  onFonts: (fonts: FontSet) => void;
  onCustomize: () => void;
}) {
  const [view, setView] = useState("article");
  const [query, setQuery] = useState("");
  const sets = Object.entries(fontSets).filter(([id]) => id !== "legacy");
  const items = sets.filter(([, set]) =>
    `${set.label} ${set.description}`
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase()),
  );
  const ref = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState({
    heading: fontSets[fonts].heading as string,
    body: fontSets[fonts].body as string,
    mono: fontSets[fonts].mono as string,
  });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const css = getComputedStyle(ref.current);
    const name = (role: string) =>
      css
        .getPropertyValue(`--font-${role}`)
        .split(",")[0]
        .replace(/["']/g, "")
        .trim();
    setSelected({
      heading: name("heading"),
      body: name("body"),
      mono: name("mono"),
    });
  }, [theme]);
  return (
    <main
      ref={ref}
      className={`${catalog.layout} ${catalog.catalogLayout}`}
      aria-label={tr("Tipografia editorial")}
    >
      <aside className={catalog.sidebar}>
        <div className={catalog.navigationHead}>
          <strong>{tr("Tipografia")}</strong>
          <span>{sets.length} {tr("conjuntos · títulos, corpo e código")}</span>
        </div>
        <Input
          label={tr("Buscar fontes")}
          placeholder={tr("Família ou estilo…")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <nav
          className={catalog.componentNav}
          aria-label={tr("Escolher conjunto tipográfico")}
        >
          <section>
            <h2>{tr("Conjuntos de fontes")}</h2>
            {items.map(([id, set]) => (
              <Button
                key={id}
                block
                size="sm"
                variant="ghost"
                aria-current={fonts === id ? "page" : undefined}
                onClick={() => onFonts(id as FontSet)}
              >
                {set.label}
              </Button>
            ))}
            {!items.length && <p role="status">{tr("Nenhum conjunto encontrado.")}</p>}
          </section>
        </nav>
        <a
          href="https://fonts.google.com/knowledge/choosing_type/pairing_typefaces"
          target="_blank"
          rel="noreferrer"
        >
          {tr("Combinar fontes · Google Fonts ↗")}</a>
        <small>
          {tr("Curadoria refy: combinações por contraste e superfamília. Fontes locais, sem consulta externa ao aplicar.")}</small>
      </aside>
      <div className={catalog.mobileNavigation}>
        <Select
          label={tr("Conjunto tipográfico")}
          value={fonts}
          onChange={(event) => onFonts(event.target.value as FontSet)}
        >
          {sets.map(([id, set]) => (
            <option key={id} value={id}>
              {set.label}
            </option>
          ))}
        </Select>
      </div>
      <div className={catalog.document}>
        <header className={styles.pageHeader}>
          <div>
            <h1>{tr("Tipografia")}</h1>
            <p>
              {tr("Experimente fontes, hierarquia e ritmo de leitura no mesmo texto.")}</p>
          </div>
          <Button onClick={onCustomize}>{tr("Personalizar tipografia")}</Button>
        </header>
        <section className={styles.typeRoles} aria-label={tr("Fontes aplicadas")}>
          <div data-type-role="heading">
            <small>{tr("Títulos ·")} {selected.heading}</small>
            <strong style={{ fontFamily: "var(--font-heading)" }}>
              {tr("A forma das ideias")}</strong>
          </div>
          <div data-type-role="body">
            <small>{tr("Corpo ·")} {selected.body}</small>
            <p style={{ fontFamily: "var(--font-body)" }}>
              {tr("Palavras que convidam à leitura.")}</p>
          </div>
          <div data-type-role="mono">
            <small>{tr("Código ·")} {selected.mono}</small>
            <code>const tema = "seu produto";</code>
          </div>
        </section>
        <div className={styles.sampleToolbar}>
          <Segmented
            label={tr("Amostra de texto")}
            value={view}
            onChange={setView}
            options={[
              { value: "article", label: tr("Artigo") },
              { value: "scale", label: tr("Escala") },
              { value: "elements", label: tr("Elementos") },
            ]}
          />
          <span>{tr("Fontes, medida e espaçamento em Personalizar tema.")}</span>
        </div>
        {view === "article" ? (
          <div className={styles.readingLayout}>
            <Prose
              className={styles.reading}
              style={{ fontSize: "var(--prose-size,18px)" }}
            >
              <p className={styles.eyebrow}>
                {tr("Texto demonstrativo · Lorem ipsum")}</p>
              <h1>{tr("Lorem ipsum dolor sit amet")}</h1>
              <p className={styles.lead}>
                {tr("Consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.")}</p>
              <p id="type-context">
                {tr("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec ullamcorper nulla non metus auctor fringilla.")}</p>
              <p>
                {tr("Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Maecenas faucibus mollis interdum.")}</p>
              <p>
                {tr("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent suscipit, velit at commodo interdum, augue lectus tincidunt urna, vitae dignissim lacus metus vel ipsum. Sed consequat erat non nibh luctus, a fermentum lorem posuere. Integer malesuada sapien at libero interdum, id ullamcorper risus viverra. Donec vitae nibh eu massa tincidunt consectetur. Aliquam erat volutpat. Nulla facilisi. Curabitur finibus risus eu sem pellentesque, quis tincidunt sapien varius.")}</p>
              <p>
                {tr("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent suscipit, velit at commodo interdum, augue lectus tincidunt urna, vitae dignissim lacus metus vel ipsum. Sed consequat erat non nibh luctus, a fermentum lorem posuere. Integer malesuada sapien at libero interdum, id ullamcorper risus viverra. Donec vitae nibh eu massa tincidunt consectetur. Aliquam erat volutpat. Nulla facilisi. Curabitur finibus risus eu sem pellentesque, quis tincidunt sapien varius.")}</p>
              <p>
                {tr("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent suscipit, velit at commodo interdum, augue lectus tincidunt urna, vitae dignissim lacus metus vel ipsum. Sed consequat erat non nibh luctus, a fermentum lorem posuere. Integer malesuada sapien at libero interdum, id ullamcorper risus viverra. Donec vitae nibh eu massa tincidunt consectetur. Aliquam erat volutpat. Nulla facilisi. Curabitur finibus risus eu sem pellentesque, quis tincidunt sapien varius.")}</p>
              <h2 id="type-decision">{tr("Consectetur adipiscing elit")}</h2>
              <p>
                {tr("Sed posuere consectetur est at lobortis. Nulla vitae elit libero, a pharetra augue. Curabitur blandit tempus porttitor. Aenean lacinia bibendum nulla sed consectetur.")}</p>
              <blockquote>
                {tr("Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.")}</blockquote>
              <p>
                {tr("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent suscipit, velit at commodo interdum, augue lectus tincidunt urna, vitae dignissim lacus metus vel ipsum. Sed consequat erat non nibh luctus, a fermentum lorem posuere. Integer malesuada sapien at libero interdum, id ullamcorper risus viverra. Donec vitae nibh eu massa tincidunt consectetur. Aliquam erat volutpat. Nulla facilisi. Curabitur finibus risus eu sem pellentesque, quis tincidunt sapien varius.")}</p>
              <p>
                {tr("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent suscipit, velit at commodo interdum, augue lectus tincidunt urna, vitae dignissim lacus metus vel ipsum. Sed consequat erat non nibh luctus, a fermentum lorem posuere. Integer malesuada sapien at libero interdum, id ullamcorper risus viverra. Donec vitae nibh eu massa tincidunt consectetur. Aliquam erat volutpat. Nulla facilisi. Curabitur finibus risus eu sem pellentesque, quis tincidunt sapien varius.")}</p>
              <p>
                {tr("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent suscipit, velit at commodo interdum, augue lectus tincidunt urna, vitae dignissim lacus metus vel ipsum. Sed consequat erat non nibh luctus, a fermentum lorem posuere. Integer malesuada sapien at libero interdum, id ullamcorper risus viverra. Donec vitae nibh eu massa tincidunt consectetur. Aliquam erat volutpat. Nulla facilisi. Curabitur finibus risus eu sem pellentesque, quis tincidunt sapien varius.")}</p>
              <h3 id="type-criteria">{tr("Pellentesque ornare sem")}</h3>
              <ul>
                <li>{tr("Integer posuere erat a ante.")}</li>
                <li>{tr("Etiam porta sem malesuada magna mollis.")}</li>
                <li>{tr("Donec sed odio dui.")}</li>
              </ul>
              <p>
                O <strong>peso</strong> {tr("destaca o essencial. O")} <em>{tr("itálico")}</em>{" "}
                {tr("muda a voz. Uma referência como")}{" "}
                <code>{tr("custo de oportunidade")}</code> {tr("permite observar também a família monoespaçada.")}</p>
              <p>
                {tr("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent suscipit, velit at commodo interdum, augue lectus tincidunt urna, vitae dignissim lacus metus vel ipsum. Sed consequat erat non nibh luctus, a fermentum lorem posuere. Integer malesuada sapien at libero interdum, id ullamcorper risus viverra. Donec vitae nibh eu massa tincidunt consectetur. Aliquam erat volutpat. Nulla facilisi. Curabitur finibus risus eu sem pellentesque, quis tincidunt sapien varius.")}</p>
              <p>
                {tr("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent suscipit, velit at commodo interdum, augue lectus tincidunt urna, vitae dignissim lacus metus vel ipsum. Sed consequat erat non nibh luctus, a fermentum lorem posuere. Integer malesuada sapien at libero interdum, id ullamcorper risus viverra. Donec vitae nibh eu massa tincidunt consectetur. Aliquam erat volutpat. Nulla facilisi. Curabitur finibus risus eu sem pellentesque, quis tincidunt sapien varius.")}</p>
              <p>
                {tr("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent suscipit, velit at commodo interdum, augue lectus tincidunt urna, vitae dignissim lacus metus vel ipsum. Sed consequat erat non nibh luctus, a fermentum lorem posuere. Integer malesuada sapien at libero interdum, id ullamcorper risus viverra. Donec vitae nibh eu massa tincidunt consectetur. Aliquam erat volutpat. Nulla facilisi. Curabitur finibus risus eu sem pellentesque, quis tincidunt sapien varius.")}</p>
              <p>
                {tr("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent suscipit, velit at commodo interdum, augue lectus tincidunt urna, vitae dignissim lacus metus vel ipsum. Sed consequat erat non nibh luctus, a fermentum lorem posuere. Integer malesuada sapien at libero interdum, id ullamcorper risus viverra. Donec vitae nibh eu massa tincidunt consectetur. Aliquam erat volutpat. Nulla facilisi. Curabitur finibus risus eu sem pellentesque, quis tincidunt sapien varius.")}</p>
              <h2 id="type-conclusion">{tr("Integer vitae sapien")}</h2>
              <p>
                {tr("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent suscipit, velit at commodo interdum, augue lectus tincidunt urna, vitae dignissim lacus metus vel ipsum. Sed consequat erat non nibh luctus, a fermentum lorem posuere. Integer malesuada sapien at libero interdum, id ullamcorper risus viverra. Donec vitae nibh eu massa tincidunt consectetur. Aliquam erat volutpat. Nulla facilisi. Curabitur finibus risus eu sem pellentesque, quis tincidunt sapien varius.")}</p>
              <p>
                {tr("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent suscipit, velit at commodo interdum, augue lectus tincidunt urna, vitae dignissim lacus metus vel ipsum. Sed consequat erat non nibh luctus, a fermentum lorem posuere. Integer malesuada sapien at libero interdum, id ullamcorper risus viverra. Donec vitae nibh eu massa tincidunt consectetur. Aliquam erat volutpat. Nulla facilisi. Curabitur finibus risus eu sem pellentesque, quis tincidunt sapien varius.")}</p>
              <p>
                {tr("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent suscipit, velit at commodo interdum, augue lectus tincidunt urna, vitae dignissim lacus metus vel ipsum. Sed consequat erat non nibh luctus, a fermentum lorem posuere. Integer malesuada sapien at libero interdum, id ullamcorper risus viverra. Donec vitae nibh eu massa tincidunt consectetur. Aliquam erat volutpat. Nulla facilisi. Curabitur finibus risus eu sem pellentesque, quis tincidunt sapien varius.")}</p>
              <p className={styles.caption}>
                {tr("Texto fictício para experimentar a composição tipográfica. Sem autoria, imagens ou conteúdo de um artigo real.")}</p>
            </Prose>
            <aside className={styles.readingAside}>
              <TableOfContents
                items={[
                  { id: "type-context", label: tr("Contexto") },
                  { id: "type-decision", label: tr("Consectetur") },
                  { id: "type-criteria", label: tr("Pellentesque") },
                  { id: "type-conclusion", label: tr("Integer") },
                ]}
              />
              <p>
                {tr("Uma mesma composição acompanha o tema inteiro. O modo altera as cores; os papéis tipográficos permanecem.")}</p>
            </aside>
          </div>
        ) : view === "scale" ? (
          <section className={styles.scale} aria-label={tr("Escala tipográfica")}>
            {scale.map(([label, token]) => (
              <div key={label}>
                <div>
                  <strong>{label}</strong>
                  <code>{token}</code>
                </div>
                <p
                  style={{
                    fontSize: `var(${token})`,
                    fontFamily:
                      label === "Código"
                        ? "var(--font-mono)"
                        : token.includes("h")
                          ? "var(--font-heading)"
                          : "var(--font-body)",
                  }}
                >
                  {label === "Código"
                    ? 'const refy = { tema: "seu produto" };'
                    : sample}
                </p>
              </div>
            ))}
          </section>
        ) : (
          <Prose className={styles.reading}>
            <h1>{tr("Texto em todos os seus papéis")}</h1>
            <p>
              {tr("Títulos, listas, citações e código precisam funcionar juntos, sem competir pela atenção.")}</p>
            <h2>{tr("Ênfase e hierarquia")}</h2>
            <p>
              {tr("Compare")} <strong>{tr("texto forte")}</strong>, <em>{tr("texto em itálico")}</em>,{" "}
              <del>{tr("uma informação removida")}</del> e{" "}
              <code>{tr("um termo de código")}</code>.
            </p>
            <h3>{tr("Lista ordenada")}</h3>
            <ol>
              <li>{tr("Apresente a ideia principal.")}</li>
              <li>{tr("Desenvolva o argumento.")}</li>
              <li>{tr("Deixe claro o próximo passo.")}</li>
            </ol>
            <blockquote>
              {tr("O espaço entre os elementos também participa da leitura.")}</blockquote>
            <h3>{tr("Código legível")}</h3>
            <CodeBlock
              label="artigo.tsx"
              language="tsx"
              code={
                "import { Prose } from '@refy-design/web';\n\nexport function Artigo() {\n  return <Prose><h1>Seu título</h1><p>Seu conteúdo.</p></Prose>;\n}"
              }
            />
            <h3>{tr("Informação tabular")}</h3>
            <table>
              <thead>
                <tr>
                  <th>{tr("Papel")}</th>
                  <th>{tr("Uso")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{tr("Título")}</td>
                  <td>{tr("Organiza a leitura")}</td>
                </tr>
                <tr>
                  <td>{tr("Corpo")}</td>
                  <td>{tr("Desenvolve o conteúdo")}</td>
                </tr>
                <tr>
                  <td>{tr("Mono")}</td>
                  <td>{tr("Apresenta código e valores")}</td>
                </tr>
              </tbody>
            </table>
            <hr />
            <p>
              <small>
                {tr("Legendas e notas também herdam a identidade do tema.")}</small>
            </p>
          </Prose>
        )}
      </div>
    </main>
  );
}
