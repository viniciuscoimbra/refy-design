// Contrato de props do ScrollArea: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.

export interface ScrollAreaCoreProps {
  maxHeight?: number | string;
}
