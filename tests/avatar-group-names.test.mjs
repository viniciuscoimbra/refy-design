// AvatarGroup diz o nome de cada pessoa ao leitor de tela, com foto ou com iniciais.
// Issue viniciuscoimbra/refy-design#10: as fotos da equipe na home tinham alt vazio.
// Lê o pacote construído (dist/), como scripts/check-refy-site.mjs: rode npm run build antes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Sem dist/ o teste falha, nunca pula: pular deixaria o gate verde sem ter medido nada.
const render = async (props) => {
  assert(existsSync("dist/index.js"), "sem dist/: rode npm run build antes deste teste");
  const { AvatarGroup } = await import("@refy-design/web");
  return renderToStaticMarkup(React.createElement(AvatarGroup, props));
};
const ana = { name: "Ana Lima", src: "/ana.jpg" };
const bia = { name: "Bia Rocha" };

test("item com foto vira imagem com o nome, e a foto fica alt vazio", async () => {
  const html = await render({ items: [ana, bia] });
  assert.match(html, /role="img"[^>]*aria-label="Ana Lima"/);
  assert.match(html, /<img[^>]*alt=""/);
  assert.doesNotMatch(html, /alt="Ana Lima"/);
});

test("item sem foto, só com iniciais, também diz o nome", async () => {
  const html = await render({ items: [ana, bia] });
  assert.match(html, /role="img"[^>]*aria-label="Bia Rocha"/);
});

test("item clicável é botão com o nome, sem imagem nomeada dentro", async () => {
  const html = await render({ items: [ana, bia], onItemClick: () => {} });
  assert.match(html, /<button[^>]*aria-label="Ana Lima"/);
  assert.match(html, /<button[^>]*aria-label="Bia Rocha"/);
  assert.doesNotMatch(html, /role="img"/);
});

test("com uma pessoa só, o grupo não repete o nome", async () => {
  const html = await render({ items: [ana] });
  assert.doesNotMatch(html, /role="group"[^>]*aria-label="Ana Lima"/);
  // A dica abre em portal, fora deste HTML: aqui o nome só pode estar no item.
  assert.equal(html.match(/Ana Lima/g)?.length, 1, "o nome aparece uma vez, no item");
});
