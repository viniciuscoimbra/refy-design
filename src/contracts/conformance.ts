// Conferência de tipos: a web não pode divergir do contrato em nome, opcionalidade ou tipo.
// Roda no `npm run lint` (tsc). Não entra no build da biblioteca.
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
import type * as C from "./index";
import type { BadgeProps } from "../components/Badge/Badge";
import type { BadgeTone as WebBadgeTone } from "../components/Badge/Badge";
import type { BrandLogoBrand as WebBrandLogoBrand } from "../components/BrandLogo/BrandLogo";
import type { BrandLogoProps } from "../components/BrandLogo/BrandLogo";
import type { BrandLogoSize as WebBrandLogoSize } from "../components/BrandLogo/BrandLogo";
import type { ButtonProgressEffect as WebButtonProgressEffect } from "../components/Button/Button";
import type { ButtonProps } from "../components/Button/Button";
import type { ButtonSize as WebButtonSize } from "../components/Button/Button";
import type { ButtonStatus as WebButtonStatus } from "../components/Button/Button";
import type { ButtonVariant as WebButtonVariant } from "../components/Button/Button";
import type { CardHeaderProps } from "../components/Card/Card";
import type { CardProps } from "../components/Card/Card";
import type { CardTone as WebCardTone } from "../components/Card/Card";
import type { ChoiceCardGroupProps } from "../components/ChoiceCard/ChoiceCard";
import type { ChoiceCardMode as WebChoiceCardMode } from "../components/ChoiceCard/ChoiceCard";
import type { ChoiceCardProps } from "../components/ChoiceCard/ChoiceCard";
import type { ConnectorCardProps } from "../components/ConnectorCard/ConnectorCard";
import type { EmptyStateProps } from "../components/EmptyState/EmptyState";
import type { InputProps } from "../components/Input/Input";
import type { ItemProps } from "../components/Item/Item";
import type { ModalProps } from "../components/Modal/Modal";
import type { OAuthButtonProps } from "../components/OAuthButton/OAuthButton";
import type { OAuthProvider as WebOAuthProvider } from "../components/OAuthButton/OAuthButton";
import type { PageHeaderProps } from "../components/PageHeader/PageHeader";
import type { ProgressBarProps } from "../components/ProgressBar/ProgressBar";
import type { ProgressTone as WebProgressTone } from "../components/ProgressBar/ProgressBar";
import type { ScrollAreaProps } from "../components/ScrollArea/ScrollArea";
import type { SegmentedOption as WebSegmentedOption } from "../components/Segmented/Segmented";
import type { SegmentedProps } from "../components/Segmented/Segmented";
import type { SelectProps } from "../components/Select/Select";
import type { SettingRowGroupProps } from "../components/SettingRow/SettingRow";
import type { SettingRowProps } from "../components/SettingRow/SettingRow";
import type { StatDelta as WebStatDelta } from "../components/Stat/Stat";
import type { StatDeltaSentiment as WebStatDeltaSentiment } from "../components/Stat/Stat";
import type { StatGroupProps } from "../components/Stat/Stat";
import type { StatProps } from "../components/Stat/Stat";
import type { StatSize as WebStatSize } from "../components/Stat/Stat";
import type { StatTrend as WebStatTrend } from "../components/Stat/Stat";
import type { TabItem as WebTabItem } from "../components/Tabs/Tabs";
import type { TabsProps } from "../components/Tabs/Tabs";
import type { TextareaProps } from "../components/Textarea/Textarea";
import type { ToastData as WebToastData } from "../components/Toast/Toast";
import type { ToastProps } from "../components/Toast/Toast";
import type { ToastRegionProps } from "../components/Toast/Toast";
import type { ToastTone as WebToastTone } from "../components/Toast/Toast";
import type { WizardStep as WebWizardStep } from "../components/WizardStepper/WizardStepper";
import type { WizardStepperProps } from "../components/WizardStepper/WizardStepper";

import type { ChipProps, ChipTone as WebChipTone, ChipSelectionMode as WebChipSelectionMode } from "../components/Chip/Chip";
import type { IconButtonProps, IconButtonVariant as WebIconButtonVariant, IconButtonSize as WebIconButtonSize } from "../components/IconButton/IconButton";
import type { AvatarProps, AvatarSize as WebAvatarSize, AvatarShape as WebAvatarShape } from "../components/Avatar/Avatar";
import type { FabProps, FabSize as WebFabSize, FabVariant as WebFabVariant } from "../components/Fab/Fab";

