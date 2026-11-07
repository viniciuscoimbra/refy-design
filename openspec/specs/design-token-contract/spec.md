# design-token-contract

## Purpose

Definir o contrato implementado de tokens e temas do Refy, preservando compatibilidade, isolamento entre identidades e verificações de comportamento e adaptação.

## Requirements

### Requirement: TOK-01 — Resolução de tokens obrigatórios

Todo token obrigatório consumido SHALL resolver a um valor válido em cada tema suportado, sem aliases circulares; variáveis opcionais SHALL ter fallback e contrato documentados.

#### Scenario: TOK-01 resultado esperado
- **WHEN** Button é avaliado em repouso, hover e active nos três temas
- **THEN** --on-primary, --primary-container e --on-primary-container resolvem corretamente.

#### Scenario: TOK-01 falha ou limite
- **WHEN** um token obrigatório falta ou há um ciclo
- **THEN** a verificação falha com tema, token e consumidor identificados.

### Requirement: TOK-02 — Fonte estruturada e saída determinística

Os tokens SHALL ter uma fonte estruturada validada conforme o escopo adotado do formato DTCG 2025.10, e o CSS publicado SHALL ser uma saída determinística dessa fonte.

#### Scenario: TOK-02 resultado esperado
- **WHEN** o mesmo conjunto de tokens é gerado duas vezes
- **THEN** as saídas são idênticas e os exports de CSS continuam resolvendo.

#### Scenario: TOK-02 falha ou limite
- **WHEN** o CSS gerado diverge da fonte ou um tipo de token é inválido
- **THEN** o gate falha e aponta a divergência.

### Requirement: TOK-03 — Semântica e migração

Cada token público SHALL declarar finalidade, temas, origem e estado de depreciação; alterações incompatíveis SHALL ter decisão e migração registradas.

#### Scenario: TOK-03 resultado esperado
- **WHEN** um nome público muda
- **THEN** o de–para apresenta substituto, compatibilidade e prazo de remoção aplicável.

#### Scenario: TOK-03 falha ou limite
- **WHEN** um literal de cor ou métrica compartilhada é introduzido sem token ou exceção justificada
- **THEN** a revisão pede correção antes de aceitar.
