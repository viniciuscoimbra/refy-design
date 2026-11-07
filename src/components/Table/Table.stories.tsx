import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Table } from "./Table";
import type { Column } from "./Table";

interface Invoice {
  number: string;
  date: string;
  isoDate: string;
  description: string;
  status: "Paid" | "Pending" | "Closed";
  price: string;
  amount: number;
}

const rows: Invoice[] = [
  ["DOC-2026-0512", "May 02, 2026", "2026-05-02", "Team Pro plan", "Paid", 2388],
  ["DOC-2026-0488", "Apr 28, 2026", "2026-04-28", "2,000 credits pack", "Paid", 299],
  ["DOC-2026-0441", "Apr 17, 2026", "2026-04-17", "Individual plan", "Pending", 149],
  ["DOC-2026-0398", "Apr 02, 2026", "2026-04-02", "Monthly subscription", "Paid", 199],
  ["DOC-2026-0312", "Mar 14, 2026", "2026-03-14", "Extra credits", "Paid", 79],
  ["DOC-2026-0277", "Mar 03, 2026", "2026-03-03", "Team Starter plan", "Closed", 948],
  ["DOC-2026-0204", "Feb 21, 2026", "2026-02-21", "Monthly subscription", "Paid", 199],
  ["DOC-2026-0182", "Feb 08, 2026", "2026-02-08", "Message pack", "Pending", 59],
  ["DOC-2026-0121", "Jan 19, 2026", "2026-01-19", "Individual plan", "Paid", 149],
  ["DOC-2025-1192", "Dec 18, 2025", "2025-12-18", "Extra credits", "Paid", 79],
  ["DOC-2025-1161", "Dec 05, 2025", "2025-12-05", "Monthly subscription", "Closed", 199],
  ["DOC-2025-1102", "Nov 02, 2025", "2025-11-02", "Team Pro plan", "Paid", 2388],
].map(([number, date, isoDate, description, status, amount]) => ({
  number: String(number),
  date: String(date),
  isoDate: String(isoDate),
  description: String(description),
  status: status as Invoice["status"],
  amount: Number(amount),
  price: Number(amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
}));

const columns: Column<Invoice>[] = [
  { key: "number", header: "Number", sortable: true, cell: (row) => <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-1)" }}>{row.number}</span> },
  { key: "date", header: "Date", sortable: true, sortValue: (row) => row.isoDate, filterable: true, filterValue: (row) => row.isoDate.slice(0, 4), cell: (row) => row.date },
  { key: "description", header: "Description", filterable: true, cell: (row) => row.description },
  { key: "status", header: "Status", sortable: true, filterable: true, cell: (row) => <Badge tone={row.status === "Paid" ? "success" : row.status === "Pending" ? "warn" : "neutral"}>{row.status}</Badge> },
  { key: "value", header: "Amount", align: "num", sortable: true, sortValue: (row) => row.amount, filterable: true, filterValue: (row) => (row.amount >= 1000 ? "≥ R$ 1.000" : "< R$ 1.000"), cell: (row) => row.price },
];

const meta = {
  id: "components-organisms-table",
  title: "Components/Organisms/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Canonical Data Table: combines search, facets, sorting, pagination and a rows-per-page selector. `loading`, `error` and `empty` are mutually exclusive states; interactive rows respond to click, Enter and Space. Wide content scrolls inside its own container.",
      },
    },
  },
  argTypes: {
    columns: { control: false }, rows: { control: false }, rowKey: { control: false },
    rowLabel: { control: false }, searchMatch: { control: false }, pagination: { control: false },
    empty: { control: "text" }, searchable: { control: "boolean" }, searchPlaceholder: { control: "text" },
    loading: { control: "boolean" }, error: { control: "text" }, onRowClick: { action: "row-click" },
  },
} satisfies Meta<typeof Table>;
export default meta;

type Story = StoryObj<typeof Table>;

/** Faithful composition: search, four facets, sorting, pagination and actionable rows. */
export const DataTable: Story = {
  render: (args) => {
    const [selected, setSelected] = useState("No invoice open.");
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <Table
          {...args}
          caption="Account invoices"
          searchable
          searchPlaceholder="Search invoices…"
          columns={columns}
          rows={rows}
          rowKey={(row: Invoice) => row.number}
          rowLabel={(row: Invoice) => `Open invoice ${row.number}`}
          onRowClick={(row: Invoice) => setSelected(`Invoice ${row.number} opened.`)}
          pagination={{ pageSize: 5, pageSizeOptions: [5, 10, 20] }}
          minTableWidth={760}
        />
        <p aria-live="polite" style={{ margin: 0, color: "var(--ink-3)", fontSize: "var(--text-xs)" }}>{selected}</p>
      </div>
    );
  },
};

/** The same component switches loading → real content. */
export const Loading: Story = {
  render: (args) => {
    const [loading, setLoading] = useState(true);
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <Button size="sm" style={{ justifySelf: "start" }} onClick={() => setLoading((value) => !value)}>
          {loading ? "Finish loading" : "Load again"}
        </Button>
        <Table {...args} caption="Invoices loading" columns={columns} rows={rows.slice(0, 4)} rowKey={(row: Invoice) => row.number} loading={loading} />
      </div>
    );
  },
};

/** Retry removes the error and reveals the rows. */
export const Erro: Story = { name: "Error",
  render: (args) => {
    const [failed, setFailed] = useState(true);
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <Table
          {...args}
          caption="Invoices that failed to load"
          columns={columns}
          rows={rows.slice(0, 3)}
          rowKey={(row: Invoice) => row.number}
          error={failed ? "The invoices could not be loaded." : undefined}
        />
        {failed && <Button size="sm" style={{ justifySelf: "start" }} onClick={() => setFailed(false)}>Try again</Button>}
      </div>
    );
  },
};

/** No rows: a neutral empty state, without an orange surface. */
export const Vazia: Story = { name: "Empty",
  render: (args) => <Table {...args} caption="No invoices" columns={columns} rows={[]} rowKey={(row: Invoice) => row.number} empty="No invoices yet." />,
};

/** Extreme columns and texts stay readable with local horizontal scrolling. */
export const ConteudoLongo: Story = { name: "Long content",
  render: (args) => (
    <div style={{ maxWidth: 620 }}>
      <Table
        {...args}
        caption="Invoice with long content"
        columns={[
          ...columns.slice(0, 3),
          { key: "note", header: "Detailed operational note", width: "420px", cell: () => "Reconciliation pending after the billing owner changed and the organization's charge was reprocessed automatically." },
          ...columns.slice(3),
        ]}
        rows={rows.slice(0, 3)}
        rowKey={(row: Invoice) => row.number}
        minTableWidth={1180}
      />
    </div>
  ),
};
