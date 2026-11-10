#!/usr/bin/env node
// Servidor MCP do Refy, por stdio. O protocolo e as ferramentas ficam em mcp-server.mjs, o mesmo
// núcleo do servidor remoto (remote.mjs).
import { createInterface } from "node:readline";
import { answer, rpcError } from "./mcp-server.mjs";

const send = (payload) => process.stdout.write(JSON.stringify(payload) + "\n");
const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });
let pending = Promise.resolve();
lines.on("line", (line) => {
  if (!line.trim()) return;
  pending = pending
    .then(async () => {
      let message;
      try { message = JSON.parse(line); }
      catch { return send(rpcError(null, -32700, "JSON inválido")); }
      if (Array.isArray(message)) {
        if (!message.length) return send(rpcError(null, -32600, "Lote vazio"));
        const replies = (await Promise.all(message.map((m) => answer(m)))).filter(Boolean);
        if (replies.length) send(replies);
        return;
      }
      const reply = await answer(message);
      if (reply) send(reply);
    })
    .catch((error) => send(rpcError(null, -32603, error.message)));
});
