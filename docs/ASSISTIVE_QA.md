# Homologação manual assistiva — roteiro de aceite

Estado: **pendente de execução real**. Este arquivo é um roteiro, não um resultado.
Requisitos: CORE-03 e OVL-03. Executar com NVDA/Chrome no Windows e
VoiceOver/Safari no macOS. WebKit automatizado e axe não substituem essas sessões.

Abra o Storybook em `Verificacao/Contratos essenciais → Camadas`, tema claro,
modal, aviso antes e tooltip em portal. Repetir os passos relevantes no escuro,
Drawer e aviso depois. Editorial é somente compatibilidade legada: testar esse
valor adicional se um consumidor ainda o utiliza, sem tratá-lo como modo público. Use 375x812 e 1280x900 quando aplicável.
O laboratório posiciona superfícies para forçar colisão; não é uma página de produto.

| Passo | Resultado exigido |
|---|---|
| Percorrer Button normal, disabled e loading | Nome e estado entendidos; bloqueados não executam; ação normal executa uma vez |
| Abrir o fluxo por teclado | Nome/tipo do diálogo são anunciados; foco permanece no diálogo; fundo não entra na leitura/navegação |
| Ler os dois campos Nome repetido | Cada label nomeia seu próprio campo; primeiro anuncia erro e descrição externa; segundo anuncia hint; edição preserva o valor controlado |
| Abrir Ações do fluxo; usar setas, Home/End, letra e Enter | Foco virtual acompanha a ação habilitada; item bloqueado não executa; seleção executa uma vez e devolve foco ao gatilho |
| Abrir ajuda mantendo menu e aviso presentes | Descrição é anunciada sem perder o nome; texto não contém ações e continua legível |
| Pressionar Escape três vezes | Fecha ajuda, depois menu, depois diálogo; um nível por vez; aviso persiste e valor controlado permanece |
| Abrir aviso antes/depois do menu e percorrer suas ações | Novo aviso é anunciado no momento apropriado, sem duplicação indevida; Desfazer/Fechar alcançáveis por teclado e leitor no diálogo; fundo continua indisponível |
| Abrir Segundo diálogo e fechar | Só o interno fica ativo; retorno ao gatilho no pai; fechar o pai restaura foco e rolagem corretamente |
| Aviso temporizado: foco/hover | Prazo pausa durante interação; retoma tempo restante ao sair; aviso persistente não expira |
| Reflow, texto 200%, foco/alto contraste e fontes indisponíveis | Ações e mensagens legíveis/alcançáveis; foco visível; campos/labels não se sobrepõem nem escondem conteúdo |

No Safari/Mac a navegação por Tab depende das preferências de teclado; registre
se usou Tab, Option-Tab e a opção de destacar controles. Não altere as preferências
do usuário sem autorização. Referência: [atalhos oficiais do Safari](https://support.apple.com/guide/safari/cpsh003/mac).

## Registro a preencher por sessão

- Data, responsável/revisor e commit do Refy:
- Sistema/versão, navegador/versão, leitor/versão, preferências relevantes:
- Componente, tema, largura e variantes efetivamente exercitados:
- Ação realizada e fala/foco/resultado observados em cada passo:
- Resultado: aprovado / falhou / não executado, com evidência e defeito por requisito:
- Diferenças entre combinações e o que continua pendente:

Não marque homologado por ouvir uma palavra isolada ou pela presença de ARIA.
Uma falha/lacuna obrigatória mantém o gate aberto e a família experimental.
