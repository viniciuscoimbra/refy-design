# Piloto neutro: pessoas do projeto

| Origem | Refy | Contrato preservado / alteração |
| --- | --- | --- |
| input em label | Input | Nome controlado; trim; erro “Informe o nome.”; campo limpo após incluir |
| button submit | Button | Mesmo submit por clique/Enter; identidade vem do tema |
| campo de busca | Input | Filtro local por substring, sem distinção de maiúsculas/minúsculas; limpar restaura linhas |
| table/tr/td e botão por linha | Table + Button | Inclusão local, nome na linha, editar a pessoa correspondente; tabela larga pode rolar |
| dialog open e campos de edição | Modal + Input + Button | Draft independente, validação de nome vazio, trim ao salvar, cancelar não altera dado; acrescenta foco modal, Escape e retorno de foco do DS |
| cor/fonte no main | ThemeProvider no consumidor | Identidade externa à página; layout estrutural permanece local |

A página não virou organismo. IDs locais são índices crescentes porque o piloto só inclui pessoas e não remove/reordena. Não há persistência, autenticação, permissões, rotas novas ou API. O teste confere ausência de fetch/XHR e URL preservada; isso comprova somente este contrato local, não integrações de sistemas existentes. Acessibilidade do dialog original não era equivalente: a transformação usa a gestão de foco do DS e registra essa melhoria intencional. O piloto não homologa um sistema de cliente.
