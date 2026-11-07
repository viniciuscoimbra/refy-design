# component-lifecycle

## Purpose

Definir o contrato implementado de governança e maturidade da biblioteca Refy, com rastreabilidade, responsabilidade e evidência verificáveis.

## Requirements

### Requirement: LIFE-01 — Responsabilidade e maturidade separadas

Cada família SHALL ter camada Atomic Design, finalidade, responsável e maturidade registrada separadamente; páginas de produto SHALL permanecer composições.

#### Scenario: LIFE-01 resultado esperado
- **WHEN** um organismo é proposto
- **THEN** o inventário identifica uma responsabilidade reutilizável independente de uma página inteira.

#### Scenario: LIFE-01 falha ou limite
- **WHEN** uma página completa é apenas renomeada como organismo
- **THEN** a classificação é recusada até sua decomposição justificada.

### Requirement: LIFE-02 — Promoção por evidência

A promoção a estável SHALL exigir contrato, documentação, testes aplicáveis, validação visual e de acessibilidade e compatibilidade registradas; contagem de stories não é evidência suficiente.

#### Scenario: LIFE-02 resultado esperado
- **WHEN** todos os critérios aplicáveis passam
- **THEN** a promoção registra versão, revisão e resultados.

#### Scenario: LIFE-02 falha ou limite
- **WHEN** falta teste ou validação manual necessária
- **THEN** o componente permanece não avaliado ou experimental, com a lacuna explícita.
