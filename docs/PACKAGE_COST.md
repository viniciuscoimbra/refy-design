# Custo do pacote — medição local

O Refy busca baixo custo, mas tamanho instalado, JS transferido e CSS são medidas diferentes. Medição em 24/10/2026: Node 22.22.3, Vite 6.4.5, React/DOM 19.2.4, máquina local macOS. gzip usa node:zlib por arquivo. Tempos incluem TypeScript + Vite, não são benchmark universal; instalação pode usar cache npm.

## Diagnóstico e correção

A distribuição anterior tinha um único JS. Button/Input retinham D3 (87 módulos) e Prism embutido, mesmo sem usar gráficos ou código. Passar o build da biblioteca não detectava essa retenção. A distribuição agora preserva módulos ESM e externaliza Prism como as demais dependências; o bundler da aplicação elimina os módulos não usados. Imports públicos e styles.css permanecem compatíveis.

Comparação inicial do mesmo consumidor mínimo, sem fontes/reset:

| Tela | Antes, JS gzip | Depois, JS gzip |
|---|---:|---:|
| React/DOM sem Refy | 60.779 bytes | 60.779 bytes |
| Button + Input | 104.467 bytes | 62.173 bytes |

O acréscimo medido dos controles cai de 43.688 para 1.394 bytes gzip; o custo total da tela inclui React/DOM. Não extrapolar esse número para o catálogo inteiro ou outros bundlers. O relatório final do candidato acompanha esta preparação.

## Limites que continuam

- O import legado styles.css continua incluindo regras do catálogo inteiro. No caminho automático browser, CSS acompanha os módulos usados; remova o import agregado para obter a redução.
- Instalar o pacote baixa também módulos D3, Prism, tipos e arquivos de fontes. Tree-shaking reduz o bundle final, não o conjunto instalado por npm.
- fonts.css é opcional. As fontes são locais; o navegador solicita apenas faces efetivamente usadas. O custo dos arquivos instalados é diferente do custo da página.
- D3Chart fornece todas as famílias pelo mesmo componente; sua escolha de type em runtime não elimina automaticamente todas as outras famílias do componente. Charts são um custo opt-in no JS, mas não cada engine individualmente.
- Preservar módulos reduziu o JS final, mas aumentou os módulos processados pelo Vite neste ensaio (604 para 869 nos controles). Os tempos observados foram próximos; não comprovam compilação mais rápida.
- A medição não mede FPS, latência de interação, SSR completo, navegação real nem compilação em hardware do usuário.

## Reproduzir

```bash
npm run check
mkdir -p /tmp/refy-candidate
npm pack --pack-destination /tmp/refy-candidate
node scripts/verify-local-package.mjs /tmp/refy-candidate/refy-design-web-1.1.0.tgz /tmp/refy-cost-new
```

report.json separa React, controles, D3, CodeBlock e starter com fixtures completas, com tamanhos raw/gzip, módulos renderizados e tempo. O verificador falha se Button/Input retiverem módulos D3/Prism. O mesmo teste recusou a distribuição antiga. Não há orçamento numérico de performance aprovado pelo mantenedor; estes resultados são a referência para sua revisão.

## Rodada anterior: JS modular com CSS ainda agregado

| Consumidor | JS gzip (bytes) | CSS gzip (bytes) | Fontes emitidas raw (bytes) | tsc + Vite (ms) |
|---|---:|---:|---:|---:|
| react | 60.779 | 0 | 0 | 975 |
| controls | 62.173 | 43.173 | 0 | 1367 |
| chart | 139.579 | 43.173 | 0 | 1637 |
| code | 73.926 | 43.173 | 0 | 1398 |
| starter | 169.435 | 43.999 | 318.012 | 1695 |

`starter` nesta rodada inclui fixtures de overlays, troca de identidade, D3, CodeBlock e artigo neutro; não representa o custo do starter simples. Fontes emitidas são arquivos disponíveis no build, não necessariamente todos solicitados na primeira tela. O build da biblioteca exclui capturas de QA de public/review; o catálogo estático continua tendo seus próprios assets, separados do pacote de componentes.

## Instalação da rodada anterior

Após remover capturas de QA e o artigo legado da distribuição, o tarball fica em aproximadamente **980 KB**, com aproximadamente **3 MB descompactados**, incluindo tipos, mapas de fonte, guias e 363 KB de fontes. O candidato anterior levava capturas em dist/review e ultrapassava 7 MB. As dependências instaladas pelo npm são adicionais a esses números. Arquivos e SHA-256 exatos ficam no recibo externo do candidato, para não criar referência circular dentro do próprio pacote.

## Rodada atual: CSS seletivo automático

No mesmo cenário mínimo React 19/Vite, tokens + Button/Input passam de aproximadamente **43,2 KB para 6,6 KB gzip de CSS** (redução de ~85%). O JS continua 62.173 bytes gzip incluindo React, com delta Refy de 1.394 bytes. O teste exige regras reais de Button/Input presentes e regras de CodeBlock/Charts/Kanban ausentes — receber somente tokens não conta como otimização bem-sucedida.

| Variante | CSS gzip observado (bytes) |
|---|---:|
| Controles, automático | 6.600 |
| Controles, import legado agregado | 43.558 |
| D3Chart | 10.048 |
| CodeBlock | 5.779 |
| Starter com overlays/charts/código | 17.486 |

O teste de import dinâmico exige ausência de estilos de CodeBlock no início e presença após carregá-lo. Isso não promete eliminar cada regra não usada dentro de um mesmo componente, nem todos os engines de D3Chart: a unidade de divisão é o módulo CSS, não cada seletor/prop.

A edição Node sem imports CSS mantém SSR nativo compatível; sua cópia dos módulos aumenta o pacote instalado em comparação aos ~980 KB da rodada anterior. Só uma edição é resolvida por ambiente. O browser não recebe duas implementações. Tempos de compilação continuam observações locais, não uma promessa de ganho universal.

O candidato com CSS seletivo e fallback Node fica em aproximadamente **1,1 MB compactado / 4,9 MB descompactados**. Essa instalação é maior que os 980 KB anteriores; a transferência de CSS da tela mínima é menor. Medidas e checksum exatos acompanham o novo candidato.

## Adoção ponta a ponta — 25/10/2026

Nova medição React 19.2.4 / Node 22.22.3 / Vite 6.4.5, build de produção. React/DOM mínimo: 60.779 bytes gzip de JS; Button/Input: 62.173 bytes (delta Refy de 1.394 bytes), CSS 6.896 bytes gzip contra 43.719 no import legado agregado. D3Chart: 139.604 bytes de JS / 10.356 de CSS gzip; CodeBlock: 73.924 / 6.077; starter de teste ampliado com overlays, fontes, Block copiado e charts: 174.541 / 20.428. O starter ampliado não representa uma tela mínima.

Nenhum módulo D3/Prism foi retido na variante Button/Input. Uma primeira medição desta rodada foi descartada porque o carregamento do validador pelo Vite deixava NODE_ENV de desenvolvimento ativo no verificador; o ambiente agora é restaurado, e a medição recusa módulos React de desenvolvimento. Não confundir essa falha do verificador com custo do pacote. Valores exatos do tarball e relatório acompanham o recibo externo; não se grava checksum circular no próprio pacote.
