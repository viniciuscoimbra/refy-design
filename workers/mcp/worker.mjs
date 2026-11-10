// Worker do MCP remoto do refy na Cloudflare: https://refy.design/mcp.
import "./shims/globals.mjs";
import { handleMcpRequest } from "../../tools/refy-agent/remote.mjs";

const DOCS = "https://refy.design/para-ias/mcp";

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);
    if (pathname === "/mcp" || pathname === "/mcp/") return handleMcpRequest(request);
    if (pathname === "/" && request.method === "GET") return Response.redirect(DOCS, 302);
    return new Response("Não encontrado. O servidor MCP do refy fica em /mcp.\n", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  },
};
