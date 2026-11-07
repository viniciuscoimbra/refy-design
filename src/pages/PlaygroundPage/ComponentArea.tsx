import { tr } from "../RefySitePage/i18n";
import { Component, Suspense, lazy, useRef, useState } from "react";
import type { ReactNode, MouseEvent } from "react";
import { Callout } from "../../index";
import { componentCatalog, type DemoModule } from "./catalog";
import { ExampleScope } from "../../_demo/shortcuts";
import styles from "./PlaygroundPage.module.css";

// Reuse each catalog example in the current theme tree, without another provider or iframe.
const examples = new Map<string, ReturnType<typeof lazy>>();
function getExample(id: string, storyName?: string, withDecorators = true) {
  const key = `${id}:${storyName ?? ""}:${withDecorators}`;
  if (!examples.has(key)) {
    const entry = componentCatalog.find((item) => item.id === id)!;
    examples.set(
      key,
      lazy(async () => {
        const module = (await entry.load()) as DemoModule;
        const meta = module.default;
        const story = module[storyName ?? entry.story];
        const Render = story.render ?? meta.render ?? meta.component;
        const args = { ...meta.args, ...story.args };
        let Demo = () => <Render {...args} />;
        for (const decorate of withDecorators
          ? [...(story.decorators ?? []), ...(meta.decorators ?? [])]
          : []) {
          const Child = Demo;
          Demo = () => decorate(Child);
        }
        return {
          default: () => (
            <div data-demo-ready="">
              <Demo />
            </div>
          ),
        };
      }),
    );
  }
  return examples.get(key)!;
}

export function ComponentExample({
  id,
  story,
  withDecorators = true,
}: {
  id: string;
  story?: string;
  /** Internal verification may compare the same public snippet without Storybook-only layout. */
  withDecorators?: boolean;
}) {
  const Demo = getExample(id, story, withDecorators);
  const scope = useRef<HTMLDivElement>(null);
  const [destination, setDestination] = useState("");
  const containLink = (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>(
      "a[href]",
    );
    if (!link || link.hasAttribute("download")) return;
    event.preventDefault();
    const href = link.getAttribute("href") ?? "";
    const local =
      href.startsWith("#") && href.length > 1
        ? document.getElementById(href.slice(1))
        : null;
    if (local && scope.current?.contains(local))
      local.scrollIntoView({ block: "nearest" });
    else
      setDestination(
        `Destino demonstrativo: ${link.textContent?.trim() || link.getAttribute("aria-label") || href}. Você continua neste exemplo.`,
      );
  };
  return (
    <ExampleScope.Provider value={scope}>
      <div
        ref={scope}
        className={styles.demoStage}
        data-testid="component-demo"
        data-component={id}
        onClickCapture={containLink}
        onAuxClickCapture={containLink}
      >
        <DemoBoundary key={`${id}:${story}`}>
          <Suspense fallback={<p role="status">{tr("Carregando exemplo…")}</p>}>
            <Demo />
          </Suspense>
        </DemoBoundary>
        {destination && <p role="status">{destination}</p>}
      </div>
    </ExampleScope.Provider>
  );
}

class DemoBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <Callout tone="danger" title={tr("Não foi possível abrir este exemplo")}>
        {tr("Recarregue a página para tentar novamente.")}</Callout>
    ) : (
      this.props.children
    );
  }
}
