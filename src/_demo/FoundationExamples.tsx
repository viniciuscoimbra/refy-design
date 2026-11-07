import { useId, useState } from "react";
import {
  AlertDialog,
  AspectRatio,
  Avatar,
  Bubble,
  Button,
  Card,
  Carousel,
  Collapsible,
  ContextMenu,
  DatePicker,
  Direction,
  Input,
  Item,
  Label,
  Marker,
  Menubar,
  Message,
  MessageScroller,
  NavigationMenu,
  Prose,
  Questionnaire,
  Resizable,
  ScrollArea,
  Spinner,
  Trace,
} from "../index";
const stack = { display: "grid", gap: "var(--space-4)", minWidth: 0 } as const;
export function AlertDialogExample() {
  const [open, setOpen] = useState(false),
    [removed, setRemoved] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={removed}>
        Remove material
      </Button>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Remove this material?"
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          setRemoved(true);
          setOpen(false);
        }}
      >
        The sample material will be removed from this session.
      </AlertDialog>
      {removed && (
        <>
          <p role="status">Material removed.</p>
          <Button onClick={() => setRemoved(false)}>Restore material</Button>
        </>
      )}
    </>
  );
}
export function AspectRatioExample() {
  return (
    <AspectRatio
      ratio={16 / 9}
      style={{
        display: "grid",
        placeItems: "center",
        background: "var(--primary-soft)",
        borderRadius: "var(--radius-lg)",
        color: "var(--primary-ink)",
      }}
    >
      16:9 ratio
    </AspectRatio>
  );
}
export function BubbleExample() {
  const [sent, setSent] = useState(false);
  return (
    <div style={stack}>
      <Bubble>Can we review the material today?</Bubble>
      {sent && <Bubble side="end">Yes, the review is confirmed.</Bubble>}
      <Button onClick={() => setSent(!sent)}>
        {sent ? "Clear answer" : "Reply"}
      </Button>
    </div>
  );
}
export function CarouselExample() {
  return (
    <Carousel
      items={["Research", "Prototype", "Validation"].map((label, index) => ({
        id: label,
        label,
        content: (
          <Card>
            <p>Stage {index + 1}</p>
            <h3>{label}</h3>
            <p>
              {
                [
                  "Organize the project's references and needs.",
                  "Try the layout with the existing components.",
                  "Review the experience before sharing.",
                ][index]
              }
            </p>
          </Card>
        ),
      }))}
    />
  );
}
export function CollapsibleExample() {
  return (
    <Collapsible title="Project files">
      <ul>
        <li>Content guide.pdf</li>
        <li>Interface references.fig</li>
      </ul>
    </Collapsible>
  );
}
export function ContextMenuExample() {
  const [value, setValue] = useState("Material available");
  return (
    <div style={stack}>
      <ContextMenu
        entries={[
          { id: "copy", label: "Duplicate material" },
          { id: "archive", label: "Archive material" },
        ]}
        onSelect={(id) =>
          setValue(
            id === "copy" ? "Material copy created" : "Material archived",
          )
        }
      >
        Right-click or use Shift + F10.
      </ContextMenu>
      <p role="status">{value}</p>
    </div>
  );
}
export function DatePickerExample() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <div style={stack}>
      <DatePicker label="Review date" value={date} onChange={setDate} />
      <p role="status">
        {date
          ? `Review: ${date.toLocaleDateString("en")}`
          : "No date selected."}
      </p>
    </div>
  );
}
export function DirectionExample() {
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr");
  return (
    <div style={stack}>
      <div>
        <Button onClick={() => setDir("ltr")} aria-pressed={dir === "ltr"}>
          Left to right
        </Button>
        <Button onClick={() => setDir("rtl")} aria-pressed={dir === "rtl"}>
          Right to left
        </Button>
      </div>
      <Direction dir={dir}>
        <p>Home / Library / Material</p>
        <Input label="Material name" placeholder="Write a name" />
      </Direction>
    </div>
  );
}
export function ItemExample() {
  const [selected, setSelected] = useState(false);
  return (
    <Item
      title="Content guide"
      description={
        selected ? "Material selected" : "12 pages · updated today"
      }
      media={<Avatar initials="GC" shape="square" />}
      selected={selected}
      onClick={() => setSelected(!selected)}
    />
  );
}
export function LabelExample() {
  const id = useId();
  return (
    <div style={stack}>
      <Label htmlFor={id}>Display name</Label>
      <Input id={id} placeholder="Your name" />
    </div>
  );
}
export function MarkerExample() {
  return (
    <p>
      {"Quickly find the passages "}
      <Marker>that matter for the decision</Marker> without losing the context of the content.
    </p>
  );
}
export function MenubarExample() {
  const [value, setValue] = useState("No command run.");
  return (
    <div style={stack}>
      <Menubar
        items={[
          {
            id: "file",
            label: "File",
            entries: [
              { id: "new", label: "New document" },
              { id: "save", label: "Save document" },
            ],
          },
          {
            id: "edit",
            label: "Edit",
            entries: [
              { id: "undo", label: "Undo change" },
              { id: "redo", label: "Redo change" },
            ],
          },
        ]}
        onSelect={(id) =>
          setValue(
            (
              {
                new: "Document created.",
                save: "Document saved.",
                undo: "Change undone.",
                redo: "Change redone.",
              } as Record<string, string>
            )[id],
          )
        }
      />
      <p role="status">{value}</p>
    </div>
  );
}
export function MessageExample() {
  return (
    <div style={{ ...stack, maxWidth: "48rem" }}>
      <Message author="Ana Lima" initials="AL" time="10:30">
        The library is ready for review. Check the references before approving the material.
      </Message>
      <Message author="You" initials="VC" time="10:32" side="end">
        I'll review the files and log the comments here.
      </Message>
    </div>
  );
}
export function MessageScrollerExample() {
  const [messages, setMessages] = useState(
    Array.from({ length: 8 }, (_, i) => `Project update ${i + 1}.`),
  );
  return (
    <div style={stack}>
      <MessageScroller>
        {messages.map((text, i) => (
          <Message
            key={i}
            author={i % 3 === 1 ? "You" : "Ana Lima"}
            initials={i % 3 === 1 ? "VC" : "AL"}
            time={`10:${String(30 + i).padStart(2, "0")}`}
            side={i % 3 === 1 ? "end" : "start"}
          >
            {text}
          </Message>
        ))}
      </MessageScroller>
      <Button
        onClick={() =>
          setMessages((rows) => [
            ...rows,
            `Project update ${rows.length + 1}.`,
          ])
        }
      >
        New message
      </Button>
    </div>
  );
}
export function NavigationMenuExample() {
  const [active, setActive] = useState("overview");
  return (
    <div style={stack}>
      <NavigationMenu
        activeId={active}
        onNavigate={setActive}
        items={[
          { id: "overview", label: "Overview" },
          { id: "library", label: "Library" },
          {
            id: "resources",
            label: "Resources",
            entries: [
              { id: "guides", label: "Guides" },
              { id: "templates", label: "Templates" },
            ],
          },
        ]}
      />
      <h3>
        {
          (
            {
              overview: "Project overview",
              library: "Library materials",
              guides: "Usage guides",
              templates: "Available templates",
            } as Record<string, string>
          )[active]
        }
      </h3>
    </div>
  );
}
export function QuestionnaireExample() {
  const [value, setValue] = useState("");
  return (
    <div style={stack}>
      <Questionnaire
        questions={[
          { id: "name", title: "What is the project's name?", required: true },
          {
            id: "goal",
            title: "What is the goal?",
            required: true,
            options: [
              { value: "organize", label: "Organize materials" },
              { value: "review", label: "Review deliveries" },
            ],
          },
        ]}
        onSubmit={(answers) =>
          setValue(
            `Project ${answers.name}: ${answers.goal === "organize" ? "organize materials" : "review deliveries"}.`,
          )
        }
      />
      {value && <p role="status">{value}</p>}
    </div>
  );
}
export function ResizableExample() {
  return (
    <Resizable
      first={
        <>
          <strong>Library</strong>
          <p>References and guides</p>
        </>
      }
      second={
        <>
          <strong>Preview</strong>
          <p>Drag the divider or use the arrows while it has focus.</p>
        </>
      }
    />
  );
}
export function ScrollAreaExample() {
  return (
    <ScrollArea role="region" aria-label="Scrollable materials" maxHeight={180}>
      <ul>
        {Array.from({ length: 20 }, (_, i) => (
          <li key={i} style={{ paddingBlock: 10 }}>
            Reference material {i + 1}
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
export function SpinnerExample() {
  const [loading, setLoading] = useState(true);
  return (
    <div style={stack}>
      {loading ? (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Spinner /> Preparing materials
        </span>
      ) : (
        <p role="status">Materials ready.</p>
      )}
      <Button onClick={() => setLoading(!loading)}>
        {loading ? "Finish example" : "Restart loading"}
      </Button>
    </div>
  );
}
export function TraceExample() {
  const [complete, setComplete] = useState(false);
  return (
    <div style={stack}>
      <Trace
        steps={[
          {
            id: "read",
            title: "Read materials",
            status: "complete",
            duration: "120 ms",
            detail: '{"files": 3, "result": "ok"}',
          },
          {
            id: "prepare",
            title: "Prepare preview",
            status: complete ? "complete" : "running",
            detail: complete
              ? '{"result": "ready"}'
              : '{"result": "in progress"}',
          },
        ]}
      />
      <Button onClick={() => setComplete(!complete)}>
        {complete ? "Restart run" : "Finish run"}
      </Button>
    </div>
  );
}
export function ProseExample() {
  return (
    <Prose>
      <h2>Clarity before form</h2>
      <p>
        A consistent interface organizes information, guides choices and makes work simpler. Typography has to help that reading.
      </p>
      <h3>A predictable hierarchy</h3>
      <ul>
        <li>Headings introduce the topic.</li>
        <li>Paragraphs develop one idea at a time.</li>
        <li>Links connect related content.</li>
      </ul>
      <blockquote>
        The component must keep the content while the theme changes.
      </blockquote>
      <p>
        Use <code>ThemeProvider</code> to apply your product's identity.
      </p>
    </Prose>
  );
}
