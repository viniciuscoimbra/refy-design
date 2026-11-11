#!/usr/bin/env node
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, relative, isAbsolute, sep } from "node:path";
import { inspectFiles } from "./check.mjs";
const catalog = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../../ai/catalog.json", import.meta.url)),
    "utf8",
  ),
);
const documentsRoot = realpathSync(fileURLToPath(new URL("../../ai/", import.meta.url)));
const documents = new Map();
function documentFor(component) {
  if (!documents.has(component.id)) {
    const path = realpathSync(resolve(documentsRoot, component.document));
    const local = relative(documentsRoot, path);
    if (isAbsolute(local) || local === ".." || local.startsWith(".." + sep))
      throw Error(`Document outside catalog root: ${component.id}`);
    documents.set(component.id, JSON.parse(readFileSync(path, "utf8")));
  }
  return documents.get(component.id);
}
function normalize(value) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase();
}
const definitions = catalog.collections ?? [];
function collectionMatches(collection, query) {
  return normalize([collection.id, collection.label, collection.description, ...(collection.keywords ?? [])].join(" ")).includes(query);
}
const [command, ...args] = process.argv.slice(2);
try {
  if (!command || command === "--help") {
    console.log(
      JSON.stringify(
        {
          package: catalog.package,
          version: catalog.packageVersion,
          commands: [
            "catalog [query]",
            "collections [id-or-query]",
            "component <family-or-documented-api>",
            "init [--from <tgz>] [--entry <file>] [--dry-run] [--offline]",
            "contribute <Nome> [--refy <repo>]  (refy-extensions/<Nome> → refy-contrib/<Nome>, sem PR nem push)",
            "inspect [files-or-dirs...]",
            "check [--theme <file>] [files-or-dirs...]  (default: include from refy-agent.config.json; theme.json in the project root when --theme is absent)",
          ],
          prerequisite:
            "inspect/check require TypeScript in the consumer; catalog/component require only Node.",
          writes: "only init, which shows a diff for every existing file it changes",
          network: "only init, through npm install (prefer-offline; --offline forbids it)",
        },
        null,
        2,
      ),
    );
  } else if (command === "--version") {
    console.log(catalog.packageVersion);
  } else if (command === "collections") {
    const query = normalize(args.join(" "));
    const exact = definitions.find(collection => normalize(collection.id) === query);
    const selected = exact ? [exact] : definitions.filter(collection => collectionMatches(collection, query));
    console.log(JSON.stringify({
      schemaVersion: catalog.schemaVersion,
      package: catalog.package,
      packageVersion: catalog.packageVersion,
      sourceSha256: catalog.sourceSha256,
      query: args.join(" "),
      empty: selected.length === 0,
      collections: selected.map(collection => {
        const members = catalog.components.filter(component => (component.collections ?? []).includes(collection.id));
        return { ...collection, count: members.length, empty: members.length === 0, members };
      }),
      limits: catalog.limits,
    }, null, 2));
  } else if (command === "catalog") {
    const query = normalize(args.join(" "));
    const match = catalog.components.filter((component) =>
      normalize(JSON.stringify(component)).includes(query) ||
      definitions.some(collection => (component.collections ?? []).includes(collection.id) && collectionMatches(collection, query)) ||
      (documentFor(component).api ?? []).some((member) =>
        normalize(member.name).includes(query),
      ),
    );
    console.log(
      JSON.stringify(
        {
          schemaVersion: catalog.schemaVersion,
          package: catalog.package,
          packageVersion: catalog.packageVersion,
          sourceSha256: catalog.sourceSha256,
          instructions: catalog.instructions,
          choices: catalog.choices,
          collections: definitions,
          components: match,
          limits: catalog.limits,
        },
        null,
        2,
      ),
    );
  } else if (command === "component") {
    if (args.length !== 1)
      throw Error("component requires one family id, public name or documented API member.");
    const primary = catalog.components.find(
      (c) => c.id === args[0] || c.publicName === args[0],
    );
    const candidates = primary ? [primary] : catalog.components.filter((c) =>
      (documentFor(c).api ?? []).some((member) => member.name === args[0]),
    );
    if (!candidates.length) throw Error(`Unknown family or documented API member: ${args[0]}`);
    if (candidates.length > 1)
      throw Error(`Ambiguous API member ${args[0]}; use family id: ${candidates.map(c => c.id).join(", ")}`);
    const component = candidates[0];
    const document = documentFor(component);
    console.log(JSON.stringify(primary ? document : {
      ...document,
      resolution: {
        family: component.id,
        apiMember: args[0],
        kind: "documented-api-member",
        runtimeExportVerified: false,
      },
    }, null, 2));
  } else if (command === "contribute") {
    const { contribute } = await import("./contribute.mjs");
    const gates = await contribute(args);
    if (!gates.passed) process.exitCode = 1;
  } else if (command === "init") {
    const { init } = await import("./init.mjs");
    await init(args);
  } else if (command === "inspect" || command === "check") {
    const at = args.indexOf("--theme");
    if (at >= 0 && !args[at + 1]) throw Error("--theme requires a JSON file: refy check --theme theme.json src");
    const theme = at >= 0 ? args[at + 1] : undefined;
    const files = at >= 0 ? args.filter((_, i) => i !== at && i !== at + 1) : args;
    const report = await inspectFiles(process.cwd(), files, catalog, { theme });
    console.log(JSON.stringify(report, null, 2));
    if (command === "check" && !report.passed) process.exitCode = 1;
  } else
    throw Error(
      "Usage: refy collections [id-or-query] | catalog [query] | component <name> | init [--from <tgz>] | inspect [files...] | check [files...]",
    );
} catch (error) {
  console.error(JSON.stringify({ error: error.message }));
  process.exitCode = 2;
}
