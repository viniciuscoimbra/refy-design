// Precisa ser o primeiro import do Worker. `process.browser`, para o TypeScript não se achar no
// Node (o runtime pode já trazer um `process`); REFY_MCP_PROJECT vazio: o servidor não tem pasta
// de projeto. Buffer mínimo só
// para a constante que compare.mjs monta ao carregar (refy_compare não existe no remoto).
globalThis.process ??= { cwd: () => "/", platform: "linux", versions: {} };
process.browser = true;
process.env ??= {};
process.env.REFY_MCP_PROJECT = "";
process.cwd ??= () => "/";
globalThis.Buffer ??= {
  from: (bytes) => Uint8Array.from(bytes),
  alloc: (size) => new Uint8Array(size),
  concat: (list) => { const out = new Uint8Array(list.reduce((n, b) => n + b.length, 0)); let at = 0; for (const b of list) { out.set(b, at); at += b.length; } return out; },
};
