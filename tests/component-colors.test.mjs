import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanComponentColors, applyExceptions } from "../scripts/check-component-colors.mjs";

test("gate de cor: literal e reserva literal reprovam; token puro passa; exceção só com contagem", () => {
  const root = mkdtempSync(join(tmpdir(), "refy-cores-"));
  try {
    mkdirSync(join(root, "src/components/Ruim"), { recursive: true });
    mkdirSync(join(root, "src/components/Bom"), { recursive: true });
    writeFileSync(join(root, "src/components/Ruim/Ruim.module.css"), ".a{color:#0a0;background:var(--x-bg, #fff)}");
    writeFileSync(join(root, "src/components/Ruim/Ruim.tsx"), 'export const R = () => <i style={{ color: "rgb(0, 128, 0)" }} />;');
    writeFileSync(join(root, "src/components/Bom/Bom.module.css"), ".a{color:var(--ink-1);background:var(--x-bg, var(--surface))}");
    writeFileSync(join(root, "src/components/Bom/Bom.tsx"), 'export const B = () => <i style={{ color: "var(--ink-2)" }} />;');
    const found = scanComponentColors(root);
    assert.deepEqual(found.map((f) => `${f.file.split("/")[2]}:${f.kind}`).sort(), ["Ruim:fallback-literal", "Ruim:literal", "Ruim:literal"]);
    const ex = applyExceptions(found, [{ file: "src/components/Ruim/Ruim.tsx", kind: "literal", count: 1, reason: "teste" }]);
    assert.equal(ex.filter((f) => !f.exception).length, 2, "a exceção cobre só o que foi contado");
  } finally { rmSync(root, { recursive: true, force: true }); }
});
