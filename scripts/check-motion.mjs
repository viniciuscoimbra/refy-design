import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
const source = JSON.parse(
  readFileSync(
    new URL("../src/tokens/foundations.tokens.json", import.meta.url),
    "utf8",
  ),
);
const budgets = { feedback: 150, context: 200, orientation: 300, page: 300 };
for (const [role, max] of Object.entries(budgets)) {
  const value = source.base[`motion-${role}-duration`].$value;
  assert(
    value.unit === "ms" && value.value > 0 && value.value <= max,
    `Duração padrão ${role}`,
  );
}
for (const role of ["context", "orientation"])
  assert(
    source.base[`motion-${role}-exit-duration`].$value.value <
      source.base[`motion-${role}-duration`].$value.value,
    `Saída ${role}`,
  );
for (const name of ["motion-ease-enter", "motion-ease-exit"])
  assert(
    source.base[name].$value.every((value) => value >= 0 && value <= 1),
    `${name} sem overshoot`,
  );
const entries = [
  ...readFileSync(
    new URL("../src/pages/PlaygroundPage/catalog.ts", import.meta.url),
    "utf8",
  ).matchAll(
    /\{\s*id:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*level:\s*"([^"]+)"/g,
  ),
];
assert(entries.length >= 113, "Inventário incompleto");
const purposeGroups = [
  [
    "feedback",
    "Confirmar estado do controle sem deslocar a página",
    "Button IconButton GoogleButton OAuthButton Fab Input Textarea Select Checkbox RadioGroup Switch Segmented ToggleGroup Range Slider Otp Pagination Chip ButtonGroup SplitButton PropertyActionGroup PhoneInput PostalCodeInput ChoiceCard FileUpload SettingRow",
  ],
  [
    "navigation",
    "Orientar seleção e posição, mantendo conteúdo legível",
    "Breadcrumb Tabs NavCard SettingsSubnav TableOfContents WizardStepper Calendar Carousel Coverflow PropertyMedia",
  ],
  [
    "context",
    "Revelar superfície na origem e sair para a mesma origem",
    "FabMenu Combobox Multiselect WorkspaceSwitcher UserMenu HelpMenu Menu NotificationBell Tooltip Popover HoverCard HelpField ContextMenu DatePicker Menubar NavigationMenu",
  ],
  [
    "orientation",
    "Transferir foco ou reorganizar espaço conforme a geometria real",
    "Modal Drawer Command AlertDialog Sidebar GuidedTour",
  ],
  [
    "decision",
    "Acompanhar gesto e confirmar destino sem espera fixa",
    "SwipeDeck KanbanBoard KanbanCard Resizable",
  ],
  [
    "activity",
    "Indicar trabalho em curso ou progresso, não entrada decorativa",
    "Skeleton Spinner ProgressBar StatusDot VoiceRecorder UsageMeter",
  ],
  [
    "data",
    "Manter dados legíveis e evidenciar mudança/seleção local",
    "Charts ScoreGauge Stat Matrix2x2 EventTimeline Timeline ActivityItem Table ApprovalWorkbench Trace",
  ],
  [
    "conversation",
    "Histórico estável; orientar apenas nova mensagem inserida",
    "Message MessageScroller",
  ],
  [
    "expansion",
    "Abrir espaço com slide sem fade do conteúdo",
    "Accordion Collapsible",
  ],
  [
    "notice",
    "Confirmar resultado sem tomar foco; saída curta ao dispensar",
    "Toast Snackbar Callout",
  ],
  [
    "composition",
    "Sem entrada de página: delegar feedback aos componentes reais",
    "VisitSchedulePicker GeoAreaPicker IntentComposer AppShell Topbar PropertyCard Questionnaire Hero Section DeviceFrame SiteFooter",
  ],
  [
    "stable",
    "Apresentação estável; sem efeito de entrada obrigatório",
    "Badge Avatar BrandLogo Kbd Divider AspectRatio Bubble Direction Label Marker ScrollArea Prose AvatarGroup PersonCell Card EmptyState CodeBlock PageHeader SectionHeader StickyBar StickyFooter PlanCard BillingCard ConnectorCard DangerZone Item",
  ],
];
const purposes = new Map();
for (const [purpose, behavior, ids] of purposeGroups)
  for (const id of ids.split(" ")) {
    assert(!purposes.has(id), `Finalidade duplicada: ${id}`);
    purposes.set(id, { purpose, behavior });
  }
