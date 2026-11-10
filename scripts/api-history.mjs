// Histórico da API pública por versão publicada, tirado das tags de release e não escrito à mão.
// Para cada versão do CHANGELOG, lê na tag `aprovado/vX.Y.Z` a documentação gerada dos tipos
// (src/pages/PlaygroundPage/documentation/*.json) e o pacote mobile, e grava em
// src/catalog/versions.json desde quando cada família e cada propriedade existe, o que ficou
// obsoleto e o que saiu. A doc do site e o catálogo dos agentes leem esse arquivo.
//
//   node scripts/api-history.mjs           grava src/catalog/versions.json
//   node scripts/api-history.mjs --check   falha se o arquivo estiver desatualizado ou se uma
//                                          remoção quebrar o SemVer
//
// Regra do SemVer que este script cobra: dentro da mesma versão maior, nada sai. Família ou
// propriedade que existia numa versão publicada e sumiu do código só passa se a versão do pacote
// já for a próxima maior. O caminho é marcar `@deprecated` com a troca e remover na maior seguinte.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseReleases } from "../src/pages/RefySitePage/releases.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsDir = "src/pages/PlaygroundPage/documentation";
const nativeDir = "packages/native/src";
const output = join(root, "src/catalog/versions.json");
const check = process.argv.includes("--check");

const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
const insideRepo = () => {
  try { return git("rev-parse", "--is-inside-work-tree").trim() === "true"; } catch { return false; }
};
const parse = (text) => text.split(".").map(Number);
const compare = (a, b) => {
  const [x, y] = [parse(a), parse(b)];
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};
const nextMajor = (version) => `${parse(version)[0] + 1}.0.0`;

const releases = parseReleases(readFileSync(join(root, "CHANGELOG.md"), "utf8")).sort((a, b) => compare(a.version, b.version));
assert(releases.length, "CHANGELOG.md sem versão publicada");
const current = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
const released = new Set(releases.map((item) => item.version));

function tagFor(version) {
  for (const name of [`aprovado/v${version}`, `v${version}`]) {
    try {
      git("rev-parse", "--verify", "--quiet", `${name}^{commit}`);
      return name;
    } catch { /* tenta o outro nome */ }
  }
  // No repositório público a versão é o commit "refy X.Y.Z" da linha de main; a tag dele pode
  // nascer depois do CI, quando o release.yml roda.
  try {
    const sha = git("log", "--first-parent", "-1", "--format=%H", "-E", `--grep=^refy ${version.replaceAll(".", "\\.")}$`, "HEAD").trim();
    if (sha) return sha;
  } catch { /* fora de um repositório */ }
  return null;
}

// Leitura igual na árvore de trabalho e numa tag, para a versão atual e as publicadas passarem pelo mesmo código.
const source = (tag) => ({
  list: (dir) => (tag
    ? git("ls-tree", "--name-only", `${tag}:${dir}`).split("\n").filter(Boolean)
    : (existsSync(join(root, dir)) ? readdirSync(join(root, dir)) : [])),
  read: (path) => {
    try {
      return tag ? git("show", `${tag}:${path}`) : readFileSync(join(root, path), "utf8");
    } catch {
      return null;
    }
  },
});

// Componentes do mobile: o mesmo critério de scripts/native-components.mjs (função ou constante
// exportada com nome em maiúscula), seguindo os `export * from`.
function nativeExports(files, path, seen = new Set()) {
  if (seen.has(path)) return [];
  seen.add(path);
  let text = null;
  for (const ext of [".tsx", ".ts", "/index.tsx", "/index.ts"]) {
    text = files.read(path + ext);
    if (text !== null) break;
  }
  if (text === null) return [];
  const names = [...text.matchAll(/export\s+(?:const|function)\s+([A-Z]\w+)/g)].map((m) => m[1]);
  for (const m of text.matchAll(/export\s*\{([^}]+)\}\s*from\s*"([^"]+)"/g))
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/).pop();
      if (/^[A-Z]\w+$/.test(name)) names.push(name);
    }
  for (const m of text.matchAll(/export\s+\*\s+from\s+"([^"]+)"/g))
    names.push(...nativeExports(files, join(dirname(path), m[1]).replace(/\\/g, "/"), seen));
  return names;
}

