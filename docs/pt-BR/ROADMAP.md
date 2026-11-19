# Roadmap

[English](../../ROADMAP.md) · [Español](../es/ROADMAP.md)

Para onde o projeto está indo. Os itens não têm data; cada um sai numa minor quando fica pronto, e o CHANGELOG registra. Para sugerir um item, abra uma issue.

- **Catálogo A2UI**: cobrir todos os componentes do catálogo básico do A2UI com componentes do refy, na web e no React Native, para um agente usar o refy onde usa o catálogo básico.
- **Paridade web e celular**: as mesmas props e o mesmo comportamento no `@refy-design/web` e no `@refy-design/mobile`, família por família. A paridade atual está no catálogo para agentes (campo `mobile` de cada família).
- **Maturidade**: avaliar cada família de componentes como experimental, estável ou obsoleta, conforme o [docs/QUALITY.md](../QUALITY.md).
- **Testes de interação**: testes de clique, teclado e digitação em todas as famílias. A cobertura atual está em [docs/INTERACTION_COVERAGE.md](../INTERACTION_COVERAGE.md).
- **Temas**: mais temas de partida e uma extração de tema melhor a partir de um site existente.
- **Desempenho**: primeira carga menor nos pacotes e no site.
- **Kit para agentes**: mais conferências no `refy_validate` e respostas melhores no `refy_search`.
