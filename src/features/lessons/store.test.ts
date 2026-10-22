import { beforeEach, describe, expect, it, vi } from "vitest";
import { blinkLesson as lesson } from "../../content/lessons/blink-led";
import { buttonLesson } from "../../content/lessons/button-led";
import { toggleLesson } from "../../content/lessons/toggle-led";
const storage = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => storage.set(k, v),
  removeItem: (k: string) => storage.delete(k),
});
vi.stubGlobal("window", { localStorage: globalThis.localStorage });
const { useLessonStore } = await import("./store");
describe("Persistência e ações de progresso", () => {
  it("mantém o progresso e o reinício independentes por aula", async () => {
    useLessonStore.setState({ progress: {} });
    const s = useLessonStore.getState();
    s.move(lesson, 4);
    s.answer(lesson, "resistor", 1);
    s.move(buttonLesson, 7);
    s.answer(buttonLesson, "pullup", 1);
    s.answer(buttonLesson, "contacts", 2);
    s.finish(buttonLesson);
    s.move(toggleLesson, 7);
    s.answer(toggleLesson, "release", 1);
    s.answer(toggleLesson, "debounce", 2);
    s.finish(toggleLesson);
    const saved = storage.get("esp32-lab-progress-v1")!;
    useLessonStore.setState({ progress: {} });
    storage.set("esp32-lab-progress-v1", saved);
    await useLessonStore.persist.rehydrate();
    expect(useLessonStore.getState().progress[buttonLesson.id].completed).toBe(
      true,
    );
    useLessonStore.getState().reset(buttonLesson.id);
    expect(useLessonStore.getState().progress[toggleLesson.id]).toEqual({
      step: 7,
      answers: { release: 1, debounce: 2 },
      completed: true,
    });
    expect(useLessonStore.getState().progress[lesson.id]).toEqual({
      step: 4,
      answers: { resistor: 1 },
      completed: false,
    });
    expect(useLessonStore.getState().progress[buttonLesson.id]).toEqual({
      step: 0,
      answers: {},
      completed: false,
    });
  });
  beforeEach(() => {
    storage.clear();
    useLessonStore.setState({ progress: {} });
  });
  it("avança, retorna, mantém limites e reinicia", () => {
    const s = useLessonStore.getState();
    s.move(lesson, -1);
    expect(useLessonStore.getState().progress[lesson.id].step).toBe(0);
    s.move(lesson, 5);
    s.move(lesson, -1);
    expect(useLessonStore.getState().progress[lesson.id].step).toBe(4);
    s.move(lesson, 100);
    expect(useLessonStore.getState().progress[lesson.id].step).toBe(7);
    s.reset(lesson.id);
    expect(useLessonStore.getState().progress[lesson.id]).toEqual({
      step: 0,
      answers: {},
      completed: false,
    });
  });
  it("bloqueia conclusão incorreta e persiste respostas corretas", async () => {
    const s = useLessonStore.getState();
    s.finish(lesson);
    expect(useLessonStore.getState().progress[lesson.id]?.completed).not.toBe(
      true,
    );
    s.answer(lesson, "resistor", 1);
    s.answer(lesson, "polarity", 0);
    s.finish(lesson);
    expect(useLessonStore.getState().progress[lesson.id].completed).toBe(true);
    const saved = storage.get("esp32-lab-progress-v1")!;
    useLessonStore.setState({ progress: {} });
    storage.set("esp32-lab-progress-v1", saved);
    await useLessonStore.persist.rehydrate();
    expect(useLessonStore.getState().progress[lesson.id].answers).toEqual({
      resistor: 1,
      polarity: 0,
    });
    expect(useLessonStore.getState().progress[lesson.id].completed).toBe(true);
  });
  it("ignora progresso com estrutura inválida", async () => {
    storage.set(
      "esp32-lab-progress-v1",
      JSON.stringify({
        state: { progress: { "primeiro-led": { step: "quebrado" } } },
        version: 0,
      }),
    );
    await useLessonStore.persist.rehydrate();
    expect(useLessonStore.getState().progress).toEqual({});
  });
});
