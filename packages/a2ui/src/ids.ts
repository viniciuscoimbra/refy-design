import { STRICT_VALIDATION } from "@a2ui/web_core";

/** Id próprio: o refy não responde pelo id do catálogo básico enquanto não cobrir as 18 peças. */
export const REFY_CATALOG_ID = "https://refy.design/a2ui/v1";

/**
 * Validação estrita do web_core, menos a regra de órfãos: o agente troca o layout com
 * `updateComponents` e as peças que saem da árvore ficam guardadas (o A2UI 1.0 não apaga peça).
 */
export const REFY_VALIDATION = Object.freeze({ ...STRICT_VALIDATION, allowOrphanComponents: true });
