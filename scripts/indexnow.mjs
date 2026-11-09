// Avisa Bing, Yandex e os outros buscadores do IndexNow que as páginas do sitemap mudaram.
// Roda depois do deploy do site, da máquina de quem publicou: o protocolo confere a chave em
// https://refy.design/<chave>.txt, que o build:site grava.
// Uso: npm run seo:indexnow            (todas as páginas do sitemap no ar)
//      npm run seo:indexnow -- /para-ias/mcp /en/for-ai/mcp   (só essas)
import { INDEXNOW_KEY, SITE } from "./seo-config.mjs";

const paths = process.argv.slice(2);
let urls = paths.map((path) => SITE + path);
if (!urls.length) {
  const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
  urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
const key = await fetch(`${SITE}/${INDEXNOW_KEY}.txt`);
if (!key.ok || (await key.text()).trim() !== INDEXNOW_KEY) throw Error(`${SITE}/${INDEXNOW_KEY}.txt não está no ar; publique o build antes.`);
// 403 do IndexNow quer dizer que o buscador não conseguiu conferir a chave. Mostra o corpo da
// resposta e tenta o Bing direto: se ele aceitar, o problema era só no agregador.
const body = JSON.stringify({ host: new URL(SITE).host, key: INDEXNOW_KEY, keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`, urlList: urls.slice(0, 10000) });
let ok = false;
for (const endpoint of ["https://api.indexnow.org/indexnow", "https://www.bing.com/indexnow"]) {
  const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json; charset=utf-8" }, body });
  const detail = (await response.text()).trim().slice(0, 300);
  console.log(`indexnow: ${endpoint} · ${urls.length} endereço(s) · ${response.status} ${response.statusText}${detail ? ` · ${detail}` : ""}`);
  if (response.status < 400) { ok = true; break; }
}
if (!ok) {
  console.error("indexnow: recusado. 403 = chave não conferida (arquivo bloqueado para robô ou chave nova ainda não lida); 422 = endereço fora do domínio; 429 = muitos avisos.");
  process.exit(1);
}
