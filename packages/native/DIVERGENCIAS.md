# Divergências entre @refy-design/mobile e @refy-design/web

Este arquivo lista o que o nativo faz diferente da web e por quê. Ele foi escrito a partir do código e dos testes, e conferido no simulador de iPhone em 06/11/2026 (seção "Comparação visual").

## O que vale para todos os componentes

| Web | Nativo | Razão |
|---|---|---|
| Cascata de variáveis CSS | `RefyProvider` resolve os tokens de cada modo; `RefyScope` resolve de novo para uma subárvore | O RN não tem cascata. Re-resolver mantém aliases como `--brand → --primary` iguais aos da web |
| `color-mix()` e `oklch()` | cor sRGB calculada no build (`@refy/tokens`) e `t.mix()` em tempo de execução | O RN não entende essas funções. 33 cores conferidas no Chromium, diferença zero |
| `:hover` | não existe; o estado pressionado usa as cores de hover e active somadas | Toque não tem hover. O desktop mostra as duas durante o clique |
| `:focus-visible` com anel | sem anel desenhado | No toque não há foco de teclado; VoiceOver e TalkBack desenham o próprio foco |
| Setas, Home e End (roving tabindex) em Tabs, Segmented, ChoiceCard, WizardStepper | o leitor de tela percorre item a item e anuncia o estado | Teclado físico em celular fica fora do MVP |
| Área de clique do tamanho do desenho | `hitSlop` completa 44 pt sem mudar o desenho | Mínimo da Apple e do Material. O teste `a11y.test.tsx` cobra isso em toda a galeria |
| `className` | `style` | O RN não tem classe |
| `onClick` do DOM em Button | `onPress` | Evento do `Pressable`. Onde o contrato declara `onClick` (Item), o nome fica |
| Pilha de fontes (`Inter, system-ui, ...`) | primeira família do token, entregue ao `fonts` do provider | O app registra as fontes com expo-font e mapeia família e peso para o nome registrado |
| `calc()` e `dvh` em tokens | valor calculado no componente | `--dialog-max-height` vira altura da tela menos o padding do scrim |
| `--brand-gradient` (`linear-gradient`) | degradê SVG no Card invertido | O RN não tem gradiente em `backgroundColor` |
| `box-shadow` | `boxShadow` com a mesma string | Exige RN 0.76+ com a nova arquitetura (Expo 54 já usa) |
| Fundo de token com `linear-gradient(...)` (ex.: `--button-primary-background`) | `experimental_backgroundImage` com a mesma string, em Button, IconButton e Fab | `backgroundColor` não aceita degradê; antes deste ajuste o botão primário de um tema com degradê ficava transparente |
| `.md svg { width: 16px }` e `color` herdado pelo ícone | `useIconStyle()` devolve tamanho e cor que o componente decidiu | O RN não herda cor nem seleciona o filho por CSS. O ícone do app lê o contexto |

## Por componente

**Select.** A web recebe `<option>` como filhos. O nativo recebe `options`, `value`, `onValueChange` e `placeholder`, e abre a lista numa folha modal. O RN não tem `<select>`.

**SettingRow.** `href`, `target`, `rel` e `onClick` saem; entram `onPress` e `switchProps` (o `Switch` do sistema). Navegação no app é do roteador, não de link.

**Segmented.** Em `iconOnly` não há tooltip; o rótulo vira só o nome acessível. Toque não tem hover para abrir tooltip.

**Tabs.** Sem `id` e `aria-controls` entre aba e painel; o RN não tem essa ligação. A lista rola na horizontal quando não cabe, como o `overflow-x` da web.

**WizardStepper.** `variant="auto"` esconde as etapas abaixo de 620 pt de largura, a mesma regra da container query, medida com `onLayout`. Em celular, `auto` quase sempre fica compacto.

**ChoiceCard.** O grid vira linhas com largura calculada pela largura medida. Cards com preview não alinham preview e texto entre si numa mesma linha (a web usa `subgrid`).

