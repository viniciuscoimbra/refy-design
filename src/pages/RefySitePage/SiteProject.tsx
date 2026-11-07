import type { ReactNode } from "react";
import { Badge, Button, CodeBlock, SettingsSubnav } from "../../index";
import type { SettingsSubnavLinkProps } from "../../index";
import { Heading, SideNav, Toc } from "./SiteCatalog";
import styles from "./RefySitePage.module.css";
import { htmlLang, useSiteLocale } from "./i18n";
import type { Locale } from "./i18n";
import changelog from "../../../CHANGELOG.md?raw";
import changelogText from "./locales/changelog.json";
import { parseReleases } from "./releases.mjs";

// Páginas do projeto: Releases sai do CHANGELOG.md (a mesma fonte que a promoção exige antes da tag),
// Contribuir resume CONTRIBUTING.md e GOVERNANCE.md. Link para o GitHub só com o repositório público
// no ar: o site publicado sem ele é construído com VITE_REFY_GITHUB=off.

export type ProjectTopic = "releases" | "contribuir";
export const projectTopics: ProjectTopic[] = ["releases", "contribuir"];
export const projectHref = (topic: ProjectTopic) => `/${topic}`;

const repoUrl = "https://github.com/viniciuscoimbra/refy-design";
const githubEnabled = import.meta.env.VITE_REFY_GITHUB !== "off";
export const releases = parseReleases(changelog);

const notes: Record<Exclude<Locale, "pt">, Record<string, string>> = changelogText;
const note = (locale: Locale, text: string) => (locale === "pt" ? text : notes[locale][text] ?? text);

// O CHANGELOG usa só `código` e [texto](url).
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/).map((part, index) => {
        if (part.startsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        return link ? <a key={index} href={link[2]}>{link[1]}</a> : part;
      })}
    </>
  );
}

const contributionFile = `{
  "component": "Segmented",
  "capability": "Fill the container width",
  "why": "Filters span the full width of the panel on mobile.",
  "props": [{ "name": "block", "default": false }],
  "patch": "segmented-block.patch",
  "changelog": "\`block\` prop fills the container width.",
  "productWords": ["acme"],
  "preview": {
    "width": 360,
    "before": [{
      "label": "View", "value": "list",
      "options": [{ "value": "list", "label": "List" }, { "value": "grid", "label": "Grid" }]
    }],
    "after": [{
      "label": "View", "value": "list", "block": true,
      "options": [{ "value": "list", "label": "List" }, { "value": "grid", "label": "Grid" }]
    }]
  }
}`;
const contributeCommand = "npx refy contribute Segmented --refy ../refy-design";
const setupCommands = "npm ci\nnpm run storybook\nnpm run check";
const installFor = (version: string) => `npm install @refy-design/web@${version}`;

interface Copy {
  group: string;
  pages: string;
  releases: { label: string; description: string; current: string; tag: string; install: string; onGithub: string; semverTitle: string; semver: ReactNode; empty: string };
  contribute: { label: string; description: string; sections: Array<[string, string]>; body: ReactNode };
}

const ruleList = (items: Array<[string, ReactNode]>) => (
  <ol className={styles.projectSteps}>
    {items.map(([title, body]) => <li key={title}><strong>{title}</strong> {body}</li>)}
  </ol>
);
const repoLinks = (labels: [string, string, string]) =>
  githubEnabled && (
    <p className={styles.projectLinks}>
      {(["CODE_OF_CONDUCT.md", "SECURITY.md", "GOVERNANCE.md"] as const).map((file, index) => (
        <a key={file} href={`${repoUrl}/blob/main/${file}`} target="_blank" rel="noreferrer">{labels[index]} ↗</a>
      ))}
    </p>
  );
const issueButton = (label: string) =>
  githubEnabled && <Button variant="secondary" href={`${repoUrl}/issues/new?template=gap.yml`} target="_blank">{label} ↗</Button>;
const repoButton = (label: string) =>
  githubEnabled && <Button variant="secondary" href={repoUrl} target="_blank">{label} ↗</Button>;