import type { DividerProps, DividerOrientation as WebDividerOrientation, DividerSpacing as WebDividerSpacing } from "../components/Divider/Divider";
import type { SkeletonProps } from "../components/Skeleton/Skeleton";
import type { StatusDotProps, StatusDotTone as WebStatusDotTone } from "../components/StatusDot/StatusDot";
import type { SwitchProps } from "../components/Switch/Switch";
import type { CheckboxProps } from "../components/Checkbox/Checkbox";
import type { RadioGroupProps, RadioOption as WebRadioOption } from "../components/RadioGroup/RadioGroup";

import type { AspectRatioProps } from "../components/AspectRatio/AspectRatio";
import type { BubbleProps } from "../components/Bubble/Bubble";
import type { ToggleGroupProps, ToggleOption as WebToggleOption } from "../components/ToggleGroup/ToggleGroup";
import type { PaginationProps } from "../components/Pagination/Pagination";
import type { OtpProps } from "../components/Otp/Otp";
import type { SliderProps } from "../components/Slider/Slider";
import type { RangeProps, RangeValue as WebRangeValue } from "../components/Range/Range";

import type { AccordionProps, AccordionItem as WebAccordionItem } from "../components/Accordion/Accordion";
import type { CollapsibleProps } from "../components/Collapsible/Collapsible";
import type { CalloutProps, CalloutTone as WebCalloutTone } from "../components/Callout/Callout";
import type { ButtonGroupProps } from "../components/ButtonGroup/ButtonGroup";
import type { AvatarGroupProps, AvatarGroupItem as WebAvatarGroupItem } from "../components/AvatarGroup/AvatarGroup";
import type { SectionHeaderProps } from "../components/SectionHeader/SectionHeader";

import type { ActivityItemProps, ActivityActor as WebActivityActor } from "../components/ActivityItem/ActivityItem";
import type { PersonCellProps } from "../components/PersonCell/PersonCell";
import type { NavCardProps } from "../components/NavCard/NavCard";
import type { UsageMeterProps, UsageMeterGroupProps } from "../components/UsageMeter/UsageMeter";
import type { ScoreGaugeProps, ScoreGaugeSize as WebScoreGaugeSize, ScoreBand as WebScoreBand } from "../components/ScoreGauge/ScoreGauge";
import type { StickyBarProps } from "../components/StickyBar/StickyBar";
import type { StickyFooterProps } from "../components/StickyFooter/StickyFooter";

