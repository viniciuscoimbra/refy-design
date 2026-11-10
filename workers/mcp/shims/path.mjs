// node:path só com o lado POSIX, o que o servidor usa dentro do Worker.
export const sep = "/";
export const delimiter = ":";
function normalizeParts(path) {
  const out = [];
  for (const part of path.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") out.pop();
    else out.push(part);
  }
  return out;
}
export const isAbsolute = (p) => String(p).startsWith("/");
export function resolve(...paths) {
  let path = "";
  for (let i = paths.length - 1; i >= 0 && !isAbsolute(path); i--) path = String(paths[i]) + (path ? "/" + path : "");
  if (!isAbsolute(path)) path = "/" + path;
  return "/" + normalizeParts(path).join("/");
}
export function normalize(p) {
  const abs = isAbsolute(p), parts = normalizeParts(String(p));
  return (abs ? "/" : "") + (parts.join("/") || (abs ? "" : "."));
}
export const join = (...paths) => normalize(paths.filter((p) => p !== "").join("/") || ".");
export function dirname(p) {
  const parts = normalizeParts(String(p));
  parts.pop();
  return (isAbsolute(p) ? "/" : "") + (parts.join("/") || (isAbsolute(p) ? "" : "."));
}
export function basename(p, ext) {
  const base = String(p).replace(/\/+$/, "").split("/").pop() ?? "";
  return ext && base.endsWith(ext) ? base.slice(0, -ext.length) : base;
}
export function extname(p) {
  const base = basename(p), i = base.lastIndexOf(".");
  return i > 0 ? base.slice(i) : "";
}
export function relative(from, to) {
  const a = normalizeParts(resolve(from)), b = normalizeParts(resolve(to));
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return [...Array(a.length - i).fill(".."), ...b.slice(i)].join("/");
}
export const posix = { sep, delimiter, isAbsolute, resolve, normalize, join, dirname, basename, extname, relative };
export default posix;
