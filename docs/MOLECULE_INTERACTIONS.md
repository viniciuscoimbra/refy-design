# Moléculas no Playground

59 famílias: 52 demonstrações com interação e 7 informativas, sem botões artificiais. Os cenários representativos de interação ficam em `tests/molecules.spec.ts` e `tests/adoption.spec.ts`, parametrizados nas três fontes e nos dois modos. Hover/listas/camadas também são exercitados em `tests/typography.spec.ts`; contraste, geometria e inventário em `tests/catalog.spec.ts`. Este registro descreve os contratos; resultados executados ficam na evidência do OpenSpec.

| Molécula | Comportamento demonstrado |
|---|---|
| ButtonGroup | Alternar Lista/Mapa/Galeria com seleção observável. |
| SplitButton | Escolher formato e baixar arquivo CSV/JSON local. |
| FabMenu | Criar, buscar e importar materiais em drawers locais. |
| DecisionActions | Registrar decisão, mostrar conclusão e revisar. |
| Combobox | Buscar e selecionar projeto por teclado. |
| Multiselect | Selecionar e remover áreas com chips. |
| PhoneInput | Editar e formatar telefone; selecionar código do país. |
| PostalCodeInput | Buscar endereço em resposta simulada local, sem consulta externa. |
| Calendar | Selecionar dia; navegar meses. |
| ChoiceCard | Alterar a opção selecionada. |
| FileUpload | Selecionar arquivos e mostrar/remover sua lista local. |
| Breadcrumb | Voltar e abrir níveis de conteúdo dentro do exemplo. |
| Tabs | Alternar o conteúdo do painel. |
| NavCard | Selecionar item e mostrar estado atual. |
| SettingsSubnav | Mudar seção selecionada sem navegação externa. |
| TableOfContents | Rolar o contêiner de seções e acompanhar a seção ativa. |
| WorkspaceSwitcher | Pesquisar e trocar ambiente. |
| UserMenu | Editar perfil/preferências e sair/entrar na sessão fictícia. |
| HelpMenu | Abrir documentação, atalhos e formulário de mensagem local. |
| WizardStepper | Voltar e selecionar etapas concluídas. |
| Menu | Renomear, arquivar e restaurar material. |
| Callout | Informativa: apresenta conteúdo/estado sem sugerir uma ação inexistente. |
| EmptyState | Alterar busca e limpar filtros para mostrar materiais. |
| UsageMeter | Informativa: apresenta conteúdo/estado sem sugerir uma ação inexistente. |
| Toast | Mostrar aviso, mover material e desfazer de verdade. |
| Snackbar | Desfazer e repetir movimentação local. |
| NotificationBell | Abrir notificações; marcar item ou todas como lidas. |
| Tooltip | Ajuda em hover/foco com Escape. |
| Popover | Aplicar filtro e refletir na lista. |
| HoverCard | Prévia em hover/foco; abrir perfil em modal. |
| HelpField | Ajuda curta e Saber mais abrindo drawer. |
| Stat | Informativa: apresenta conteúdo/estado sem sugerir uma ação inexistente. |
| ScoreGauge | Alterar valor do medidor. |
| AvatarGroup | Abrir participante ou lista completa em drawer. |
| PersonCell | Informativa: apresenta conteúdo/estado sem sugerir uma ação inexistente. |
| Card | Informativa: apresenta conteúdo/estado sem sugerir uma ação inexistente. |
| Accordion | Expandir/recolher conteúdo. |
| CodeBlock | Copiar o código com confirmação. |
| MediaGallery | Navegar fotos e seleção de imagem. |
| VoiceRecorder | Simular gravação/pausa/finalização e editar texto de exemplo; sem áudio real. |
| PageHeader | Criar projeto em modal e exportar lista local. |
| SectionHeader | Informativa: apresenta conteúdo/estado sem sugerir uma ação inexistente. |
| StickyBar | Aprovar e reabrir revisão. |
| StickyFooter | Editar, salvar e cancelar valor. |
| SettingRow | Ativar/desativar preferência. |
| PlanCard | Escolher plano fictício, sem cobrança. |
| BillingCard | Consultar faturas e trocar identificador fictício de quatro dígitos. |
| ConnectorCard | Salvar configuração, desconectar e reconectar simulação. |
| DangerZone | Confirmar exclusão de dados fictícios e restaurar exemplo. |
| Carousel | Navegar slides com setas/botões. |
| Collapsible | Mostrar/recolher arquivos. |
| ContextMenu | Menu pelo botão direito ou Shift+F10 com resultado local. |
| DatePicker | Selecionar/limpar data em calendário. |
| Item | Selecionar item e atualizar descrição. |
| Menubar | Abrir grupos e executar comandos locais. |
| Message | Informativa: apresenta conteúdo/estado sem sugerir uma ação inexistente. |
| MessageScroller | Adicionar mensagens e acompanhar/retomar a rolagem. |
| NavigationMenu | Navegar entre conteúdos locais e submenu. |
| Resizable | Redimensionar dois painéis por ponteiro ou teclado. |

AlertDialog permanece no nível de organismo, pois compõe Modal. Páginas e blocks continuam como composições de adoção.
