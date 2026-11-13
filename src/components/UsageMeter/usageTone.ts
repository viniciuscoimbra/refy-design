// Sem React nem CSS: roda no node --test (COVG-03).
import type { ProgressTone } from "../ProgressBar";

/** Deriva o tom da barra a partir do % consumido e dos limiares. */
export function usageTone(percent: number, warnAt = 80, criticalAt = 100): ProgressTone {
  if (percent >= criticalAt) return "critical";
  if (percent >= warnAt) return "warn";
  return "primary";
}
