// O app importa ../src (a ponte), ../demo (o agente da demo web), os temas e a foto do repositório.
// Um React só: o node_modules de packages/a2ui (React da web) fica fora do Metro, e tudo que ../src
// importa resolve no node_modules deste app.
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const pkg = path.resolve(__dirname, "..");
const repo = path.resolve(pkg, "../..");
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
config.watchFolders = [path.join(pkg, "src"), path.join(pkg, "demo"), path.join(repo, "src/themes"), path.join(repo, "src/blocks/photos")];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];
config.resolver.blockList = [new RegExp(`^${escape(path.join(pkg, "node_modules"))}/.*`)];
// O fonte da ponte importa "./ids.js" (ESM do pacote publicado); aqui o arquivo é ids.ts.
config.resolver.resolveRequest = (context, name, platform) => {
  if (name.startsWith(".") && name.endsWith(".js") && context.originModulePath.startsWith(pkg) && !context.originModulePath.includes("node_modules")) {
    try {
      return context.resolveRequest(context, name.slice(0, -3), platform);
    } catch {
      // segue para a resolução normal
    }
  }
  return context.resolveRequest(context, name, platform);
};
module.exports = config;
