# Aparência por aplicação

O mesmo componente pode ter formatos muito diferentes. A aparência fica em uma
configuração do `ThemeProvider`; estado, eventos e semântica continuam na mesma
implementação. As páginas são composições de átomos, moléculas e organismos.

Importe tokens e estilos no projeto. Para reproduzir a tipografia original,
importe também `@refy-design/web/fonts.css`: os conjuntos de fontes são locais e opcionais.
Quem usa uma fonte própria não precisa carregar essas fontes.

```tsx
import { ThemeProvider, Button, Card, Input } from '@refy-design/web';
import type { RefyTheme } from '@refy-design/web';
import '@refy-design/web/tokens.css';

import '@refy-design/web/fonts.css';

const identidade: RefyTheme = {
  name: 'meu-produto',
  tokens: {
    '--font-body': '"Source Sans 3", sans-serif',
    '--radius-xs': '0px',
    '--radius-sm': '0px',
    '--radius-md': '0px',
    '--radius-lg': '0px',
    '--radius-xl': '0px',
    '--radius-pill': '0px',
    '--radius-default': '0px',
    '--control-radius': '0px',
    '--control-border-width': '3px',
    '--button-primary-border': 'var(--ink-1)',
    '--card-radius': '0px',
    '--card-border-width': '3px',
    '--field-border': 'var(--ink-1)',
  },
  modes: {
    light: { '--primary': '#f4cb4b', '--on-primary': '#27251c' },
    dark: { '--primary': '#f4cb4b', '--on-primary': '#27251c' },
  },
};

<ThemeProvider theme={identidade} mode="light">
  <Card>
    <Input label="Nome" />
    <Button variant="primary">Salvar</Button>
  </Card>
</ThemeProvider>;
```

Para um botão arredondado com degradê, troque os tokens na mesma configuração:

```tsx
{
  '--control-radius': '20px',
  '--control-border-width': '1px',
  '--button-primary-border': 'transparent',
  '--button-primary-background': 'linear-gradient(115deg, #5143a9, #b02e72)',
  '--button-primary-background-hover': 'linear-gradient(115deg, #40358b, #92245d)',
  '--button-primary-background-active': 'linear-gradient(115deg, #342970, #771b4b)',
  '--button-primary-foreground': '#ffffff',
  '--button-primary-foreground-hover': '#ffffff',
  '--button-primary-foreground-active': '#ffffff',
  '--card-radius': '24px',
  '--card-border-width': '1px',
  '--dialog-radius': '24px',
}
```

O exemplo completo, com as cores de claro e escuro e preferência Sistema, está em
`src/stories/skins.ts` e em **Playground → Personalizar tema**. Os presets
Geométrico e Fluido são demonstrações de capacidade, não marcas aprovadas de clientes.

## Qual token usar

| Intenção | Tokens |
|---|---|
| Cor semântica da marca | `--primary`, `--primary-hover`, `--primary-container`, `--on-primary`, `--primary-ink` |
| Formato de botões e campos | `--control-radius`, `--control-border-width`, `--control-border-style` |
| Botão especificamente | `--button-radius`, `--button-border-width`, `--button-height-md`, `--button-padding-md` |
| Superfície de Button | `--button-primary-background`, `-background-hover`, `-background-active`, `-foreground`, `-foreground-hover`, `-foreground-active`, `-border`, `-shadow` |
| Variantes de Button | Prefixos `--button-secondary-*`, `--button-ghost-*`, `--button-danger-*` no explorador |
| Campos | `--field-background`, `--field-border`, `--field-border-width`, `--field-radius`, `--field-height`, `--field-shadow`, `--field-padding-inline` |
| Rótulos | `--field-label-font`, `--field-label-size`, `--field-label-transform`, `--field-label-tracking` |
| Cards | `--card-background`, `--card-radius`, `--card-border-width`, `--card-padding` |
| Modal | `--dialog-surface`, `--dialog-radius`, `--dialog-border-width`, `--dialog-border-color`, `--dialog-shadow` |
| Drawer | `--drawer-width`, `--drawer-radius` (cantos expostos), `--drawer-surface`, `--drawer-body-padding` |
| Foco, carregamento e movimento | `--control-focus-outline`, `--control-focus-offset`, `--control-disabled-opacity`, `--duration-*`, `--ease-*` |