**Modal.** Usa o `Modal` do RN: o botão voltar do Android fecha, e o título é anunciado ao abrir. O desfoque do scrim (`backdrop-filter`) não existe no RN.

**Toast e ToastRegion.** Não há popover nem top layer: a região é `position: absolute` e deve ser montada uma vez na raiz do app. A área segura entra por `style`, porque o Refy não depende de `react-native-safe-area-context`. Segurar o dedo pausa o tempo, no lugar do hover. Com leitor de tela ligado o toast não some sozinho; na web ele some depois de `duration`.

**Chip.** `aria-pressed` vira `accessibilityRole="togglebutton"` com `selected`; em `selectionMode="radio"`, papel `radio` com `checked`. O check aparece sem a animação de giro e largura. Sem `translateY` de hover.

**IconButton.** O nome acessível obrigatório é `accessibilityLabel` (na web, `aria-label`). Os tamanhos de 28, 32 e 36 pt ganham `hitSlop` até 44 pt.

**Avatar.** `src` continua aceitando URL; `source` aceita imagem empacotada (`require`), que é como o app carrega arquivo local. O gradiente por `seed` usa o mesmo hash da web e é desenhado em SVG.

**Fab.** Mesmo desenho; posicionar é do app, como na web. Sem `:hover`.

**BrandLogo.** O ponto pulsa com `Animated`; com movimento reduzido fica parado, como na web.

**ScrollArea.** `maxHeight` aceita número, porcentagem e `"240px"`. Outras unidades CSS são ignoradas.

**Switch.** Desenhado com os tokens do tema (`--switch-*`, `--primary`), não com o `Switch` do sistema, para ficar igual à web em qualquer tema. O estado sai por `onCheckedChange(checked)`; na web é o `onChange` do input. A trilha que escurece no hover aparece enquanto o dedo está apertando.

**Checkbox.** Mesma troca de evento do Switch (`onCheckedChange`). `description` também vira `accessibilityHint`. O check aparece sem a animação de escala da web.

**RadioGroup.** `name` e `inputProps` saem: são do formulário HTML. O grupo tem papel `radiogroup` e cada linha papel `radio` com `checked`.

**Label.** É o `FieldLabel` que Input, Textarea e Select já usam, exportado com o nome da web. Sem `htmlFor`: no RN o campo aponta para o rótulo com `accessibilityLabelledBy` e o `nativeID` do Label.

**Divider.** Papel `separator` com `aria-orientation`. O rótulo central só aparece na horizontal, como na web.

**Spinner.** Papel `progressbar` com `busy`, porque o RN não tem `role="status"`. Com movimento reduzido para de girar e a borda fica pontilhada, igual à web.

**Skeleton.** O brilho é um degradê SVG que anda por cima do fundo; a web anima `background-position`, que o RN não tem. Fica escondido do leitor de tela, como o `aria-hidden` da web.

**StatusDot.** O halo é um círculo atrás do ponto; o pulso cresce o halo de 3 para 6 pt e baixa a opacidade de 18% para 8%, os mesmos números do `box-shadow` animado da web.

**Slider e Range.** Tocar na trilha leva o controle ao ponto, e arrastar segue o dedo, como o pointer capture da web. No lugar de setas, Home e End, o leitor de tela ajusta um passo por gesto (`adjustable`, ações `increment` e `decrement`). Sem o aumento de hover; enquanto arrasta, o controle cresce e ganha o halo, igual à web. Durante o arraste a trilha não deixa a tela rolar.

**ToggleGroup.** Cada botão tem papel `togglebutton` com `selected`, no lugar de `aria-pressed`.

**Pagination.** A sequência de páginas é a mesma função da web (`paginationPages`). A página atual anuncia `selected`, no lugar de `aria-current="page"`. Os botões de 32 pt ganham `hitSlop` até 44 pt.

