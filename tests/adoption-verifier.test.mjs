// O verificador do pacote local recusa sobrescrita, tema inválido e arquivos inesperados.
// Não abre página: roda no node --test, fora da bateria de navegador.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, symlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

test("verificador recusa sobrescrita, tema inválido e arquivos inesperados", () => {
  const temp = mkdtempSync(join(tmpdir(), "refy-adoption-negative-"));
  const run = (output, extra = {}) =>
    spawnSync(process.execPath, [resolve("scripts/verify-local-package.mjs"), join(temp, "unused.tgz"), output], {
      encoding: "utf8",
      env: { ...process.env, REFY_THEME_EXPORT_PATH: "", REFY_SITE_THEME_EXPORT_PATH: "", REFY_BLOCK_EXPORT_DIR: "", ...extra },
    });
  const invalid = /Informe um tema|circular|desconhecido|Valor inválido/;
  try {
    const existing = join(temp, "existing");
    mkdirSync(existing);
    writeFileSync(join(existing, "keep.txt"), "preserved");
    assert.match(run(existing).stderr, /EEXIST/);
    assert.ok(existsSync(join(existing, "keep.txt")));
    const theme = join(temp, "theme.json");
    const output = join(temp, "new");
    for (const value of [
      { name: "" },
      { name: "Invalid", tokens: { "--primary": "var(--primary)" } },
      { name: "Invalid", tokens: { "--unknown-token": "red" } },
    ]) {
      writeFileSync(theme, JSON.stringify(value));
      for (const key of ["REFY_THEME_EXPORT_PATH", "REFY_SITE_THEME_EXPORT_PATH"]) {
        const result = run(output, { [key]: theme });
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, invalid);
        assert.ok(!existsSync(output));
      }
    }
    const block = join(temp, "block");
    mkdirSync(block);
    writeFileSync(join(block, "unexpected.tsx"), "unexpected");
    assert.match(run(output, { REFY_BLOCK_EXPORT_DIR: block }).stderr, /Unexpected exported block files/);
    rmSync(join(block, "unexpected.tsx"));
    for (const file of ["page.tsx", "NavigationBlock.tsx", "ChartExplorer.tsx", "LibraryBlock.tsx", "SettingsBlock.tsx", "blocks.module.css", "photos.ts"]) writeFileSync(join(block, file), "");
    symlinkSync(theme, join(block, "DashboardBlock.tsx"));
    assert.match(run(output, { REFY_BLOCK_EXPORT_DIR: block }).stderr, /not links/);
    assert.ok(!existsSync(output));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
