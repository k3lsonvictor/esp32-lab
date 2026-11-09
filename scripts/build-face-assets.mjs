import fs from "node:fs";
import path from "node:path";
import { deflateRawSync } from "node:zlib";

const root = path.resolve("public/projetos/carinha-esp32");
const definitions = [
  ["content", "Contente", 500],
  ["laugh", "Rindo", 500],
  ["angry", "Bravo", 1000],
];
const animations = definitions.map(([id, label, pauseAfter]) => {
  const source = fs.readFileSync(path.join(root, `${id}.h`), "utf8");
  const prefix = id.toUpperCase();
  const define = (key) =>
    Number(
      source.match(new RegExp(`#define\\s+${prefix}_${key}\\s+(\\d+)`))?.[1],
    );
  const width = define("WIDTH"),
    height = define("HEIGHT"),
    frameCount = define("FRAME_COUNT");
  const raw = source.match(
    new RegExp(
      `${id}_frames\\[[^\\]]+\\]\\[1024\\]\\s*=\\s*\\{([\\s\\S]*?)\\};`,
    ),
  )?.[1];
  const bytes = Buffer.from(
    (raw?.match(/0x[0-9a-f]{2}/gi) ?? []).map((v) => parseInt(v, 16)),
  );
  const delays = (
    source
      .match(new RegExp(`${id}_delays\\[[^\\]]+\\]\\s*=\\s*\\{([^}]+)\\}`))?.[1]
      .match(/\d+/g) ?? []
  ).map(Number);
  const stride = Math.ceil(width / 8) * height;
  if (
    width !== 128 ||
    height !== 64 ||
    stride !== 1024 ||
    bytes.length !== frameCount * stride ||
    delays.length !== frameCount ||
    delays.some((d) => d <= 0)
  )
    throw new Error(`Dados de animação inválidos: ${id}`);
  return {
    id,
    label,
    width,
    height,
    pauseAfter,
    delays,
    frames: Array.from({ length: frameCount }, (_, i) =>
      bytes.subarray(i * stride, (i + 1) * stride).toString("base64"),
    ),
  };
});
fs.writeFileSync(
  path.join(root, "preview.json"),
  JSON.stringify({ animations }),
);
const sketch = fs.readFileSync(path.join(root, "carinha_esp32.ino"), "utf8");
fs.mkdirSync("src/content/firmware", { recursive: true });
fs.writeFileSync(
  "src/content/firmware/face-sketch.ts",
  `// Gerado por npm run assets:face a partir do sketch para download.\nexport const faceSketch = ${JSON.stringify(sketch)};\n`,
);

// ZIP sem dependências extras, com CRC-32 e compressão DEFLATE.
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
const local = [],
  central = [];
let offset = 0;
for (const filename of [
  "carinha_esp32.ino",
  "angry.h",
  "content.h",
  "laugh.h",
  "LEIA-ME.txt",
]) {
  const name = Buffer.from(`carinha_esp32/${filename}`);
  const data = fs.readFileSync(path.join(root, filename));
  const compressed = deflateRawSync(data);
  const crc = crc32(data);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(8, 8);
  header.writeUInt16LE(33, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(compressed.length, 18);
  header.writeUInt32LE(data.length, 22);
  header.writeUInt16LE(name.length, 26);
  const entry = Buffer.alloc(46);
  entry.writeUInt32LE(0x02014b50);
  entry.writeUInt16LE(20, 4);
  entry.writeUInt16LE(20, 6);
  entry.writeUInt16LE(8, 10);
  entry.writeUInt16LE(33, 14);
  entry.writeUInt32LE(crc, 16);
  entry.writeUInt32LE(compressed.length, 20);
  entry.writeUInt32LE(data.length, 24);
  entry.writeUInt16LE(name.length, 28);
  entry.writeUInt32LE(offset, 42);
  local.push(header, name, compressed);
  central.push(entry, name);
  offset += header.length + name.length + compressed.length;
}
const directory = Buffer.concat(central),
  end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50);
end.writeUInt16LE(5, 8);
end.writeUInt16LE(5, 10);
end.writeUInt32LE(directory.length, 12);
end.writeUInt32LE(offset, 16);
fs.writeFileSync(
  path.join(root, "carinha-esp32.zip"),
  Buffer.concat([...local, directory, end]),
);
console.log(
  `Preparadas ${animations.length} animações (${animations.reduce((n, a) => n + a.frames.length, 0)} quadros), sketch e ZIP.`,
);
