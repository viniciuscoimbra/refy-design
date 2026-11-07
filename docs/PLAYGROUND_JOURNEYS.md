# Jornadas do Playground

Aplicação, Acesso e Setup são páginas compostas com os componentes públicos do Refy. Não são novas famílias de organismos e não substituem os componentes do catálogo.

## Roteiro de revisão

Comece na **Demonstração**, pelo fluxo de acesso, ou em **Templates → Acesso** para inspecionar uma tela isolada. Acesso e Setup já não são destinos públicos da navegação superior. Para testar continuidade de dados, permaneça na mesma instância da Demonstração; trocar de template/story pode desmontar a prévia.

| Jornada | Como testar | Resultado |
| --- | --- | --- |
| Cadastro | Criar conta, preencher dados fictícios, informar `123456` | Abre Setup e mantém nome/e-mail para o menu da aplicação |
| Erro de código | Informar `000000` e depois `123456` | Erro fica no formulário; só o código válido avança |
| Recuperação | Esqueci minha senha, e-mail fictício, código, nova senha e confirmação | Confirmação divergente impede avanço; sucesso retorna à entrada |
| Setup | Nome, descrição, quem pode acessar e notificações; voltar e revisar | Valores permanecem no wizard; concluir cria um espaço novo sem projetos |
| Projeto | Criar primeiro projeto, escolher visibilidade e abrir detalhes | Lista e detalhes refletem nome, responsável, visibilidade, prazo e arquivos locais |
| Revisão | Aprovar Conteúdo e Entrega | Projeto fica Concluído na lista/quadro e com 100% de progresso |
| Ajuste | Solicitar ajuste em uma etapa | Remove a aprovação da etapa e retorna o projeto para Em andamento |
| Preferências | Editar nome/descrição/acesso/avisos e salvar ou cancelar | Só Salvar altera os dados do espaço; visibilidade de um projeto não altera o padrão do espaço |
| Continuidade | Alternar Acesso/Aplicação pela barra do Playground, ou Sair e Entrar no formulário | Projetos, preferências, revisões, prazos e anexos da aplicação continuam em memória |
| Métricas | Criar ou concluir projetos e abrir os dados do gráfico | BarChart compara quantidades reais por etapa; espaço vazio não mostra histórico inventado |
| Isolamento | Trocar de espaço no seletor da sidebar | Projetos e preferências são próprios de cada espaço |
| Celular | Reduzir a largura e abrir a navegação | Menu vira drawer; lista e quadro mantêm rolagem interna |

A página Acesso também oferece atalhos para revisar telas isoladas de OTP e nova senha. Esses atalhos reiniciam o formulário para o cenário escolhido; não são rotas de autenticação de um produto real.

## Composição

- Acesso: AccessPage compõe AccessBlock, BrandLogo, Input, Checkbox, Otp, GoogleButton, Button e Callout.
- Setup: SetupBlock compõe WizardStepper, Card/CardHeader, Input, Textarea, ChoiceCard/ChoiceCardGroup, Checkbox, Badge, Callout e Button.
- Aplicação: AppShell, Sidebar, WorkspaceSwitcher, Topbar, NotificationBell e UserMenu compõem a navegação. Table/PersonCell/ProgressBar, KanbanBoard, ApprovalWorkbench/DecisionActions, Drawer/Modal, Combobox/DatePicker/FileUpload e ActivityTimeline atendem o trabalho. LibraryBlock e formulários de preferências compõem as outras áreas.

Os mesmos AccessBlock e SetupBlock continuam disponíveis em Blocks. A prévia responsiva de Blocks usa suas fontes reais; não há uma segunda implementação dos formulários.

## Contratos adicionais

`AccessBlock.onEnter(identity)` e `onSetup(identity)` recebem `{ name, email }`. Callbacks antigos sem parâmetros continuam compatíveis. Nenhuma senha faz parte desse objeto. A opção `initialScreen` permanece como estado inicial e `screen/onScreenChange` como controle externo.

`SetupBlock.onComplete(name)` permanece. A nova opção `onConfigured(configuration)` recebe `{ name, description, access, notifications }`, sendo `access` igual a `team` ou `invite`. A composição do Playground usa essa configuração para criar o novo espaço. Ambos os callbacks são disparados na conclusão, quando fornecidos.

Aplicação inativa preserva seu estado no componente de página, mas desmonta a interface e desativa seu atalho de busca. Menus e overlays não continuam ativos sobre outra visão.

## Limites da demonstração

Login valida campos fictícios; não autentica uma conta real. OTP usa o código fixo `123456`. Recuperação não envia e-mail nem modifica senha real. Google informa a necessidade de integração com um provedor, sem abrir sessão externa.

Os dados ficam na memória da instância do Playground. Recarregar a página ou trocar de story pela navegação lateral do Storybook pode reiniciar a demonstração. A biblioteca de materiais conserva estado ao alternar áreas da aplicação, mas reinicia ao trocar de espaço ou desmontar a aplicação. Senhas e arquivos não são gravados em localStorage nem enviados a um serviço.

Revisão visual do mantenedor e leitor de tela manual permanecem etapas separadas da automação. Não há publicação nem integração com aplicações consumidoras nesta frente.

## Entrada atual — 24/10/2026
Aplicação passa a se chamar Demonstração. Acesso e Setup saem da navegação superior e da lista pública de stories; continuam disponíveis nos Blocks, nos fluxos da demonstração e por URLs antigas ocultas de compatibilidade. Não são componentes novos.
