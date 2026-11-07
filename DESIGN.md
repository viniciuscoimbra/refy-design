# Refy UI — referência visual

## Fluxo de criação

Componentes preserva Atomic Design. Templates apresenta composições/variações prontas; Playground reaproveita seus exemplos e o mesmo editor. A ferramenta de edição permanece neutra e a prévia usa o tema escolhido. Começar do padrão é ação explícita, com confirmação para descartar personalização; navegar não muda o tema. Manter a densidade Refy vigente e não criar novos controles, organismos de página ou paletas paralelas. Aprovação visual humana segue pendente.

## Densidade vigente — 29/10/2026

Correção autorizada: Refy Site herda a escala tipográfica, dimensões, espaçamentos e estrutura dos componentes Refy, removendo receitas paralelas que aumentaram fonte e padding ou reduziram a altura do campo com fonte maior. Base14px, pequeno13px; os fallbacks dos componentes são a fonte única dessas métricas. O papel display permanece na apresentação do hero. Famílias de fonte, paleta e assinatura são preservadas; claro/escuro não alteram densidade. A direção anterior de controles ampliados fica substituída neste escopo.

## Refy Site — 25/10/2026

O mantenedor autorizou composições do site em uma pasta própria no Storybook, com o tema opt-in Refy Site. O nome e o logo são "refy", sem sufixo nem selo Beta; refy.design é só o domínio (correção do mantenedor em 01/11/2026). Preservar o preset Refy original; páginas compõem a biblioteca e aparência de componentes muda por variáveis. [Escopo, correspondência e evidências](docs/REFY_SITE.md). O candidato ainda exige aplicação na origem e conferência visual.

Revisão local autorizada em 24/10/2026: preservar a estrutura aprovada do Playground e refinar cores de dados, hierarquia de charts, nomes humanos dos Blocks e ícones com Tooltip nos seletores. [De–para e limites](docs/CHART_VISUAL_LANGUAGE.md). Não presumir aprovação visual ou publicação.

## Direção vigente — 24/10/2026
Navegação: Componentes, Demonstração, Blocks, Charts e Tipografia. Acesso/Setup pertencem a Blocks e fluxos internos, sem entradas públicas duplicadas. Charts usa diretamente a documentação D3; comparação experimental fica fora da navegação. Charts/Blocks/Tipografia reutilizam o layout documental de Componentes, com lista lateral e busca. Tipografia mostra seis conjuntos, todos os nomes e papéis (inclusive mono) em Artigo/Escala/Elementos, com Lorem ipsum longo. Aplicar conjunto atualiza papéis editoriais. OAuthButton compõe Button/GoogleButton com oito provedores, sem autenticação real. [De–para](docs/PLAYGROUND_CATALOGS.md). Aprovação visual continua pendente do mantenedor; tudo local.

## Overview
Referência: tokens, componentes e composição do commit c3f03fd. Recuperação autorizada em 22/10/2026, preservando o caráter Refy e corrigindo problemas existentes. UI compacta e legível para trabalho contínuo em sistemas, com claro, escuro e sistema; nenhum modo inventa a marca de um consumidor.

## Colors
Acento verde Refy, superfícies neutras e estados semânticos da fonte versionada em src/tokens/foundations.tokens.json. Não criar paleta paralela. Cores de texto/estado continuam cores; degradês pertencem a tokens de superfície de componente. Presets demonstrativos têm nomes descritivos e não representam clientes.

