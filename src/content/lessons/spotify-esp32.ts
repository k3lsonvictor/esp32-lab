import { lessonSchema } from "../../features/lessons/schema";

const displayWiring = [
  {
    id: "power",
    pin: "3V3",
    terminal: "VCC",
    label: "Alimentação",
    color: "#ca6751",
  },
  {
    id: "ground",
    pin: "GND",
    terminal: "GND",
    label: "Terra",
    color: "#334155",
  },
  {
    id: "clock",
    pin: "GPIO18",
    terminal: "SCK",
    label: "Clock SPI",
    color: "#47958b",
  },
  {
    id: "data",
    pin: "GPIO23",
    terminal: "MOSI",
    label: "Dados SPI",
    color: "#3b78db",
  },
  {
    id: "select",
    pin: "GPIO5",
    terminal: "CS",
    label: "Seleção",
    color: "#a68138",
  },
  {
    id: "reset",
    pin: "GPIO4",
    terminal: "RST",
    label: "Reset",
    color: "#9c74b3",
  },
  {
    id: "command",
    pin: "GPIO2",
    terminal: "DC",
    label: "Dados/comando",
    color: "#c47c37",
  },
];
const buttons = [
  {
    id: "previous",
    pin: "GPIO25",
    label: "Anterior",
    color: "#a68138",
    y: 243,
  },
  { id: "next", pin: "GPIO26", label: "Próxima", color: "#47958b", y: 325 },
  {
    id: "toggle",
    pin: "GPIO27",
    label: "Play/pause",
    color: "#9c74b3",
    y: 407,
  },
];
const displayWires = displayWiring.map(({ id }) => id);
const buttonWires = buttons.flatMap(({ id }) => [id, `${id}-ground`]);
const assembly = {
  visible: ["esp32", "display", ...buttons.map(({ id }) => id)],
  wires: [...displayWires, ...buttonWires],
  highlight: [],
};

