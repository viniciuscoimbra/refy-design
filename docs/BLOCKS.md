# Templates (Blocks) do Refy

[De–para da revisão visual e controles](CHART_VISUAL_LANGUAGE.md).

Blocks são composições editáveis de componentes. Não são uma nova camada de organismos. No site, o catálogo aparece como **Templates**; no Playground legado, como **Blocks**. Ambos usam o mesmo registro e os mesmos IDs. O fluxo de personalização está em [Criar com Refy](CREATION_PLAYGROUND.md). O catálogo segue a organização de referência de [shadcn/blocks](https://ui.shadcn.com/blocks), usando a identidade e os componentes do Refy.

## Escolher e experimentar

As categorias reúnem variantes com IDs próprios:

| Categoria | Variantes |
| --- | --- |
| Painéis | `dashboard-01`, `charts-01` |
| Navegação | `sidebar-01`, `sidebar-02` |
| Acesso | `login-01`, `login-02`, `signup-01`, `signup-02`, `recover-01`, `verify-01` |
| Configuração | `setup-01`, `settings-01` |
| Conteúdo | `library-01`, `article-01` |

A lista lateral agrupa as variantes por categoria. Cada template tem Prévia/Código, arquivos, composição e controles próprios. Desktop usa a área disponível; Tablet limita a largura a 768 px; Celular limita a 375 px. A largura real aparece abaixo da prévia. Em telas menores ou com o editor aberto ela pode ser menor, sem simulação por escala.

O viewport é um documento HTML/React local independente, sem carregar outro Storybook. Media queries, menus, modais, drawers, foco e rolagem pertencem a esse documento. Tema, modo e personalização chegam do Playground, sem redefinir o estado da interação. Reiniciar redefine somente aquela prévia. Trocar entre Prévia e Código ou sair da categoria desmonta o exemplo e reinicia seu estado ao retornar.

## Usar no projeto

1. No repositório local do Refy, execute `npm pack` para gerar o pacote. Isso não publica nada.
2. Instale o arquivo gerado na aplicação: `npm install /caminho/refy-design-web-1.0.0.tgz`.
3. Importe uma vez `@refy-design/web/tokens.css`; o CSS dos componentes é carregado automaticamente pelo bundler. Use `global.css` se desejar o reset e `fonts.css` se usar as fontes fornecidas.
4. Na aba Código, copie **todos** os arquivos da variante para a mesma pasta. Use `page.tsx` como entrada ou importe sua composição no roteador da aplicação. CSS Modules precisa estar habilitado, como no Vite/Next.
5. Para herdar um tema próprio, coloque a página dentro do `ThemeProvider` da aplicação. Consulte [THEMING.md](THEMING.md).

Os arquivos exibidos são as fontes executadas pela prévia. O registro gera a entrada com as mesmas props da variação e converte apenas o import interno da biblioteca para `@refy-design/web`. Não há CLI de registry ou comando remoto fictício. Os arquivos de navegação/acesso/artigo do catálogo são receitas copiáveis; não se presume que cada composição seja uma nova exportação do pacote.

## Interações e limites

- Acesso valida dados fictícios e demonstra recuperação/OTP. Use `123456`. Não envia e-mail, autentica ou modifica senha real.
- Projetos, preferências e materiais ficam na sessão da prévia. Integração com backend e regras de domínio pertencem ao consumidor.
- `AccessBlock.initialScreen` escolhe apenas o estado inicial. `screen` e `onScreenChange` continuam disponíveis para controle externo; o default segue login.
- `BlogBlock` mantém o nome público e a chamada sem props, mas agora compõe `TextArticleBlock` com Lorem ipsum. O conteúdo autoral e as imagens antigas não fazem parte do candidato. O catálogo usa a mesma composição neutra. O destino Tipografia também usa texto fictício.

Automação e revisão visual do agente não substituem a aprovação estética do mantenedor. Leitor de tela manual continua adiado.

## Navegação atual — 30/10/2026
A lista à esquerda agrupa as 14 variantes por categoria e permite busca. Apenas uma composição é montada por vez. No celular, o seletor Template (ou Block na entrada legada) substitui a lista. Prévia Desktop/Tablet/Celular, expansão, reinício e arquivos reais são preservados. login-02 demonstra Google, GitHub e Apple por OAuthButton; os demais provedores estão documentados em Componentes/Moléculas/OAuthButton.
