// Prévia do pacote mobile dentro do site: o mesmo código React Native, desenhado pelo
// react-native-web. Só a aba Mobile das fichas carrega esse pedaço (import dinâmico).
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tokens = join(root, "packages/tokens/dist/index.js");

export function nativePreview() {
  return {
    name: "refy:native-preview",
    config() {
      // Os tokens do pacote mobile são gerados; um clone novo ainda não os tem.
      if (!existsSync(tokens)) execFileSync("node", [join(root, "packages/tokens/build.mjs")], { stdio: "inherit" });
      return {
        resolve: {
          alias: [
            { find: /^react-native$/, replacement: "react-native-web" },
            { find: /^@refy\/tokens$/, replacement: tokens },
            { find: /^@refy-design\/web\/contracts$/, replacement: join(root, "src/contracts/index.ts") },
          ],
          // O código nativo mora em packages/native, que tem o próprio node_modules: sem isso a
          // prévia trazia uma segunda cópia do React.
          dedupe: ["react", "react-dom", "react-native-web", "react-native-svg"],
          extensions: [".web.mjs", ".web.js", ".web.tsx", ".web.ts", ".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json"],
        },
        // O Animated do react-native-web chama `global.cancelAnimationFrame`; sem isto, todo
        // componente animado da prévia caía com "global is not defined" e a ficha mostrava
        // o celular vazio.
        define: { __DEV__: "false", global: "globalThis" },
        optimizeDeps: { esbuildOptions: { define: { global: "globalThis" }, resolveExtensions: [".web.js", ".web.tsx", ".web.ts", ".js", ".ts", ".tsx", ".jsx"] } },
      };
    },
  };
}
