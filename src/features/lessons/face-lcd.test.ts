import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { inflateRawSync } from "node:zlib";
import { faceLesson } from "../../content/lessons/face-lcd";
import { faceSketch } from "../../content/firmware/face-sketch";
import {
  facePreviewSchema,
  bitmapPath,
  nextFaceFrame,
  faceFrameDelay,
} from "./face-animation";
import { lessonSchema } from "./schema";
import { canComplete, sceneFor } from "./engine";
import { terminalPosition } from "../../lib/circuit/coordinates";
const root = "public/projetos/carinha-esp32/";
const preview = facePreviewSchema.parse(
  JSON.parse(fs.readFileSync(root + "preview.json", "utf8")),
);
describe("Projeto especial: carinhas ST7735", () => {
  it("valida dez etapas e revela alimentação, SPI e controle em sequência", () => {
    expect(lessonSchema.safeParse(faceLesson).success).toBe(true);
    expect(faceLesson.special).toBe(true);
    expect(faceLesson.steps).toHaveLength(10);
    expect(
      [0, 1, 2, 3].map((i) => sceneFor(faceLesson, i).connections.length),
    ).toEqual([0, 2, 4, 7]);
    expect(sceneFor(faceLesson, 1).connections.map((w) => w.id)).toEqual([
      "power",
      "ground",
    ]);
    expect(sceneFor(faceLesson, 0).connections).toEqual([]);
  });
  it("liga cada sinal ao terminal esperado, sem MISO ou backlight genérico", () => {
    const pins: Record<string, string> = {
      VCC: "3V3",
      GND: "GND",
      SCK: "GPIO18",
      MOSI: "GPIO23",
      CS: "GPIO5",
      RST: "GPIO4",
      DC: "GPIO2",
    };
    for (const [pin, gpio] of Object.entries(pins))
      expect(faceLesson.connections).toContainEqual(
        expect.objectContaining({
          from: `esp32.${gpio}`,
          to: `display.${pin}`,
        }),
      );
    for (const wire of faceLesson.connections) {
      expect(() =>
        terminalPosition(faceLesson.components, wire.from),
      ).not.toThrow();
      expect(() =>
        terminalPosition(faceLesson.components, wire.to),
      ).not.toThrow();
    }
    expect(faceLesson.connections.some((w) => /MISO|BL/.test(w.to))).toBe(
      false,
    );
    expect(terminalPosition(faceLesson.components, "display.GND")).toEqual({
      x: 455,
      y: 120,
    });
  });
  it("exige as três respostas e rejeita uma prévia sem display", () => {
    expect(canComplete(faceLesson, { "display-bus": 1, "frame-size": 0 })).toBe(
      false,
    );
    expect(
      canComplete(faceLesson, {
        "display-bus": 1,
        "frame-size": 0,
        "frame-time": 2,
      }),
    ).toBe(true);
    const invalid = structuredClone(faceLesson);
    invalid.steps[5].visible = ["esp32"];
    expect(lessonSchema.safeParse(invalid).success).toBe(false);
  });
  it("mantém o código exibido igual ao download e registra os ajustes", () => {
    expect(faceSketch).toBe(
      fs.readFileSync(root + "carinha_esp32.ino", "utf8"),
    );
    expect(faceLesson.steps[8].code).toBe(faceSketch);
    expect(faceSketch).toContain("SPI.begin(18, 19, 23, TFT_CS)");
    expect(faceSketch).toContain("tft.setSPISpeed(16000000)");
    expect(faceSketch).toContain("tft.initR(INITR_BLACKTAB)");
    expect(faceSketch.trimEnd().endsWith("}")).toBe(true);
    expect(faceSketch).not.toMatch(/\+{3,}/);
  });
  it("oferece downloads locais existentes e um ZIP extraível com os headers completos", () => {
    for (const file of faceLesson.downloads ?? [])
      expect(fs.existsSync("public" + file.href)).toBe(true);
    const zip = fs.readFileSync(root + "carinha-esp32.zip");
    let offset = 0;
    const names: string[] = [];
    while (zip.readUInt32LE(offset) === 0x04034b50) {
      const compressedSize = zip.readUInt32LE(offset + 18),
        size = zip.readUInt32LE(offset + 22),
        nameLength = zip.readUInt16LE(offset + 26),
        extraLength = zip.readUInt16LE(offset + 28);
      const name = zip
        .subarray(offset + 30, offset + 30 + nameLength)
        .toString();
      names.push(name);
      const start = offset + 30 + nameLength + extraLength;
      const data = inflateRawSync(zip.subarray(start, start + compressedSize));
      expect(data.length).toBe(size);
      expect(data.equals(fs.readFileSync(root + name.split("/")[1]))).toBe(
        true,
      );
      offset = start + compressedSize;
    }
    expect(names).toEqual(
      [
        "carinha_esp32.ino",
        "angry.h",
        "content.h",
        "laugh.h",
        "LEIA-ME.txt",
      ].map((n) => "carinha_esp32/" + n),
    );
    expect(zip.readUInt32LE(offset)).toBe(0x02014b50);
  });
});
describe("Prévia dos bitmaps originais", () => {
  it("conserva todos os 226 quadros e bytes dos três headers", () => {
    expect(preview.animations.map((a) => a.frames.length)).toEqual([
      76, 75, 75,
    ]);
    for (const a of preview.animations) {
      const source = fs.readFileSync(root + a.id + ".h", "utf8");
      const raw = source.match(
        /_frames\[[^\]]+\]\[1024\]\s*=\s*\{([\s\S]*?)\};/,
      )![1];
      const bytes = Buffer.from(
        raw.match(/0x[0-9a-f]{2}/gi)!.map((n) => parseInt(n, 16)),
      );
      expect(
        Buffer.concat(a.frames.map((f) => Buffer.from(f, "base64"))).equals(
          bytes,
        ),
      ).toBe(true);
      expect(a.delays.every((d) => d === 100)).toBe(true);
    }
  });
  it("decodifica bits da esquerda para a direita e linhas com padding", () => {
    expect(bitmapPath(Buffer.from([0x81, 0x80]).toString("base64"), 9, 1)).toBe(
      "M0 0h1v1h-1zM7 0h2v1h-2z",
    );
    expect(bitmapPath(Buffer.from([0x80, 0x01]).toString("base64"), 8, 2)).toBe(
      "M0 0h1v1h-1zM7 1h1v1h-1z",
    );
    expect(() => bitmapPath("AA==")).toThrow("Tamanho de bitmap inválido");
  });
  it("avança na ordem do sketch e retorna à primeira expressão", () => {
    expect(nextFaceFrame(preview, { animation: 0, frame: 0 })).toEqual({
      animation: 0,
      frame: 1,
    });
    expect(nextFaceFrame(preview, { animation: 0, frame: 75 })).toEqual({
      animation: 1,
      frame: 0,
    });
    expect(nextFaceFrame(preview, { animation: 1, frame: 74 })).toEqual({
      animation: 2,
      frame: 0,
    });
    expect(nextFaceFrame(preview, { animation: 2, frame: 74 })).toEqual({
      animation: 0,
      frame: 0,
    });
  });
  it("mantém o último quadro durante cada pausa e soma um ciclo de 24,6 s", () => {
    expect(faceFrameDelay(preview, { animation: 0, frame: 0 })).toBe(100);
    expect(faceFrameDelay(preview, { animation: 0, frame: 75 })).toBe(600);
    expect(faceFrameDelay(preview, { animation: 1, frame: 74 })).toBe(600);
    expect(faceFrameDelay(preview, { animation: 2, frame: 74 })).toBe(1100);
    expect(
      preview.animations.reduce(
        (sum, a) => sum + a.delays.reduce((s, d) => s + d, 0) + a.pauseAfter,
        0,
      ),
    ).toBe(24600);
  });
  it("rejeita quadros truncados e quantidades de tempos incompatíveis", () => {
    const invalid = structuredClone(preview);
    invalid.animations[0].frames[0] = "AA==";
    expect(facePreviewSchema.safeParse(invalid).success).toBe(false);
    const badDelays = structuredClone(preview);
    badDelays.animations[0].delays.pop();
    expect(facePreviewSchema.safeParse(badDelays).success).toBe(false);
    const badPadding = structuredClone(preview);
    badPadding.animations[0].frames[0] =
      badPadding.animations[0].frames[0].slice(0, -2) + "AA";
    expect(facePreviewSchema.safeParse(badPadding).success).toBe(false);
  });
});
