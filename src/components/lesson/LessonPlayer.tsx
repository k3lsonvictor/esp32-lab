"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Lightbulb,
  Check,
  PartyPopper,
  ChevronLeft,
} from "lucide-react";
import type { Lesson } from "../../features/lessons/schema";
import { useLessonStore } from "../../features/lessons/store";
import {
  canComplete,
  clampStep,
  sceneFor,
} from "../../features/lessons/engine";
import { CircuitDemo } from "./CircuitDemo";
import { lessons } from "../../content/lessons";
import { CodeViewer } from "./CodeViewer";
import { QuizStep } from "./QuizStep";
import { SupplementaryMaterials } from "./SupplementaryMaterials";
export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const store = useLessonStore();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void useLessonStore.persist?.rehydrate();
    queueMicrotask(() => setReady(true));
  }, []);
  const progress = ready ? store.progress[lesson.id] : undefined;
  const index = clampStep(lesson, progress?.step ?? 0);
  const { step, parts, connections } = sceneFor(lesson, index);
  const completed = progress?.completed ?? false;
  const nextLesson = lessons.find(
    (l) => l.projectNumber > lesson.projectNumber,
  );
  const percent = completed
    ? 100
    : Math.round((index / lesson.steps.length) * 100);
  return (
    <>
      <header className="lesson-header">
        <Link href="/" className="back-link">
          <ChevronLeft size={18} /> Todas as aulas
        </Link>
        <Link href="/" className="brand">
          esp32<span>lab</span>
          <i />
        </Link>
        <button className="text-button" onClick={() => store.reset(lesson.id)}>
          <RotateCcw size={15} /> Reiniciar
        </button>
      </header>
      <main className="lesson-shell">
        <div className="lesson-heading">
          <div>
            <p className="eyebrow">
              TRILHA ESSENCIAL · PROJETO{" "}
              {String(lesson.projectNumber).padStart(2, "0")}
            </p>
            <h1>{lesson.title}</h1>
          </div>
          <span className="badge">
            {lesson.difficulty} · {lesson.durationMinutes} min
          </span>
        </div>
        <div className="progress-row">
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Progresso da aula"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div style={{ width: `${percent}%` }} />
          </div>
          <span>{percent}% concluído</span>
        </div>
        {completed ? (
          <section className="completion">
            <div className="success-icon">
              <PartyPopper size={40} />
            </div>
            <p className="eyebrow">
              PROJETO {String(lesson.projectNumber).padStart(2, "0")} CONCLUÍDO
            </p>
            <h2>
              {lesson.completion?.title ??
                "Uma pequena luz. Uma grande conquista."}
            </h2>
            <p>
              {lesson.completion?.text ??
                "Você conhece os componentes, montou o caminho da corrente e entendeu o código do seu primeiro LED."}
            </p>
            <button className="primary" onClick={() => store.reset(lesson.id)}>
              Refazer a experiência <RotateCcw size={17} />
            </button>
            {nextLesson && (
              <Link className="primary" href={`/aprender/${nextLesson.id}`}>
                Próximo projeto <ArrowRight size={17} />
              </Link>
            )}
            <Link href="/">Voltar ao início</Link>
          </section>
        ) : (
          <>
            <div className="learning-grid">
              <section className="workspace" aria-label="Montagem do circuito">
                <div className="workspace-top">
                  <span>
                    <span className="live-dot" /> Sua bancada
                  </span>
                  <span>VISTA SUPERIOR · SVG</span>
                </div>
                <CircuitDemo
                  key={`${lesson.id}-${index}`}
                  interactive={step.buttonDemo}
                  parts={parts}
                  connections={connections}
                  highlight={step.highlight}
                  pins={step.pins}
                  blink={step.blink}
                />
                <div className="workspace-bottom">
                  <span>
                    <i className="legend-dot blue" /> Sinal GPIO
                  </span>
                  <span>
                    <i className="legend-dot dark" /> Terra (GND)
                  </span>
                  <span>
                    {step.blink
                      ? "Animação didática · 1 s ligado / 1 s desligado"
                      : step.buttonDemo
                        ? "Demonstração interativa · sem firmware"
                        : "Explore, conecte, aprenda."}
                  </span>
                </div>
              </section>
              <aside className="instructions" aria-live="polite">
                <p className="eyebrow">
                  ETAPA {String(index + 1).padStart(2, "0")} /{" "}
                  {String(lesson.steps.length).padStart(2, "0")}
                </p>
                <span className="step-tag">{step.eyebrow}</span>
                <h2>{step.title}</h2>
                <p className="step-text">{step.text}</p>
                {step.code && <CodeViewer code={step.code} />}
                {step.questions && (
                  <QuizStep
                    questions={step.questions}
                    answers={progress?.answers ?? {}}
                    onAnswer={(id, n) => store.answer(lesson, id, n)}
                  />
                )}
                <div className="tip">
                  <Lightbulb size={20} />
                  <div>
                    <strong>Vale saber</strong>
                    <p>{step.tip}</p>
                  </div>
                </div>
              </aside>
            </div>
            <nav className="step-navigation" aria-label="Navegação da aula">
              <button
                className="secondary"
                disabled={index === 0}
                onClick={() => store.move(lesson, -1)}
              >
                <ArrowLeft size={17} /> Anterior
              </button>
              <div className="step-dots">
                {lesson.steps.map((s, i) => (
                  <span
                    key={s.title}
                    title={s.title}
                    className={
                      i === index ? "current" : i < index ? "done" : ""
                    }
                  >
                    {i < index ? <Check size={12} /> : i + 1}
                  </span>
                ))}
              </div>
              {index < lesson.steps.length - 1 ? (
                <button
                  className="primary"
                  onClick={() => store.move(lesson, 1)}
                >
                  Próxima etapa <ArrowRight size={17} />
                </button>
              ) : (
                <button
                  className="primary"
                  disabled={!canComplete(lesson, progress?.answers ?? {})}
                  onClick={() => store.finish(lesson)}
                >
                  Concluir aula <Check size={17} />
                </button>
              )}
            </nav>
            <p className="lesson-footnote">
              Um passo de cada vez. É assim que boas ideias ganham vida.
            </p>
          </>
        )}
        <SupplementaryMaterials materials={lesson.materials} />
      </main>
    </>
  );
}