**Otp.** O primeiro campo pede o código do SMS ao sistema (`textContentType="oneTimeCode"` no iOS, `autoComplete="sms-otp"` no Android), e o código que chega ou é colado se distribui pelos campos. Sem setas: o toque escolhe o campo. Apagar num campo vazio limpa o anterior e volta para ele.

**Bubble.** Largura máxima de 85% da linha, no lugar de `65ch`, que o RN não tem.

**Marker.** Vai dentro de um `<Text>`. Texto aninhado no RN não aceita padding nem raio, então o realce é só fundo e cor.

**GoogleButton.** É o Button secundário com as cores `--auth-control-*`, como na web. Sem hover; o toque usa `--auth-control-active`.

**AspectRatio.** Igual à web: largura toda e `aspectRatio`.

**Prose.** Fica fora do nativo. Ela estiliza HTML solto (títulos, parágrafos, listas) por seletor, e o RN não tem HTML nem seletor: no app cada texto já sai com o estilo do componente que o mostra.

**Accordion e Collapsible.** Abrir e fechar usa `LayoutAnimation` com `--motion-context-duration`; com movimento reduzido o bloco aparece sem transição. O título anuncia `expanded`, no lugar de `aria-expanded` e `aria-controls`. Sem hover: o toque num item fechado mostra `--legacy-surface-hover` enquanto o dedo está apertando.

**Callout.** Papel `summary`, porque o RN não tem `role="note"`. O degradê do tom `upsell` é SVG. A saída anima opacidade e 4 pt para cima, como a web, e só então desmonta e chama `onDismiss`.

**ButtonGroup.** Recebe `Button` do nativo como filhos e troca a variante e os cantos, como a web. A opção ativa anuncia `selected`, no lugar de `aria-pressed`.

**AvatarGroup.** Sem tooltip, porque toque não tem hover: o nome de cada pessoa vira o nome acessível, e o "+N" lê os nomes que ficaram de fora. O anel é uma borda da cor da superfície em volta de cada avatar.

**SectionHeader.** Sem `id` de âncora: no app não há sumário com rolagem por âncora. O título tem papel `header`.

**ActivityItem.** O autor não vira link (`href`, `target`): navegar é do roteador do app. Em largura estreita a web quebra a ação para a linha de baixo por container query; no nativo a ação fica sempre à direita.

**NavCard.** `href`, `target`, `rel` e `onClick` saem; entra `onPress`. O estado de hover (borda da marca, sombra, seta colorida) aparece enquanto o dedo está apertando. `current` anuncia `selected`.

**PersonCell.** Igual à web; nome e linha de apoio cortam com reticências numa linha.

**UsageMeter.** O texto lido pelo leitor de tela é "usado de limite unidade", igual ao `aria-valuetext` da web.

**ScoreGauge.** Papel `progressbar` com valor de 0 a 100, porque o RN não tem `role="meter"`. O arco é SVG e cresce até o valor com `--motion-context-duration`; com movimento reduzido nasce no valor.

**StickyBar.** Na web a barra gruda no topo com `position: sticky`; o RN não tem isso. O app monta a barra sobre a lista e liga `visible` pela rolagem; a entrada e a saída são as mesmas (opacidade e deslize). O meta só aparece acima de 720 pt de largura, a mesma regra da web.

**StickyFooter.** Sem `position`: no app o rodapé é montado fora do ScrollView, e isso já o prende embaixo. A área segura entra por `bottomInset`, porque o Refy não depende de `react-native-safe-area-context`; na web é `env(safe-area-inset-bottom)`.

**Camada ancorada (AnchoredLayer).** A web posiciona o painel na top layer do documento; o nativo abre um Modal transparente e mede o gatilho com `measureInWindow`. A conta de posição (virar de lado, encostar na borda) é cópia de `floatingPosition` da web, e o teste de paridade compara as duas em 144 combinações. Escape do teclado vira voltar do Android e o gesto de escape do VoiceOver.

