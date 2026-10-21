# ESP32 Lab

MVP educacional local em português: Next.js App Router, React, TypeScript strict, Tailwind CSS, Motion, Zustand e Zod. Não precisa de conta, backend ou variáveis secretas.

## Executar

Requer Node.js 20.9+ e npm. No PowerShell com scripts bloqueados, use `npm.cmd` no lugar de `npm`.

```sh
npm install
npm run dev
```

Abra http://localhost:3000. A primeira aula fica em `/aprender/primeiro-led`.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

## Organização

O PDF complementar “Projetos de eletrônica para iniciantes” está em `public/materiais/` e é associado à aula pelo campo opcional `materials`. O cartão permanece disponível durante a aula e após a conclusão, com abertura em nova aba e download. A nota distingue a fonte de 5 V / resistor de 330 Ω do PDF da montagem com GPIO de 3,3 V / resistor de 220 Ω da aula. Para adicionar outros PDFs, copie o arquivo para essa pasta e declare seus metadados na aula.

- `src/content/lessons`: aulas declarativas; exporte uma nova aula no catálogo `lessons` para disponibilizá-la sem criar páginas.
- `src/features/lessons`: schema Zod, motor puro e store persistente. O localStorage usa a chave versionada `esp32-lab-progress-v1`. Reiniciar remove o progresso somente da aula atual.
- `src/lib/circuit`: terminais locais, coordenadas globais, conectividade da protoboard e roteamento de fios.
- `src/components/circuit`: peças SVG e renderer que recebe apenas a cena visual.
- `src/components/lesson`: player, perguntas e código copiável.

## Montagem e referência técnica

Variante: **DOIT ESP32 DevKit V1 de 30 pinos**, vista de cima, antena no topo e micro-USB embaixo. Pinout consultado: [CIRCUITSTATE, revisão 0.1](https://komomidev.github.io/esp_iot_course/assets/pdf/ESP32-DevKit-V1-Pinout.pdf). GPIO 23 é o primeiro pino à direita, GND é o penúltimo. [Datasheet Espressif](https://documentation.espressif.com/esp32_datasheet_en.html).

Protoboard mini de 150 pontos, sem barramentos de alimentação: em cada linha, a–e estão conectados; f–j formam outro grupo. Não há conexão entre linhas nem através do canal central.

GPIO23 → jumper azul → a3/c3 → resistor 220 Ω → c8/e8 → ânodo do LED → cátodo e10/a10 → jumper escuro → GND. As pernas são desenhadas exatamente nos furos, e testes verificam essa coincidência e as redes internas. Faixas do resistor: vermelho/vermelho/marrom/dourado.

O LED pisca apenas como animação didática de dois segundos. Não há simulador elétrico, compilação, execução de firmware ou comunicação com hardware. Monte hardware com a alimentação desconectada.

## Verificações e limites

10 testes automatizados cobrem o motor, validação de terminais, posicionamento das pernas, redes da protoboard, respostas, limites de navegação, persistência e reinício. TypeScript, ESLint e build de produção foram executados. Rotas inicial e da aula respondem com 200; IDs inexistentes retornam 404.

A revisão visual em navegador não foi realizada nesta sessão, pois não havia navegador conectado. O layout inclui breakpoints para celular e tablet, mas precisa dessa conferência visual em dispositivos reais.

O `npm audit` aponta cinco ocorrências de severidade alta na cadeia de desenvolvimento `eslint-config-next → fast-glob → micromatch → braces` (GHSA-vfj7-8cjw-p6xm). O registro consultado oferece `braces` 3.0.3 como última versão, ainda afetada. Não foi aplicado downgrade incompatível do ESLint do Next. Essas dependências não fazem parte do código servido ao aluno; a atualização da ferramenta permanece pendente.

## Acessibilidade e persistência

Layout responsivo, SVG vetorial, controles com teclado, indicadores de progresso, feedback textual, radios nativos e suporte a movimento reduzido. O progresso é carregado após a hidratação; armazenamento com formato inválido é ignorado. Copiar código requer a API Clipboard (localhost ou HTTPS); falhas são exibidas e o código permanece selecionável.
