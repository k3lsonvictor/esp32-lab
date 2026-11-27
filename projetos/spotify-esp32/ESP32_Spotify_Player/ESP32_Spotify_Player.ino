#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ST7735.h>
#include <SPI.h>

#include "config.h"

#define TFT_CS 5
#define TFT_RST 4
#define TFT_DC 2
#define BTN_ANTERIOR 25
#define BTN_PROXIMA 26
#define BTN_PLAY_PAUSE 27

Adafruit_ST7735 tft(TFT_CS, TFT_DC, TFT_RST);
const uint16_t FUNDO = ST77XX_BLACK;
const uint16_t TEXTO = ST77XX_WHITE;
const uint16_t CINZA = 0x8410;
const uint16_t VERDE = 0x05E9;

// Capa 52x52: 5408 bytes de RAM, RGB565 recebido pelo servidor.
const uint8_t CAPA_LADO = 52;
uint16_t capaPixels[CAPA_LADO * CAPA_LADO];
String capaAtualId = "";
bool capaCarregada = false;
uint32_t ultimaTentativaCapa = 0;

String titulo = "Aguardando Spotify";
String artista = "Conectando...";
uint32_t duracaoMs = 0;
uint32_t progressoBaseMs = 0;
uint32_t sincronizadoEm = 0;
uint32_t ultimoDesenhoProgresso = 0;
uint32_t ultimaConsulta = 0;
uint32_t ultimaTroca = 0;
bool tocando = false;
bool anteriorEstavaSolto = true;
bool proximaEstavaSolta = true;
bool playPauseEstavaSolto = true;

void textoLimitado(const String& texto, int16_t x, int16_t y, uint8_t tamanho,
                   uint16_t cor, uint8_t maxCaracteres) {
  tft.setTextColor(cor, FUNDO);
  tft.setTextSize(tamanho);
  tft.setCursor(x, y);
  for (uint8_t i = 0; i < maxCaracteres && i < texto.length(); i++) {
    tft.write((uint8_t)texto[i]);
  }
}

uint32_t progressoAtual() {
  uint32_t ms = progressoBaseMs;
  if (tocando && duracaoMs > 0) ms += millis() - sincronizadoEm;
  return duracaoMs > 0 ? min(ms, duracaoMs) : 0;
}

void desenharProgresso() {
  uint32_t decorrido = progressoAtual();
  tft.fillRect(10, 118, 108, 5, CINZA);
  uint16_t largura = duracaoMs > 0 ? (uint64_t)decorrido * 108 / duracaoMs : 0;
  if (largura) tft.fillRect(10, 118, largura, 5, VERDE);
  char tempo[12];
  snprintf(tempo, sizeof(tempo), "%lu:%02lu", (unsigned long)(decorrido / 60000),
           (unsigned long)((decorrido / 1000) % 60));
  tft.fillRect(10, 127, 108, 9, FUNDO);
  textoLimitado(tempo, 10, 127, 1, CINZA, 6);
  snprintf(tempo, sizeof(tempo), "%lu:%02lu", (unsigned long)(duracaoMs / 60000),
           (unsigned long)((duracaoMs / 1000) % 60));
  textoLimitado(tempo, 91, 127, 1, CINZA, 6);
}

void desenharIconePlayPause();

void desenharPlayer() {
  tft.fillScreen(FUNDO);
  textoLimitado("ESP32 SPOTIFY", 10, 8, 1, VERDE, 20);
  if (capaCarregada) {
    tft.drawRGBBitmap(38, 25, capaPixels, CAPA_LADO, CAPA_LADO);
  } else {
    // Disco de reserva quando a capa nao estiver disponivel.
    tft.fillRoundRect(38, 25, 52, 52, 8, VERDE);
    tft.fillCircle(64, 51, 15, FUNDO);
    tft.fillCircle(64, 51, 6, VERDE);
    tft.drawCircle(64, 51, 20, TEXTO);
  }
  textoLimitado(titulo, 10, 87, 1, TEXTO, 18);
  textoLimitado(artista, 10, 102, 1, CINZA, 18);
  desenharProgresso();
  tft.fillTriangle(28, 146, 37, 140, 37, 152, TEXTO);
  tft.drawFastVLine(25, 140, 12, TEXTO);
  tft.fillTriangle(100, 146, 91, 140, 91, 152, TEXTO);
  tft.drawFastVLine(103, 140, 12, TEXTO);
  desenharIconePlayPause();
}

