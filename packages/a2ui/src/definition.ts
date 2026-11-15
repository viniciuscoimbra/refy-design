import { Catalog, MessageProcessor, STRICT_VALIDATION } from "@a2ui/web_core";
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

/**
 * O catálogo do refy sem React e sem DOM: id, as 12 peças e a validação.
 * Serve para o servidor do app conferir a resposta do agente antes de ela chegar ao navegador,
 * com as mesmas regras do renderizador. Importar `@refy-design/a2ui` no servidor puxa o
 * renderizador (Lit) e quebra com `HTMLElement is not defined`.
 */

/** Id próprio: o refy não responde pelo id do catálogo básico enquanto não cobrir as 18 peças. */
export const REFY_CATALOG_ID = "https://refy.design/a2ui/v1";

/** As peças do catálogo, na ordem do renderizador. */
export const REFY_COMPONENT_APIS = [
  TextApi,
  ImageApi,
  RowApi,
  ColumnApi,
  ListApi,
  CardApi,
  DividerApi,
  ButtonApi,
  TextFieldApi,
  CheckBoxApi,
  ChoicePickerApi,
  SliderApi,
] as const;

/**
 * Validação estrita do web_core, menos a regra de órfãos: o agente troca o layout com
 * `updateComponents` e as peças que saem da árvore ficam guardadas (o A2UI 1.0 não apaga peça).
 */
export const REFY_VALIDATION = Object.freeze({ ...STRICT_VALIDATION, allowOrphanComponents: true });

/** Definição do catálogo sem implementação visual, para validar mensagens fora do navegador. */
export const refyCatalogDefinition = new Catalog(REFY_CATALOG_ID, "1.0", [...REFY_COMPONENT_APIS], BASIC_FUNCTIONS);

type ActionHandler = ConstructorParameters<typeof MessageProcessor>[1];

/**
 * Processador que só valida e guarda estado, com as regras do renderizador do refy. Peça fora
 * do catálogo (ex.: `Video`) ou tema vindo do agente é recusado com `A2uiValidationError`.
 */
export function createRefyValidator(onAction?: ActionHandler, options: MessageProcessorOptions = {}) {
  return new MessageProcessor([refyCatalogDefinition], onAction, { validationConfig: REFY_VALIDATION, ...options });
}
