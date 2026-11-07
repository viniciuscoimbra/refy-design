/** React 18 exige string; React 19 aceita a string não vazia como atributo booleano. */
export function inertAttribute(inactive: boolean): boolean | undefined {
  return inactive ? ("inert" as unknown as boolean) : undefined;
}