**Menu / ContextMenu.** Sem navegação por setas, Home/End nem busca por letra: no toque cada item é um alvo de 44 pt e o leitor de tela percorre a lista. `shortcut` não aparece. O menu de contexto abre no toque longo, no ponto do dedo; pelo leitor de tela, a ação "Abrir menu" ancora na própria área. `style` (caixa do gatilho) e `scrim` são só do nativo.

**Popover.** Sem foco automático no primeiro controle: o Modal já prende o leitor de tela no painel.

**Tooltip.** Sem hover nem foco de teclado: abre no toque longo e fecha no toque seguinte. O texto vai também para o `accessibilityHint` do gatilho. Sem a seta (a bolha pode encostar na borda e a seta apontaria para o lugar errado). `shortcut`, `delayMs` e `portalled` ficam só na web.

**Snackbar / SplitButton / FabMenu.** Mesmas cores, medidas e composição da web (Button + Menu, Fab + Menu). O FabMenu escurece a tela com o próprio Menu (`scrim` de 24% de ink-1).

**Calendar.** Cada dia é um alvo de 44 pt (a web usa 36), então o mês tem 308 pt de largura em vez dos 252 do `--calendar-month-width`. O círculo do dia segue `--calendar-day-size`. Sem prévia do fim do intervalo no hover e sem navegação por setas e PageUp/PageDown: o leitor de tela lê cada dia pelo nome completo ("sexta-feira, 6 de novembro de 2026"). A grade, o rótulo do mês e a regra do intervalo (`calendarCells`, `calendarMonthLabel`, `nextRange`) são as mesmas da web.

**DatePicker.** Mesmo desenho da web: botão com a data, Calendar num Popover e "Limpar data".

**PhoneInput.** O país abre num Menu (a web usa um `select` invisível sobre a bandeira). Teclado de telefone e preenchimento automático do sistema. `onChangeText` entrega o número já com máscara; a lista de países e a máscara são cópias da web conferidas no teste de paridade.

**PostalCodeInput.** `onChangeText` entrega o CEP já com máscara 00000-000 (na web, `onChange` recebe o evento do DOM). Botão embaixo do campo em telas de até 480 pt, como a regra de 30rem da web.

**HelpField.** Sem hover: o ícone abre a ajuda num Popover no toque. O texto de ajuda vai para o `accessibilityHint` do campo. `htmlFor` fica só na web.

**Combobox.** A lista abre dentro do contorno do campo, como na web, e fecha ao escolher ou quando o campo perde o foco. Sem navegação por setas nem a tecla ↵ na linha ativa: no toque cada sugestão é um alvo de 44 pt. O campo usa o papel `search` do sistema: o papel `combobox` do RN vira um botão no iOS e o leitor de tela deixaria de oferecer digitação. Filtro e seções (`comboboxSections`) iguais aos da web.

**Multiselect.** Mesma conta da web para os chips que cabem e o "+N" (`visibleChipCount`), com a largura do contador medida uma vez. Backspace no campo vazio tira o último chip. No modo `overlay` a lista abre numa camada ancorada (Modal), então o teclado fecha enquanto ela está aberta. O campo é um texto comum com dica para o leitor de tela, pelo mesmo motivo do Combobox.

**Carousel.** Mesmas setas e "1 de N"; no toque também troca com arrasto lateral. Sem setas do teclado.

**Message / MessageScroller.** Mesma composição (Avatar + autoria + Bubble). O histórico acompanha a última mensagem e mostra "Ir para mensagens recentes" quando a pessoa rola para cima, como na web. A entrada de mensagem nova sobe 6 pt, como a animação da web.

**CodeBlock.** O nativo não traz área de transferência nem realce de sintaxe, para não somar dependência ao pacote: o app injeta `copyToClipboard` (ex.: expo-clipboard) e, se quiser cores, `highlight`, que devolve trechos com os mesmos nomes de token do Prism e pinta com os mesmos `--code-syntax-*` da web. Sem `copyToClipboard`, o botão copiar não aparece. O texto é selecionável.

