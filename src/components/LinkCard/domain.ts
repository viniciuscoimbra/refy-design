/** "https://www.exemplo.com.br/x" → "exemplo.com.br". Endereço inválido volta como veio. */
export function domainOf(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}
