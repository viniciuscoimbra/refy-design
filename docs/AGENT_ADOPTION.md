# Refy para agentes: adoção local verificável

O kit oferece conhecimento versionado e verificações objetivas para agentes que transformam telas React em composições Refy. É ferramenta de desenvolvimento: não roda um modelo, não adiciona IA à aplicação, não usa rede/telemetria e não importa TypeScript no bundle da UI.

## Entrada para um agente

Peça: “Analise esta tela React e proponha sua transformação em Refy, preservando os fluxos”. O agente deve ler `@refy-design/web/ai/instructions.md`, consultar `@refy-design/web/ai/catalog.json` e recuperar somente as fichas necessárias. O catálogo contém taxonomia Atomic Design, finalidade, composição, links para documentos com API/exemplos reais, imports públicos e nomes de tokens. As fichas são geradas da mesma documentação que alimenta o Playground, sem reescrever manualmente as APIs. A busca também consulta os nomes da API de cada ficha: `catalog D3Chart` encontra Charts, e `component CardHeader` retorna Card com a identificação do membro solicitado. Membros secundários são informações documentadas, sem promessa implícita de export de execução; nomes ambíguos pedem o identificador da família.

A busca também incorpora a orientação de `CONTROL_CHOICES`: ação usa Menu, valor simples Select, busca Combobox, múltiplos valores Multiselect, decisão modal Modal e tarefa contextual Drawer. Isso orienta escolhas; não substitui a análise do fluxo existente.

## Uso em um projeto instalado

