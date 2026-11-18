// O índice `@a2ui/web_core/catalogs/basic/v1` usa `document` ao carregar e quebra no Hermes; as
// APIs Zod das peças e as funções do básico v1 ficam em arquivos sem DOM que o mapa de exports do
// pacote não expõe. A ponte nativa os importa pelo caminho do arquivo, e os tipos vêm do índice.
declare module "@a2ui/web_core/src/catalogs/basic/v1/components/basic_components.js" {
  export {
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
}
declare module "@a2ui/web_core/src/catalogs/basic/v1/functions/basic_functions.js" {
  export { BASIC_FUNCTIONS } from "@a2ui/web_core/catalogs/basic/v1";
}
