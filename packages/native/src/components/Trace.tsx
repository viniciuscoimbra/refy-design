import { Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import type { TraceCoreProps, TraceStep } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { Accordion } from "./Accordion";
import { Badge } from "./Badge";
import { CodeBlock } from "./CodeBlock";
import type { CodeBlockProps } from "./CodeBlock";

export type { TraceStep };
export interface TraceProps extends TraceCoreProps {
  /** Só no nativo: repassado ao CodeBlock de cada etapa (área de transferência, realce). */
  codeBlockProps?: Pick<CodeBlockProps, "copyToClipboard" | "highlight">;
  style?: StyleProp<ViewStyle>;
}

const labels: Record<TraceStep["status"], string> = { pending: "Aguardando", running: "Em execução", complete: "Concluído", error: "Erro" };

/** Etapas de uma execução: título, estado e duração; abrir a etapa mostra o detalhe em JSON. */
export function Trace({ steps, label = "Etapas da execução", codeBlockProps, style }: TraceProps) {
  const t = useRefy();
  const sm = t.pick<number>("--text-sm", 14);
  return (
    <View accessibilityLabel={label} style={style}>
      <Accordion
        type="multiple"
        items={steps.map((step) => ({
          id: step.id,
          title: (
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
              <Text style={{ color: t.pick<string>("--ink-1"), fontSize: sm, ...t.font("--font-body", "--weight-semi") }}>{step.title}</Text>
              <Badge tone={step.status === "error" ? "danger" : step.status === "complete" ? "success" : "neutral"}>{labels[step.status]}</Badge>
              {step.duration ? <Text style={{ color: t.pick<string>("--ink-3"), fontSize: t.pick<number>("--text-xs", 12), ...t.font(["--interface-detail-font", "--font-mono"], "--weight-regular") }}>{step.duration}</Text> : null}
            </View>
          ),
          content: <CodeBlock label={step.title} code={step.detail} language="json" {...codeBlockProps} />,
        }))}
      />
    </View>
  );
}
