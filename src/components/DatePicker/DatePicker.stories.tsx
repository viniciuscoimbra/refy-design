import type { Meta } from '@storybook/react';
import { DatePicker } from './DatePicker';
import { DatePickerExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-molecules-datepicker',
  title: 'Components/Molecules/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
} satisfies Meta<typeof DatePicker>;
export const Interativo = { name: "Interactive", render: () => <DatePickerExample /> };

/** Explicit public state; it does not call external services. */
export const Desabilitado = { name: "Disabled", render: () => <DatePicker label="Review date" defaultValue={new Date(2026, 6, 23)} disabled /> };