assert.equal(
  purposes.size,
  entries.length,
  "Cobertura de finalidade do catálogo",
);
const rows = [];
const roleById = Object.fromEntries(
  entries.map(([, id, , level]) => [
    id,
    level === "Átomos"
      ? "feedback"
      : level === "Moléculas"
        ? "context"
        : "orientation",
  ]),
);
const aliases = {
  "duration-instant": "motion-feedback-duration",
  "duration-fast": "motion-feedback-duration",
  "duration-mid": "motion-context-duration",
  "duration-slow": "motion-orientation-duration",
};
for (const entry of entries) {
  const [_, id, label, level] = entry;
  const path = new URL(
    `../src/components/${id}/${id}.module.css`,
    import.meta.url,
  );
  const css = existsSync(path) ? readFileSync(path, "utf8") : "";
  const componentPath = new URL(
    `../src/components/${id}/${id}.tsx`,
    import.meta.url,
  );
  const componentSource = existsSync(componentPath)
    ? readFileSync(componentPath, "utf8")
    : "";
  assert(purposes.has(id), `Finalidade ausente: ${id}`);
  rows.push({
    component: label,
    ...purposes.get(id),
    level,
    policy:
      level === "Átomos"
        ? "feedback"
        : level === "Moléculas"
          ? "context"
          : "orientation",
    application: /DisclosureRegion/.test(componentSource)
      ? "slide de altura compartilhado, sem fade; layout deliberado"
      : /motionTiming|\.animate\(/.test(componentSource)
        ? "movimento específico da interação com tokens e preferências"
        : /data-refy-message/.test(componentSource)
          ? "apresentação estável; inserção pertence a MessageScroller"
          : /AnchoredSurface|import.*Modal/.test(componentSource)
            ? "presença delegada à superfície canônica"
            : /(?:animation|transition)\s*:/.test(css)
              ? "regras próprias e tokens"
              : "estático ou composição de componentes; sem animação de entrada obrigatória",
  });
}
for (const folder of readdirSync(
  new URL("../src/components", import.meta.url),
)) {
  const path = new URL(
    `../src/components/${folder}/${folder}.module.css`,
    import.meta.url,
  );
  if (!existsSync(path)) continue;
  const css = readFileSync(path, "utf8");
  for (const match of css.matchAll(/(animation|transition)\s*:\s*([^;]+);/g)) {
    const declaration = match[2];
    if (/\binfinite\b|--button-progress-duration/.test(declaration)) continue;
    for (const reference of declaration.matchAll(/var\(\s*--([\w-]+)/g)) {
      const duration = source.base[aliases[reference[1]] ?? reference[1]];
      if (duration?.$type === "duration" && roleById[folder])
        assert(
          duration.$value.value <= budgets[roleById[folder]],
          `${folder}: ${reference[1]} excede o limite de ${roleById[folder]}`,
        );
    }
    for (const t of declaration.matchAll(/\b(\d*\.?\d+)(ms|s)\b/g))
      assert(
        Number(t[1]) * (t[2] === "s" ? 1000 : 1) <= 1,
        `${folder}: duração finita deve usar token: ${match[0]}`,
      );
    // A largura do indicador absoluto não redimensiona os controles vizinhos.
    const indicatorWidth =
      folder === "Segmented" &&
      css
        .slice(
          css.lastIndexOf("}", match.index) + 1,
          css.lastIndexOf("{", match.index),
        )
        .trim() === ".indicator";
    const sidebarWidth =
      folder === "Sidebar" &&
      css
        .slice(
          css.lastIndexOf("}", match.index) + 1,
          css.lastIndexOf("{", match.index),
        )
        .trim() === ".sidebar";
    const layoutDeclaration = sidebarWidth
      ? declaration.replace(/^width\s+[^,]+/, "")
      : indicatorWidth
        ? declaration.replace(/,\s*width\s+[^,]+/g, "")
        : declaration;
    if (match[1] === "transition")
      assert(
        !/(?:^|,)\s*(?:all|width|height|top|left|right|bottom|margin(?:-\w+)?|padding(?:-\w+)?)\s/.test(
          layoutDeclaration,
        ),
        `${folder}: transição de layout: ${match[0]}`,
      );
  }
}
if (process.argv.includes("--write"))
  writeFileSync(
    new URL("../docs/MOTION_INVENTORY.json", import.meta.url),
    JSON.stringify(
      {
        description:
          "Auditoria estática de cobertura, não aprovação visual/performance. Indicadores contínuos e progressEffect legado não representam reações finitas.",
        families: rows,
      },
      null,
      2,
    ) + "\n",
  );
console.log(
  `OK: ${rows.length} famílias inventariadas; papéis, limites e reações finitas sem durações fixas; layout deliberado limitado ao indicador e à largura da sidebar.`,
);
