"use client";
import { useState, type ComponentProps } from "react";
import { Hand } from "lucide-react";
import { CircuitCanvas } from "../circuit/CircuitCanvas";

export function CircuitDemo({
  interactive,
  ...scene
}: ComponentProps<typeof CircuitCanvas> & { interactive?: boolean }) {
  const [pressed, setPressed] = useState(false);
  return (
    <>
      <CircuitCanvas
        {...scene}
        buttonPressed={pressed}
        ledOn={interactive ? pressed : undefined}
      />
      {interactive && (
        <div className="button-demo">
          <button
            type="button"
            className="secondary"
            aria-pressed={pressed}
            onClick={() => setPressed((p) => !p)}
          >
            <Hand size={17} aria-hidden="true" />
            {pressed ? "Soltar botão" : "Pressionar botão"}
          </button>
          <p role="status">
            <strong>
              {pressed
                ? "GPIO 22: LOW (0) → LED aceso"
                : "GPIO 22: HIGH (1) → LED apagado"}
            </strong>
            <br />
            Demonstração didática. O controle alterna entre pressionado e solto;
            nenhum firmware é executado.
          </p>
        </div>
      )}
    </>
  );
}
