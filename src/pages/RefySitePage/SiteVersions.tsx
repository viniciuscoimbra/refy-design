// Topo da página Versões das Docs: o método de versionar o refy e a doc, escrito uma vez, antes do
// changelog. A tabela de obsoletos sai de src/catalog/versions.json (gerado das tags de release),
// então o que a página lista é o que o código publicado tem.
import type { ReactNode } from "react";
import versions from "../../catalog/versions.json";
import type { Locale } from "./i18n";

interface Deprecation { since: string; use: string; removal: string }
const deprecated = Object.entries(versions.web.deprecated as Record<string, Deprecation>);
const releases = versions.releases;
const latest = releases[0].version;
const major = latest.split(".")[0];
const first = releases[releases.length - 1].version;

interface Text {
  description: string;
  sections: Record<"numero" | "quebra" | "obsoleto" | "doc", string>;
  number: ReactNode;
  breaking: ReactNode;
  breakingList: ReactNode[];
  gate: ReactNode;
  deprecation: ReactNode;
  deprecatedHead: [string, string, string];
  noDeprecated: string;
  doc: ReactNode;
  selector: ReactNode;
}

const text: Record<Locale, Text> = {
  pt: {
    description: "Como o refy numera as versões, o que cada uma pode mudar e como esta doc mostra isso.",
    sections: { numero: "O que o número diz", quebra: "O que quebra", obsoleto: "Obsoleto", doc: "Uma doc por versão maior" },
    number: <>O refy segue o <a href="https://semver.org/lang/pt-BR/">versionamento semântico</a>: <code>MAIOR.MENOR.CORREÇÃO</code>. Correção conserta sem mudar a API. Menor acrescenta família, propriedade, token ou comando sem mexer no que já existe. Só a maior pode remover ou mudar o que você já usa.</>,
    breaking: "Conta como quebra, e por isso só entra numa versão maior:",
    breakingList: [
      "remover família, propriedade, export, token ou comando;",
      "trocar o tipo de uma propriedade para aceitar menos valores;",
      "mudar um valor padrão de um jeito que muda a tela de quem não passou a propriedade.",
    ],
    gate: <>A verificação do refy compara o código com a última versão publicada e recusa a remoção de família, propriedade ou comando dentro da mesma versão maior. Tipo de propriedade, token e valor padrão ainda dependem da revisão de quem aprova a versão.</>,
    deprecation: <>Antes de sair, a propriedade fica obsoleta: o código ganha <code>@deprecated</code> com a troca escrita, a ficha do componente mostra a marca e o que usar no lugar, e o changelog abaixo registra em Obsoleto. Ela continua funcionando em toda a versão maior em que foi marcada e só pode sair na maior seguinte, que traz em Removido o passo de migração. Família e comando também só saem numa versão maior, mas a verificação ainda não exige a marca antes.</>,
    deprecatedHead: ["Propriedade", "Troque por", "Sai a partir da"],
    noDeprecated: "Nada está obsoleto hoje.",
    doc: <>Dentro da mesma versão maior nada quebra, então a doc é uma só: esta doc vale para toda a {major}.x, da {first} à {latest}. O que entrou depois da {first} aparece com a versão em que chegou.</>,
    selector: <>O seletor Versão, no menu da doc, marca o que não existia na versão escolhida e troca o comando de instalação pelo dessa versão. Quando a {Number(major) + 1}.0.0 sair, a doc da {major}.x fica congelada num endereço próprio, e esta passa a valer para a nova maior.</>,
  },
  en: {
    description: "How refy numbers its versions, what each one can change and how these docs show it.",
    sections: { numero: "What the number says", quebra: "What breaks", obsoleto: "Deprecated", doc: "One doc per major version" },
    number: <>refy follows <a href="https://semver.org/">semantic versioning</a>: <code>MAJOR.MINOR.PATCH</code>. A patch fixes without changing the API. A minor adds a family, prop, token or command without touching what exists. Only a major can remove or change what you already use.</>,
    breaking: "These count as breaking, so they only ship in a major version:",
    breakingList: [
      "removing a family, prop, export, token or command;",
      "changing a prop type so it accepts fewer values;",
      "changing a default value in a way that changes the screen for anyone who didn't pass the prop.",
    ],
    gate: <>refy's check compares the code with the latest published version and refuses to remove a family, prop or command within the same major version. Prop types, tokens and default values still rely on the review of whoever approves the release.</>,
    deprecation: <>Before a prop is removed, it becomes deprecated: the code gets <code>@deprecated</code> with the replacement written down, the component page shows the mark and what to use instead, and the changelog below lists it under Deprecated. It keeps working for the whole major version in which it was marked and can only be removed in the next major, which lists the migration step under Removed. Families and commands also leave only in a major, but the check doesn't require the mark first yet.</>,
    deprecatedHead: ["Prop", "Replace with", "Removable from"],
    noDeprecated: "Nothing is deprecated today.",
    doc: <>Nothing breaks within a major version, so there is one doc: these docs cover all of {major}.x, from {first} to {latest}. Anything added after {first} shows the version it arrived in.</>,
    selector: <>The Version selector in the docs menu marks what didn't exist in the chosen version and switches the install command to that version. When {Number(major) + 1}.0.0 ships, the {major}.x docs are frozen at their own address, and these docs move to the new major.</>,
  },
  es: {
    description: "Cómo numera refy sus versiones, qué puede cambiar cada una y cómo lo muestra esta doc.",
    sections: { numero: "Qué dice el número", quebra: "Qué rompe", obsoleto: "Obsoleto", doc: "Una doc por versión mayor" },
    number: <>refy sigue el <a href="https://semver.org/lang/es/">versionado semántico</a>: <code>MAYOR.MENOR.PARCHE</code>. El parche corrige sin cambiar la API. La menor agrega familia, prop, token o comando sin tocar lo que existe. Solo la mayor puede quitar o cambiar lo que ya usas.</>,
    breaking: "Cuenta como ruptura, y por eso solo entra en una versión mayor:",
    breakingList: [
      "quitar una familia, prop, export, token o comando;",
      "cambiar el tipo de una prop para que acepte menos valores;",
      "cambiar un valor por defecto de forma que cambie la pantalla de quien no pasó la prop.",
    ],
    gate: <>La verificación de refy compara el código con la última versión publicada y rechaza quitar una familia, prop o comando dentro de la misma versión mayor. El tipo de las props, los tokens y los valores por defecto todavía dependen de la revisión de quien aprueba la versión.</>,
    deprecation: <>Antes de salir, la prop queda obsoleta: el código recibe <code>@deprecated</code> con el reemplazo escrito, la ficha del componente muestra la marca y qué usar en su lugar, y el changelog de abajo la registra en Obsoleto. Sigue funcionando en toda la versión mayor en la que se marcó y solo puede salir en la mayor siguiente, que trae en Eliminado el paso de migración. Familias y comandos también salen solo en una mayor, pero la verificación todavía no exige la marca antes.</>,
    deprecatedHead: ["Prop", "Cámbiala por", "Sale a partir de"],
    noDeprecated: "Hoy no hay nada obsoleto.",
    doc: <>Dentro de una versión mayor nada se rompe, así que la doc es una sola: esta doc vale para toda la {major}.x, de la {first} a la {latest}. Lo que llegó después de la {first} aparece con la versión en la que llegó.</>,
    selector: <>El selector Versión, en el menú de la doc, marca lo que no existía en la versión elegida y cambia el comando de instalación por el de esa versión. Cuando salga la {Number(major) + 1}.0.0, la doc de la {major}.x queda congelada en una dirección propia, y esta pasa a valer para la nueva mayor.</>,
  },
};

