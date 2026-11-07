# Kanban: apresentação e regras de movimentação

`KanbanBoard` compõe `KanbanCard` (molécula), `Menu`, `IconButton`, `Badge`, `StatusDot` e `Modal`. A coluna e a prévia flutuante usam o mesmo card e os mesmos slots. A barra de busca/filtros/ordenação e o formulário de criação são composições da demonstração, não uma página transformada em organismo.

```tsx
import { KanbanBoard } from '@refy-design/web';
import type { KanbanColumnItem } from '@refy-design/web';

const columns: KanbanColumnItem[] = [
  { id: 'todo', title: 'A fazer', color: 'var(--info)', items: [{ id: 'a', title: 'Revisar proposta' }] },
  { id: 'doing', title: 'Em andamento', color: 'var(--weak)', wipLimit: 2, items: [] },
  { id: 'review', title: 'Em revisão', color: 'var(--good)', items: [] },
];

<KanbanBoard
  columns={columns}
  wipLimit={4}
  allowedTransitions={{ todo: ['doing'], doing: ['todo', 'review'], review: [] }}
/>;
```

- `wipLimit` define o limite padrão por coluna, e `column.wipLimit` prevalece. Ausente significa ilimitado; zero impede entrada. Limites precisam ser inteiros não negativos. O quadro mostra quantidade/limite e indica quando está cheio.
- `allowedTransitions` mapeia origem para destinos permitidos. Origem sem chave permite todos; lista vazia impede saída. Reordenar na mesma etapa é permitido mesmo no limite. Menu, ponteiro/toque, teclado e drop nativo usam a mesma validação. Motivos aparecem nos destinos indisponíveis e no estado do quadro.
- IDs de etapas e IDs de cards precisam ser únicos e não vazios no quadro. Dados controlados (`onColumnsChange`) são atualizados pelo consumidor; filtros não descartam cards e o WIP considera todos os itens, inclusive os ocultos.
- `column.color` aceita uma cor CSS, preferencialmente um token do tema. Texto, foco, card, tipografia e raios continuam usando as receitas compartilhadas.
- A alça arrasta; três pontos abrem ações. No desktop, o corpo também pode ser arrastado sem capturar botões, links, campos ou menus internos. No toque, use a alça para preservar a rolagem no restante do card. Enter/espaço pega o card pela alça, setas escolhem etapa, Enter/espaço solta e Escape cancela. O menu oferece movimentação e reordenação como alternativa. Arraste próximo à borda rola o quadro; cursor, foco e captura são restaurados no fim/cancelamento.
- `toolbar`, `onAddCard` e `columnActions` permitem compor ações reais do produto. `filter` controla a apresentação sem mudar a fonte de dados. O exemplo de criação verifica WIP antes de acrescentar o card.

Essas regras são de interface. Um produto com persistência deve validar WIP e transições também no servidor, lidar com concorrência e atualizar `columns` após a confirmação. Nenhuma demonstração persiste em serviço externo.
