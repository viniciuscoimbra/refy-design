// Prova de tipo (tsc, sem execução): o nativo implementa o contrato de props da web.
import type { ComponentProps } from "react";
import type * as Core from "@refy-design/web/contracts";
import type * as N from "../src";
import type { D3ChartProps as WebChart } from "../../../src/components/Charts/d3/types";
import type { D3ChartProps as NativeChart } from "../src/chart/types";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;
/** Cada chave do contrato existe no nativo com o mesmo tipo. */
type Implements<NativeProps, CoreProps> = Equal<Pick<NativeProps, keyof CoreProps & keyof NativeProps>, Pick<CoreProps, keyof CoreProps & keyof NativeProps>> extends true
  ? Exclude<keyof CoreProps, keyof NativeProps> extends never ? true : false
  : false;

// Os tipos do gráfico são declarados à parte no nativo (a web puxa geojson e d3-geo), então a
// prova é atribuição nos dois sentidos, chave a chave, contra a família line/area da web.
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type WebLine = WebChart & { type: "line" };
type ChartKey = Exclude<keyof NativeChart, "type">;
type ChartKeysMatch = { [P in ChartKey]: P extends keyof WebLine ? Same<WebLine[P], NativeChart[P]> : false }[ChartKey] extends true ? true : false;

