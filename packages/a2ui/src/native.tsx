// Ponte React Native: as mesmas 12 peças do catálogo `https://refy.design/a2ui/v1`, desenhadas com
// o @refy-design/mobile. O estado, a validação e as ações são do @a2ui/web_core, como na web; o
// renderizador do @a2ui/react não entra (usa react-dom e o DOM). Cada peça liga suas props com o
// `GenericBinder` do web_core, o mesmo que o React usa, então o JSON do agente é o mesmo.
//
// A aparência vem do <RefyProvider> do app em volta da superfície: o A2UI 1.0 não manda tema.
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from "react";
import type { ComponentType, ReactNode } from "react";
import { Image, Linking, Text, View } from "react-native";
import type { ImageStyle, TextStyle, ViewStyle } from "react-native";
import { A2uiExpressionError, Catalog, ComponentContext, GenericBinder, MessageProcessor, createFunctionImplementation } from "@a2ui/web_core";
import type { ComponentApi, ComponentModel, MessageProcessorOptions, SurfaceModel } from "@a2ui/web_core";
import {
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
} from "@a2ui/web_core/src/catalogs/basic/v1/components/basic_components.js";
import { BASIC_FUNCTIONS } from "@a2ui/web_core/src/catalogs/basic/v1/functions/basic_functions.js";
import { Button, Card, Checkbox, Chip, Divider, Input, Label, RadioGroup, Slider, Textarea, useRefy } from "@refy-design/mobile";
import type { RefyContext } from "@refy-design/mobile";

import { REFY_CATALOG_ID, REFY_VALIDATION } from "./ids.js";

export { REFY_CATALOG_ID, REFY_VALIDATION } from "./ids.js";

// Props já resolvidas pelo GenericBinder: valores do modelo de dados, `setX` para os campos
// ligados e `action()` para as ações.
type Props = Record<string, any>;
type BuildChild = (id: string, basePath?: string) => ReactNode;

/** Uma peça do catálogo nativo: a API do A2UI e o componente que a desenha. */
export interface NativeCatalogComponent extends ComponentApi {
  render: ComponentType<{ props: Props; buildChild: BuildChild }>;
}

function nativeComponent(api: ComponentApi, render: NativeCatalogComponent["render"]): NativeCatalogComponent {
  return { name: api.name, schema: api.schema, allowedParents: api.allowedParents, allowedChildren: api.allowedChildren, render };
}

type Surface = SurfaceModel<NativeCatalogComponent>;
const SurfaceContext = createContext<{ surface: Surface; basePath?: string } | null>(null);

/** O GenericBinder de uma peça, recriado se o modo estrito do React o descartar. */
function useBinder(surface: Surface, id: string, basePath: string | undefined, api: ComponentApi | undefined, model: ComponentModel | undefined) {
  const [generation, renew] = useReducer((n: number) => n + 1, 0);
  const box = useMemo(
    () => (api && model ? { binder: new GenericBinder(new ComponentContext(surface, id, basePath), api.schema), dead: false } : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [surface, id, basePath, api, model, generation],
  );
  useEffect(() => {
    if (!box) return undefined;
    if (box.dead) {
      renew();
      return undefined;
    }
    return () => {
      box.dead = true;
      box.binder.dispose();
    };
  }, [box]);
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!box) return () => undefined;
      const subscription = box.binder.subscribe(onChange);
      return () => subscription.unsubscribe();
    },
    [box],
  );
  const snapshot = useSyncExternalStore(subscribe, () => (box ? (box.binder.snapshot as Props) : undefined));
  return snapshot ?? {};
}

/** A peça `id` como está agora na superfície: troca quando o agente manda outra com o mesmo id. */
function useComponentModel(surface: Surface, id: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const created = surface.componentsModel.onCreated.subscribe((component) => {
        if (component.id === id) onChange();
      });
      const deleted = surface.componentsModel.onDeleted.subscribe((removed) => {
        if (removed === id) onChange();
      });
      return () => {
        created.unsubscribe();
        deleted.unsubscribe();
      };
    },
    [surface, id],
  );
  return useSyncExternalStore(subscribe, () => surface.componentsModel.get(id));
}

