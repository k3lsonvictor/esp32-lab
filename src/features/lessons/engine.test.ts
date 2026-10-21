import { describe, it, expect } from "vitest";
import { blinkLesson as lesson } from "../../content/lessons/blink-led";
import { lessonSchema } from "./schema";
import { canComplete, clampStep, sceneFor } from "./engine";
import { breadboardNet } from "../../lib/circuit/pin-registry";
import { terminalPosition } from "../../lib/circuit/coordinates";
describe("Motor de lições", () => {
  it("valida as oito etapas e limita a navegação", () => {
    expect(lessonSchema.safeParse(lesson).success).toBe(true);
    expect(lesson.steps).toHaveLength(8);
    expect(clampStep(lesson, -1)).toBe(0);
    expect(clampStep(lesson, 8)).toBe(7);
    expect(clampStep(lesson, NaN)).toBe(0);
  });
  it("reconstitui o estado ao avançar e retornar", () => {
    expect(sceneFor(lesson, 0).parts.map((p) => p.id)).toEqual(["esp32"]);
    expect(sceneFor(lesson, 4).connections.map((w) => w.id)).toEqual([
      "signal",
    ]);
    expect(sceneFor(lesson, 5).connections).toHaveLength(2);
    expect(sceneFor(lesson, 3).connections).toHaveLength(0);
  });
  it("exige ambas as respostas corretas", () => {
    expect(canComplete(lesson, {})).toBe(false);
    expect(canComplete(lesson, { resistor: 1, polarity: 2 })).toBe(false);
    expect(canComplete(lesson, { resistor: 1, polarity: 0 })).toBe(true);
  });
  it("rejeita conexões inexistentes e fios invisíveis", () => {
    const invalid = structuredClone(lesson);
    invalid.connections[0].to = "esp32.GPIO99";
    expect(lessonSchema.safeParse(invalid).success).toBe(false);
    const hidden = structuredClone(lesson);
    hidden.steps[0].wires = ["signal"];
    expect(lessonSchema.safeParse(hidden).success).toBe(false);
  });
  it("rejeita IDs, destaques e respostas inconsistentes", () => {
    const invalid = structuredClone(lesson);
    invalid.components[1].id = "esp32";
    invalid.steps[0].pins = ["esp32.inexistente"];
    invalid.steps[7].questions![0].correct = 99;
    expect(lessonSchema.safeParse(invalid).success).toBe(false);
  });
});
describe("Montagem na protoboard", () => {
  it("usa coordenadas globais obtidas dos terminais", () => {
    expect(terminalPosition(lesson.components, "esp32.GPIO23")).toEqual({
      x: 270,
      y: 135,
    });
    for (const [partPin, hole] of [
      ["resistor.pin1", "breadboard.c3"],
      ["resistor.pin2", "breadboard.c8"],
      ["led.anode", "breadboard.e8"],
      ["led.cathode", "breadboard.e10"],
    ])
      expect(terminalPosition(lesson.components, partPin)).toEqual(
        terminalPosition(lesson.components, hole),
      );
  });
  it("conecta sinal, resistor, ânodo, cátodo e terra em redes separadas", () => {
    expect(breadboardNet("a3")).toBe(breadboardNet("c3"));
    expect(breadboardNet("c8")).toBe(breadboardNet("e8"));
    expect(breadboardNet("e10")).toBe(breadboardNet("a10"));
    expect(breadboardNet("e8")).not.toBe(breadboardNet("e10"));
    expect(breadboardNet("e8")).not.toBe(breadboardNet("f8"));
    expect(breadboardNet("c3")).not.toBe(breadboardNet("c8"));
  });
});