**BillingCard / PlanCard / DangerZone.** Mesmas medidas e cadeias de token. No PlanCard destacado, a borda de 2 pt faz o papel de borda + anel de 1 px da web; o degradê do topo é SVG.

**UserMenu e HelpMenu.** Compõem o Menu nativo. O atalho de teclado da web (⌘K) não aparece no toque; o item continua. `aria-describedby` fica só na web.

**NotificationBell.** O painel tem 340 pt ou a largura da tela menos 16, o que for menor. O número do sino entra sem a animação de "pop" da web. Cada notificação lê título, "não lida", descrição e tempo numa frase só.

**WorkspaceSwitcher.** As setas do teclado e o Enter da web não existem no toque; a busca (5 ambientes ou mais) recebe o foco ao abrir. No modo compacto o avatar fica com 32 pt dentro do alvo de 40 (na web ele ocupa os 40). O check entra sem a animação de "pop".

**SettingsSubnav.** Na web cada item é um link real (`href`, `renderLink`). No nativo não há endereço a seguir: o toque chama `onNavigate` e o app navega. O item ativo anuncia "selecionado" no lugar de `aria-current="page"`. `--subnav-item-padding` é atalho de CSS com dois valores; o nativo usa `--space-2` e `--space-3`, que são o padrão dele.

**KanbanCard.** Título com `onOpen` vira um toque com sublinhado ao pressionar, no lugar do sublinhado do hover.

**PropertyActionGroup.** A largura de 360 pt que empilha os botões é medida no próprio grupo, como o `@container` da web. O contorno do botão ativo é uma borda em volta dele (o RN não tem `outline-offset`). O botão que processa também fica desativado ao toque, porque o Button nativo trava durante o carregamento.

**PropertyMedia.** `aspectRatio` é número (largura ÷ altura, padrão 4/3); na web é o texto do CSS. Sem setas do teclado. Até 544 pt de largura as setas descem para baixo e os pontos sobem 44, como a regra de 34rem da web. Cada ponto tem 22 pt de altura com 11 de folga para cima e para baixo, e encosta no vizinho sem sobrepor o alvo.

**FileUpload.** O celular não tem arrastar e soltar nem `<input type="file">`. A escolha vem de `pickFiles({ accept, multiple })`, injetado pelo app (expo-document-picker ou react-native-document-picker), e sem ele o botão não aparece: nenhuma dependência nova no pacote. O arquivo é `{ name, size, type?, uri? }` no lugar do `File` do DOM; a miniatura usa `uri` quando o tipo é `image/*`. A dica padrão diz "Escolha no seu dispositivo." porque "Arraste arquivos para cá" não vale no toque.

**VoiceRecorder.** Controlado como na web: o app grava e transcreve. A mensagem de erro padrão fala da permissão "nos ajustes" no lugar de "do navegador". No erro, os botões descem para baixo do texto: com 390 pt de largura, ao lado do texto eles espremiam a frase numa coluna de uma palavra. A web tem o mesmo aperto em tela estreita (`.action` com `flex-shrink: 0`); fica registrado para corrigir lá.

**AlertDialog.** Usa o Modal nativo com papel de alerta. Enquanto `pending`, nem o voltar do Android fecha.

**Drawer.** `width` é número em pt (na web aceita texto de CSS) e para em 90% da tela. O painel de baixo também fecha ao arrastar o topo para baixo mais de 80 pt. Sem foco preso por teclado: o Modal do RN isola o leitor de tela. A margem segura do aparelho entra por `insets`, que o app tira de react-native-safe-area-context; o pacote não traz a dependência.

**Timeline.** A troca para linha à esquerda (640 pt) e a folga menor (380 pt) são medidas no próprio componente, como o `@container` da web. No horizontal, setas e Home/End do teclado não existem; a faixa rola no dedo. O marco atual anuncia "selecionado" no lugar de `aria-current="step"`.

