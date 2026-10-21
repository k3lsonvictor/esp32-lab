import { lessonSchema } from "../../features/lessons/schema";
import { blinkLesson } from "./blink-led";
const base = ["esp32", "breadboard", "resistor", "led"];
const all = [...base, "button"];
const ledWires = ["signal", "ground"];
const complete = [...ledWires, "button-input", "button-ground"];
export const buttonLesson = lessonSchema.parse({
  id: "led-com-botao",
  projectNumber: 2,
  durationMinutes: 20,
  title: "Controle o LED com um botão",
  difficulty: "Iniciante",
  description:
    "Seu circuito agora responde a você. Use um botão para ler uma entrada digital e acender o LED enquanto ele estiver pressionado.",
  completion: {
    title: "Um toque. Uma resposta.",
    text: "Você conectou uma entrada digital, entendeu o pull-up e usou a leitura do botão para controlar o LED. O circuito agora responde às suas ações.",
  },
  components: [
    ...blinkLesson.components,
    { id: "button", kind: "button", x: 525, y: 340 },
  ],
  connections: [
    ...blinkLesson.connections,
    {
      id: "button-input",
      from: "esp32.GPIO22",
      to: "breadboard.a12",
      color: "#c28b32",
    },
    {
      id: "button-ground",
      from: "breadboard.b10",
      to: "breadboard.j12",
      color: "#334155",
    },
  ],
  steps: [
    {
      eyebrow: "Da saída à entrada",
      title: "Agora é você quem dá o sinal",
      text: "No primeiro projeto, o LED piscava sozinho. Agora vamos manter o GPIO 23 como saída e usar o GPIO 22 como entrada para ler um botão.",
      tip: "Separe a mesma montagem do LED, um botão táctil de quatro terminais e mais dois jumpers. Monte com o USB desconectado. O LED continua com o resistor de 220 Ω.",
      visible: base,
      wires: ledWires,
      highlight: ["esp32"],
      pins: ["esp32.GPIO22", "esp32.GPIO23"],
    },
    {
      eyebrow: "Conheça o botão",
      title: "Quatro pernas, dois contatos",
      text: "Neste desenho, A1 e A2 estão sempre unidos; B1 e B2 também. Ao pressionar, o botão une o grupo A ao grupo B. Ao soltar, separa os grupos novamente.",
      tip: "As letras identificam os contatos desta ilustração, não uma marcação universal. Confira o datasheet ou a continuidade do seu botão sem alimentação. Dois terminais do mesmo grupo não detectam o clique.",
      visible: all,
      wires: ledWires,
      highlight: ["button"],
      pins: ["button.a1", "button.a2", "button.b1", "button.b2"],
    },
    {
      eyebrow: "Prepare a protoboard",
      title: "Um contato de cada lado do canal",
      text: "Coloque A1 em e12 e A2 em e14. Do outro lado do canal central, B1 fica em f12 e B2 em f14. Os grupos a–e e f–j são separados, mesmo na mesma linha.",
      tip: "A ilustração amplia o botão para mostrar os contatos. Confira a orientação do modelo físico: o par A deve ficar isolado do par B quando solto. As linhas 12 e 14 ficam abaixo do circuito do LED, que ocupa as linhas 3, 8 e 10.",
      visible: all,
      wires: ledWires,
      highlight: ["breadboard", "button"],
      pins: [
        "breadboard.e12",
        "breadboard.e14",
        "breadboard.f12",
        "breadboard.f14",
      ],
    },
    {
      eyebrow: "Leia um sinal",
      title: "Conecte o botão ao GPIO 22",
      text: "Leve um jumper do GPIO 22 até a12. A linha 12 do grupo a–e conecta esse fio ao contato A1, em e12.",
      tip: "Não use os pinos 3V3 ou VIN como entrada. Nesta montagem, GPIO 22 apenas lê o botão; GPIO 23 continua alimentando o LED através do resistor.",
      visible: all,
      wires: [...ledWires, "button-input"],
      highlight: ["button"],
      pins: ["esp32.GPIO22", "breadboard.a12", "button.a1"],
    },
    {
      eyebrow: "Complete a entrada",
      title: "O outro contato vai ao GND",
      text: "Ligue b10 a j12. A linha 10 já está no GND; j12 compartilha a linha com B1, em f12. Pressionar o botão agora cria o caminho GPIO 22 → A → B → GND.",
      tip: "Não há ligação direta permanente entre GPIO 22 e GND: o botão abre e fecha esse caminho. O resistor do LED permanece em série com o LED e não é o pull-up do botão.",
      visible: all,
      wires: complete,
      highlight: ["button"],
      pins: ["breadboard.b10", "breadboard.j12", "esp32.GND"],
    },
    {
      eyebrow: "Um sinal estável",
      title: "Solto é HIGH. Pressionado é LOW.",
      text: "INPUT_PULLUP ativa um resistor interno que mantém o GPIO 22 em HIGH enquanto o botão está solto. Ao pressionar, o contato leva a entrada ao GND e a leitura vira LOW.",
      tip: "O pull-up interno trabalha com a lógica de 3,3 V do ESP32; não conecte uma fonte de 5 V à entrada. Aqui, pressionar acende e soltar apaga: não é um interruptor que memoriza o clique.",
      visible: all,
      wires: complete,
      highlight: ["button"],
      pins: ["esp32.GPIO22"],
      buttonDemo: true,
    },
    {
      eyebrow: "Transforme leitura em ação",
      title: "Um botão, uma decisão",
      text: "pinMode configura INPUT_PULLUP. digitalRead lê o GPIO 22; a comparação com LOW identifica o botão pressionado. digitalWrite acende ou apaga o LED conforme essa leitura.",
      tip: "O programa acompanha o estado do botão, sem contar cliques. Contatos reais podem oscilar por alguns milissegundos (bounce); para alternar a luz a cada clique, seria necessário tratar essas oscilações. A demonstração abaixo é idealizada.",
      visible: all,
      wires: complete,
      highlight: [],
      buttonDemo: true,
      code: `const int LED_PIN = 23;
const int BUTTON_PIN = 22;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
}

void loop() {
  bool pressed = digitalRead(BUTTON_PIN) == LOW;
  digitalWrite(LED_PIN, pressed ? HIGH : LOW);
}`,
    },
    {
      eyebrow: "Desafio do segundo projeto",
      title: "Você entendeu o clique?",
      text: "Revise o pull-up e os contatos antes de concluir. Pode voltar às etapas anteriores e experimentar novamente.",
      tip: "Na montagem física, se o LED ficar sempre aceso, confira se usou dois grupos diferentes do botão. Se não responder, revise GPIO 22, GND e a configuração INPUT_PULLUP.",
      visible: all,
      wires: complete,
      highlight: [],
      questions: [
        {
          id: "pullup",
          prompt:
            "Com INPUT_PULLUP, o que digitalRead retorna ao pressionar o botão ligado ao GND?",
          options: [
            "HIGH, pois o botão fornece 5 V",
            "LOW, pois o contato conecta a entrada ao GND",
            "Sempre o mesmo valor",
          ],
          correct: 1,
          explanation:
            "O pull-up mantém HIGH em repouso; o botão pressionado conecta a entrada ao GND, produzindo LOW.",
        },
        {
          id: "contacts",
          prompt: "Quais contatos devemos usar para detectar o pressionamento?",
          options: [
            "A1 e A2, pois já estão unidos",
            "Apenas um terminal, sem GND",
            "Um contato do grupo A e outro do grupo B",
          ],
          correct: 2,
          explanation:
            "Os grupos A e B só se conectam ao pressionar. Dentro de cada grupo, os dois terminais já estão unidos.",
        },
      ],
    },
  ],
});