import type { PopoverProps, PopoverSide as WebPopoverSide, PopoverAlign as WebPopoverAlign } from "../components/Popover/Popover";
import type { TooltipProps } from "../components/Tooltip/Tooltip";
import type { MenuProps, MenuEntry as WebMenuEntry } from "../components/Menu/Menu";
import type { ContextMenuProps } from "../components/ContextMenu/ContextMenu";
import type { SnackbarProps } from "../components/Snackbar/Snackbar";
import type { SplitButtonProps, SplitButtonOption as WebSplitButtonOption, SplitButtonVariant as WebSplitButtonVariant } from "../components/SplitButton/SplitButton";
import type { FabMenuProps, FabMenuAction as WebFabMenuAction } from "../components/FabMenu/FabMenu";
import type { CalendarProps, CalendarMode as WebCalendarMode, DateRange as WebDateRange } from "../components/Calendar/Calendar";
import type { DatePickerProps } from "../components/DatePicker/DatePicker";
import type { PhoneInputProps, PhoneCountry as WebPhoneCountry } from "../components/PhoneInput/PhoneInput";
import type { PostalCodeInputProps, PostalCodeAddress as WebPostalCodeAddress } from "../components/PostalCodeInput/PostalCodeInput";
import type { HelpFieldProps } from "../components/HelpField/HelpField";
import type { ComboboxProps, ComboboxOption as WebComboboxOption, ComboboxOptionAvatar as WebComboboxOptionAvatar } from "../components/Combobox/Combobox";
import type { MultiselectProps, MultiselectOption as WebMultiselectOption } from "../components/Multiselect/Multiselect";
import type { CarouselProps, CarouselItem as WebCarouselItem } from "../components/Carousel/Carousel";
import type { MessageProps } from "../components/Message/Message";
import type { MessageScroller } from "../components/MessageScroller/MessageScroller";
import type { CodeBlockProps } from "../components/CodeBlock/CodeBlock";
import type { BillingCardProps } from "../components/BillingCard/BillingCard";
import type { PlanCardProps } from "../components/PlanCard/PlanCard";
import type { DangerZoneProps, DangerZoneRowProps } from "../components/DangerZone/DangerZone";
import type { UserMenuProps, UserMenuUser as WebUserMenuUser } from "../components/UserMenu/UserMenu";
import type { HelpMenuProps } from "../components/HelpMenu/HelpMenu";
import type { NotificationBellProps, NotificationItem as WebNotificationItem } from "../components/NotificationBell/NotificationBell";
import type { WorkspaceSwitcherProps, Workspace as WebWorkspace } from "../components/WorkspaceSwitcher/WorkspaceSwitcher";
import type { SettingsSubnavProps, SettingsSubnavItem as WebSettingsSubnavItem, SettingsSubnavGroup as WebSettingsSubnavGroup } from "../components/SettingsSubnav/SettingsSubnav";
import type { KanbanCardProps, KanbanCardItem as WebKanbanCardItem } from "../components/KanbanCard/KanbanCard";
import type { PropertyActionGroupProps, PropertyAction as WebPropertyAction, PropertyActionGroupState as WebPropertyActionGroupState } from "../components/PropertyActionGroup/PropertyActionGroup";
import type { TableProps, Column as WebTableColumn } from "../components/Table/Table";
import type { KanbanBoardProps, KanbanColumnItem as WebKanbanColumnItem } from "../components/KanbanBoard/KanbanBoard";
import type { SwipeDeckProps, SwipeDeckItem as WebSwipeDeckItem } from "../components/SwipeDeck/SwipeDeck";
import type { QuestionnaireProps, Question as WebQuestion } from "../components/Questionnaire/Questionnaire";
import type { GuidedTourProps, GuidedTourAnchorProps, GuidedTourStep as WebGuidedTourStep } from "../components/GuidedTour/GuidedTour";
import type { CoverflowProps, CoverflowItem as WebCoverflowItem } from "../components/Coverflow/Coverflow";
import type { ApprovalWorkbenchProps, ApprovalWorkbenchItem as WebApprovalWorkbenchItem } from "../components/ApprovalWorkbench/ApprovalWorkbench";
import type { TraceProps, TraceStep as WebTraceStep } from "../components/Trace/Trace";
import type { VisitSchedulePickerProps } from "../components/VisitSchedulePicker/VisitSchedulePicker";
import type { GeoAreaPickerProps, GeoNeighborhood as WebGeoNeighborhood } from "../components/GeoAreaPicker/GeoAreaPicker";
import type { LineChartProps, AreaChartProps, BarChartProps, DonutChartProps, SparklineProps, LineSeries as WebLineSeries, BarChartItem as WebBarChartItem, DonutSegment as WebDonutSegment } from "../components/Charts/Charts";
import type { ChartLegend as WebChartLegend } from "../components/Charts/ChartLegend";
import type { ChartLegendItem as WebChartLegendItem } from "../components/Charts/d3/types";
import type { IntentComposerProps, IntentFilterGroup as WebIntentFilterGroup, IntentComposerState as WebIntentComposerState } from "../components/IntentComposer/IntentComposer";
import type { AlertDialogProps } from "../components/AlertDialog/AlertDialog";
import type { DrawerProps, DrawerSide as WebDrawerSide } from "../components/Drawer/Drawer";
import type { TimelineProps, TimelineMilestone as WebTimelineMilestone } from "../components/Timeline/Timeline";
import type { EventTimelineProps, TimelineEvent as WebTimelineEvent } from "../components/EventTimeline/EventTimeline";
import type { PropertyCardProps, PropertyCardBadge as WebPropertyCardBadge, PropertyCardFact as WebPropertyCardFact, PropertyCardLayout as WebPropertyCardLayout } from "../components/PropertyCard/PropertyCard";
import type { Matrix2x2Props, MatrixPoint as WebMatrixPoint } from "../components/Matrix2x2/Matrix2x2";
import type { FileUploadProps, FileUploadState as WebFileUploadState } from "../components/FileUpload/FileUpload";
import type { VoiceRecorderProps, VoiceRecorderState as WebVoiceRecorderState } from "../components/VoiceRecorder/VoiceRecorder";
import type { PropertyMediaProps, PropertyMediaItem as WebPropertyMediaItem } from "../components/PropertyMedia/PropertyMedia";

