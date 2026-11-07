// Contratos de captura (FileUpload, VoiceRecorder). O arquivo em si fica fora: a web usa o
// File do DOM e o nativo recebe a lista de um seletor injetado pelo app.

export type FileUploadState = "idle" | "uploading" | "success" | "error";

/** Props for the FileUpload component, sem a lista de arquivos (File na web, objeto do seletor no nativo). */
export interface FileUploadCoreProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  state?: FileUploadState;
  progress?: number;
  errorMessage?: string;
  disabled?: boolean;
  label?: string;
  hint?: string;
}

export type VoiceRecorderState = "idle" | "listening" | "paused" | "error" | "fallback";

/** Props for the VoiceRecorder component. A captura do áudio é do app. */
export interface VoiceRecorderCoreProps {
  state?: VoiceRecorderState;
  duration?: number;
  level?: number;
  transcript?: string;
  errorMessage?: string;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onFinish?: () => void;
  onRetry?: () => void;
  onUseFallback?: () => void;
}
