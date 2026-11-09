# ESP32 Lab

MVP educacional local em português: Next.js App Router, React, TypeScript strict, Tailwind CSS, Motion, Zustand e Zod. Não precisa de conta, backend ou variáveis secretas.

## Executar

Requer Node.js 20.9+ e npm. No PowerShell com scripts bloqueados, use `npm.cmd` no lugar de `npm`.

```sh
npm install
npm run dev
```

Abra http://localhost:3000. Aulas: `/aprender/primeiro-led`, `/aprender/led-com-botao`, `/aprender/led-interruptor` e o projeto especial `/aprender/carinha-lcd`.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

## Organização

O PDF complementar “Projetos de eletrônica para iniciantes” está em `public/materiais/` e é associado à aula pelo campo opcional `materials`. O cartão permanece disponível durante a aula e após a conclusão, com abertura em nova aba e download. A nota distingue a fonte de 5 V / resistor de 330 Ω do PDF da montagem com GPIO de 3,3 V / resistor de 220 Ω da aula. Para adicionar outros PDFs, copie o arquivo para essa pasta e declare seus metadados na aula.

- `src/content/lessons`: aulas declarativas; exporte uma nova aula no catálogo `index.ts` para disponibilizá-la sem criar páginas. Número, duração e mensagem de conclusão vêm dos dados da aula.
- `src/features/lessons`: schema Zod, motor puro e store persistente. O localStorage usa a chave versionada `esp32-lab-progress-v1`. Reiniciar remove o progresso somente da aula atual.
- `src/lib/circuit`: terminais locais, coordenadas globais, conectividade da protoboard e roteamento de fios.
- `src/components/circuit`: peças SVG e renderer que recebe apenas a cena visual.
- `src/components/lesson`: player, perguntas e código copiável.

## Montagem e referência técnica

