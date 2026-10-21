"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";
import type { Lesson } from "./schema";
import { canComplete, clampStep } from "./engine";
const progressSchema = z.object({
  step: z.number().int().nonnegative(),
  answers: z.record(z.string(), z.number().int().nonnegative()),
  completed: z.boolean(),
});
export type Progress = z.infer<typeof progressSchema>;
const empty = (): Progress => ({ step: 0, answers: {}, completed: false });
type State = {
  progress: Record<string, Progress>;
  move: (l: Lesson, delta: number) => void;
  answer: (l: Lesson, id: string, value: number) => void;
  finish: (l: Lesson) => void;
  reset: (id: string) => void;
};
export const useLessonStore = create<State>()(
  persist(
    (set) => ({
      progress: {},
      move: (l, d) =>
        set((s) => {
          const p = s.progress[l.id] ?? empty();
          return {
            progress: {
              ...s.progress,
              [l.id]: { ...p, step: clampStep(l, p.step + d) },
            },
          };
        }),
      answer: (l, id, value) =>
        set((s) => {
          const p = s.progress[l.id] ?? empty();
          return {
            progress: {
              ...s.progress,
              [l.id]: { ...p, answers: { ...p.answers, [id]: value } },
            },
          };
        }),
      finish: (l) =>
        set((s) => {
          const p = s.progress[l.id] ?? empty();
          return canComplete(l, p.answers)
            ? { progress: { ...s.progress, [l.id]: { ...p, completed: true } } }
            : {};
        }),
      reset: (id) =>
        set((s) => ({ progress: { ...s.progress, [id]: empty() } })),
    }),
    {
      name: "esp32-lab-progress-v1",
      skipHydration: true,
      merge: (saved, current) => {
        const raw = (saved as { progress?: unknown })?.progress;
        const result = z.record(z.string(), progressSchema).safeParse(raw);
        return { ...current, progress: result.success ? result.data : {} };
      },
    },
  ),
);