const copy: Record<Locale, Copy> = {
  pt: {
    group: "Projeto",
    pages: "Páginas do projeto",
    releases: {
      label: "Releases",
      description: "Cada versão publicada do refy e o que mudou nela.",
      current: "Atual",
      tag: "tag",
      install: "Instalar esta versão",
      onGithub: "Release no GitHub",
      semverTitle: "Como a versão muda",
      semver: <p>O refy segue versionamento semântico. Patch corrige sem mudar API. Minor acrescenta sem quebrar. Major quebra export, prop, token ou default, e vem com guia de migração no CHANGELOG.</p>,
      empty: "Nenhuma versão publicada ainda.",
    },
    contribute: {
      label: "Contribuir",
      description: "O que resolve no seu tema, o que fica no seu projeto e o que vira pull request no refy.",
      sections: [["antes", "Antes de propor"], ["gap", "Achou um gap?"], ["componente-novo", "Componente novo"], ["do-projeto", "Do seu projeto pro refy"], ["pull-request", "Pull request"], ["ambiente", "Ambiente"], ["conduta", "Conduta e segurança"]],
      body: (<>
        <section id="antes" className={styles.firstSection}>
          <h2>Antes de propor</h2>
          <p>Faça as três perguntas nesta ordem. A primeira resposta sim diz onde a mudança mora.</p>
          {ruleList([
            ["O tema resolve?", "Se o componente já lê um token ou uma variante que chega no visual que você quer, a mudança é no arquivo de tema do seu projeto. O refy não muda."],
            ["É composição do seu produto?", "Tela ou peça montada com componentes do refy fica no seu projeto, mesmo que se repita em várias telas."],
            ["Falta prop ou token?", "Aí é contribuição: o componente não tem como fazer isso, e a capacidade serve pra qualquer produto. Mostre a linha do componente que impede."],
          ])}
        </section>
        <section id="gap">
          <h2>Achou um gap?</h2>
          <p>A IA que monta telas com o refy consulta o catálogo antes de criar qualquer peça. Quando não acha, ela registra a lacuna em vez de recriar o componente. Essa lacuna vira contribuição:</p>
          {ruleList([
            ["Abra uma issue \"Falta no refy\".", "Diga a tela que precisa e o que o componente não deixa fazer. Pra família nova, diga também a camada e a finalidade. Quem precisar da mesma coisa encontra a issue e soma."],
            ["Faça a peça no seu projeto.", <>Em <code>refy-extensions/&lt;Nome&gt;/</code>, sem esperar a biblioteca: sua tela não fica parada.</>],
            ["Mande pro refy.", <><code>npx refy contribute &lt;Nome&gt;</code> testa a peça numa cópia do refy e escreve o PR. Quando ela entra numa versão, você atualiza o refy e apaga a extensão.</>],
          ])}
          {issueButton("Abrir issue")}
        </section>
        <section id="componente-novo">
          <h2>Componente novo</h2>
          <p>Todo componente tem camada e finalidade. Átomo é a peça mínima, como Button e Badge. Molécula junta átomos numa tarefa, como PhoneInput e DatePicker. Organismo coordena interações, como KanbanBoard e Coverflow.</p>
          <p>Pra propor uma família nova, mostre por que compor as que já existem não resolve. A proposta diz a camada, a finalidade e quais componentes ela reaproveita.</p>
        </section>
        <section id="do-projeto">
          <h2>Do seu projeto pro refy</h2>
          <p>Melhoria que nasce num produto começa como extensão local em <code>refy-extensions/&lt;Nome&gt;/</code>, com o patch e um <code>contribution.json</code>.</p>
          <CodeBlock label="refy-extensions/Segmented/contribution.json" language="json" code={contributionFile} />
          <p>Com um clone do refy-design ao lado do seu projeto, rode:</p>
          <CodeBlock label="Terminal" language="bash" wrap code={contributeCommand} />
          <p>O comando aplica o patch numa cópia temporária do refy, roda tipos, build, documentação e o check do agente, e renderiza o componente com as props atuais antes e depois do patch. A diferença tem que ser zero pixel: quem já usa o componente não vê mudança. Prop ou token novo sem valor padrão é recusado, e as palavras do seu produto em <code>productWords</code> também.</p>
          <p>O resultado fica em <code>refy-contrib/&lt;Nome&gt;/</code>: patch, texto do PR e as imagens de antes e depois. O comando não abre PR nem faz push.</p>
          <p>Família nova não tem antes: deixe <code>preview.before</code> de fora e informe <code>level</code> (camada) e <code>area</code> (finalidade). Ela entra na próxima minor.</p>
        </section>
        <section id="pull-request">
          <h2>Pull request</h2>
          <p>Issues e pull requests abrem no repositório público refy-design. O PR traz:</p>
          <ul className={styles.projectList}>
            <li>o problema, a proposta e o impacto em exports, props, tokens e defaults;</li>
            <li>spec em <code>openspec/specs/</code> e teste, quando muda comportamento;</li>
            <li>CI verde.</li>
          </ul>
          <p>Depois que você abre o PR:</p>
          {ruleList([
            ["Teste.", "O mantenedor roda o seu PR em todos os gates do refy: tipos, build, cores, contraste, documentação, kit do agente e navegador."],
            ["Passou:", "o PR é aprovado e entra no refy-design com a sua autoria. Você aparece como contribuidor do repositório e no CHANGELOG da versão."],
            ["Não passou:", "o PR é recusado no próprio GitHub, com o gate que falhou e o motivo. Corrija e mande de novo."],
          ])}
          <p>Mudança que quebra export, prop, token ou default só entra em versão major, com de-para e migração.</p>
          {repoButton("Abrir o refy-design")}
        </section>
        <section id="ambiente">
          <h2>Ambiente</h2>
          <p>Node 22.12 ou mais novo, instalação pelo lockfile.</p>
          <CodeBlock label="Terminal" language="bash" code={setupCommands} />
          <p><code>npm run storybook</code> abre o catálogo em <code>localhost:6006</code>. <code>npm run check</code> confere cores, tokens, contraste, movimento, lint, build, documentação e o kit do agente.</p>
        </section>
        <section id="conduta">
          <h2>Conduta e segurança</h2>
          <p>Quem participa segue o código de conduta. Falha de segurança não vai em issue: use o relato privado de segurança do GitHub. Credencial e dado privado nunca entram em issue, PR ou exemplo.</p>
          {repoLinks(["Código de conduta", "Segurança", "Governança"])}
        </section>
      </>),
    },
  },
  en: {
    group: "Project",
    pages: "Project pages",
    releases: {
      label: "Releases",
      description: "Every published refy version and what changed in it.",
      current: "Latest",
      tag: "tag",
      install: "Install this version",
      onGithub: "Release on GitHub",
      semverTitle: "How versions change",
      semver: <p>refy follows semantic versioning. Patch fixes without changing the API. Minor adds without breaking. Major breaks an export, prop, token or default, and ships with a migration guide in the CHANGELOG.</p>,
      empty: "No published version yet.",
    },
    contribute: {
      label: "Contributing",
      description: "What your theme solves, what stays in your project and what becomes a pull request to refy.",
      sections: [["antes", "Before proposing"], ["gap", "Found a gap?"], ["componente-novo", "New component"], ["do-projeto", "From your project to refy"], ["pull-request", "Pull request"], ["ambiente", "Setup"], ["conduta", "Conduct and security"]],
      body: (<>
        <section id="antes" className={styles.firstSection}>
          <h2>Before proposing</h2>
          <p>Ask the three questions in this order. The first yes tells you where the change lives.</p>
          {ruleList([
            ["Does the theme solve it?", "If the component already reads a token or a variant that gets you the look you want, the change goes in your project's theme file. refy stays the same."],
            ["Is it your product's composition?", "A screen or piece built from refy components stays in your project, even when it repeats across screens."],
            ["Is a prop or token missing?", "Then it's a contribution: the component has no way to do it, and the capability works for any product. Point to the component line that blocks it."],
          ])}
        </section>
        <section id="gap">
          <h2>Found a gap?</h2>
          <p>The AI that builds screens with refy checks the catalog before creating any piece. When it finds nothing, it records the gap instead of rebuilding the component. That gap becomes a contribution:</p>
          {ruleList([
            ["Open a \"Falta no refy\" issue.", "Say which screen needs it and what the component doesn't let you do. For a new family, also give the layer and the purpose. Anyone who needs the same thing finds the issue and joins in."],
            ["Build the piece in your project.", <>In <code>refy-extensions/&lt;Name&gt;/</code>, without waiting for the library: your screen doesn't stall.</>],
            ["Send it to refy.", <><code>npx refy contribute &lt;Name&gt;</code> tests the piece on a copy of refy and writes the PR. Once it ships in a version, you update refy and delete the extension.</>],
          ])}
          {issueButton("Open an issue")}
        </section>
        <section id="componente-novo">
          <h2>New component</h2>
          <p>Every component has a layer and a purpose. An atom is the smallest piece, like Button and Badge. A molecule joins atoms for one task, like PhoneInput and DatePicker. An organism coordinates interactions, like KanbanBoard and Coverflow.</p>
          <p>To propose a new family, show why composing the existing ones doesn't solve it. The proposal names the layer, the purpose and the components it reuses.</p>
        </section>
        <section id="do-projeto">
          <h2>From your project to refy</h2>
          <p>An improvement born in a product starts as a local extension in <code>refy-extensions/&lt;Name&gt;/</code>, with the patch and a <code>contribution.json</code>.</p>
          <CodeBlock label="refy-extensions/Segmented/contribution.json" language="json" code={contributionFile} />
          <p>With a refy-design clone next to your project, run:</p>
          <CodeBlock label="Terminal" language="bash" wrap code={contributeCommand} />
          <p>The command applies the patch to a temporary copy of refy, runs types, build, documentation and the agent check, and renders the component with the current props before and after the patch. The difference must be zero pixels: whoever already uses the component sees no change. A new prop or token without a default is rejected, and so are your product's words listed in <code>productWords</code>.</p>
          <p>The result lands in <code>refy-contrib/&lt;Name&gt;/</code>: patch, PR text and the before and after images. The command doesn't open a PR or push.</p>
          <p>A new family has no before: leave <code>preview.before</code> out and set <code>level</code> (layer) and <code>area</code> (purpose). It ships in the next minor.</p>
        </section>
        <section id="pull-request">
          <h2>Pull request</h2>
          <p>Issues and pull requests open in the public refy-design repository. The PR brings:</p>
          <ul className={styles.projectList}>
            <li>the problem, the proposal and the impact on exports, props, tokens and defaults;</li>
            <li>a spec in <code>openspec/specs/</code> and a test, when behavior changes;</li>
            <li>green CI.</li>
          </ul>
          <p>After you open the PR:</p>
          {ruleList([
            ["Test.", "The maintainer runs your PR through every refy gate: types, build, colors, contrast, documentation, agent kit and browser."],
            ["Passed:", "the PR is approved and lands in refy-design under your authorship. You show up as a repository contributor and in the version's CHANGELOG."],
            ["Failed:", "the PR is declined on GitHub itself, with the gate that failed and why. Fix it and send it again."],
          ])}
          <p>A change that breaks an export, prop, token or default only lands in a major version, with a before-and-after and migration steps.</p>
          {repoButton("Open refy-design")}
        </section>
        <section id="ambiente">
          <h2>Setup</h2>
          <p>Node 22.12 or newer, install from the lockfile.</p>
          <CodeBlock label="Terminal" language="bash" code={setupCommands} />
          <p><code>npm run storybook</code> opens the catalog at <code>localhost:6006</code>. <code>npm run check</code> checks colors, tokens, contrast, motion, lint, build, documentation and the agent kit.</p>
        </section>
        <section id="conduta">
          <h2>Conduct and security</h2>
          <p>Everyone taking part follows the code of conduct. Security issues don't go in an issue: use GitHub's private vulnerability reporting. Credentials and private data never go in an issue, PR or example.</p>
          {repoLinks(["Code of conduct", "Security", "Governance"])}
        </section>
      </>),
    },
  },
  es: {
    group: "Proyecto",
    pages: "Páginas del proyecto",
    releases: {
      label: "Releases",
      description: "Cada versión publicada de refy y lo que cambió en ella.",
      current: "Actual",
      tag: "tag",
      install: "Instalar esta versión",
      onGithub: "Release en GitHub",
      semverTitle: "Cómo cambia la versión",
      semver: <p>refy sigue el versionado semántico. Patch corrige sin cambiar la API. Minor agrega sin romper. Major rompe un export, prop, token o default, y trae una guía de migración en el CHANGELOG.</p>,
      empty: "Todavía no hay versiones publicadas.",
    },
    contribute: {
      label: "Contribuir",
      description: "Qué resuelve tu tema, qué queda en tu proyecto y qué se convierte en pull request a refy.",
      sections: [["antes", "Antes de proponer"], ["gap", "¿Encontraste un hueco?"], ["componente-novo", "Componente nuevo"], ["do-projeto", "De tu proyecto a refy"], ["pull-request", "Pull request"], ["ambiente", "Entorno"], ["conduta", "Conducta y seguridad"]],
      body: (<>
        <section id="antes" className={styles.firstSection}>
          <h2>Antes de proponer</h2>
          <p>Haz las tres preguntas en este orden. El primer sí dice dónde vive el cambio.</p>
          {ruleList([
            ["¿Lo resuelve el tema?", "Si el componente ya lee un token o una variante que llega al aspecto que quieres, el cambio va en el archivo de tema de tu proyecto. refy no cambia."],
            ["¿Es composición de tu producto?", "Una pantalla o pieza armada con componentes de refy queda en tu proyecto, aunque se repita en varias pantallas."],
            ["¿Falta una prop o un token?", "Entonces es una contribución: el componente no puede hacerlo, y la capacidad sirve para cualquier producto. Muestra la línea del componente que lo impide."],
          ])}
        </section>
        <section id="gap">
          <h2>¿Encontraste un hueco?</h2>
          <p>La IA que arma pantallas con refy consulta el catálogo antes de crear cualquier pieza. Cuando no encuentra nada, registra el hueco en vez de rehacer el componente. Ese hueco se convierte en contribución:</p>
          {ruleList([
            ["Abre un issue \"Falta no refy\".", "Di qué pantalla lo necesita y qué no deja hacer el componente. Para una familia nueva, indica también la capa y la finalidad. Quien necesite lo mismo encuentra el issue y se suma."],
            ["Haz la pieza en tu proyecto.", <>En <code>refy-extensions/&lt;Name&gt;/</code>, sin esperar a la biblioteca: tu pantalla no se detiene.</>],
            ["Envíala a refy.", <><code>npx refy contribute &lt;Name&gt;</code> prueba la pieza en una copia de refy y escribe el PR. Cuando entra en una versión, actualizas refy y borras la extensión.</>],
          ])}
          {issueButton("Abrir issue")}
        </section>
        <section id="componente-novo">
          <h2>Componente nuevo</h2>
          <p>Todo componente tiene capa y finalidad. El átomo es la pieza mínima, como Button y Badge. La molécula junta átomos para una tarea, como PhoneInput y DatePicker. El organismo coordina interacciones, como KanbanBoard y Coverflow.</p>
          <p>Para proponer una familia nueva, muestra por qué componer las que ya existen no lo resuelve. La propuesta indica la capa, la finalidad y qué componentes reutiliza.</p>
        </section>
        <section id="do-projeto">
          <h2>De tu proyecto a refy</h2>
          <p>Una mejora que nace en un producto empieza como extensión local en <code>refy-extensions/&lt;Name&gt;/</code>, con el patch y un <code>contribution.json</code>.</p>
          <CodeBlock label="refy-extensions/Segmented/contribution.json" language="json" code={contributionFile} />
          <p>Con un clon de refy-design junto a tu proyecto, ejecuta:</p>
          <CodeBlock label="Terminal" language="bash" wrap code={contributeCommand} />
          <p>El comando aplica el patch en una copia temporal de refy, corre tipos, build, documentación y el check del agente, y renderiza el componente con las props actuales antes y después del patch. La diferencia tiene que ser cero píxeles: quien ya usa el componente no ve cambios. Se rechaza una prop o un token nuevo sin valor por defecto, y también las palabras de tu producto listadas en <code>productWords</code>.</p>
          <p>El resultado queda en <code>refy-contrib/&lt;Name&gt;/</code>: patch, texto del PR y las imágenes de antes y después. El comando no abre PR ni hace push.</p>
          <p>Una familia nueva no tiene antes: deja <code>preview.before</code> fuera e indica <code>level</code> (capa) y <code>area</code> (finalidad). Entra en la próxima minor.</p>
        </section>
        <section id="pull-request">
          <h2>Pull request</h2>
          <p>Issues y pull requests se abren en el repositorio público refy-design. El PR trae:</p>
          <ul className={styles.projectList}>
            <li>el problema, la propuesta y el impacto en exports, props, tokens y defaults;</li>
            <li>spec en <code>openspec/specs/</code> y test, cuando cambia el comportamiento;</li>
            <li>CI en verde.</li>
          </ul>
          <p>Después de abrir el PR:</p>
          {ruleList([
            ["Prueba.", "El mantenedor corre tu PR por todos los gates de refy: tipos, build, colores, contraste, documentación, kit del agente y navegador."],
            ["Pasó:", "el PR se aprueba y entra en refy-design con tu autoría. Apareces como contribuidor del repositorio y en el CHANGELOG de la versión."],
            ["No pasó:", "el PR se rechaza en el mismo GitHub, con el gate que falló y el motivo. Corrígelo y envíalo de nuevo."],
          ])}
          <p>Un cambio que rompe un export, prop, token o default solo entra en una versión major, con el antes y después y los pasos de migración.</p>
          {repoButton("Abrir refy-design")}
        </section>
        <section id="ambiente">
          <h2>Entorno</h2>
          <p>Node 22.12 o más reciente, instalación desde el lockfile.</p>
          <CodeBlock label="Terminal" language="bash" code={setupCommands} />
          <p><code>npm run storybook</code> abre el catálogo en <code>localhost:6006</code>. <code>npm run check</code> revisa colores, tokens, contraste, movimiento, lint, build, documentación y el kit del agente.</p>
        </section>
        <section id="conduta">
          <h2>Conducta y seguridad</h2>
          <p>Quien participa sigue el código de conducta. Una falla de seguridad no va en un issue: usa el reporte privado de vulnerabilidades de GitHub. Credenciales y datos privados nunca van en un issue, PR o ejemplo.</p>
          {repoLinks(["Código de conducta", "Seguridad", "Gobernanza"])}
        </section>
      </>),
    },
  },
};

export const projectLabel = (locale: Locale, topic: ProjectTopic) => (topic === "releases" ? copy[locale].releases.label : copy[locale].contribute.label);
export const projectDescription = (locale: Locale, topic: ProjectTopic) => (topic === "releases" ? copy[locale].releases.description : copy[locale].contribute.description);
export const projectGroupLabel = (locale: Locale) => copy[locale].group;

const releaseId = (version: string) => `v${version.replace(/\./g, "-")}`;

function ReleasesBody({ locale }: { locale: Locale }) {
  const text = copy[locale].releases;
  const date = new Intl.DateTimeFormat(htmlLang[locale], { dateStyle: "long", timeZone: "UTC" });
  return (
    <>
      {releases.length === 0 && <p>{text.empty}</p>}
      {releases.map((release, index) => (
        <section key={release.version} id={releaseId(release.version)} className={index === 0 ? styles.firstSection : undefined}>
          <h2 className={styles.releaseTitle}>
            {release.version}{" "}
            {index === 0 && <Badge tone="success" dot>{text.current}</Badge>}
          </h2>
          <p className={styles.releaseMeta}>
            <time dateTime={release.date}>{date.format(new Date(`${release.date}T00:00:00Z`))}</time> · {text.tag} <code>v{release.version}</code>
          </p>
          {release.summary && <p><Inline text={note(locale, release.summary)} /></p>}
          <ul className={styles.projectList}>
            {release.changes.map((change) => <li key={change}><Inline text={note(locale, change)} /></li>)}
          </ul>
          {githubEnabled && (
            <>
              <CodeBlock label={text.install} language="bash" wrap code={installFor(release.version)} />
              <p className={styles.projectLinks}>
                <a href={`${repoUrl}/releases/tag/v${release.version}`} target="_blank" rel="noreferrer">{text.onGithub} ↗</a>
              </p>
            </>
          )}
        </section>
      ))}
      <section id="semver">
        <h2>{text.semverTitle}</h2>
        {text.semver}
      </section>
    </>
  );
}

/** Corpo da página sem a moldura, para o HTML estático de `scripts/site-seo.mjs`. */
export const projectBody = (locale: Locale, topic: ProjectTopic) =>
  topic === "releases" ? <ReleasesBody locale={locale} /> : copy[locale].contribute.body;

export function ProjectPage({ topic, onTopic }: { topic: ProjectTopic; onTopic: (topic: ProjectTopic) => void }) {
  const { locale } = useSiteLocale();
  const text = copy[locale];
  const link = (item: { href: string }, props: SettingsSubnavLinkProps) => (
    <a {...props} onClick={(event) => { event.preventDefault(); onTopic(item.href.slice(1) as ProjectTopic); }} />
  );
  const sections: Array<[string, string]> = topic === "releases"
    ? [...releases.map((release): [string, string] => [releaseId(release.version), release.version]), ["semver", text.releases.semverTitle]]
    : text.contribute.sections;
  return (
    <main id="site-content" className={styles.docGrid}>
      <SideNav title={text.group}>
        <div className={styles.sideLinks}>
          <SettingsSubnav
            label={text.pages}
            activeHref={projectHref(topic)}
            renderLink={link}
            items={projectTopics.map((id) => ({ href: projectHref(id), label: projectLabel(locale, id) }))}
          />
        </div>
      </SideNav>
      <article className={`${styles.article} ${styles.projectArticle}`}>
        <Heading eyebrow={`${text.group} / ${projectLabel(locale, topic)}`} title={projectLabel(locale, topic)} description={projectDescription(locale, topic)} />
        {projectBody(locale, topic)}
      </article>
      <Toc items={sections} />
    </main>
  );
}
