import type { Meta } from '@storybook/react';
import { Trace } from './Trace';
import { TraceExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-organisms-trace',
  title: 'Components/Organisms/Trace',
  component: Trace,
  tags: ['autodocs'],
} satisfies Meta<typeof Trace>;
export const Interativo = { name: "Interactive", render: () => <TraceExample /> };

/** Explicit public state; it does not call external services. */
export const ComErro = { name: "With error", render: () => <Trace steps={[{ id: "read", title: "Read references", status: "complete", detail: '{"references": 3}' }, { id: "process", title: "Process content", status: "error", detail: '{"error": "Could not process. Try again."}' }]} /> };
