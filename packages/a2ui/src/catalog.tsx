import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createComponentImplementation } from "@a2ui/react";
import type { ReactCatalogComponent } from "@a2ui/react";
import { Catalog, MessageProcessor } from "@a2ui/web_core";
import type { MessageProcessorOptions } from "@a2ui/web_core";
import {
  BASIC_FUNCTIONS,
  ButtonApi,
  CardApi,
  CheckBoxApi,
  ChoicePickerApi,
  ColumnApi,
  DividerApi,
  ImageApi,
  ListApi,
  RowApi,
  SliderApi,
  TextApi,
  TextFieldApi,
} from "@a2ui/web_core/catalogs/basic/v1";
import {
  Button,
  Card,
  Checkbox,
  Chip,
  ChipGroup,
  Divider,
  Input,
  RadioGroup,
  Slider,
  Textarea,
} from "@refy-design/web";

import { REFY_CATALOG_ID, REFY_VALIDATION } from "./definition.js";

export { REFY_CATALOG_ID, REFY_VALIDATION } from "./definition.js";

type ChildRef = string | { id: string; basePath?: string };
type BuildChild = (id: string, basePath?: string) => ReactNode;

function slots(children: unknown, buildChild: BuildChild): ReactNode {
  if (!Array.isArray(children)) return null;
  return (children as ChildRef[]).map((child) => {
    const id = typeof child === "string" ? child : child.id;
    const basePath = typeof child === "string" ? undefined : child.basePath;
    return (
      <div className="ra-slot" key={`${id}${basePath ?? ""}`}>
        {buildChild(id, basePath)}
      </div>
    );
  });
}

function weightStyle(weight: unknown): CSSProperties {
  return typeof weight === "number" ? { flexGrow: weight, flexBasis: 0, minWidth: 0 } : {};
}

const JUSTIFY: Record<string, CSSProperties["justifyContent"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  spaceBetween: "space-between",
  spaceAround: "space-around",
  spaceEvenly: "space-evenly",
  stretch: "stretch",
};
const ALIGN: Record<string, CSSProperties["alignItems"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
};

const text = (value: unknown) => (value === undefined || value === null ? "" : String(value));

