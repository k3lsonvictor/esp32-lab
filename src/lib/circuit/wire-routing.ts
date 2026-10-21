import type { Point } from "./pin-registry";
export function wirePath(a: Point, b: Point, lane = 0) {
  const mid = (a.x + b.x) / 2 + lane;
  return `M ${a.x} ${a.y} C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`;
}
