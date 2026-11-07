// Recusa histórico que não veio da promoção de versão. A linha principal de main
// (primeiro pai) é só de versões do mantenedor, com a mensagem "refy X.Y.Z" e, no
// máximo, linhas Co-authored-by de pessoas. Commit de quem contribuiu só entra como
// pai extra de uma versão: é o pull request aceito. Toda tag é anotada pelo
// mantenedor e aponta para uma versão.
// Uso: node scripts/check-release-history.mjs [pasta do repositório]
import { execFileSync } from "node:child_process";

const MAINTAINER = { name: "Vinícius Coimbra", email: "966864+viniciuscoimbra@users.noreply.github.com" };
const SUBJECT = /^refy \d+\.\d+\.\d+$/;
const TRAILER = /^[A-Za-z][\w-]*:\s/m;
const COAUTHOR = /^Co-authored-by: [^<>\n]+ <[^<>\s@]+@[^<>\s]+>$/;
const TOOL = /claude|codex|anthropic|openai|chatgpt|copilot|gemini|cursor|\bgpt-?\d|\b(ai|ia|llm)\b/i;
const repo = process.argv[2] ?? ".";
const git = (args) => execFileSync("git", args, { cwd: repo, encoding: "utf8" });
const same = (name, email) => name === MAINTAINER.name && email === MAINTAINER.email;

export function audit() {
  const problems = [];
  const SEP = "\x1f";
  const log = git(["log", "--first-parent", "HEAD", `--format=%H${SEP}%an${SEP}%ae${SEP}%cn${SEP}%ce${SEP}%B%x1e`]);
  const line = new Set();
  for (const record of log.split("\x1e").map((r) => r.replace(/^\n/, "")).filter(Boolean)) {
    const [sha, an, ae, cn, ce, body] = record.split(SEP);
    line.add(sha);
    const id = sha.slice(0, 7);
    const message = body.trim();
    if (!same(an, ae)) problems.push(`${id}: autor ${an} <${ae}>`);
    if (!same(cn, ce)) problems.push(`${id}: committer ${cn} <${ce}>`);
    const [subject, blank, ...lines] = message.split("\n");
    if (!SUBJECT.test(subject)) problems.push(`${id}: mensagem fora de "refy X.Y.Z": ${JSON.stringify(subject)}`);
    else if (blank !== undefined && (blank !== "" || !lines.length || !lines.every((l) => COAUTHOR.test(l)))) {
      problems.push(`${id}: ${TRAILER.test([blank, ...lines].join("\n")) ? "trailer" : "texto"} além de coautoria`);
    }
    if (TOOL.test(message)) problems.push(`${id}: ferramenta de IA na mensagem`);
  }
  const tags = git(["for-each-ref", "refs/tags", `--format=%(refname:short)${SEP}%(objecttype)${SEP}%(taggername)${SEP}%(taggeremail)${SEP}%(*objectname)`]);
  for (const entry of tags.split("\n").filter(Boolean)) {
    const [name, type, tn, te, target] = entry.split(SEP);
    if (type !== "tag") problems.push(`tag ${name}: leve, sem autor`);
    else if (!same(tn, te.replace(/^<|>$/g, ""))) problems.push(`tag ${name}: autor ${tn} ${te}`);
    else if (!line.has(target)) problems.push(`tag ${name}: aponta para commit fora da linha de versões`);
  }
  return problems;
}

const problems = audit();
if (problems.length) {
  console.error(`Histórico recusado:\n${problems.join("\n")}`);
  process.exit(1);
}
console.log("OK: a linha de main é só de versões do mantenedor; contribuições entram como pull request aceito.");
