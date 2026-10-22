import { describe, it, expect } from "vitest";
import { buttonLesson as lesson } from "../../content/lessons/button-led";
import { lessons } from "../../content/lessons";
import { lessonSchema } from "./schema";
import { canComplete, sceneFor, clampStep } from "./engine";
import { breadboardNet, terminals } from "../../lib/circuit/pin-registry";
import { terminalPosition } from "../../lib/circuit/coordinates";

// Teste de conectividade da montagem declarada, sem simulação de corrente.
function connected(a: string, b: string, pressed: boolean) {
  const edges: [string, string][] = [];
  const holes = Object.keys(terminals.breadboard);
  for (const h of holes)
    for (const other of holes)
      if (breadboardNet(h) === breadboardNet(other))
        edges.push([`breadboard.${h}`, `breadboard.${other}`]);
  edges.push(
    ...lesson.connections.map((w) => [w.from, w.to] as [string, string]),
  );
  edges.push(
    ["button.a1", "breadboard.e12"],
    ["button.a2", "breadboard.e14"],
    ["button.b1", "breadboard.f12"],
    ["button.b2", "breadboard.f14"],
    ["button.a1", "button.a2"],
    ["button.b1", "button.b2"],
  );
  if (pressed) edges.push(["button.a1", "button.b1"]);
  const visited = new Set([a]);
  const queue = [a];
  for (let i = 0; i < queue.length; i++)
    for (const [x, y] of edges) {
      const next = x === queue[i] ? y : y === queue[i] ? x : undefined;
      if (next && !visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  return visited.has(b);
}
describe("Segundo projeto: LED com botão", () => {
  it("registra aulas distintas com oito etapas e metadados próprios", () => {
    expect(lessons.map((l) => l.id)).toEqual([
      "primeiro-led",
      "led-com-botao",
      "led-interruptor",
    ]);
    expect(new Set(lessons.map((l) => l.projectNumber)).size).toBe(3);
    expect(lessonSchema.safeParse(lesson).success).toBe(true);
    expect(lesson.steps).toHaveLength(8);
    expect(lesson.projectNumber).toBe(2);
  });
  it("revela os fios progressivamente e os remove ao retornar", () => {
    expect(sceneFor(lesson, 0).parts.some((p) => p.kind === "button")).toBe(
      false,
    );
    expect(sceneFor(lesson, 1).parts.some((p) => p.kind === "button")).toBe(
      true,
    );
    expect(sceneFor(lesson, 2).connections).toHaveLength(2);
    expect(sceneFor(lesson, 3).connections).toHaveLength(3);
    expect(sceneFor(lesson, 4).connections).toHaveLength(4);
    expect(sceneFor(lesson, 2).connections.map((w) => w.id)).not.toContain(
      "button-input",
    );
    expect(clampStep(lesson, 999)).toBe(7);
  });
  it("posiciona os quatro terminais nos furos declarados sem alterar o circuito do LED", () => {
    for (const [part, hole] of [
      ["button.a1", "e12"],
      ["button.a2", "e14"],
      ["button.b1", "f12"],
      ["button.b2", "f14"],
      ["resistor.pin1", "c3"],
      ["resistor.pin2", "c8"],
      ["led.anode", "e8"],
      ["led.cathode", "e10"],
    ])
      expect(terminalPosition(lesson.components, part)).toEqual(
        terminalPosition(lesson.components, `breadboard.${hole}`),
      );
    expect(breadboardNet("e12")).not.toBe(breadboardNet("f12"));
  });
  it("conecta GPIO 22 ao GND somente quando o contato A–B fecha", () => {
    expect(connected("esp32.GPIO22", "button.a1", false)).toBe(true);
    expect(connected("button.b1", "esp32.GND", false)).toBe(true);
    expect(connected("esp32.GPIO22", "esp32.GND", false)).toBe(false);
    expect(connected("esp32.GPIO22", "esp32.GND", true)).toBe(true);
    expect(connected("esp32.GPIO22", "esp32.GPIO23", true)).toBe(false);
    expect(connected("esp32.GPIO22", "esp32.3V3", true)).toBe(false);
  });
  it("restringe a demonstração às etapas com instrução e código e valida o desafio", () => {
    expect(lesson.steps.flatMap((s, i) => (s.buttonDemo ? [i] : []))).toEqual([
      5, 6,
    ]);
    expect(lesson.steps[6].code).toContain("pinMode(BUTTON_PIN, INPUT_PULLUP)");
    expect(lesson.steps[6].code).toContain("digitalRead(BUTTON_PIN) == LOW");
    expect(canComplete(lesson, {})).toBe(false);
    expect(canComplete(lesson, { pullup: 0, contacts: 2 })).toBe(false);
    expect(canComplete(lesson, { pullup: 1, contacts: 2 })).toBe(true);
  });
});