function NativeNode({ id, basePath }: { id: string; basePath?: string }) {
  const scope = useContext(SurfaceContext);
  if (!scope) throw new Error("A2uiNativeSurface: peça fora da superfície.");
  const { surface } = scope;
  const model = useComponentModel(surface, id);
  const impl = model ? ((model.catalog ?? surface.catalog)?.components.get(model.type) as NativeCatalogComponent | undefined) : undefined;
  const props = useBinder(surface, id, basePath, impl, model);
  const buildChild = useCallback<BuildChild>((child, childPath) => <NativeNode key={`${child}${childPath ?? ""}`} id={child} basePath={childPath ?? basePath} />, [basePath]);
  const inner = useMemo(() => ({ surface, basePath }), [surface, basePath]);
  if (!model || !impl) return null;
  const Render = impl.render;
  return (
    <SurfaceContext.Provider value={inner}>
      <Render props={props} buildChild={buildChild} />
    </SurfaceContext.Provider>
  );
}

/** O texto de uma peça Text filha, para o Button desenhar o rótulo com a cor dele. */
function useChildText(childId: unknown): string | undefined {
  const scope = useContext(SurfaceContext);
  if (!scope) throw new Error("A2uiNativeSurface: peça fora da superfície.");
  const id = typeof childId === "string" ? childId : "";
  // Observa a troca do filho: se o agente trocar o Text por outra peça, o rótulo acompanha.
  const model = useComponentModel(scope.surface, id);
  const isText = model?.type === "Text";
  const props = useBinder(scope.surface, id, scope.basePath, isText ? TextApi : undefined, isText ? model : undefined);
  return isText ? text(props.text).replace(/^#{1,5} /, "") : undefined;
}

const text = (value: unknown) => (value === undefined || value === null ? "" : String(value));

function weightStyle(weight: unknown): ViewStyle {
  return typeof weight === "number" ? { flexGrow: weight, flexBasis: 0, minWidth: 0 } : {};
}

const JUSTIFY: Record<string, ViewStyle["justifyContent"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  spaceBetween: "space-between",
  spaceAround: "space-around",
  spaceEvenly: "space-evenly",
  stretch: "flex-start",
};
const ALIGN: Record<string, ViewStyle["alignItems"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
};

function slots(children: unknown, buildChild: BuildChild): ReactNode {
  if (!Array.isArray(children)) return null;
  return children.map((child: string | { id: string; basePath?: string }) =>
    typeof child === "string" ? buildChild(child) : buildChild(child.id, child.basePath),
  );
}

// Tipografia do catalog.css da web: corpo em --ink-1, legenda em --ink-2 e --text-sm, título na
// fonte de título com altura de linha 1.2 (h3 22 px, h4 18 px).
const HEADING_SIZE: Record<number, number> = { 2: 24, 3: 22, 4: 18, 5: 14, 6: 12 };

function bodyStyle(t: RefyContext, caption: boolean): TextStyle {
  const size = caption ? t.pick<number>("--text-sm", 14) : t.pick<number>("--text-base", 14);
  return {
    fontSize: size,
    lineHeight: Math.round(size * t.pick<number>("--leading-normal", 1.55)),
    color: t.pick<string>(caption ? "--ink-2" : "--ink-1"),
    ...t.font("--font-body", "--weight-regular"),
  };
}

export const RefyNativeText = nativeComponent(TextApi, ({ props }) => {
  const t = useRefy();
  const value = text(props.text);
  const heading = /^(#{1,5}) ([\s\S]*)$/.exec(value);
  if (heading) {
    const level = Math.min(heading[1].length + 1, 6);
    const size = HEADING_SIZE[level];
    return (
      <Text
        accessibilityRole="header"
        style={[{ fontSize: size, lineHeight: Math.round(size * 1.2), color: t.pick<string>("--ink-1"), ...t.font("--font-heading", "--weight-bold") }, weightStyle(props.weight)]}
      >
        {heading[2]}
      </Text>
    );
  }
  // Legenda vazia some, como `.ra-caption:empty` na web.
  if (props.variant === "caption" && !value) return null;
  return <Text style={[bodyStyle(t, props.variant === "caption"), weightStyle(props.weight)]}>{value}</Text>;
});

const IMAGE_FIT: Record<string, "cover" | "contain" | "stretch" | "center"> = {
  cover: "cover",
  contain: "contain",
  fill: "stretch",
  none: "center",
  scaleDown: "contain",
};

export const RefyNativeImage = nativeComponent(ImageApi, ({ props }) => {
  const t = useRefy();
  const variant = props.variant ?? "mediumFeature";
  const avatar = variant === "avatar";
  const url = text(props.url);
  // Como a web (`.ra-image`: largura cheia, altura da própria imagem), fora de header e avatar a
  // proporção é a da imagem, lida quando ela carrega. Antes da primeira, 4:3 para não colapsar; ao
  // trocar a URL, fica a da anterior até a nova carregar, sem pular.
  const [natural, setNatural] = useState<number | null>(null);
  const ratio = variant === "header" ? 16 / 9 : natural ?? 4 / 3;
  const shape: ImageStyle = avatar
    ? { width: 48, height: 48, borderRadius: 24 }
    : { width: "100%", aspectRatio: ratio, borderRadius: t.pick<number>("--radius-md", 8) };
  return (
    <Image
      source={{ uri: url }}
      onLoad={(event) => {
        const { width, height } = event.nativeEvent.source;
        if (width > 0 && height > 0) setNatural(width / height);
      }}
      accessibilityLabel={text(props.description)}
      accessible={Boolean(props.description)}
      resizeMode={IMAGE_FIT[props.fit ?? "cover"] ?? "cover"}
      style={[shape, weightStyle(props.weight) as ImageStyle]}
    />
  );
});

function flex(t: RefyContext, direction: "row" | "column", props: Props): ViewStyle {
  return {
    flexDirection: direction,
    flexWrap: direction === "row" ? "wrap" : "nowrap",
    gap: t.pick<number>(direction === "row" ? "--space-2" : "--space-3", direction === "row" ? 8 : 12),
    justifyContent: JUSTIFY[props.justify ?? "start"],
    alignItems: ALIGN[props.align ?? (direction === "row" ? "center" : "stretch")],
    ...weightStyle(props.weight),
  };
}

export const RefyNativeRow = nativeComponent(RowApi, ({ props, buildChild }) => {
  const t = useRefy();
  return <View style={flex(t, "row", props)}>{slots(props.children, buildChild)}</View>;
});

export const RefyNativeColumn = nativeComponent(ColumnApi, ({ props, buildChild }) => {
  const t = useRefy();
  return <View style={flex(t, "column", props)}>{slots(props.children, buildChild)}</View>;
});

export const RefyNativeList = nativeComponent(ListApi, ({ props, buildChild }) => {
  const t = useRefy();
  const direction = props.direction === "horizontal" ? "row" : "column";
  return (
    <View accessibilityRole="list" style={flex(t, direction, { ...props, align: props.align ?? (direction === "row" ? "center" : "stretch") })}>
      {slots(props.children, buildChild)}
    </View>
  );
});

export const RefyNativeCard = nativeComponent(CardApi, ({ props, buildChild }) => (
  <Card padding="md" style={weightStyle(props.weight)}>
    {buildChild(props.child)}
  </Card>
));

export const RefyNativeDivider = nativeComponent(DividerApi, ({ props }) => (
  <Divider orientation={props.axis === "vertical" ? "vertical" : "horizontal"} />
));

const BUTTON_VARIANT = { default: "secondary", primary: "primary", borderless: "ghost" } as const;

export const RefyNativeButton = nativeComponent(ButtonApi, ({ props, buildChild }) => {
  const label = useChildText(props.child);
  return (
    <Button
      variant={BUTTON_VARIANT[(props.variant ?? "default") as keyof typeof BUTTON_VARIANT]}
      disabled={props.isValid === false}
      onPress={() => props.action?.()}
      style={weightStyle(props.weight)}
    >
      {label ?? buildChild(props.child)}
    </Button>
  );
});

export const RefyNativeTextField = nativeComponent(TextFieldApi, ({ props }) => {
  const error = props.validationErrors?.length ? props.validationErrors.join(" ") : undefined;
  const common = {
    label: props.label === undefined ? undefined : text(props.label),
    value: text(props.value),
    placeholder: props.placeholder === undefined ? undefined : text(props.placeholder),
    error,
    block: true,
    onChangeText: (value: string) => props.setValue?.(value),
  };
  if (props.variant === "longText") return <Textarea {...common} />;
  return (
    <Input
      {...common}
      secureTextEntry={props.variant === "obscured"}
      keyboardType={props.variant === "number" ? "numeric" : "default"}
    />
  );
});

export const RefyNativeCheckBox = nativeComponent(CheckBoxApi, ({ props }) => (
  <Checkbox label={text(props.label)} checked={Boolean(props.value)} onCheckedChange={(checked) => props.setValue?.(checked)} />
));

export const RefyNativeChoicePicker = nativeComponent(ChoicePickerApi, ({ props }) => {
  const t = useRefy();
  const options = (props.options ?? []).map((option: Props) => ({ label: text(option.label), value: text(option.value) }));
  const selected: string[] = Array.isArray(props.value) ? props.value.map(String) : [];
  const multiple = props.variant === "multipleSelection";
  const label = text(props.label);
  if (props.displayStyle === "chips" || multiple) {
    // ChipGroup da web: rótulo de campo em cima, Chips em linha que quebra.
    const toggle = (value: string) => {
      if (multiple) props.setValue?.(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
      else props.setValue?.([value]);
    };
    return (
      <View accessibilityRole={multiple ? undefined : "radiogroup"} accessibilityLabel={label} style={{ gap: t.pick<number>("--field-label-gap", 6) }}>
        {label ? <Label>{label}</Label> : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: t.pick<number>("--space-2", 8) }}>
          {options.map((option: { label: string; value: string }) => (
            <Chip
              key={option.value}
              variant="filter"
              selectionMode={multiple ? "toggle" : "radio"}
              selected={selected.includes(option.value)}
              onPress={() => toggle(option.value)}
            >
              {option.label}
            </Chip>
          ))}
        </View>
      </View>
    );
  }
  return <RadioGroup label={label} options={options} value={selected[0] ?? ""} onChange={(value) => props.setValue?.([value])} />;
});

export const RefyNativeSlider = nativeComponent(SliderApi, ({ props }) => {
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

export const REFY_NATIVE_COMPONENTS = [
  RefyNativeText,
  RefyNativeImage,
  RefyNativeRow,
  RefyNativeColumn,
  RefyNativeList,
  RefyNativeCard,
  RefyNativeDivider,
  RefyNativeButton,
  RefyNativeTextField,
  RefyNativeCheckBox,
  RefyNativeChoicePicker,
  RefyNativeSlider,
];

/** O catálogo do refy desenhado com o @refy-design/mobile. Mesmo id e mesmas peças da web. */
const OPEN_URL_SCHEMES = ["https:", "http:", "mailto:", "tel:"];

/**
 * `openUrl` do básico v1 usa `window.open`, que o Hermes não tem: lá ele volta sem abrir nada.
 * Aqui abre pelo `Linking`, com os mesmos esquemas da web. Endereço inválido ou esquema fora da
 * lista lança `A2uiExpressionError`; se o sistema não abrir (ex.: `tel:` sem app de telefone), a
 * Promise rejeita e o web_core relata `EXPRESSION_ERROR` na superfície, como os outros erros.
 */
export function openUrlNative(url: unknown): Promise<void> {
  const target = typeof url === "string" ? url : "";
  const scheme = /^([a-z][a-z0-9+.-]*:)/i.exec(target)?.[1]?.toLowerCase();
  if (!scheme) throw new A2uiExpressionError(`Invalid URL specified: ${target}`, "openUrl");
  if (!OPEN_URL_SCHEMES.includes(scheme)) throw new A2uiExpressionError(`Unsupported URL scheme: ${scheme}`, "openUrl");
  return Linking.openURL(target).then(
    () => undefined,
    (error: unknown) => {
      throw new A2uiExpressionError(`Could not open URL ${target}: ${error instanceof Error ? error.message : String(error)}`, "openUrl");
    },
  );
}

const NATIVE_FUNCTIONS = BASIC_FUNCTIONS.map((fn) =>
  fn.name === "openUrl" ? createFunctionImplementation(fn, (args: { url?: unknown }) => openUrlNative(args.url)) : fn,
);

export const refyNativeCatalog = new Catalog<NativeCatalogComponent>(REFY_CATALOG_ID, "1.0", REFY_NATIVE_COMPONENTS, NATIVE_FUNCTIONS);

type ActionHandler = ConstructorParameters<typeof MessageProcessor>[1];

/**
 * Processador com o catálogo nativo. Peça fora do catálogo (ex.: `Video`) é recusada com
 * `A2uiValidationError` e nada entra na superfície, como na web.
 */
export function createRefyNativeProcessor(onAction?: ActionHandler, options: MessageProcessorOptions = {}) {
  return new MessageProcessor<NativeCatalogComponent>([refyNativeCatalog], onAction, { validationConfig: REFY_VALIDATION, ...options });
}

/** Erro que a superfície relata (ex.: `openUrl` com esquema recusado), como o web_core o emite. */
export type A2uiSurfaceError = Parameters<Parameters<SurfaceModel<NativeCatalogComponent>["onError"]["subscribe"]>[0]>[0];

const logSurfaceError = (error: A2uiSurfaceError) => console.error(`[refy-a2ui] ${error.code}: ${error.message}`);

/**
 * Desenha uma superfície A2UI com os componentes do refy. Ponha dentro do <RefyProvider> do app.
 * Erros da superfície (função de ação recusada, por exemplo) vão para `onError`; sem ele, saem no
 * `console.error`, que o LogBox mostra em desenvolvimento: nunca somem calados.
 */
export function A2uiNativeSurface({ surface, onError = logSurfaceError }: { surface: SurfaceModel<NativeCatalogComponent>; onError?: (error: A2uiSurfaceError) => void }) {
  const scope = useMemo(() => ({ surface }), [surface]);
  // As peças só montam depois da escuta: o GenericBinder resolve as expressões ao montar, e um
  // erro ali (ex.: `regex` inválido num check) é emitido uma vez só, sem fila. O efeito de layout
  // roda antes da tela pintar; no modo estrito ele desfaz e refaz, e sobra uma escuta só.
  const handler = useRef(onError);
  handler.current = onError;
  const [listening, setListening] = useState<Surface | null>(null);
  useLayoutEffect(() => {
    const subscription = surface.onError.subscribe((error) => handler.current(error));
    setListening(surface);
    return () => subscription.unsubscribe();
  }, [surface]);
  if (listening !== surface) return null;
  return (
    <SurfaceContext.Provider value={scope}>
      <NativeNode id={surface.rootId ?? "root"} />
    </SurfaceContext.Provider>
  );
}
