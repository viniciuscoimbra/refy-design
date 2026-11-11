import { useState } from "react";
import {
  BlogBlock,
  Button,
  CodeBlock,
  D3Chart,
  Input,
  ThemeProvider,
} from "@refy-design/web";
import type { RefyTheme } from "@refy-design/web";
const identities: RefyTheme[] = [
  {
    name: "Quadrado",
    tokens: {
      "--radius-default": "0px",
      "--button-radius": "0px",
      "--control-radius": "0px",
      "--font-body": '"IBM Plex Sans", system-ui, sans-serif',
    },
  },
  {
    name: "Arredondado",
    tokens: {
      "--radius-default": "18px",
      "--button-radius": "18px",
      "--control-radius": "18px",
      "--font-body": '"DM Sans", system-ui, sans-serif',
      "--on-primary": "#ffffff",
      "--on-primary-container": "#ffffff",
      "--button-primary-background-hover":
        "linear-gradient(120deg, #386b55, #28516e)",
      "--button-primary-background-active":
        "linear-gradient(120deg, #386b55, #28516e)",
      "--button-primary-background":
        "linear-gradient(120deg, #386b55, #28516e)",
    },
  },
];
export function ConsumerPackageFeatures() {
  const [identity, setIdentity] = useState(0),
    [dark, setDark] = useState(false);
  return (
    <section aria-label="Recursos do pacote">
      <ThemeProvider
        isolate
        data-testid="theme-consumer"
        theme={identities[identity]}
        mode={dark ? "dark" : "light"}
      >
        <Button variant="primary" onClick={() => setIdentity(1 - identity)}>
          Alterar identidade
        </Button>
        <Button onClick={() => setDark(!dark)}>Alternar modo de teste</Button>
        <Input label="Campo tematizado" />
      </ThemeProvider>
      <D3Chart
        title="Série empacotada"
        label="Série empacotada"
        type="line"
        series={[
          {
            id: "demo",
            label: "Exemplo",
            data: [
              { x: 1, y: 2 },
              { x: 2, y: 4 },
            ],
          },
        ]}
      />
      <CodeBlock language="tsx" code={"const exemplo = 42;"} />
      <BlogBlock />
    </section>
  );
}
