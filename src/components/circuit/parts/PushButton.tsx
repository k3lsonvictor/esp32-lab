export function PushButton({ pressed = false }: { pressed?: boolean }) {
  return (
    <g>
      <path
        d="M0 0H8V40H0 M44 0H36V40H44"
        fill="none"
        stroke="#9aa5a1"
        strokeWidth="3"
      />
      <rect
        x="6"
        y="3"
        width="32"
        height="34"
        rx="5"
        fill="#bec6bf"
        stroke="#78877d"
      />
      <circle
        cx="22"
        cy="20"
        r={pressed ? 10 : 12}
        fill={pressed ? "#b88238" : "#334b41"}
        stroke="#233c34"
        strokeWidth="2"
      />
      <circle cx="22" cy="20" r="5" fill={pressed ? "#e6b76c" : "#577061"} />
      <text x="-13" y="5" textAnchor="end" fontSize="8" fill="#61755e">
        A1
      </text>
      <text x="-13" y="44" textAnchor="end" fontSize="8" fill="#61755e">
        A2
      </text>
      <text x="54" y="5" fontSize="8" fill="#61755e">
        B1
      </text>
      <text x="54" y="44" fontSize="8" fill="#61755e">
        B2
      </text>
      <text x="22" y="61" textAnchor="middle" fontSize="9" fill="#61755e">
        {pressed ? "FECHADO" : "ABERTO"}
      </text>
    </g>
  );
}
