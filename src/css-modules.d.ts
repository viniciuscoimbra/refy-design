/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Site build: "off" hides every GitHub link while the public repository does not exist. */
  readonly VITE_REFY_GITHUB?: string;
}

// Permite importar *.module.css em arquivos .tsx com tipagem.
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}
