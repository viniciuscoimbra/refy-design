# Prova nativa do @refy-design/a2ui

App Expo (SDK 54, Expo Go) que desenha o mesmo agente da demo web (`../demo/visita.ts`) pela ponte
React Native (`../src/native.tsx`) sobre o `@refy-design/mobile`. Não é publicado.

```bash
npm install
python3 -m venv .venv && .venv/bin/pip install fonttools brotli && .venv/bin/python fonts.py
npx expo start --port 8090
# uma foto por tema, modo e estado: {refy,terracota}-{claro,escuro}-{form,preenchido,marcada}.png
for t in refy terracota; do for m in claro escuro; do for e in form preenchido marcada; do
  ./sim-open.sh "tema=$t&modo=$m&estado=$e" ../proof/out/nativo/$t-$m-$e.png
done; done; done
node ../proof/lado-a-lado.mjs   # web em 390 px e iPhone, lado a lado: 12 pares
```

O tema e o modo são do app: vêm do link que abre o app (`tema=refy` ou `tema=terracota`,
`modo=claro` ou `modo=escuro`), nunca de um seletor na tela. `estado` posiciona a prova, sempre com
a superfície já montada: `form`, `preenchido`, `marcada` (dispara a ação de "Agendar visita"),
`rotulo` (o agente troca o texto do botão), `erro-inicial` (check com regex inválido), `abrir`,
`abrir-invalido` e `abrir-tel` (função `openUrl`).
