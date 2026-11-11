# refy

<!-- badges:start -->
<p align="center">
  <a href="LICENSE"><img alt="Licença" src="https://img.shields.io/github/license/viniciuscoimbra/refy-design"></a>
  <a href="https://github.com/viniciuscoimbra/refy-design/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/viniciuscoimbra/refy-design/ci.yml?branch=main"></a>
  <a href="https://github.com/viniciuscoimbra/refy-design/releases/latest"><img alt="Versão" src="https://img.shields.io/github/v/release/viniciuscoimbra/refy-design"></a>
  <img alt="Node" src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fviniciuscoimbra%2Frefy-design%2Fmain%2Fpackage.json&query=%24.engines.node&label=node">
  <a href="https://github.com/viniciuscoimbra/refy-design/commits/main"><img alt="Último commit" src="https://img.shields.io/github/last-commit/viniciuscoimbra/refy-design"></a>
  <a href="https://github.com/viniciuscoimbra/refy-design/stargazers"><img alt="Estrelas" src="https://img.shields.io/github/stars/viniciuscoimbra/refy-design"></a>
</p>
<!-- badges:end -->

[Criar com componentes, templates e Playground](docs/CREATION_PLAYGROUND.md): escolha uma composição, personalize o tema e exporte para seu projeto. O site [refy.design](https://refy.design) mostra os mesmos componentes rodando.

[Guia das 122 famílias](docs/COMPONENT_USAGE.md): quando usar, alternativas e teclado implementado, com API e exemplos do pacote.

**A mesma interface, com a identidade do seu produto.** Refy é uma biblioteca React/TypeScript criada por Vinícius Coimbra, sob licença [MIT](LICENSE).

O Refy nasceu da dificuldade de personalizar outros design systems: muito código, instalações complexas e tempo demais para chegar ao visual desejado. As duas premissas são **personalização simples desde o início** e **baixo custo de código e compilação**. São critérios de produto, não uma promessa de que qualquer tela ou alteração visual dispensa desenvolvimento.

O Playground permite escolher um tema, mudar cores, fontes, formas, espaçamentos e movimento, e exportar essa configuração. A aplicação usa os mesmos componentes, sem copiar sua implementação. Páginas continuam sendo composições de átomos, moléculas e organismos.

## Estender o Refy

[Documentação avançada](docs/ADVANCED_ORGANISMS.md): como decidir entre tema, Block, adapter e novo organismo, com de-para e critérios para humanos e agentes. [Playbook do Coverflow](docs/ORGANISM_PLAYBOOK.md): composição, estado, gesto, tokens e testes ligados à implementação real.

## Experimentar e criar seu tema

Requisitos locais: Node **22.12+** e npm. Consumo verificado com React/React DOM **18.3.1 e 19.2.4**; isso não garante toda versão futura aceita pelo manifesto.

```bash
git clone https://github.com/viniciuscoimbra/refy-design.git
cd refy-design
npm ci
npm run storybook
```

Abra http://localhost:6006 e vá a **Playground → Componentes**.

1. Escolha **Tema** e **Modo** na barra do Storybook. Tema reúne toda a identidade; modo é Claro, Escuro ou Sistema.
2. Em **Personalizar tema**, ajuste cores, tipografia, forma, espaçamento, tokens e movimento. Confira o resultado nos exemplos e nas páginas, incluindo menus, modais e drawers.
3. Em **Exportar**, baixe o JSON de **Tema aplicado**. Importe esse objeto no `ThemeProvider` do seu projeto.

Refy, Fluido, Terracota e Cobalto são pontos de partida. A configuração personalizada fica neste navegador; exporte o JSON para compartilhá-la ou versioná-la. Uma fonte própria precisa ser carregada pela aplicação, além de indicada no tema. [Guia completo de temas](docs/THEMING.md).

[Roteiro completo de adoção e testes end-to-end](docs/ADOPTION_END_TO_END.md).

## Core e coleções

Além de átomos, moléculas e organismos, o catálogo oferece coleções por capacidade: mídia, geolocalização, conversação, dados, colaboração, comércio, financeiro e conteúdo. Os imports continuam os mesmos; nenhuma dependência de serviço é adicionada pela classificação. [Organização, busca e incorporação de organismos](docs/COLLECTIONS.md). [Pilotos: Coverflow, conversação e mapa local](docs/CAPABILITY_PILOTS.md).

## Usar com agentes

O pacote inclui um catálogo versionado de componentes, APIs, exemplos e instruções para transformar telas React preservando seus fluxos. Depois de instalar o pacote, consulte só o que precisa. `catalog` aceita o nome exato ou a necessidade em português, inglês ou espanhol, com a mesma busca do `refy_search`:

```bash
npm exec --offline -- refy-agent catalog tabela de dados
npm exec --offline -- refy-agent component Input
npm exec --offline -- refy-agent inspect src/Tela.tsx
npm exec --offline -- refy-agent check src/Tela.tsx src/tela.css
```

O mesmo kit roda como servidor MCP, para o agente consultar sem sair da conversa. No Claude Code:

```bash
claude mcp add refy -- npx --no-install refy-mcp
```

São oito ferramentas: `refy_search` acha a família pela necessidade escrita em português, inglês ou espanhol; `refy_component` lê a API; `refy_collections` lista as coleções; `refy_validate` confere o código contra a API e as regras do `check`; `refy_theme_generate` e `refy_theme_validate` geram e conferem tema com contraste AA; `refy_theme_extract` tira o tema de um site; `refy_compare` compara a captura do original com a tela do refy. O servidor remoto (refy.design/mcp) tem as sete primeiras: ele não lê arquivos da sua máquina. [Configuração em outros clientes e limites](docs/MCP.md).

Consulta exige Node; análise de código usa o TypeScript de desenvolvimento do projeto. O kit é local, somente leitura e não carrega parser ou IA no navegador. As verificações detectam regras conhecidas e informam exceções/limites; testes de fluxo e revisão visual continuam necessários. [Contrato, piloto antes/depois e uso completo](docs/AGENT_ADOPTION.md).

## Usar em um projeto novo

O pacote se chama `@refy-design/web` e está no npm:

```bash
npm install @refy-design/web
```

Cada versão também traz o `.tgz` em [Releases](https://github.com/viniciuscoimbra/refy-design/releases).

Para começar de um projeto pronto, copie `examples/react-starter/` para uma pasta fora do repositório e rode:

```bash
npm install @refy-design/web
npm run build
npm run dev
```

Quem quiser gerar o pacote a partir do código: `npm ci`, `npm run check` e `npm pack` na raiz do repositório.

O starter já contém um tema exportado; substitua `theme.json` pelo seu. A instalação não exige Storybook, OpenSpec ou o código-fonte do repositório na aplicação consumidora.

Para integrar em um projeto React existente, carregue os estilos uma vez e use os exports públicos:

```tsx
import '@refy-design/web/tokens.css';
import '@refy-design/web/fonts.css'; // opcional: fontes locais fornecidas pelo Refy
import { Button, Input, ThemeProvider } from '@refy-design/web';
import type { RefyTheme } from '@refy-design/web';
import themeData from './theme.json';

const theme: RefyTheme = themeData;

export function Cadastro() {
  return (
    <ThemeProvider theme={theme} mode="system">
      <Input label="Nome completo" placeholder="Digite seu nome" />
      <Button variant="primary" onClick={() => console.log('Salvar')}>
        Salvar
      </Button>
    </ThemeProvider>
  );
}
```

`global.css` é um reset **opcional** para projetos novos; afeta a aplicação inteira. Sistemas existentes podem manter seu próprio reset. `fonts.css` também é opcional se o produto já fornece suas fontes. [Temas e exportação](docs/THEMING.md).

Next.js App Router (Server Components): [docs/NEXT_E_REACT_NATIVE.md](docs/NEXT_E_REACT_NATIVE.md). React Native: `npx expo install @refy-design/mobile react-native-svg`, com o mesmo contrato de props e o mesmo JSON de tema da web ([guia](packages/native/README.md)).

## O que há no catálogo

- **Componentes:** 122 famílias (33 átomos, 63 moléculas e 26 organismos), com uso, composição, API, exemplos interativos e código copiável. Os 523 trechos derivados das fontes são compilados contra a API pública; isso não certifica todas as famílias.
- **Demonstração:** jornada de aplicação. Acesso e Setup ficam nos templates e nos fluxos internos. [Roteiro e limites](docs/PLAYGROUND_JOURNEYS.md).
- **Templates** (`Block` no código, /templates no site): telas inteiras por finalidade com prévia responsiva e arquivos reais. [Guia](docs/BLOCKS.md).
- **Charts:** catálogo D3 com 24 tipos, eixos, legendas, tooltip, zoom/brush e streaming conforme cada família. [Contratos](docs/CHARTS.md).
- **Tipografia:** texto Lorem ipsum para experimentar a tipografia do tema.

Login, OTP, recuperação, arquivos e preferências dos exemplos são locais. Sua aplicação conecta autenticação, persistência, permissões e regras de negócio. Mapas e gravação dependem de serviços/permissões do navegador; não vêm configurados automaticamente.

## Custo e customização

A distribuição ESM permite ao bundler remover JavaScript e CSS de componentes não usados. Importar Button/Input não deve levar o runtime nem os estilos de charts/CodeBlock para a tela. No Vite, no Rollup e no webpack, os imports de CSS acompanham os módulos usados, também pela raiz do pacote; não é necessário importar styles.css no projeto novo.

O esbuild (e ferramenta montada sobre ele) junta o CSS de todo arquivo que o import alcança antes de descartar o JavaScript: `import { Button } from '@refy-design/web'` leva o CSS de todas as famílias (cerca de 260 KB, medido em 09/11/2026 com esbuild 0.24 e 0.28), contra 7,5 KB do Button sozinho. No esbuild, importe cada família pelo caminho dela:

```tsx
import { Button } from '@refy-design/web/Button';
import { Chip, ChipGroup } from '@refy-design/web/Chip';
```
 O import legado `@refy-design/web/styles.css` continua disponível para optar pela folha completa. Instalar o pacote ainda instala as dependências avançadas, mesmo quando o bundle final as elimina. Fontes só são solicitadas pelo navegador quando usadas e carregadas por CSS; os arquivos fazem parte do pacote instalado.

[Medidas reais e como reproduzir](docs/PACKAGE_COST.md) distinguem download do pacote, JS/CSS da tela, fontes e tempo de build. Não confunda tamanho instalado com custo transferido a cada usuário.

Tokens controlam a identidade que os componentes expõem. Alterar fluxo, anatomia ou disposição específica de uma página ainda envolve composição React. [Contrato de aparência](docs/SKINS.md) · [Movimento](docs/FUNCTIONAL_MOTION.md) · [Escolher controles](docs/CONTROL_CHOICES.md).

## Licença e projeto

Marcas e regras de cada produto ficam no próprio produto, nunca no refy. Uma derivação pode manter tokens e versões próprios, preservando a licença MIT e os avisos aplicáveis.

[Licença](LICENSE) · [Terceiros e fontes](THIRD_PARTY_NOTICES.md) · [Como contribuir](CONTRIBUTING.md) · [Código de conduta](CODE_OF_CONDUCT.md) · [Governança](GOVERNANCE.md) · [Mantenedores](MAINTAINERS.md) · [Segurança](SECURITY.md)

## Desenvolver e verificar

```bash
npm run docs:build        # regenerar exemplos após mudar fontes/API
npm run check            # tokens, contraste, motion, tipos, build e exemplos
npm run check:specs       # contratos OpenSpec e controles negativos
npm run build-storybook  # catálogo estático em storybook-static/
npm run test:browser     # testes de interação
npm pack --dry-run       # inspecionar distribuição
```

O CI está em `.github/workflows/ci.yml` e roda em todo push. Para hospedar o catálogo, publique **a saída estática**, nunca o servidor de desenvolvimento.

Mudanças seguem [OpenSpec](openspec/specs). Famílias mantêm maturidade e limites; build/testes automáticos não equivalem a certificação ou aprovação visual humana. Consulte [qualidade](docs/QUALITY.md) e [segurança](SECURITY.md). Contribuições preservam contratos, atualizam exemplos e não trazem dado privado. O caminho está em [CONTRIBUTING.md](CONTRIBUTING.md).

## Tema Refy Site

O preset opt-in `refySiteTheme` e as composições do Storybook estão descritos em [Refy Site](docs/REFY_SITE.md). É o tema do site refy.design.
