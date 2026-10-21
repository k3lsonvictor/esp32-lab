import { z } from "zod";
import { terminalPosition } from "../../lib/circuit/coordinates";
const question = z
  .object({
    id: z.string(),
    prompt: z.string(),
    options: z.array(z.string()).min(2),
    correct: z.number().int().nonnegative(),
    explanation: z.string(),
  })
  .refine((q) => q.correct < q.options.length, "Resposta fora das opções");
export const lessonSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    difficulty: z.string(),
    projectNumber: z.number().int().positive().default(1),
    durationMinutes: z.number().int().positive().default(15),
    completion: z.object({ title: z.string(), text: z.string() }).optional(),
    materials: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          href: z.string().regex(/^\/materiais\/[a-z0-9-]+\.pdf$/),
          filename: z.string(),
          details: z.string(),
          note: z.string().optional(),
        }),
      )
      .optional(),
    components: z.array(
      z.object({
        id: z.string(),
        kind: z.enum(["esp32", "breadboard", "led", "resistor", "button"]),
        x: z.number(),
        y: z.number(),
      }),
    ),
    connections: z.array(
      z.object({
        id: z.string(),
        from: z.string(),
        to: z.string(),
        color: z.string(),
      }),
    ),
    steps: z
      .array(
        z.object({
          title: z.string(),
          eyebrow: z.string(),
          text: z.string(),
          tip: z.string(),
          visible: z.array(z.string()),
          wires: z.array(z.string()),
          highlight: z.array(z.string()),
          pins: z.array(z.string()).default([]),
          code: z.string().optional(),
          questions: z.array(question).optional(),
          blink: z.boolean().optional(),
          buttonDemo: z.boolean().optional(),
        }),
      )
      .min(1),
  })
  .superRefine((lesson, ctx) => {
    const issue = (message: string) =>
      ctx.addIssue({ code: "custom", message });
    const ids = lesson.components.map((p) => p.id);
    const wireIds = lesson.connections.map((w) => w.id);
    if (
      new Set(ids).size !== ids.length ||
      new Set(wireIds).size !== wireIds.length
    )
      issue("IDs duplicados");
    for (const w of lesson.connections) {
      try {
        terminalPosition(lesson.components, w.from);
        terminalPosition(lesson.components, w.to);
      } catch {
        issue(`Conexão inválida: ${w.id}`);
      }
    }
    for (const s of lesson.steps) {
      for (const id of [...s.visible, ...s.highlight])
        if (!ids.includes(id)) issue(`Componente inválido: ${id}`);
      for (const id of s.wires) {
        const w = lesson.connections.find((c) => c.id === id);
        if (!w) issue(`Fio inválido: ${id}`);
        else if (
          ![w.from, w.to].every((e) => s.visible.includes(e.split(".")[0]))
        )
          issue("Fio ligado a componente invisível");
      }
      for (const p of s.pins) {
        try {
          terminalPosition(lesson.components, p);
        } catch {
          issue(`Destaque inválido: ${p}`);
        }
      }
    }
  });
export type Lesson = z.infer<typeof lessonSchema>;
