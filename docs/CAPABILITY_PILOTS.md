# Pilotos de capacidades

Os pilotos ampliam as capacidades do Refy sem mudar sua organização atômica nem criar dependências de serviço. Os componentes originais, temas e imports permanecem; a nova família é Coverflow. Conversação é um Block composto dos organismos atuais, e geolocalização reaproveita GeoAreaPicker.

## Coverflow

```tsx
import { Coverflow, AspectRatio, Modal } from '@refy-design/web';
import { useState } from 'react';

const items = [
  { id: 'one', label: 'Primeira referência' },
  { id: 'two', label: 'Segunda referência' },
];

export function MediaBrowser() {
  const [selected, setSelected] = useState('one');
  const [active, setActive] = useState<string | null>(null);
  return (
    <>
    <Coverflow
      items={items}
      selectedId={selected}
      onSelectionChange={setSelected}
      onActivate={(item) => setActive(item.label)}
      renderItem={(item) => <AspectRatio ratio={1}><span>{item.label}</span></AspectRatio>}
    />
    <Modal open={active !== null} onClose={() => setActive(null)} title={active ?? 'Detalhes'}>
      <p>Conteúdo demonstrativo fornecido pela aplicação.</p>
    </Modal>
    </>
  );
}
```

Este exemplo mostra a API, sem serviço externo. A documentação do componente oferece as fontes completas dos exemplos. Selecionar um vizinho centraliza; ativar o selecionado chama `onActivate`, quando fornecido. IDs únicos/estáveis preservam a identidade na reordenação. Sem seleção válida, o primeiro item é apresentado, sem callback implícito de normalização.

Setas/Home/End navegam com foco; Enter/Espaço seguem a ativação do Button. Arraste horizontal, cancelamento e rolagem vertical móvel têm papéis distintos. `renderItem` recebe conteúdo não interativo: evite campos, links ou botões dentro do botão do item.

O piloto é finito. Não há autoplay, repetição circular, compra/propriedade de mídia, busca ou imagens embutidas. A história Capas usa SVGs demonstrativos próprios, sem álbuns ou artistas reais. [API e exemplos no pacote](../ai/components/Coverflow.json).

A aparência herda o tema. Hooks opcionais incluem `--coverflow-item-width`, `--coverflow-item-padding`, `--coverflow-gap`, `--coverflow-angle` e `--coverflow-perspective`; fallbacks usam a fundação. O editor preserva unidades de ângulo/comprimento e rejeita valores incompatíveis. Movimento reduzido do sistema/tema é respeitado. Modo claro/escuro não altera a geometria.

## Conversação

`ConversationBlock` compõe `Message`, `MessageScroller`, `IntentComposer`, `Callout` e `Button`. Drawer é uma apresentação externa opcional. Nenhuma bolha, avatar ou rolagem foi reimplementada.

```tsx
import { ConversationBlock } from '@refy-design/web';
import type { ConversationBlockProps, ConversationMessage } from '@refy-design/web';
```

O contrato é controlado: `messages`, `draft`, `onDraftChange`, `status` (`idle`, `sending`, `error`), `errorMessage`, `onSend`, `onRetry` e `onCancel`. A aplicação controla transporte, autenticação, persistência e mensagens. Callbacks não iniciam um serviço embutido.

No catálogo Templates, **Conversa em página** e **Conversa em painel lateral** contêm quatro arquivos reais copiáveis: página, exemplo de coordenação, Block e CSS de layout. O exemplo é local e simula sucesso, falha e resposta tardia. Para integrar seu transporte, preserve os seguintes contratos:

- Uma tentativa identifica o texto enviado e possui ID/AbortController próprios.
- Envio pendente bloqueia duplicação. Repetir a tentativa usa o texto correspondente ao erro.
- Cancelar preserva o rascunho; respostas antigas não publicam mensagem depois do cancelamento/nova tentativa.
- Sucesso só limpa o rascunho se ele ainda corresponde ao texto enviado; uma edição posterior não é apagada.
- Fechar Drawer cancela a tentativa pendente, preserva conteúdo e devolve foco ao gatilho.

Voz, ferramentas de IA, decisões de negócio e armazenamento não são integrações desta composição. A CLI de famílias descreve os organismos reutilizados; o contrato do Block está neste guia e nas fontes copiáveis, sem criar outra família de mensagem.

## Geolocalização

`GeoAreaPicker` preserva sua API, incluindo `radius`, `includedIds`, callbacks e slot `map`. O exemplo **MapaLocal** usa D3 já disponível, regiões sintéticas e dados/nomes/distâncias ilustrativos. Não usa SDK, chave, rede externa, geolocalização do navegador ou GeoJSON real.

Estar no raio habilita a escolha; não inclui automaticamente na busca. A base permanece obrigatória. Mapa, Multiselect, listas e resumo recebem a mesma seleção controlada. Diminuir o raio retira regiões do resultado efetivo sem apagar IDs controlados; ampliar recupera a seleção.

O mapa reutiliza a navegação do gráfico SVG: foco, setas/Home/End e Enter/Espaço. Os controles textuais continuam disponíveis. Isso não é certificação de acessibilidade de um mapa real. Provedores reais pertencem a adapters explícitos na aplicação.

## Validação e limites

Os exemplos são avaliados por tipos, testes de interação e consumidores limpos. Revisão visual humana e leitor de tela continuam estados separados. Veja [coleções e incorporação](COLLECTIONS.md).
