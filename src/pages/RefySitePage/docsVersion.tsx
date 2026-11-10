// Versão da doc que a pessoa está lendo. Há uma doc por versão maior (hoje a 1.x): as menores da
// mesma maior não quebram nada (SemVer), então a página é a mesma e só as marcas mudam. Escolher a
// 1.0.0 mostra o que ainda não existia nela e o comando de instalação dessa versão.
// Tudo vem de src/catalog/versions.json, gerado das tags de release por scripts/api-history.mjs.
import { useSyncExternalStore } from "react";
import { Badge, Callout, CodeBlock, Select } from "../../index";
import { installCommands, mobilePackage, mobilePeers } from "./packageRelease";
import versions from "../../catalog/versions.json";
import { tr } from "./i18n";
import styles from "./RefySitePage.module.css";

export type Since = string;
interface Deprecation { since: string; use: string; removal: string }

export const docVersions: string[] = versions.releases.map((release) => release.version);
export const latestVersion = docVersions[0];
const baseline = versions.baseline;
const web = versions.web as { families: Record<string, Since>; props: Record<string, Since>; deprecated: Record<string, Deprecation>; removed: Record<string, string>; bins: Record<string, Since> };
const mobile = versions.mobile as { since: Since | null; families: Record<string, Since> };

const parse = (version: string) => (version === "unreleased" ? [Infinity, 0, 0] : version.split(".").map(Number));
/** Negativo quando `a` vem antes de `b`. "unreleased" vem depois de qualquer versão publicada. */
export function compareVersions(a: string, b: string) {
  const [x, y] = [parse(a), parse(b)];
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
}

export const familySince = (id: string): Since => web.families[id] ?? baseline;
export const propSince = (api: string, prop: string): Since => web.props[`${api}.${prop}`] ?? baseline;
export const propDeprecation = (api: string, prop: string): Deprecation | undefined => web.deprecated[`${api}.${prop}`];
export const binSince = (name: string): Since | undefined => web.bins[name];
export const mobileSince = (name?: string): Since | null => (name && mobile.families[name]) || mobile.since;
export const isNewerThanBaseline = (since: Since) => since !== baseline;

// Estado do módulo: a escolha atravessa a navegação do site sem recarregar. `?v=1.1.0` no endereço
// abre a doc já nessa versão, para mandar o link a alguém.
let selected = latestVersion;
if (typeof window !== "undefined") {
  const asked = new URLSearchParams(window.location.search).get("v");
  if (asked && docVersions.includes(asked)) selected = asked;
}
const listeners = new Set<() => void>();
export function setDocsVersion(version: string) {
  if (!docVersions.includes(version) || version === selected) return;
  selected = version;
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    if (version === latestVersion) url.searchParams.delete("v");
    else url.searchParams.set("v", version);
    window.history.replaceState(window.history.state, "", url);
  }
  listeners.forEach((listener) => listener());
}
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const useDocsVersion = () => useSyncExternalStore(subscribe, () => selected, () => latestVersion);

/** Algo que chegou em `since` não existe na versão escolhida. */
export const missingIn = (since: Since | null | undefined, version: string) => Boolean(since) && compareVersions(since!, version) > 0;

const sinceLabel = (since: Since) => (since === "unreleased" ? tr("Ainda não publicado") : `${tr("Desde a")} ${since}`);

/** Seletor de versão. `compact` cabe na linha de metadados da ficha: sem rótulo visível nem link. */
export function VersionSelect({ compact = false }: { compact?: boolean }) {
  const version = useDocsVersion();
  const options = docVersions.map((item) => (
    <option key={item} value={item}>{item === latestVersion ? `${item} (${tr("atual")})` : item}</option>
  ));
  if (compact) {
    return (
      <span className={styles.versionInline}>
        {tr("Versão")}
        <Select aria-label={tr("Versão")} block={false} value={version} onChange={(event) => setDocsVersion(event.target.value)}>{options}</Select>
      </span>
    );
  }
  return (
    <div className={styles.versionSelect}>
      <Select label={tr("Versão")} value={version} onChange={(event) => setDocsVersion(event.target.value)}>{options}</Select>
      <a href="/docs/versoes">{tr("O que muda entre versões")}</a>
    </div>
  );
}

export function SinceBadge({ since }: { since: Since }) {
  return <Badge tone={since === "unreleased" ? "warn" : "neutral"}>{sinceLabel(since)}</Badge>;
}

const warnIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

/** Aviso no topo quando a página inteira chegou depois da versão escolhida. */
export function NotInVersion({ since }: { since: Since | null | undefined }) {
  const version = useDocsVersion();
  if (!missingIn(since, version)) return null;
  return (
    <Callout className={styles.versionNotice} tone="warn" icon={warnIcon} title={`${tr("Não existe na")} ${version}`}>
      {since === "unreleased"
        ? tr("Isto ainda não saiu em nenhuma versão publicada.")
        : `${tr("Isto chegou na")} ${since}. ${tr("Atualize o pacote para usar.")}`}
    </Callout>
  );
}

/**
 * Comando de instalação da versão escolhida. Na atual fica sem número, como o npm recomenda; numa
 * anterior fixa a versão daquele pacote (o mobile tem número próprio).
 */
export function InstallCommand({ label, mobile: forMobile = false }: { label?: string; mobile?: boolean }) {
  const version = useDocsVersion();
  const release = versions.releases.find((item) => item.version === version);
  const pinned = version === latestVersion ? null : forMobile ? release?.packages.mobile : release?.packages.web;
  const code = forMobile
    ? `npx expo install ${mobilePackage}${pinned ? `@${pinned}` : ""} ${mobilePeers}`
    : `${installCommands.npm}${pinned ? `@${pinned}` : ""}`;
  return <CodeBlock label={label} language="bash" wrap={forMobile} code={code} />;
}

/** `@1.1.0` quando a pessoa escolheu uma versão anterior; vazio na atual. */
export function useWebPin() {
  const version = useDocsVersion();
  if (version === latestVersion) return "";
  const web = versions.releases.find((item) => item.version === version)?.packages.web;
  return web ? `@${web}` : "";
}
