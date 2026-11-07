# Cobertura de tema no Playground

Registro local de 22/10/2026. As 113 famílias abaixo correspondem aos diretórios com stories, verificados por `tests/catalog.spec.ts`. A galeria instancia as stories existentes na mesma árvore de tema. Charts inclui AreaChart, LineChart, BarChart, DonutChart e Sparkline. Esta matriz registra consumo de tokens; a aprovação estética do mantenedor permanece separada.

Modos: Claro/Escuro/Sistema. Temas: Refy/Geométrico/Fluido. Conjuntos de fonte editáveis dentro de Personalizar tema: Manrope + Source, IBM Plex, DM Sans + Geist. A toolbar tem apenas Tema e Modo. Trocar modo não muda geometria; mudar tema altera a escala compartilhada e seus papéis específicos. Gráficos usam `--chart-primary`, derivado da ênfase legível; avatares com cor explícita têm `--avatar-custom-text` separado do par do tema. Cores, tipografia e formas também chegam aos overlays pelo escopo de ThemeProvider.

Revisão de fontes e interações: [de–para local](TYPOGRAPHY_INTERACTIONS.md), com recortes, campos, Deck, compositor e marca compacta.

Exceções de desenho: spinner é circular; pontos de status, reticências, símbolo de marca e gráficos mantêm seu significado geométrico. Separadores internos continuam finos. Avatares, timeline, campos, menus, calendário e seletores NÃO são exceções à escala de forma. Tipografia de gráficos, assinatura e iniciais de avatares conserva encaixe intrínseco e herda a família.

O painel avançado lista os tokens da fundação e os hooks opcionais sem valor global. Estes mantêm o fallback de cada componente até serem personalizados; não são transformados em defaults globais. `src/tokens/component-hooks.json` é conferido contra os consumidores por `tokens:check`.

