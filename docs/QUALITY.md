# Qualidade e manutenção

## Responsabilidade e maturidade

Cada família registra finalidade, responsável, camada, maturidade e evidências.
O mantenedor inicial é Vinícius Coimbra; uma tarefa/PR pode designar outro responsável.
Átomo é uma unidade de interface, molécula combina unidades em uma tarefa curta,
organismo tem responsabilidade reutilizável composta. Uma página de negócio usa
essas peças e continua sendo página. A camada não determina maturidade.

| Estado | Critério |
|---|---|
| Não avaliado | Código existente sem verificação suficiente; estado inicial do catálogo |
| Experimental | Contrato/proposta explícitos; lacunas e riscos visíveis |
| Estável | API, documentação, testes de estados e interação, revisão visual, acessibilidade e compatibilidade aplicáveis aprovados e vinculados a uma versão |
| Depreciado | Alternativa, migração, consumidores e condição/versão de remoção documentados |

Build e stories são verificações parciais. Estável exige evidências dos cenários
aplicáveis; critérios não aplicáveis precisam de justificativa. Sem validação manual
necessária, mantenha experimental/não avaliado. Retire alegações sem sustentação.

## Evidência por tarefa

No `evidence.md` da mudança, registre:

- requisito e tarefa; baseline/versões e arquivos afetados;
- autorização humana aplicável e limites;
- comando ou procedimento, resultado observado, limitações e evidência;
- autor/revisor, data e commit/PR; decisão do gate.

Exemplo ilustrativo, **não é execução**: `TOK-01 / 2.3; node check-tokens;
aliases válidos aceitos e fixture com token ausente recusada; responsável:
contribuidor do PR; revisão no PR correspondente`. Uma captura isolada não prova
interação nem revisão visual. Um teste não executado não permite marcar a tarefa.

## Exceções

Registro mínimo: escopo/requisito, motivo e risco, responsável, prazo de revisão,
condição de encerramento, impacto nas alegações e decisão. Uma exceção vencida
mantém o gate aberto. Nunca substitui critério necessário para alegar conformidade.

Exemplo ilustrativo, **não é exceção aceita**: `CORE-03; sem máquina Windows;
risco: anúncio NVDA não verificado; responsável: mantenedor; revisar até
2026-11-04; encerrar com execução NVDA/Chrome; componente continua experimental`.

## Ensaio de revisão da governança

Em 21/10/2026, revisão do agente Codex, sem revisão independente:

| Caso sintético | Decisão e razão |
|---|---|
| Correção de alias, mudança autorizada, teste positivo/negativo executado e de–para | Aceitável para o escopo comprovado; não promove toda a família |
| Mesmos artefatos, sem autorização humana | Recusar início da implementação |
| Nova família que apenas renomeia Button | Recusar; usar variante/composição existente |
| Página inteira classificada como organismo | Recusar; decompor responsabilidades reutilizáveis |
| Pedido de estabilidade com build, sem teste manual necessário | Recusar promoção; registrar lacuna |
| Exceção vencida ou usada para alegar WCAG | Manter gate aberto e retirar alegação |

Esses ensaios verificam as regras do processo; não são testes de acessibilidade ou
homologação de componentes. O CI valida a estrutura OpenSpec e verifica que uma
spec inválida é recusada. A revisão substantiva continua necessária.
