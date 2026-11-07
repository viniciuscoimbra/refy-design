import { addons } from "@storybook/manager-api";

addons.setConfig({
  sidebar: {
    filters: {
      // Keep fixture IDs and direct URLs available for browser tests.
      adoption: (item) =>
        !item.tags?.includes("refy-internal") &&
        /^(Playground|Componentes|Refy Site)(\/|$)/.test(item.title),
    },
  },
});