**EventTimeline.** O horário vai como texto, sem `<time dateTime>`. A linha tracejada do modo compacto é uma borda tracejada do RN. `ActivityTimeline` continua como outro nome.

**PropertyCard.** `mediaProps` e `actions` usam os tipos nativos do PropertyMedia e do PropertyActionGroup. O `list` vira duas colunas só acima de 768 pt de tela, como a regra de 48rem da web.

**Matrix2x2.** A altura é `height` (padrão 460, a altura mínima da web). Sem hover: o ponto cresce ao pressionar. Os rótulos dos quadrantes ocupam até 44% da largura no lugar de 190 px fixos, para não se cruzarem em 390 pt.

**Table.** A largura da coluna é `width` em pt e `minTableWidth` liga a rolagem lateral; no lugar de `className`, `style`. Os filtros abrem num painel ancorado com opções marcáveis, e a ordem é anunciada como "ordem crescente" ou "ordem decrescente".

**KanbanBoard.** Sem arrastar no toque: o card muda de etapa ou de posição pelo menu ⋯ e pelas ações do leitor de tela. A instrução visível diz isso ("Toque em ⋯ no card..."), diferente da web, que fala de arrastar e de teclado. Colunas de 264 pt numa rolagem lateral. `color` aceita token (`--info`, `var(--info)`) ou cor pronta; token que o tema não tem cai na cor de contorno.

**SwipeDeck.** Sem atalhos de teclado. O arrasto tem o mesmo limiar da web (72 pt) e fica preso a 140 pt; salvar não tem gesto e some com o cartão encolhendo. O item usa o PropertyCard nativo.

**Coverflow.** Sem teclado (Home, End, setas); no lugar, os botões de anterior e próximo e o toque no cartão vizinho. `itemWidth` em pt (padrão 256, os 16rem da web). Com movimento reduzido, os cartões ficam retos e a troca é instantânea, como na web.

**Questionnaire.** Sem `<form>`: o botão Continuar e o "enviar" do teclado fazem o envio da pergunta.

**GuidedTour.** O GuidedTourAnchor escurece a tela em volta do controle com quatro faixas (o `spotlight` do AnchoredLayer) no lugar do `box-shadow` da web; o recorte tem cantos retos. Sem devolução de foco ao fechar: o leitor de tela volta sozinho ao último elemento.

**ApprovalWorkbench.** Até 840 pt de tela, a fila vira faixa com rolagem lateral (cards de 260 pt) e o estado do item desce para baixo do nome, para o nome caber. O item ativo anuncia "selecionado" no lugar de `aria-current="step"`.

**Trace.** `codeBlockProps` repassa ao CodeBlock a área de transferência e o realce, que o nativo recebe do app.

**VisitSchedulePicker.** No celular os três painéis empilham e os dias selecionados ficam em duas colunas. A instrução diz "Toque" no lugar de "Clique". O título do painel e o selo do fuso quebram em duas linhas quando não cabem juntos.

**GeoAreaPicker.** Até 760 pt, mapa, controles e listas empilham, como na web. O texto do mapa indisponível diz "listas abaixo" quando empilhado e "ao lado" quando não. Exporta `geoAreaLists`, a regra de quem fica dentro e fora.

**IntentComposer.** `voiceRecorderProps` usa o VoiceRecorder nativo. O texto ocupa o Textarea sem borda; a borda do compositor fica na cor da marca enquanto o campo tem foco, no lugar de `:focus-within`. Os exemplos rolam de lado e "Experimente:" não aparece, como na web abaixo de 620 px.

**LineChart, AreaChart, BarChart, DonutChart, Sparkline.** Mesma geometria da web: `parity.test.tsx` compara os caminhos e as barras com a web renderizada em 520 de largura. Sem animação de entrada (linha desenhando, barra crescendo, anel varrendo): o gráfico aparece pronto. No toque, arrastar o dedo percorre os pontos do LineChart e soltar esconde o tooltip; com leitor de tela, o gráfico é ajustável, ponto a ponto, no lugar das setas, Home e End. BarChart, DonutChart e Sparkline são imagens com os valores no nome acessível. A tabela "Ver dados de" abre num Collapsible, no lugar do `<details>`.

