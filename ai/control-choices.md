# Escolher e compor controles

[Orientação das 117 famílias](https://github.com/viniciuscoimbra/refy-design/blob/main/docs/COMPONENT_USAGE.md): usos, alternativas e teclado por Atomic Design.

| Necessidade | Componente | Razão / limite |
|---|---|---|
| Executar ações como editar, duplicar ou arquivar | Menu | Itens disparam ações; não representa valor de um formulário |
| Escolher uma opção curta | Select | Expõe valor atual sem exigir pesquisa |
| Procurar numa lista de opções | Combobox | Campo e opções cumprem a mesma tarefa; digitação filtra a escolha |
| Selecionar várias opções com pesquisa | Multiselect | Chips e contador representam o valor; quantidade visível depende do espaço |
| Uma opção entre poucas alternativas sempre visíveis | RadioGroup ou Segmented | Seleção exclusiva; não usar ToggleGroup para simular essa garantia |
| Alternar opções independentes sempre visíveis | ToggleGroup | API de múltiplos valores (`string[]`); cada botão liga/desliga sua opção |
| Escolher cards com texto ou mídia | ChoiceCardGroup + ChoiceCard | ChoiceCard exige o contexto do grupo; `single` usa uma opção e `multiple` aceita várias |
| Escolher data sem digitação livre | DatePicker | Botão com calendário e limpeza; formato digitado, parsing e validação textual exigem outra composição |
| Captura ou transcrição de voz | VoiceRecorder + integração do produto | O componente controla apresentação/estados; MediaRecorder/Web Speech e permissões pertencem à aplicação |
| Confirmação que interrompe a tarefa | Modal | Foco fica na decisão até confirmar/cancelar |
| Editar detalhes preservando contexto da tela | Drawer | Painel lateral para uma tarefa contextual; continua sendo modal quando configurado assim |
| Erro de um campo | Input/Textarea com erro | Erro fica junto do dado que precisa ser corrigido |
| Informação persistente da tarefa | Callout | Conteúdo continua disponível, sem sumir antes de ser entendido |
| Confirmação breve de uma ação | ToastRegion | Feedback global temporário; não substitui campo de erro ou decisão obrigatória |

Uma página usa Button/Input em formulários e combina Modal/Drawer/Menu. Não refaça controles com divs apenas para mudar aparência: tente os tokens do tema e as variantes públicas. Campos integrados precisam de um contêiner que permita expansão/rolagem; nunca esconda opções atrás da prévia de código. O Multiselect do IntentComposer possui variante overlay conectada ao campo; consulte o contrato da molécula.

No Playground, abra o documento do componente para instalação, uso e código. API e snippets são derivados das fontes; limitações de serviço, foco e maturidade exigem a documentação específica. A responsabilidade de autorização/autenticação e validação de negócio continua na aplicação.

## Dados e efeitos pertencem à aplicação

`NotificationBell` emite pedidos de leitura; a aplicação atualiza `items`.
`FileUpload` seleciona arquivos e apresenta progresso; o app executa upload e
fornece esse progresso. `OAuthButton`/`GoogleButton` são botões com callbacks,
não SDKs de autenticação. `PostalCodeInput` recebe `lookup` e não escolhe um
serviço de CEP. `DangerZoneRow.onConfirm` é chamado no clique: abra um
Modal/AlertDialog e só execute a operação destrutiva depois de confirmá-la.

`Timeline` comunica marcos; `ActivityTimeline` comunica ocorrências e pode formar
um widget compacto. O alias `EventTimeline` permanece por compatibilidade.
`Range` seleciona dois limites; `Slider` seleciona um valor. Esses contratos
não mudam por uma troca de aparência.
