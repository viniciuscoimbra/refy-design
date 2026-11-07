import type { Meta } from '@storybook/react';
import { AlertDialog } from './AlertDialog';
import { AlertDialogExample } from '../../_demo/FoundationExamples';
export default {
  id: 'components-organisms-alertdialog',
  title: 'Components/Organisms/AlertDialog',
  component: AlertDialog,
  tags: ['autodocs'],
} satisfies Meta<typeof AlertDialog>;
export const Interativo = { name: "Interactive", render: () => <AlertDialogExample /> };
