import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Select, Segmented, Callout } from "../index";
import styles from "./VisualSystem.module.css";

const cases = [
  {
    id: "dashboard",
    label: "Painel de projetos",
    story: "páginas-dashboard--visao-geral",
    why: "A navegação passa para um drawer no celular; cabeçalho, indicadores e linhas se reorganizam. Criar, buscar e exportar projetos agora exercita os componentes com estado local.",
  },
  {
    id: "buttons",
    label: "Botões",
    story: "components-atoms-button--todas-variantes",
    why: "As fontes originais voltam a ser carregadas. Os valores padrão são preservados; os novos tokens permitem personalizar superfície, borda, raio, hover e pressionamento.",
  },
  {
    id: "content-card",
    label: "Card de conteúdo",
    story: "components-organisms-propertycard--grid",
    why: "Conteúdo imobiliário dá lugar a uma coleção de documentos. ContentCard é o nome genérico; PropertyCard e suas props anteriores continuam compatíveis.",
  },
  {
    id: "decision-deck",
    label: "Fila de revisão",
    story: "components-organisms-swipedeck--gesto",
    why: "Ações e textos deixam de significar visita a imóvel. DecisionDeck usa descartar, salvar e selecionar, com botões, teclado e gesto. O produto define a consequência de cada decisão.",
  },
  {
    id: "themes",
    label: "Personalização",
    story: "fundamentos-refy--personalizar",
    why: "O laboratório de isolamento sai da apresentação principal e continua em Verificação. A nova demonstração mostra a mesma composição com Refy, Contorno e Degradê. Aqui comparamos duas apresentações diferentes, identificadas abaixo.",
  },
];
const changes = [
  [
    "Fontes",
    "Famílias declaradas sem carregamento no catálogo.",
    "Inter, Space Grotesk e JetBrains Mono locais, com licenças; fonte de cada papel novamente aplicada.",
  ],
  [
    "Apresentação",
    "Laboratório sintético e referências de negócios misturados ao catálogo.",
    "Fundamentos, componentes por Atomic Design, exemplos de páginas, revisão e laboratório técnico separados. URLs antigas preservadas.",
  ],
  [
    "Responsividade",
    "Larguras fixas e tamanho mínimo do conteúdo empurravam a página.",
    "Exemplos limitados ao espaço disponível; tabela rola internamente; calendário, legendas e ações se reorganizam.",
  ],
  [
    "Geometria e superfície",
    "Personalizar a cor não alterava de maneira consistente bordas, formato e estados.",
    "Tokens comuns para controles, campos, cards e diálogos; tokens específicos para as superfícies e estados de Button.",
  ],
  [
    "Imagens",
    "Imagens locais ou em cache podiam continuar encobertas pelo carregamento.",
    "A galeria associa o resultado à imagem atual e preserva o carregamento já concluído, inclusive ao voltar para uma imagem anterior.",
  ],
  [
    "Estados e contraste",
    "Acordeão e código tinham superfícies incoerentes no escuro; sucesso herdava a cor da marca; alguns textos perdiam contraste.",
    "Superfícies e papéis de texto corrigidos. Sucesso mantém seu verde original, independente da marca. Hover e pressionamento preservam o feedback.",
  ],
  [
    "Seleção múltipla",
    "O campo já abria deslocado, cortando o primeiro item selecionado.",
    "Começa pelo primeiro item; ao adicionar uma seleção, desloca a lista para mostrar a alteração. Remoção por teclado preservada.",
  ],
  [
    "Vocabulário",
    "PropertyCard, PropertyMedia, PropertyActionGroup, SwipeDeck e VisitSchedulePicker.",
    "ContentCard, MediaGallery, DecisionActions, DecisionDeck e SchedulePicker. Aliases anteriores preservados, sem duplicar implementações.",
  ],
  [
    "Páginas",
    "Controles de demonstração sem retorno e painel com cortes.",
    "Painel com criação, busca e exportação; perfil com validação, preferências e troca de aparência. Dados locais de exemplo.",
  ],
];
function Review() {
  const [selected, setSelected] = useState("dashboard");
  const [width, setWidth] = useState("375");
  const current = cases.find((item) => item.id === selected)!;
  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>Revisão visual · 22/10/2026</p>
      <h1 className={styles.title}>O que mudou, lado a lado</h1>
      <p className={styles.lead}>
        A referência de identidade é o Refy original, commit c3f03fd. O “antes”
        abaixo registra o estado imediatamente anterior à correção, commit
        6e3e3c1.
      </p>
      <div className={styles.row} style={{ margin: "28px 0" }}>
        <Select
          label="Comparação"
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
        >
          {cases.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </Select>
        <Segmented
          label="Largura da captura"
          value={width}
          onChange={setWidth}
          options={[
            { value: "375", label: "Celular · 375px" },
            { value: "1280", label: "Desktop · 1280px" },
          ]}
        />
      </div>
      <p>{current.why}</p>
      <div className={styles.compare}>
        <figure>
          <figcaption>
            Antes ·{" "}
            {selected === "themes"
              ? "laboratório de isolamento"
              : current.label}{" "}
            · {width}px · claro
          </figcaption>
          <a
            href={`./review/before/${selected}-${width}.png`}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={`./review/before/${selected}-${width}.png`}
              alt={`Antes: ${current.label}, captura integral em ${width} pixels`}
            />
          </a>
        </figure>
        <figure>
          <figcaption>
            Depois ·{" "}
            {selected === "themes"
              ? "demonstração de personalização"
              : current.label}{" "}
            · {width}px · claro
          </figcaption>
          <a
            href={`./review/after/${selected}-${width}.png`}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={`./review/after/${selected}-${width}.png`}
              alt={`Depois: ${current.label}, captura integral em ${width} pixels`}
            />
          </a>
        </figure>
      </div>
      <nav className={styles.links}>
        <a href={`./?path=/story/${current.story}`} target="_top">
          Abrir o exemplo funcionando
        </a>
        <a href="./?path=/story/fundamentos-tokens--explorar" target="_top">
          Consultar os tokens
        </a>
        <a href="./?path=/story/exemplos-configuracoes--perfil" target="_top">
          Testar configurações
        </a>
        <a href="./review/skins.png" target="_blank" rel="noreferrer">
          Ver as aparências nos três modos
        </a>
      </nav>
      <section className={styles.section} style={{ marginTop: 32 }}>
        <h2>De–para da revisão</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Área</th>
                <th>Antes</th>
                <th>Correção e motivo</th>
              </tr>
            </thead>
            <tbody>
              {changes.map(([area, before, after]) => (
                <tr key={area}>
                  <th scope="row">{area}</th>
                  <td>{before}</td>
                  <td>{after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className={styles.section}>
        <h2>Escopo e validação restante</h2>
        <p>
          O inventário cobre as 92 famílias: carregamento das stories, larguras
          de 375 e 1280 pixels e amostras visuais por família nos modos claro,
          escuro e editorial. A revisão de capturas foi feita pelo agente; os
          testes de interação têm escopo próprio. Isso não certifica
          automaticamente todos os estados de todos os componentes.
        </p>
        <Callout tone="info" title="Validação ainda aberta">
          Aprovação visual do mantenedor, integrações nos produtos existentes e
          roteiro manual de leitor de tela. O roteiro assistivo foi adiado por
          decisão do mantenedor. Mapas, autenticação externa e gravação com
          hardware exigem validação no ambiente consumidor.
        </Callout>
        <p className={styles.caption}>
          As imagens são capturas reais em Chromium, com movimento reduzido,
          altura inicial de 900px e página completa. Abra a imagem para
          inspecionar sem a redução desta comparação. Cada modo continua
          disponível nos exemplos vivos.
        </p>
      </section>
    </main>
  );
}
const meta = {
  id: "revisao-visual",
  title: "Revisão/Visual",
  parameters: { refyFullPage: true },
} satisfies Meta;
export default meta;
export const AntesEDepois: StoryObj = {
  name: "Antes e depois",
  render: () => <Review />,
};