export const spotifyLesson = lessonSchema.parse({
  id: "spotify-esp32",
  projectNumber: 5,
  special: true,
  difficulty: "Intermediário",
  durationMinutes: 45,
  title: "Controle o Spotify com o ESP32",
  description:
    "Mostre faixa, artista, capa e progresso no TFT e controle o Spotify com três botões físicos.",
  completion: {
    title: "Seu controle do Spotify está pronto para a bancada.",
    text: "Você ligou o TFT por SPI, montou os botões com pull-up e acompanhou o caminho dos dados entre o Spotify, o servidor local e o ESP32.",
  },
  components: [
    { id: "esp32", kind: "esp32", x: 240, y: 90 },
    { id: "display", kind: "tft", x: 530, y: 65 },
    ...buttons.map(({ id, y }) => ({ id, kind: "button", x: 90, y })),
  ],
  connections: [
    ...displayWiring.map(({ id, pin, terminal, color }) => ({
      id,
      from: `esp32.${pin}`,
      to: `display.${terminal}`,
      color,
    })),
    ...buttons.map(({ id, pin, color }) => ({
      id,
      from: `esp32.${pin}`,
      to: `${id}.b1`,
      color,
    })),
    ...buttons.map(({ id, y }, index) => {
      const lane = 42 + index * 12;
      const bottom = 495 - index * 10;
      return {
        id: `${id}-ground`,
        from: "esp32.GND_LEFT",
        to: `${id}.a2`,
        color: "#334155",
        via: [
          { x: 205, y: 395 },
          { x: 205 - index * 13, y: bottom },
          { x: lane, y: bottom },
          { x: lane, y: y + 40 },
        ],
      };
    }),
  ],
  wiring: [
    ...displayWiring.map(({ label, pin, terminal }) => ({
      signal: label,
      board: pin,
      display: `TFT ${terminal}`,
    })),
    ...buttons.map(({ label, pin }) => ({
      signal: label,
      board: `${pin} e GND`,
      display: `Botão ${label.toLowerCase()}`,
    })),
  ],
  downloads: [
    {
      title: "Baixar projeto completo (.zip)",
      href: "/projetos/spotify-esp32/spotify-esp32.zip",
      filename: "spotify-esp32.zip",
      description:
        "Sketch Arduino, servidor Node.js, configurações de exemplo e guia de montagem.",
    },
  ],
  steps: [
    {
      eyebrow: "O que vamos montar",
      title: "A faixa do Spotify na tela do ESP32",
      text: "Separe um ESP32 clássico, um TFT ST7735 de 128 × 160, três botões momentâneos e jumpers. O celular ou computador continua reproduzindo o áudio enquanto o ESP32 mostra a faixa e envia comandos.",
      tip: "O computador executa um servidor Node.js na mesma rede local do ESP32. Ele guarda a autorização do Spotify e prepara a capa para o display.",
      visible: assembly.visible,
      wires: [],
      highlight: ["display"],
    },
    {
      eyebrow: "Display por SPI",
      title: "Ligue o TFT",
      text: "Com o USB desconectado, ligue VCC a 3V3 e GND ao terra. Use GPIO 18 para SCK, GPIO 23 para MOSI, GPIO 5 para CS, GPIO 4 para RST e GPIO 2 para DC.",
      tip: "No módulo SPI, SCL pode indicar SCK e SDA pode indicar MOSI. Confira o pino de backlight no seu módulo.",
      visible: ["esp32", "display"],
      wires: displayWires,
      highlight: ["display"],
      showWiring: true,
    },
    {
      ...assembly,
      wires: buttonWires,
      eyebrow: "Controles físicos",
      title: "Adicione os três botões",
      text: "Ligue os botões aos GPIOs 25 (anterior), 26 (próxima) e 27 (play/pause). Leve o outro contato elétrico de cada botão ao GND.",
      tip: "Nesta etapa, o diagrama mostra os fios dos botões. Com INPUT_PULLUP, o pino lê HIGH em repouso e LOW quando o botão fecha contato com o GND.",
      showWiring: true,
      code: [
        "pinMode(BTN_ANTERIOR, INPUT_PULLUP);",
        "pinMode(BTN_PROXIMA, INPUT_PULLUP);",
        "pinMode(BTN_PLAY_PAUSE, INPUT_PULLUP);",
      ].join("\n"),
    },
    {
      ...assembly,
      eyebrow: "Servidor local",
      title: "Autorize sua conta do Spotify",
      text: "Extraia o ZIP e siga o README. Cadastre http://127.0.0.1:3001/callback no app do Spotify, preencha o config.json a partir do exemplo e rode npm ci e npm start na pasta servidor. Abra http://127.0.0.1:3001/login nesse computador.",
      tip: "Use uma conta Spotify Premium para os controles e mantenha o Client Secret e os tokens no computador. O ESP32 usa a chave do dispositivo para falar com o servidor.",
    },
    {
      ...assembly,
      showWiring: true,
      eyebrow: "Arduino IDE",
      title: "Envie o sketch e teste a reprodução",
      text: "Instale ArduinoJson 7, Adafruit GFX e Adafruit ST7735 and ST7789. Crie config.h a partir do exemplo, configure o Wi-Fi, o IP local do computador na porta 3001 e a mesma chave do servidor. Envie o sketch e coloque uma faixa para tocar no Spotify.",
      tip: "Acompanhe o Monitor Serial a 115200 baud. O servidor entrega a capa em RGB565, com 52 × 52 pixels e 5.408 bytes. Teste anterior, próxima e play/pause.",
    },
    {
      ...assembly,
      eyebrow: "Revisão",
      title: "Identifique quem faz cada parte",
      text: "Revise a arquitetura antes de levar o projeto para a bancada.",
      tip: "A montagem no navegador ilustra os fios. Para experimentar a reprodução e os botões, use o hardware com o servidor local.",
      questions: [
        {
          id: "spotify-audio",
          prompt: "Onde a música toca?",
          options: [
            "No dispositivo ativo do Spotify",
            "No TFT",
            "Na saída SPI do ESP32",
          ],
          correct: 0,
          explanation:
            "O dispositivo ativo reproduz o áudio. O ESP32 exibe a faixa e envia comandos.",
        },
        {
          id: "spotify-button",
          prompt: "Com INPUT_PULLUP, qual leitura indica um botão pressionado?",
          options: ["HIGH", "LOW"],
          correct: 1,
          explanation:
            "O botão pressionado liga o GPIO ao GND, levando a leitura a LOW.",
        },
      ],
    },
  ],
});
