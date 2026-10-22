"use client";
import { useReducer, useEffect, type ComponentProps } from "react";
import { Hand } from "lucide-react";
import { CircuitCanvas } from "../circuit/CircuitCanvas";
import {
  DEBOUNCE_MS,
  initialButtonDemo,
  sampleButton,
} from "../../features/lessons/button-demo";

export function CircuitDemo({
  interactive,
  ...scene
}: ComponentProps<typeof CircuitCanvas> & {
  interactive?: boolean | "toggle";
}) {
  const [state, sample] = useReducer(sampleButton, initialButtonDemo);
  const pressed = state.rawPressed;
  const toggle = interactive === "toggle";
  const ledOn = toggle ? state.ledOn : pressed;
  useEffect(() => {
    if (!toggle || state.rawPressed === state.stablePressed) return;
    const remaining = Math.max(
      0,
      DEBOUNCE_MS - (performance.now() - state.changedAt),
    );
    const timer = setTimeout(
      () =>
        sample({
          pressed: state.rawPressed,
          now: performance.now(),
          expectedChange: state.changedAt,
        }),
      remaining + 1,
    );
    return () => clearTimeout(timer);
  }, [toggle, state.rawPressed, state.stablePressed, state.changedAt]);
  return (
    <>
      <CircuitCanvas
        {...scene}
        buttonPressed={pressed}
        ledOn={interactive ? ledOn : undefined}
      />
      {interactive && (
        <div className="button-demo">
          <button
            type="button"
            className="secondary"
            aria-pressed={pressed}
            onClick={() =>
              sample({ pressed: !pressed, now: performance.now() })
            }
          >
            <Hand size={17} aria-hidden="true" />
            {pressed ? "Soltar botão" : "Pressionar botão"}
          </button>
          <p role="status">
            <strong>
              GPIO 22: {pressed ? "LOW (0)" : "HIGH (1)"} → LED{" "}
              {ledOn ? "aceso" : "apagado"}
            </strong>
            <br />
            {toggle
              ? `${state.presses} pressionamento(s) confirmado(s). Aguarde 50 ms entre pressionar e soltar. Soltar mantém a luz; o próximo pressionamento a alterna. `
              : "O controle alterna entre pressionado e solto. "}
            Demonstração didática; nenhum firmware é executado.
          </p>
        </div>
      )}
    </>
  );
}