export type Conformance = [
  Expect<Implements<N.BadgeProps, Core.BadgeCoreProps>>,
  Expect<Implements<N.ChipProps, Core.ChipCoreProps>>,
  Expect<Implements<N.IconButtonProps, Core.IconButtonCoreProps>>,
  Expect<Implements<N.AvatarProps, Core.AvatarCoreProps>>,
  Expect<Implements<N.FabProps, Core.FabCoreProps>>,
  Expect<Implements<N.BrandLogoProps, Core.BrandLogoCoreProps>>,
  Expect<Implements<N.CardProps, Core.CardCoreProps>>,
  Expect<Implements<N.CardHeaderProps, Core.CardHeaderCoreProps>>,
  Expect<Implements<N.ChoiceCardGroupProps, Core.ChoiceCardGroupCoreProps>>,
  Expect<Implements<N.ChoiceCardProps, Core.ChoiceCardCoreProps>>,
  Expect<Implements<N.ConnectorCardProps, Core.ConnectorCardCoreProps>>,
  Expect<Implements<N.EmptyStateProps, Core.EmptyStateCoreProps>>,
  Expect<Implements<N.ItemProps, Core.ItemCoreProps>>,
  Expect<Implements<N.ModalProps, Core.ModalCoreProps>>,
  Expect<Implements<N.PageHeaderProps, Core.PageHeaderCoreProps>>,
  Expect<Implements<N.ProgressBarProps, Core.ProgressBarCoreProps>>,
  Expect<Implements<N.ScrollAreaProps, Core.ScrollAreaCoreProps>>,
  Expect<Implements<N.SegmentedProps, Core.SegmentedCoreProps>>,
  Expect<Implements<N.SettingRowProps, Core.SettingRowCoreProps>>,
  Expect<Implements<N.SettingRowGroupProps, Core.SettingRowGroupCoreProps>>,
  Expect<Implements<N.StatProps, Core.StatCoreProps>>,
  Expect<Implements<N.TabsProps, Core.TabsCoreProps>>,
  Expect<Implements<N.ToastProps, Core.ToastCoreProps>>,
  Expect<Implements<N.ToastRegionProps, Core.ToastRegionCoreProps>>,
  Expect<Implements<N.WizardStepperProps, Core.WizardStepperCoreProps>>,
  Expect<Implements<ComponentProps<typeof N.Button>, Core.ButtonCoreProps>>,
  Expect<Implements<ComponentProps<typeof N.Input>, Core.InputCoreProps>>,
  Expect<Implements<ComponentProps<typeof N.Textarea>, Core.TextareaCoreProps>>,
  Expect<Implements<ComponentProps<typeof N.OAuthButton>, Core.OAuthButtonCoreProps>>,
  Expect<Implements<N.SelectProps, Core.SelectCoreProps>>,
  Expect<Implements<N.DividerProps, Core.DividerCoreProps>>,
  Expect<Implements<N.SkeletonProps, Core.SkeletonCoreProps>>,
  Expect<Implements<N.StatusDotProps, Core.StatusDotCoreProps>>,
  Expect<Implements<N.SwitchProps, Core.SwitchCoreProps>>,
  Expect<Implements<N.CheckboxProps, Core.CheckboxCoreProps>>,
  Expect<Implements<N.RadioGroupProps, Core.RadioGroupCoreProps>>,
  Expect<Implements<N.AspectRatioProps, Core.AspectRatioCoreProps>>,
  Expect<Implements<N.BubbleProps, Core.BubbleCoreProps>>,
  Expect<Implements<N.ToggleGroupProps, Core.ToggleGroupCoreProps>>,
  Expect<Implements<N.PaginationProps, Core.PaginationCoreProps>>,
  Expect<Implements<N.OtpProps, Core.OtpCoreProps>>,
  Expect<Implements<N.SliderProps, Core.SliderCoreProps>>,
  Expect<Implements<N.RangeProps, Core.RangeCoreProps>>,
  Expect<Implements<N.AccordionProps, Core.AccordionCoreProps>>,
  Expect<Implements<N.CollapsibleProps, Core.CollapsibleCoreProps>>,
  Expect<Implements<N.CalloutProps, Core.CalloutCoreProps>>,
  Expect<Implements<N.ButtonGroupProps, Core.ButtonGroupCoreProps>>,
  Expect<Implements<N.AvatarGroupProps, Core.AvatarGroupCoreProps>>,
  Expect<Implements<N.SectionHeaderProps, Core.SectionHeaderCoreProps>>,
  Expect<Implements<N.ActivityItemProps, Core.ActivityItemCoreProps>>,
  Expect<Implements<N.PersonCellProps, Core.PersonCellCoreProps>>,
  Expect<Implements<N.NavCardProps, Core.NavCardCoreProps>>,
  Expect<Implements<N.UsageMeterProps, Core.UsageMeterCoreProps>>,
  Expect<Implements<N.UsageMeterGroupProps, Core.UsageMeterGroupCoreProps>>,
  Expect<Implements<N.ScoreGaugeProps, Core.ScoreGaugeCoreProps>>,
  Expect<Implements<N.StickyBarProps, Core.StickyBarCoreProps>>,
  Expect<Implements<N.StickyFooterProps, Core.StickyFooterCoreProps>>,
  Expect<Implements<N.PopoverProps, Core.PopoverCoreProps>>,
  Expect<Implements<N.TooltipProps, Core.TooltipCoreProps>>,
  Expect<Implements<N.MenuProps, Core.MenuCoreProps>>,
  Expect<Implements<N.ContextMenuProps, Core.ContextMenuCoreProps>>,
  Expect<Implements<N.SnackbarProps, Core.SnackbarCoreProps>>,
  Expect<Implements<N.SplitButtonProps, Core.SplitButtonCoreProps>>,
  Expect<Implements<N.FabMenuProps, Core.FabMenuCoreProps>>,
  Expect<Implements<N.CalendarProps, Core.CalendarCoreProps>>,
  Expect<Implements<N.DatePickerProps, Core.DatePickerCoreProps>>,
  Expect<Implements<N.PhoneInputProps, Core.PhoneInputCoreProps>>,
  Expect<Implements<N.PostalCodeInputProps, Core.PostalCodeInputCoreProps>>,
  Expect<Implements<N.HelpFieldProps, Core.HelpFieldCoreProps>>,
  Expect<Implements<N.ComboboxProps, Core.ComboboxCoreProps>>,
  Expect<Implements<N.MultiselectProps, Core.MultiselectCoreProps>>,
  Expect<Implements<N.CarouselProps, Core.CarouselCoreProps>>,
  Expect<Implements<N.MessageProps, Core.MessageCoreProps>>,
  Expect<Implements<N.MessageScrollerProps, Core.MessageScrollerCoreProps>>,
  Expect<Implements<N.CodeBlockProps, Core.CodeBlockCoreProps>>,
  Expect<Implements<N.BillingCardProps, Core.BillingCardCoreProps>>,
  Expect<Implements<N.PlanCardProps, Core.PlanCardCoreProps>>,
  Expect<Implements<N.DangerZoneProps, Core.DangerZoneCoreProps>>,
  Expect<Implements<N.DangerZoneRowProps, Core.DangerZoneRowCoreProps>>,
  Expect<Implements<N.UserMenuProps, Core.UserMenuCoreProps>>,
  Expect<Implements<N.HelpMenuProps, Core.HelpMenuCoreProps>>,
  Expect<Implements<N.NotificationBellProps, Core.NotificationBellCoreProps>>,
  Expect<Implements<N.WorkspaceSwitcherProps, Core.WorkspaceSwitcherCoreProps>>,
  Expect<Implements<N.SettingsSubnavProps, Core.SettingsSubnavCoreProps>>,
  Expect<Implements<N.KanbanCardProps, Core.KanbanCardCoreProps>>,
  Expect<Implements<N.PropertyActionGroupProps, Core.PropertyActionGroupCoreProps>>,
  Expect<Implements<N.PropertyMediaProps, Core.PropertyMediaCoreProps>>,
  Expect<Implements<N.FileUploadProps, Core.FileUploadCoreProps>>,
  Expect<Implements<N.VoiceRecorderProps, Core.VoiceRecorderCoreProps>>,
  Expect<Implements<N.AlertDialogProps, Core.AlertDialogCoreProps>>,
  Expect<Implements<N.DrawerProps, Core.DrawerCoreProps>>,
  Expect<Implements<N.TimelineProps, Core.TimelineCoreProps>>,
  Expect<Implements<N.EventTimelineProps, Core.EventTimelineCoreProps>>,
  Expect<Implements<N.PropertyCardProps, Core.PropertyCardCoreProps>>,
  Expect<Implements<N.Matrix2x2Props, Core.Matrix2x2CoreProps>>,
  Expect<Implements<N.TableProps<{ id: string }>, Core.TableCoreProps<{ id: string }>>>,
  Expect<Implements<N.KanbanBoardProps, Core.KanbanBoardCoreProps>>,
  Expect<Implements<N.SwipeDeckProps, Core.SwipeDeckCoreProps>>,
  Expect<Implements<N.QuestionnaireProps, Core.QuestionnaireCoreProps>>,
  Expect<Implements<N.GuidedTourProps, Core.GuidedTourCoreProps>>,
  Expect<Implements<N.GuidedTourAnchorProps, Core.GuidedTourAnchorCoreProps>>,
  Expect<Implements<N.CoverflowProps, Core.CoverflowCoreProps>>,
  Expect<Implements<N.ApprovalWorkbenchProps, Core.ApprovalWorkbenchCoreProps>>,
  Expect<Implements<N.TraceProps, Core.TraceCoreProps>>,
  Expect<Implements<N.VisitSchedulePickerProps, Core.VisitSchedulePickerCoreProps>>,
  Expect<Implements<N.GeoAreaPickerProps, Core.GeoAreaPickerCoreProps>>,
  Expect<Implements<N.IntentComposerProps, Core.IntentComposerCoreProps>>,
  Expect<Implements<N.LineChartProps, Core.LineChartCoreProps>>,
  Expect<Implements<N.AreaChartProps, Core.AreaChartCoreProps>>,
  Expect<Implements<N.BarChartProps, Core.BarChartCoreProps>>,
  Expect<Implements<N.DonutChartProps, Core.DonutChartCoreProps>>,
  Expect<Implements<N.SparklineProps, Core.SparklineCoreProps>>,
  Expect<Implements<N.ChartLegendProps, Core.ChartLegendCoreProps>>,
  // Gráfico: toda chave nativa tem o tipo da família line/area da web.
  Expect<ChartKeysMatch>,
  Expect<Equal<NativeChart["type"], Extract<WebChart["type"], "line" | "area">>>,
];

// Controle negativo: um tipo divergente reprova.
// @ts-expect-error tone com valor que o contrato não tem
export type Negative = Expect<Implements<{ tone?: "x" } & Omit<N.BadgeProps, "tone">, Core.BadgeCoreProps>>;
