// Agente simulado da demo web: o roteiro está em visita.ts, com a foto servida pelo Vite.
import foto from "../../../src/blocks/photos/ape-varanda.webp";
import { visitaAgent } from "./visita";

export type { Message, Reply } from "./visita";
export { v } from "./visita";
export const { components, createSurface, watching, reply } = visitaAgent(foto);
