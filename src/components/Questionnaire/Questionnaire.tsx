"use client";
import { useId, useState } from 'react';
import { Input } from '../Input';
import { RadioGroup } from '../RadioGroup';
import { Button } from '../Button';
import { ProgressBar } from '../ProgressBar';
import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
export interface Question {
  id: string;
  title: string;
  description?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}
export interface QuestionnaireProps {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => void;
}
export function Questionnaire({ questions, onSubmit }: QuestionnaireProps) {
  const m = useComponentMessages("questionnaire", enMessages.questionnaire);
  const [step, setStep] = useState(0),
    [answers, setAnswers] = useState<Record<string, string>>({}),
    [error, setError] = useState(''),
    [complete, setComplete] = useState(false),
    id = useId();
  const question = questions[Math.min(step, questions.length - 1)];
  if (!question) return <p>{m.empty}</p>;
  if (complete)
    return (
      <div role="status">
        <p>{m.sent}</p>
        <Button
          onClick={() => {
            setStep(0);
            setComplete(false);
          }}
        >
          {m.review}
        </Button>
      </div>
    );
  const update = (value: string) => {
    setAnswers((current) => ({ ...current, [question.id]: value }));
    setError('');
  };
  return (
    <form
      style={{ display: 'grid', gap: 'var(--space-4)' }}
      onSubmit={(event) => {
        event.preventDefault();
        if (question.required && !answers[question.id]?.trim()) {
          setError(m.required);
          return;
        }
        if (step < questions.length - 1) setStep(step + 1);
        else {
          onSubmit(answers);
          setComplete(true);
        }
      }}
    >
      <ProgressBar
        value={((step + 1) / questions.length) * 100}
        aria-label={m.progress}
      />
      <p>
        {m.step(step + 1, questions.length)}
      </p>
      {question.options ? (
        <RadioGroup
          key={question.id}
          name={`${id}-${question.id}`}
          label={question.title}
          options={question.options}
          value={answers[question.id] ?? ''}
          onChange={update}
        />
      ) : (
        <Input
          label={question.title}
          value={answers[question.id] ?? ''}
          onChange={(event) => update(event.target.value)}
          hint={question.description}
        />
      )}
      {error && <p role="alert">{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          type="button"
          disabled={step === 0}
          onClick={() => {
            setStep(step - 1);
            setError('');
          }}
        >
          {m.back}
        </Button>
        <Button type="submit" variant="primary">
          {step === questions.length - 1 ? m.submit : m.next}
        </Button>
      </div>
    </form>
  );
}
