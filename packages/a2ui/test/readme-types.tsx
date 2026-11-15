// Compila o exemplo do README como o app o escreve: a superfície do processador entra no
// A2uiSurface sem cast. Só o typecheck lê este arquivo.
import { ThemeProvider } from "@refy-design/web";
import { A2uiSurface, createRefyProcessor } from "../src/index.js";
import { createRefyValidator } from "../src/definition.js";

const processor = createRefyProcessor(() => {});
const surface = processor.model.surfacesMap.get("my-surface");

export function Screen() {
  return <ThemeProvider>{surface ? <A2uiSurface surface={surface} /> : null}</ThemeProvider>;
}

createRefyValidator();
