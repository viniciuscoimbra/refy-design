// node:module: o único pacote que o servidor pede por require é o TypeScript, que vai no build.
import ts from "typescript";
const PACKAGES = { typescript: ts };
export function createRequire() {
  const require = (id) => {
    if (id in PACKAGES) return PACKAGES[id];
    throw Object.assign(Error(`Cannot find module '${id}'`), { code: "MODULE_NOT_FOUND" });
  };
  require.resolve = (id) => {
    const name = id.split("/")[0];
    if (name in PACKAGES) return `/pkg/node_modules/${id}`;
    throw Object.assign(Error(`Cannot find module '${id}'`), { code: "MODULE_NOT_FOUND" });
  };
  return require;
}
export default { createRequire };
