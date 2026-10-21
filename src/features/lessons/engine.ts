import type { Lesson } from "./schema";
export function clampStep(lesson: Lesson, step: number) {
  return Math.max(
    0,
    Math.min(
      lesson.steps.length - 1,
      Number.isFinite(step) ? Math.trunc(step) : 0,
    ),
  );
}
export function sceneFor(lesson: Lesson, index: number) {
  const step = lesson.steps[clampStep(lesson, index)];
  return {
    step,
    parts: lesson.components.filter((p) => step.visible.includes(p.id)),
    connections: lesson.connections.filter((w) => step.wires.includes(w.id)),
  };
}
export function canComplete(lesson: Lesson, answers: Record<string, number>) {
  return lesson.steps
    .flatMap((s) => s.questions ?? [])
    .every((q) => answers[q.id] === q.correct);
}
