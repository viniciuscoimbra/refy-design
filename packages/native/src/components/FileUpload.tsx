import { useState } from "react";
import { Image, Text, View, useWindowDimensions } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { FileUploadCoreProps, FileUploadState } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useIconStyle } from "../icon";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Callout } from "./Callout";
import { IconButton } from "./IconButton";
import { ProgressBar } from "./ProgressBar";

export type { FileUploadState };

/** Arquivo escolhido no aparelho: o que expo-document-picker e afins devolvem. */
export interface NativeFile {
  name: string;
  size: number;
  /** Tipo MIME. Com `image/*` e `uri`, a linha mostra a miniatura. */
  type?: string;
  uri?: string;
}

export interface FileUploadProps extends FileUploadCoreProps {
  files?: NativeFile[];
  defaultFiles?: NativeFile[];
  onFilesChange?: (files: NativeFile[]) => void;
  /**
   * Só no nativo: abre o seletor do app (expo-document-picker, react-native-document-picker)
   * e devolve os arquivos escolhidos. Sem ele, o botão "Escolher arquivo" não aparece.
   */
  pickFiles?: (options: { accept?: string; multiple: boolean }) => Promise<NativeFile[]>;
  style?: StyleProp<ViewStyle>;
}

function Glyph({ d, strokeWidth = 2 }: { d: string[]; strokeWidth?: number }) {
  const { size, color } = useIconStyle();
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">{d.map((p) => <Path key={p} d={p} />)}</Svg>;
}

