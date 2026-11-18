// Agente simulado (sem IA) da superfície "visita": as mesmas mensagens A2UI 1.0 para a demo web e
// para o app nativo (native-proof). Só a URL da foto muda, porque cada app serve a imagem do seu jeito.
import { REFY_CATALOG_ID } from "../src/ids";

export type Message = Record<string, unknown>;
export const v = (body: Message): Message => ({ version: "1.0", ...body });

export interface Reply {
  messages: Message[];
  bubble?: string;
}

export function visitaAgent(photoUrl: string) {
  const SURFACE = "visita";
  const FORM = ["foto", "titulo", "endereco", "vendo", "div1", "dias", "horas", "nome", "lembrete", "erro", "acoes"];
  const DONE = ["foto", "titulo", "endereco", "div1", "ok", "detalhe", "acoes"];

  const label = (id: string, text: string) => ({ id, component: "Text", text });
  const button = (id: string, variant: string, child: string, event: Message) => ({
    id,
    component: "Button",
    variant,
    child,
    action: { event },
  });

  const formActions = [
    { id: "acoes", component: "Row", justify: "end", children: ["depois", "agendar"] },
    button("depois", "borderless", "depois_t", { name: "depois" }),
    label("depois_t", "Agora não"),
    button("agendar", "primary", "agendar_t", {
      name: "agendar_visita",
      context: {
        dia: { "@path": "/dia" },
        hora: { "@path": "/hora" },
        nome: { "@path": "/nome" },
        lembrete: { "@path": "/lembrete" },
      },
    }),
    label("agendar_t", "Agendar visita"),
  ];

  const formColumn = { id: "col", component: "Column", children: FORM };

  const components = [
    { id: "root", component: "Card", child: "col" },
    formColumn,
    { id: "foto", component: "Image", url: photoUrl, description: "Prédio com varandas e plantas", variant: "header", fit: "cover" },
    label("titulo", "## Apartamento na Rua Augusta"),
    { id: "endereco", component: "Text", variant: "caption", text: "2 quartos · 68 m² · Consolação, São Paulo" },
    { id: "vendo", component: "Text", variant: "caption", text: { "@path": "/vendo" } },
    { id: "div1", component: "Divider" },
    {
      id: "dias",
      component: "ChoicePicker",
      label: "Dia",
      displayStyle: "chips",
      variant: "mutuallyExclusive",
      options: [
        { label: "Qui 13", value: "quinta, 13/11" },
        { label: "Sex 14", value: "sexta, 14/11" },
        { label: "Sáb 15", value: "sábado, 15/11" },
      ],
      value: { "@path": "/dia" },
    },
    {
      id: "horas",
      component: "ChoicePicker",
      label: "Horário",
      displayStyle: "chips",
      variant: "mutuallyExclusive",
      options: [
        { label: "10h", value: "10h" },
        { label: "14h", value: "14h" },
        { label: "17h30", value: "17h30" },
      ],
      value: { "@path": "/hora" },
    },
    { id: "nome", component: "TextField", label: "Seu nome", placeholder: "Como o corretor te chama", value: { "@path": "/nome" } },
    { id: "lembrete", component: "CheckBox", label: "Me avise 1 hora antes", value: { "@path": "/lembrete" } },
    { id: "erro", component: "Text", variant: "caption", text: { "@path": "/erro" } },
    ...formActions,
  ];

  const createSurface = () =>
    v({
      createSurface: {
        surfaceId: SURFACE,
        catalogId: REFY_CATALOG_ID,
        dataModel: {
          dia: [],
          hora: [],
          nome: "",
          lembrete: true,
          erro: "",
          vendo: "2 pessoas estão vendo este imóvel agora",
        },
        components,
      },
    });

  const watching = (n: number) =>
    v({ updateDataModel: { surfaceId: SURFACE, path: "/vendo", value: `${n} pessoas estão vendo este imóvel agora` } });

  /** O que o agente responde a cada ação. */
  function reply(name: string, context: Record<string, unknown>): Reply {
    if (name === "agendar_visita") {
      const first = (value: unknown) => (Array.isArray(value) ? String(value[0] ?? "") : "");
      const dia = first(context.dia);
      const hora = first(context.hora);
      const nome = String(context.nome ?? "").trim();
      if (!dia || !hora || !nome) {
        return {
          messages: [
            v({ updateDataModel: { surfaceId: SURFACE, path: "/erro", value: "Falta escolher o dia, o horário ou dizer seu nome." } }),
          ],
        };
      }
      const aviso = context.lembrete ? "Te aviso 1 hora antes." : "Sem lembrete.";
      return {
        messages: [
          v({
            updateComponents: {
              surfaceId: SURFACE,
              components: [
                { id: "col", component: "Column", children: DONE },
                label("ok", "### Visita marcada"),
                label("detalhe", `${nome}, sua visita é ${dia}, às ${hora}. ${aviso}`),
                { id: "acoes", component: "Row", justify: "end", children: ["remarcar"] },
                button("remarcar", "default", "remarcar_t", { name: "remarcar" }),
                label("remarcar_t", "Remarcar"),
              ],
            },
          }),
        ],
        bubble: `Pronto, ${nome}. Mandei o convite pro corretor.`,
      };
    }
    if (name === "remarcar") {
      return {
        messages: [
          v({ updateComponents: { surfaceId: SURFACE, components: [formColumn, ...formActions] } }),
          v({ updateDataModel: { surfaceId: SURFACE, path: "/erro", value: "" } }),
        ],
      };
    }
    if (name === "depois") return { messages: [], bubble: "Tudo bem. Quando quiser, é só pedir de novo." };
    return { messages: [] };
  }
  return { components, createSurface, watching, reply };
}
