// node:os e node:url: só o que o servidor chama.
export const tmpdir = () => "/tmp";
export const fileURLToPath = (url) => decodeURIComponent(new URL(String(url)).pathname);
export const pathToFileURL = (path) => new URL("file://" + encodeURI(path));
export default { tmpdir, fileURLToPath, pathToFileURL };
