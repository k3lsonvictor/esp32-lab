import { lessonSchema } from "../../features/lessons/schema";
import { buttonLesson } from "./button-led";
const all = buttonLesson.components.map((p) => p.id);
const complete = buttonLesson.connections.map((w) => w.id);
export const toggleLesson = lessonSchema.parse({
  id: "led-interruptor",
  projectNumber: 3,
  durationMinutes: 25,
  title: "Um clique para ligar, outro para desligar",
  difficulty: "Iniciante",
  description:
    "Transforme o botão em um interruptor: guarde o estado do LED, detecte um novo pressionamento e filtre as oscilações dos contatos.",
  completion: {
    title: "Seu circuito aprendeu a lembrar.",
    text: "Você distinguiu nível de entrada e evento, guardou o estado do LED e usou millis para confirmar um pressionamento estável. Agora cada clique tem uma única ação.",
  },
  components: buttonLesson.components,
  connections: buttonLesson.connections,
  steps: [
    {
      eyebrow: "A mesma bancada, uma nova ideia",
      title: "O botão pode soltar. A luz fica.",
      text: "Na aula anterior, soltar o botão apagava o LED. Agora o primeiro pressionamento liga a luz, soltar mantém a luz acesa e o próximo pressionamento a desliga.",
      tip: "Reutilize a montagem anterior: LED no GPIO 23 com resistor de 220 Ω; botão entre GPIO 22 e GND, com INPUT_PULLUP. Nenhum componente extra é necessário. Desconecte a alimentação antes de conferir ou mudar os fios.",
      visible: all,
      wires: complete,
      highlight: ["led", "button"],
      buttonDemo: "toggle",
    },
    {
      eyebrow: "Revise os caminhos",
      title: "A montagem não muda",
      text: "O GPIO 22 continua lendo HIGH com o botão solto e LOW quando pressionado. O LED ainda recebe o sinal pelo GPIO 23. Quem muda o comportamento é o programa.",
      tip: "Ânodo em e8, ligado ao resistor em c8; cátodo em e10, no GND. Botão: grupo A em e12/e14 e grupo B em f12/f14. GPIO 22 chega a a12; b10 leva GND a j12. Não aplique 5 V aos GPIOs.",
      visible: all,
      wires: complete,
      highlight: ["esp32"],
      pins: ["esp32.GPIO22", "esp32.GPIO23"],
    },
    {
      eyebrow: "Memória do programa",
      title: "Guarde se a luz está acesa",
      text: "Uma variável bool chamada ledOn guarda true ou false. A expressão ledOn = !ledOn inverte esse valor: ligado vira desligado e desligado vira ligado.",
      tip: "Essa variável fica fora de setup e loop para preservar seu valor entre as repetições de loop. É uma memória em RAM: reiniciar ou desligar o ESP32 apaga esse estado. O exemplo sempre começa com o LED apagado.",
      visible: all,
      wires: complete,
      highlight: ["led"],
      code: "bool ledOn = false;\n\n// Execute uma vez a cada novo pressionamento:\nledOn = !ledOn;",
    },
    {
      eyebrow: "Nível não é evento",
      title: "Um pressionamento, uma mudança",
      text: "Enquanto você segura o botão, loop roda muitas vezes. Alternar a luz a cada leitura LOW faria o LED mudar sem parar. Precisamos agir apenas na transição estável de HIGH para LOW.",
      tip: "Também guardamos o último estado confirmado do botão. Se ele já era LOW, manter pressionado não é um novo evento. Soltar atualiza esse estado para HIGH e prepara o próximo pressionamento, sem alternar o LED.",
      visible: all,
      wires: complete,
      highlight: ["button"],
      buttonDemo: "toggle",
    },
    {
      eyebrow: "Contatos de verdade",
      title: "Um clique pode parecer vários",
      text: "Ao tocar ou soltar, os contatos mecânicos podem oscilar rapidamente entre aberto e fechado. Esse efeito se chama bounce. Sem tratamento, um clique físico pode ser contado várias vezes.",
      tip: "O pull-up evita uma entrada flutuante, mas não elimina o bounce. Vamos aceitar uma mudança somente após 50 ms sem novas oscilações. Esse tempo é uma escolha didática; em um projeto real, ajuste ao comportamento do botão.",
      visible: all,
      wires: complete,
      highlight: ["button"],
      pins: ["button.a1", "button.b1"],
    },
    {
      eyebrow: "Debounce sem bloquear",
      title: "Confirme antes de decidir",
      text: "millis informa o tempo desde a inicialização. A cada mudança na leitura bruta, reiniciamos a contagem. Depois de 50 ms estáveis, atualizamos o estado confirmado e alternamos o LED somente se ele virou LOW.",
      tip: "Usar a diferença entre tempos permite continuar lendo a entrada, sem delay. Pressione, aguarde a confirmação e solte: a luz permanece. Aguarde a confirmação da soltura e pressione de novo para alternar. Um toque menor que 50 ms é ignorado.",
      visible: all,
      wires: complete,
      highlight: [],
      buttonDemo: "toggle",
    },
    {
      eyebrow: "O programa completo",
      title: "Leia, confirme e alterne",
      text: "lastReading guarda a leitura bruta; stableState guarda a leitura confirmada. lastChange marca a última oscilação. Apenas uma nova mudança confirmada para LOW executa ledOn = !ledOn.",
      tip: "Copie este programa completo para a IDE Arduino; os trechos anteriores são explicativos. unsigned long e a subtração entre tempos mantêm a comparação funcionando na virada de millis. A demonstração usa a mesma regra de 50 ms, sem executar o firmware.",
      visible: all,
      wires: complete,
      highlight: [],
      buttonDemo: "toggle",
      code: `const int LED_PIN = 23;
const int BUTTON_PIN = 22;
const unsigned long DEBOUNCE_MS = 50;

bool ledOn = false;
int lastReading = HIGH;
int stableState = HIGH;
unsigned long lastChange = 0;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
}

void loop() {
  int reading = digitalRead(BUTTON_PIN);
  unsigned long now = millis();

  if (reading != lastReading) {
    lastChange = now;
  }

  if (now - lastChange >= DEBOUNCE_MS &&
      reading != stableState) {
    stableState = reading;

    if (stableState == LOW) {
      ledOn = !ledOn;
      digitalWrite(LED_PIN, ledOn ? HIGH : LOW);
    }
  }

  lastReading = reading;
}`,
    },
    {
      eyebrow: "Desafio do terceiro projeto",
      title: "Um clique bem entendido",
      text: "Conecte as ideias de memória, transição e debounce. Você pode rever as etapas e testar quantas vezes quiser.",
      tip: "Se o LED alternar várias vezes com um clique no hardware, confira o debounce. Se não aceitar o próximo clique, verifique se a soltura chegou a ser confirmada. A luz só muda em um novo pressionamento estável.",
      visible: all,
      wires: complete,
      highlight: [],
      questions: [
        {
          id: "release",
          prompt: "O LED está aceso. O que acontece ao soltar o botão?",
          options: [
            "Apaga imediatamente",
            "Continua aceso até o próximo pressionamento confirmado",
            "Pisca continuamente",
          ],
          correct: 1,
          explanation:
            "A variável ledOn guarda o estado da luz. Soltar apenas prepara o próximo pressionamento.",
        },
        {
          id: "debounce",
          prompt: "Por que esperar 50 ms de leitura estável?",
          options: [
            "Para eliminar o resistor do LED",
            "Para aumentar a tensão do GPIO",
            "Para evitar contar as oscilações do contato como vários cliques",
          ],
          correct: 2,
          explanation:
            "O debounce confirma a mudança após um intervalo estável. Assim, o bounce não gera várias alternâncias.",
        },
      ],
    },
  ],
});
