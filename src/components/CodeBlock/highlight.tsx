import { Fragment } from "react";
import type { ReactNode } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-jsx.js";
import "prismjs/components/prism-tsx.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-bash.js";

function renderTokens(stream: Prism.TokenStream): ReactNode {
  if (typeof stream === "string") return stream;
  if (Array.isArray(stream))
    return stream.map((token, index) => (
      <Fragment key={index}>{renderTokens(token)}</Fragment>
    ));
  return <span data-syntax={stream.type}>{renderTokens(stream.content)}</span>;
}

export function highlight(code: string, language = "text"): ReactNode {
  const aliases: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    sh: "bash",
    shell: "bash",
    html: "markup",
    svg: "markup",
  };
  const name = aliases[language.toLowerCase()] ?? language.toLowerCase();
  const grammar = Prism.languages[name];
  return grammar ? renderTokens(Prism.tokenize(code, grammar)) : code;
}