// "Use subtitle." vem do JSDoc, em inglês como o código: na tabela fica só o nome da troca.
const replacement = (use: string) => /^Use\s+`?([A-Za-z]\w*(?:\.\w+)*)`?/i.exec(use)?.[1] ?? use;

export function versionsPolicy(locale: Locale) {
  const t = text[locale];
  return {
    description: t.description,
    sections: Object.entries(t.sections) as Array<[string, string]>,
    body: (<>
      <section id="numero">
        <h2>{t.sections.numero}</h2>
        <p>{t.number}</p>
      </section>
      <section id="quebra">
        <h2>{t.sections.quebra}</h2>
        <p>{t.breaking}</p>
        <ul>{t.breakingList.map((item, index) => <li key={index}>{item}</li>)}</ul>
        <p>{t.gate}</p>
      </section>
      <section id="obsoleto">
        <h2>{t.sections.obsoleto}</h2>
        <p>{t.deprecation}</p>
        {deprecated.length ? (
          <table>
            <thead><tr>{t.deprecatedHead.map((head) => <th key={head}>{head}</th>)}</tr></thead>
            <tbody>
              {deprecated.map(([key, item]) => (
                <tr key={key}>
                  <td><code>{key.split(".")[1]}</code><br /><small>{key.split(".")[0]}</small></td>
                  <td><code>{replacement(item.use)}</code></td>
                  <td>{item.removal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>{t.noDeprecated}</p>}
      </section>
      <section id="doc">
        <h2>{t.sections.doc}</h2>
        <p>{t.doc}</p>
        <p>{t.selector}</p>
      </section>
    </>),
  };
}
