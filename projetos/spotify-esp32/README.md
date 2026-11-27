# Spotify no ESP32

O ESP32 mostra faixa, artista, capa e progresso no TFT. Os botões controlam o Spotify no celular ou computador, onde o áudio continua tocando. O servidor local autoriza a conta e converte a capa para RGB565 de 52 × 52 pixels.

## Montagem

Use um ESP32 clássico, um ST7735 de 128 × 160, três botões momentâneos e jumpers. Faça as ligações com a placa desligada.

| Sinal | ESP32 | Destino |
| --- | --- | --- |
| Alimentação | 3V3 | TFT VCC |
| Terra | GND | TFT GND e um contato de cada botão |
| Clock SPI | GPIO 18 | TFT SCK ou SCL |
| Dados SPI | GPIO 23 | TFT MOSI, SDA ou DIN |
| Seleção | GPIO 5 | TFT CS |
| Reset | GPIO 4 | TFT RST ou RES |
| Dados/comando | GPIO 2 | TFT DC ou A0 |
| Anterior | GPIO 25 | Outro contato do botão anterior |
| Próxima | GPIO 26 | Outro contato do botão próxima |
| Play/pause | GPIO 27 | Outro contato do botão play/pause |

Use contatos de lados elétricos opostos de cada botão. O pull-up interno mantém a leitura em HIGH em repouso. Confira a ligação do backlight na identificação do seu módulo.

## Servidor local

1. No [Spotify Developer Dashboard](https://developer.spotify.com/dashboard), configure um app Web API com a URI de redirecionamento `http://127.0.0.1:3001/callback`. Use Spotify Premium para os controles e autorize a conta no app se necessário. Consulte as [regras do modo de desenvolvimento](https://developer.spotify.com/documentation/web-api/concepts/quota-modes) e as [regras da URI](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri).
2. Na pasta `servidor`, copie `config.example.json` para `config.json` e preencha o Client ID, o Client Secret e uma chave privada para o ESP32. Você pode gerar a chave com `node -p "require('node:crypto').randomBytes(24).toString('hex')"`.
3. Com Node.js 20.9 ou superior, execute `npm ci` e `npm start`. Deixe o servidor aberto.
4. No computador do servidor, abra `http://127.0.0.1:3001/login`, autorize o app e inicie uma faixa no Spotify.

Use o servidor na rede local de confiança. Se o firewall bloquear a conexão da placa, permita a porta TCP 3001 na rede privada. Mantenha `config.json`, `config.h` e os arquivos de tokens privados.

## Arduino IDE

1. Instale a plataforma esp32 da Espressif e selecione a placa e a porta. Para um ESP32 clássico genérico, use **ESP32 Dev Module**.
2. Instale ArduinoJson 7, Adafruit GFX Library e Adafruit ST7735 and ST7789 Library com suas dependências.
3. Em `ESP32_Spotify_Player`, copie `config.example.h` para `config.h`. Preencha o Wi-Fi, configure `SERVER_URL` com o IPv4 local do computador e porta 3001 e copie a mesma `deviceKey` do servidor para `DEVICE_KEY`.
4. Abra `ESP32_Spotify_Player.ino`, envie para a placa e acompanhe a conexão no Monitor Serial a 115200 baud. Teste os três botões com uma faixa ativa.

Se o Monitor Serial mostrar HTTP 401, confira se as chaves coincidem. Se a placa conectar ao Wi-Fi mas não alcançar o servidor, confira o IP, a porta e o firewall. Se o display permanecer em branco, confira a alimentação, o backlight, os fios SPI e a variante de inicialização do seu módulo.
