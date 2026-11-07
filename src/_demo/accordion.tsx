import type { AccordionItem } from "../components/Accordion";

export const accordionQuestions = [
  {
    id: "files",
    title: "How should I organize my files?",
    content: "Create collections and group files by project.",
  },
  {
    id: "share",
    title: "Can I share a collection?",
    content:
      "Choose who gets access and whether they can view or edit the files.",
  },
  {
    id: "archive",
    title: "How do I archive a project?",
    content:
      "Use Archive in the settings. The files stay available to browse and the project can be restored.",
  },
];
export const accordionItems: AccordionItem[] = accordionQuestions.map(
  (item) => ({
    ...item,
    content: <p>{item.content}</p>,
  }),
);
