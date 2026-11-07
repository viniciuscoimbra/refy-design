import { useState } from 'react';
import {
  AlertDialog,
  AvatarGroup,
  Badge,
  BillingCard,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  ConnectorCard,
  DangerZone,
  DangerZoneRow,
  DecisionActions,
  Drawer,
  EmptyState,
  FabMenu,
  FileUpload,
  HelpMenu,
  HoverCard,
  Input,
  Menu,
  Modal,
  PageHeader,
  PersonCell,
  PlanCard,
  Popover,
  SettingRow,
  SplitButton,
  StickyBar,
  StickyFooter,
  Switch,
  Table,
  Textarea,
  ToastRegion,
  UserMenu,
} from '../index';
import type { DecisionAction, ToastData } from '../index';

const stack = { display: 'grid', gap: 'var(--space-4)', minWidth: 0 } as const;
const actions = { display: 'flex', flexWrap: 'wrap', gap: 8 } as const;
function download(text: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: 'text/plain;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
export function DecisionActionsExample() {
  const [selected, setSelected] = useState<DecisionAction>();
  return (
    <div style={stack}>
      <DecisionActions
        activeAction={selected}
        state={selected ? 'completed' : 'idle'}
        onAction={setSelected}
        statusMessage={
          selected
            ? `Decision recorded: ${selected === 'save' ? 'save' : selected === 'reject' ? 'discard' : 'select'}.`
            : undefined
        }
      />
      {selected && (
        <Button onClick={() => setSelected(undefined)}>Review decision</Button>
      )}
    </div>
  );
}
export function PageHeaderExample() {
  const [open, setOpen] = useState(false),
    [name, setName] = useState(''),
    [projects, setProjects] = useState(['Aurora project']);
  return (
    <div style={stack}>
      <PageHeader
        eyebrow="Workspace"
        title="Projects"
        lead={`${projects.length} projects in this demo`}
        actions={
          <>
            <Button
              onClick={() => download(projects.join('\n'), 'projects.txt')}
            >
              Export
            </Button>
            <Button variant="primary" onClick={() => setOpen(true)}>
              New project
            </Button>
          </>
        }
      />
      <ul>
        {projects.map((project) => (
          <li key={project}>{project}</li>
        ))}
      </ul>
      <Modal open={open} onClose={() => setOpen(false)} title="Create project">
        <form
          style={stack}
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            setProjects((rows) => [...rows, name.trim()]);
            setName('');
            setOpen(false);
          }}
        >
          <Input
            label="Project name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="submit" variant="primary">
            Create project
          </Button>
        </form>
      </Modal>
    </div>
  );
}
export function StickyBarExample() {
  const [approved, setApproved] = useState(false);
  return (
    <StickyBar
      title="Material review"
      status={
        <Badge tone={approved ? 'success' : 'warn'}>
          {approved ? 'Approved' : 'In review'}
        </Badge>
      }
      actions={
        <Button onClick={() => setApproved(!approved)}>
          {approved ? 'Reopen review' : 'Approve material'}
        </Button>
      }
    />
  );
}
export function StickyFooterExample() {
  const [saved, setSaved] = useState('Aurora project'),
    [value, setValue] = useState(saved),
    [status, setStatus] = useState('');
  return (
    <form
      style={stack}
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(value);
        setStatus('Changes saved in this session.');
      }}
    >
      <Input
        label="Project name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p>Saved value: {saved}</p>
      <StickyFooter
        start={value === saved ? 'No changes' : 'Unsaved changes'}
      >
        <Button
          type="button"
          onClick={() => {
            setValue(saved);
            setStatus('Editing cancelled.');
          }}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Save changes
        </Button>
      </StickyFooter>
      {status && <p role="status">{status}</p>}
    </form>
  );
}
export function SettingRowExample() {
  const [active, setActive] = useState(false);
  return (
    <SettingRow
      title="Two-step authentication"
      description="Demo setting; no real account changes."
      meta={active ? 'ON' : 'OFF'}
      actions={
        <Button onClick={() => setActive(!active)}>
          {active ? 'Turn off' : 'Turn on'}
        </Button>
      }
    />
  );
}
export function PlanCardExample() {
  const [selected, setSelected] = useState('Essential');
  return (
    <div style={stack}>
      <p>Local plan choice, no charge.</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))',
          gap: 16,
        }}
      >
        {['Essential', 'Team'].map((name, i) => (
          <PlanCard
            key={name}
            name={name}
            price={i ? 'R$ 199' : 'R$ 79'}
            period="/mo"
            features={
              i
                ? ['Up to 10 members', 'Shared projects']
                : ['1 member', 'Personal projects']
            }
            current={selected === name}
            cta={
              <Button onClick={() => setSelected(name)}>Choose {name}</Button>
            }
          />
        ))}
      </div>
      <p role="status">Selected plan: {selected}</p>
    </div>
  );
}
export function BillingCardExample() {
  const [panel, setPanel] = useState(''),
    [digits, setDigits] = useState('4242'),
    [draft, setDraft] = useState('4242');
  return (
    <>
      <BillingCard
        methodLabel="Demo method"
        lastDigits={digits}
        methodMeta="Do not use real data. Nothing is charged."
        status={<Badge tone="success">Active</Badge>}
        nextChargeAmount="R$ 199"
        nextChargeDate="on Oct 24, 2026"
        actions={
          <>
            <Button onClick={() => setPanel('invoices')}>View invoices</Button>
            <Button
              onClick={() => {
                setDraft(digits);
                setPanel('method');
              }}
            >
              Change card
            </Button>
          </>
        }
      />
      <Drawer
        open={Boolean(panel)}
        onOpenChange={(open) => {
          if (!open) setPanel('');
        }}
        title={
          panel === 'invoices'
            ? 'Sample invoices'
            : 'Edit demo method'
        }
      >
        {panel === 'invoices' ? (
          <Table
            caption="Sample invoices"
            rows={[
              { id: 'out', month: 'October', value: 'R$ 199', status: 'Paid' },
              { id: 'set', month: 'September', value: 'R$ 199', status: 'Paid' },
            ]}
            rowKey={(r) => r.id}
            columns={[
              { key: 'month', header: 'Month', cell: (r) => r.month },
              { key: 'value', header: 'Amount', cell: (r) => r.value },
              { key: 'status', header: 'State', cell: (r) => r.status },
            ]}
          />
        ) : (
          <form
            style={stack}
            onSubmit={(e) => {
              e.preventDefault();
              setDigits(draft);
              setPanel('');
            }}
          >
            <Input
              label="Four made-up digits"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              required
              value={draft}
              onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
              hint="Just a made-up four-digit identifier."
            />
            <Button type="submit" variant="primary">
              Save method
            </Button>
          </form>
        )}
      </Drawer>
    </>
  );
}
export function ConnectorCardExample() {
  const [open, setOpen] = useState(false),
    [active, setActive] = useState(true),
    [sync, setSync] = useState(true),
    [draft, setDraft] = useState(true);
  return (
    <>
      <ConnectorCard
        name="File library"
        description="Demo connection, with no access to an external service."
        status={
          <Badge tone={active ? 'success' : 'neutral'}>
            {active ? 'Connected' : 'Disconnected'}
          </Badge>
        }
        meta={
          active
            ? `Auto update: ${sync ? 'on' : 'off'}`
            : 'No service connected'
        }
        actions={
          <Button
            onClick={() => {
              setDraft(sync);
              setOpen(true);
            }}
          >
            {active ? 'Configure' : 'Connect'}
          </Button>
        }
      />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Set up integration"
      >
        <form
          style={stack}
          onSubmit={(e) => {
            e.preventDefault();
            setActive(true);
            setSync(draft);
            setOpen(false);
          }}
        >
          <Switch
            label="Auto update"
            checked={draft}
            onChange={(e) => setDraft(e.target.checked)}
          />
          <div style={actions}>
            <Button type="submit" variant="primary">
              Save settings
            </Button>
            {active && (
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  setActive(false);
                  setOpen(false);
                }}
              >
                Disconnect
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
}
export function DangerZoneExample() {
  const [open, setOpen] = useState(false),
    [deleted, setDeleted] = useState(false);
  return (
    <div style={stack}>
      {deleted ? (
        <>
          <p role="status">Sample account deleted in this session.</p>
          <Button onClick={() => setDeleted(false)}>
            Restore demo
          </Button>
        </>
      ) : (
        <DangerZone>
          <DangerZoneRow
            title="Delete sample account"
            description="This flow only removes the made-up data in this demo."
            actionLabel="Delete account"
            onConfirm={() => setOpen(true)}
          />
        </DangerZone>
      )}
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete sample account?"
        destructive
        confirmLabel="Confirm deletion"
        onConfirm={() => {
          setDeleted(true);
          setOpen(false);
        }}
      >
        Only this demo will be reset. No real account is affected.
      </AlertDialog>
    </div>
  );
}
export function EmptyStateExample() {
  const [query, setQuery] = useState('No results');
  return (
    <div style={stack}>
      <Input
        label="Filter materials"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {['Content guide', 'Visual references'].filter((name) =>
        name.toLowerCase().includes(query.toLowerCase()),
      ).length ? (
        <ul>
          {['Content guide', 'Visual references']
            .filter((name) => name.toLowerCase().includes(query.toLowerCase()))
            .map((name) => (
              <li key={name}>{name}</li>
            ))}
        </ul>
      ) : (
        <EmptyState
          title="No items found"
          message="Remove the filter to see the materials."
          action={<Button onClick={() => setQuery('')}>Clear filters</Button>}
        />
      )}
    </div>
  );
}
export function MenuExample() {
  const [open, setOpen] = useState(false),
    [name, setName] = useState('Content guide'),
    [draft, setDraft] = useState(name),
    [editing, setEditing] = useState(false),
    [archived, setArchived] = useState(false);
  return (
    <div style={stack}>
      <Menu
        open={open}
        onOpenChange={setOpen}
        entries={[
          {
            id: 'rename',
            label: 'Rename',
            onSelect: () => {
              setDraft(name);
              setEditing(true);
            },
          },
          {
            id: 'archive',
            label: archived ? 'Restore' : 'Archive',
            onSelect: () => setArchived(!archived),
          },
        ]}
      >
        <Button onClick={() => setOpen(!open)}>Actions ▾</Button>
      </Menu>
      <p>
        {name} · {archived ? 'Archived' : 'Available'}
      </p>
      {editing && (
        <form
          style={stack}
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) {
              setName(draft.trim());
              setEditing(false);
            }
          }}
        >
          <Input
            label="Material name"
            required
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Button type="submit">Save name</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </form>
      )}
    </div>
  );
}
export function UserMenuExample() {
  const [panel, setPanel] = useState(''),
    [name, setName] = useState('João Mendes'),
    [draft, setDraft] = useState(name),
    [signedIn, setSignedIn] = useState(true),
    [notifications, setNotifications] = useState(true);
  return (
    <div style={stack}>
      {signedIn ? (
        <UserMenu
          user={{ name, email: 'joao@example.com', initials: 'JM' }}
          onSelect={(id) => {
            if (id === 'logout') setSignedIn(false);
            else {
              setDraft(name);
              setPanel(id);
            }
          }}
        />
      ) : (
        <>
          <p role="status">You signed out of the sample session.</p>
          <Button onClick={() => setSignedIn(true)}>Sign in again</Button>
        </>
      )}
      <Drawer
        open={Boolean(panel)}
        onOpenChange={(open) => {
          if (!open) setPanel('');
        }}
        title={panel === 'profile' ? 'Profile' : 'Account settings'}
      >
        <form
          style={stack}
          onSubmit={(e) => {
            e.preventDefault();
            setName(draft);
            setPanel('');
          }}
        >
          <Input
            label="Name"
            required
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Switch
            label="Get notifications"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
          />
          <Button type="submit">Save profile</Button>
        </form>
      </Drawer>
    </div>
  );
}
export function HelpMenuExample() {
  const [panel, setPanel] = useState(''),
    [message, setMessage] = useState(''),
    [sent, setSent] = useState(false);
  return (
    <>
      <HelpMenu
        onSelect={(id) => {
          setSent(false);
          setPanel(id);
        }}
      />
      <Drawer
        open={Boolean(panel)}
        onOpenChange={(open) => {
          if (!open) setPanel('');
        }}
        title={
          panel === 'docs'
            ? 'Documentation'
            : panel === 'shortcuts'
              ? 'Keyboard shortcuts'
              : 'Sample support'
        }
      >
        {panel === 'docs' ? (
          <>
            <h3>How to use the component</h3>
            <p>
              Choose a menu option. In your product, point it to the matching documentation.
            </p>
          </>
        ) : panel === 'shortcuts' ? (
          <dl>
            <dt>Arrows</dt>
            <dd>Move through menu options</dd>
            <dt>Enter</dt>
            <dd>Choose an option</dd>
            <dt>Escape</dt>
            <dd>Close the current layer</dd>
          </dl>
        ) : sent ? (
          <p role="status">
            Message logged locally. Nothing was sent.
          </p>
        ) : (
          <form
            style={stack}
            onSubmit={(e) => {
              e.preventDefault();
              if (message.trim()) setSent(true);
            }}
          >
            <Textarea
              label="How can we help?"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button type="submit">Log sample message</Button>
          </form>
        )}
      </Drawer>
    </>
  );
}
export function AvatarGroupExample() {
  const team = [
    'Joana Martins',
    'Marcos Silva',
    'Renata Costa',
    'Paulo Braga',
    'Ana Prado',
    'Caio Fernandes',
    'Duda Rocha',
  ].map((name) => ({ name }));
  const [person, setPerson] = useState('');
  return (
    <>
      <AvatarGroup
        items={team}
        max={4}
        onItemClick={(item) => setPerson(item.name)}
        onOverflowClick={() => setPerson('All members')}
      />
      <Drawer
        open={Boolean(person)}
        onOpenChange={(open) => {
          if (!open) setPerson('');
        }}
        title={person}
      >
        {(person === 'All members'
          ? team
          : team.filter((item) => item.name === person)
        ).map((item) => (
          <PersonCell
            key={item.name}
            name={item.name}
            secondary="Team member"
          />
        ))}
      </Drawer>
    </>
  );
}
export function BreadcrumbExample() {
  const [depth, setDepth] = useState(2),
    names = ['Projects', 'Library', 'Content guide'];
  return (
    <div style={stack}>
      <Breadcrumb
        items={names
          .slice(0, depth + 1)
          .map((label, i) => ({ label, onClick: () => setDepth(i) }))}
      />
      <Card>
        <h3>{names[depth]}</h3>
        {depth < 2 ? (
          <Button onClick={() => setDepth(depth + 1)}>
            Open {names[depth + 1]}
          </Button>
        ) : (
          <p>Content of the selected guide.</p>
        )}
      </Card>
    </div>
  );
}
export function PopoverExample() {
  const [open, setOpen] = useState(false),
    [draft, setDraft] = useState(false),
    [onlyApproved, setOnlyApproved] = useState(false);
  const rows = [
    { name: 'Content guide', approved: true },
    { name: 'Visual references', approved: false },
  ];
  return (
    <div style={stack}>
      <Popover
        open={open}
        onOpenChange={setOpen}
        label="Filters"
        content={
          <div style={stack}>
            <Checkbox
              label="Approved only"
              checked={draft}
              onChange={(e) => setDraft(e.target.checked)}
            />
            <Button
              onClick={() => {
                setOnlyApproved(draft);
                setOpen(false);
              }}
            >
              Apply filters
            </Button>
          </div>
        }
      >
        <Button
          onClick={() => {
            setDraft(onlyApproved);
            setOpen(!open);
          }}
        >
          Filter
        </Button>
      </Popover>
      <ul>
        {rows
          .filter((row) => !onlyApproved || row.approved)
          .map((row) => (
            <li key={row.name}>
              {row.name} · {row.approved ? 'Approved' : 'In review'}
            </li>
          ))}
      </ul>
    </div>
  );
}
export function HoverCardExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <HoverCard
        content={
          <PersonCell
            name="Ana Lima"
            secondary="Designer · Creative team"
          />
        }
      >
        <Button variant="ghost" onClick={() => setOpen(true)}>
          Ana Lima
        </Button>
      </HoverCard>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Ana Lima's profile"
      >
        <PersonCell name="Ana Lima" secondary="ana@example.com" />
        <p>Owns the library and the material reviews.</p>
      </Modal>
    </>
  );
}
export function SplitButtonExample() {
  const [status, setStatus] = useState('');
  const exportFile = (format: string) => {
    download(
      format === 'JSON'
        ? JSON.stringify(
            { materials: ['Content guide', 'Visual references'] },
            null,
            2,
          )
        : 'material\nContent guide\nVisual references',
      `materials.${format.toLowerCase()}`,
    );
    setStatus(`${format} file ready to download.`);
  };
  return (
    <div style={stack}>
      <SplitButton
        label="Export"
        options={['CSV', 'JSON'].map((format) => ({
          id: format,
          label: format,
          onSelect: () => exportFile(format),
        }))}
      />
      <p role="status">
        {status || 'Choose the format and export the local materials.'}
      </p>
    </div>
  );
}
export function FabMenuExample() {
  const [panel, setPanel] = useState(''),
    [query, setQuery] = useState(''),
    [name, setName] = useState(''),
    [materials, setMaterials] = useState([
      'Content guide',
      'Visual references',
    ]);
  return (
    <div style={stack}>
      <FabMenu
        actions={[
          { id: 'create', label: 'New material' },
          { id: 'search', label: 'Search content' },
          { id: 'import', label: 'Import file' },
        ]}
        onSelect={setPanel}
      />
      <p>{materials.length} materials in the demo.</p>
      <Drawer
        open={Boolean(panel)}
        onOpenChange={(open) => {
          if (!open) setPanel('');
        }}
        title={
          panel === 'search'
            ? 'Search content'
            : panel === 'import'
              ? 'Import file'
              : 'New material'
        }
      >
        {panel === 'search' ? (
          <div style={stack}>
            <Input
              label="Search materials"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <ul>
              {materials
                .filter((item) =>
                  item.toLowerCase().includes(query.toLowerCase()),
                )
                .map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
            </ul>
          </div>
        ) : panel === 'import' ? (
          <FileUpload
            label="Add local file"
            onFilesChange={(files) => {
              setMaterials((items) => [
                ...items,
                ...files.map((file) => file.name),
              ]);
            }}
          />
        ) : (
          <form
            style={stack}
            onSubmit={(event) => {
              event.preventDefault();
              if (name.trim()) {
                setMaterials((items) => [...items, name.trim()]);
                setName('');
                setPanel('');
              }
            }}
          >
            <Input
              label="New material name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Button type="submit" variant="primary">
              Create material
            </Button>
          </form>
        )}
      </Drawer>
    </div>
  );
}
export function ToastExample() {
  const [location, setLocation] = useState('Library'),
    [toasts, setToasts] = useState<ToastData[]>([]);
  return (
    <div style={stack}>
      <p>Material location: {location}</p>
      <div style={actions}>
        <Button
          onClick={() =>
            setToasts([
              { id: 'success', title: 'Preferences saved', tone: 'success' },
            ])
          }
        >
          Success
        </Button>
        <Button
          onClick={() =>
            setToasts([
              {
                id: 'error',
                title: 'Could not save',
                description: 'Simulated error to test the message.',
                tone: 'danger',
              },
            ])
          }
        >
          Error
        </Button>
        <Button
          onClick={() => {
            setLocation('File');
            setToasts([
              {
                id: 'move',
                title: 'Material moved to Archive',
                duration: null,
                action: {
                  label: 'Undo',
                  onClick: () => {
                    setLocation('Library');
                    setToasts([]);
                  },
                },
              },
            ]);
          }}
        >
          With action
        </Button>
      </div>
      <ToastRegion
        toasts={toasts}
        onDismiss={(id) =>
          setToasts((rows) => rows.filter((row) => row.id !== id))
        }
      />
    </div>
  );
}
