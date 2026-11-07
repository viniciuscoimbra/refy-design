import { tr } from "./i18n";
import { useState } from "react";
import { Button, CodeBlock, Prose, Segmented, Select, SettingsSubnav, ThemeProvider } from "../../index";
import { fontSets, type FontSet } from "../../lib/fontSets";
import { resolveTheme, type PlaygroundConfig } from "../PlaygroundPage/themeConfig";
import styles from "./RefySitePage.module.css";

const names: Record<Exclude<FontSet, "legacy">, string> = {
  legible: "Legível", humanist: "Humanista", plex: "Plex", studio: "Studio", editorial: "Editorial", reading: "Leitura", clarity: "Clareza", grotesk: "Grotesca",
};

/** Composição editorial: aparência do texto pertence a Prose e ao tema exportável. */
export function SiteTypography({ config, update, onBack }: {
  config: PlaygroundConfig;
  update: (patch: Partial<PlaygroundConfig>) => void;
  onBack: () => void;
}) {
  const [fonts, setFonts] = useState<FontSet>(config.fonts);
  const [view, setView] = useState("article");
  const [base, setBase] = useState(String(resolveTheme(config).tokens?.["--text-base"] ?? "16px"));
  const [leading, setLeading] = useState(String(resolveTheme(config).tokens?.["--prose-leading"] ?? "1.6"));
  const [applied, setApplied] = useState(false);
  const current = resolveTheme(config);
  const theme = { ...current, tokens: { ...current.tokens, ...fontSets[fonts].tokens, "--text-base": base, "--prose-leading": leading } };
  const set = fontSets[fonts];
  const choose = (next: FontSet) => { setFonts(next); setApplied(false); };
  const fontLinks = Object.entries(names).map(([id, label]) => ({href:`#font=${id}`,label}));
  return <main id="site-content" className={styles.typeLayout}>
    <aside className={styles.typeSidebar}>
      <h2>{tr("Temas")}</h2>
      <SettingsSubnav label={tr("Seções de temas")} activeHref="#typography" items={[
        {href:"#presets",label:tr("Presets")},{href:"#editor",label:tr("Editor de tema")},{href:"#typography",label:tr("Tipografia")},
      ]} renderLink={(item, props) => <a {...props} onClick={event => {event.preventDefault(); if (item.href !== "#typography") onBack();}} />} />
      <div className={styles.typeFontNavigation}>
        <SettingsSubnav label={tr("Conjuntos tipográficos")} activeHref={`#font=${fonts}`} groups={[
          {title:tr("Conjuntos tipográficos"),items:fontLinks},
        ]} renderLink={(item, props) => <a {...props} onClick={event => {event.preventDefault(); choose(item.href.slice(6) as FontSet);}} />} />
      </div>
    </aside>
    <div className={styles.typeDocument}>
      <header className={styles.typeHeading}>
        <div><h1>{tr("A voz do seu produto.")}</h1><p>{tr("Experimente as famílias no mesmo sistema.")}</p></div>
        <Button variant="primary" onClick={() => {update({ fonts, customTheme:JSON.stringify(theme) });setApplied(true);}}>{tr("Aplicar ao tema")}</Button>
      </header>
      {applied && <p role="status">{tr("Tipografia aplicada ao tema. Os valores acompanham a exportação.")}</p>}
      <div className={styles.typeTabs}><Segmented label={tr("Amostra tipográfica")} value={view} onChange={setView} options={[
        {value:"article",label:tr("Artigo")},{value:"scale",label:tr("Escala")},{value:"elements",label:tr("Elementos")},
      ]} /></div>
      <ThemeProvider theme={theme} mode={config.theme}>
        <div className={styles.typeColumns}>
          <div>
            <p className={styles.typeEyebrow}>{names[fonts as keyof typeof names] ?? "Legado"} {tr("/ Amostra")}</p>
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
            <Button variant="ghost" onClick={onBack}>{tr("← Voltar ao editor →")}</Button>
          </div>
          <aside className={styles.typeSamples} aria-label={tr("Papéis tipográficos")}>
            <div className={styles.typeSample}><p>{tr("Títulos ·")} {set.heading}</p><div className={styles.typeHeadingSample}>{tr("Aa Bb 0123")}</div></div>
            <div className={styles.typeSample}><p>{tr("Corpo ·")} {set.body}</p><div className={styles.typeBodySample}>{tr("Aa Bb 0123")}</div></div>
            <div className={styles.typeSample}><p>{tr("Código ·")} {set.mono}</p><div className={styles.typeMonoSample}>{tr("Aa Bb 0123")}</div></div>
            <Select label={tr("Tamanho base")} value={base} onChange={event => {setBase(event.target.value);setApplied(false);}}>
              {[14,16,18,20].map(size => <option key={size} value={`${size}px`}>{size} px</option>)}
            </Select>
            <Select label={tr("Altura de linha")} value={leading} onChange={event => {setLeading(event.target.value);setApplied(false);}}>
              {[1.4,1.5,1.6,1.8,2].map(size => <option key={size} value={String(size)}>{size}</option>)}
            </Select>
          </aside>
        </div>
      </ThemeProvider>
    </div>
  </main>;
}
