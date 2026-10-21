export type Point = { x: number; y: number };
export const leftPins = [
  "EN",
  "VP",
  "VN",
  "GPIO34",
  "GPIO35",
  "GPIO32",
  "GPIO33",
  "GPIO25",
  "GPIO26",
  "GPIO27",
  "GPIO14",
  "GPIO12",
  "GPIO13",
  "GND_LEFT",
  "VIN",
];
export const rightPins = [
  "GPIO23",
  "GPIO22",
  "TX0",
  "RX0",
  "GPIO21",
  "GPIO19",
  "GPIO18",
  "GPIO5",
  "TX2",
  "RX2",
  "GPIO4",
  "GPIO2",
  "GPIO15",
  "GND",
  "3V3",
];
export const hole = (column: string, row: number): Point => ({
  x:
    35 +
    "abcdefghij".indexOf(column) * 20 +
    ("fghij".includes(column) ? 24 : 0),
  y: 55 + (row - 1) * 20,
});
export const terminals: Record<string, Record<string, Point>> = {
  esp32: Object.fromEntries([
    ...leftPins.map((p, i) => [p, { x: 0, y: 45 + i * 20 }]),
    ...rightPins.map((p, i) => [p, { x: 180, y: 45 + i * 20 }]),
  ]),
  breadboard: Object.fromEntries(
    Array.from({ length: 15 }, (_, r) =>
      Array.from("abcdefghij", (c) => [`${c}${r + 1}`, hole(c, r + 1)]),
    ).flat(),
  ),
  resistor: { pin1: { x: 0, y: 0 }, pin2: { x: 0, y: 100 } },
  led: { anode: { x: 0, y: 35 }, cathode: { x: 0, y: 75 } },
};
export function breadboardNet(pin: string) {
  const match = /^([a-j])([1-9]|1[0-5])$/.exec(pin);
  if (!match) throw new Error("Furo inválido");
  return `${Number(match[2])}:${"abcde".includes(match[1]) ? "left" : "right"}`;
}
