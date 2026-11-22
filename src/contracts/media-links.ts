// Contratos das peças de mídia e de fonte: galeria, vídeo, áudio, prévia de link, citação e
// sugestões de próxima pergunta. A web e o nativo implementam igual.
import type { ReactNode } from "react";

/** One gallery photo. */
export interface GalleryImage {
  src: string;
  /** Alternative text; required because the photo is content. */
  alt: string;
  caption?: ReactNode;
}

export type ImageGalleryLayout = "grid" | "featured";

/** Props for the ImageGallery component. */
export interface ImageGalleryCoreProps {
  images: GalleryImage[];
  /** Accessible name of the gallery. E.g. "Apartment photos". */
  label: string;
  /** Columns at full width. Default 3. Narrow screens drop to 2. */
  columns?: 2 | 3 | 4;
  /** Aspect ratio of each thumbnail, width over height. Default 4/3. */
  aspectRatio?: number;
  /** Opens the photo full screen with previous and next. Default `true`. */
  viewer?: boolean;
  /** "grid": photos the same size, caption under each; "featured": three columns of square photos, the first takes two columns and two rows, and captions sit on the photos. Default "grid". */
  layout?: ImageGalleryLayout;
}

/** Props for the Video component. */
export interface VideoCoreProps {
  /** Video file (mp4, webm) or a YouTube or Vimeo link. */
  src: string;
  /** Video title, also the accessible name of the play button. */
  title: string;
  /** Image shown before playing. On YouTube, the video's own thumbnail when missing. */
  poster?: string;
  /** Aspect ratio, width over height. Default 16/9. */
  aspectRatio?: number;
  /** Line under the video. */
  description?: ReactNode;
}

/** Props for the AudioPlayer component. */
export interface AudioPlayerCoreProps {
  /** Audio file (mp3, m4a, ogg). */
  src: string;
  title: string;
  /** Line above the controls. E.g. episode, author or date. */
  description?: ReactNode;
  /** Cover (URL). */
  artwork?: string;
  /** Duration in seconds, shown before the file loads. */
  duration?: number;
}

export type LinkCardLayout = "horizontal" | "vertical";

/** Props for the LinkCard component. */
export interface LinkCardCoreProps {
  href: string;
  title: ReactNode;
  description?: ReactNode;
  /** Thumbnail (URL). */
  image?: string;
  /** Site icon (URL). Without it, the first letter of the domain: the component fetches nothing from outside. */
  favicon?: string;
  /** Site name. Default: the domain of `href`. */
  siteName?: string;
  /** "horizontal": thumbnail on the right; "vertical": thumbnail on top. Default "horizontal". */
  layout?: LinkCardLayout;
}

/** The source behind a citation. */
export interface CitationSource {
  title: string;
  href?: string;
  /** Excerpt of the source that backs the sentence. */
  snippet?: ReactNode;
  /** Site name. Default: the domain of `href`. */
  siteName?: string;
  favicon?: string;
}

/** Props for the Citation component. */
export interface CitationCoreProps {
  /** Source number, shown as [1]. */
  index: number;
  source: CitationSource;
}

/** One suggested next question. */
export interface FollowUpSuggestion {
  id?: string;
  /** Pill text. */
  label: string;
  /** Message sent when chosen. Default: `label`. */
  message?: string;
}

export type FollowUpLayout = "wrap" | "stack";

/** Props for the FollowUp component. */
export interface FollowUpCoreProps {
  suggestions: (string | FollowUpSuggestion)[];
  /** Receives the message of the chosen suggestion; the app sends it as the person's next message. */
  onSelect: (message: string) => void;
  /** Group name. Default "Suggestions", in the active language. */
  label?: string;
  /** "wrap": pills side by side; "stack": one per line. Default "wrap". */
  layout?: FollowUpLayout;
  disabled?: boolean;
}
