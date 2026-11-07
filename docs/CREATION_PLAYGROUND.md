# Criar com o Refy

O site local reúne três entradas:

- **Componentes:** documentação e exemplos por Átomos, Moléculas e Organismos.
- **Templates:** composições prontas com variações, prévia responsiva e arquivos reais.
- **Playground:** a mesma biblioteca com escolha de tema, edição visual e exportação.

Template organiza a página. Tema define fontes, cores, dimensões, espaçamentos e demais atributos visuais. Modo escolhe claro, escuro ou sistema.

## Começar do padrão

Na página inicial, **Começar** abre uma nova personalização com o tema padrão. Dentro do Playground, **Começar do tema padrão** faz o mesmo. O modo atual é preservado.

Se há personalização em andamento, um diálogo permite cancelar ou confirmar a substituição. Cancelar preserva o tema atual. Exporte seu JSON antes de confirmar caso queira guardar uma cópia.

O ponto único de configuração para novas personalizações é `defaultConfig` em `src/pages/PlaygroundPage/themeConfig.ts`. Hoje ele usa Refy e o conjunto Manrope/Source Sans 3/Source Code Pro. O mantenedor pode alterar essa configuração para os próximos começos. Navegar no site não reescreve um tema já escolhido ou arquivos baixados.

## Partir de um componente ou template

1. Abra a documentação do componente e escolha **Personalizar no Playground**.
2. Ou abra **Templates**, escolha uma variação e use a mesma ação.
3. O Playground abre o item escolhido com a configuração atual. Trocar de componente, template ou página mantém a personalização e a seleção da sessão.

Em Templates, o código e os dispositivos de prévia pertencem à composição selecionada. Os componentes vêm da biblioteca; a página não é uma nova família de organismos.

## Personalizar e exportar

Escolha um preset em **Tema da prévia** ou abra **Personalizar tema**. O editor compartilhado oferece cores, forma, fontes, espaçamento, movimento, tokens e exportação/importação JSON. Alternar modo não escolhe outra fonte ou geometria.

Em **Exportar**, baixe o tema e aplique no projeto:

```tsx
import { Button, ThemeProvider } from '@refy-design/web';
import type { RefyTheme } from '@refy-design/web';
import '@refy-design/web/tokens.css';
import '@refy-design/web/fonts.css';
import themeData from './theme.json';

const theme: RefyTheme = themeData;

export function App({ onSave }: { onSave: () => void }) {
  return (
    <ThemeProvider theme={theme} mode="system">
      <Button onClick={onSave}>Salvar</Button>
    </ThemeProvider>
  );
}
```

O tema baixado é um arquivo do projeto. Mudar o padrão do site não o altera. Atualizar a versão da biblioteca é outra decisão: seus fallbacks e comportamentos devem ser revalidados na atualização. A biblioteca permite temas parciais; não promete congelar toda aparência através de qualquer versão futura.

## Entradas locais

- Playground: http://localhost:6006/?path=/story/refy-site--playground
- Componentes: http://localhost:6006/?path=/story/refy-site--componentes
- Templates: http://localhost:6006/?path=/story/refy-site--blocks

IDs anteriores de Blocks e do Playground foram preservados. Os presets, o editor e as prévias são compartilhados, sem outro catálogo de componentes ou mecanismo de temas.

## Revisão

Os fluxos são locais e usam dados demonstrativos. A validação visual do mantenedor está pendente; os testes técnicos não representam essa aprovação. Nenhuma publicação ou migração de produtos foi autorizada.
