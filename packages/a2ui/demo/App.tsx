import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { A2uiSurface } from "@a2ui/react";
import type { ActionPayload } from "@a2ui/web_core";
import { Badge, Bubble, CodeBlock, Collapsible, Segmented, ThemeProvider } from "@refy-design/web";
import type { RefyTheme } from "@refy-design/web";
import refy from "../../../src/themes/refy.json";
import terracota from "../../../src/themes/terracota.json";
import cobalto from "../../../src/themes/cobalto.json";
import { createRefyProcessor } from "../src/catalog";
import { createSurface, reply, watching } from "./agent";
import type { Message } from "./agent";

const THEMES: Record<string, RefyTheme> = {
  refy: refy as RefyTheme,
  terracota: terracota as RefyTheme,
  cobalto: cobalto as RefyTheme,
};

interface Logged {
  from: "agente" | "app";
  message: unknown;
}
interface Chat {
  side: "start" | "end";
  text: string;
}

declare global {
  interface Window {
    a2uiActions: ActionPayload[];
  }
}
window.a2uiActions = [];

const params = new URLSearchParams(location.search);

export function App() {
  const [theme, setTheme] = useState(params.get("tema") ?? "refy");
  const [mode, setMode] = useState(params.get("modo") === "escuro" ? "dark" : "light");
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const [log, setLog] = useState<Logged[]>([]);
  const [chat, setChat] = useState<Chat[]>([
    { side: "end", text: "Quero visitar o apartamento da Rua Augusta essa semana." },
  ]);
  const send = useRef<(messages: Message[]) => void>(() => {});

  const processor = useMemo(
    () =>
      createRefyProcessor((action) => {
        window.a2uiActions.push(action);
        setLog((items) => [...items, { from: "app", message: { version: "1.0", action } }]);
        const answer = reply(action.name, action.context);
        send.current(answer.messages);
        if (answer.bubble) setChat((items) => [...items, { side: "start", text: answer.bubble! }]);
      }),
    [],
  );

  send.current = (messages) => {
    if (!messages.length) return;
    processor.processMessages(messages as never);
    setLog((items) => [...items, ...messages.map((message) => ({ from: "agente" as const, message }))]);
    rerender();
  };

  useEffect(() => {
    let people = 2;
    const start = setTimeout(() => send.current([createSurface()]), 700);
    const tick = setInterval(() => {
      if (!processor.model.surfacesMap.get("visita")) return;
      people = people === 4 ? 2 : people + 1;
      send.current([watching(people)]);
    }, 4000);
    return () => {
      clearTimeout(start);
      clearInterval(tick);
    };
  }, [processor]);

  const surface = processor.model.surfacesMap.get("visita");

  return (
    <ThemeProvider theme={THEMES[theme]} mode={mode as "light" | "dark"} className="demo">
      <header className="demo-header">
        <div className="demo-title">
          <strong>Refy · A2UI</strong>
          <Badge tone="neutral">agente simulado</Badge>
        </div>
        <div className="demo-controls">
          <Segmented
            label="Tema"
            value={theme}
            onChange={setTheme}
            options={[
              { value: "refy", label: "Refy" },
              { value: "terracota", label: "Terracota" },
              { value: "cobalto", label: "Cobalto" },
            ]}
          />
          <Segmented
            label="Modo"
            value={mode}
            onChange={setMode}
            options={[
              { value: "light", label: "Claro" },
              { value: "dark", label: "Escuro" },
            ]}
          />
        </div>
      </header>
      <main className="demo-chat">
        <Bubble side="end">{chat[0].text}</Bubble>
        <div className="demo-surface" data-testid="superficie">
          {surface ? <A2uiSurface surface={surface} /> : <p className="ra-caption">O agente está montando…</p>}
        </div>
        {chat.slice(1).map((item, index) => (
          <Bubble key={index} side={item.side}>
            {item.text}
          </Bubble>
        ))}
        <Collapsible title={`O que passou entre o agente e o app (${log.length})`}>
          <div className="demo-log">
            {log.map((item, index) => (
              <CodeBlock
                key={index}
                label={item.from === "agente" ? "agente → app" : "app → agente"}
                language="json"
                code={JSON.stringify(item.message, null, 2)}
              />
            ))}
          </div>
        </Collapsible>
      </main>
    </ThemeProvider>
  );
}
