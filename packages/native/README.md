# @refy-design/mobile

Os componentes do Refy em React Native, com o mesmo contrato de props da web e os tokens resolvidos para o modo e o tema do app. O pacote traz os contratos e os tokens dentro dele: não depende de `@refy-design/web`.

```sh
npx expo install @refy-design/mobile react-native-svg
```

## Uso

```tsx
import { RefyProvider, Button, Badge } from "@refy-design/mobile";
import tema from "./theme/produto.json";

export default function App() {
  return (
    <RefyProvider theme={tema} mode="system" fonts={fontesDoApp}>
      <Badge tone="success" dot>Sincronizado</Badge>
      <Button variant="primary" onPress={salvar}>Acompanhar preço</Button>
    </RefyProvider>
  );
}
```

`theme` é o mesmo JSON do `ThemeProvider` web. `mode` aceita `light`, `dark`, `editorial` ou `system`. `fonts` recebe a família e o peso do token e devolve `fontFamily` e `fontWeight` com o nome que o app registrou no expo-font; sem ele, a família do token vai direto e o sistema cai na fonte padrão quando ela não está carregada.

Ícones passados em `icon` ou `leadingIcon` leem tamanho e cor com `useIconStyle()`: o componente decide os dois, como o CSS faz na web.

`ToastRegion` fica uma vez na raiz, acima da navegação.

Peers: `react` 19.1+, `react-native` 0.76+ (a nova arquitetura, por causa de `boxShadow`) e `react-native-svg` 15+.

## Componentes

Avatar, Badge, BrandLogo, Button, Card, CardHeader, Chip, ChoiceCard, ChoiceCardGroup, ConnectorCard, D3Chart (line e area), EmptyState, Fab, IconButton, Input, Item, Modal, OAuthButton, PageHeader, ProgressBar, ScrollArea, Segmented, Select, SettingRow, SettingRowGroup, Stat, StatGroup, Tabs, Textarea, Toast, ToastRegion e WizardStepper.

NavigationMenu fica de fora: navegação nativa é do roteador do app (React Navigation, Expo Router).

O que muda em relação à web está em [DIVERGENCIAS.md](DIVERGENCIAS.md).

## Verificação

```sh
npm install
npm run typecheck   # tsc, inclui test/contract-types.ts
npm test            # jest: galeria inteira em 5 temas (mais 2 com REFY_EXTRA_THEME), acessibilidade, paridade com a web
npm run build       # dist/index.js e dist/types, com contratos e tokens embutidos
```

- `test/contract-types.ts`: cada componente nativo implementa o contrato da web com os mesmos tipos. Tem um controle negativo que precisa falhar.
- `test/a11y.test.tsx`: renderiza `example/Gallery.tsx` em refy light, dark, editorial e no tema refy-site, dark e light. `REFY_EXTRA_THEME=/caminho/tema.json npm test` roda também com o tema de um produto. Para cada elemento tocável, cobra papel, nome e área de toque de 44 pt. Tem um controle negativo.
- `test/parity.test.tsx`: ícones de provedor e geometria do gráfico iguais aos da web.

## Galeria no simulador

```sh
cd example
npm install
npx expo start --ios
```

A tela mostra todas as variantes, com um seletor de tema no topo.
