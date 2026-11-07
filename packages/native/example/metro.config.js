// O exemplo importa ../src e os tokens gerados em ../../tokens/dist (rode `npm --prefix ../../tokens run build` antes).
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const root = path.resolve(__dirname, "..");
config.watchFolders = [root, path.resolve(root, "../tokens"), path.resolve(root, "../../src/themes")];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];
config.resolver.extraNodeModules = { "@refy/tokens": path.resolve(root, "../tokens/dist") };
module.exports = config;
