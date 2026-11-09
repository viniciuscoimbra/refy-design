import { Callout, CodeBlock } from "../../index";
import { tr } from "./i18n";
import { installCommands, packagePublished } from "./packageRelease";

// Comando de instalação das fichas e dos catálogos. Antes da publicação mostra o aviso no lugar
// do comando, porque qualquer comando daria 404.
export function PackageInstall() {
  if (!packagePublished) {
    return <Callout tone="warn" title={tr("Ainda não publicado")}>{tr("O refy ainda não foi publicado: hoje nenhum comando instala o pacote.")}</Callout>;
  }
  return <CodeBlock language="bash" label={tr("Instalação")} code={installCommands.npm} />;
}

