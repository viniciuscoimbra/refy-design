import { Prose, TableOfContents } from "../index";
import styles from "./TextArticleBlock.module.css";
export function TextArticleBlock() {
  return (
    <div className={styles.layout}>
      <Prose>
        <p>Guide · 4 min read</p>
        <h1>How to change your product's theme</h1>
        <p>
          The theme holds everything about appearance: colors, fonts, spacing, radii and shadows. Components read these values, so changing the theme changes the whole interface without touching the screens' code.
        </p>
        <h2 id="article-file">One file per theme</h2>
        <p>
          Each theme is a JSON file. In <code>tokens</code> go the values that apply to both modes, like fonts and sizes. In{" "}
          <code>modes.light</code> e <code>modes.dark</code> go the colors for each mode.
        </p>
        <pre>
          <code>{`{
  "name": "aurora",
  "tokens": { "--font-body": "\\"Inter\\", sans-serif" },
  "modes": {
    "light": { "--primary": "#087f5b" },
    "dark": { "--primary": "#3fbf8f" }
  }
}`}</code>
        </pre>
        <h2 id="article-apply">Apply the theme</h2>
        <p>
          Wrap the app with <code>ThemeProvider</code> and pass the file. Everything inside starts using its values.
        </p>
        <pre>
          <code>{`import aurora from "./aurora.json";

<ThemeProvider theme={aurora} mode="system">
  <App />
</ThemeProvider>`}</code>
        </pre>
        <h2 id="article-modes">Light and dark</h2>
        <p>
          With <code>mode="system"</code>, the theme follows the device preference. Use <code>"light"</code> or <code>"dark"</code> to lock a mode. Switching keeps what the person was doing: filled fields and open tabs stay the same.
        </p>
        <blockquote>
          Before publishing, check both modes. A color that works in light mode can lose contrast in dark mode.
        </blockquote>
      </Prose>
      <aside>
        <TableOfContents
          items={[
            { id: "article-file", label: "One file per theme" },
            { id: "article-apply", label: "Apply the theme" },
            { id: "article-modes", label: "Light and dark" },
          ]}
        />
      </aside>
    </div>
  );
}
