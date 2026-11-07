# Documentação avançada — criar capacidades no Refy

Para quem estende o Refy, transforma uma tela React existente ou orienta um agente de IA. O objetivo é tornar uma tarefa visual fácil de compor e personalizar, preservando comportamento e baixo custo. Comece pelo [playbook do Coverflow](ORGANISM_PLAYBOOK.md) para ver o processo aplicado ao código real.

## Primeiro: o que realmente precisa nascer?

| Necessidade | Solução inicial | Exemplo existente |
| --- | --- | --- |
| Mesma interação, outra identidade visual | Tema/configuração pública | Fonte, cor, raio e espaçamento pelo ThemeProvider |
| Juntar peças em uma tarefa/tela pronta | Composição/Block | ConversationBlock em página ou Drawer |
| Conectar serviço, SDK ou dados específicos | Adapter na aplicação | Mapa no slot de GeoAreaPicker |
| Responsabilidade interativa reutilizável que falta | Novo organismo, após verificar o catálogo | Coverflow finito |
| Regra/permissão/fluxo exclusivo do produto | Código da aplicação | Compra de um álbum, concessão de crédito ou despacho de atendimento |

Uma página inteira não vira organismo por renomeação. Uma cor diferente não justifica copiar um Button. Um serviço externo não entra no core porque um exemplo precisa dele.

## Os eixos da biblioteca

- **Atomicidade:** tamanho da responsabilidade e composição: átomos, moléculas e organismos. Não expressa maturidade.
- **Área:** intenção de interface, como ação, formulário ou conteúdo.
- **Coleção:** capacidade relacionada, como mídia, geolocalização ou conversação. Pode compartilhar famílias; não cria implementação duplicada ou pacote instalado separado.
- **Tema:** identidade completa — fontes, cores, forma, espaço e movimento.
- **Modo:** claro, escuro ou sistema. Não troca fonte, espaçamento ou geometria.
- **Distribuição/maturidade:** contratos próprios. Core significa propósito geral, não estabilidade certificada.

[Mapa atual de coleções](COLLECTIONS.md). Consulte o catálogo antes de propor nomes novos:

```bash
npm exec --offline -- refy-agent collections
npm exec --offline -- refy-agent catalog música
npm exec --offline -- refy-agent component Coverflow
```

Estes comandos são para um projeto com o pacote instalado; nesta etapa a instalação usa o tarball local. Não pressupõem publicação no registry.

## Da tela existente ao contrato reutilizável

Observe a tela funcionando e leia seus eventos, estados e validações. Registre o que foi observado e o que foi apenas inferido. Uma imagem não mostra permissões, cancelamento, foco ou comportamento móvel.

Antes de implementar, preencha um de-para por elemento:

| Atual / intenção | Peça Refy reutilizada | Mudança proposta | Comportamento preservado | Gap | Evidência necessária |
| --- | --- | --- | --- | --- | --- |
| Botões anterior/próximo | IconButton | Herdar tema e nome acessível | Avançar uma posição, respeitar limites | Nenhum novo átomo | Teclado, disabled e toque |
| Cartão de conteúdo selecionável | Button + conteúdo renderizado | Seleção e ativação distintas | Identidade permanece ao reordenar | Coordenação da sequência | Selecionar, ativar, remover item |
| Integração do produto | Callback/adapter | Consumidor conecta seu serviço | Cancelar não confirma operação | Não pertence ao core | Teste de integração no consumidor |

A análise de impacto acompanha: exports/props/aliases, defaults, tokens, composição, catálogo/stories, documentação, harness, CSS/SSR/bundle e consumidores. Registrar ausência de acesso; não chamar preservação de tipos de homologação de um produto.

## Contrato antes do desenho

Descreva em OpenSpec proposta, decisões, cenários e tarefas com aceites observáveis. Explicite:

1. **Uma responsabilidade:** o que faz e o que fica com a aplicação.
2. **Dados e identidade:** IDs estáveis, ordenação, item ausente, conteúdo longo e vazio.
3. **Estado:** quem controla seleção/rascunho/abertura; callbacks e respectivos momentos. Não duplique estado controlado como outra fonte de verdade.
4. **Ações distintas:** selecionar, ativar, confirmar, descartar e cancelar não são sinônimos.
5. **Assíncrono, quando existir:** tentativa, resposta tardia, erro/repetição, cancelamento e rascunho. Não adicionar loading ou transporte fictício a um organismo síncrono.
6. **Slots:** conteúdo extensível com limites semânticos; conteúdo dentro de Button não recebe outro botão/link/input.
7. **Proveniência:** autoria, licença e condições de código/dependências/assets. Inspirar-se numa interação não autoriza copiar dados, marca ou fonte privada.

