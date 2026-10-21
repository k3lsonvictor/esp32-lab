export function LED({ blink = false }: { blink?: boolean }) {
  return (
    <g>
      <path
        d="M0 35H20 M0 75H38V50"
        fill="none"
        stroke="#8d9696"
        strokeWidth="3"
      />
      <g className={blink ? "led-blink" : undefined}>
        <circle cx="28" cy="45" r="25" fill="#fa594a" opacity=".12" />
        <path
          d="M12 50V34a16 16 0 0 1 32 0v16z"
          fill="#ef6556"
          stroke="#bf4338"
          strokeWidth="2"
        />
        <ellipse cx="22" cy="31" rx="4" ry="7" fill="#ffb6a8" />
        <path d="M11 50h33" stroke="#9e352b" strokeWidth="4" />
      </g>
      <text x="-13" y="39" fontSize="12" fill="#a34c3a">
        +
      </text>
      <text x="-13" y="79" fontSize="12" fill="#54665d">
        −
      </text>
    </g>
  );
}
