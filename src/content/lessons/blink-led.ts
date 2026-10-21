import { lessonSchema } from "../../features/lessons/schema";
const all = ["esp32", "breadboard", "led", "resistor"];
const code = `const int LED_PIN = 23;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(1000);

  digitalWrite(LED_PIN, LOW);
  delay(1000);
}`;
export const blinkLesson = lessonSchema.parse({
  id: "primeiro-led",
  title: "Seu primeiro LED com ESP32",
  description:
    "Da primeira conexão ao primeiro piscar. Aprenda montando, uma etapa de cada vez.",
  difficulty: "Iniciante",
  materials: [
    {
      title: "Projetos de eletrônica para iniciantes",
      description:
        "Revise os componentes do kit e aprofunde a montagem do primeiro LED, a polaridade, a limitação de corrente e a Lei de Ohm. Inclui experimentos e dicas para quando o LED não acende.",
      href: "/materiais/projetos-de-eletronica-para-iniciantes.pdf",
      filename: "projetos-de-eletronica-para-iniciantes.pdf",
      details: "PDF · 34 páginas · 4,8 MB",
      note: "O projeto do PDF usa uma fonte de 5 V e resistor de 330 Ω. Aqui, controlamos o LED pelo GPIO 23 do ESP32, com lógica de 3,3 V e resistor de 220 Ω. Use os valores e as conexões da montagem que estiver seguindo; não aplique os 5 V do exemplo ao GPIO.",
    },
  ],
  components: [
    { id: "esp32", kind: "esp32", x: 90, y: 90 },
    { id: "breadboard", kind: "breadboard", x: 410, y: 65 },
    { id: "resistor", kind: "resistor", x: 485, y: 160 },
    { id: "led", kind: "led", x: 525, y: 225 },
  ],
  connections: [
    {
      id: "signal",
      from: "esp32.GPIO23",
      to: "breadboard.a3",
      color: "#3b78db",
    },
    { id: "ground", from: "esp32.GND", to: "breadboard.a10", color: "#334155" },
  ],
  steps: [
    {
      eyebrow: "A placa",
      title: "Pequena placa. Muitas possibilidades.",
      text: "Este é o ESP32: o cérebro do nosso circuito. Seu programa controla os pinos GPIO, que se comunicam com o mundo ao redor.",
      tip: "Usamos a DOIT DevKit V1 de 30 pinos, vista de cima, com a antena para cima. GPIO 23 será nossa saída; GND é a referência de terra.",
      visible: ["esp32"],
      wires: [],
      highlight: ["esp32"],
      pins: ["esp32.GPIO23", "esp32.GND"],
    },
    {
      eyebrow: "Uma luz, duas pernas",
      title: "Conheça o LED",
      text: "O LED emite luz quando a corrente passa no sentido correto: do ânodo (+) para o cátodo (−).",
      tip: "A perna longa é o ânodo. A curta e o lado achatado do encapsulamento indicam o cátodo. No desenho: ânodo em cima, cátodo embaixo.",
      visible: ["esp32", "led"],
      wires: [],
      highlight: ["led"],
      pins: ["led.anode", "led.cathode"],
    },
    {
      eyebrow: "Proteção essencial",
      title: "Um resistor para cuidar do LED",
      text: "O resistor de 220 Ω limita a corrente. Ele fica em série com o LED para proteger o componente e o GPIO.",
      tip: "Faixas: vermelho, vermelho, marrom e dourado (±5%). O resistor não tem polaridade. Nunca conecte o LED diretamente ao GPIO.",
      visible: ["esp32", "led", "resistor"],
      wires: [],
      highlight: ["resistor"],
    },
    {
      eyebrow: "A base da montagem",
      title: "Cada furo tem uma conexão",
      text: "Na protoboard, os cinco furos a–e de cada linha são conectados entre si. Os furos f–j formam outro grupo, separado pelo canal central.",
      tip: "Resistor em c3 e c8. Ânodo em e8; cátodo em e10. Assim, o resistor e o ânodo compartilham a linha 8. Linhas diferentes não se conectam.",
      visible: all,
      wires: [],
      highlight: ["breadboard"],
      pins: [
        "breadboard.c3",
        "breadboard.c8",
        "breadboard.e8",
        "breadboard.e10",
      ],
    },
    {
      eyebrow: "Primeiro jumper",
      title: "Dê um caminho ao sinal",
      text: "Conecte o GPIO 23 ao furo a3 com o jumper azul. A linha 3 leva o sinal até a primeira perna do resistor, em c3.",
      tip: "Monte sempre com a placa desconectada da alimentação. Confira a identificação GPIO 23 antes de ligar.",
      visible: all,
      wires: ["signal"],
      highlight: ["resistor"],
      pins: ["esp32.GPIO23", "breadboard.a3"],
    },
    {
      eyebrow: "Feche o caminho",
      title: "Agora, de volta ao GND",
      text: "Da linha 3, a corrente passa pelo resistor até a linha 8 e entra no ânodo. Conecte a linha 10, onde está o cátodo, ao GND.",
      tip: "Caminho completo: GPIO 23 → linha 3 → 220 Ω → linha 8 → LED → linha 10 → GND. Não há jumper extra na linha 8: a própria protoboard faz essa ligação.",
      visible: all,
      wires: ["signal", "ground"],
      highlight: ["led"],
      pins: ["led.anode", "led.cathode", "esp32.GND"],
    },
    {
      eyebrow: "Do circuito ao código",
      title: "Seu primeiro piscar",
      text: "setup roda uma vez; pinMode configura a saída. loop repete: digitalWrite alterna HIGH e LOW; delay espera 1000 ms (1 segundo) a cada mudança.",
      tip: "A luz ao lado é uma animação didática. Nenhum firmware está sendo executado. Copie o código para a IDE Arduino e selecione sua placa para usá-lo no hardware.",
      visible: all,
      wires: ["signal", "ground"],
      highlight: [],
      code,
      blink: true,
    },
    {
      eyebrow: "Hora de experimentar",
      title: "O que você aprendeu?",
      text: "Duas pequenas perguntas para consolidar sua primeira montagem.",
      tip: "Pode tentar quantas vezes precisar. Aprender também é testar ideias.",
      visible: all,
      wires: ["signal", "ground"],
      highlight: [],
      questions: [
        {
          id: "resistor",
          prompt: "Qual é a função do resistor de 220 Ω?",
          options: [
            "Aumentar o brilho sem limite",
            "Limitar a corrente no LED",
            "Armazenar o programa",
          ],
          correct: 1,
          explanation: "O resistor limita a corrente e protege o LED e o GPIO.",
        },
        {
          id: "polarity",
          prompt: "Onde conectamos o cátodo do LED?",
          options: [
            "Ao GND, pela linha 10",
            "Diretamente ao 3V3",
            "Ao GPIO 23, sem resistor",
          ],
          correct: 0,
          explanation:
            "O cátodo vai ao GND; o ânodo recebe o sinal através do resistor.",
        },
      ],
    },
  ],
});