**ChartLegend.** Item desligado anuncia "não selecionado" no lugar de `aria-pressed="false"`.

**D3Chart.** Todas as famílias da web. `line` e `area` usam a cena nativa (`src/chart/scene.ts`, comparada com a web em cinco casos). As demais (barra, dispersão, bolha, histograma, boxplot, candlestick, mapa de calor, pizza, rosca, barra radial, medidor, radar, treemap, pack, árvore, cluster, partição, sunburst, rede, acorde, sankey e mapa) usam cópia fiel das cenas da web em `src/chart/d3/`: `parity.test.tsx` falha se a cópia divergir da web numa linha que seja, fora o import das classes. `src/chart/d3/svg.tsx` traduz o SVG do DOM para react-native-svg e aplica as classes do D3Chart.module.css com os tokens do tema. Ficam de fora:

- `zoom`, `brush` e `stream`. O tipo nativo não aceita essas props: uma tela que as passa na web precisa tirá-las no nativo, e o TypeScript avisa;
- `renderMark` e `renderOverlay`, que desenham SVG do DOM.

No toque, arrastar o dedo escolhe a marca mais próxima e mostra o tooltip. Com leitor de tela, o gráfico é `adjustable`: deslizar para cima ou para baixo anda item a item e lê o valor; tocar duas vezes seleciona. A tabela "Ver dados de" abre num Collapsible nas famílias novas; `dataTable="screen-reader"` não mostra a tabela, porque o nativo não tem tabela só para leitor de tela.

## Só na web

Estas peças não têm versão nativa, porque dependem de navegador, de página longa ou de mouse e teclado: Direction, Kbd, Prose, Breadcrumb, DeviceFrame, HoverCard, Menubar, NavigationMenu, Resizable, TableOfContents, AppShell, Command, Hero, Section, Sidebar, SiteFooter e Topbar. No app, a navegação vem do roteador do app (abas, pilha, gaveta) e o texto longo vem dos componentes de conteúdo.

## Comparação visual

Rodada de 06/11/2026 no simulador "iPhone 16 refy" (iOS 27.2), Expo Go 54.0.7, tema refy claro. Fotos em `test-results/sim-2026-11-06/` (v1, v2 e v3).

| Achado no iPhone | Causa | Correção |
|---|---|---|
| Galeria abria com tela vermelha ("Loss of precision… 66.666") | `accessibilityValue.now` fracionário; o iOS só aceita inteiro | `Math.round` em ProgressBar, ScoreGauge, Slider e Range |
| Seletor Alugar/Comprar do IntentComposer esticava na vertical | `ScrollView` horizontal cresce no eixo cruzado | `flexGrow: 0` em todo `ScrollView` horizontal |
| Aviso "Text strings must be rendered within a <Text>" | `lockHint` do ConnectorCard em `View` | `renderText` no `lockHint` e no `status`; `test/strings.test.tsx` varre a galeria |
| "COMPAT." encostava no anel do ScoreGauge | Fonte mono do iOS mais larga que a da web | Rótulo limitado a 62% do anel com `adjustsFontSizeToFit` |
| Treemap cortava "Floresta" em "Florest" | Corte por largura sem reticências (também na web) | `fitLabel` com "…" em `d3/hierarchy.tsx`, igual nas duas cópias |
| Chip de exemplo do IntentComposer cortava seco | Rolagem horizontal, como na web | Degradê na borda direita da faixa de exemplos |
| Coluna Ano encostava na borda; depois a tabela não enchia o card | Larguras fixas maiores que a tela | Galeria com coluna flexível; grade com `flexGrow: 1` dentro da rolagem |

Não conferido nesta rodada: temas escuro e editorial, tema do produto consumidor e rolagem com o dedo.
