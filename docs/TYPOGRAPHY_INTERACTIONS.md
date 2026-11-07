# Revisão local de fontes e interações — 22/10/2026

Revisão do agente; aprovação estética humana permanece separada. Tudo local, sem publicação ou alteração de consumidor.

| Elemento | Antes | Agora | Motivo |
|---|---|---|---|
| CEP, Telefone, Projeto e Áreas de trabalho | Rótulos e estados de foco divergentes | Receita interna do átomo Input compartilhada; PostalCodeInput compõe Input | Mesma hierarquia e resposta à interação |
| Input, Select e Textarea | Estilos de campo repetidos | Mesma receita interna, sem alterar semântica nativa | Evitar divergências futuras |
| WorkspaceSwitcher e notificações abertas | Botões internos podiam usar Arial | Herança da família atual | Troca de fonte chega ao conteúdo aberto |
| WorkspaceSwitcher no WebKit | Foco solicitado antes de o painel aparecer; Escape podia não fechar | Foco após exibição e retorno ao botão no Escape | Manter busca e teclado funcionais |
| Chips de seleção | Altura de linha 1 podia recortar acentos | Altura de linha semântica | Preservar texto com as três famílias |
| IntentComposer / Experimente | Hover/foco do chip era cortado pelo scroller | Folga vertical no contêiner | Exibir borda e foco completos |
| Accordion no WebKit | Altura antiga após mudar largura/fonte, texto sobreposto | Altura natural; removida animação de altura | Reflow confiável |
| DecisionActions automático estreito | Palavras quebradas em botões lado a lado | Ações empilhadas até 360px de contêiner | Preservar leitura e alvo; horizontal explícito permanece |
| DecisionDeck / fotos | Captura antecipada do ponteiro impedia cliques; setas de teclado também decidiam | Botões internos preservados, galeria consome suas teclas | Foto e decisão são ações distintas |
| DecisionDeck / gesto | Cancelamento podia decidir; pouca indicação de gesto/evento | Captura apenas após intenção horizontal, cancelamento sem decisão, direção visível, transição, evento e reinício | Comportamento compreensível e verificável |
| Sidebar compacta | Expandir sempre visível | Marca quadrada; expandir somente em hover/foco | Comportamento solicitado, mesmo alvo/nome/dica |

## Conferência

Três conjuntos: Manrope/Source Sans 3/Source Code Pro, IBM Plex Sans/Mono e DM Sans/Geist Mono. Matriz em claro/escuro e 375/768/1280px sobre as 92 famílias e telas de Aplicação, Acesso e Setup. Listas e menus abertos, modal/drawer com menu interno, e abas do editor também são exercitados.

A auditoria automática mede fontes locais carregadas, famílias computadas e retângulos de texto. Elipses, truncamento explícito por line-clamp, rolagem local e conteúdo oculto acessível são intencionais. GoogleButton mantém a fonte própria do provedor e oferece auth-control-font; a interface neutra do editor mantém sua própria família. Isso não é uma comparação pixel a pixel contra Figma nem cobre cada conteúdo/estado possível de uma aplicação real. Menu nativo do sistema operacional e roteiro de leitor de tela não foram homologados.

## Revisar diretamente

- [Playground](http://localhost:6006/?path=/story/fundamentos-playground--aplicacao)
- [DecisionDeck](http://localhost:6006/?path=/story/components-organisms-swipedeck--gesto)
- [IntentComposer](http://localhost:6006/?path=/story/components-organisms-intentcomposer--idle)
- [Sidebar compacta](http://localhost:6006/?path=/story/components-organisms-sidebar--compacta)
- [PhoneInput](http://localhost:6006/?path=/story/components-molecules-phoneinput--padrao)
- [PostalCodeInput](http://localhost:6006/?path=/story/components-molecules-postalcodeinput--padrao)

Os testes de fontes independem da personalização local do navegador.
