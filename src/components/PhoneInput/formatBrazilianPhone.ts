// Sem React nem CSS: roda no node --test (COVG-03).
export function formatBrazilianPhone(value: string) {
  const number = value.replace(/\D/g, "").slice(0, 11);
  if (number.length <= 2) return number.replace(/^(\d+)/, "($1");
  if (number.length <= 6) return number.replace(/^(\d{2})(\d+)/, "($1) $2");
  if (number.length <= 10) return number.replace(/^(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
  return number.replace(/^(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
}
