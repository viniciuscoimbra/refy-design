import { useState } from "react";
import { Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import type { Question, QuestionnaireCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { Button } from "./Button";
import { Input } from "./Input";
import { ProgressBar } from "./ProgressBar";
import { RadioGroup } from "./RadioGroup";

export type { Question };
export interface QuestionnaireProps extends QuestionnaireCoreProps {
  style?: StyleProp<ViewStyle>;
}

/** Uma pergunta por vez, com progresso, obrigatoriedade e revisão depois do envio. Mesmo fluxo da web. */
export function Questionnaire({ questions, onSubmit, style }: QuestionnaireProps) {
  const t = useRefy();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const gap = t.size("--space-4", 16);
  const body = { color: t.pick<string>("--ink-2", "--on-surface-variant"), fontSize: t.pick<number>("--text-sm", 14), lineHeight: Math.round(t.pick<number>("--text-sm", 14) * 1.5), ...t.font("--font-body", "--weight-regular") };
  const question = questions[Math.min(step, questions.length - 1)];
  if (!question) return <Text style={[body, style as object]}>Nenhuma pergunta disponível.</Text>;
  if (complete) {
    return (
      <View accessibilityLiveRegion="polite" style={[{ gap }, style]}>
        <Text style={body}>Respostas enviadas.</Text>
        <Button onPress={() => { setStep(0); setComplete(false); }} style={{ alignSelf: "flex-start" }}>Revisar respostas</Button>
      </View>
    );
  }
  const update = (value: string) => {
    setAnswers((current) => ({ ...current, [question.id]: value }));
    setError("");
  };
  const submit = () => {
    if (question.required && !answers[question.id]?.trim()) {
      setError("Responda para continuar.");
      return;
    }
    if (step < questions.length - 1) setStep(step + 1);
    else {
      onSubmit(answers);
      setComplete(true);
    }
  };
  const last = step === questions.length - 1;
  return (
    <View style={[{ gap }, style]}>
      <ProgressBar value={((step + 1) / questions.length) * 100} accessibilityLabel="Progresso do questionário" />
      <Text style={body}>{`Pergunta ${step + 1} de ${questions.length}`}</Text>
      {question.options ? (
        <RadioGroup key={question.id} label={question.title} options={question.options} value={answers[question.id] ?? ""} onChange={update} />
      ) : (
        <Input key={question.id} label={question.title} value={answers[question.id] ?? ""} onChangeText={update} hint={question.description} returnKeyType={last ? "send" : "next"} onSubmitEditing={submit} />
      )}
      {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={[body, { color: t.pick<string>("--danger-ink", "--danger", "--error") }]}>{error}</Text> : null}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button disabled={step === 0} onPress={() => { setStep(step - 1); setError(""); }}>Voltar</Button>
        <Button variant="primary" onPress={submit}>{last ? "Enviar respostas" : "Continuar"}</Button>
      </View>
    </View>
  );
}
