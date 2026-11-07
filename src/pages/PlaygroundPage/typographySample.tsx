import { tr } from "../RefySitePage/i18n";
import { CodeBlock, Prose } from "../../index";
import { fontSets, type FontSet } from "../../lib/fontSets";
import type { RefyTheme } from "../../lib/ThemeProvider";
import styles from "../RefySitePage/RefySitePage.module.css";

export const typographyNames: Record<Exclude<FontSet, "legacy">, string> = {
  legible: "Legível", humanist: "Humanista", plex: "Plex", studio: "Studio", editorial: "Editorial", reading: "Leitura", clarity: "Clareza", grotesk: "Grotesca",
};
export type TypographySampleView = "article" | "scale" | "elements";

/** The chosen theme with a font set, base size and prose leading laid over it; this is what "Aplicar ao tema" saves and exports. */
export function typographyTheme(theme: RefyTheme, fonts: FontSet, base: string, leading: string): RefyTheme {
  return { ...theme, tokens: { ...theme.tokens, ...fontSets[fonts].tokens, "--text-base": base, "--prose-leading": leading } };
}

/** Editorial sample shown inside the preview frame; the theme around it carries every typographic value. */
export function TypographySample({ fonts, view }: { fonts: FontSet; view: TypographySampleView }) {
  const set = fontSets[fonts];
  return (
    <div className={styles.typeColumns}>
      <div>
        <p className={styles.typeEyebrow}>{typographyNames[fonts as keyof typeof typographyNames] ?? "Legado"} {tr("/ Amostra")}</p>
        {view === "article" ? <Prose>
          <h1>{tr("Clareza em cada detalhe.")}</h1>
          <p>{set.heading} {tr("nos títulos.")} {set.body} {tr("na leitura.")} {set.mono} {tr("no código.")}</p>
          <p>{tr("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.")}</p>
          <p>{tr("Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")}</p>
          <h2>{tr("Uma hierarquia que orienta")}</h2>
          <p>{tr("Tipografia consistente ajuda a criar ritmo, destaque e legibilidade, conectando conteúdo e interface de forma natural e eficiente.")}</p>
          <blockquote>{tr("Boa tipografia não chama atenção para si.")}<br />{tr("Ela dá mais clareza para o que realmente importa.")}</blockquote>
        </Prose> : view === "scale" ? <Prose>
          <h1>{tr("Título principal")}</h1><h2>{tr("Título de seção")}</h2><h3>{tr("Subtítulo")}</h3><h4>{tr("Título de apoio")}</h4>
          <p>{tr("A forma das palavras muda a experiência de leitura.")}</p><p><small>{tr("Texto auxiliar e legendas.")}</small></p>
        </Prose> : <Prose>
          <h2>{tr("Texto em todos os seus papéis")}</h2><p>{tr("Compare")} <strong>{tr("texto forte")}</strong>, <em>{tr("texto em itálico")}</em> e <code>{tr("um termo de código")}</code>.</p>
          <ul><li>{tr("Apresente a ideia principal.")}</li><li>{tr("Desenvolva o argumento.")}</li><li>{tr("Deixe claro o próximo passo.")}</li></ul>
          <blockquote>{tr("O espaço entre os elementos também participa da leitura.")}</blockquote>
        </Prose>}
        <div className={styles.typeCode}><CodeBlock language="css" code="font-family: var(--font-body);" /></div>
      </div>
      <aside className={styles.typeSamples} aria-label={tr("Papéis tipográficos")}>
        <div className={styles.typeSample}><p>{tr("Títulos ·")} {set.heading}</p><div className={styles.typeHeadingSample}>{tr("Aa Bb 0123")}</div></div>
        <div className={styles.typeSample}><p>{tr("Corpo ·")} {set.body}</p><div className={styles.typeBodySample}>{tr("Aa Bb 0123")}</div></div>
        <div className={styles.typeSample}><p>{tr("Código ·")} {set.mono}</p><div className={styles.typeMonoSample}>{tr("Aa Bb 0123")}</div></div>
      </aside>
    </div>
  );
}
