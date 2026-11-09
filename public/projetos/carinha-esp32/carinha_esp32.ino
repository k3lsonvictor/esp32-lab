// Adaptado do sketch_sep24a.ino fornecido para o ESP32 Lab.
#include <Adafruit_GFX.h>
#include <Adafruit_ST7735.h>
#include <SPI.h>
#include "angry.h"
#include "content.h"
#include "laugh.h"

#define TFT_CS 5
#define TFT_RST 4
#define TFT_DC 2
#define ANIM_X 0
#define ANIM_Y 48

const uint16_t WIDTH = 128;
const uint16_t HEIGHT = 64;
Adafruit_ST7735 tft(TFT_CS, TFT_DC, TFT_RST);
uint16_t frameBuffer[WIDTH * HEIGHT];

static_assert(ANGRY_WIDTH == WIDTH && ANGRY_HEIGHT == HEIGHT, "angry deve ser 128x64");
static_assert(CONTENT_WIDTH == WIDTH && CONTENT_HEIGHT == HEIGHT, "content deve ser 128x64");
static_assert(LAUGH_WIDTH == WIDTH && LAUGH_HEIGHT == HEIGHT, "laugh deve ser 128x64");

void prepararFrame(const uint8_t* frameData) {
  for (uint16_t y = 0; y < HEIGHT; y++) {
    for (uint16_t x = 0; x < WIDTH; x++) {
      uint16_t byteIndex = y * ((WIDTH + 7) / 8) + (x / 8);
      uint8_t bitIndex = 7 - (x % 8);
      uint8_t byteData = pgm_read_byte(&frameData[byteIndex]);
      bool ligado = byteData & (1 << bitIndex);
      frameBuffer[y * WIDTH + x] = ligado ? ST77XX_WHITE : ST77XX_BLACK;
    }
  }
}

void mostrarFrame(const uint8_t* frameData) {
  prepararFrame(frameData);
  tft.drawRGBBitmap(ANIM_X, ANIM_Y, frameBuffer, WIDTH, HEIGHT);
}

void tocarAnimacao(const uint8_t frames[][1024],
                   const uint16_t* tempos, uint8_t quantidade) {
  for (uint8_t frame = 0; frame < quantidade; frame++) {
    unsigned long inicio = millis();
    mostrarFrame(frames[frame]);
    unsigned long gasto = millis() - inicio;
    uint16_t tempo = tempos[frame];
    if (gasto < tempo) delay(tempo - gasto);
  }
}

void setup() {
  Serial.begin(115200);
  // ESP32 classico / VSPI. O display nao envia dados: MISO fica sem fio.
  SPI.begin(18, 19, 23, TFT_CS);
  tft.initR(INITR_BLACKTAB);
  tft.setRotation(0);
  // Comece com 16 MHz. A referencia original usa 40 MHz.
  tft.setSPISpeed(16000000);
  tft.fillScreen(ST77XX_BLACK);
}

void loop() {
  tocarAnimacao(content_frames, content_delays, CONTENT_FRAME_COUNT);
  delay(500);
  tocarAnimacao(laugh_frames, laugh_delays, LAUGH_FRAME_COUNT);
  delay(500);
  tocarAnimacao(angry_frames, angry_delays, ANGRY_FRAME_COUNT);
  delay(1000);
}