export type ContractConformance = [
  Expect<Equal<Pick<ButtonProps, keyof C.ButtonCoreProps>, C.ButtonCoreProps>>,
  Expect<Equal<Pick<BadgeProps, keyof C.BadgeCoreProps>, C.BadgeCoreProps>>,
  Expect<Equal<Pick<BrandLogoProps, keyof C.BrandLogoCoreProps>, C.BrandLogoCoreProps>>,
  Expect<Equal<Pick<CardProps, keyof C.CardCoreProps>, C.CardCoreProps>>,
  Expect<Equal<Pick<CardHeaderProps, keyof C.CardHeaderCoreProps>, C.CardHeaderCoreProps>>,
  Expect<Equal<Pick<ConnectorCardProps, keyof C.ConnectorCardCoreProps>, C.ConnectorCardCoreProps>>,
  Expect<Equal<Pick<EmptyStateProps, keyof C.EmptyStateCoreProps>, C.EmptyStateCoreProps>>,
  Expect<Equal<Pick<ItemProps, keyof C.ItemCoreProps>, C.ItemCoreProps>>,
  Expect<Equal<Pick<PageHeaderProps, keyof C.PageHeaderCoreProps>, C.PageHeaderCoreProps>>,
  Expect<Equal<Pick<ProgressBarProps, keyof C.ProgressBarCoreProps>, C.ProgressBarCoreProps>>,
  Expect<Equal<Pick<StatProps, keyof C.StatCoreProps>, C.StatCoreProps>>,
  Expect<Equal<Pick<StatGroupProps, keyof C.StatGroupCoreProps>, C.StatGroupCoreProps>>,
  Expect<Equal<Pick<ScrollAreaProps, keyof C.ScrollAreaCoreProps>, C.ScrollAreaCoreProps>>,
  Expect<Equal<Pick<InputProps, keyof C.InputCoreProps>, C.InputCoreProps>>,
  Expect<Equal<Pick<TextareaProps, keyof C.TextareaCoreProps>, C.TextareaCoreProps>>,
  Expect<Equal<Pick<SelectProps, keyof C.SelectCoreProps>, C.SelectCoreProps>>,
  Expect<Equal<Pick<SettingRowProps, keyof C.SettingRowCoreProps>, C.SettingRowCoreProps>>,
  Expect<Equal<Pick<SettingRowGroupProps, keyof C.SettingRowGroupCoreProps>, C.SettingRowGroupCoreProps>>,
  Expect<Equal<Pick<ChoiceCardGroupProps, keyof C.ChoiceCardGroupCoreProps>, C.ChoiceCardGroupCoreProps>>,
  Expect<Equal<Pick<ChoiceCardProps, keyof C.ChoiceCardCoreProps>, C.ChoiceCardCoreProps>>,
  Expect<Equal<Pick<SegmentedProps, keyof C.SegmentedCoreProps>, C.SegmentedCoreProps>>,
  Expect<Equal<Pick<TabsProps, keyof C.TabsCoreProps>, C.TabsCoreProps>>,
  Expect<Equal<Pick<WizardStepperProps, keyof C.WizardStepperCoreProps>, C.WizardStepperCoreProps>>,
  Expect<Equal<Pick<ModalProps, keyof C.ModalCoreProps>, C.ModalCoreProps>>,
  Expect<Equal<Pick<ToastProps, keyof C.ToastCoreProps>, C.ToastCoreProps>>,
  Expect<Equal<Pick<ToastRegionProps, keyof C.ToastRegionCoreProps>, C.ToastRegionCoreProps>>,
  Expect<Equal<Pick<OAuthButtonProps, keyof C.OAuthButtonCoreProps>, C.OAuthButtonCoreProps>>,
  Expect<Equal<WebButtonVariant, C.ButtonVariant>>,
  Expect<Equal<WebButtonSize, C.ButtonSize>>,
  Expect<Equal<WebButtonStatus, C.ButtonStatus>>,
  Expect<Equal<WebButtonProgressEffect, C.ButtonProgressEffect>>,
  Expect<Equal<WebBadgeTone, C.BadgeTone>>,
  Expect<Equal<WebBrandLogoBrand, C.BrandLogoBrand>>,
  Expect<Equal<WebBrandLogoSize, C.BrandLogoSize>>,
  Expect<Equal<WebCardTone, C.CardTone>>,
  Expect<Equal<WebProgressTone, C.ProgressTone>>,
  Expect<Equal<WebStatSize, C.StatSize>>,
  Expect<Equal<WebStatTrend, C.StatTrend>>,
  Expect<Equal<WebStatDeltaSentiment, C.StatDeltaSentiment>>,
  Expect<Equal<WebStatDelta, C.StatDelta>>,
  Expect<Equal<WebChoiceCardMode, C.ChoiceCardMode>>,
  Expect<Equal<WebSegmentedOption, C.SegmentedOption>>,
  Expect<Equal<WebTabItem, C.TabItem>>,
  Expect<Equal<WebWizardStep, C.WizardStep>>,
  Expect<Equal<WebToastTone, C.ToastTone>>,
  Expect<Equal<WebToastData, C.ToastData>>,
  Expect<Equal<WebOAuthProvider, C.OAuthProvider>>,
  Expect<Equal<Pick<ChipProps, keyof C.ChipCoreProps>, C.ChipCoreProps>>,
  Expect<Equal<Pick<IconButtonProps, keyof C.IconButtonCoreProps>, C.IconButtonCoreProps>>,
  Expect<Equal<Pick<AvatarProps, keyof C.AvatarCoreProps>, C.AvatarCoreProps>>,
  Expect<Equal<Pick<FabProps, keyof C.FabCoreProps>, C.FabCoreProps>>,
  Expect<Equal<WebChipTone, C.ChipTone>>,
  Expect<Equal<WebChipSelectionMode, C.ChipSelectionMode>>,
  Expect<Equal<WebIconButtonVariant, C.IconButtonVariant>>,
  Expect<Equal<WebIconButtonSize, C.IconButtonSize>>,
  Expect<Equal<WebAvatarSize, C.AvatarSize>>,
  Expect<Equal<WebAvatarShape, C.AvatarShape>>,
  Expect<Equal<WebFabSize, C.FabSize>>,
  Expect<Equal<WebFabVariant, C.FabVariant>>,
  Expect<Equal<Pick<DividerProps, keyof C.DividerCoreProps>, C.DividerCoreProps>>,
  Expect<Equal<Pick<SkeletonProps, keyof C.SkeletonCoreProps>, C.SkeletonCoreProps>>,
  Expect<Equal<Pick<StatusDotProps, keyof C.StatusDotCoreProps>, C.StatusDotCoreProps>>,
  Expect<Equal<Pick<SwitchProps, keyof C.SwitchCoreProps>, C.SwitchCoreProps>>,
  Expect<Equal<Pick<CheckboxProps, keyof C.CheckboxCoreProps>, C.CheckboxCoreProps>>,
  Expect<Equal<Pick<RadioGroupProps, keyof C.RadioGroupCoreProps>, C.RadioGroupCoreProps>>,
  Expect<Equal<WebDividerOrientation, C.DividerOrientation>>,
  Expect<Equal<WebDividerSpacing, C.DividerSpacing>>,
  Expect<Equal<WebStatusDotTone, C.StatusDotTone>>,
  Expect<Equal<WebRadioOption, C.RadioOption>>,
  Expect<Equal<Pick<AspectRatioProps, keyof C.AspectRatioCoreProps>, C.AspectRatioCoreProps>>,
  Expect<Equal<Pick<BubbleProps, keyof C.BubbleCoreProps>, C.BubbleCoreProps>>,
  Expect<Equal<Pick<ToggleGroupProps, keyof C.ToggleGroupCoreProps>, C.ToggleGroupCoreProps>>,
  Expect<Equal<Pick<PaginationProps, keyof C.PaginationCoreProps>, C.PaginationCoreProps>>,
  Expect<Equal<Pick<OtpProps, keyof C.OtpCoreProps>, C.OtpCoreProps>>,
  Expect<Equal<Pick<SliderProps, keyof C.SliderCoreProps>, C.SliderCoreProps>>,
  Expect<Equal<Pick<RangeProps, keyof C.RangeCoreProps>, C.RangeCoreProps>>,
  Expect<Equal<WebToggleOption, C.ToggleOption>>,
  Expect<Equal<WebRangeValue, C.RangeValue>>,
  Expect<Equal<Pick<AccordionProps, keyof C.AccordionCoreProps>, C.AccordionCoreProps>>,
  Expect<Equal<Pick<CollapsibleProps, keyof C.CollapsibleCoreProps>, C.CollapsibleCoreProps>>,
  Expect<Equal<Pick<CalloutProps, keyof C.CalloutCoreProps>, C.CalloutCoreProps>>,
  Expect<Equal<Pick<ButtonGroupProps, keyof C.ButtonGroupCoreProps>, C.ButtonGroupCoreProps>>,
  Expect<Equal<Pick<AvatarGroupProps, keyof C.AvatarGroupCoreProps>, C.AvatarGroupCoreProps>>,
  Expect<Equal<Pick<SectionHeaderProps, keyof C.SectionHeaderCoreProps>, C.SectionHeaderCoreProps>>,
  Expect<Equal<WebAccordionItem, C.AccordionItem>>,
  Expect<Equal<WebCalloutTone, C.CalloutTone>>,
  Expect<Equal<WebAvatarGroupItem, C.AvatarGroupItem>>,
  Expect<Equal<Pick<ActivityItemProps, Exclude<keyof C.ActivityItemCoreProps, "actor">>, Omit<C.ActivityItemCoreProps, "actor">>>,
  Expect<Equal<Pick<WebActivityActor, keyof C.ActivityActorCore>, C.ActivityActorCore>>,
  Expect<Equal<Pick<PersonCellProps, keyof C.PersonCellCoreProps>, C.PersonCellCoreProps>>,
  Expect<Equal<Pick<NavCardProps, keyof C.NavCardCoreProps>, C.NavCardCoreProps>>,
  Expect<Equal<Pick<UsageMeterProps, keyof C.UsageMeterCoreProps>, C.UsageMeterCoreProps>>,
  Expect<Equal<Pick<UsageMeterGroupProps, keyof C.UsageMeterGroupCoreProps>, C.UsageMeterGroupCoreProps>>,
  Expect<Equal<Pick<ScoreGaugeProps, keyof C.ScoreGaugeCoreProps>, C.ScoreGaugeCoreProps>>,
  Expect<Equal<WebScoreGaugeSize, C.ScoreGaugeSize>>,
  Expect<Equal<WebScoreBand, C.ScoreBand>>,
  Expect<Equal<Pick<StickyBarProps, keyof C.StickyBarCoreProps>, C.StickyBarCoreProps>>,
  Expect<Equal<Pick<StickyFooterProps, keyof C.StickyFooterCoreProps>, C.StickyFooterCoreProps>>,
  Expect<Equal<Pick<PopoverProps, keyof C.PopoverCoreProps>, C.PopoverCoreProps>>,
  Expect<Equal<Pick<TooltipProps, keyof C.TooltipCoreProps>, C.TooltipCoreProps>>,
  Expect<Equal<Pick<MenuProps, keyof C.MenuCoreProps>, C.MenuCoreProps>>,
  Expect<Equal<Pick<ContextMenuProps, keyof C.ContextMenuCoreProps>, C.ContextMenuCoreProps>>,
  Expect<Equal<Pick<SnackbarProps, keyof C.SnackbarCoreProps>, C.SnackbarCoreProps>>,
  Expect<Equal<Pick<SplitButtonProps, keyof C.SplitButtonCoreProps>, C.SplitButtonCoreProps>>,
  Expect<Equal<Pick<FabMenuProps, keyof C.FabMenuCoreProps>, C.FabMenuCoreProps>>,
  Expect<Equal<WebPopoverSide, C.PopoverSide>>,
  Expect<Equal<WebPopoverAlign, C.PopoverAlign>>,
  Expect<Equal<WebMenuEntry, C.MenuEntry>>,
  Expect<Equal<WebSplitButtonOption, C.SplitButtonOption>>,
  Expect<Equal<WebSplitButtonVariant, C.SplitButtonVariant>>,
  Expect<Equal<WebFabMenuAction, C.FabMenuAction>>,
  Expect<Equal<Pick<CalendarProps, keyof C.CalendarCoreProps>, C.CalendarCoreProps>>,
  Expect<Equal<Pick<DatePickerProps, keyof C.DatePickerCoreProps>, C.DatePickerCoreProps>>,
  Expect<Equal<Pick<PhoneInputProps, keyof C.PhoneInputCoreProps>, C.PhoneInputCoreProps>>,
  Expect<Equal<Pick<PostalCodeInputProps, keyof C.PostalCodeInputCoreProps>, C.PostalCodeInputCoreProps>>,
  Expect<Equal<Pick<HelpFieldProps, keyof C.HelpFieldCoreProps>, C.HelpFieldCoreProps>>,
  Expect<Equal<WebCalendarMode, C.CalendarMode>>,
  Expect<Equal<WebDateRange, C.DateRange>>,
  Expect<Equal<WebPhoneCountry, C.PhoneCountry>>,
  Expect<Equal<WebPostalCodeAddress, C.PostalCodeAddress>>,
  Expect<Equal<Pick<ComboboxProps, keyof C.ComboboxCoreProps>, C.ComboboxCoreProps>>,
  Expect<Equal<Pick<MultiselectProps, keyof C.MultiselectCoreProps>, C.MultiselectCoreProps>>,
  Expect<Equal<WebComboboxOption, C.ComboboxOption>>,
  Expect<Equal<WebComboboxOptionAvatar, C.ComboboxOptionAvatar>>,
  Expect<Equal<WebMultiselectOption, C.MultiselectOption>>,
  Expect<Equal<Pick<CarouselProps, keyof C.CarouselCoreProps>, C.CarouselCoreProps>>,
  Expect<Equal<WebCarouselItem, C.CarouselItem>>,
  Expect<Equal<Pick<MessageProps, keyof C.MessageCoreProps>, C.MessageCoreProps>>,
  Expect<Equal<Parameters<typeof MessageScroller>[0], C.MessageScrollerCoreProps>>,
  Expect<Equal<Pick<CodeBlockProps, keyof C.CodeBlockCoreProps>, C.CodeBlockCoreProps>>,
  Expect<Equal<Pick<BillingCardProps, keyof C.BillingCardCoreProps>, C.BillingCardCoreProps>>,
  Expect<Equal<Pick<PlanCardProps, keyof C.PlanCardCoreProps>, C.PlanCardCoreProps>>,
  Expect<Equal<Pick<DangerZoneProps, keyof C.DangerZoneCoreProps>, C.DangerZoneCoreProps>>,
  Expect<Equal<Pick<DangerZoneRowProps, keyof C.DangerZoneRowCoreProps>, C.DangerZoneRowCoreProps>>,
  Expect<Equal<Pick<UserMenuProps, keyof C.UserMenuCoreProps>, C.UserMenuCoreProps>>,
  Expect<Equal<Pick<HelpMenuProps, keyof C.HelpMenuCoreProps>, C.HelpMenuCoreProps>>,
  Expect<Equal<Pick<NotificationBellProps, keyof C.NotificationBellCoreProps>, C.NotificationBellCoreProps>>,
  Expect<Equal<Pick<WorkspaceSwitcherProps, keyof C.WorkspaceSwitcherCoreProps>, C.WorkspaceSwitcherCoreProps>>,
  Expect<Equal<Pick<SettingsSubnavProps, keyof C.SettingsSubnavCoreProps>, C.SettingsSubnavCoreProps>>,
  Expect<Equal<Pick<KanbanCardProps, keyof C.KanbanCardCoreProps>, C.KanbanCardCoreProps>>,
  Expect<Equal<Pick<PropertyActionGroupProps, keyof C.PropertyActionGroupCoreProps>, C.PropertyActionGroupCoreProps>>,
  Expect<Equal<Pick<PropertyMediaProps, keyof C.PropertyMediaCoreProps>, C.PropertyMediaCoreProps>>,
  Expect<Equal<WebUserMenuUser, C.UserMenuUser>>,
  Expect<Equal<WebNotificationItem, C.NotificationItem>>,
  Expect<Equal<WebWorkspace, C.Workspace>>,
  Expect<Equal<WebSettingsSubnavItem, C.SettingsSubnavItem>>,
  Expect<Equal<WebSettingsSubnavGroup, C.SettingsSubnavGroup>>,
  Expect<Equal<WebKanbanCardItem, C.KanbanCardItem>>,
  Expect<Equal<WebPropertyAction, C.PropertyAction>>,
  Expect<Equal<WebPropertyActionGroupState, C.PropertyActionGroupState>>,
  Expect<Equal<WebPropertyMediaItem, C.PropertyMediaItem>>,
  Expect<Equal<Pick<TableProps<{ id: string }>, keyof C.TableCoreProps<{ id: string }>>, C.TableCoreProps<{ id: string }>>>,
  Expect<Equal<Omit<WebTableColumn<{ id: string }>, "width">, C.TableColumnCore<{ id: string }>>>,
  Expect<Equal<Pick<KanbanBoardProps, keyof C.KanbanBoardCoreProps>, C.KanbanBoardCoreProps>>,
  Expect<Equal<WebKanbanColumnItem, C.KanbanColumnItem>>,
  Expect<Equal<Pick<SwipeDeckProps, keyof C.SwipeDeckCoreProps>, C.SwipeDeckCoreProps>>,
  Expect<Equal<Pick<WebSwipeDeckItem, keyof C.SwipeDeckItemCore>, C.SwipeDeckItemCore>>,
  Expect<Equal<QuestionnaireProps, C.QuestionnaireCoreProps>>,
  Expect<Equal<WebQuestion, C.Question>>,
  Expect<Equal<GuidedTourProps, C.GuidedTourCoreProps>>,
  Expect<Equal<Omit<GuidedTourAnchorProps, "className">, C.GuidedTourAnchorCoreProps>>,
  Expect<Equal<WebGuidedTourStep, C.GuidedTourStep>>,
  Expect<Equal<Omit<CoverflowProps<WebCoverflowItem>, "className">, C.CoverflowCoreProps>>,
  Expect<Equal<WebCoverflowItem, C.CoverflowItem>>,
  Expect<Equal<Pick<ApprovalWorkbenchProps, keyof C.ApprovalWorkbenchCoreProps>, C.ApprovalWorkbenchCoreProps>>,
  Expect<Equal<WebApprovalWorkbenchItem, C.ApprovalWorkbenchItem>>,
  Expect<Equal<TraceProps, C.TraceCoreProps>>,
  Expect<Equal<WebTraceStep, C.TraceStep>>,
  Expect<Equal<Omit<VisitSchedulePickerProps, "className">, C.VisitSchedulePickerCoreProps>>,
  Expect<Equal<Omit<GeoAreaPickerProps, "className">, C.GeoAreaPickerCoreProps>>,
  Expect<Equal<WebGeoNeighborhood, C.GeoNeighborhood>>,
  Expect<Equal<Omit<IntentComposerProps, "className" | "voiceRecorderProps">, C.IntentComposerCoreProps>>,
  Expect<Equal<WebIntentFilterGroup, C.IntentFilterGroup>>,
  Expect<Equal<WebIntentComposerState, C.IntentComposerState>>,
  Expect<Equal<Omit<LineChartProps, "className">, C.LineChartCoreProps>>,
  Expect<Equal<Omit<AreaChartProps, "className">, C.AreaChartCoreProps>>,
  Expect<Equal<Omit<BarChartProps, "className">, C.BarChartCoreProps>>,
  Expect<Equal<Omit<DonutChartProps, "className">, C.DonutChartCoreProps>>,
  Expect<Equal<Omit<SparklineProps, "className">, C.SparklineCoreProps>>,
  Expect<Equal<WebLineSeries, C.LineSeries>>,
  Expect<Equal<WebBarChartItem, C.BarChartItem>>,
  Expect<Equal<WebDonutSegment, C.DonutSegment>>,
  Expect<Equal<Omit<Parameters<typeof WebChartLegend>[0], "className">, C.ChartLegendCoreProps>>,
  Expect<Equal<WebChartLegendItem, C.ChartLegendItem>>,
  Expect<Equal<Pick<AlertDialogProps, keyof C.AlertDialogCoreProps>, C.AlertDialogCoreProps>>,
  Expect<Equal<Pick<DrawerProps, keyof C.DrawerCoreProps>, C.DrawerCoreProps>>,
  Expect<Equal<WebDrawerSide, C.DrawerSide>>,
  Expect<Equal<Pick<TimelineProps, keyof C.TimelineCoreProps>, C.TimelineCoreProps>>,
  Expect<Equal<WebTimelineMilestone, C.TimelineMilestone>>,
  Expect<Equal<Pick<EventTimelineProps, keyof C.EventTimelineCoreProps>, C.EventTimelineCoreProps>>,
  Expect<Equal<Omit<WebTimelineEvent, "actor">, Omit<C.TimelineEventCore, "actor">>>,
  Expect<Equal<Pick<PropertyCardProps, keyof C.PropertyCardCoreProps>, C.PropertyCardCoreProps>>,
  Expect<Equal<WebPropertyCardBadge, C.PropertyCardBadge>>,
  Expect<Equal<WebPropertyCardFact, C.PropertyCardFact>>,
  Expect<Equal<WebPropertyCardLayout, C.PropertyCardLayout>>,
  Expect<Equal<Pick<Matrix2x2Props, keyof C.Matrix2x2CoreProps>, C.Matrix2x2CoreProps>>,
  Expect<Equal<WebMatrixPoint, C.MatrixPoint>>,
  Expect<Equal<Pick<FileUploadProps, keyof C.FileUploadCoreProps>, C.FileUploadCoreProps>>,
  Expect<Equal<Pick<VoiceRecorderProps, keyof C.VoiceRecorderCoreProps>, C.VoiceRecorderCoreProps>>,
  Expect<Equal<WebFileUploadState, C.FileUploadState>>,
  Expect<Equal<WebVoiceRecorderState, C.VoiceRecorderState>>,
];
