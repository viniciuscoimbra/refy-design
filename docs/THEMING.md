# Instanciar o Refy em uma aplicação

Importe `@refy-design/web/tokens.css`; o CSS dos componentes é carregado automaticamente pelo bundler, depois use `ThemeProvider`. No Vite, no Rollup e no webpack só entra o CSS das famílias usadas; no esbuild, importe pelo caminho da família (`@refy-design/web/Button`) para ter o mesmo corte, como explica o [README](../README.md).
O provider aplica somente a base tipográfica, box sizing e foco dentro de seu
escopo. `global.css` continua disponível, mas é um reset **opt-in do documento**:
use somente quando a aplicação inteira adotar o Refy. Os tokens sem configuração
usam o modo claro. `fonts.css` é opcional e carrega arquivos locais licenciados, sem rede externa; sem ele, o app
pode hospedar as fontes ou usar os fallbacks locais.

```tsx
import '@refy-design/web/tokens.css';
import { ThemeProvider, Button, Input, Card } from '@refy-design/web';
import type { RefyTheme } from '@refy-design/web';

const identidade: RefyTheme = {
  name: 'minha-aplicacao',
  tokens: {
    '--font-body': 'system-ui, sans-serif',
    '--radius-default': '8px',
    '--button-height-md': '40px',
  },
  modes: {
    light: { '--primary': '#2163ad', '--on-primary': '#ffffff' },
    dark: { '--primary': '#a7cfff', '--on-primary': '#123050' },
  },
};

export function App() {
  return <ThemeProvider theme={identidade} mode="light">
    <Card><Input label="Nome" id="nome"/><Button>Salvar</Button></Card>
  </ThemeProvider>;
}
```

A API é aditiva. `theme` identifica o produto e define tokens comuns e por modo;
`mode` seleciona `light`, `dark` ou `system` (acompanha a preferência do dispositivo e suas mudanças). `editorial` é um valor legado da API, mantido por compatibilidade, sem seletor público. Valores não personalizados usam a fundação
completa daquele modo. A troca não remonta os filhos.
Uma cor primária nova exige conferir também texto sobre ela, hover, active e foco.
Um preset parcial não é prova de contraste em todos os estados.

O Playground permite selecionar presets e personalizar a identidade com os mesmos
componentes. A story de compatibilidade `fundacao-temas-por-aplicacao--instancias`
mostra identidades sintéticas com Button, Input, Card e superfícies sobrepostas;
não representa marcas homologadas nem é a entrada principal de criação.

## Precedência dentro do tema

O provider monta os valores de um tema nesta ordem: primeiro `tokens`, depois
`modes[modo]`. Para o mesmo nome, `modes[modo]` prevalece sobre `tokens`. Um token
que está em `tokens` e em `modes.light` só vale, no claro, pelo valor de
`modes.light`. `refy_theme_validate` avisa esse caso com `token-shadowed-by-mode`.

Ponha em `tokens` o que não muda com o modo (fonte, raio, medida) e em `modes` o
que muda (cor). Para derivar um tema de outro, sobreponha os papéis de cor nos
dois modos:

```ts
const base: RefyTheme = {
  name: 'loja',
  tokens: { '--radius-default': '8px' },
  modes: {
    light: { '--ink-1': '#14171a', '--primary': '#2163ad' },
    dark: { '--ink-1': '#f2f4f6', '--primary': '#a7cfff' },
  },
};
// Errado: '--ink-1' em tokens perde para modes.light e modes.dark de base.
// const destaque = { ...base, tokens: { ...base.tokens, '--ink-1': '#ffffff' } };
const destaque: RefyTheme = {
  ...base,
  name: 'loja-destaque',
  modes: {
    light: { ...base.modes?.light, '--ink-1': '#ffffff' },
    dark: { ...base.modes?.dark, '--ink-1': '#ffffff' },
  },
};
```

## Escopos aninhados

Um `ThemeProvider` dentro de outro herda tudo o que o escopo de fora calculou e
aplica por cima só o próprio tema. Ele não pinta fundo, não muda fonte, tamanho,
entrelinha nem quebra de palavra: fica igual a quem está em volta. Use um provider
por região quando ela precisa de hook diferente:

```tsx
<ThemeProvider theme={base} mode="light">
  <ThemeProvider theme={{ name: 'cards', tokens: { '--card-radius': '16px' } }}>
    <Card>…</Card>   {/* raio de 16px, resto do tema base */}
  </ThemeProvider>
</ThemeProvider>
```

Com `mode` diferente do pai, o aninhado aplica os papéis daquele modo e a cor do
texto do modo, e reaplica os temas dos providers de fora no modo novo. A
superfície continua vindo do componente (`Card`, `Surface`). Sobreposição feita
por CSS local entre dois providers (`.secao { --card-radius: … }`) não é
reaplicada na troca de modo; ponha esse valor no tema.

Token derivado segue o token de que deriva: `--field-radius` vale
`var(--control-radius)`, então um aninhado que troca `--control-radius` muda
também o campo. Se o tema de fora fixou `--field-radius` com um valor (tema
exportado pelo editor faz isso), o valor fixo continua valendo no aninhado até
ele trocar `--field-radius` também.

`isolate` faz o aninhado começar do zero, como a raiz: volta à fundação, pinta
`--bg` e aplica a base tipográfica. É o que uma vitrine ou prévia de outro tema
precisa, inclusive quem alterna identidades inteiras. Na raiz, a quebra de palavra é `normal`; defina
`--scope-overflow-wrap: anywhere` no tema para quebrar entre letras.

## Personalização de componentes existentes

Use primeiro tokens semânticos. Há hooks de componente quando a necessidade é
específica: `--button-height-md`, `--button-padding-md`, `--control-font-weight`,
`--field-height`, `--field-label-font`, `--field-label-transform`,
`--card-title-white-space`, `--dialog-radius` e os demais hooks inventariados.
Eles preservam seus fallbacks quando omitidos. Não use seletores gerados por CSS
Modules, não edite node_modules e não copie o componente para trocar a aparência.

Use props/composição quando a mudança é estrutural: `BrandLogo` aceita `children`
e `aria-label` para uma marca fornecida pela aplicação; Sidebar/Topbar aceitam
conteúdo de marca. Assets, fontes privadas, regras e páginas pertencem ao produto.
Mudança de comportamento exige contrato/teste, não um token para ocultar a diferença.

## Fonte e limites do formato

