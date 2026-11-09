import { lessonSchema } from "../../features/lessons/schema";
import { faceSketch } from "../firmware/face-sketch";
const parts = ["esp32", "display"];
const power = ["power", "ground"];
const spi = [...power, "clock", "data"];
const complete = [...spi, "select", "reset", "command"];
export const faceLesson = lessonSchema.parse({
  id: "carinha-lcd",
  projectNumber: 4,
  special: true,
  durationMinutes: 35,
  difficulty: "Intermediário",
  title: "Dê uma carinha ao seu ESP32",
  description:
    "Projeto especial: monte seu LCD TFT ST7735S de 1,8″, 128×160, e dê vida às expressões contente, rindo e bravo usando os quadros do seu código.",
  completion: {
    title: "Sua bancada ganhou personalidade.",
    text: "Você conectou um LCD TFT por SPI, decodificou bitmaps de 1 bit em RGB565 e entendeu como os quadros e seus tempos criam uma expressão animada. O pacote está pronto para você experimentar no hardware.",
  },
  components: [
    { id: "esp32", kind: "esp32", x: 90, y: 90 },
    { id: "display", kind: "tft", x: 455, y: 75 },
  ],
  connections: [
    { id: "power", from: "esp32.3V3", to: "display.VCC", color: "#ca6751" },
    { id: "ground", from: "esp32.GND", to: "display.GND", color: "#334155" },
    { id: "clock", from: "esp32.GPIO18", to: "display.SCK", color: "#47958b" },
    { id: "data", from: "esp32.GPIO23", to: "display.MOSI", color: "#3b78db" },
    { id: "select", from: "esp32.GPIO5", to: "display.CS", color: "#a68138" },
    { id: "reset", from: "esp32.GPIO4", to: "display.RST", color: "#9c74b3" },
    { id: "command", from: "esp32.GPIO2", to: "display.DC", color: "#c47c37" },
  ],
  wiring: [
    { signal: "Alimentação*", board: "3V3", display: "VCC" },
    { signal: "Terra", board: "GND", display: "GND" },
    { signal: "Clock SPI", board: "GPIO 18", display: "SCK / SCL / CLK" },
    { signal: "Dados SPI", board: "GPIO 23", display: "SDA / DIN / MOSI" },
    { signal: "Seleção", board: "GPIO 5", display: "CS" },
    { signal: "Reset", board: "GPIO 4", display: "RES / RST" },
    { signal: "Dados/comando", board: "GPIO 2", display: "DC / A0" },
    {
      signal: "Backlight*",
      board: "Conforme módulo",
      display: "BL / LED / LITE",
    },
  ],
  downloads: [
    {
      title: "Baixar projeto completo (.zip)",
      href: "/projetos/carinha-esp32/carinha-esp32.zip",
      filename: "carinha-esp32.zip",
      description: "Sketch adaptado, 3 headers originais e instruções.",
    },
    {
      title: "carinha_esp32.ino",
      href: "/projetos/carinha-esp32/carinha_esp32.ino",
      filename: "carinha_esp32.ino",
      description: "Código completo da aula, adaptado da sua referência.",
    },
    ...["content", "laugh", "angry"].map((id) => ({
      title: `${id}.h`,
      href: `/projetos/carinha-esp32/${id}.h`,
      filename: `${id}.h`,
      description: "Arquivo original fornecido, preservado sem alterações.",
    })),
  ],
  steps: [
    {
      eyebrow: "Um projeto com personalidade",
      title: "Um ESP32, três expressões",
      text: "Vamos usar seu LCD TFT ST7735S de 1,8″, 128×160, SPI, informado como compatível com alimentação de 3,3 V/5 V. Os arquivos do seu código darão vida às carinhas contente, rindo e brava.",
      tip: "Separe o ESP32 clássico, cabo USB de dados, o módulo ST7735S e jumpers compatíveis com os conectores. A descrição 3,3 V/5 V informa a alimentação anunciada; ela não identifica o fabricante, a ordem dos pinos nem a ligação do backlight. Confira a serigrafia da sua placa.",
      visible: parts,
      wires: [],
      highlight: ["display"],
    },
    {
      eyebrow: "Primeiro, a alimentação",
      title: "Use 3,3 V nesta montagem",
      text: "Para o módulo informado como 3,3 V/5 V, esta montagem usa VCC no 3V3 e GND no GND do ESP32. Os sinais SPI também usam lógica de 3,3 V. Faça as ligações com o USB desconectado.",
      tip: "Compatibilidade de alimentação com 5 V não significa que os sinais do ESP32 possam receber 5 V. O backlight BL/LED/LITE depende do circuito da placa: se exigir ligação separada, siga a identificação ou o datasheet do módulo. Não alimente um LED de backlight cru por GPIO. A prévia presume a iluminação habilitada.",
      visible: parts,
      wires: power,
      highlight: ["display"],
      pins: ["esp32.3V3", "display.VCC", "display.GND"],
    },
    {
      eyebrow: "Dois fios levam os pixels",
      title: "Clock e dados pelo SPI",
      text: "Conecte GPIO 18 ao clock SCK e GPIO 23 à entrada MOSI do display. Em muitos módulos os mesmos sinais se chamam SCL e SDA, mas aqui são SPI, não o barramento I²C.",
      tip: "O sketch usa o SPI de hardware do ESP32 clássico. Nosso código explicita SPI.begin(18, 19, 23, TFT_CS). O GPIO 19 é o MISO padrão, mas fica sem fio: este projeto apenas envia pixels e não usa cartão SD.",
      visible: parts,
      wires: spi,
      highlight: ["display"],
      pins: ["esp32.GPIO18", "esp32.GPIO23", "display.SCK", "display.MOSI"],
      showWiring: true,
    },
    {
      eyebrow: "Controle do display",
      title: "Selecione, reinicie e desenhe",
      text: "Complete CS no GPIO 5, RST no GPIO 4 e DC no GPIO 2. CS seleciona o display; RST reinicia o controlador; DC distingue comandos de dados de pixels.",
      tip: "Mantivemos TFT_CS=5, TFT_RST=4 e TFT_DC=2 da referência. GPIO 2 e GPIO 5 são pinos de strapping no ESP32 clássico: o módulo não deve impor níveis incompatíveis durante o boot. Se a placa não iniciar, desconecte o display e revise seu circuito. Não reaproveite o LED anterior no GPIO 23.",
      visible: parts,
      wires: complete,
      highlight: ["esp32"],
      pins: ["esp32.GPIO5", "esp32.GPIO4", "esp32.GPIO2"],
      showWiring: true,
    },
    {
      eyebrow: "Prepare a IDE Arduino",
      title: "Uma pasta, quatro arquivos",
      text: "Baixe o ZIP disponível abaixo, extraia e abra carinha_esp32/carinha_esp32.ino. Mantenha angry.h, content.h e laugh.h na mesma pasta. Instale a plataforma esp32 de Espressif Systems e selecione ESP32 Dev Module e a porta da placa.",
      tip: "No Gerenciador de Bibliotecas, instale Adafruit GFX Library e Adafruit ST7735 and ST7789 Library, aceitando dependências como Adafruit BusIO. SPI.h acompanha a plataforma. Selecione a placa e porta reais; os pinos desta aula se referem ao ESP32 clássico, não ao C3/S3.",
      visible: parts,
      wires: complete,
      highlight: [],
    },
    {
      eyebrow: "As imagens do seu projeto",
      title: "226 quadros que cabem em bits",
      text: "content.h tem 76 quadros; laugh.h e angry.h têm 75 cada. Todos medem 128×64, usam 1 bit por pixel e guardam 1024 bytes por quadro. PROGMEM mantém os bitmaps na memória de programa.",
      tip: "A tela tem 128×160; 128×64 é o tamanho da animação. Com ANIM_X=0 e ANIM_Y=48, ela fica centralizada verticalmente. Cada linha ocupa 16 bytes e o bit 7 representa o pixel mais à esquerda do byte.",
      visible: parts,
      wires: complete,
      highlight: ["display"],
      faceDemo: true,
    },
    {
      eyebrow: "Dos bits às cores",
      title: "Prepare o quadro em RGB565",
      text: "prepararFrame lê cada byte com pgm_read_byte, testa o bit de cada pixel e escreve branco ou preto no frameBuffer. mostrarFrame envia o buffer inteiro com drawRGBBitmap, em vez de desenhar pixel por pixel no SPI.",
      tip: "RGB565 usa 16 bits (2 bytes) por pixel. O buffer de 128×64 ocupa 16.384 bytes de RAM, enquanto cada quadro original ocupa 1024 bytes em flash. O código adaptado verifica as dimensões com static_assert para evitar um header incompatível.",
      visible: parts,
      wires: complete,
      highlight: ["display"],
      faceDemo: true,
      code: faceSketch
        .slice(
          faceSketch.indexOf("void prepararFrame"),
          faceSketch.indexOf("void tocarAnimacao"),
        )
        .trim(),
    },
    {
      eyebrow: "Tempo também faz parte do desenho",
      title: "Reproduza a sequência original",
      text: "Os arquivos fornecidos usam 100 ms por quadro: 10 quadros por segundo como meta. O programa reproduz contente, espera 500 ms; rindo, espera 500 ms; bravo, espera 1000 ms e recomeça.",
      tip: "O tempo gasto desenhando é descontado do delay. Se o desenho levar mais que o tempo previsto, a animação ficará mais lenta. As pausas mantêm o último quadro. A prévia usa os mesmos dados e tempos; você pode pausar, escolher uma expressão ou avançar quadro a quadro.",
      visible: parts,
      wires: complete,
      highlight: [],
      faceDemo: true,
    },
    {
      eyebrow: "Código completo e primeiro teste",
      title: "Envie uma carinha para o hardware",
      text: "O código abaixo adapta sua referência: remove os sinais + inválidos do final, explicita o SPI e reúne a reprodução em uma função. Começamos em 16 MHz; o original configura 40 MHz. Compile na IDE e envie pela porta selecionada.",
      tip: "INITR_BLACKTAB e setRotation(0) seguem a referência. Confirme essa variante no seu módulo. Tela branca, cores trocadas ou imagem deslocada pedem revisão de alimentação, backlight, fios e inicialização; teste também o exemplo graphicstest da biblioteca. O firmware não foi compilado nem testado em hardware nesta sessão.",
      visible: parts,
      wires: complete,
      highlight: [],
      faceDemo: true,
      code: faceSketch,
    },
    {
      eyebrow: "Desafio especial",
      title: "Você deu vida aos pixels",
      text: "Confira o que diferencia a tela, os bitmaps e a comunicação antes de concluir. Os arquivos continuarão disponíveis depois da aula.",
      tip: "A próxima experiência pode mudar a ordem das expressões ou os tempos. Preserve as dimensões 128×64 e os três headers na pasta do sketch. A demonstração no navegador não executa firmware nem emula o SPI.",
      visible: parts,
      wires: complete,
      highlight: [],
      questions: [
        {
          id: "display-bus",
          prompt:
            "Neste projeto, SDA/DIN do display recebe dados por qual ligação?",
          options: [
            "I²C no GPIO 21",
            "SPI MOSI no GPIO 23",
            "Alimentação de 5 V",
          ],
          correct: 1,
          explanation:
            "No módulo desta aula, SDA/DIN é a entrada de dados SPI (MOSI), ligada ao GPIO 23.",
        },
        {
          id: "frame-size",
          prompt: "O que mede 128×64 neste projeto?",
          options: [
            "O bitmap de cada quadro, dentro da tela de 128×160",
            "A resolução total da tela configurada",
            "O tamanho do ESP32",
          ],
          correct: 0,
          explanation:
            "Os quadros são 128×64 e são desenhados em (0, 48) na tela de 128×160.",
        },
        {
          id: "frame-time",
          prompt: "Por que descontar o tempo de desenho do delay do quadro?",
          options: [
            "Para aumentar a tensão do display",
            "Para dispensar o GND",
            "Para aproximar o período total do tempo previsto no arquivo",
          ],
          correct: 2,
          explanation:
            "Desenho e espera somam o período do quadro. Descontar o desenho evita acrescentar esse custo ao tempo programado.",
        },
      ],
    },
  ],
});
