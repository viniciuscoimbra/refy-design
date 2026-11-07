import type { StorybookConfig } from "@storybook/react-vite";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";

const config: StorybookConfig = {
  // Uma story por componente, ao lado do próprio componente.
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  // Gera a página Docs de cada componente marcado com tags: ["autodocs"].
  docs: { autodocs: "tag" },
  async viteFinal(config) {
    // Generated HTML must not reload previews and erase local interaction state.
    config.server ??= {};
    config.server.watch ??= {};
    const ignored = config.server.watch.ignored;
    config.server.watch.ignored = [
      ...(ignored ? (Array.isArray(ignored) ? ignored : [ignored]) : []),
      "**/storybook-static/**", "**/playwright-report/**", "**/test-results/**",
      "**/.local-release/**", "**/dist/**", "**/graft/**",
    ];
    config.plugins ??= [];
    config.plugins.push({
      name: "refy:block-preview-entry",
      enforce: "post",
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          if (request.url?.split("?")[0] !== "/block-preview.html")
            return next();
          try {
            const html = await server.transformIndexHtml(
              "/block-preview.html",
              await readFile(resolve("block-preview.html"), "utf8"),
            );
            response.setHeader("Content-Type", "text/html");
            response.end(html);
          } catch (error) {
            next(error);
          }
        });
      },
      config(vite, { command }) {
        if (command !== "build") return;
        const input = vite.build?.rollupOptions?.input;
        const entries =
          typeof input === "string"
            ? { storybook: input }
            : Array.isArray(input)
              ? Object.fromEntries(
                  input.map((file, index) => [`entry${index}`, file]),
                )
              : input;
        return {
          build: {
            rollupOptions: {
              input: { ...entries, blocks: resolve("block-preview.html") },
            },
          },
        };
      },
    });
    return config;
  },
};

export default config;
