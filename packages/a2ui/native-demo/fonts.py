# Gera em fonts/ os TTF estáticos que o app registra com o expo-font, a partir dos woff2 do site
# (src/assets/fonts): o iOS não carrega woff2 nem escolhe peso de fonte variável pelo fontWeight.
# Uso: python3 -m venv .venv && .venv/bin/pip install fonttools brotli && .venv/bin/python fonts.py
import os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, "../../../src/assets/fonts")
out = os.path.join(here, "fonts")
os.makedirs(out, exist_ok=True)

def save(font, name):
    table = font["name"]
    for rec in list(table.names):
        if rec.nameID in (1, 2, 3, 4, 6, 16, 17, 21, 22):
            table.removeNames(nameID=rec.nameID)
    for name_id, value in ((1, name), (2, "Regular"), (3, name), (4, name), (6, name)):
        table.setName(value, name_id, 3, 1, 0x409)
    font.flavor = None
    font.save(os.path.join(out, f"{name}.ttf"))

# Refy: Manrope + Source Sans 3 + Source Code Pro. Terracota: IBM Plex Serif + IBM Plex Sans + IBM Plex Mono.
for file, family in (("manrope-latin-0", "Manrope"), ("sourcesans3-latin-0", "SourceSans3"), ("ibmplexsans-latin-0", "IBMPlexSans"), ("sourcecodepro-latin-0", "SourceCodePro")):
    for weight in (400, 500, 600, 700, 800):
        font = TTFont(os.path.join(src, f"{file}.woff2"))
        axis = font["fvar"].axes[0]
        if axis.minValue <= weight <= axis.maxValue:
            save(instantiateVariableFont(font, {"wght": weight}, updateFontNames=False), f"{family}-{weight}")
for weight in (400, 600, 700):
    save(TTFont(os.path.join(src, f"ibmplexserif-latin-{weight}.woff2")), f"IBMPlexSerif-{weight}")
for index, weight in enumerate((400, 500, 600, 700)):
    save(TTFont(os.path.join(src, f"ibmplexmono-latin-{index}.woff2")), f"IBMPlexMono-{weight}")
print("\n".join(sorted(os.listdir(out))))
