// node:fs em memória. O pacote (ai/, dist/*.d.ts, fundação de tokens) entra no build como mapa
// caminho → texto, sob /pkg; o resto (pasta temporária do refy_validate) vive só durante o pedido.
import FILES from "refy:files";
import { dirname, resolve } from "./path.mjs";

const files = new Map(Object.entries(FILES));
const dirs = new Set(["/", "/tmp"]);
const links = new Map();
const addDirs = (path) => { for (let d = dirname(path); !dirs.has(d); d = dirname(d)) dirs.add(d); };
for (const path of files.keys()) addDirs(path);

const fail = (code, path) => Object.assign(Error(`${code}: ${path}`), { code, path });
function real(path) {
  let p = resolve(String(path));
  for (const [link, target] of links) if (p === link || p.startsWith(link + "/")) p = target + p.slice(link.length);
  return p;
}
const stat = (path) => {
  const p = real(path);
  if (files.has(p)) return { isFile: () => true, isDirectory: () => false, isSymbolicLink: () => false, size: files.get(p).length };
  if (dirs.has(p)) return { isFile: () => false, isDirectory: () => true, isSymbolicLink: () => false, size: 0 };
  throw fail("ENOENT", path);
};
export const existsSync = (path) => { try { stat(path); return true; } catch { return false; } };
export const statSync = stat;
export const lstatSync = (path) => (links.has(resolve(String(path))) ? { isFile: () => false, isDirectory: () => false, isSymbolicLink: () => true } : stat(path));
export function realpathSync(path) { stat(path); return real(path); }
export function readFileSync(path) {
  const p = real(path);
  if (!files.has(p)) throw fail(dirs.has(p) ? "EISDIR" : "ENOENT", path);
  return files.get(p);
}
export function readdirSync(path, options = {}) {
  const p = real(path);
  if (!dirs.has(p)) throw fail("ENOTDIR", path);
  const prefix = p === "/" ? "/" : p + "/";
  const names = new Map();
  for (const f of files.keys()) if (f.startsWith(prefix)) { const n = f.slice(prefix.length).split("/"); names.set(n[0], n.length > 1); }
  for (const d of dirs) if (d.startsWith(prefix) && d !== p) names.set(d.slice(prefix.length).split("/")[0], true);
  for (const l of links.keys()) if (dirname(l) === p) names.set(l.slice(prefix.length), true);
  const sorted = [...names].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  if (!options.withFileTypes) return sorted.map(([n]) => n);
  return sorted.map(([name, isDir]) => ({ name, isFile: () => !isDir, isDirectory: () => isDir, isSymbolicLink: () => links.has(prefix + name) }));
}
export function writeFileSync(path, data) {
  const p = real(path);
  if (!dirs.has(dirname(p))) throw fail("ENOENT", path);
  files.set(p, String(data));
}
export function mkdirSync(path, options = {}) {
  const p = real(path);
  if (options.recursive) addDirs(p + "/x");
  else if (!dirs.has(dirname(p))) throw fail("ENOENT", path);
  dirs.add(p);
}
let serial = 0;
export function mkdtempSync(prefix) {
  const p = resolve(`${prefix}${(++serial).toString(36).padStart(6, "0")}`);
  mkdirSync(p, { recursive: true });
  return p;
}
export function symlinkSync(target, path) { links.set(resolve(String(path)), resolve(String(target))); }
export function rmSync(path, options = {}) {
  const p = resolve(String(path));
  if (links.delete(p)) return;
  for (const f of [...files.keys()]) if (f === p || f.startsWith(p + "/")) files.delete(f);
  for (const d of [...dirs]) if (d === p || d.startsWith(p + "/")) dirs.delete(d);
  for (const l of [...links.keys()]) if (l.startsWith(p + "/")) links.delete(l);
  if (!options.force && !existsSync(dirname(p))) throw fail("ENOENT", path);
}
export default { existsSync, statSync, lstatSync, realpathSync, readFileSync, readdirSync, writeFileSync, mkdirSync, mkdtempSync, symlinkSync, rmSync };
