export type VideoSource =
  | { kind: "youtube"; id: string; embed: string; poster: string }
  | { kind: "vimeo"; id: string; embed: string; poster?: undefined }
  | { kind: "file"; url: string };

/**
 * Reconhece YouTube e Vimeo pelo endereço. O YouTube entra pelo domínio sem cookie e o Vimeo
 * com `dnt=1`: nada da plataforma carrega antes de a pessoa tocar.
 */
export function parseVideoSource(src: string): VideoSource {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return { kind: "file", url: src };
  }
  const host = url.hostname.replace(/^www\.|^m\./, "");
  let youtube: string | undefined;
  if (host === "youtu.be") youtube = url.pathname.slice(1).split("/")[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    youtube = url.searchParams.get("v") ?? /^\/(?:embed|shorts|live)\/([^/?#]+)/.exec(url.pathname)?.[1];
  }
  if (youtube && /^[\w-]{6,}$/.test(youtube)) {
    return {
      kind: "youtube",
      id: youtube,
      embed: `https://www.youtube-nocookie.com/embed/${youtube}?autoplay=1&rel=0`,
      poster: `https://i.ytimg.com/vi/${youtube}/hqdefault.jpg`,
    };
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = /(\d{5,})/.exec(url.pathname)?.[1];
    if (id) return { kind: "vimeo", id, embed: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1` };
  }
  return { kind: "file", url: src };
}
