import { terminals, type Point } from "./pin-registry";
export type Part = { id: string; kind: string; x: number; y: number };
export function terminalPosition(parts: Part[], endpoint: string): Point {
  const [id, pin] = endpoint.split(".");
  const part = parts.find((p) => p.id === id);
  const local = part && terminals[part.kind]?.[pin];
  if (!part || !local) throw new Error(`Terminal inexistente: ${endpoint}`);
  return { x: part.x + local.x, y: part.y + local.y };
}
