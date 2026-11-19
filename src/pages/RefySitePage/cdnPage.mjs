// CDN-01 e CDN-02: a página HTML sem bundler que scripts/check-cdn.mjs abre no navegador é a
// mesma que a página "Sem bundler" do site mostra. Uma fonte só, sem import de Node, para o
// site e o teste lerem o mesmo texto (tests/cdn-check.test.mjs compara os dois).
export function cdnPage(version) {
  const npm = 'https://cdn.jsdelivr.net/npm';
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="${npm}/@refy-design/web@${version}/src/tokens/tokens.css">
<link rel="stylesheet" href="${npm}/@refy-design/web@${version}/src/styles/fonts.css">
<link rel="stylesheet" href="${npm}/@refy-design/web@${version}/src/styles/global.css">
<link rel="stylesheet" href="${npm}/@refy-design/web@${version}/dist/style.css">
</head>
<body>
<div id="root"></div>
<script type="module">
// O /+esm do jsDelivr reescreve "react" para uma URL com versão fechada. A página importa
// o React dessa mesma URL; com outra, o refy e a página teriam duas cópias do React.
const refy = "${npm}/@refy-design/web@${version}/+esm";
const source = await (await fetch(refy)).text();
const at = source.indexOf("/npm/react@");
if (at < 0) throw new Error("o /+esm do refy não importa o React do jsDelivr");
const react = source.slice(at + "/npm/react@".length, source.indexOf("/", at + "/npm/react@".length));
const [{ createElement: h }, { createRoot }, { Button, Card, Input }] = await Promise.all([
  import("${npm}/react@" + react + "/+esm"),
  import("${npm}/react-dom@" + react + "/client/+esm"),
  import(refy),
]);
createRoot(document.getElementById("root")).render(
  h(Card, { "data-cdn": "card" },
    h(Input, { label: "Nome" }),
    h(Button, { variant: "primary", "data-cdn": "button" }, "Enviar")));
</script>
</body>
</html>`;
}
