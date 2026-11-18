// Os testes rodam o TypeScript de src/ direto no Node (--experimental-strip-types). O código importa
// os vizinhos com `.js`, como o build espera; aqui `./x.js` sem arquivo vira `./x.ts`.
import { register } from "node:module";

register(
  "data:text/javascript," +
    encodeURIComponent(`
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (error) {
    if (error?.code !== "ERR_MODULE_NOT_FOUND" || !/^\\.{1,2}\\/.*\\.js$/.test(specifier)) throw error;
    return next(specifier.replace(/\\.js$/, ".ts"), context);
  }
}`),
);
