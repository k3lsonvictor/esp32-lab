export function Resistor() {
  return (
    <g>
      <path d="M0 0v100" stroke="#9aa5a1" strokeWidth="3" />
      <rect
        x="-11"
        y="25"
        width="22"
        height="50"
        rx="7"
        fill="#e6ca96"
        stroke="#ba9c68"
      />
      {(
        [
          ["#c84e42", 33],
          ["#c84e42", 43],
          ["#805435", 55],
          ["#b59a47", 66],
        ] as const
      ).map(([color, y]) => (
        <rect key={y} x="-10" y={y} width="20" height="4" fill={color} />
      ))}
      <text x="-19" y="55" textAnchor="end" fill="#7a6646" fontSize="12">
        220 Ω
      </text>
    </g>
  );
}
