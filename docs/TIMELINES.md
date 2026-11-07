# Atividades e marcos

| Componente | Propósito | Composição |
| --- | --- | --- |
| ActivityItem (molécula) | Uma ocorrência: autoria, horário, conteúdo e ações | Avatar, Badge, Card na densidade padrão |
| ActivityTimeline (organismo) | Histórico recente, ordenado e agrupado por dia | ActivityItem, StatusDot, EmptyState, Callout e Button |
| Timeline (organismo) | Marcos importantes de uma jornada, na ordem fornecida | Card, Badge, StatusDot, EmptyState e ações/mídia do consumidor |

ActivityTimeline coloca o avatar junto da autoria e mantém o tipo do evento no eixo. `density="compact"` retira a caixa de cada ocorrência. `showHeader={false}` e `groupByDate={false}` permitem compor um widget com Card/CardHeader ou um painel ancorado com Popover. Esses exemplos reutilizam os componentes e não criam outra família de notificações.

Timeline tem `orientation="vertical"` (padrão), com lados alternados quando há espaço, e `orientation="horizontal"`, com faixa rolável por teclado. Em uma caixa estreita, a vertical usa um só lado. `completed`, `current` e `upcoming` têm rótulos visíveis; o marco atual também usa `aria-current="step"`. Datas seguem locale/timezone. Mídia e ações são slots, sem serviço ou regra de negócio embutidos.

As três referências fornecidas pelo mantenedor orientam estrutura e finalidade, não cores, fontes ou um tema de negócio. As superfícies e controles usam os tokens existentes. Conteúdo histórico fica estável; apenas ações e overlays têm os movimentos dos seus componentes compartilhados.

## Compatibilidade

`EventTimeline` continua sendo o mesmo componente que `ActivityTimeline`. `EventTimelineProps`, `TimelineEvent` e `TimelineActor` continuam exportados; `ActivityTimelineProps` e `ActivityEvent` oferecem nomes explícitos para novos usos. IDs antigos do Storybook continuam válidos. A aplicação demonstrativa já usa o novo nome; nenhum produto externo foi migrado.

A documentação do Playground contém instalação local, uso, composição, API e código derivado de cada story. O pacote permanece sem publicação.
