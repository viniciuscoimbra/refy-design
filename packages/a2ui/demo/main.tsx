import { createRoot } from "react-dom/client";
import "@refy-design/web/fonts.css";
import "@refy-design/web/tokens.css";
import "@refy-design/web/global.css";
import "@refy-design/web/styles.css";
import "../src/catalog.css";
import "./demo.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(<App />);
