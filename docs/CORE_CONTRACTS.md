# Contratos dos componentes essenciais

Escopo: Button, Input, Menu, Modal, Drawer, Tooltip e ToastRegion. Responsável
inicial: Vinícius Coimbra. Estado de maturidade: experimental; a promoção depende
das evidências automáticas, revisão visual e homologação assistiva necessárias.
Os testes não certificam as outras famílias nem qualquer aplicação consumidora.

## Button — átomo

Controle nativo para executar uma ação. Não use como link sem navegação semântica.
`variant=secondary`, `size=md`, `status=idle`, `loading=false`, `block=false`.
O `type` nativo é preservado: em formulário, declare `type="button"` para ações
locais ou `type="submit"` para envio. Enter e Espaço ativam uma vez. Disabled e
loading bloqueiam ação; loading anuncia busy e prevalece sobre aria-busy fornecido.
Success/error são feedback visual; não desabilitam automaticamente a ação.
Controlado por props; não existe modo interno de loading nem de seleção.
A aparência primária usa on-primary, que não precisa ser branco. Ícones sem texto
exigem aria-label. Não há valor/validação de campo: não aplicável.

## Input — átomo, conforme o catálogo atual

Campo nativo; `value/onChange` controla o valor, `defaultValue` inicializa o modo
não controlado. Não alterne entre esses modos durante a vida do campo. `block=true`.
`label` associa o nome ao campo; `error` substitui hint e ativa aria-invalid.
Descrições externas são combinadas com a mensagem local. IDs gerados com useId
são únicos mesmo quando rótulos se repetem; forneça id explícito se uma integração
precisa referenciar o campo. Disabled, required, tipo, leitura e eventos seguem
props nativas. Não é Select nem busca de opções. Foco/valor pertencem ao próprio
input; a aplicação conserva dados quando desmonta uma página/diálogo.

## Menu — molécula

Lista de ações, não seleção de valor de formulário. `open/onOpenChange` são
controlados; `entries` descreve ações/separadores/rótulos. `align=start`,
`side=bottom`, `ariaLabel=Ações`, `matchWidth=false`. id explícito é opcional. Não há defaultOpen nem valor interno.
Use um único botão como trigger, com onClick alternando open. O botão precisa
aceitar atributos ARIA; a biblioteca fornece haspopup/expanded/controls.
Em composições com um contêiner e vários botões (SplitButton), use id explícito
no Menu e associe haspopup/expanded/controls ao botão correto, não ao contêiner.
UserMenu usa side e matchWidth para preservar direção e largura no top layer.
Ao abrir, foco fica no menu e aria-activedescendant aponta um ID exclusivo.
Setas circulam entre ações habilitadas; Home/End vão aos extremos; letras buscam
pela inicial de rótulos textuais; Enter/Espaço selecionam uma vez; Tab sai;
Escape fecha e retorna ao gatilho, ou ao diálogo se o gatilho foi removido.
Item bloqueado não dispara callback. Rótulos ReactNode sem texto simples não
participam da busca por letra. Popover manual escapa de overflow com posição
limitada à viewport. Não é Combobox/Select e não inventa estado de validação.

## Modal — organismo

Diálogo controlado (`open/onClose`), `width=520`, título opcional e ariaLabel
alternativo (`Janela modal`). Modal contém uma tarefa, não uma página completa.
Foco inicial é o primeiro controle disponível, preservando foco já colocado no
conteúdo; Tab permanece no diálogo ativo; Escape fecha após dispensar camadas
filhas. Clique no scrim fecha por padrão; `closeOnBackdrop={false}` desativa essa ação. Cabeçalho/fechar aparecem com título; sem ele,
forneça ação visível de fechamento quando necessária. Ao fechar, retorna ao
gatilho conectado apropriado. Diálogos aninhados suspendem o pai. Inert e scroll
são restaurados sem remover configurações anteriores do host. Dados são da
aplicação: use estado controlado para preservá-los após desmontagem.

## Drawer — organismo

Diálogo controlado (`open/onOpenChange`), `side=right`, painel lateral de 320px
limitado a 90vw quando width não é fornecido. `side` left/right/bottom/full muda
a apresentação. `modal=true` é o padrão; `modal={false}` remove scrim, bloqueio
de foco e inert do fundo. O painel continua nomeado como diálogo; o consumidor
deve manter navegação e fechamento alcançáveis nesse uso não modal. Título ausente usa nome Painel;
`hideClose` é opt-in. No uso modal, Escape, scrim, foco, inert e scroll seguem o
mesmo contrato do Modal; no uso não modal, não há scrim nem bloqueio do fundo. Corpo rola; ações persistentes podem ficar em footer. Não use para
esconder informação essencial que deve permanecer na página.

## Tooltip — molécula

Ajuda textual complementar; não substitui label e não contém controles interativos.
`side=top`, `delayMs=350`, `defaultOpen=false`, `portalled=false`. `open` define
modo controlado; omitido, há estado interno com defaultOpen. onOpenChange
comunica pedidos de mudança, inclusive em modo controlado. Hover/foco abrem;
saída/blur e Escape dispensam. A bolha pode ser alcançada com hover; a pequena
janela de saída permite atravessar o espaço entre trigger e bolha. Não existe
seleção/erro de formulário. aria-describedby preserva a descrição já existente.
Local e portal usam top layer/posição limitada; dentro de diálogo, o portal
permanece descendente acessível dele. Texto longo quebra dentro da viewport.

## ToastRegion — composição da família Toast (molécula no catálogo)

Pilha controlada de ToastData (`toasts/onDismiss`), position=bottom-right.
Toast individual tem tone=default e duration=5000ms; duration=null persiste.
Aviso com ação importante deve usar duração persistente ou política temporal
justificada pelo produto. A expiração pausa durante foco/hover e retoma o tempo
restante; um rerender que apenas troca callback não reinicia o prazo.
Ação chama seu callback e solicita dispensa uma vez. Fechar e expiração também
pedem dispensa; a aplicação é responsável por retirar o item da lista.

A região mantém o mesmo host/instâncias ao acompanhar o diálogo ativo da mesma
instância ThemeProvider. Assim ação e fechar participam do foco e da árvore
acessível modal. Ao fechar, volta à origem; uma marca não captura avisos de outra.
Avisos globais não são fechados pelo Escape usado para menu/diálogo. Título deve
explicar o resultado; tom/cor/ícone não bastam. role=status/aria-live solicitam
anúncio, cujo resultado exige teste real de leitor de tela. A região pode ser
validada sem certificar todos os usos isolados de Toast.

## Composição e migração

Prioridade: diálogo → menu → aviso → ajuda, independentemente da ordem de abertura.
Os popovers usam API nativa nos navegadores atuais da matriz. Não há promessa de
suporte homologado para navegadores sem Popover/inert; fallback visual não é prova.
O laboratório força colisões para verificar prioridade; não é um modelo de layout
para copiar numa página de produto.

Mudanças desta fase: ID implícito do Input deixa de ser derivado só do rótulo;
use id explícito em seletores/integrações. Menu passa a focar o contêiner e pular
itens desabilitados por teclado, com IDs exclusivos e ariaLabel aditiva. Aviso
global acompanha o diálogo e preserva prazo/instância. Props e callbacks existentes
permanecem; Button mantém o default nativo de type. Revise presets que customizam
cor de ação/fechar do aviso: contraste deve ser medido sobre a superfície invertida.

Provas: tests/core.spec.ts, tests/themes.spec.ts e tests/visual.spec.ts.
O de–para por produto e a homologação assistiva não são substituídos por esses testes.