| Família | Nível | Geometria consumida diretamente | Famílias de fonte |
|---|---|---|---|
| Button | Átomos | `--button-border-width`<br>`--button-radius`<br>`--radius-default` | `--control-font-size`<br>`--control-font-size-sm`<br>`--control-font-weight`<br>`--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| IconButton | Átomos | `--control-border-width`<br>`--control-radius`<br>`--radius-default` | `--control-font-size-sm`<br>`--control-font-weight`<br>`--font-body` |
| ButtonGroup | Moléculas | `--button-border-width`<br>`--button-radius`<br>`--control-radius` | Herdadas da composição |
| SplitButton | Moléculas | `--button-border-width`<br>`--button-radius`<br>`--radius-default` | Herdadas da composição |
| GoogleButton | Átomos | Herdada da composição / forma intrínseca documentada | `--control-font-size` |
| Fab | Átomos | `--fab-extended-radius`<br>`--fab-radius`<br>`--radius-lg`<br>`--radius-pill` | `--font-body` |
| FabMenu | Moléculas | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| DecisionActions | Moléculas | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| Input | Átomos | `--field-border-width`<br>`--field-radius`<br>`--radius-default` | `--field-font-size`<br>`--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| Textarea | Átomos | Herdada da composição / forma intrínseca documentada | `--field-font-size`<br>`--font-body` |
| Select | Átomos | Herdada da composição / forma intrínseca documentada | `--field-font-size`<br>`--font-body` |
| Combobox | Moléculas | `--control-border-width`<br>`--embedded-action-radius`<br>`--field-radius`<br>`--radius-lg-token`<br>`--radius-md`<br>`--radius-pill`<br>`--radius-sm` | `--field-font-size`<br>`--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| Multiselect | Moléculas | `--control-border-width`<br>`--radius-md`<br>`--radius-pill`<br>`--radius-sm`<br>`--radius-xl-token`<br>`--selection-chip-radius` | `--field-font-size`<br>`--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| Checkbox | Átomos | `--checkbox-radius`<br>`--control-border-width`<br>`--radius-md`<br>`--radius-sm` | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| RadioGroup | Átomos | `--control-border-width`<br>`--radius-md`<br>`--radius-pill` | `--font-mono`<br>`--interface-detail-font` |
| Switch | Átomos | `--control-border-width`<br>`--radius-default`<br>`--radius-pill` | `--control-font-size-sm`<br>`--control-font-weight`<br>`--font-body` |
| Segmented | Átomos | `--control-border-width`<br>`--control-group-radius`<br>`--radius-pill` | `--control-font-size`<br>`--font-body` |
| ToggleGroup | Átomos | `--control-border-width`<br>`--radius-default` | `--control-font-size`<br>`--font-body` |
| Range | Átomos | `--radius-pill`<br>`--radius-xs` | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| Slider | Átomos | `--radius-pill` | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| Otp | Átomos | `--control-border-width`<br>`--radius-default` | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| PhoneInput | Moléculas | Herdada da composição / forma intrínseca documentada | `--field-font-size` |
| PostalCodeInput | Moléculas | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| Calendar | Moléculas | `--calendar-control-radius`<br>`--radius-md`<br>`--radius-pill`<br>`--surface-border-width` | `--font-body`<br>`--font-mono` |
| SchedulePicker | Organismos | `--radius-default`<br>`--radius-lg`<br>`--surface-border-width` | `--font-headline` |
| ChoiceCard | Moléculas | `--control-border-width`<br>`--radius-lg-token`<br>`--radius-md` | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| FileUpload | Moléculas | `--radius-default`<br>`--radius-lg`<br>`--radius-sm`<br>`--radius-xs`<br>`--surface-border-width` | `--font-mono`<br>`--interface-detail-font` |
| GeoAreaPicker | Organismos | `--radius-pill`<br>`--radius-xl-token`<br>`--surface-border-width` | `--font-mono`<br>`--interface-detail-font` |
| Breadcrumb | Moléculas | `--navigation-link-radius`<br>`--radius-xs` | `--font-mono`<br>`--interface-detail-font` |
| Tabs | Moléculas | `--radius-lg`<br>`--radius-md`<br>`--radius-pill`<br>`--radius-sm` | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| NavCard | Moléculas | `--radius-lg-token`<br>`--surface-border-width` | `--font-body` |
| Pagination | Átomos | `--control-border-width`<br>`--radius-md` | `--font-mono`<br>`--interface-detail-font` |
| SettingsSubnav | Moléculas | `--radius-default` | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| TableOfContents | Moléculas | `--radius-default` | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| WorkspaceSwitcher | Moléculas | `--control-border-width`<br>`--control-radius`<br>`--radius-default`<br>`--radius-md` | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| UserMenu | Moléculas | `--radius-md`<br>`--radius-pill` | `--font-body` |
| HelpMenu | Moléculas | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| WizardStepper | Moléculas | `--radius-pill` | `--font-mono`<br>`--interface-detail-font` |
| Menu | Moléculas | `--radius-default`<br>`--radius-sm`<br>`--surface-border-width` | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| Badge | Átomos | `--control-group-radius`<br>`--radius-pill` | `--font-mono`<br>`--interface-detail-font` |
| Chip | Átomos | `--chip-radius`<br>`--control-border-width`<br>`--radius-pill` | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| StatusDot | Átomos | Herdada da composição / forma intrínseca documentada | `--font-mono`<br>`--interface-detail-font` |
| Callout | Moléculas | `--radius-lg-token`<br>`--radius-md`<br>`--surface-border-width` | Herdadas da composição |
| EmptyState | Moléculas | `--radius-lg`<br>`--surface-border-width` | `--font-body`<br>`--font-headline` |
| Skeleton | Átomos | `--radius-pill`<br>`--radius-sm` | Herdadas da composição |
| ProgressBar | Átomos | `--radius-pill` | Herdadas da composição |
| UsageMeter | Moléculas | Herdada da composição / forma intrínseca documentada | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| Toast | Moléculas | `--control-group-radius`<br>`--radius-default`<br>`--radius-pill`<br>`--radius-xs` | `--font-body` |
| Snackbar | Moléculas | `--radius-md`<br>`--radius-xs` | `--font-body` |
| NotificationBell | Moléculas | `--radius-default`<br>`--radius-md`<br>`--radius-pill`<br>`--surface-border-width` | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| Tooltip | Moléculas | `--radius-md` | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| Popover | Moléculas | `--radius-default`<br>`--surface-border-width` | `--font-body` |
| HoverCard | Moléculas | `--radius-default`<br>`--surface-border-width` | `--font-body` |
| HelpField | Moléculas | `--radius-xs` | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| GuidedTour | Organismos | `--radius-default` | `--font-mono`<br>`--interface-detail-font` |
| Modal | Organismos | `--dialog-border-width`<br>`--dialog-radius`<br>`--radius-xl` | `--font-headline` |
| Drawer | Organismos | `--drawer-radius`<br>`--radius-sm` | `--font-body`<br>`--font-headline` |
| Command | Organismos | `--radius-lg`<br>`--radius-md`<br>`--radius-pill`<br>`--surface-border-width` | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| Table | Organismos | `--control-border-width`<br>`--radius-lg`<br>`--radius-md`<br>`--radius-pill`<br>`--radius-sm`<br>`--radius-xl-token`<br>`--radius-xs`<br>`--surface-border-width` | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| Charts | Organismos | `--radius-md`<br>`--radius-xs`<br>`--surface-border-width` | `--font-body`<br>`--font-headline`<br>`--font-mono`<br>`--interface-detail-font` |
| Stat | Moléculas | Herdada da composição / forma intrínseca documentada | `--font-headline`<br>`--font-mono`<br>`--interface-detail-font` |
| ScoreGauge | Moléculas | Herdada da composição / forma intrínseca documentada | `--font-headline`<br>`--font-mono`<br>`--interface-detail-font` |
| Matrix2x2 | Organismos | `--card-radius`<br>`--radius-pill`<br>`--surface-border-width` | `--font-body`<br>`--font-headline`<br>`--font-mono`<br>`--interface-detail-font` |
| EventTimeline | Organismos | `--radius-lg`<br>`--surface-border-width` | `--font-headline` |
| KanbanBoard | Organismos | `--radius-default`<br>`--radius-lg`<br>`--surface-border-width` | `--font-headline`<br>`--font-mono`<br>`--interface-detail-font` |
| ApprovalWorkbench | Organismos | `--radius-default`<br>`--radius-pill`<br>`--surface-border-width` | Herdadas da composição |
| Avatar | Átomos | `--avatar-radius`<br>`--avatar-square-radius`<br>`--radius-lg`<br>`--radius-md`<br>`--radius-sm` | `--font-body` |
| AvatarGroup | Moléculas | `--ag-overlap`<br>`--avatar-group-overlap-lg`<br>`--avatar-group-overlap-md`<br>`--avatar-group-overlap-sm`<br>`--avatar-radius` | Herdadas da composição |
| BrandLogo | Átomos | `--radius-default` | `--font-headline`<br>`--font-mono` |
| PersonCell | Moléculas | Herdada da composição / forma intrínseca documentada | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| Card | Moléculas | `--card-border-width`<br>`--card-radius`<br>`--radius-lg-token`<br>`--radius-pill` | `--font-headline`<br>`--font-mono`<br>`--interface-detail-font` |
| Accordion | Moléculas | `--radius-md`<br>`--surface-border-width` | `--font-body` |
| CodeBlock | Moléculas | `--code-border-width`<br>`--radius-lg-token` | `--font-body`<br>`--font-mono` |
| ContentCard | Organismos | `--radius-pill`<br>`--surface-border-width` | `--font-body`<br>`--font-headline` |
| MediaGallery | Moléculas | `--radius-lg`<br>`--radius-pill`<br>`--surface-border-width` | Herdadas da composição |
| DecisionDeck | Organismos | `--radius-default`<br>`--radius-xl`<br>`--surface-border-width` | `--font-headline` |
| VoiceRecorder | Moléculas | `--radius-lg-token`<br>`--radius-pill`<br>`--surface-border-width` | `--font-mono`<br>`--interface-detail-font` |
| IntentComposer | Organismos | `--composer-border-width`<br>`--radius-xl-token` | `--font-mono`<br>`--interface-detail-font` |
| Kbd | Átomos | `--control-border-width`<br>`--radius-sm` | `--font-mono` |
| AppShell | Organismos | Herdada da composição / forma intrínseca documentada | `--font-body` |
| Sidebar | Organismos | `--control-radius`<br>`--navigation-link-radius`<br>`--radius-lg`<br>`--radius-md`<br>`--surface-border-width` | `--control-font-weight`<br>`--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| Topbar | Organismos | `--control-radius`<br>`--field-border-width`<br>`--field-radius` | `--font-body` |
| PageHeader | Moléculas | Herdada da composição / forma intrínseca documentada | `--font-body`<br>`--font-headline`<br>`--font-mono`<br>`--interface-detail-font` |
| SectionHeader | Moléculas | Herdada da composição / forma intrínseca documentada | `--font-body`<br>`--font-headline` |
| Divider | Átomos | Herdada da composição / forma intrínseca documentada | `--font-mono`<br>`--interface-detail-font` |
| StickyBar | Moléculas | Herdada da composição / forma intrínseca documentada | `--font-mono`<br>`--interface-detail-font` |
| StickyFooter | Moléculas | Herdada da composição / forma intrínseca documentada | `--font-body` |
| SettingRow | Moléculas | `--radius-default`<br>`--radius-md`<br>`--surface-border-width` | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| PlanCard | Moléculas | `--radius-lg-token`<br>`--radius-pill`<br>`--surface-border-width` | `--font-headline`<br>`--font-mono`<br>`--interface-detail-font` |
| BillingCard | Moléculas | `--radius-sm` | `--font-body`<br>`--font-headline`<br>`--font-mono`<br>`--interface-detail-font` |
| ConnectorCard | Moléculas | `--radius-lg-token`<br>`--radius-md`<br>`--surface-border-width` | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| DangerZone | Moléculas | `--radius-lg-token`<br>`--surface-border-width` | `--font-body`<br>`--font-mono`<br>`--interface-detail-font` |
| AlertDialog | Organismos | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| AspectRatio | Átomos | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| Bubble | Átomos | `--radius-lg`<br>`--surface-border-width` | Herdadas da composição |
| Carousel | Moléculas | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| Collapsible | Moléculas | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| ContextMenu | Moléculas | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| DatePicker | Moléculas | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| Direction | Átomos | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| Item | Moléculas | `--radius-md`<br>`--surface-border-width` | Herdadas da composição |
| Label | Átomos | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| Marker | Átomos | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| Menubar | Moléculas | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| Message | Moléculas | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| MessageScroller | Moléculas | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| NavigationMenu | Moléculas | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| Questionnaire | Organismos | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| Resizable | Moléculas | `--radius-md` | Herdadas da composição |
| ScrollArea | Átomos | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| Spinner | Átomos | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| Trace | Organismos | Herdada da composição / forma intrínseca documentada | Herdadas da composição |
| Prose | Átomos | `--radius-lg`<br>`--radius-md`<br>`--radius-sm` | `--font-body`<br>`--font-heading`<br>`--font-mono`<br>`--prose-font-body`<br>`--prose-font-heading`<br>`--prose-font-mono` |
