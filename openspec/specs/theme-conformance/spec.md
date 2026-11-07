# theme-conformance

## Purpose

Definir o contrato implementado de tokens e temas do Refy, preservando compatibilidade, isolamento entre identidades e verificações de comportamento e adaptação.

## Requirements

### Requirement: THM-01 — Temas completos e previsíveis

Os modos light, dark e editorial SHALL cumprir o mesmo contrato semântico; a ausência de configuração de identidade e modo SHALL produzir o tema claro proposto do Refy, e uma troca de tema não pode alterar o estado de interação.

#### Scenario: THM-01 resultado esperado
- **WHEN** um tema muda com um campo preenchido e menu aberto
- **THEN** valores e estado são preservados e a aparência acompanha o tema.

#### Scenario: THM-01 falha ou limite
- **WHEN** um papel necessário só existe no escuro ou o tema padrão difere do claro
- **THEN** a verificação de contrato falha.

### Requirement: THM-02 — Contraste e foco medidos

Texto, controles, estados e foco SHALL ter os critérios WCAG 2.2 AA aplicáveis identificados e resultados medidos nos contextos de uso, sem declarar conformidade por mera presença de ARIA.

#### Scenario: THM-02 resultado esperado
- **WHEN** pares e estados aplicáveis passam nas medições e revisões
- **THEN** o relatório registra tema, contexto, resultado e critério.

#### Scenario: THM-02 falha ou limite
- **WHEN** texto ou foco falha no critério aplicável
- **THEN** o tema/componente não recebe aprovação até correção e nova evidência.

### Requirement: THM-03 — Movimento fontes e adaptação

A fundação SHALL documentar fontes e fallbacks, respeitar movimento reduzido e preservar leitura e ações nos cenários de reflow, ampliação e cores forçadas aplicáveis.

#### Scenario: THM-03 resultado esperado
- **WHEN** fontes externas são bloqueadas ou movimento reduzido está ativo
- **THEN** o conteúdo permanece utilizável e animações dispensáveis são reduzidas.

#### Scenario: THM-03 falha ou limite
- **WHEN** reflow em 320 CSS px, texto ampliado a 200% ou cores forçadas oculta ação ou foco
- **THEN** há falha registrada, com exceções legítimas de conteúdo bidimensional identificadas.
