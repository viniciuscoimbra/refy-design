# Auditoria do CSS seletivo — 24/10/2026

Revisão técnica do agente sobre o pacote compilado instalado fora do workspace. Não substitui aprovação estética humana ou certificação de acessibilidade.

## Cobertura

Um exemplo público por família, gerado das fontes de documentação: 116 famílias, claro/escuro, Chromium/WebKit (464 combinações). Cada navegação importa a família dinamicamente, sem styles.css agregado. Classes CSS Modules renderizadas e propriedades computadas são comparadas com a folha completa. A referência é acrescentada somente no ensaio e removida antes da próxima interação, nunca como correção de produto.

O ensaio inicial encontrou zero classes ausentes, mas diferenças de cascata entre CSS seletivo e agregado. Após as correções, nenhuma classe esperada ficou sem seletor e não restaram diferenças nas propriedades/estados estáveis comparados. Hover/foco que realmente mudam entre snapshots são registrados separadamente, para não comparar estados diferentes como se fossem iguais.

Também foram abertos menus, menu de contexto, listas pesquisáveis, tooltip/hover card, notificações, modais e drawers. Menubar/NavigationMenu receberam rodada adicional, assim como AspectRatio/Marker/ScrollArea: estes três usam estilos inline e não possuem CSS Modules próprios.

## De–para das correções

| Antes | Depois | Por quê |
|---|---|---|
| ActivityItem podia perder fundo tonal e espaçamento para Card/padding=none na folha completa | A variante feed qualifica a raiz do ActivityItem | ActivityItem compõe Card, mas sua variante precisa prevalecer sem depender da ordem do CSS |
| Ação do CodeBlock podia herdar a cor genérica do IconButton | Ações são contextualizadas pelo grupo do CodeBlock, inclusive hover/copiado/foco | Preserva os tokens de código sem refazer o botão; Trace recebe a mesma correção por composição |
| IntentComposer podia receber o gap padrão do Textarea | O seletor da composição contextualiza o Textarea na raiz do Composer | Preserva o espaçamento específico usando o átomo existente |
| Foco genérico scoped/global podia competir com controles que desenham a moldura externamente | Regras genéricas de foco têm especificidade zero | Funcionam como fallback; InputControl não ganha um segundo contorno e a superfície do campo mantém o foco próprio |

Nenhuma API, identidade, cor de marca ou componente foi substituído. Não foi acrescentada uma folha completa para mascarar estilos ausentes. Os caminhos seletivo e legado continuam disponíveis.

## Verificação de camadas

Consumidores React 18/19 instalados por tarball: menu e Combobox dentro de Modal/Drawer, claro/escuro/sistema, fundo esperado por modo, fontes, alcance por ponteiro, Escape e devolução de foco. Teste específico confere InputControl sem outline interno e superfície com outline sólido. CSS tardio e código/gráficos continuam cobertos pela regressão de consumo.

## Reproduzir

```bash
node scripts/prepare-css-catalog.mjs /caminho/refy-design-web-1.0.0.tgz /tmp/refy-catalog-new
# No consumidor gerado:
npx vite preview --host 127.0.0.1 --port 6190 --strictPort
# Na raiz Refy:
REFY_CSS_CATALOG_URL=http://127.0.0.1:6190 npx playwright test tests/consumer-css-catalog.spec.ts --project=chromium --project=webkit --workers=2
```

Os relatórios css-catalog.json identificam família, exemplo e modo. REFY_CSS_FAMILIES permite investigação pontual; a rodada integral usa as 116 famílias sem filtro. O verificador de pacote e os testes consumer-overlays/consumer-package-features fazem a regressão das camadas e do reset opcional.

## Limites

A comparação cobre exemplos representativos e propriedades selecionadas, não todas as props, estados, fontes, breakpoints ou animações possíveis. Movimento foi reduzido para comparar CSS estável. O seletor nativo de opções é pintado pelo navegador/SO; a aparência dessa janela não é uma camada DOM comparável. Safari real, telefone físico, leitores de tela e outras aplicações/bundlers não são homologados por este ensaio. Nenhuma publicação foi executada.