function snapshot(tag) {
  const files = source(tag);
  const families = new Set();
  const props = new Map();
  const owner = new Map();
  for (const name of files.list(docsDir).filter((file) => file.endsWith(".json"))) {
    const doc = JSON.parse(files.read(`${docsDir}/${name}`));
    families.add(doc.id);
    for (const api of doc.api)
      for (const prop of api.props) {
        props.set(`${api.name}.${prop.name}`, deprecationNote(prop.deprecated));
        owner.set(`${api.name}.${prop.name}`, doc.id);
      }
  }
  const nativeVersion = JSON.parse(files.read("packages/native/package.json") ?? '{"version":"0.0.0"}').version;
  const mobile = nativeVersion === "0.0.0" ? new Set() : new Set(nativeExports(files, `${nativeDir}/index`));
  const manifest = JSON.parse(files.read("package.json"));
  const web = manifest.version;
  const bins = new Set(Object.keys(manifest.bin ?? {}));
  return { bins, files, families, props, owner, mobile, packages: { web, mobile: nativeVersion === "0.0.0" ? null : nativeVersion } };
}

// A ficha guarda a marca como { replacement, note } desde a 1.3.1; antes, a tag não trazia marca.
function deprecationNote(value) {
  return value?.note ?? (value?.replacement ? `Use ${value.replacement}.` : null);
}

// Tags anteriores ao extrator levar `@deprecated` para a doc: a marca é procurada no fonte da tag,
// na pasta da família, logo antes da declaração da propriedade.
function markedInSource(item, key) {
  const family = item.owner.get(key);
  if (!family) return false;
  const prop = key.split(".").pop();
  // O bloco JSDoc inteiro, numa linha ou em várias, desde que a marca e a propriedade sejam vizinhas.
  const pattern = new RegExp(`/\\*\\*(?:(?!\\*/)[\\s\\S])*@deprecated(?:(?!\\*/)[\\s\\S])*\\*/\\s*(?:readonly\\s+)?${prop}\\??:`);
  const dir = `src/components/${family}`;
  return item.files.list(dir).some((file) => /\.tsx?$/.test(file) && pattern.test(item.files.read(`${dir}/${file}`) ?? ""));
}

