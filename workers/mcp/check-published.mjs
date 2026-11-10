#!/usr/bin/env node
// O MCP remoto só sobe com uma versão que o consumidor consegue instalar: package.json tem que
// estar no npm. Sem isso o agente lê nomes e props que `npm install` não entrega (RMCP-04).
// Uso: node workers/mcp/check-published.mjs [versões publicadas, separadas por vírgula, para teste]
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
const given = process.argv[2];
const versions = given !== undefined ? given.split(",").filter(Boolean) : [].concat(JSON.parse(execFileSync("npm", ["view", pkg.name, "versions", "--json"], { encoding: "utf8" })));
if (!versions.includes(pkg.version)) {
  console.error(`${pkg.name} ${pkg.version} não está no npm (publicadas: ${versions.join(", ") || "nenhuma"}). Publique antes de subir o MCP remoto.`);
  process.exit(1);
}
console.log(`${pkg.name} ${pkg.version} está no npm; o MCP remoto pode subir.`);
