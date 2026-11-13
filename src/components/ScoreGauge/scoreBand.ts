// Sem React nem CSS: roda no node --test (COVG-03).
export type ScoreBand = "ok" | "warn" | "critical";

/** Deriva a banda de tom a partir do score e dos limiares. */
export function scoreBand(value: number, okAt = 70, warnAt = 40): ScoreBand {
  if (value >= okAt) return "ok";
  if (value >= warnAt) return "warn";
  return "critical";
}
