// Módulos gerados no build do site por scripts/vite-locale-split.mjs.
declare module "virtual:refy-locale/site/*" {
  const text: Record<string, string>;
  export default text;
}
declare module "virtual:refy-locale/reference/*" {
  const text: { docs?: Record<string, string>; site?: Record<string, string>; demoLabels?: Record<string, string> };
  export default text;
  export const families: Record<string, () => Promise<{ default: Record<string, string> }>>;
}