/** Tipo pela extensão, igual à web: doc, docx, odt e pdf viram documento. */
export function fileKind(name: string) {
  const extension = name.includes(".") ? name.split(".").pop()!.toLocaleLowerCase("pt-BR") : "";
  const label = extension ? extension.toLocaleUpperCase("pt-BR") : "ARQ";
  return { kind: ["doc", "docx", "odt", "pdf"].includes(extension) ? "document" as const : "file" as const, label };
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/** Mensagem de estado igual à da web. */
export function fileUploadStatus(state: FileUploadState, count: number, progress?: number) {
  if (state === "uploading") return `Enviando ${count} ${plural(count, "arquivo", "arquivos")}${progress === undefined ? "." : `: ${Math.round(progress)}%.`}`;
  if (state === "success") return "Upload concluído.";
  return `${count} ${plural(count, "arquivo selecionado", "arquivos selecionados")}.`;
}

/**
 * Envio de arquivos. A lista fica com o app; o componente valida o tamanho, mostra miniatura,
 * progresso e remoção. No celular não há arrastar e soltar: a escolha vem de `pickFiles`.
 */
export function FileUpload({ files, defaultFiles = [], onFilesChange, pickFiles, accept, multiple = false, maxSize = 10 * 1024 * 1024, state = "idle", progress, errorMessage, disabled = false, label = "Adicionar arquivos", hint = "Escolha no seu dispositivo.", style }: FileUploadProps) {
  const t = useRefy();
  const { width } = useWindowDimensions();
  const [internal, setInternal] = useState(defaultFiles);
  const [validationError, setValidationError] = useState<string>();
  const current = files ?? internal;
  const busy = state === "uploading";
  const commit = (next: NativeFile[]) => { if (files === undefined) setInternal(next); onFilesChange?.(next); };
  const validate = (incoming: NativeFile[]) => {
    if (!incoming.length) return;
    const oversized = incoming.find((f) => f.size > maxSize);
    if (oversized) { setValidationError(`${oversized.name} excede o limite de ${(maxSize / 1024 / 1024).toLocaleString("pt-BR")} MB.`); return; }
    setValidationError(undefined);
    commit(multiple ? [...current, ...incoming] : incoming.slice(0, 1));
  };
  const choose = async () => { if (pickFiles) validate(await pickFiles({ accept, multiple })); };
  const shownError = errorMessage ?? validationError;

  const ink1 = t.pick<string>("--ink-1");
  const ink3 = t.pick<string>("--ink-3");
  const sm = t.pick<number>("--text-sm", 13);
  const xs = t.pick<number>("--text-xs", 12);
  const space2 = t.size("--space-2", 8);
  const space3 = t.size("--space-3", 12);
  const stacked = width <= 544;
  const mono = t.font(["--interface-detail-font", "--font-mono"], "--weight-semi");

  return (
    <View accessibilityLabel={label} accessibilityState={{ busy }} style={[{ width: "100%", gap: space3 }, style]}>
      {(multiple || current.length === 0) && (
        <View style={{
          flexDirection: stacked ? "column" : "row", alignItems: stacked ? "flex-start" : "center", gap: t.size("--space-4", 16), minHeight: 112, padding: t.size("--space-5", 20),
          borderWidth: t.pick<number>("--surface-border-width", 1), borderStyle: "dashed", borderColor: t.pick<string>("--border"), borderRadius: t.pick<number>("--radius-lg", 12),
          backgroundColor: t.pick<string>("--surface"), opacity: disabled ? 0.58 : 1,
        }}>
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: t.pick<number>("--radius-default", 6), backgroundColor: t.pick<string>("--surface-2") }}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={t.pick<string>("--ink-2")} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="M12 16V4m0 0L7 9m5-5 5 5M5 15v4h14v-4" /></Svg>
          </View>
          <View style={{ flex: stacked ? undefined : 1, alignSelf: stacked ? "stretch" : undefined, minWidth: 0, gap: t.size("--space-1", 4) }}>
            <Text style={{ color: ink1, fontSize: sm, ...t.font("--font-body", "--weight-semi") }}>{label}</Text>
            <Text style={{ color: ink3, fontSize: sm, ...t.font("--font-body", "--weight-regular") }}>{hint}</Text>
          </View>
          {pickFiles && <Button variant="secondary" disabled={disabled || busy} onPress={choose}>{multiple ? "Escolher arquivos" : "Escolher arquivo"}</Button>}
        </View>
      )}
      {shownError ? <Callout tone="danger" accessibilityRole="alert" title="Arquivo não adicionado">{shownError}</Callout> : null}
      {current.length > 0 && (
        <View role="list" accessibilityLabel="Arquivos selecionados" style={{ gap: space2 }}>
          {current.map((file, index) => {
            const type = fileKind(file.name);
            const preview = file.uri && file.type?.startsWith("image/") ? file.uri : undefined;
            const doc = type.kind === "document";
            return (
              <View key={`${file.name}-${index}`} role="listitem" style={{ flexDirection: "row", alignItems: "center", gap: space3, padding: space3, borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: t.pick<string>("--line-soft"), borderRadius: t.pick<number>("--radius-default", 6), backgroundColor: t.pick<string>("--surface") }}>
                <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: 52, height: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 2, overflow: "hidden", borderRadius: t.pick<number>("--radius-sm", 4), backgroundColor: doc ? t.pick<string>("--info-soft", "--legacy-info-soft") : t.pick<string>("--surface-2") }}>
                  {preview ? (
                    <>
                      <Image source={{ uri: preview }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                      <Text style={{ position: "absolute", right: 3, bottom: 3, paddingHorizontal: 3, paddingVertical: 1, borderRadius: t.pick<number>("--radius-xs", 2), backgroundColor: t.pick<string>("--surface"), color: t.pick<string>("--ink-2"), fontSize: t.pick<number>("--text-2xs", 11), ...mono }}>{type.label}</Text>
                    </>
                  ) : (
                    <>
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={doc ? t.pick<string>("--info-ink", "--info") : ink3} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><Path d="M6 3h8l4 4v14H6V3Z" /><Path d={doc ? "M14 3v5h5M9 12h6M9 16h6" : "M14 3v5h5"} /></Svg>
                    </>
                  )}
                  {!preview && <Text style={{ color: doc ? t.pick<string>("--info-ink", "--info") : ink3, fontSize: t.pick<number>("--text-2xs", 11), ...mono }}>{type.label}</Text>}
                </View>
                <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                  <Text numberOfLines={1} style={{ color: ink1, fontSize: sm, ...t.font("--font-body", "--weight-semi") }}>{file.name}</Text>
                  <Text style={{ color: ink3, fontSize: xs, ...t.font("--font-body", "--weight-regular") }}>{(file.size / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} KB</Text>
                  {busy && <ProgressBar value={progress} indeterminate={progress === undefined} size="sm" accessibilityLabel={`Upload de ${file.name}`} style={{ marginTop: t.size("--space-1", 4) }} />}
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: space2 }}>
                  {state === "success" && <Badge tone="success">Enviado</Badge>}
                  <IconButton accessibilityLabel={`Remover ${file.name}`} size="sm" disabled={busy || disabled} onPress={() => commit(current.filter((_, i) => i !== index))} icon={<Glyph d={["M18 6 6 18M6 6l12 12"]} />} />
                </View>
              </View>
            );
          })}
        </View>
      )}
      <Text role="status" accessibilityLiveRegion="polite" style={{ minHeight: 16, color: ink3, fontSize: xs, ...t.font("--font-body", "--weight-regular") }}>{fileUploadStatus(state, current.length, progress)}</Text>
    </View>
  );
}
