export const DEBOUNCE_MS = 50;
export type ButtonDemoState = {
  rawPressed: boolean;
  stablePressed: boolean;
  changedAt: number;
  ledOn: boolean;
  presses: number;
};
export const initialButtonDemo: ButtonDemoState = {
  rawPressed: false,
  stablePressed: false,
  changedAt: 0,
  ledOn: false,
  presses: 0,
};
// Modelo didático de leitura e debounce; não simula eletricidade ou firmware.
export function sampleButton(
  state: ButtonDemoState,
  sample: { pressed: boolean; now: number; expectedChange?: number },
): ButtonDemoState {
  if (
    sample.expectedChange !== undefined &&
    (sample.expectedChange !== state.changedAt ||
      sample.pressed !== state.rawPressed)
  )
    return state;
  if (sample.pressed !== state.rawPressed) {
    return { ...state, rawPressed: sample.pressed, changedAt: sample.now };
  }
  if (
    sample.now - state.changedAt < DEBOUNCE_MS ||
    state.stablePressed === sample.pressed
  )
    return state;
  return {
    ...state,
    stablePressed: sample.pressed,
    ledOn: sample.pressed ? !state.ledOn : state.ledOn,
    presses: state.presses + (sample.pressed ? 1 : 0),
  };
}
