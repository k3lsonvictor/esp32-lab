"use client";
import { useEffect, useMemo, useState, type ComponentProps } from "react";
import { useReducedMotion } from "motion/react";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";
import { CircuitCanvas } from "../circuit/CircuitCanvas";
import {
  bitmapPath,
  facePreviewSchema,
  faceFrameDelay,
  nextFaceFrame,
  type FacePreview,
  type FaceCursor,
} from "../../features/lessons/face-animation";

export function FaceCircuitDemo(scene: ComponentProps<typeof CircuitCanvas>) {
  const [preview, setPreview] = useState<FacePreview | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [cursor, setCursor] = useState<FaceCursor>({ animation: 0, frame: 0 });
  const reduced = useReducedMotion();
  useEffect(() => {
    const controller = new AbortController();
    fetch("/projetos/carinha-esp32/preview.json", { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error("Prévia indisponível");
        const parsed = facePreviewSchema.parse(await r.json());
        if (!controller.signal.aborted) {
          setPreview(parsed);
          setError(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [retry]);
  useEffect(() => {
    if (!preview || !playing || reduced) return;
    const timer = setTimeout(
      () => setCursor((c) => nextFaceFrame(preview, c)),
      faceFrameDelay(preview, cursor),
    );
    return () => clearTimeout(timer);
  }, [preview, playing, reduced, cursor]);
  const animation = preview?.animations[cursor.animation];
  const framePath = useMemo(
    () => (animation ? bitmapPath(animation.frames[cursor.frame]) : undefined),
    [animation, cursor.frame],
  );
  const select = (index: number) => {
    setPlaying(false);
    setCursor({ animation: index, frame: 0 });
  };
  return (
    <>
      <CircuitCanvas {...scene} displayFrame={framePath} />
      <div className="face-demo">
        <p className="eyebrow">AS CARINHAS DO SEU CÓDIGO</p>
        {!preview ? (
          <p role="status">
            {error
              ? "Não foi possível carregar os quadros."
              : "Carregando os quadros originais…"}{" "}
            {error && (
              <button
                className="secondary"
                onClick={() => {
                  setError(false);
                  setRetry((v) => v + 1);
                }}
              >
                Tentar novamente
              </button>
            )}
          </p>
        ) : (
          <>
            <div className="face-expressions" aria-label="Escolher expressão">
              {preview.animations.map((a, i) => (
                <button
                  key={a.id}
                  className="secondary"
                  aria-pressed={i === cursor.animation}
                  onClick={() => select(i)}
                >
                  {a.label}
                  <small>{a.frames.length} quadros</small>
                </button>
              ))}
            </div>
            <div className="face-controls">
              <button
                className="primary"
                disabled={!!reduced}
                onClick={() => setPlaying((v) => !v)}
              >
                {playing && !reduced ? <Pause size={15} /> : <Play size={15} />}{" "}
                {playing && !reduced ? "Pausar" : "Reproduzir sequência"}
              </button>
              <button
                className="secondary"
                onClick={() => {
                  setPlaying(false);
                  setCursor((c) => nextFaceFrame(preview, c));
                }}
              >
                <SkipForward size={15} /> Próximo quadro
              </button>
              <button className="text-button" onClick={() => select(0)}>
                <RotateCcw size={15} /> Reiniciar prévia
              </button>
            </div>
            <p className="face-caption">
              {animation?.label} · quadro {cursor.frame + 1}/
              {animation?.frames.length} · {animation?.delays[cursor.frame]} ms
              por quadro
            </p>
            <p>
              {reduced
                ? "Movimento reduzido ativo: avance manualmente pelos quadros. "
                : ""}
              Sequência original: contente → rindo → bravo, com pausas de 500,
              500 e 1000 ms. Prévia dos bitmaps fornecidos; nenhum firmware é
              executado.
            </p>
          </>
        )}
      </div>
    </>
  );
}