## Composição, aparência e movimento

Reutilize controles da biblioteca. Estilos próprios do organismo organizam a composição; não implementam novamente foco, avatar, chip ou botão. Exponha uma configuração pública se a capacidade de customização faltar. Evite CSS de aplicação atingindo internals ou seletores de classes geradas.

Tokens de tema definem aparência. Hooks opcionais específicos têm fallback na fundação, sem paleta de cliente fixa. Estados intrínsecos calculados, como distância do item selecionado, não são escolhas de identidade para o editor. [Temas](THEMING.md) · [Inventário de tokens](TOKEN_INVENTORY.md).

Movimento responde ao propósito: feedback imediato no controle, revelação de contexto no menu e orientação no organismo. Não aplicar fade a tudo ou adicionar GSAP por obrigação de camada. Use os mecanismos e tokens existentes, teste entrada/saída/cancelamento e respeite movimento reduzido. [Política de movimento](FUNCTIONAL_MOTION.md).

## Matriz mínima de aceites

| Dimensão | O que verificar |
| --- | --- |
| Funcional | Cada ação produz o resultado esperado; estado vazio/disabled/erro/carregando quando aplicável; nenhuma navegação ou serviço oculto |
| Entrada/foco | Tab, setas quando pertinentes, Enter/Espaço, Escape, foco devolvido, ponteiro/toque e cancelamento |
| Composição | Menus em modal/Drawer, portais no tema correto, sem recorte indevido ou foco em conteúdo inativo |
| Visual | Claro/escuro, Refy/Geométrico/Fluido, fontes, texto longo, dimensões estreitas; modo preserva forma e tipografia |
| Motion | Continuidade da ação, interrupção/reversão, saídas reais e preferência reduzida |
| Distribuição | API pública, exemplos copiáveis, tipos, SSR e instalação limpa; custo de CSS/JS sem carregar capacidades não usadas |
| Qualidade | Separar teste do agente, aceite visual humano, assistivo e homologação do consumidor; justificar N/A sem esconder falha |

Um check estático não garante uma interface boa. Tipos não garantem clique/foco, e um screenshot não garante comportamento. [Contrato de qualidade](QUALITY.md).

## Onde integrar no repositório

| Parte | Fonte de verdade / integração |
| --- | --- |
| Implementação | src/components/<Família>/ e exports em src/index.ts |
| Exemplos | Stories reais junto ao componente; API/exemplos derivados por scripts/component-docs.mjs |
| Descoberta | src/pages/PlaygroundPage/catalog.ts; src/catalog/collections.json |
| Composição copiável | src/blocks/ e registro de variantes em src/pages/PlaygroundPage/blockRegistry.tsx, quando pertinente |
| Orientação de uso | docs/COMPONENT_USAGE.md e fonte curada das descrições em componentGuides.json |
| Movimento/hooks | scripts/check-motion.mjs, inventário de tokens e respectivos checks |
| Harness e cobertura | ai/ gerado; tests/refy-site/contract.json e state-policy.json com estados reais/N/A fundamentados |

Não editar manualmente centenas de fichas geradas. Depois das alterações relevantes, regenerar inventários necessários, documentação e kit de agentes na ordem do fluxo existente. A seguir executar checks, testes do comportamento alterado e consumidores limpos. Novas evidências pertencem à fonte que foi testada; não atribuir aprovação histórica ao novo digest.

## Contrato de execução para IA

Ao solicitar uma capacidade, peça ao agente estas entregas, nesta ordem:

1. Intenção, inventário e de-para; reutilização e fronteiras explícitas.
2. OpenSpec com aceites de sucesso, falha/limite e autorização registrada.
3. Implementação mínima na origem compartilhada; API e tema públicos.
4. Exemplos interativos reais, código copiável e descoberta no catálogo.
5. Provas executadas, custo medido, limitações e tarefas humanas separadas.

O agente lê apenas as fichas necessárias, confere a fonte e informa lacunas, em vez de inventar props. O checker refy-agent auxilia composições consumidoras; suas regras não devem proibir que átomos da biblioteca implementem controles nativos. Não há enforcement absoluto contra qualquer código ruim, nem modelo de IA embutido. [Harness e limites](AGENT_ADOPTION.md).