void desenharIconePlayPause() {
  // Centro do rodape: triangulo quando pausado, duas barras quando tocando.
  tft.fillRect(55, 139, 18, 16, FUNDO);
  if (tocando) {
    tft.fillRect(58, 140, 4, 13, TEXTO);
    tft.fillRect(66, 140, 4, 13, TEXTO);
  } else {
    tft.fillTriangle(58, 140, 58, 153, 70, 146, TEXTO);
  }
}

bool chamarAPI(const char* caminho, const char* metodo = "GET", String* resposta = nullptr) {
  if (WiFi.status() != WL_CONNECTED) return false;
  HTTPClient http;
  http.setTimeout(3500);
  if (!http.begin(String(SERVER_URL) + caminho)) return false;
  http.addHeader("X-Device-Key", DEVICE_KEY);
  int status = 0;
  if (strcmp(metodo, "POST") == 0) {
    http.addHeader("Content-Type", "application/json");
    status = http.POST("{}");
  } else {
    status = http.GET();
  }
  if (status == 200 && resposta) *resposta = http.getString();
  if (status != 200) Serial.printf("Falha em %s: HTTP %d\n", caminho, status);
  http.end();
  return status == 200;
}

// Baixa a capa ja redimensionada pelo Node.js; nao usamos JPEG no ESP32.
bool baixarCapa(const String& albumId) {
  if (albumId.isEmpty() || WiFi.status() != WL_CONNECTED) return false;
  HTTPClient http;
  http.setTimeout(9000);
  String endereco = String(SERVER_URL) + "/api/cover?id=" + albumId;
  if (!http.begin(endereco)) return false;
  http.addHeader("X-Device-Key", DEVICE_KEY);
  int status = http.GET();
  const int esperado = CAPA_LADO * CAPA_LADO * 2;
  if (status != 200 || http.getSize() != esperado) {
    Serial.printf("Falha ao buscar capa: HTTP %d (bytes %d)\n", status, http.getSize());
    http.end();
    return false;
  }
  WiFiClient* stream = http.getStreamPtr();
  uint8_t* destino = reinterpret_cast<uint8_t*>(capaPixels);
  int recebidos = 0;
  uint32_t inicio = millis();
  while (recebidos < esperado && millis() - inicio < 9000) {
    int disponivel = stream->available();
    if (disponivel > 0) {
      int n = stream->readBytes(destino + recebidos, min(disponivel, esperado - recebidos));
      if (n > 0) recebidos += n;
    } else {
      delay(1);
    }
  }
  http.end();
  Serial.printf("Capa recebida: %d/%d bytes\n", recebidos, esperado);
  return recebidos == esperado;
}

void consultarSpotify() {
  String body;
  if (!chamarAPI("/api/current", "GET", &body)) return;
  JsonDocument json;
  DeserializationError erro = deserializeJson(json, body);
  if (erro) { Serial.println("Erro JSON"); return; }
  bool ativo = json["active"] | false;
  String novoTitulo = ativo ? String((const char*) (json["title"] | "Sem titulo")) : "Sem musica";
  String novoArtista = ativo ? String((const char*) (json["artist"] | "")) : "Abra o Spotify";
  String novaCapaId = ativo ? String((const char*) (json["coverId"] | "")) : "";
  bool mudouCapa = novaCapaId != capaAtualId;
  bool mudou = (novoTitulo != titulo || novoArtista != artista || mudouCapa);
  bool tocavaAntes = tocando;
  if (mudouCapa) {
    capaAtualId = novaCapaId;
    capaCarregada = false;
    ultimaTentativaCapa = millis() - 15000;
  }
  if (!capaAtualId.isEmpty() && !capaCarregada && millis() - ultimaTentativaCapa >= 15000) {
    ultimaTentativaCapa = millis();
    capaCarregada = baixarCapa(capaAtualId);
    if (capaCarregada) mudou = true;
  }
  titulo = novoTitulo;
  artista = novoArtista;
  tocando = json["playing"] | false;
  duracaoMs = json["duration"] | 0UL;
  progressoBaseMs = json["progress"] | 0UL;
  sincronizadoEm = millis();
  if (mudou) desenharPlayer();
  else if (tocavaAntes != tocando) desenharIconePlayPause();
  Serial.printf("Spotify: %s - %s (%s)\n", titulo.c_str(), artista.c_str(), tocando ? "tocando" : "pausado");
}

