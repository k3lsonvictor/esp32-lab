import { leftPins, rightPins } from "../../../lib/circuit/pin-registry";
export function ESP32() {
  return (
    <g>
      <rect
        x="0"
        y="15"
        width="180"
        height="360"
        rx="13"
        fill="#173e36"
        stroke="#102e28"
        strokeWidth="3"
      />
      {[leftPins, rightPins].map((pins, side) =>
        pins.map((p, i) => (
          <g key={`${side}-${p}`}>
            <rect
              x={side ? 174 : -6}
              y={38 + i * 20}
              width="12"
              height="14"
              rx="2"
              fill="#cdb987"
            />
            <circle cx={side ? 180 : 0} cy={45 + i * 20} r="3" fill="#e9dba9" />
            <text
              x={side ? 166 : 14}
              y={49 + i * 20}
              textAnchor={side ? "end" : "start"}
              fill="#dce9d9"
              fontSize="9"
            >
              {p.replace("GPIO", "D").replace("_LEFT", "")}
            </text>
          </g>
        )),
      )}
      <rect x="39" y="28" width="102" height="72" rx="3" fill="#1c2929" />
      <path
        d="M49 85V40h15v32h13V40h13v32h13V40h13v32h14"
        fill="none"
        stroke="#c8b582"
        strokeWidth="4"
      />
      <rect
        x="35"
        y="105"
        width="110"
        height="139"
        rx="4"
        fill="url(#metal)"
        stroke="#9ca7a3"
      />
      <text
        x="90"
        y="145"
        textAnchor="middle"
        fill="#384846"
        fontSize="12"
        fontWeight="700"
      >
        ESP-WROOM-32
      </text>
      <text x="90" y="165" textAnchor="middle" fill="#697674" fontSize="9">
        Wi-Fi + Bluetooth
      </text>
      <path d="M61 190h58m-58 9h58m-58 9h40" stroke="#9ba7a2" />
      <rect x="69" y="270" width="42" height="37" fill="#172322" rx="3" />
      <rect x="24" y="313" width="22" height="24" fill="#83958d" rx="3" />
      <rect x="134" y="313" width="22" height="24" fill="#83958d" rx="3" />
      <text x="35" y="350" textAnchor="middle" fill="white" fontSize="8">
        EN
      </text>
      <text x="145" y="350" textAnchor="middle" fill="white" fontSize="8">
        BOOT
      </text>
      <rect
        x="65"
        y="345"
        width="50"
        height="39"
        rx="4"
        fill="url(#metal)"
        stroke="#82938b"
      />
      <rect x="72" y="360" width="36" height="15" rx="3" fill="#24332f" />
      <circle cx="130" cy="285" r="4" fill="#f3b95e" />
    </g>
  );
}
