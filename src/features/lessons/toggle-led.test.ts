import { describe, it, expect } from "vitest";
import { toggleLesson } from "../../content/lessons/toggle-led";
import { buttonLesson } from "../../content/lessons/button-led";
import { lessonSchema } from "./schema";
import { sceneFor, canComplete } from "./engine";
import {
  initialButtonDemo,
  sampleButton,
  type ButtonDemoState,
} from "./button-demo";

function feed(
  samples: [boolean, number][],
  initial: ButtonDemoState = initialButtonDemo,
) {
  return samples.reduce(
    (state, [pressed, now]) => sampleButton(state, { pressed, now }),
    initial,
  );
}
describe("Botão interruptor e debounce", () => {
  it("inicia apagado e confirma o primeiro pressionamento após 50 ms", () => {
    const pending = feed([
      [true, 100],
      [true, 149],
    ]);
    expect(pending.ledOn).toBe(false);
    expect(pending.presses).toBe(0);
    const confirmed = sampleButton(pending, { pressed: true, now: 150 });
    expect(confirmed.ledOn).toBe(true);
    expect(confirmed.presses).toBe(1);
  });
  it("manter pressionado não alterna de novo; soltar preserva a luz", () => {
    const state = feed([
      [true, 100],
      [true, 150],
      [true, 1000],
      [true, 2000],
      [false, 2010],
      [false, 2060],
    ]);
    expect(state.ledOn).toBe(true);
    expect(state.presses).toBe(1);
    expect(state.stablePressed).toBe(false);
    const second = feed(
      [
        [true, 2100],
        [true, 2150],
      ],
      state,
    );
    expect(second.ledOn).toBe(false);
    expect(second.presses).toBe(2);
  });
  it("ignora um toque mais curto que o intervalo de confirmação", () => {
    const state = feed([
      [true, 100],
      [false, 120],
      [false, 200],
    ]);
    expect(state.ledOn).toBe(false);
    expect(state.presses).toBe(0);
  });
  it("filtra bounce no pressionamento e na soltura", () => {
    const pressed = feed([
      [true, 100],
      [false, 103],
      [true, 109],
      [false, 114],
      [true, 120],
      [true, 169],
      [true, 170],
    ]);
    expect(pressed.presses).toBe(1);
    expect(pressed.ledOn).toBe(true);
    const released = feed(
      [
        [false, 200],
        [true, 203],
        [false, 208],
        [true, 215],
        [false, 220],
        [false, 270],
      ],
      pressed,
    );
    expect(released.ledOn).toBe(true);
    expect(released.presses).toBe(1);
    expect(released.stablePressed).toBe(false);
  });
  it("não aceita outro pressionamento sem uma soltura estável", () => {
    const state = feed([
      [true, 100],
      [true, 150],
      [false, 200],
      [true, 220],
      [true, 270],
    ]);
    expect(state.presses).toBe(1);
    expect(state.ledOn).toBe(true);
  });
  it("ignora confirmações atrasadas de uma leitura que já mudou", () => {
    const released = feed([
      [true, 100],
      [false, 120],
    ]);
    expect(
      sampleButton(released, { pressed: true, now: 160, expectedChange: 100 }),
    ).toBe(released);
  });
});
describe("Terceira aula declarativa", () => {
  it("reutiliza a montagem validada e oferece oito etapas e código completo", () => {
    expect(lessonSchema.safeParse(toggleLesson).success).toBe(true);
    expect(toggleLesson.components).toEqual(buttonLesson.components);
    expect(toggleLesson.connections).toEqual(buttonLesson.connections);
    expect(toggleLesson.steps).toHaveLength(8);
    expect(toggleLesson.projectNumber).toBe(3);
    expect(toggleLesson.steps[6].code).toContain(
      "unsigned long now = millis();",
    );
    expect(toggleLesson.steps[6].code).toContain("reading != stableState");
  });
  it("restaura a cena declarada ao retornar e distingue as demonstrações", () => {
    expect(sceneFor(toggleLesson, 0).step.buttonDemo).toBe("toggle");
    expect(sceneFor(toggleLesson, 1).step.buttonDemo).toBeUndefined();
    expect(sceneFor(toggleLesson, 6).connections).toHaveLength(4);
    expect(sceneFor(toggleLesson, 0).step.buttonDemo).toBe("toggle");
    expect(buttonLesson.steps[5].buttonDemo).toBe(true);
  });
  it("exige as respostas da terceira aula e rejeita demos incompatíveis", () => {
    expect(canComplete(toggleLesson, { pullup: 1, contacts: 2 })).toBe(false);
    expect(canComplete(toggleLesson, { release: 1, debounce: 2 })).toBe(true);
    const invalid = structuredClone(toggleLesson);
    invalid.steps[0].visible = ["esp32"];
    expect(lessonSchema.safeParse(invalid).success).toBe(false);
  });
});
