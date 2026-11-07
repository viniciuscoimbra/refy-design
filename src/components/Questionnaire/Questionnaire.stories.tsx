import type { Meta } from '@storybook/react';
import { Questionnaire } from './Questionnaire';
import { QuestionnaireExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-organisms-questionnaire',
  title: 'Components/Organisms/Questionnaire',
  component: Questionnaire,
  tags: ['autodocs'],
} satisfies Meta<typeof Questionnaire>;
export const Interativo = { name: "Interactive", render: () => <QuestionnaireExample /> };
