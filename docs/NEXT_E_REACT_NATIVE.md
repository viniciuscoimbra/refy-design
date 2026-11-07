# Next.js App Router e React Native

O Refy roda em Server Components do Next e tem um pacote React Native com o mesmo contrato de props. Este guia diz como consumir cada um e o que foi medido.

## Next.js App Router

### O que o pacote faz

- Os 74 módulos que usam estado, efeito, ref ou contexto saem do build com `"use client"`. Os outros (Badge, Card, PageHeader, EmptyState e afins) renderizam no servidor sem JavaScript no cliente.
- A condição `react-server` do `package.json` aponta para o build com os imports de CSS. Sem ela, o Server Component resolvia a condição `node`, que não importa CSS, e o HTML chegava sem estilo.
- Cada componente tem subpath: `@refy-design/web/Button`, `@refy-design/web/Tabs`, `@refy-design/web/D3Chart`.

### Configuração

Use um dos dois caminhos. Sem nenhum deles, o barrel `@refy-design/web` leva 269 kB de JavaScript para a página.

```js
// next.config.mjs
export default {
  experimental: { optimizePackageImports: ["@refy-design/web"] },
};
```

```tsx
// ou importe pelo subpath
import { Badge } from "@refy-design/web/Badge";
import { D3Chart } from "@refy-design/web/D3Chart";
```

`ThemeProvider` é componente de cliente. Ele pode ficar no `layout.tsx`, que é Server Component, envolvendo `children`; os filhos continuam renderizando no servidor.

### Medido

Next 15.5.6 com React 19.2.4, build de produção, `dist` local do Refy:

| Página | JavaScript de primeira carga |
|---|---|
| Badge pelo barrel, sem `optimizePackageImports` | 269 kB |
| Badge com `optimizePackageImports` | 102 kB |
| D3Chart pelo subpath | 182 kB |

- Os 23 componentes testados renderizam num Server Component. Antes, 9 quebravam.
- Badge renderizado no servidor leva 939 B de CSS. Antes, 0 B.
- O JavaScript e o CSS emitidos para a web são os mesmos de antes, fora a diretiva. Sem minificação, 498 arquivos ficaram idênticos e 146 diferem só pela linha `"use client"`; a ordem dos imports de CSS não mudou.

Ainda não testado: OpenNext com wrangler na Cloudflare.

## React Native (em breve)

O pacote nativo ainda não está disponível para instalação. O que existe hoje é o código em desenvolvimento, descrito abaixo.

`packages/native` (`@refy-design/mobile`) tem os componentes nativos e `packages/tokens` (`@refy/tokens`) gera o tema resolvido para o RN a partir dos mesmos tokens da web. Uso, verificação e galeria Expo estão em [packages/native/README.md](../packages/native/README.md). O que muda em relação à web está em [packages/native/DIVERGENCIAS.md](../packages/native/DIVERGENCIAS.md).

Os dois lados implementam `@refy-design/web/contracts`. Uma prop nova num componente web que também exista no nativo entra primeiro no contrato; o `tsc` de cada lado reprova quem divergir.

Os dois pacotes são privados. Nenhum foi publicado.
