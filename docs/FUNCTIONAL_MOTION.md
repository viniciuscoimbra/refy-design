# Movimento funcional no Refy

O movimento comunica confirmação, contexto ou mudança de foco. Não é obrigatório animar componentes estáticos nem adicionar entradas a todo o catálogo. A composição reutiliza a reação dos seus filhos, sem empilhar animações equivalentes.

## Política padrão

| Papel | Uso | Entrada / reação | Saída |
| --- | --- | --- | --- |
| Feedback | Botões, seleção, foco | 120 ms | Reversão da transição |
| Contexto | Menus, dicas e conteúdo contextual | 180 ms | 140 ms |
| Orientação | Modais, drawers e conteúdo de organismos | 260 ms | 200 ms |
| Página | Conteúdo coordenado, quando necessário | Até 300 ms | Conforme a transição |

Esses valores são uma política do Refy baseada na direção proposta pelo mantenedor, não uma reprodução literal dos números do Material atual. A [documentação atual do Material](https://m3.material.io/styles/motion/overview/how-it-works) descreve também um sistema físico com molas. O princípio adotado do [Google Design](https://design.google/library/making-motion-meaningful) é usar movimento para explicar continuidade e foco.

Entradas começam rápidas e desaceleram; saídas aceleram e duram menos. Pressionar Button/IconButton usa escala de 97%, sem alterar a área clicável. Não há overshoot no easing padrão. Elementos estáticos e ciclos de atividade não recebem artificialmente uma animação de entrada.

## Personalizar sem matemática

No Playground, abra **Personalizar tema → Movimento**:

- **Firme:** reação 120 ms, contexto 180 ms, orientação 260 ms.
- **Suave:** reação 150 ms, contexto 200 ms, orientação 300 ms.
- **Instantâneo:** durações finitas zeradas.
- **Direção de menus e dicas:** origem no acionamento, deslocamento lateral ou aparecimento sem deslocamento. A ancoragem real do menu continua vinculada ao seu controle.
- **Reduzir movimento:** seguir o sistema ou reduzir sempre. A preferência do sistema prevalece sobre os estilos; o tema não pode exigir animação de quem pediu redução.

A exportação inclui esses tokens. Eles são compartilhados pelos modos claro e escuro. Não foi criada outra variável na toolbar: movimento faz parte do tema completo.

## Implementação e composição

Os tokens `--motion-feedback-duration`, `--motion-context-duration`, `--motion-context-exit-duration`, `--motion-orientation-duration`, `--motion-orientation-exit-duration` e `--motion-page-duration` definem os tempos. Direção, easing e pressão também são tokens. Os aliases antigos permanecem para compatibilidade.

CSS resolve transições simples. A infraestrutura de presença aguarda as animações finitas reais do elemento antes de desmontá-lo, cancela a remoção quando ele reabre e mantém o foco/modalidade durante a saída. Não usa um temporizador duplicando a duração do CSS. GSAP não foi adicionado: a camada atômica sozinha não justifica uma dependência. Uma futura coreografia que precise dela deve demonstrar essa necessidade.

Menus, Popover, NotificationBell, WorkspaceSwitcher e Tooltip compartilham as entradas e saídas contextuais. Modal e Drawer preservam a saída e o retorno de foco. O IntentComposer reúne contexto, texto, sugestões, voz, feedback e envio dentro do mesmo contorno, reutilizando seus átomos e moléculas.

Barras determinadas usam escala em vez de animar largura; seleção não anima margens/larguras. A variante inline dos campos integrados expande o fluxo naturalmente, sem animar a altura da página. Os filtros do IntentComposer usam a variante sobreposta, por orientação posterior do mantenedor. O indicador absoluto do Segmented anima deslocamento e largura para acompanhar rótulos distintos; essa largura não redimensiona botões ou conteúdo vizinho. Os ciclos `infinite` de carregamento e `duration-progress` indicam atividade, não são a latência máxima de uma interação. Os nomes antigos de giro/encolhimento de Button são aliases de uma linha de processamento: alvo, posição e rótulo permanecem estáveis. Spinner e preenchimentos continuam disponíveis; o padrão é spinner. A duração de uma tarefa é separada da velocidade de feedback.

## Evidência e limites

`npm run motion:check` verifica os tempos padrão, aliases e regras finitas do catálogo. [Inventário por família](MOTION_INVENTORY.json) distingue movimento próprio de composição/estado estático. Testes no navegador verificam saída real, interrupção, foco, movimento reduzido e exportação/importação.

Essas verificações não comprovam 60 fps, composição na GPU, desempenho em aparelhos reais nem certificação assistiva. A revisão visual do agente também não substitui a aprovação do mantenedor.

## Seleção compartilhada — revisão de 23/10/2026
O Multiselect compõe o átomo `Chip` com `variant="selection"` para cada valor e para o contador +N. Altura, fonte, cor e geometria são da mesma receita; apenas os valores removíveis têm o ícone de fechar. O contador é um botão que abre as opções. Remover uma seleção retorna o foco à busca. A medição continua usando os chips reais, incluindo o contador invisível, e observa mudanças de tamanho/fonte.

A variante overlay usa a receita compartilhada Field para conectar o campo à lista, sem gap nem segunda moldura de foco. A junção acompanha abertura para cima/baixo e o estado de erro. Combobox e os consumidores inline preservam sua expansão em fluxo; IntentComposer, GeoAreaPicker e os exemplos de diálogo recebem o comportamento do Multiselect, sem remendos específicos de página.

## Revisão de interação e composição
Accordion e Collapsible compartilham expansão/retração da altura com easing, sem fade, escala ou translação do texto. O conteúdo abaixo acompanha a abertura. Inverter retoma da altura atual; ao terminar, a altura volta a ser natural para fonte, resize e conteúdo. Fechar torna o painel inerte e devolve foco interno ao gatilho antes de ocultar. Montagem inicial e movimento reduzido/Instantâneo não animam. Esta é uma exceção localizada à preferência por transform/opacity: ocupar espaço no fluxo exige layout, sem garantia de GPU ou 60fps. ChoiceCard tem confirmação de seleção e pressão com tokens, sem mudar o significado do controle.

KanbanBoard permite arrastar pela alça, reordenar e mover pelo menu (também no teclado/toque). Clicar no corpo/título abre o detalhe; interações com menus e ações internas não disparam essa abertura. `onColumnsChange` oferece controle externo; sem callback, o estado é local até substituir `columns`. `onCardClick` permite usar o detalhe da aplicação. A prévia de aplicação mantém ordem/etapa nos projetos e usa seu Drawer existente. O consumidor continua responsável por persistência. As animações de reposição respeitam tokens e redução do sistema/tema.

SchedulePicker se adapta ao host, não só à janela. Message agrupa Avatar, autoria, horário e Bubble reais. MessageScroller não força o fim durante leitura do histórico e retorna o foco ao histórico quando o usuário escolhe as recentes. A referência de Message mencionada pelo mantenedor ainda não foi recebida; estes ajustes não representam sua reprodução nem adoção de tokens de outro produto.

## Revisão por finalidade das 113 famílias

Cada família tem `purpose`, `behavior` e infraestrutura no [inventário](MOTION_INVENTORY.json). O verificador exige cobertura exata, sem família esquecida ou duplicada. A decisão de manter uma família estável também é intencional; nível atômico não obriga um efeito de entrada.

| Interação | Comportamento |
| --- | --- |
| Seleção e campos | Cor/borda, check e thumb confirmam estado. O painel inteiro não entra novamente a cada clique. Tabs conservam conteúdo estável e animam seu indicador; Segmented usa seu indicador compartilhado. |
| Expansão | Accordion/Collapsible abrem espaço sem fade. Sidebar muda sua largura sem apagar os filhos. São exceções localizadas de layout; fontes e conteúdo mantêm altura natural. |
| Navegação de mídia | Carousel desloca o trilho com slides inativos inertes. Galeria revela a imagem na direção escolhida quando ela termina de carregar; a montagem inicial não recebe efeito. |
| Decisão e arraste | Deck descarta à esquerda, seleciona à direita e salva recolhendo ao botão Salvar; retorna do gesto incompleto. Cliques e gestos usam as mesmas indicações e trajetórias. A decisão acompanha o fim real da animação, sem timer de 280ms. Kanban usa reposição a partir da posição anterior. Resizable acompanha o ponteiro diretamente, sem easing que deixe a divisão atrasada. |
| Contexto ancorado | Menus, dicas, HoverCard e popovers entram da origem e voltam para ela, mantendo foco e prioridade. A tolerância de hover é tempo de intenção, separado da duração de motion. |
| Transferência de foco | Modal e Drawer preservam suas geometrias; Command reutiliza Modal e sua presença/foco, sem uma segunda implementação de diálogo. |
| Avisos | Callout/Toast dispensam após a saída real. Toast superior entra/sai por cima e os inferiores por baixo. Remover externamente o nó/lista controlada pelo consumidor continua sendo remoção imediata; os fechamentos oferecidos pelo componente esperam a saída. Snackbar é apresentação, sem inventar API de fechamento. |
| Conversa | Message é estável. MessageScroller anima somente novas inserções, sem apagar/revelar o histórico ou forçar leitura ao fim. |
| Gráficos | Linhas e barras revelam os dados a partir de sua geometria; valores e rótulos já ficam legíveis. Sem cascata de delays por série/linha; troca de cor não significa mudança dos dados. |
| Atividade | Spinner, Skeleton, progresso e gravação indicam trabalho em curso. Logo fica estável por padrão; animação de marca explícita continua disponível. Spotlight do tour é estático; a orientação pertence ao Popover, sem animar uma sombra gigante. |
| Composer | Voz revela seu estado local, processamento usa seu indicador de atividade e feedback confirma com opacidade curta. Não há uma receita de deslocamento aplicada às três superfícies. |

`motionTiming` compartilha preferência do sistema, redução explícita do escopo e duração zero entre DisclosureRegion, mídia, novas mensagens, Kanban e sumário. Rolagem suave do sumário é nativa, sem garantia de duração exata do navegador; com redução/Instantâneo é imediata. `usePresence` compartilha conclusão real de saídas de superfícies, avisos e diálogos.

A revisão automatizada cobre renderização das 113 famílias nos dois modos e redução, com trajetórias e ações específicas nas famílias com comportamento alterado. Isso não equivale a homologação estética humana de todas as variantes ou medição em hardware físico.
