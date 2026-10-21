# ESP32 Lab

MVP educacional local em português: Next.js App Router, React, TypeScript strict, Tailwind CSS, Motion, Zustand e Zod. Não precisa de conta, backend ou variáveis secretas.

## Executar

Requer Node.js 20.9+ e npm. No PowerShell com scripts bloqueados, use `npm.cmd` no lugar de `npm`.

```sh
npm install
npm run dev
```

Abra http://localhost:3000. A primeira aula fica em `/aprender/primeiro-led` e a segunda em `/aprender/led-com-botao`.

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

## Verificações e limites

16 testes automatizados cobrem o motor, validação de terminais, posicionamento das pernas, redes da protoboard, contatos do botão abertos e fechados, respostas, limites de navegação, persistência e reinício independente por aula. TypeScript, ESLint e build de produção foram executados. As rotas inicial e das aulas são verificadas com HTTP 200; IDs inexistentes retornam 404.

A revisão visual em navegador não foi realizada nesta sessão, pois não havia navegador conectado. O layout inclui breakpoints para celular e tablet, mas precisa dessa conferência visual em dispositivos reais.

O `npm audit` aponta cinco ocorrências de severidade alta na cadeia de desenvolvimento `eslint-config-next → fast-glob → micromatch → braces` (GHSA-vfj7-8cjw-p6xm). O registro consultado oferece `braces` 3.0.3 como última versão, ainda afetada. Não foi aplicado downgrade incompatível do ESLint do Next. Essas dependências não fazem parte do código servido ao aluno; a atualização da ferramenta permanece pendente.

## Acessibilidade e persistência

Layout responsivo, SVG vetorial, controles com teclado, indicadores de progresso, feedback textual, radios nativos e suporte a movimento reduzido. O progresso é carregado após a hidratação; armazenamento com formato inválido é ignorado. Copiar código requer a API Clipboard (localhost ou HTTPS); falhas são exibidas e o código permanece selecionável.
