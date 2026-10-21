import { hole } from "../../../lib/circuit/pin-registry";
export function Breadboard() {
  return (
    <g>
      <rect
        width="274"
        height="375"
        rx="12"
        fill="#fefdf9"
        stroke="#d9d7cc"
        strokeWidth="2"
      />
      <rect x="126" y="43" width="22" height="302" rx="6" fill="#e5e4dd" />
      {Array.from("abcdefghij", (c) => (
        <text
          key={c}
          x={hole(c, 1).x}
          y="30"
          textAnchor="middle"
          fontSize="11"
          fill="#86918c"
        >
          {c}
        </text>
      ))}
      {Array.from({ length: 15 }, (_, i) => (
        <g key={i}>
          <text x="12" y={59 + i * 20} fontSize="9" fill="#9a9f98">
            {i + 1}
          </text>
          {Array.from("abcdefghij", (c) => (
            <rect
              key={c}
              x={hole(c, i + 1).x - 3}
              y={hole(c, i + 1).y - 3}
              width="6"
              height="6"
              rx="1"
              fill="#9aa39c"
            />
          ))}
        </g>
      ))}
      <path d="M25 354h224" stroke="#d5cfc0" />
      <text x="137" y="367" textAnchor="middle" fill="#99a196" fontSize="8">
        MINI PROTOBOARD · 150 PONTOS
      </text>
    </g>
  );
}
