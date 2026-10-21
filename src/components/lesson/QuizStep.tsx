"use client";
import type { Lesson } from "../../features/lessons/schema";
export function QuizStep({
  questions,
  answers,
  onAnswer,
}: {
  questions: NonNullable<Lesson["steps"][number]["questions"]>;
  answers: Record<string, number>;
  onAnswer: (id: string, value: number) => void;
}) {
  return (
    <div className="quiz">
      {questions.map((q, i) => (
        <fieldset key={q.id}>
          <legend>
            {i + 1}. {q.prompt}
          </legend>
          {q.options.map((option, n) => (
            <label
              key={option}
              className={answers[q.id] === n ? "selected" : ""}
            >
              <input
                type="radio"
                name={q.id}
                checked={answers[q.id] === n}
                onChange={() => onAnswer(q.id, n)}
              />
              {option}
            </label>
          ))}
          {answers[q.id] !== undefined && (
            <p
              role="status"
              className={answers[q.id] === q.correct ? "correct" : "incorrect"}
            >
              {answers[q.id] === q.correct
                ? `Isso mesmo! ${q.explanation}`
                : "Ainda não. Reveja o caminho da corrente e tente de novo."}
            </p>
          )}
        </fieldset>
      ))}
    </div>
  );
}
