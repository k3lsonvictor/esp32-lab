"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Clock, Layers } from "lucide-react";
import { useLessonStore } from "../../features/lessons/store";
import type { Lesson } from "../../features/lessons/schema";
export function LessonCard({ lesson }: { lesson: Lesson }) {
  const [ready, setReady] = useState(false);
  const progress = useLessonStore((s) => s.progress[lesson.id]);
  useEffect(() => {
    void useLessonStore.persist?.rehydrate();
    queueMicrotask(() => setReady(true));
  }, []);
  return (
    <Link className="lesson-card" href={`/aprender/${lesson.id}`}>
      <div className="card-number">
        {String(lesson.projectNumber).padStart(2, "0")}{" "}
        <span>PROJETO GUIADO</span>
      </div>
      <div>
        <span className="badge">{lesson.difficulty}</span>
        <h2>{lesson.title}</h2>
        <p>{lesson.description}</p>
        <div className="card-meta">
          <span>
            <Clock size={15} /> {lesson.durationMinutes} minutos
          </span>
          <span>
            <Layers size={15} /> {lesson.steps.length} etapas
          </span>
        </div>
      </div>
      <div className="card-action">
        <span>
          {ready && progress
            ? progress.completed
              ? "Revisar aula"
              : "Continuar aprendendo"
            : "Começar a aprender"}
        </span>
        <ArrowUpRight size={23} />
      </div>
    </Link>
  );
}