Superfícies de componentes como `--drawer-surface`, `--dialog-surface` e `--accordion-surface` aceitam cor ou gradiente CSS. O editor valida esses valores como `background`; cores tipadas da fundação, como `--primary` e `--surface`, continuam aceitando apenas cores. Confira o contraste do conteúdo ao personalizar uma superfície.

`--primary` continua sendo uma **cor**, usada também em checks e foco; não coloque
um degradê nela. Use o token de superfície do botão. Não é necessário duplicar
componentes ou criar classes globais para as três aparências demonstradas.

Os tokens comuns cobrem controles e superfícies compartilhados. Componentes
especializados possuem seus próprios hooks, listados no
[inventário de consumidores](TOKEN_INVENTORY.md). Um token de Button não promete
mudar automaticamente todas as bordas de calendário, gráfico ou tabela.
Valores opcionais com fallback continuam documentados no inventário e no CSS
consumidor; o editor avançado mostra os valores resolvidos na prévia e permite substituí-los.

O papel `--good` de sucesso permanece independente de `--primary-container` também no modo escuro; trocar a marca não recolore o feedback de conclusão.

O tema resolve a aparência; o projeto escolhe conteúdo, dados, rotas e regras.
Ao criar uma identidade, confira seus pares de contraste e todos os estados.
Trocar apenas a cor padrão não define automaticamente hover, foco ou erro.

## Nomes genéricos e compatibilidade

| Nome anterior, ainda disponível | Nome recomendado | Contrato |
|---|---|---|
| `PropertyCard` | `ContentCard` | Mesma implementação; `subtitle`, `value`, `valueSuffix` substituem os nomes de domínio `address`, `price`, `priceSuffix`, que continuam aceitos. |
| `PropertyMedia` | `MediaGallery` | Mesma implementação de mídia. |
| `PropertyActionGroup` | `DecisionActions` | Evento `select` na API genérica; o contrato anterior mantém `visit`. Os rótulos são configuráveis. |
| `SwipeDeck` | `DecisionDeck` | Fila genérica; a API nova converte `visit` em `select`. Gesto opcional, botões e teclado preservados. |
| `VisitSchedulePicker` | `SchedulePicker` | Mesma seleção de agenda; disponibilidade e efeito da seleção são do consumidor. |

Não há remoção de exports nesta revisão. As URLs de stories anteriores são
mantidas com IDs explícitos.

## Geometria compartilhada

`--control-border-width` e `--surface-border-width` controlam contornos de controles e superfícies. Os raios da escala e seus aliases atingem campos, busca, workspace, paginação, cards, timeline e camadas. `--avatar-radius`/`--avatar-square-radius` permitem alterar também avatares; Geométrico os deixa retos. O editor visual aplica o valor geral a toda a escala e aos papéis específicos, nos dois modos. Separadores continuam linhas discretas; spinner, símbolo de marca, pontos de estado e geometria de gráficos mantêm significado funcional.

O editor modifica a escala tipográfica proporcionalmente e oferece edição de cada papel. Elementos de dimensões intrínsecas, como gráficos SVG, assinatura e iniciais em avatares pequenos, mantêm escala própria para não perder encaixe; a família da fonte continua herdada. Valores arbitrários no editor avançado precisam ser conferidos na prévia.

## Tema é a configuração completa

A toolbar oferece apenas Tema e Modo. Forma, cores, fontes, escala e alinhamentos pertencem ao mesmo tema. Refy, Geométrico e Fluido incluem seus conjuntos tipográficos; todos os ajustes adicionais ficam em Personalizar tema e são exportados juntos. Modo escolhe Claro/Escuro/Sistema. `skins.ts` preserva o nome interno por compatibilidade de código; não representa um terceiro controle público.