Correção explícita do mantenedor em 22/10/2026: o fundo Refy claro é branco (#ffffff). No escuro, superfície elevada se distingue do fundo. Editorial permanece apenas para compatibilidade da API e testes históricos; não é oferecido na navegação pública. Sistema acompanha a preferência de cor do dispositivo. Claro/escuro nunca alteram geometria, raios, espessuras ou fontes. A aparência controla esses atributos, com escala de raios consistente inclusive em avatares, timeline e workspace. Somente formas de significado intrínseco (spinner, ponto de estado, símbolo de marca, gráfico circular) preservam seu desenho.

## Typography
Referência atual autorizada em 22/10/2026: Manrope em títulos e assinatura, Source Sans 3 em corpo/controles, Source Code Pro em código e valores. Alternativas selecionáveis: IBM Plex Sans/Mono e DM Sans/Geist Mono. O conjunto anterior Space Grotesk/Inter/JetBrains Mono permanece como legado para comparação, não como preferência atual. Fontes locais opcionais e papéis de tokens preservados. O playground demonstra a mudança na aplicação inteira, inclusive overlays.

A ação verde usa texto branco: --primary #087f5b, hover #066649, active #054f39. Acentos luminosos da marca e texto de ênfase no escuro mantêm papéis próprios. As identidades customizadas continuam podendo definir seus próprios pares.

## Elevation
Superfícies, bordas e sombras usam tokens. Estados precisam ser legíveis em todos os modos. Overlays preservam prioridade, foco e herança visual; efeito decorativo não corrige camada ou contraste.

## Components
Botões compactos, estados consistentes, campos com rótulos claros, cards com hierarquia e navegação previsível. Geometria, superfície, borda, sombra e estados configuráveis. Refy, Geométrico (cantos retos) e Fluido (cantos suaves e ação em degradê) demonstram a mesma API. Tema reúne cores, fontes, dimensões, alinhamentos, forma e demais tokens; modo escolhe Claro/Escuro/Sistema. Todos são compartilhados pelo catálogo e Playground. Páginas têm layout responsivo, ações alcançáveis e conteúdo neutro; não copiam estilos internos dos componentes.

## Do's and Don'ts
- Conferir o conjunto e cada família, incluindo móvel, texto longo, modo escuro e estados.
- Explicar diferenças intencionais em relação à referência original.
- Usar exemplos neutros de projetos, arquivos, conteúdo, pessoas e tarefas.
- Não apresentar linguagem imobiliária herdada, laboratório técnico ou teste aprovado como substituto de acabamento visual.
- Não apagar APIs existentes para apenas renomear o catálogo.

## Playground

Playground é o editor visual de temas, com galeria de componentes e composições de Aplicação, Acesso e Setup. Componentes mantém a hierarquia atual. Tokens fazem parte da edição; não há página inicial promocional nem seção pública de verificações. O editor tem uma superfície neutra separada da prévia personalizada. Dados e autenticação são demonstrações locais explícitas; controles de navegação, seleção, notificações e formulários precisam funcionar de verdade.

## Consistência confirmada em 22/10/2026

A toolbar do Storybook oferece apenas Tema e Modo. Fontes e os demais atributos são editados dentro de Personalizar tema. A personalização abre Drawer direito, com abas Cores/Forma/Tipografia/Tokens/Exportar, em qualquer largura. A galeria contém links de demonstração e indica o destino local; somente o link explícito ao catálogo sai do exemplo.

Fab/FabMenu e dias selecionados de Calendar compartilham os papéis de ação de Button, incluindo hover. Seleções sólidas (checkbox, seleção de navegação) usam primary/on-primary e primary-soft/primary-ink; não são novas cores de marca. Focus não usa marca verde fixa. CodeBlock acompanha a superfície e tinta do modo, inclusive o highlight demonstrativo.

Não desenhar cópias de átomos dentro de composições. Input e seus campos compostos usam InputControl interno para o controle textual. Pessoas na tabela, conta e timeline usam Avatar padrão; entidades usam prop explícita. Botões compactos de adicionar usam IconButton; alvos do rail têm 40px e dicas, incluindo expandir e equipe. Elementos intrínsecos de widgets (tabs, opções e células de calendário) mantêm seus papéis/teclado; não são botões de ação comuns.

## Tipografia e controles — continuação local

Rótulo, superfície e foco de Input, Select, Textarea, PhoneInput, Combobox e Multiselect usam a receita interna do átomo Input; PostalCodeInput continua compondo Input. O controle textual continua InputControl. Não copiar esses estilos para corrigir um campo isolado. Rótulos usam os hooks `--field-label-*`, inclusive peso.

WorkspaceSwitcher e itens de NotificationBell herdam a fonte escolhida. Chips de seleção têm altura de linha suficiente para acentos; scroller de sugestões reserva espaço para borda/hover/foco. Accordion usa altura natural para reflow no WebKit após mudar fonte/largura, sem animação de altura. DecisionActions automático empilha ações em contêiner estreito; orientação horizontal explícita é preservada.

Na Sidebar recolhida, o mesmo botão mostra a marca quadrada; hover/foco mostra expandir. O Deck separa fotos de decisões, explica gesto e teclado, cancela sem decidir, anima com respeito à preferência de movimento e permite reiniciar. Resultado de demonstração não representa persistência real. GoogleButton mantém tipografia própria do provedor, com hook `--auth-control-font`; marca não é uma nova família de interface.

## Playground de adoção — 22/10/2026

Galeria com exemplos em largura integral e opção de um por vez; busca e seleção por nível preservadas. Em desktop, personalização ocupa uma coluna de 420px ao lado da prévia interativa; no móvel é modal com Ver prévia. Resultados de tokens têm amostras e controles conforme tipo, com CSS avançado separado. Charts usam D3 existente, dados acessíveis e paleta semântica; Blog demonstra medida/ritmo tipográfico com conteúdo autorizado. Blocks usam a API pública e arquivos copiáveis. Detalhes e de–para: docs/ADOPTION_WORKBENCH.md.

## Correção de direção — documentação por componente

Em 22/10/2026 o mantenedor rejeitou visualmente a entrega de galeria, blocks, charts e blog. A referência de documentação é https://ui.shadcn.com/docs/components/base/accordion. A página de componentes deve ter navegação por Átomos/Moléculas/Organismos, um componente por vez e documentação de instalação, uso, composição e variantes com código legível. A estrutura do Accordion foi aprovada pelo mantenedor. A expansão atual documenta todas as 113 famílias com exemplos e tipos derivados das fontes reais; a revisão visual de cada família continua humana. A matriz simultânea fica oculta, apenas para regressões. As críticas às demais páginas permanecem pendentes e os testes não comprovam aprovação visual.

## Tema completo e documentação integral — direção vigente

Em 22/10/2026 o mantenedor aprovou a estrutura do Accordion e exigiu código colorido. O padrão se estende a todas as famílias, com instalação, uso, composição, exemplos e API reais. Fonte não é um eixo separado de tema: a toolbar expõe apenas Tema e Modo. As seis abas do drawer concentram cores, forma, tipografia, espaçamento, tokens e exportação. Código recebe destaque automático de sintaxe com tokens claro/escuro. A matriz de regressão permanece oculta. Tudo continua local, sem GitHub; as críticas anteriores a blog/charts/blocks/aplicação não foram consideradas resolvidas por esta expansão documental.

## Campos de seleção integrados — 23/10/2026

Combobox e Multiselect expandem a própria superfície e a prévia no fluxo do layout. Um único wrapper usa a receita Field de Input e envolve controle e opções, com a mesma borda, fundo, raio, sombra, foco e erro. A lista só tem divisor interno, sem moldura/sombra independente. Listas longas rolam internamente. O fechamento ao clicar fora ocorre depois do clique, para não deslocar o alvo antes da ativação. Menus e calendários são superfícies independentes; não recebem moldura contínua artificial. Estilos da documentação não sobrescrevem os parágrafos internos das demonstrações.

## Composições em revisão — 23/10/2026
Tipografia é amostra de texto puro, com Artigo/Escala/Elementos e edição no drawer. Charts usa cabeçalho compacto, dados antes de opções secundárias, preenchimentos transparentes e uso/API/código reais; showTitle opcional evita duplicar título de um contêiner, preservando o título acessível. Blocks tem navegação por finalidade, composição atômica e arquivos da prévia. Setup é a mesma composição em todas as entradas. Acesso permite chegar diretamente a cada cenário local. A aplicação vincula revisões/observações ao projeto, sem métricas desconectadas dos dados. A apresentação é uma revisão disponível ao mantenedor, não uma aprovação presumida.
