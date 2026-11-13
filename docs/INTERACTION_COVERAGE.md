# Cobertura de interação por família

Gerado por `node scripts/interaction-coverage.mjs` a partir das marcas `// interação: <Família>` nos specs de `tests/`. Render, tema, contraste e fonte de todas as famílias são cobertos por `tests/catalog.spec.ts`; esta tabela trata só de interação (clique, teclado, toque, foco).

21 de 122 famílias têm teste de interação marcado; 101 não têm.

| Família | Teste |
|---|---|
| Button | `tests/core.spec.ts:9` Button respeita bloqueios e dispara uma ação por ativação |
| IconButton | `tests/control-focus-ring.spec.ts:45` anel de foco do tema em IconButton e Switch control (${theme}/${mode}) |
| Select | `tests/native-select-state.spec.ts:28` ${example.family} native open/close and trusted keyboard selection (${mode}/${width}) |
| Combobox | `tests/combobox-focus-ring.spec.ts:8` Combobox aberto sem foco não mostra anel de foco |
| Switch | `tests/control-focus-ring.spec.ts:45` anel de foco do tema em IconButton e Switch control (${theme}/${mode}) |
| PhoneInput | `tests/native-select-state.spec.ts:28` ${example.family} native open/close and trusted keyboard selection (${mode}/${width}) |
| VisitSchedulePicker | `tests/board-revision.spec.ts:124` ${mode}/${font}: SchedulePicker em telefone com toque e múltiplos dias |
| Menu | `tests/consumer-overlays.spec.ts:21` consumidor isolado: modal/drawer, menu, seleção e foco — ${mode}<br>`tests/core.spec.ts:31` Menu pula item bloqueado, navega, busca, seleciona e restaura foco |
| Chip | `tests/chip-group.spec.ts:15` CHIPG-01: seleção única tem uma parada de Tab e setas movem foco e seleção<br>`tests/chip-group.spec.ts:54` CHIPG-02: seleção múltipla alterna com Space e Enter e Tab passa por cada Chip |
| Modal | `tests/consumer-overlays.spec.ts:21` consumidor isolado: modal/drawer, menu, seleção e foco — ${mode}<br>`tests/core.spec.ts:44` Diálogos aninhados restauram foco, inert e bloqueio de scroll |
| Drawer | `tests/consumer-overlays.spec.ts:21` consumidor isolado: modal/drawer, menu, seleção e foco — ${mode}<br>`tests/playground.spec.ts:262` ${width}px: drawer direito por abas, validação, exportação e retorno de foco |
| Command | `tests/command-search.spec.ts:17` Command.search recebe o texto aparado e substitui o filtro embutido<br>`tests/purposeful-motion.spec.ts:137` ${mode}: Command compõe Modal com foco, saída e reabertura |
| Charts | `tests/chart-exploration.spec.ts:6` zoom, brush, controles e opções · ${mode} |
| Matrix2x2 | `tests/family-regressions.spec.ts:75` Matrix pointer and keyboard selection preserve structural positioning (${context}/${mode}/${motion.preference}/${motion.explicit ? "explicit" : "system"}) |
| Timeline | `tests/timelines.spec.ts:45` ${mode}: marcos alternam, preservam ordem e abrem detalhes<br>`tests/timelines.spec.ts:63` ${mode}: horizontal rola por teclado sem aumentar a página |
| EventTimeline | `tests/timelines.spec.ts:27` ${mode}: widget reutiliza conteúdo compacto e abre histórico; popover fecha por teclado |
| KanbanBoard | `tests/board-revision.spec.ts:5` ${mode}: Kanban WIP e transições bloqueiam menu e teclado sem perder cards |
| Coverflow | `tests/coverflow.spec.ts:6` Coverflow finite keyboard, controlled identity and explicit activation ${mode}/${width}<br>`tests/coverflow.spec.ts:74` Coverflow drag, cancel and nonactivation ${mode}/${width} |
| SwipeDeck | `tests/deck.spec.ts:49` DecisionDeck controlado avança por posição e reinicia mesmo com IDs repetidos |
| IntentComposer | `tests/composer-interactions.spec.ts:170` ${mode}/${surface}: opções acima do diálogo e Escape em duas etapas |
| AppShell | `tests/family-regressions.spec.ts:114` AppShell navigation persists after responsive drawer closes (${context}/${mode}) |

## Sem teste de interação

ButtonGroup, SplitButton, OAuthButton, GoogleButton, Fab, FabMenu, PropertyActionGroup, Input, Textarea, Multiselect, Checkbox, RadioGroup, Segmented, ToggleGroup, Range, Slider, Otp, PostalCodeInput, Calendar, ChoiceCard, FileUpload, GeoAreaPicker, Breadcrumb, Tabs, NavCard, Pagination, SettingsSubnav, TableOfContents, WorkspaceSwitcher, UserMenu, HelpMenu, WizardStepper, Badge, StatusDot, Callout, EmptyState, Skeleton, ProgressBar, UsageMeter, Toast, Snackbar, NotificationBell, Tooltip, Popover, HoverCard, HelpField, GuidedTour, Table, Stat, ScoreGauge, ActivityItem, KanbanCard, ApprovalWorkbench, Avatar, AvatarGroup, BrandLogo, PersonCell, Card, Accordion, CodeBlock, PropertyCard, PropertyMedia, VoiceRecorder, Kbd, Sidebar, Topbar, PageHeader, SectionHeader, Hero, Section, DeviceFrame, SiteFooter, Divider, StickyBar, StickyFooter, SettingRow, PlanCard, BillingCard, ConnectorCard, DangerZone, AlertDialog, AspectRatio, Bubble, Carousel, Collapsible, ContextMenu, DatePicker, Direction, Item, Label, Marker, Menubar, Message, MessageScroller, NavigationMenu, Questionnaire, Resizable, ScrollArea, Spinner, Trace, Prose