`src/tokens/foundations.tokens.json` é a fonte versionada. O subconjunto tipado
segue [DTCG 2025.10](https://www.designtokens.org/TR/2025.10/format/): color sRGB,
dimension px/rem, duration ms/s, number, fontFamily e cubicBezier. Expressões CSS
compostas e aliases existentes ficam em `$extensions.org.refy.css`; não são
apresentados como tokens DTCG tipados nem como exportação completa para Figma.
Cada entrada declara origem/finalidade CSS/estado. As variações são grupos de
modo do Refy, não uma extensão de modos padronizada pelo DTCG.

Execute `npm run tokens:build` após editar a fonte e `npm run tokens:check` para
validar aliases, valores tipados e equivalência da saída. `TOKEN_INVENTORY.md`
lista os consumidores e os valores/fallbacks por modo. O inventário é análise
estática: não substitui a medição dos valores computados no navegador.

## De–para da fundação

| Antes | Agora | Compatibilidade/validação |
|---|---|---|
| CSS editado manualmente | Fonte estruturada e CSS gerado | Nomes/export de tokens preservados |
| Claro/editorial sem papéis usados por Button | Todos os modos resolvem o mesmo conjunto de papéis | Hover/active precisam de testes e contraste por contexto |
| Sem tema explícito faltavam cores | Padrão claro completo | Mudança de default documentada; produto deve fixar seu modo |
| Tokens auxiliares consumidos ausentes | Aliases de espaço, tipografia, duração, sombra e foco | Sem remoção ou prazo de remoção de aliases nesta fase |
| CardHeader condicionado por seletor dark quebrado | Cabeçalho disponível nos três modos, quebra normal | Comportamento visual corrigido; nowrap ainda pode ser solicitado pelo hook |
| Seletor dark ancestral afetava escopos filhos | Estilos de componente usam valores do próprio escopo | Validar instâncias aninhadas e portais |
| Google Fonts carregadas sempre | fonts.css opcional | Pode mudar fallback visual até o consumidor carregar fontes |
| Produto precisa enum privado de BrandLogo | children + aria-label, assets do consumidor | Migração explícita do enum privado; não há assets privados no núcleo |
| Reset global obrigatório para tipografia/foco | Provider com base limitada ao escopo | global.css legado continua opt-in e afeta todo o documento |

Aparência anterior com tokens ausentes não é uma referência certificada. Ajustes
para leitura/foco devem apontar pares e evidência; não se declara WCAG global por
validar somente a paleta.

## Tema completo e modo

Abra **Playground → Componentes**. A barra do Storybook tem somente **Tema** e **Modo**. Tema reúne cores, famílias tipográficas, medidas, espaçamentos, alinhamentos, geometria, estados e demais tokens. Modo escolhe **Claro**, **Escuro** ou **Sistema**. Os presets completos combinam Refy com Manrope/Source Sans 3/Source Code Pro; Geométrico com IBM Plex Sans/Mono; Fluido com DM Sans/Geist Mono. As famílias e todos os papéis podem ser personalizados no mesmo objeto.

A navegação preserva as 117 famílias em **Átomos**, **Moléculas** e **Organismos**, com busca e um documento por componente. Cada documento tem instalação, uso, composição, exemplos com código real e API derivada dos tipos. Os snippets são verificados contra a distribuição pública. A matriz simultânea é somente uma fixture de regressão oculta, não a documentação de adoção.

**Personalizar tema** abre um drawer à direita. As abas **Cores**, **Forma**, **Tipografia**, **Espaçamento**, **Tokens** e **Exportar** concentram a edição. Na tipografia, escolha um dos seis conjuntos ou cada família por função. Espaçamento controla a escala e as medidas disponíveis; alinhamentos específicos de escolhas e modais usam seus próprios tokens. A aba Tokens oferece busca e controles por tipo. Fonte não tem mais variável independente na toolbar.

**Baixar tema JSON** e o bloco **Tema aplicado** fornecem o formato `RefyTheme`:
o mesmo JSON pode ser aplicado na aplicação ou reimportado pelo editor.
A estrutura interna `PlaygroundConfig` é diferente; não a passe diretamente ao
`ThemeProvider`. O fluxo atual de início pelo padrão e proteção de uma edição está
em [Criar com Refy](CREATION_PLAYGROUND.md).

A aba **Exportar** oferece JSON completo das sobreposições e o exemplo de `ThemeProvider`, com imports de estilos e fontes. A biblioteca fornece a fundação comum. Importar conteúdo inválido preserva a prévia anterior. O preset e a última personalização são guardados neste navegador; escolher **Personalizado** recupera essa edição após experimentar outro preset. Os dados antigos e links com modo/skin/fontes separados continuam sendo lidos por compatibilidade.

O claro Refy usa fundo branco. Os novos controles de tipografia, forma e medidas alteram o tema compartilhado; trocar o modo preserva esses ajustes. Cores podem ser editadas por modo. A API pública `RefyTheme` mantém suporte às sobreposições existentes por compatibilidade; temas antigos com atributos estruturais diferentes entre modos precisam de revisão ao adotar a nova convenção.

## Código com sintaxe

CodeBlock aceita `language="tsx"`, `ts`, `js`, `json`, `css`, `html` e `bash`. Palavras-chave, strings, números, propriedades, funções, tags e comentários usam os tokens `--code-syntax-*` de claro/escuro. `--code-font-size` permite ajustar o tamanho. A cópia preserva o texto original; `children` e `secret` continuam suportados. Nenhum HTML do snippet é executado.

A mesma configuração chega à documentação, exemplos, menus, modais e drawers. O editor tem uma superfície neutra para preservar sua própria leitura. Native selects também dependem do navegador/SO. Mapas, autenticação, áudio e integrações têm limites identificados nas páginas; os exemplos não executam serviços externos automaticamente.

## Refy Site

Use `refySiteTheme`, exportado de `@refy-design/web`, no `ThemeProvider`. A fonte é `src/themes/refy-site.json`, reconhecida pelo editor e pelos modos claro/escuro. [Exemplos e hooks opcionais](REFY_SITE.md). Não altera o preset Refy original.
