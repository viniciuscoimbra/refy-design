# change-governance

## Purpose

Definir o contrato implementado de governança e maturidade da biblioteca Refy, com rastreabilidade, responsabilidade e evidência verificáveis.

## Requirements

### Requirement: GOV-01 — Rastreabilidade de mudança

Uma mudança de comportamento, API, tokens ou publicação SHALL ter proposal, design, specs e tasks completos, escopo revisado e autorização de execução identificada antes da implementação.

#### Scenario: GOV-01 resultado esperado
- **WHEN** uma implementação é iniciada
- **THEN** a revisão aponta mudança, requisitos, autorização aplicável e limites de arquivos.

#### Scenario: GOV-01 falha ou limite
- **WHEN** só há artefatos completos, sem autorização de execução
- **THEN** o estado continua planejamento e não autoriza modificar a biblioteca.

### Requirement: GOV-02 — Evidência de conclusão

Cada tarefa concluída SHALL registrar comando ou procedimento executado, resultado observado e referência à evidência no commit ou revisão correspondente.

#### Scenario: GOV-02 resultado esperado
- **WHEN** um teste passa e o aceite é atendido
- **THEN** a tarefa pode ser marcada com a referência do resultado.

#### Scenario: GOV-02 falha ou limite
- **WHEN** há apenas plano, screenshot isolado ou teste não executado
- **THEN** a tarefa continua desmarcada; justificativa não substitui resultado.

### Requirement: GOV-03 — Critério para contribuição

Uma proposta de componente SHALL demonstrar necessidade, responsabilidade reutilizável, alternativas existentes, responsável e impacto de compatibilidade.

#### Scenario: GOV-03 resultado esperado
- **WHEN** uma necessidade se resolve compondo componentes existentes
- **THEN** a proposta documenta a composição antes de criar uma família.

#### Scenario: GOV-03 falha ou limite
- **WHEN** a proposta duplica API existente sem vantagem demonstrada
- **THEN** não é aceita como nova família.

### Requirement: GOV-04 — Exceções rastreáveis

Uma exceção de qualidade SHALL registrar escopo, risco, responsável, prazo de revisão e condição de encerramento; não pode substituir uma obrigação necessária para declarar conformidade.

#### Scenario: GOV-04 resultado esperado
- **WHEN** um risco temporário é aceito
- **THEN** a decisão é visível e tem responsável e prazo.

#### Scenario: GOV-04 falha ou limite
- **WHEN** a exceção vence ou compromete uma alegação de acessibilidade
- **THEN** o gate afetado permanece aberto e a alegação é retirada.