export const RefyText = createComponentImplementation(TextApi, ({ props }) => {
  const value = text(props.text);
  const heading = /^(#{1,5}) ([\s\S]*)$/.exec(value);
  const style = weightStyle(props.weight);
  if (heading) {
    const level = Math.min(heading[1].length + 1, 6);
    const Tag = `h${level}` as "h2";
    return (
      <Tag className="ra-heading" style={style}>
        {heading[2]}
      </Tag>
    );
  }
  return (
    <p className={props.variant === "caption" ? "ra-caption" : "ra-body"} style={style}>
      {value}
    </p>
  );
});

export const RefyImage = createComponentImplementation(ImageApi, ({ props }) => {
  const fit = props.fit === "scaleDown" ? "scale-down" : (props.fit ?? "cover");
  return (
    <img
      className={`ra-image ra-image-${props.variant ?? "mediumFeature"}`}
      src={text(props.url)}
      alt={text(props.description)}
      style={{ objectFit: fit, ...weightStyle(props.weight) }}
    />
  );
});

export const RefyRow = createComponentImplementation(RowApi, ({ props, buildChild }) => (
  <div
    className="ra-row"
    style={{
      justifyContent: JUSTIFY[props.justify ?? "start"],
      alignItems: ALIGN[props.align ?? "center"],
      ...weightStyle(props.weight),
    }}
  >
    {slots(props.children, buildChild)}
  </div>
));

export const RefyColumn = createComponentImplementation(ColumnApi, ({ props, buildChild }) => (
  <div
    className="ra-column"
    style={{
      justifyContent: JUSTIFY[props.justify ?? "start"],
      alignItems: ALIGN[props.align ?? "stretch"],
      ...weightStyle(props.weight),
    }}
  >
    {slots(props.children, buildChild)}
  </div>
));

export const RefyList = createComponentImplementation(ListApi, ({ props, buildChild }) => (
  <div
    role="list"
    className={props.direction === "horizontal" ? "ra-row" : "ra-column"}
    style={{ alignItems: props.align ? ALIGN[props.align] : undefined, ...weightStyle(props.weight) }}
  >
    {slots(props.children, buildChild)}
  </div>
));

export const RefyCard = createComponentImplementation(CardApi, ({ props, buildChild }) => (
  <Card padding="md" style={weightStyle(props.weight)}>
    {buildChild(props.child)}
  </Card>
));

export const RefyDivider = createComponentImplementation(DividerApi, ({ props }) => (
  <Divider orientation={props.axis === "vertical" ? "vertical" : "horizontal"} />
));

const BUTTON_VARIANT = { default: "secondary", primary: "primary", borderless: "ghost" } as const;

export const RefyButton = createComponentImplementation(ButtonApi, ({ props, buildChild }) => (
  <Button
    variant={BUTTON_VARIANT[(props.variant ?? "default") as keyof typeof BUTTON_VARIANT]}
    disabled={props.isValid === false}
    onClick={() => props.action?.()}
    style={weightStyle(props.weight)}
  >
    {buildChild(props.child)}
  </Button>
));

export const RefyTextField = createComponentImplementation(TextFieldApi, ({ props }) => {
  const error = props.validationErrors?.length ? props.validationErrors.join(" ") : undefined;
  const common = {
    label: props.label === undefined ? undefined : text(props.label),
    value: text(props.value),
    placeholder: props.placeholder === undefined ? undefined : text(props.placeholder),
    error,
  };
  if (props.variant === "longText") {
    return <Textarea {...common} block onChange={(event) => props.setValue?.(event.target.value)} />;
  }
  const type = props.variant === "obscured" ? "password" : props.variant === "number" ? "number" : "text";
  return <Input {...common} block type={type} onChange={(event) => props.setValue?.(event.target.value)} />;
});

export const RefyCheckBox = createComponentImplementation(CheckBoxApi, ({ props }) => (
  <Checkbox
    label={text(props.label)}
    checked={Boolean(props.value)}
    onChange={(event) => props.setValue?.(event.target.checked)}
  />
));

export const RefyChoicePicker = createComponentImplementation(ChoicePickerApi, ({ props }) => {
  // Nome próprio por instância: dois ChoicePicker com o mesmo rótulo não dividem o grupo de rádios.
  const name = useId();
  const options = (props.options ?? []).map((option) => ({ label: text(option.label), value: text(option.value) }));
  const selected = Array.isArray(props.value) ? props.value.map(String) : [];
  const multiple = props.variant === "multipleSelection";
  const label = text(props.label);
  if (props.displayStyle === "chips" || multiple) {
    return (
      <ChipGroup
        label={label}
        mode={multiple ? "multiple" : "single"}
        value={selected}
        onChange={(value) => props.setValue?.(Array.isArray(value) ? value : value ? [value] : [])}
      >
        {options.map((option) => (
          <Chip key={option.value} variant="filter" value={option.value}>
            {option.label}
          </Chip>
        ))}
      </ChipGroup>
    );
  }
  return (
    <RadioGroup
      name={name}
      label={label}
      options={options}
      value={selected[0] ?? ""}
      onChange={(value) => props.setValue?.([value])}
    />
  );
});

export const RefySlider = createComponentImplementation(SliderApi, ({ props }) => {
  const min = props.min ?? 0;
  // `steps` é o número de divisões da faixa; o Slider do refy recebe o tamanho de cada passo.
  const step = props.steps ? (props.max - min) / props.steps : undefined;
  return (
    <Slider
      label={text(props.label)}
      min={min}
      max={props.max}
      step={step}
      value={Number(props.value ?? 0)}
      showValue
      onChange={(value) => props.setValue?.(value)}
    />
  );
});

export const REFY_COMPONENTS = [
  RefyText,
  RefyImage,
  RefyRow,
  RefyColumn,
  RefyList,
  RefyCard,
  RefyDivider,
  RefyButton,
  RefyTextField,
  RefyCheckBox,
  RefyChoicePicker,
  RefySlider,
];

/** A2UI 1.0 não carrega tema: a aparência vem do ThemeProvider do refy em volta da superfície. */
export const refyCatalog = new Catalog(REFY_CATALOG_ID, "1.0", REFY_COMPONENTS, BASIC_FUNCTIONS);

type ActionHandler = ConstructorParameters<typeof MessageProcessor>[1];

/**
 * Processador com o catálogo do refy. Peça fora do catálogo (ex.: `Video`) é recusada com
 * `A2uiValidationError` e nada entra na superfície.
 */
export function createRefyProcessor(onAction?: ActionHandler, options: MessageProcessorOptions = {}) {
  return new MessageProcessor<ReactCatalogComponent>([refyCatalog], onAction, { validationConfig: REFY_VALIDATION, ...options });
}