Instale @refy-design/web como descrito no [README](../README.md#usar-em-um-projeto-novo). Dentro do consumidor:

```bash
npm install --save-dev typescript
npm exec --offline -- refy-agent catalog Combobox
npm exec --offline -- refy-agent component Input
npm exec --offline -- refy-agent inspect src/Tela.tsx src/tela.css
npm exec --offline -- refy-agent check src/Tela.tsx src/tela.css
```

`catalog` e `component` só exigem Node. `inspect`/`check` usam TypeScript do ambiente de desenvolvimento do consumidor para analisar AST. A ferramenta é somente leitura; recebe arquivos explícitos dentro do projeto, rejeita caminhos externos e extensões desconhecidas. Não é um crawler de todo o repositório e não resolve automaticamente CSS/imports transitivos. `inspect` informa achados sem exigir correção; `check` retorna exit 1 para achados de erro não justificados e exit 2 para configuração/entrada inválida.

O resultado JSON identifica arquivos analisados, imports Refy, regra, linha, coluna, mensagem e exceção aplicada. Integre o comando ao check/CI da aplicação conforme seu escopo. A ferramenta não altera AGENTS.md ou configurações do editor do usuário.

## Regras e alcance

| Regra | Verificação |
| --- | --- |
| raw-control | button/input/select/textarea/dialog e div/span com papéis interativos conhecidos em composição consumidora |
| internal-import | Subcaminho de @refy-design/web ausente do mapa de exports público do pacote |
| appearance-literal | Cores, fontes, raios, bordas/sombras e outros papéis de aparência literais em objetos style ou CSS; redefinição de tokens públicos na página |

Estrutura HTML, layout grid/flex, gaps com tokens e regras/eventos de negócio continuam permitidos. A regra de aparência aceita referências diretas `var(--token)` e valores neutros como inherit/none/transparent. Expressões CSS mais complexas podem requerer configuração de tema ou exceção explícita. CSS estrutural pode definir a largura da composição. Não aplique essas regras indiscriminadamente aos internals da biblioteca: átomos precisam implementar controles nativos.

Exceções ficam em `refy-agent.config.json`, por arquivo/regra exatos e com motivo concreto de pelo menos 12 caracteres. Sem curingas. Elas aparecem nos achados dispensados e permanecem revisáveis:

```json
{
  "version": 1,
  "exceptions": [
    {
      "file": "src/Mapa.tsx",
      "rule": "raw-control",
      "reason": "Controle intrínseco do SDK de mapa, com teste de teclado próprio."
    }
  ]
}
```

Não use uma exceção ampla para esconder uma migração incompleta. Um tema é um artefato separado de identidade; não espalhe suas definições nas páginas.

## Fluxo e de–para

1. Ler a implementação e navegar na tela original. Identificar estados, eventos, validações, permissões, dados e integrações.
2. Produzir de–para por elemento: atual → componente/composição Refy → mudança visual → comportamento preservado → lacuna → teste.
3. Escolher componentes por intenção e responsabilidade. Componentes genéricos vêm do DS; regras de negócio continuam na aplicação. Uma página não vira organismo inteiro.
4. Configurar o tema e usar a API pública. Quando faltar uma capacidade, registrar gap; propor composição local ou extensão genérica com justificativa, sem copiar internals para forçar aparência.
5. Executar checker, tipos, testes funcionais, navegador e comparação visual. Conferir estados de erro/loading/vazio, teclado/foco, textos longos, modo e responsividade, incluindo portais.
6. Apresentar alterações e evidências. A decisão de publicar, migrar sistemas ou aceitar diferenças permanece humana.

## Piloto incluído

`ai/pilot/Before.tsx`, `After.tsx` e `de-para.md` demonstram um cadastro neutro de pessoas: nome obrigatório com trim, inclusão e busca em tabela, edição em modal com validação/cancelamento e salvamento. A versão After compõe Button, Input, Card, Table e Modal, preservando negócio/estado local. A configuração de tema pertence ao consumidor, que envolve a composição em ThemeProvider.

Copie After.tsx como uma página da aplicação; não precisa copiar componentes do DS. O piloto registra que a gestão de foco/Escape do Modal melhora uma limitação do dialog original. Não há APIs externas, autenticação ou persistência.

O teste `tests/agent-kit-pilot.spec.ts` verifica o consumidor instalado em claro/escuro e 1280/390px. `REFY_AGENT_PILOT_URL` deve apontar para seu build local em agent-pilot.html; esse teste depende da preparação de consumidor do repositório e não é um resultado presumido.

## Atualizar o kit no repositório Refy

```bash
npm run docs:build
npm run agent:build
npm run agent:check
```

A verificação recusa catálogo/fichas/guia/piloto gerados obsoletos ou documentos excedentes. Novas famílias entram pela documentação/taxonomia existentes. Os assets AI são opt-in para ferramentas e não são importados pelo entrypoint React.

## Limites da garantia

O checker identifica sintaxe conhecida nos arquivos indicados. Não certifica CSS-in-JS arbitrário, spreads, funções dinâmicas, semântica de negócio, aparência ou toda reconstrução de um controle. Ele não valida que callbacks usam os serviços corretos, não prova permissões e não confere screenshots. Uma aprovação exige tipos e fluxos, comparação visual e revisão aplicável. Não há certificação WCAG/leitor de tela por consequência deste kit. MCP e conectores de modelos não foram necessários para este primeiro contrato local.

Variáveis de aparência fora do catálogo Refy são permitidas para tokens próprios do produto, mas geram achados `unverified-token` de severidade `warning`, sem bloquear o check. Cabe ao consumidor comprovar definição, escopo e valor computado. Esse aviso não comprova que a variável existe. Erros conhecidos usam severidade `error`; apenas estes, sem exceção válida, causam exit 1. Configuração por symlink é recusada antes da leitura.

Entradas TS/JS com erro sintático são recusadas antes da inspeção. Em CSS a checagem léxica recusa delimitadores/comentários/strings incompletos e declarações vazias; a gramática completa e a semântica CSS continuam responsabilidade do build/linter do projeto.


## Coleções de capacidades

`refy-agent collections` mostra Core e as coleções com contagens derivadas. `refy-agent collections geolocation` retorna as famílias existentes da coleção; `refy-agent catalog música` também pesquisa rótulos e palavras de capacidade. Cada ficha e entrada do catálogo inclui `collections`, preservando IDs e camada atômica. O campo é aditivo; as contagens podem se sobrepor quando uma família serve a duas coleções.

Coleções não são pacotes separados nem asseguram integração com mapas, áudio, IA ou pagamentos. Um candidato ainda não extraído não recebe import, preview ou contagem fictícios. [Guia de incorporação e fronteiras](COLLECTIONS.md).

## Criar uma capacidade ausente

Para autoria da própria biblioteca, consulte [documentação avançada](ADVANCED_ORGANISMS.md) e [playbook do Coverflow](ORGANISM_PLAYBOOK.md). Esses guias complementam a transformação de telas consumidoras: ajudam a decidir entre tema, composição/Block, adapter e organismo, com contrato e testes na origem. Não aplique o checker de controles crus indiscriminadamente aos internals dos átomos.
