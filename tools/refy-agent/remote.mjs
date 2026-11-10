// Servidor MCP do Refy por HTTP (Streamable HTTP, sem sessão), para clientes que só falam com
// servidor remoto: Claude.ai, ChatGPT e Gemini na web. Usa só Request, Response e fetch, então roda
// no Cloudflare Workers, no Deno ou no Node 18+. As ferramentas são as mesmas do stdio
// (mcp-server.mjs), menos o que depende do computador de quem usa.
import { answer, rpcError } from "./mcp-server.mjs";
import { checkUrl, fetchSite } from "./theme-extract.mjs";

const MAX_BODY = 2_000_000;
const PAGE_LIMIT = 3_000_000;
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, GET, OPTIONS",
  "access-control-allow-headers": "content-type, accept, authorization, mcp-protocol-version, mcp-session-id, last-event-id",
  "access-control-expose-headers": "mcp-protocol-version",
  "access-control-max-age": "86400",
};

// Lê página e folha de estilo pelo fetch da plataforma, conferindo cada salto de redirecionamento.
// O nome não é resolvido aqui: na Cloudflare o fetch não alcança rede interna, e endereço IP
// privado ou nome local é recusado antes do pedido sair.
async function remoteGet(raw, accept) {
  let next = raw;
  for (let hop = 0; hop <= 5; hop++) {
    const url = checkUrl(next);
    const reply = await fetch(url.href, {
      headers: { accept, "user-agent": "refy-theme-extract (+https://refy.design)" },
      redirect: "manual",
      signal: AbortSignal.timeout(12_000),
    });
    const location = reply.headers.get("location");
    if (reply.status >= 300 && reply.status < 400 && location) { next = new URL(location, url).href; continue; }
    if (!reply.ok) throw Error(`${url.href} respondeu ${reply.status}.`);
    const text = await reply.text();
    return text.slice(0, PAGE_LIMIT);
  }
  throw Error(`${raw} redireciona demais.`);
}

// Versões publicadas no npm, guardadas por 10 minutos (1 minuto quando o npm não responde).
const REGISTRY = "https://registry.npmjs.org/@refy-design/web";
let registryCache;
async function published() {
  if (registryCache && Date.now() < registryCache.until) return registryCache.value;
  let value = null;
  try {
    const reply = await fetch(REGISTRY, { headers: { accept: "application/vnd.npm.install-v1+json" }, signal: AbortSignal.timeout(4_000) });
    if (reply.ok) {
      const data = await reply.json();
      if (typeof data["dist-tags"]?.latest === "string") value = { latest: data["dist-tags"].latest, versions: Object.keys(data.versions ?? {}) };
    }
  } catch {}
  registryCache = { value, until: Date.now() + (value ? 600_000 : 60_000) };
  return value;
}

export const REMOTE = { remote: true, fetchSite: (url) => fetchSite(url, remoteGet), published };

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", ...CORS, ...headers } });

const GET_TEXT =
  "Servidor MCP do refy. Adicione este endereço como conector personalizado no Claude, no ChatGPT ou no Gemini: https://refy.design/para-ias/mcp\n";

/** Atende um pedido HTTP no caminho do MCP. */
export async function handleMcpRequest(request, mode = REMOTE) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  // Sem fluxo SSE do servidor: GET responde 405, como pede o transporte, com uma linha para quem abre no navegador.
  if (request.method === "GET" || request.method === "HEAD")
    return new Response(request.method === "HEAD" ? null : GET_TEXT, { status: 405, headers: { allow: "POST, OPTIONS", "content-type": "text/plain; charset=utf-8", ...CORS } });
  if (request.method === "DELETE") return new Response(null, { status: 405, headers: { allow: "POST, OPTIONS", ...CORS } });
  if (request.method !== "POST") return new Response(null, { status: 405, headers: { allow: "POST, OPTIONS", ...CORS } });

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY) return json(rpcError(null, -32600, "Pedido grande demais (limite de 2 MB)."), 413);
  let text;
  try { text = await request.text(); } catch { return json(rpcError(null, -32700, "Corpo ilegível"), 400); }
  if (text.length > MAX_BODY) return json(rpcError(null, -32600, "Pedido grande demais (limite de 2 MB)."), 413);
  let message;
  try { message = JSON.parse(text); } catch { return json(rpcError(null, -32700, "JSON inválido"), 400); }

  if (Array.isArray(message)) {
    if (!message.length) return json(rpcError(null, -32600, "Lote vazio"), 400);
    const replies = (await Promise.all(message.map((m) => answer(m, mode)))).filter(Boolean);
    return replies.length ? json(replies) : new Response(null, { status: 202, headers: CORS });
  }
  const reply = await answer(message, mode);
  return reply ? json(reply) : new Response(null, { status: 202, headers: CORS });
}
