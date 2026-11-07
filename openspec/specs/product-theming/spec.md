# product-theming

## Purpose

Definir o contrato implementado de tokens e temas do Refy, preservando compatibilidade, isolamento entre identidades e verificações de comportamento e adaptação.

## Requirements

### Requirement: BRAND-01 — Identidade independente de modo

O Refy SHALL permitir instâncias com identidades de produto e modos independentes, preservando defaults documentados e resolvendo todos os tokens obrigatórios; identidade não é sinônimo de light/dark/editorial.

#### Scenario: BRAND-01 resultado esperado
- **WHEN** o mesmo componente recebe duas identidades e seus modos suportados
- **THEN** cores, tipografia e demais valores configurados são resolvidos conforme cada combinação, sem copiar a implementação.

#### Scenario: BRAND-01 falha ou limite
- **WHEN** um preset não resolve um token obrigatório ou um produto exige modo não validado
- **THEN** a validação identifica produto, modo e token; o preset não é publicado como compatível.

### Requirement: BRAND-02 — Customização visual com contrato estável

Os componentes SHALL expor os ajustes visuais necessários aos consumidores por tokens públicos ou props/slots documentados, preservando defaults, API funcional, foco, teclado e semântica. A superfície inclui tipografia, dimensões/densidade, espaçamento, raios, bordas, sombras e quebra de texto conforme necessidade inventariada; assets de marca pertencem ao consumidor.

#### Scenario: BRAND-02 resultado esperado
- **WHEN** Button, Input e Card são adaptados para identidades com fontes, densidade e raios diferentes
- **THEN** o mesmo código produz a aparência configurada e mantém eventos, validação, conteúdo e acessibilidade; composição permite fornecer marca sem enum privado no núcleo.

#### Scenario: BRAND-02 falha ou limite
- **WHEN** uma adaptação depende de patch em node_modules, seletor interno CSS Modules ou cópia do componente
- **THEN** a integração não atende ao contrato e a lacuna recebe de–para e solução pública ou extensão aprovada; diferenças funcionais são avaliadas separadamente.

### Requirement: BRAND-03 — Isolamento de instâncias e camadas

Instâncias SHALL manter identidade e modo isolados, inclusive em escopos aninhados e superfícies em portais, sem vazamento de reset/tokens ao host nem perda de estado ao trocar tema.

#### Scenario: BRAND-03 resultado esperado
- **WHEN** duas instâncias e um escopo aninhado abrem menus, tooltips e avisos dentro de Modal e Drawer e uma troca de tema ocorre com formulário preenchido
- **THEN** cada camada conserva a identidade do dono, prioridade e foco corretos; valores do formulário e a aparência da outra instância permanecem.

#### Scenario: BRAND-03 falha ou limite
- **WHEN** um portal herda o tema global errado ou estilos de uma instância alteram outra ou o host
- **THEN** o teste de isolamento falha e bloqueia a declaração de suporte dessa composição.