void controlarMusica(bool proxima) {
  if (chamarAPI(proxima ? "/api/next" : "/api/previous", "POST")) {
    Serial.println(proxima ? "Proxima faixa enviada" : "Faixa anterior enviada");
    // Pequena espera para o Spotify atualizar a faixa antes da consulta.
    ultimaConsulta = millis() - 4000;
  }
}

void alternarPlayPause() {
  String resposta;
  if (!chamarAPI("/api/toggle", "POST", &resposta)) return;
  JsonDocument json;
  if (deserializeJson(json, resposta)) return;
  bool novoEstado = json["playing"] | false;
  // Ajuste local imediato, sem esperar a proxima consulta do servidor.
  progressoBaseMs = progressoAtual();
  sincronizadoEm = millis();
  tocando = novoEstado;
  desenharIconePlayPause();
  ultimaConsulta = millis() - 5000;
  Serial.println(tocando ? "Play enviado" : "Pause enviado");
}

void lerBotoes() {
  bool anteriorSolto = digitalRead(BTN_ANTERIOR) == HIGH;
  bool proximaSolta = digitalRead(BTN_PROXIMA) == HIGH;
  bool playPauseSolto = digitalRead(BTN_PLAY_PAUSE) == HIGH;
  uint32_t agora = millis();
  if (anteriorEstavaSolto && !anteriorSolto && agora - ultimaTroca >= 220) {
    ultimaTroca = agora;
    controlarMusica(false);
  } else if (proximaEstavaSolta && !proximaSolta && agora - ultimaTroca >= 220) {
    ultimaTroca = agora;
    controlarMusica(true);
  } else if (playPauseEstavaSolto && !playPauseSolto && agora - ultimaTroca >= 220) {
    ultimaTroca = agora;
    alternarPlayPause();
  }
  anteriorEstavaSolto = anteriorSolto;
  proximaEstavaSolta = proximaSolta;
  playPauseEstavaSolto = playPauseSolto;
}

void setup() {
  Serial.begin(115200);
  pinMode(BTN_ANTERIOR, INPUT_PULLUP);
  pinMode(BTN_PROXIMA, INPUT_PULLUP);
  pinMode(BTN_PLAY_PAUSE, INPUT_PULLUP);
  SPI.begin(18, -1, 23, TFT_CS);
  tft.initR(INITR_BLACKTAB); // Use INITR_GREENTAB se foi esse que funcionou no teste!
  tft.setRotation(0);
  tft.setSPISpeed(4000000); // Baixa velocidade para confiabilidade
  desenharPlayer();
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_SENHA);
  Serial.print("Conectando Wi-Fi");
  unsigned long inicio = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - inicio < 15000) {
    delay(300);
    Serial.print('.');
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) Serial.println("ESP32 IP: " + WiFi.localIP().toString());
  else Serial.println("Wi-Fi indisponivel; tentando novamente no loop");
  ultimaConsulta = millis() - 5000;
}

void loop() {
  lerBotoes();
  uint32_t agora = millis();
  if (WiFi.status() != WL_CONNECTED) {
    static uint32_t ultimaTentativa = 0;
    if (agora - ultimaTentativa >= 10000) {
      ultimaTentativa = agora;
      WiFi.reconnect();
    }
  } else if (agora - ultimaConsulta >= 5000) {
    ultimaConsulta = agora;
    consultarSpotify();
  }
  if (agora - ultimoDesenhoProgresso >= 500) {
    ultimoDesenhoProgresso = agora;
    desenharProgresso();
  }
}
