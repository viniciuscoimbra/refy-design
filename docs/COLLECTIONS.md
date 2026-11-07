# Core e coleções de capacidades

O Refy organiza componentes por **Atomic Design**, **área** e **coleção**. Esses eixos se complementam: um organismo pode pertencer a uma capacidade especializada sem mudar sua composição ou identidade visual.

**Core** reúne componentes de propósito geral. Core não significa certificação de estabilidade. Uma **coleção** agrupa capacidades relacionadas; não é um tema nem um pacote separado.

| Coleção | Famílias existentes nesta etapa — exemplos |
| --- | --- |
| Mídia e entretenimento | Coverflow, MediaGallery, DecisionDeck, VoiceRecorder |
| Geolocalização | GeoAreaPicker |
| Conversação e IA | Message, MessageScroller, IntentComposer, VoiceRecorder |
| Dados e análise | Charts, Stat, ScoreGauge, Matrix2x2 |
| Trabalho e colaboração | KanbanBoard, KanbanCard, ApprovalWorkbench, SchedulePicker |
| Comércio e assinaturas | PlanCard, BillingCard |
| Financeiro | BillingCard; não representa um toolkit financeiro completo |
| Conteúdo e aprendizagem | Prose, TableOfContents |

Uma família pode aparecer em duas coleções e continua tendo uma implementação. Átomos e moléculas de apoio também podem participar de uma coleção sem mudar de camada. Átomos/moléculas/organismos e IDs legados permanecem; Button, Input, Modal, Drawer, Sidebar e Table continuam disponíveis como componentes gerais.

## Encontrar e experimentar

Em Componentes no Site ou no Playground, use **Coleção** e a busca. A navegação mantém as camadas atômicas. Filtrar não descarta o tema nem troca silenciosamente o documento atual; no celular, um componente aberto fora do filtro aparece em “Seleção atual”. Escolha outro para navegar.

A coleção de uma ficha aparece logo após sua descrição. A personalização continua no mesmo editor: fontes, cores, forma, espaçamento e movimento fazem parte do tema; modo escolhe Claro/Escuro/Sistema.

Depois de instalar o tarball local, o harness consulta os mesmos metadados:

```bash
npm exec --offline -- refy-agent collections
npm exec --offline -- refy-agent collections geolocation
npm exec --offline -- refy-agent catalog música
npm exec --offline -- refy-agent component GeoAreaPicker
```

Coleções retornam famílias existentes, contagens e documentos reais. Consulta sem resultados é explícita. Tipos/API continuam nas fichas; classificação não prova maturidade ou integração com um serviço.

## Instalar e compor

Nesta etapa, os imports continuam os mesmos:

```tsx
import { GeoAreaPicker, IntentComposer } from '@refy-design/web';
import '@refy-design/web/tokens.css';
```

Isso é um exemplo de imports existentes, não uma tela completa. Não há pacotes `@refy/media` ou `@refy/geolocation` publicados por esta mudança. A divisão futura de instalação será avaliada separadamente; a biblioteca atual já permite remover código/CSS de componentes não usados do bundle. D3 e Prism ainda são dependências de instalação do pacote inteiro.

Mapas, serviços de IA, envio de mensagens, gravação e pagamentos pertencem à aplicação ou a adapters explícitos. GeoAreaPicker aceita mapa por slot e preserva a seleção textual; VoiceRecorder é uma interface controlada, não captura/transcreve áudio sozinho. A coleção Conversação e IA não instala modelo ou backend.

## Incorporar outro organismo

Antes de promover algo de um produto:

1. Descreva a tarefa, API genérica e fronteiras; verifique componentes existentes.
2. Registre origem, condições de redistribuição, dependências e assets autorizados.
3. Faça o de-para e reaproveite átomos/moléculas; não transforme a página inteira em organismo.
4. Separe dados/regras/serviços do produto por props, slots, callbacks ou adapters.
5. Cubra vazio, erro, carregamento, foco/teclado/toque, motion reduzido, responsividade e temas.
6. Entregue documentação, exemplos e testes reais; meça tipos/SSR/bundle e registre limites de maturidade.

O primeiro piloto Coverflow já possui implementação finita, sem autoplay ou variante circular. Conversação possui uma composição ConversationBlock com exemplos inline/Drawer, reaproveitando os organismos atuais; não é outra família de mensagens. O GeoAreaPicker possui um exemplo local de mapa simulado. [Contratos, uso e limites dos pilotos](CAPABILITY_PILOTS.md). Evoluções futuras terão validação própria; esta organização não migra produtos automaticamente.

A fonte curada das definições e associações é `src/catalog/collections.json`. Ao acrescentar uma família, revise sua classificação; as não especializadas derivam Core do catálogo existente. Documentação e assets para agentes são gerados dessa fonte, não mantidos em listas paralelas.

## Aprofundar a autoria

O [guia avançado de organismos](ADVANCED_ORGANISMS.md) transforma essa análise em um roteiro de classificação, de-para, contrato, implementação e evidência. O [playbook do Coverflow](ORGANISM_PLAYBOOK.md) mostra o processo no código real.
