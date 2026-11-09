// Compara duas capturas PNG do mesmo tamanho (original e tela feita com o Refy) e diz onde elas
// diferem. Sem dependência: decodifica e codifica PNG de 8 bits por canal (RGB ou RGBA, sem
// entrelaçamento), que é o que Playwright, Chrome e o macOS gravam.
import { deflateSync, inflateSync } from "node:zlib";

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function decodePng(buffer) {
  if (!buffer.subarray(0, 8).equals(SIGNATURE)) throw Error("Arquivo não é PNG.");
  let offset = 8, width, height, colorType, depth, interlace;
  const data = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset), type = buffer.toString("latin1", offset + 4, offset + 8);
    const chunk = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") ({ width, height, depth, colorType, interlace } = { width: chunk.readUInt32BE(0), height: chunk.readUInt32BE(4), depth: chunk[8], colorType: chunk[9], interlace: chunk[12] });
    else if (type === "IDAT") data.push(chunk);
    else if (type === "IEND") break;
    offset += 12 + length;
  }
  // Limite de 40 milhões de pixels: um cabeçalho falso de 30000×30000 pediria 3,6 GB de memória.
  if (!(width > 0 && height > 0) || width * height > 40_000_000) throw Error(`PNG grande demais (${width}×${height}): o limite é 40 milhões de pixels.`);
  if (depth !== 8 || interlace !== 0 || ![2, 6].includes(colorType)) throw Error("PNG fora do formato lido aqui: use 8 bits por canal, RGB ou RGBA, sem entrelaçamento.");
  const channels = colorType === 6 ? 4 : 3, stride = width * channels;
  const raw = inflateSync(Buffer.concat(data), { maxOutputLength: height * (stride + 1) });
  const pixels = Buffer.alloc(width * height * 4);
  let previous = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? line[x - channels] : 0, b = previous[x], c = x >= channels ? previous[x - channels] : 0;
      let add = 0;
      if (filter === 1) add = a;
      else if (filter === 2) add = b;
      else if (filter === 3) add = (a + b) >> 1;
      else if (filter === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); add = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      line[x] = (line[x] + add) & 255;
    }
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      pixels[i] = line[x * channels]; pixels[i + 1] = line[x * channels + 1]; pixels[i + 2] = line[x * channels + 2];
      pixels[i + 3] = channels === 4 ? line[x * channels + 3] : 255;
    }
    previous = line;
  }
  return { width, height, pixels };
}

const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = (buf) => { let c = -1; for (const byte of buf) c = CRC[(c ^ byte) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function chunk(type, data) {
  const head = Buffer.alloc(8); head.writeUInt32BE(data.length, 0); head.write(type, 4, "latin1");
  const tail = Buffer.alloc(4); tail.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, tail]);
}
export function encodePng({ width, height, pixels }) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) pixels.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  return Buffer.concat([SIGNATURE, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

// Diferença por pixel: canal que muda mais que `threshold` (0 a 255) conta. A tela é dividida em
// uma grade; as células mais diferentes voltam em ordem, com posição em pixels, para o agente
// saber onde mexer. A imagem de diferença pinta de vermelho o que mudou sobre o original apagado.
export function comparePng(a, b, { threshold = 24, grid = 12 } = {}) {
  if (a.width !== b.width || a.height !== b.height) throw Error(`Tamanhos diferentes: ${a.width}×${a.height} e ${b.width}×${b.height}. Capture as duas telas na mesma largura, altura e escala.`);
  const { width, height } = a, cellW = Math.ceil(width / grid), cellH = Math.ceil(height / grid);
  const cells = Array.from({ length: grid * grid }, () => 0);
  const diff = Buffer.alloc(width * height * 4);
  let changed = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const delta = Math.max(Math.abs(a.pixels[i] - b.pixels[i]), Math.abs(a.pixels[i + 1] - b.pixels[i + 1]), Math.abs(a.pixels[i + 2] - b.pixels[i + 2]));
      const grey = Math.round(0.3 * a.pixels[i] + 0.59 * a.pixels[i + 1] + 0.11 * a.pixels[i + 2]);
      if (delta > threshold) {
        changed++;
        cells[Math.floor(y / cellH) * grid + Math.floor(x / cellW)]++;
        diff[i] = 230; diff[i + 1] = 30; diff[i + 2] = 50;
      } else { const v = 255 - Math.round((255 - grey) * 0.25); diff[i] = diff[i + 1] = diff[i + 2] = v; }
      diff[i + 3] = 255;
    }
  const regions = cells
    .map((count, index) => ({ x: (index % grid) * cellW, y: Math.floor(index / grid) * cellH, width: cellW, height: cellH, different: Math.round((count / (cellW * cellH)) * 1000) / 10 }))
    .filter((r) => r.different > 0.5)
    .sort((p, q) => q.different - p.different)
    .slice(0, 12);
  return { width, height, differentPixels: changed, differentPercent: Math.round((changed / (width * height)) * 10000) / 100, regions, diff: { width, height, pixels: diff } };
}
