import { Accordion } from '../Accordion';
import { Badge } from '../Badge';
import { CodeBlock } from '../CodeBlock';
import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
export interface TraceStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  duration?: string;
  detail: string;
}
export interface TraceProps {
  steps: TraceStep[];
  label?: string;
}
export function Trace({ steps, label: labelProp }: TraceProps) {
  const m = useComponentMessages("trace", enMessages.trace);
  const label = labelProp ?? m.label;
  const labels = { pending: m.pending, running: m.running, complete: m.complete, error: m.error };
  return (
    <section aria-label={label}>
      <Accordion
        type="multiple"
        items={steps.map((step) => ({
          id: step.id,
          title: (
            <span>
              {step.title}{' '}
              <Badge
                tone={
                  step.status === 'error'
                    ? 'danger'
                    : step.status === 'complete'
                      ? 'success'
                      : 'neutral'
                }
              >
                {labels[step.status]}
              </Badge>{' '}
              {step.duration}
            </span>
          ),
          content: (
            <CodeBlock label={step.title} code={step.detail} language="json" />
          ),
        }))}
      />
    </section>
  );
}
