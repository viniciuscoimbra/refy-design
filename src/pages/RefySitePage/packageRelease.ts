import pkg from "../../../package.json";

// Fonte única do que o site diz sobre instalar o pacote. Instalação, Primeira tela, Para IAs e
// a aba Instalação das fichas leem daqui, para que nenhuma página prometa versão ou comando que
// a outra desmente.

export const packageName = pkg.name;
export const packageVersion = pkg.version;

// Fica false até `npm view @refy-design/web version` responder a versão acima. Enquanto false, o site
// avisa que o pacote não saiu e não mostra comando de instalação, porque todo comando daria 404.
export const packagePublished = true;

export const installCommands: Record<"npm" | "pnpm" | "yarn" | "bun", string> = {
  npm: `npm install ${packageName}`,
  pnpm: `pnpm add ${packageName}`,
  yarn: `yarn add ${packageName}`,
  bun: `bun add ${packageName}`,
};

// O pacote mobile tem número próprio. Fica false até `npm view @refy-design/mobile version`
// responder: antes disso a página Mobile não mostra comando de instalação.
export const mobilePublished = true;
export const mobilePackage = "@refy-design/mobile";
export const mobilePeers = "react-native-svg";
export const mobileInstall = `npx expo install ${mobilePackage} ${mobilePeers}`;
