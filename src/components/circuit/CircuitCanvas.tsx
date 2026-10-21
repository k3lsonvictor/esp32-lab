"use client";
import { motion, useReducedMotion } from "motion/react";
import type { Lesson } from "../../features/lessons/schema";
import { terminalPosition } from "../../lib/circuit/coordinates";
import { ESP32 } from "./parts/ESP32";
import { Breadboard } from "./parts/Breadboard";
import { LED } from "./parts/LED";
import { Resistor } from "./parts/Resistor";
import { Wire } from "./Wire";
type Props = {
  parts: Lesson["components"];
  connections: Lesson["connections"];
  highlight: string[];
  pins: string[];
  blink?: boolean;
};
export function CircuitCanvas({
  parts,
  connections,
  highlight,
  pins,
  blink,
}: Props) {
  const reduced = useReducedMotion();
  return (
    <svg
      className="circuit-svg"
      viewBox="0 0 790 510"
      role="img"
      aria-label={`Circuito: ${parts.map((p) => p.id).join(", ")}. ${connections.length} fios conectados.`}
    >
      <defs>
        <linearGradient id="metal" x2="1" y2="1">
          <stop stopColor="#d4dad6" />
          <stop offset=".5" stopColor="#edf0eb" />
          <stop offset="1" stopColor="#a5afaa" />
        </linearGradient>
        <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".8" fill="#d7d9cc" />
        </pattern>
      </defs>
      <rect width="790" height="510" fill="url(#dots)" />
      {parts.map((part) => (
        <motion.g
          key={part.id}
          transform={`translate(${part.x} ${part.y})`}
          initial={{ opacity: reduced ? 1 : 0 }}
          animate={{ opacity: 1 }}
        >
          <g
            className={
              highlight.includes(part.id) ? "part-highlight" : undefined
            }
          >
            {part.kind === "esp32" ? (
              <ESP32 />
            ) : part.kind === "breadboard" ? (
              <Breadboard />
            ) : part.kind === "resistor" ? (
              <Resistor />
            ) : (
              <LED blink={blink} />
            )}
          </g>
        </motion.g>
      ))}
      {connections.map((wire, i) => (
        <Wire
          key={wire.id}
          from={terminalPosition(parts, wire.from)}
          to={terminalPosition(parts, wire.to)}
          color={wire.color}
          index={i}
        />
      ))}
      {pins.map((pin) => {
        const p = terminalPosition(parts, pin);
        return (
          <g key={pin}>
            <circle
              cx={p.x}
              cy={p.y}
              r="10"
              fill="#edb76133"
              stroke="#d58c25"
              strokeWidth="2"
              className="pin-highlight"
            />
            <title>{pin}</title>
          </g>
        );
      })}
      <text x="90" y="490" fill="#7d8a7e" fontSize="11">
        DOIT ESP32 DevKit V1 · 30 pinos
      </text>
      {parts.some((p) => p.kind === "breadboard") && (
        <text x="410" y="490" fill="#7d8a7e" fontSize="11">
          a–e conectados por linha · f–j separados
        </text>
      )}
    </svg>
  );
}
