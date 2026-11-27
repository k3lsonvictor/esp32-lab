"use client";
import { motion, useReducedMotion } from "motion/react";
import type { Point } from "../../lib/circuit/pin-registry";
import { wirePath } from "../../lib/circuit/wire-routing";
export function Wire({
  from,
  to,
  color,
  index,
  via,
}: {
  from: Point;
  to: Point;
  color: string;
  index: number;
  via?: Point[];
}) {
  const reduced = useReducedMotion();
  return (
    <g>
      <motion.path
        d={
          via?.length
            ? `M ${[from, ...via, to].map(({ x, y }) => `${x} ${y}`).join(" L ")}`
            : wirePath(from, to, index * 15)
        }
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduced ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: reduced ? 0 : 0.8,
          delay: reduced ? 0 : index * 0.3,
        }}
      />
      {[from, to].map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />
      ))}
    </g>
  );
}