function build() {
  const history = [];
  const missing = [];
  for (const release of releases) {
    const tag = tagFor(release.version);
    // A versão do package.json já está no CHANGELOG e a tag `aprovado/` só nasce depois (é o que
    // promote.mjs exige): o próprio código é essa versão.
    if (!tag && release.version === current) history.push({ version: release.version, date: release.date, ...snapshot(null) });
    else if (!tag) missing.push(release.version);
    else history.push({ version: release.version, date: release.date, ...snapshot(tag) });
  }
  if (missing.length) return { missing };
  const now = snapshot(null);
  // O que ainda não saiu em versão nenhuma fica como "unreleased" (a seção Unreleased do Keep a
  // Changelog) até o package.json subir para a versão que vai publicar.
  const pending = released.has(current) ? "unreleased" : current;
  const baseline = history[0].version;
  const firstSeen = (key, pick) => history.find((item) => pick(item).has(key))?.version ?? pending;

  const errors = [];

  const families = {};
  for (const id of [...now.families].sort()) {
    const since = firstSeen(id, (item) => item.families);
    if (since !== baseline) families[id] = since;
  }
  const props = {};
  const deprecated = {};
  for (const [key, use] of [...now.props].sort(([a], [b]) => a.localeCompare(b))) {
    const since = firstSeen(key, (item) => item.props);
    if (since !== baseline) props[key] = since;
    if (use) {
      const from = history.find((item) => item.props.get(key) || markedInSource(item, key))?.version ?? pending ?? current;
      deprecated[key] = { since: from, use, removal: nextMajor(from === "unreleased" ? current : from) };
    }
  }

  // Saiu do código: só vale numa versão maior nova, e precisa ter passado por @deprecated.
  const removed = {};
  const last = history.at(-1);
  const lastMajor = parse(last.version)[0];
  const majorBump = parse(current)[0] > lastMajor;
  for (const [kind, pick] of [["Família", (item) => item.families], ["Propriedade", (item) => item.props], ["Comando", (item) => item.bins]]) {
    for (const key of pick(last).keys()) {
      if (pick(now).has(key)) continue;
      if (!majorBump) errors.push(`${kind} ${key} existe na ${last.version} e saiu do código: na ${lastMajor}.x isso quebra quem usa. Marque @deprecated com a troca e remova na ${lastMajor + 1}.0.0`);
      else if (kind === "Propriedade" && !last.props.get(key) && !markedInSource(last, key)) errors.push(`Propriedade ${key} sai na ${current} sem ter sido marcada @deprecated antes`);
      else removed[key] = current;
    }
  }

  // Comandos que o pacote instala (refy-agent, refy-mcp): saem do campo `bin` do package.json.
  const bins = {};
  for (const name of [...now.bins].sort()) bins[name] = firstSeen(name, (item) => item.bins);

  const mobileSince = history.find((item) => item.packages.mobile)?.version ?? null;
  const mobile = {};
  for (const name of [...now.mobile].sort()) {
    const since = history.find((item) => item.mobile.has(name))?.version ?? pending;
    if (since !== mobileSince) mobile[name] = since;
  }

  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  return {
    $comment: "Gerado por scripts/api-history.mjs a partir das tags de release. Não edite à mão.",
    current,
    baseline,
    releases: history.map((item) => ({ version: item.version, date: item.date, packages: item.packages })).reverse(),
    web: { families, props, deprecated, removed, bins },
    mobile: { since: mobileSince, families: mobile },
  };
}

const text = (data) => JSON.stringify(data, null, 2) + "\n";
const result = build();
if (result.missing) {
  // Clone sem as tags: sem histórico a trava de SemVer não roda. No CI isso é falha, porque o
  // ci.yml busca as tags; fora dele, o aviso diz o que deixou de ser conferido.
  const message = `Tags ausentes para ${result.missing.join(", ")}: a remoção dentro da mesma versão maior não foi conferida. Rode git fetch --tags.`;
  // A árvore exportada pela promoção não tem .git: ali não há tag a buscar, e quem cobra o
  // histórico é o CI do clone.
  if (process.env.CI && insideRepo()) {
    console.error(message);
    process.exit(1);
  }
  console.warn(message);
  assert(existsSync(output), "src/catalog/versions.json ausente e sem tags para gerar");
  const saved = JSON.parse(readFileSync(output, "utf8"));
  assert.equal(saved.current, current, `versions.json diz ${saved.current} e o package.json diz ${current}: rode node scripts/api-history.mjs num clone com as tags`);
  console.log("Sem as tags de release neste clone: conferido só que versions.json acompanha o package.json.");
} else if (check) {
  const saved = existsSync(output) ? readFileSync(output, "utf8") : "";
  if (saved !== text(result)) {
    console.error("src/catalog/versions.json desatualizado: rode node scripts/api-history.mjs");
    process.exit(1);
  }
  console.log(`OK: histórico da API de ${result.releases.length} versões confere com as tags.`);
} else {
  writeFileSync(output, text(result));
  const count = Object.keys(result.web.deprecated).length;
  console.log(`versions.json: ${result.releases.length} versões, ${count} propriedades obsoletas, ${Object.keys(result.web.removed).length} removidas.`);
}
