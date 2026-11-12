// Textos prontos dos componentes. Toda chave existe nas três línguas; o tipo sai de en.ts.
// Cada componente é um export próprio: quem importa um componente leva só o texto dele, e não o
// dicionário de todos (eram 16 KB em cada tela que usava qualquer texto pronto).
export const activityTimeline = {
  title: "Activity",
  emptyTitle: "No activity yet",
  emptyMessage: "Activity will show up here as it happens.",
  loadError: "Could not load the history",
  retry: "Try again",
  label: "Activity history",
};
export const alertDialog = {
  confirm: "Confirm",
  cancel: "Cancel",
};
export const appShell = {
  openNavigation: "Open navigation",
  navigation: "Navigation",
};
export const approvalWorkbench = {
  label: "Review items",
  notStarted: "Not started",
  inProgress: "In review",
  complete: "Done",
  summary: (done: number, total: number) => `${done} of ${total} done`,
  progress: (done: number, total: number) => `Review progress: ${done} of ${total} items done`,
};
export const avatarGroup = {
  more: (n: number) => `${n} more ${n === 1 ? "person" : "people"}`,
  people: (n: number) => `${n} people`,
};
export const billingCard = {
  nextCharge: "Next charge",
};
export const breadcrumb = {
  label: "Breadcrumb",
  home: "Home",
  showHidden: "Show hidden path",
};
export const calendar = {
  previousMonth: "Previous month",
  nextMonth: "Next month",
};
export const callout = {
  dismiss: "Dismiss notice",
};
export const carousel = {
  label: "Featured content",
  slide: (n: number, total: number, label: string) => `${n} of ${total}: ${label}`,
  empty: "No content available.",
  previous: "Previous item",
  next: "Next item",
  position: (n: number, total: number) => `${n} of ${total}`,
};
export const charts = {
  keyboardHelp: "Use the arrows to explore points, Home and End for start and end. The data is also available as a table.",
  noData: "No data for this period.",
  selectSeries: "Select a series in the legend.",
  reference: "Reference",
  values: "Values",
  legend: (title: string) => `Legend for ${title}`,
  series: (n: number) => `Series ${n}`,
  viewData: (title: string) => `View data for ${title}`,
  dataOf: (title: string) => `Data for ${title}`,
};
export const codeBlock = {
  copy: "Copy code",
  copied: "Copied",
  reveal: "Reveal value",
  hide: "Hide value",
};
export const combobox = {
  empty: "No results",
  placeholder: "Search…",
  clear: "Clear",
};
export const command = {
  placeholder: "Search commands…",
  empty: "No results",
  label: "Command palette",
  results: "Results",
};
export const common = {
  close: "Close",
  panel: "Panel",
};
export const contextMenu = {
  label: "Context menu",
};
export const coverflow = {
  label: "Browse content",
  empty: "No content available.",
};
export const d3Chart = {
  cyclicSankey: "Sankey does not accept cycles in links.",
  cannotRender: "These data cannot be drawn.",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  previous: "Previous",
  next: "Next",
  resetView: "Reset view",
  brushHint: "Drag to select a range",
  visibleRange: "Visible range",
  clearRange: "Clear range",
  keyboardHelp: "Use arrows, Home and End to explore. Enter or Space select; Escape clears. Data is available in the table.",
  reactivate: "Turn a series back on in the legend to see its data.",
  nothingToDraw: "No data to draw.",
  navigate: (title: string) => `Navigate ${title}`,
  rangeOf: (title: string) => `Range of ${title}`,
  frequency: "Frequency",
  region: (n: number) => `Region ${n}`,
  value: "Value",
  series: "Series",
  size: "Size",
  level: "Level",
  minimum: "Minimum",
  median: "Median",
  maximum: "Maximum",
  outliers: "Outliers",
  none: "None",
  open: "Open",
  close: "Close",
  low: "Low",
  high: "High",
  percent: "Percent",
  flow: "Flow",
  connections: "Connections",
  item: "Item",
  data: "Data",
};
export const datePicker = {
  calendar: (label: string) => `Calendar: ${label}`,
  clear: "Clear date",
  choose: "Choose date",
};
export const deviceFrame = {
  page: "Page",
};
export const fabMenu = {
  open: "Open actions",
  close: "Close actions",
};
export const fileUpload = {
  label: "Add files",
  hint: "Drag files here or choose them from your device.",
  notAdded: "File not added",
  sent: "Uploaded",
  done: "Upload complete.",
  tooLarge: (name: string, limit: string) => `${name} is over the ${limit} MB limit.`,
  uploadOf: (name: string) => `Upload of ${name}`,
  remove: (name: string) => `Remove ${name}`,
  sending: (n: number) => `Uploading ${n} ${n === 1 ? "file" : "files"}.`,
  sendingProgress: (n: number, percent: number) => `Uploading ${n} ${n === 1 ? "file" : "files"}: ${percent}%.`,
  selected: (n: number) => `${n} ${n === 1 ? "file" : "files"} selected.`,
  fileType: "FILE",
  choose: (multiple: boolean): string => (multiple ? "Choose files" : "Choose file"),
  selectedList: "Selected files",
};
export const geoAreaPicker = {
  mapLabel: "Search area map",
  label: "Search area selection",
  mapError: "Could not update the map",
  mapUnavailable: "Map unavailable",
  mapFallback: "You can finish the whole selection with the lists beside it.",
  mainArea: "main area",
  nearbyIncluded: "Nearby neighborhoods included",
  addReached: "Add a neighborhood in range…",
  explanation: "The radius only suggests neighbors. Only the neighborhoods in “In your search” count for the ranking.",
  inSearch: "In your search",
  inSearchHint: "The search only considers the selected areas.",
  includedLabel: "Included neighborhoods",
  mainNeighborhood: "Main neighborhood",
  main: "Main",
  included: "Included",
  outside: "Outside the search",
  outsideHint: "In range, but not used for the ranking.",
  excludedLabel: "Excluded neighborhoods",
  allIncluded: "Every neighborhood in range is in the search.",
  none: "no neighborhood",
  surroundings: (area: string) => `Around ${area}`,
  inRadius: (n: number) => `${n} ${n === 1 ? "neighborhood" : "neighborhoods"} in the current radius`,
  distance: (km: string) => `${km} km from the main neighborhood`,
  isMain: (name: string) => `${name} is the main neighborhood`,
  removeFrom: (name: string) => `Remove ${name} from the search`,
  addTo: (name: string) => `Add ${name} to the search`,
  summary: (areas: string, left: number) => `Searching in ${areas}; ${left} left out.`,
  include: "Include",
};
export const guidedTour = {
  close: "Close tour",
  back: "Back",
  finish: "Finish",
  next: "Next",
  position: (n: number, total: number) => `${n} of ${total}`,
  step: (n: number, total: number) => `Step ${n} of ${total}`,
};
export const helpField = {
  help: (label: string) => `Help: ${label}`,
  learnMore: "Learn more",
};
export const helpMenu = {
  label: "Help",
  docs: "Documentation",
  shortcuts: "Keyboard shortcuts",
  support: "Contact support",
};
export const intentComposer = {
  label: "Tell us what you are looking for",
  placeholder: "E.g. organize a collection of references and documents to share with my team…",
  submit: "Continue",
  error: "We could not understand part of the request. Adjust the text and try again.",
  composer: "Request composer",
  needContext: "We need a bit more context",
  examples: "Request examples",
  tryThis: "Try:",
  voice: "Describe by voice",
  organizing: "Organizing what you told us",
  organizingHint: "We are turning the text into criteria you can review.",
  selectGroup: (group: string) => `Select ${group}…`,
  initialFilters: "Initial filters",
  understood: "Here is what I understood",
  reviewDetails: "Review details",
  understanding: "Understanding…",
  editRequest: "Edit request",
  processing: "Processing the request",
};
export const kanbanBoard = {
  label: "Kanban board",
  unavailable: "Stage unavailable.",
  notAllowed: "Move not allowed from this stage.",
  staleCancel: "Move cancelled: the card changed outside this gesture.",
  cancelled: "Move cancelled.",
  picked: "Card picked. Use the arrows to choose the stage, Enter to drop and Escape to cancel.",
  instructions: "Drag by the handle. With the keyboard, press Enter to pick up, ← → to choose the stage and Enter to drop. Escape cancels.",
  stageActions: "Stage actions",
  addCard: "Add card",
  dragTitle: "Drag card; Enter lets you move it with the keyboard",
  cardActions: "Card actions",
  openDetails: "Open details",
  moveFirst: "Move to the start of this stage",
  moveLast: "Move to the end of this stage",
  emptyFilter: "No card for this filter.",
  emptyStage: "No card in this stage.",
  noDescription: "No description.",
  card: "Card",
  chosenStage: "the chosen stage",
  thisStage: "this stage",
  stage: "stage",
  wipReached: (limit: number) => `WIP limit of ${limit} reached.`,
  moved: (card: string, stage: string) => `${card} moved to ${stage}.`,
  dropTo: (stage: string) => `Drop to move to ${stage}.`,
  target: (stage: string) => `Target: ${stage}. Press Enter to confirm.`,
  count: (n: number, limit?: number) => `${n} cards${limit === undefined ? "" : `, WIP limit ${limit}`}`,
  stageActionsOf: (stage: string) => `Actions for stage ${stage}`,
  addCardTo: (stage: string) => `Add card to ${stage}`,
  drag: (card: string) => `Drag ${card}`,
  moveTo: "Move to",
  actionsOf: (card: string) => `Actions for ${card}`,
};
export const matrix2x2 = {
  xLabel: "Effort →",
  yLabel: "Impact →",
  high: "High priority",
  low: "Low priority",
  aria: (y: string, x: string, n: number) => `Matrix of ${y} by ${x}: ${n} items`,
};
export const menu = {
  label: "Actions",
};
export const menubar = {
  label: "Menu bar",
};
export const message = {
  from: (author: string) => `Message from ${author}`,
};
export const messageScroller = {
  label: "Message history",
  latest: "Jump to recent messages",
};
export const modal = {
  label: "Modal window",
};
export const multiselect = {
  empty: "No options",
  placeholder: "Add…",
  close: "Close options",
  open: "Open options",
  remove: (label: string) => `Remove ${label}`,
  hidden: (n: number) => `${n} more options selected. Open options`,
};
export const navigationMenu = {
  label: "Main navigation",
};
export const notificationBell = {
  title: "Notifications",
  empty: "No notifications",
  markAll: "Mark all as read",
  unread: (n: number) => `Notifications: ${n} unread`,
};
export const oauthButton = {
  continueWith: (provider: string) => `Continue with ${provider}`,
};
export const otp = {
  label: "Verification code",
  digit: (i: number, n: number) => `Digit ${i} of ${n}`,
};
export const pagination = {
  label: "Pagination",
  prev: "Previous page",
  next: "Next page",
  page: (p: number) => `Page ${p}`,
};
export const phoneInput = {
  country: "Country and calling code",
};
export const planCard = {
  current: "Current plan",
  recommended: "Recommended",
};
export const postalCodeInput = {
  invalid: "Enter a postal code with 8 digits.",
  searching: "Looking up the address.",
  notFound: "Postal code not found. Check the digits and try again.",
  failed: "Could not look up the postal code. Try again.",
  loading: "Searching",
  search: "Look up",
  found: (city: string, state: string) => `Address found in ${city}, ${state}.`,
};
export const propertyActionGroup = {
  reject: "Discard",
  save: "Save",
  visit: "Select",
  unavailable: "Actions for this item are unavailable.",
  idle: "Choose what to do with this item.",
  group: "Decisions about the item",
  processing: (action: string) => `${action}: processing…`,
  completed: (action: string) => `${action}: done.`,
};
export const propertyCard = {
  badges: "Content highlights",
  compatShort: "match",
  compatibility: "match",
  compatAria: (n: number) => `Match score: ${n}%`,
};
export const propertyMedia = {
  label: "Media gallery",
  carousel: "carousel",
  loading: "Loading photo",
  unavailable: "Photo unavailable",
  error: "This image could not be loaded.",
  prev: "Previous photo",
  next: "Next photo",
  choose: "Choose photo",
  retry: "Try again",
  show: (i: number, n: number) => `Show photo ${i} of ${n}`,
  position: (i: number, n: number) => `Photo ${i} of ${n}`,
};
export const questionnaire = {
  empty: "No question available.",
  sent: "Answers sent.",
  review: "Review answers",
  required: "Answer to continue.",
  progress: "Questionnaire progress",
  back: "Back",
  submit: "Send answers",
  next: "Continue",
  step: (i: number, n: number) => `Question ${i} of ${n}`,
};
export const range = {
  value: "value",
  min: "minimum",
  max: "maximum",
};
export const resizable = {
  label: "Size of the first panel",
};
export const settingsSubnav = {
  label: "Settings",
};
export const sidebar = {
  expand: "Expand menu",
  collapse: "Collapse menu",
  switchWorkspace: "Switch workspace",
  currentWorkspace: "Current workspace",
  account: (name: string) => `${name}'s account`,
};
export const spinner = {
  loading: "Loading",
};
export const splitButton = {
  loading: "Processing…",
  more: "More options",
};
export const stat = {
  up: " (trending up)",
  down: " (trending down)",
};
export const swipeDeck = {
  title: "Review content",
  doneTitle: "All items reviewed",
  doneMessage: "You reached the end of the queue. Start over to try the decisions again.",
  restart: "Restart queue",
  queue: "Review queue",
  photosHint: "Photos: use the arrows on the image.",
  gestureHint: "Decisions: drag the card left (discard) or right (select), or use the buttons below.",
  buttonsHint: "Decisions: use the buttons below.",
  recording: "Recording decision…",
  keyboardHint: "With the card focused: ← discards, → selects. To save, use the Save button.",
  rejected: "Discarded",
  saved: "Saved",
  selected: "Selected",
  remaining: (n: number) => `${n} after this one`,
  item: (i: number, n: number) => `Item ${i} of ${n}`,
  decision: (action: string, i: number, n: number) => `${action}: item ${i} of ${n}.`,
};
export const table = {
  search: "Search…",
  of: "of",
  filters: "Filters",
  clear: "Clear",
  clearFilters: "Clear filters",
  noMatch: "Nothing matches the current filters.",
  empty: "Nothing here yet.",
  perPage: "Per page",
  perPageLabel: "Rows per page",
  filterBy: (label: string) => `Filter by ${label}`,
};
export const tableOfContents = {
  label: "On this page",
};
export const tabs = {
  completeAria: "Status: complete",
  attentionAria: "Status: needs attention",
  complete: "Complete",
  attention: "Needs attention",
};
export const timeline = {
  empty: "Add the key milestones of this journey.",
  emptyTitle: "No milestones yet",
  label: "Journey milestones",
  scroll: "Milestones, scroll to see the sequence",
  completed: "Done",
  current: "In progress",
  planned: "Planned",
};
export const topbar = {
  search: "Search projects, people, files…",
  viewMode: "View mode",
};
export const trace = {
  label: "Run steps",
  pending: "Waiting",
  running: "Running",
  complete: "Done",
  error: "Error",
};
export const usageMeter = {
  of: "of",
};
export const userMenu = {
  profile: "Profile",
  settings: "Settings",
  logout: "Sign out",
  account: (name: string) => `${name}'s account`,
};
export const visitSchedulePicker = {
  label: "Choose availability for a visit",
  chooseDays: "Choose the days",
  chooseDaysHint: "Click more than one date to build your options.",
  selectedDays: "Selected days",
  selectedDaysHint: "Switch the day to set different times.",
  editingDay: "Day being edited",
  times: "Available times",
  timesHint: "From 8 a.m. to 7 p.m., in 30-minute slots.",
  summary: "Your availability",
  summaryHint: "Select the time ranges available for booking.",
  pickTimes: "Choose the times",
  days: (n: number) => `${n} day${n === 1 ? "" : "s"}`,
  slots: (n: number) => `${n} time${n === 1 ? "" : "s"}`,
  timezone: (tz: string) => `time zone ${tz}`,
  timesOf: (date: string) => `Times on ${date}`,
  withTime: (n: number) => `${n} with times`,
  shownIn: (tz: string) => `Times shown in ${tz}.`,
};
export const voiceRecorder = {
  error: "Check the browser permission or continue with the keyboard.",
  errorTitle: "We could not access the microphone",
  retry: "Try again",
  useDictation: "Use dictation",
  fallbackTitle: "Use your phone's dictation",
  gotIt: "Got it",
  fallbackHint: "Tap the microphone on the keyboard. The text shows up in the field and stays editable before you send it.",
  start: "Start voice recording",
  prefer: "Rather speak?",
  preferHint: "Say it your way. You review the text before continuing.",
  panel: "Voice recording",
  listening: "Listening to you",
  paused: "Recording paused",
  listeningHint: "Speak normally. The text appears as you talk.",
  pausedHint: "Resume when you are ready.",
  micPaused: "Microphone paused",
  cancel: "Cancel",
  pause: "Pause recording",
  resume: "Resume recording",
  finish: "Done",
  level: (n: number) => `Microphone level: ${n}%`,
};
export const wizardStepper = {
  label: "Progress",
  back: "Back to previous step",
  step: "Step",
  complete: "done",
  current: "current step",
  notStarted: "not started",
  position: (label: string, i: number, n: number) => `${label}: step ${i} of ${n}`,
  count: (i: number, n: number): string => `${i} of ${n}`,
};
export const workspaceSwitcher = {
  search: "Search workspace",
  searchPlaceholder: "Search workspace…",
  list: "Workspaces",
  empty: "No workspace",
  current: (name: string) => `Current workspace: ${name}. Switch workspace`,
};

export const en = { activityTimeline, alertDialog, appShell, approvalWorkbench, avatarGroup, billingCard, breadcrumb, calendar, callout, carousel, charts, codeBlock, combobox, command, common, contextMenu, coverflow, d3Chart, datePicker, deviceFrame, fabMenu, fileUpload, geoAreaPicker, guidedTour, helpField, helpMenu, intentComposer, kanbanBoard, matrix2x2, menu, menubar, message, messageScroller, modal, multiselect, navigationMenu, notificationBell, oauthButton, otp, pagination, phoneInput, planCard, postalCodeInput, propertyActionGroup, propertyCard, propertyMedia, questionnaire, range, resizable, settingsSubnav, sidebar, spinner, splitButton, stat, swipeDeck, table, tableOfContents, tabs, timeline, topbar, trace, usageMeter, userMenu, visitSchedulePicker, voiceRecorder, wizardStepper, workspaceSwitcher };
export type RefyMessages = typeof en;