Variante: **DOIT ESP32 DevKit V1 de 30 pinos**, vista de cima, antena no topo e micro-USB embaixo. Pinout consultado: [CIRCUITSTATE, revisão 0.1](https://komomidev.github.io/esp_iot_course/assets/pdf/ESP32-DevKit-V1-Pinout.pdf). GPIO 23 é o primeiro pino à direita, GND é o penúltimo. [Datasheet Espressif](https://documentation.espressif.com/esp32_datasheet_en.html).

Protoboard mini de 150 pontos, sem barramentos de alimentação: em cada linha, a–e estão conectados; f–j formam outro grupo. Não há conexão entre linhas nem através do canal central.

GPIO23 → jumper azul → a3/c3 → resistor 220 Ω → c8/e8 → ânodo do LED → cátodo e10/a10 → jumper escuro → GND. As pernas são desenhadas exatamente nos furos, e testes verificam essa coincidência e as redes internas. Faixas do resistor: vermelho/vermelho/marrom/dourado.

O LED pisca apenas como animação didática de dois segundos. Não há simulador elétrico, compilação, execução de firmware ou comunicação com hardware. Monte hardware com a alimentação desconectada.

## Projeto 02 — Controle o LED com um botão

Oito etapas apresentam um botão momentâneo de quatro terminais, entrada digital, `INPUT_PULLUP`, leitura com `digitalRead` e saída com `digitalWrite`. O LED acende enquanto o botão está pressionado; soltar apaga a luz. Não há alternância memorizada por clique. A conclusão da primeira aula oferece acesso direto à segunda, que também pode ser aberta pelo catálogo.

A montagem do LED permanece igual à primeira aula. Acrescente GPIO 22 → a12/e12 (A1) e b10 (GND existente) → j12/f12 (B1). O botão cruza o canal: A1=e12, A2=e14, B1=f12, B2=f14. A1/A2 formam um contato permanente, B1/B2 outro; pressionar une A e B. A ilustração é ampliada para legibilidade; letras e orientação não são universais. Confira o modelo físico pelo datasheet ou continuidade antes de montar. Não conecte 5 V ao GPIO.

O pull-up interno mantém HIGH em repouso; o contato fechado leva o GPIO ao GND e a leitura fica LOW. Referências: [GPIO Arduino-ESP32 — Espressif](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/gpio.html) e [botões tácteis B3F — diagrama de contatos Omron](https://components.omron.com/sites/default/files/datasheet_pdf/A070-E1.pdf).

Nas etapas 6 e 7, um controle acessível alterna a demonstração entre pressionado e solto, mostra a leitura e altera o LED. Ao mudar de etapa, a demonstração volta ao repouso. Nenhum firmware é executado. O exemplo acompanha o nível do botão e não conta cliques; para aplicações que contam ou alternam por clique, trate o bounce dos contatos. Progresso e respostas ficam salvos separadamente para cada aula.

## Projeto 03 — Um clique para ligar, outro para desligar

Oito etapas reutilizam a montagem da segunda aula para ensinar memória em uma variável `bool`, detecção da transição HIGH → LOW e debounce com `millis()`. O LED começa apagado, alterna uma vez por novo pressionamento estável e mantém o estado ao soltar. A variável está em RAM; reiniciar o ESP32 volta ao estado inicial.

O código completo da etapa 7 aceita uma mudança apenas após 50 ms de leitura estável, sem `delay`. A soltura também deve estabilizar para preparar outro pressionamento. O intervalo é didático e deve ser ajustado ao botão real. A comparação usa subtração entre tempos `unsigned long`, adequada à virada de `millis()`. Referência: [Debounce — Arduino](https://docs.arduino.cc/built-in-examples/digital/Debounce/).

O campo `buttonDemo` aceita `true` para acompanhamento momentâneo ou `"toggle"` para alternância com debounce. O modelo puro em `features/lessons/button-demo.ts` é usado pela demonstração e pelos testes; não executa firmware. As etapas 1, 4, 6 e 7 oferecem a interação, com indicação do nível lido, estado da luz e quantidade de pressionamentos confirmados. Trocar de etapa ou reiniciar a lição limpa a demonstração. Código e perguntas ficam na mesma estrutura declarativa das outras aulas.

## Projeto especial — Dê uma carinha ao seu ESP32

Dez etapas usam os arquivos `sketch_sep24a.ino`, `content.h`, `laugh.h` e `angry.h` fornecidos como referência. O controlador indicado é **ST7735, LCD TFT SPI**, com tela configurada em 128×160 na rotação 0. Os desenhos são bitmaps de **128×64**, exibidos em (0, 48). Há 76 quadros em content, 75 em laugh e 75 em angry; todos têm duração prevista de 100 ms. As pausas após cada expressão são de 500, 500 e 1000 ms, totalizando um ciclo ideal de 24,6 s.

O renderer inclui um módulo TFT SVG com terminais identificados. As sete ligações aparecem em etapas: 3V3→VCC, GND→GND, GPIO18→SCK, GPIO23→MOSI/SDA, GPIO5→CS, GPIO4→RST e GPIO2→DC. O MISO não é usado. GPIO2 e GPIO5 são pinos de strapping no ESP32 clássico; confirme que o módulo não impõe níveis de boot incompatíveis. Referências: [SPI do Arduino-ESP32](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/spi.html), [construtor ST7735 da Adafruit](https://github.com/adafruit/Adafruit-ST7735-Library/blob/master/Adafruit_ST7735.cpp) e [pinagem do breakout Adafruit](https://learn.adafruit.com/1-8-tft-display/breakout-pinouts).

**Módulo informado pelo usuário:** LCD TFT ST7735S de 1,8″, 128×160, SPI, anunciado para alimentação de 3,3 V/5 V. A aula usa a opção de alimentação em 3,3 V e mantém a lógica SPI em 3,3 V. Compatibilidade de alimentação com 5 V não implica tolerância dos GPIOs do ESP32 a 5 V. A descrição comercial ainda não identifica fabricante, ordem física dos pinos ou circuito de backlight. A ligação BL/LED/LITE permanece dependente da placa, sem um jumper genérico; a prévia pressupõe iluminação habilitada. INITR_BLACKTAB segue o sketch fornecido e deve corresponder à variante real, não à cor da placa.

Os headers em `public/projetos/carinha-esp32/` são cópias idênticas aos originais. O sketch adaptado remove a sequência de `+` inválidos encontrada no final do original, explicita `SPI.begin`, começa em 16 MHz (a referência usa 40 MHz), verifica dimensões com `static_assert` e reúne as três rotinas de reprodução numa função. O código exibido é o mesmo arquivo `.ino` oferecido para download. O ZIP contém a pasta `carinha_esp32` com o sketch, três headers e instruções de bibliotecas/placa/montagem. Nenhum original fora do repositório foi modificado.

`npm run assets:face` regenera `preview.json`, o módulo TypeScript do sketch e o ZIP a partir desses arquivos locais, sem serviços ou dependências extras. A prévia carrega os bitmaps sob demanda; o bundle inicial não inclui os 226 quadros. O browser decodifica os mesmos bits (MSB primeiro), mostra branco/preto e respeita tempos, sequência e pausas. A reprodução começa pausada; movimento reduzido usa avanço manual. Os controles permitem selecionar expressão, pausar, avançar e reiniciar, sem execução de firmware.

O hardware precisa da plataforma ESP32 da Espressif, Adafruit GFX Library, Adafruit ST7735 and ST7789 Library e suas dependências, instaladas pela IDE Arduino. O firmware não foi compilado com a toolchain Arduino nem testado em hardware nesta sessão. O SVG do display e os primeiros quadros das três expressões foram renderizados e inspecionados visualmente.

## Verificações e limites

35 testes automatizados cobrem o motor, validação de terminais, posicionamento das pernas, redes da protoboard, contatos do botão abertos e fechados, debounce, bitmaps originais, ordem e tempo dos quadros, ZIP/downloads, respostas, limites de navegação, persistência e reinício independente por aula. TypeScript, ESLint e build de produção foram executados. As rotas inicial e das aulas são verificadas com HTTP 200; IDs inexistentes retornam 404.

A revisão visual em navegador não foi realizada nesta sessão, pois não havia navegador conectado. O layout inclui breakpoints para celular e tablet, mas precisa dessa conferência visual em dispositivos reais.

O `npm audit` aponta cinco ocorrências de severidade alta na cadeia de desenvolvimento `eslint-config-next → fast-glob → micromatch → braces` (GHSA-vfj7-8cjw-p6xm). O registro consultado oferece `braces` 3.0.3 como última versão, ainda afetada. Não foi aplicado downgrade incompatível do ESLint do Next. Essas dependências não fazem parte do código servido ao aluno; a atualização da ferramenta permanece pendente.

## Acessibilidade e persistência

Layout responsivo, SVG vetorial, controles com teclado, indicadores de progresso, feedback textual, radios nativos e suporte a movimento reduzido. O progresso é carregado após a hidratação; armazenamento com formato inválido é ignorado. Copiar código requer a API Clipboard (localhost ou HTTPS); falhas são exibidas e o código permanece selecionável.
