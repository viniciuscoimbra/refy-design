# Referências de regressão visual

Escopo: três temas, base com estados de Button/aviso e composições Modal/Drawer
com campos, Menu, Tooltip e aviso acionável. Tamanhos CSS: 375x812 e 1280x900.
São fixtures sintéticas de colisão, não páginas nem identidade dos consumidores.
Movimento reduzido é aplicado antes da montagem; animações são desativadas na captura.

| Ambiente | Engine/build | Referências | Revisão inicial |
|---|---|---|---|
| macOS 27.0.1 | Chromium 156.0.8078.4 / Playwright 1248 | 18 | Codex, 22/10/2026 |
| macOS 27.0.1 | WebKit 27.2 / Playwright 2370 | 18 | Codex, 22/10/2026 |
| Ubuntu 24.04 | Chromium 156.0.8078.4 / Playwright 1248 | 18 | Codex, 22/10/2026 |
| Ubuntu 24.04 | Firefox 157.0 / Playwright 1555 | 18 | Codex, 22/10/2026 |
| Ubuntu 24.04 | WebKit 27.2 / Playwright 2370 | 18 | Codex, 22/10/2026 |

Framework fixado: @playwright/test 1.64.1. DPR de Chrome/Firefox=1, WebKit=2,
conforme os perfis Desktop do Playwright. Os nomes de arquivo incluem engine e
plataforma; não renomear imagens de uma plataforma para fingir cobertura de outra.
Fontes locais/fallbacks podem diferir entre plataformas. Blur do fundo é decorativo;
leitura, geometria e ações são conferidas separadamente por interação/axe/contraste.

As 90 referências foram inspecionadas pelo agente em folhas por engine/tema,
incluindo os seis estados/tamanhos de cada folha. As capturas Linux vieram do
artefato browser-evidence de uma execução de CI no repositório de trabalho.
Essa execução inicialmente falhou: 36 casos sem referência Linux, uma carga inicial
lenta e uma falha de foco. Nenhuma falha foi aceita como aprovação de comportamento;
as duas causas foram tratadas. As capturas só foram copiadas
para a base após revisão visual, preservando as referências existentes do Mac.

A execução final do código no CI passou 288 testes nas três engines Linux, incluindo comparação das referências
sem atualizá-las. A suíte local atual passou 192 testes em Chromium/WebKit.

## Processo de atualização

`npm run test:browser` compara imagens em tests/visual.spec.ts-snapshots.
O CI compila o Storybook e serve o resultado estático, sem compilação dinâmica
na primeira carga dos testes. Não usa --update-snapshots em execuções normais.
Artefatos incluem resultado, trace, imagem esperada/atual/diff quando aplicável.

Quando houver mudança intencional: registrar motivo, inspecionar diff e interface,
validar comportamento e só então gerar referências no ambiente correspondente.
Não atualizar imagens apenas para apagar uma falha. Ajustar a captura para um
estado determinístico não dispensa revisar a diferença nem relaxar tolerância.

A comparação visual não prova anúncio de leitor de tela, semântica ou homologação
de uma aplicação. CORE-03/OVL-03 continuam sujeitos ao roteiro assistivo real.
