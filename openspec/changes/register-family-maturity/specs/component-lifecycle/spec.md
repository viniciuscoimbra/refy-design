## ADDED Requirements

### Requirement: LIFE-03 — Maturidade registrada e verificável no catálogo

O catálogo SHALL publicar, para cada família, um dos quatro estados de maturidade do QUALITY.md, lido de um registro versionado em que família ausente está em não avaliado; o registro MUST recusar estado acima de não avaliado sem a evidência exigida pelo estado.

#### Scenario: LIFE-03 resultado esperado
- **WHEN** o catálogo de agentes é gerado com o registro sem entradas
- **THEN** cada uma das famílias aparece com `maturity: nao-avaliado` e o catálogo lista os quatro estados com os critérios do QUALITY.md.

#### Scenario: LIFE-03 promoção com evidência
- **WHEN** uma família é registrada como estável com versão e evidência
- **THEN** o catálogo gerado mostra essa família como estável e as demais seguem no padrão.

#### Scenario: LIFE-03 falha ou limite
- **WHEN** uma família é registrada como estável sem evidência, com estado desconhecido, com campo extra ou com nome que não existe no catálogo
- **THEN** a geração e o check falham com a família e o motivo, e nenhum catálogo é escrito.
