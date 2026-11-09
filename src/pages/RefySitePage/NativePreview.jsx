// Prévia real de @refy-design/mobile: a seção da galeria nativa do componente, desenhada pelo
// react-native-web. Arquivo .jsx para o tsc do site não percorrer os tipos do React Native.
import { RefyProvider } from "../../../packages/native/src";
import { Gallery } from "../../../packages/native/example/Gallery";

export default function NativePreview({ section, theme, mode }) {
  return (
    <RefyProvider theme={theme} mode={mode}>
      <Gallery only={section} showToasts={false} />
    </RefyProvider>
  );
}
