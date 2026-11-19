// CDN-01: a página testada importa o React da mesma URL que o /+esm do refy usa, e o
// workflow que a abre roda só no público, depois do release.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { cdnPage } from '../scripts/check-cdn.mjs';

test('página do CDN lê a versão do React dentro do /+esm do refy', () => {
  const html = cdnPage('1.6.2');
  assert.match(html, /@refy-design\/web@1\.6\.2\/\+esm/);
  assert.match(html, /@refy-design\/web@1\.6\.2\/dist\/style\.css/);
  assert.match(html, /source\.indexOf\("\/npm\/react@"\)/);
  assert.doesNotMatch(html, /react@\d+\.\d+\.\d+\/\+esm/, 'React com versão fixa na página duplicaria o React do refy');
});

test('workflow do CDN só no público, em ubuntu, depois do Release', () => {
  const yml = readFileSync('.github/workflows/cdn.yml', 'utf8');
  assert.match(yml, /github\.repository == 'viniciuscoimbra\/refy-design'/);
  assert.match(yml, /runs-on: ubuntu-latest/);
  assert.match(yml, /workflows: \["Release"\]/);
  assert.match(yml, /node scripts\/check-cdn\.mjs/);
});

// CDN-02: a página "Sem bundler" do site mostra, nas três línguas, o mesmo HTML que o teste
// do CDN abre, com a versão do pacote. Renderiza a página como o site-seo.mjs faz.
test('página Sem bundler mostra o HTML do teste do CDN, na versão do pacote, em pt, en e es', async () => {
  const { createServer } = await import('vite');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
  const vite = await createServer({
    configFile: false, root: process.cwd(), logLevel: 'error', appType: 'custom',
    server: { middlewareMode: true, hmr: false }, optimizeDeps: { noDiscovery: true, include: [] },
    esbuild: { jsx: 'automatic' },
  });
  try {
    const docs = await vite.ssrLoadModule('/src/pages/RefySitePage/SiteDocs.tsx');
    const { webVersionFor, docVersions, latestVersion } = await vite.ssrLoadModule('/src/pages/RefySitePage/docsVersion.tsx');
    const { createElement } = await import('react');
    const shownCode = (html) => {
      const pre = /<pre[^>]*>([\s\S]*?)<\/pre>/.exec(html);
      return pre && pre[1].replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').trim();
    };
    // Versão escolhida no seletor da doc (?v=): o trecho segue a versão web daquele release.
    assert.equal(webVersionFor(latestVersion), version, 'na doc atual, a versão do package.json');
    const older = docVersions.find((item) => item !== latestVersion);
    const olderWeb = webVersionFor(older);
    assert.notEqual(olderWeb, version);
    assert.equal(shownCode(renderToStaticMarkup(createElement(docs.CdnSnippet, { version: olderWeb }))), cdnPage(olderWeb).trim(), `trecho na doc ${older}`);
    // Versão com tag que nunca foi ao npm: aviso no lugar do trecho, que daria 404 no CDN.
    const { webOnNpm } = await vite.ssrLoadModule('/src/pages/RefySitePage/docsVersion.tsx');
    assert.equal(webOnNpm(version), true, 'versão do package.json mostra o trecho: a página sai junto com a publicação');
    const missing = renderToStaticMarkup(createElement(docs.CdnSnippet, { version: '1.9.0' }));
    assert.equal(webOnNpm('1.9.0'), false);
    assert.equal(shownCode(missing), null, '1.9.0 não foi ao npm: sem trecho');
    assert.match(missing, /não foi publicada no npm/);
    const expected = cdnPage(version);
    assert.match(expected, /@refy-design\/web@[^/]+\/src\/styles\/fonts\.css/, 'trecho carrega as fontes do tema');
    for (const locale of ['pt', 'en', 'es']) {
      const html = renderToStaticMarkup(docs.localizedDocPages[locale]['sem-bundler'].body);
      const pre = /<pre[^>]*>([\s\S]*?)<\/pre>/.exec(html);
      assert.ok(pre, `${locale}: página sem bloco de código`);
      const shown = pre[1].replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&');
      assert.equal(shown.trim(), expected.trim(), `${locale}: trecho difere do HTML que o teste do CDN abre`);
    }
  } finally {
    await vite.close();
  }
});

// A lista de versões fora do npm é dado do repositório, conferido com as notas do CHANGELOG (sem rede).
test('npm-unpublished.json bate com as versões que o CHANGELOG diz que não chegaram ao npm', () => {
  const { web } = JSON.parse(readFileSync('src/catalog/npm-unpublished.json', 'utf8'));
  const changelog = readFileSync('CHANGELOG.md', 'utf8');
  const noted = [...changelog.matchAll(/^- (\d+\.\d+\.\d+) (?:was not published to npm|never reached npm|stayed in the repository without a tag|stayed in the GitHub release only and did not reach npm)/gm)].map((m) => m[1]);
  assert.deepEqual([...web].sort(), [...new Set(noted)].sort());
  const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.ok(!web.includes(version), 'a versão do package.json não pode estar na lista');
  const releases = JSON.parse(readFileSync('src/catalog/versions.json', 'utf8')).releases.map((r) => r.packages.web);
  for (const item of web) assert.ok(releases.includes(item), `${item} não está no seletor de versões`);
});
