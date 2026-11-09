import { z } from "zod";
const animationSchema = z
  .object({
    id: z.enum(["content", "laugh", "angry"]),
    label: z.string(),
    width: z.literal(128),
    height: z.literal(64),
    pauseAfter: z.number().int().nonnegative(),
    delays: z.array(z.number().int().positive()).min(1),
    frames: z
      .array(
        z
          .string()
          .length(1368)
          .regex(/^[A-Za-z0-9+/]{1366}==$/),
      )
      .min(1)
      .max(255),
  })
  .refine(
    (a) => a.delays.length === a.frames.length,
    "Quadros e tempos devem corresponder",
  );
export const facePreviewSchema = z
  .object({ animations: z.array(animationSchema).length(3) })
  .refine(
    (p) => p.animations.map((a) => a.id).join(",") === "content,laugh,angry",
    "Ordem de reprodução inválida",
  );
export type FacePreview = z.infer<typeof facePreviewSchema>;
export type FaceCursor = { animation: number; frame: number };
export function nextFaceFrame(
  preview: FacePreview,
  cursor: FaceCursor,
): FaceCursor {
  const a = preview.animations[cursor.animation];
  return cursor.frame + 1 < a.frames.length
    ? { ...cursor, frame: cursor.frame + 1 }
    : {
        animation: (cursor.animation + 1) % preview.animations.length,
        frame: 0,
      };
}
export function faceFrameDelay(preview: FacePreview, cursor: FaceCursor) {
  const a = preview.animations[cursor.animation];
  return (
    a.delays[cursor.frame] +
    (cursor.frame === a.frames.length - 1 ? a.pauseAfter : 0)
  );
}
// Os headers guardam linhas de 16 bytes, com o pixel da esquerda no bit 7.
export function bitmapPath(base64: string, width = 128, height = 64): string {
  const bytes = atob(base64);
  const stride = Math.ceil(width / 8);
  if (bytes.length !== stride * height)
    throw new Error("Tamanho de bitmap inválido");
  const paths: string[] = [];
  const on = (x: number, y: number) =>
    (bytes.charCodeAt(y * stride + Math.floor(x / 8)) &
      (1 << (7 - (x % 8)))) !==
    0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width;) {
      if (!on(x, y)) {
        x++;
        continue;
      }
      const start = x;
      while (x < width && on(x, y)) x++;
      const length = x - start;
      paths.push(`M${start} ${y}h${length}v1h-${length}z`);
    }
  return paths.join("");
}
