import { posix } from "node:path";

// Browser chunks keep CSS next to the JS that uses it; native Node gets the same JS without CSS imports.
export function selectiveCss() {
  return {
    name: "refy-selective-css",
    enforce: "post",
    generateBundle(_, bundle) {
      const css = Object.values(bundle)
        .filter(
          (item) => item.type === "asset" && item.fileName.endsWith(".css"),
        )
        .sort((a, b) => a.fileName.localeCompare(b.fileName));
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== "chunk") continue;
        const original = chunk.code;
        const imports = [...(chunk.viteMetadata?.importedCss ?? [])].map(
          (file) => {
            let relative = posix.relative(posix.dirname(chunk.fileName), file);
            if (!relative.startsWith(".")) relative = `./${relative}`;
            return `import ${JSON.stringify(relative)};`;
          },
        );
        if (imports.length) {
          const marker =
            original.match(
              /\n\/\/# sourceMappingURL=[^\r\n]*(?:\r?\n)*$/,
            )?.[0] ?? "";
          chunk.code =
            original.slice(0, marker ? -marker.length : undefined) +
            "\n" +
            imports.join("\n") +
            marker;
        }
        const fileName = `node/${chunk.fileName}`;
        bundle[fileName] = {
          ...chunk,
          fileName,
          code: original,
          isEntry: false,
        };
        const map = bundle[`${chunk.fileName}.map`];
        if (map?.type === "asset") {
          const data = JSON.parse(String(map.source));
          data.sources = data.sources.map((source) =>
            /^(?:\w+:|\/)/.test(source) ? source : `../${source}`,
          );
          bundle[`${fileName}.map`] = {
            ...map,
            fileName: `${fileName}.map`,
            source: JSON.stringify(data),
          };
        }
      }
      this.emitFile({
        type: "asset",
        fileName: "style.css",
        source: css.map((asset) => String(asset.source)).join("\n"),
      });
    },
  };
}
