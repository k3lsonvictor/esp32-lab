const pins = ["GND", "VCC", "SCK", "MOSI", "RST", "DC", "CS", "BL*"];
export function TFTDisplay({ framePath }: { framePath?: string }) {
  return (
    <g>
      <rect
        x="0"
        y="10"
        width="245"
        height="350"
        rx="12"
        fill="#234b79"
        stroke="#153655"
        strokeWidth="3"
      />
      {[18, 227].flatMap((x) =>
        [27, 342].map((y) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r="5"
            fill="#d4bf8f"
            stroke="#102f4d"
          />
        )),
      )}
      {pins.map((pin, i) => (
        <g key={pin}>
          <rect
            x="-6"
            y={39 + i * 40}
            width="12"
            height="12"
            rx="2"
            fill={i === 7 ? "#9aa8aa" : "#cdb987"}
          />
          <circle cx="0" cy={45 + i * 40} r="3" fill="#f3e0b3" />
          <text x="14" y={49 + i * 40} fill="#ecf1ec" fontSize="10">
            {pin}
          </text>
        </g>
      ))}
      <rect
        x="66"
        y="45"
        width="166"
        height="220"
        rx="6"
        fill="#101c24"
        stroke="#8c9698"
        strokeWidth="2"
      />
      <svg x="73" y="59" width="153.6" height="192" viewBox="0 0 128 160">
        <rect width="128" height="160" fill="#050809" />
        {framePath && (
          <path
            transform="translate(0 48)"
            d={framePath}
            fill="white"
            shapeRendering="crispEdges"
          />
        )}
      </svg>
      <text x="148" y="287" textAnchor="middle" fontSize="12" fill="#cbdcee">
        ST7735S · SPI
      </text>
      <text x="148" y="305" textAnchor="middle" fontSize="10" fill="#8baaca">
        LCD TFT 1,8″ · 128 × 160
      </text>
      <text x="148" y="327" textAnchor="middle" fontSize="8" fill="#a2b7c5">
        * BACKLIGHT: CONFORME MÓDULO
      </text>
    </g>
  );
}
